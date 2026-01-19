from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File as FastAPIFile, Form
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import gspread
from google.oauth2.service_account import Credentials
import asyncio
from functools import wraps
from googleapiclient.http import MediaIoBaseUpload
import io


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Google Sheets Configuration with Service Account
GOOGLE_SHEET_ID = os.getenv('GOOGLE_SHEET_ID', '1UtT9t2LZ5NEc-wbGv44mDeDjWLxOLBQHA5yy6jiLc7E')
SERVICE_ACCOUNT_FILE = os.getenv('SERVICE_ACCOUNT_FILE', 'service_account.json')
SHEET_NAME_SUPPLY = 'supply'
SHEET_NAME_CONTACT = 'contact'
SHEET_NAME_EVENT = 'event'

# Initialize Google Sheets client with service account
SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.readonly'
]

def get_gspread_client():
    """Initialize and return gspread client with service account credentials"""
    creds = Credentials.from_service_account_file(
        ROOT_DIR / SERVICE_ACCOUNT_FILE,
        scopes=SCOPES
    )
    return gspread.authorize(creds)

# Initialize the client
gc = get_gspread_client()

# Google Drive Configuration
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

DRIVE_FOLDER_ID = os.getenv('DRIVE_FOLDER_ID', '15_xiFeXu_vdIe2CYrjGaRCAho2OqhGvo')
PHOTOS_FOLDER_ID = os.getenv('PHOTOS_FOLDER_ID', '15_xiFeXu_vdIe2CYrjGaRCAho2OqhGvo')  # Photo documentation root folder

# Document MIME types to filter
DOCUMENT_MIME_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',  # DOCX
    'application/msword',  # DOC
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',  # XLSX
    'application/vnd.ms-excel',  # XLS
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',  # PPTX
    'application/vnd.ms-powerpoint',  # PPT
    'text/plain',  # TXT
    'application/vnd.google-apps.document',  # Google Docs
    'application/vnd.google-apps.spreadsheet',  # Google Sheets
    'application/vnd.google-apps.presentation',  # Google Slides
]

# Image/Photo MIME types to filter
IMAGE_MIME_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/webp',
    'image/svg+xml',
    'image/tiff',
    'image/heic',
    'image/heif',
]

def get_drive_service():
    """Initialize and return Google Drive service"""
    creds = Credentials.from_service_account_file(
        ROOT_DIR / SERVICE_ACCOUNT_FILE,
        scopes=SCOPES
    )
    return build('drive', 'v3', credentials=creds)

def async_wrap(func):
    """Decorator to run sync functions in async context"""
    @wraps(func)
    async def run(*args, **kwargs):
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, lambda: func(*args, **kwargs))
    return run

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Google Sheets Models - Supply
class SupplyItem(BaseModel):
    itemName: str
    category: str
    quantity: str
    unit: str
    location: str
    status: Optional[str] = "active"

class SupplyItemUpdate(BaseModel):
    row_index: int
    itemName: str
    category: str
    quantity: str
    unit: str
    location: str
    status: Optional[str] = "active"

# Contact Models
class ContactItem(BaseModel):
    name: str
    position: str
    department: str
    phone: str
    email: Optional[str] = "N/A"

# Event Models
class EventItem(BaseModel):
    eventTask: str
    date: str
    time: str
    location: str
    status: Optional[str] = "Upcoming"

# Google Sheets Helper Functions
async def get_sheet_data(sheet_name: str):
    """Fetch all data from Google Sheet using service account"""
    try:
        spreadsheet = await async_wrap(lambda: gc.open_by_key(GOOGLE_SHEET_ID))()
        worksheet = await async_wrap(lambda: spreadsheet.worksheet(sheet_name))()
        values = await async_wrap(worksheet.get_all_values)()
        return values
    except Exception as e:
        logging.error(f"Error fetching sheet data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch data from Google Sheets: {str(e)}")

async def append_row_to_sheet(sheet_name: str, values: list):
    """Append a new row to Google Sheet using service account"""
    try:
        spreadsheet = await async_wrap(lambda: gc.open_by_key(GOOGLE_SHEET_ID))()
        worksheet = await async_wrap(lambda: spreadsheet.worksheet(sheet_name))()
        result = await async_wrap(lambda: worksheet.append_row(values))()
        return {"success": True, "updated_range": result}
    except Exception as e:
        logging.error(f"Error appending row: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to add item to Google Sheets: {str(e)}")

async def update_row_in_sheet(sheet_name: str, row_index: int, values: list, num_columns: int = 6):
    """Update a specific row in Google Sheet using service account"""
    try:
        spreadsheet = await async_wrap(lambda: gc.open_by_key(GOOGLE_SHEET_ID))()
        worksheet = await async_wrap(lambda: spreadsheet.worksheet(sheet_name))()
        
        # Calculate the range (A1 notation)
        end_col = chr(64 + num_columns)  # Convert column count to letter (A=1, B=2, etc.)
        range_notation = f"A{row_index}:{end_col}{row_index}"
        
        result = await async_wrap(lambda: worksheet.update(range_notation, [values]))()
        return {"success": True, "updated_range": result}
    except Exception as e:
        logging.error(f"Error updating row: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update item in Google Sheets: {str(e)}")

async def delete_row_from_sheet(sheet_name: str, row_index: int, num_columns: int = 6):
    """Delete a specific row from Google Sheet by clearing its content"""
    try:
        spreadsheet = await async_wrap(lambda: gc.open_by_key(GOOGLE_SHEET_ID))()
        worksheet = await async_wrap(lambda: spreadsheet.worksheet(sheet_name))()
        
        # Clear the row content
        end_col = chr(64 + num_columns)  # Convert column count to letter
        range_notation = f"A{row_index}:{end_col}{row_index}"
        
        result = await async_wrap(lambda: worksheet.batch_clear([range_notation]))()
        return {"success": True, "cleared_range": result}
    except Exception as e:
        logging.error(f"Error deleting row: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete item from Google Sheets: {str(e)}")

# ===== SUPPLY INVENTORY API ROUTES =====
@api_router.get("/supply/items")
async def get_supply_items():
    """Get all supply items from Google Sheets"""
    try:
        data = await get_sheet_data(SHEET_NAME_SUPPLY)
        if len(data) <= 1:
            return []
        
        # Skip header row and map to objects
        items = []
        for i, row in enumerate(data[1:], start=2):  # start=2 because row 1 is header
            if len(row) >= 5 and row[0]:  # Must have at least item name
                items.append({
                    "row_index": i,
                    "itemName": row[0] if len(row) > 0 else "",
                    "category": row[1] if len(row) > 1 else "",
                    "quantity": row[2] if len(row) > 2 else "0",
                    "unit": row[3] if len(row) > 3 else "",
                    "location": row[4] if len(row) > 4 else "",
                    "status": row[5] if len(row) > 5 else "active"
                })
        return items
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/supply/items")
async def create_supply_item(item: SupplyItem):
    """Add a new supply item to Google Sheets"""
    try:
        values = [
            item.itemName,
            item.category,
            item.quantity,
            item.unit,
            item.location,
            item.status or "active"
        ]
        result = await append_row_to_sheet(SHEET_NAME_SUPPLY, values)
        return {"message": "Item added successfully", "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.put("/supply/items/{row_index}")
async def update_supply_item(row_index: int, item: SupplyItem):
    """Update an existing supply item in Google Sheets"""
    try:
        values = [
            item.itemName,
            item.category,
            item.quantity,
            item.unit,
            item.location,
            item.status or "active"
        ]
        result = await update_row_in_sheet(SHEET_NAME_SUPPLY, row_index, values, 6)
        return {"message": "Item updated successfully", "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/supply/items/{row_index}")
async def delete_supply_item(row_index: int):
    """Delete a supply item from Google Sheets"""
    try:
        result = await delete_row_from_sheet(SHEET_NAME_SUPPLY, row_index, 6)
        return {"message": "Item deleted successfully", "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ===== CONTACT DIRECTORY API ROUTES =====
@api_router.get("/contact/items")
async def get_contact_items():
    """Get all contact items from Google Sheets"""
    try:
        data = await get_sheet_data(SHEET_NAME_CONTACT)
        if len(data) <= 1:
            return []
        
        # Skip header row and map to objects
        items = []
        for i, row in enumerate(data[1:], start=2):  # start=2 because row 1 is header
            if len(row) >= 1 and row[0]:  # Must have at least name
                items.append({
                    "row_index": i,
                    "name": row[0] if len(row) > 0 else "",
                    "position": row[1] if len(row) > 1 else "",
                    "department": row[2] if len(row) > 2 else "",
                    "phone": row[3] if len(row) > 3 else "",
                    "email": row[4] if len(row) > 4 else "N/A"
                })
        return items
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/contact/items")
async def create_contact_item(item: ContactItem):
    """Add a new contact item to Google Sheets"""
    try:
        values = [
            item.name,
            item.position,
            item.department,
            item.phone,
            item.email or "N/A"
        ]
        result = await append_row_to_sheet(SHEET_NAME_CONTACT, values)
        return {"message": "Contact added successfully", "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.put("/contact/items/{row_index}")
async def update_contact_item(row_index: int, item: ContactItem):
    """Update an existing contact item in Google Sheets"""
    try:
        values = [
            item.name,
            item.position,
            item.department,
            item.phone,
            item.email or "N/A"
        ]
        result = await update_row_in_sheet(SHEET_NAME_CONTACT, row_index, values, 5)
        return {"message": "Contact updated successfully", "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/contact/items/{row_index}")
async def delete_contact_item(row_index: int):
    """Delete a contact item from Google Sheets"""
    try:
        result = await delete_row_from_sheet(SHEET_NAME_CONTACT, row_index, 5)
        return {"message": "Contact deleted successfully", "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ===== EVENT/CALENDAR MANAGEMENT API ROUTES =====
@api_router.get("/event/items")
async def get_event_items():
    """Get all event items from Google Sheets"""
    try:
        data = await get_sheet_data(SHEET_NAME_EVENT)
        if len(data) <= 1:
            return []
        
        # Skip header row and map to objects
        items = []
        for i, row in enumerate(data[1:], start=2):  # start=2 because row 1 is header
            if len(row) >= 1 and row[0]:  # Must have at least event name
                items.append({
                    "row_index": i,
                    "eventTask": row[0] if len(row) > 0 else "",
                    "date": row[1] if len(row) > 1 else "",
                    "time": row[2] if len(row) > 2 else "",
                    "location": row[3] if len(row) > 3 else "",
                    "status": row[4] if len(row) > 4 else "Upcoming"
                })
        return items
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/event/items")
async def create_event_item(item: EventItem):
    """Add a new event item to Google Sheets"""
    try:
        values = [
            item.eventTask,
            item.date,
            item.time,
            item.location,
            item.status or "Upcoming"
        ]
        result = await append_row_to_sheet(SHEET_NAME_EVENT, values)
        return {"message": "Event added successfully", "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.put("/event/items/{row_index}")
async def update_event_item(row_index: int, item: EventItem):
    """Update an existing event item in Google Sheets"""
    try:
        values = [
            item.eventTask,
            item.date,
            item.time,
            item.location,
            item.status or "Upcoming"
        ]
        result = await update_row_in_sheet(SHEET_NAME_EVENT, row_index, values, 5)
        return {"message": "Event updated successfully", "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/event/items/{row_index}")
async def delete_event_item(row_index: int):
    """Delete an event item from Google Sheets"""
    try:
        result = await delete_row_from_sheet(SHEET_NAME_EVENT, row_index, 5)
        return {"message": "Event deleted successfully", "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ===== GOOGLE DRIVE DOCUMENT MANAGEMENT API ROUTES =====
async def fetch_folders_recursive(service, parent_id: str, current_path: str = "", max_depth: int = 5, current_depth: int = 0):
    """Recursively fetch folders from Google Drive with depth limit"""
    try:
        # Stop recursion if max depth reached
        if current_depth >= max_depth:
            return []
        
        query = f"'{parent_id}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false"
        results = await async_wrap(lambda: service.files().list(
            q=query,
            fields='files(id, name, modifiedTime, owners)',
            orderBy='name',
            pageSize=100  # Limit to 100 folders per level
        ).execute())()
        
        folders = results.get('files', [])
        folder_tree = []
        
        for folder in folders:
            folder_path = f"{current_path}/{folder['name']}" if current_path else folder['name']
            folder_data = {
                'id': folder['id'],
                'name': folder['name'],
                'path': folder_path,
                'modifiedTime': folder.get('modifiedTime'),
                'owner': folder.get('owners', [{}])[0].get('displayName', 'Unknown'),
                'children': await fetch_folders_recursive(service, folder['id'], folder_path, max_depth, current_depth + 1)
            }
            folder_tree.append(folder_data)
        
        return folder_tree
    except HttpError as e:
        logging.error(f"Error fetching folders: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch folders: {str(e)}")

@api_router.get("/documents/folders")
async def get_folder_structure():
    """Get the complete folder structure from Google Drive"""
    try:
        service = get_drive_service()
        
        # Get root folder info
        root_folder = await async_wrap(lambda: service.files().get(
            fileId=DRIVE_FOLDER_ID,
            fields='id, name, modifiedTime, owners'
        ).execute())()
        
        # Fetch all nested folders
        children = await fetch_folders_recursive(service, DRIVE_FOLDER_ID, "")
        
        folder_structure = {
            'id': root_folder['id'],
            'name': root_folder['name'],
            'path': '',
            'modifiedTime': root_folder.get('modifiedTime'),
            'owner': root_folder.get('owners', [{}])[0].get('displayName', 'Unknown'),
            'children': children
        }
        
        return folder_structure
    except Exception as e:
        logging.error(f"Error in get_folder_structure: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/documents/files/{folder_id}")
async def get_files_in_folder(folder_id: str):
    """Get all document files in a specific folder"""
    try:
        service = get_drive_service()
        
        # Build MIME type query
        mime_query = " or ".join([f"mimeType='{mime}'" for mime in DOCUMENT_MIME_TYPES])
        query = f"'{folder_id}' in parents and ({mime_query}) and trashed=false"
        
        results = await async_wrap(lambda: service.files().list(
            q=query,
            fields='files(id, name, mimeType, modifiedTime, size, owners, webViewLink, webContentLink, iconLink, thumbnailLink)',
            orderBy='name',
            pageSize=1000
        ).execute())()
        
        files = results.get('files', [])
        
        # Format file data
        formatted_files = []
        for file in files:
            formatted_files.append({
                'id': file['id'],
                'name': file['name'],
                'mimeType': file['mimeType'],
                'modifiedTime': file.get('modifiedTime'),
                'size': file.get('size', 0),
                'owner': file.get('owners', [{}])[0].get('displayName', 'Unknown'),
                'webViewLink': file.get('webViewLink'),
                'webContentLink': file.get('webContentLink'),
                'iconLink': file.get('iconLink'),
                'thumbnailLink': file.get('thumbnailLink')
            })
        
        return formatted_files
    except Exception as e:
        logging.error(f"Error fetching files: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/documents/share/{file_id}")
async def create_shareable_link(file_id: str):
    """Create a shareable link for a file"""
    try:
        service = get_drive_service()
        
        # Create permission for anyone with the link
        permission = {
            'type': 'anyone',
            'role': 'reader'
        }
        
        await async_wrap(lambda: service.permissions().create(
            fileId=file_id,
            body=permission,
            fields='id'
        ).execute())()
        
        # Get the file to retrieve the webViewLink
        file = await async_wrap(lambda: service.files().get(
            fileId=file_id,
            fields='webViewLink'
        ).execute())()
        
        return {
            'success': True,
            'shareLink': file.get('webViewLink')
        }
    except Exception as e:
        logging.error(f"Error creating shareable link: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ===== FILE UPLOAD API =====
@api_router.post("/documents/upload/{folder_id}")
async def upload_file(folder_id: str, file: UploadFile = FastAPIFile(...)):
    """Upload a file to a specific Google Drive folder"""
    try:
        service = get_drive_service()
        
        # Read file content
        file_content = await file.read()
        
        # Create file metadata
        file_metadata = {
            'name': file.filename,
            'parents': [folder_id]
        }
        
        # Create media upload
        media = MediaIoBaseUpload(
            io.BytesIO(file_content),
            mimetype=file.content_type or 'application/octet-stream',
            resumable=True
        )
        
        # Upload file
        uploaded_file = await async_wrap(lambda: service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id, name, mimeType, size, modifiedTime, owners, webViewLink, webContentLink'
        ).execute())()
        
        return {
            'success': True,
            'file': {
                'id': uploaded_file['id'],
                'name': uploaded_file['name'],
                'mimeType': uploaded_file['mimeType'],
                'size': uploaded_file.get('size', 0),
                'modifiedTime': uploaded_file.get('modifiedTime'),
                'owner': uploaded_file.get('owners', [{}])[0].get('displayName', 'Unknown'),
                'webViewLink': uploaded_file.get('webViewLink'),
                'webContentLink': uploaded_file.get('webContentLink')
            }
        }
    except Exception as e:
        logging.error(f"Error uploading file: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ===== FILE OPERATIONS API =====
class RenameRequest(BaseModel):
    new_name: str

class MoveRequest(BaseModel):
    target_folder_id: str

@api_router.put("/documents/files/{file_id}/rename")
async def rename_file(file_id: str, request: RenameRequest):
    """Rename a file in Google Drive"""
    try:
        service = get_drive_service()
        
        file_metadata = {'name': request.new_name}
        
        updated_file = await async_wrap(lambda: service.files().update(
            fileId=file_id,
            body=file_metadata,
            fields='id, name'
        ).execute())()
        
        return {
            'success': True,
            'file': updated_file
        }
    except Exception as e:
        logging.error(f"Error renaming file: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/documents/files/{file_id}")
async def delete_file(file_id: str):
    """Delete a file from Google Drive"""
    try:
        service = get_drive_service()
        
        await async_wrap(lambda: service.files().delete(fileId=file_id).execute())()
        
        return {'success': True, 'message': 'File deleted successfully'}
    except Exception as e:
        logging.error(f"Error deleting file: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/documents/files/{file_id}/move")
async def move_file(file_id: str, request: MoveRequest):
    """Move a file to another folder in Google Drive"""
    try:
        service = get_drive_service()
        
        # Get current parents
        file = await async_wrap(lambda: service.files().get(
            fileId=file_id,
            fields='parents'
        ).execute())()
        
        previous_parents = ",".join(file.get('parents', []))
        
        # Move file
        updated_file = await async_wrap(lambda: service.files().update(
            fileId=file_id,
            addParents=request.target_folder_id,
            removeParents=previous_parents,
            fields='id, name, parents'
        ).execute())()
        
        return {
            'success': True,
            'file': updated_file
        }
    except Exception as e:
        logging.error(f"Error moving file: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ===== FOLDER OPERATIONS API =====
class CreateFolderRequest(BaseModel):
    name: str
    parent_id: str

class RenameFolderRequest(BaseModel):
    new_name: str

@api_router.post("/documents/folders")
async def create_folder(request: CreateFolderRequest):
    """Create a new folder in Google Drive"""
    try:
        service = get_drive_service()
        
        file_metadata = {
            'name': request.name,
            'mimeType': 'application/vnd.google-apps.folder',
            'parents': [request.parent_id]
        }
        
        folder = await async_wrap(lambda: service.files().create(
            body=file_metadata,
            fields='id, name, modifiedTime, owners'
        ).execute())()
        
        return {
            'success': True,
            'folder': {
                'id': folder['id'],
                'name': folder['name'],
                'modifiedTime': folder.get('modifiedTime'),
                'owner': folder.get('owners', [{}])[0].get('displayName', 'Unknown')
            }
        }
    except Exception as e:
        logging.error(f"Error creating folder: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.put("/documents/folders/{folder_id}/rename")
async def rename_folder(folder_id: str, request: RenameFolderRequest):
    """Rename a folder in Google Drive"""
    try:
        service = get_drive_service()
        
        file_metadata = {'name': request.new_name}
        
        updated_folder = await async_wrap(lambda: service.files().update(
            fileId=folder_id,
            body=file_metadata,
            fields='id, name'
        ).execute())()
        
        return {
            'success': True,
            'folder': updated_folder
        }
    except Exception as e:
        logging.error(f"Error renaming folder: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/documents/folders/{folder_id}")
async def delete_folder(folder_id: str):
    """Delete a folder from Google Drive"""
    try:
        service = get_drive_service()
        
        await async_wrap(lambda: service.files().delete(fileId=folder_id).execute())()
        
        return {'success': True, 'message': 'Folder deleted successfully'}
    except Exception as e:
        logging.error(f"Error deleting folder: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ===== ADVANCED SEARCH API =====
@api_router.get("/documents/search")
async def search_documents(query: str, content_search: bool = False, folder_id: Optional[str] = None):
    """Search for documents in Google Drive"""
    try:
        service = get_drive_service()
        
        # Build search query
        mime_query = " or ".join([f"mimeType='{mime}'" for mime in DOCUMENT_MIME_TYPES])
        
        if content_search:
            # Full-text search
            search_query = f"({mime_query}) and fullText contains '{query}' and trashed=false"
        else:
            # Name search only
            search_query = f"({mime_query}) and name contains '{query}' and trashed=false"
        
        # Add folder restriction if provided
        if folder_id:
            search_query = f"'{folder_id}' in parents and {search_query}"
        
        results = await async_wrap(lambda: service.files().list(
            q=search_query,
            fields='files(id, name, mimeType, modifiedTime, size, owners, webViewLink, webContentLink, iconLink, thumbnailLink, parents)',
            orderBy='modifiedTime desc',
            pageSize=100
        ).execute())()
        
        files = results.get('files', [])
        
        # Format file data
        formatted_files = []
        for file in files:
            formatted_files.append({
                'id': file['id'],
                'name': file['name'],
                'mimeType': file['mimeType'],
                'modifiedTime': file.get('modifiedTime'),
                'size': file.get('size', 0),
                'owner': file.get('owners', [{}])[0].get('displayName', 'Unknown'),
                'webViewLink': file.get('webViewLink'),
                'webContentLink': file.get('webContentLink'),
                'iconLink': file.get('iconLink'),
                'thumbnailLink': file.get('thumbnailLink'),
                'parents': file.get('parents', [])
            })
        
        return formatted_files
    except Exception as e:
        logging.error(f"Error searching documents: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ===== FILE PREVIEW API =====
@api_router.get("/documents/preview/{file_id}")
async def get_file_preview(file_id: str):
    """Get preview information for a file"""
    try:
        service = get_drive_service()
        
        file = await async_wrap(lambda: service.files().get(
            fileId=file_id,
            fields='id, name, mimeType, webViewLink, webContentLink, thumbnailLink, embedLink'
        ).execute())()
        
        return {
            'success': True,
            'preview': {
                'id': file['id'],
                'name': file['name'],
                'mimeType': file['mimeType'],
                'webViewLink': file.get('webViewLink'),
                'webContentLink': file.get('webContentLink'),
                'thumbnailLink': file.get('thumbnailLink'),
                'embedLink': file.get('embedLink')
            }
        }
    except Exception as e:
        logging.error(f"Error getting file preview: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ===== BULK OPERATIONS API =====
class BulkDeleteRequest(BaseModel):
    file_ids: List[str]

class BulkMoveRequest(BaseModel):
    file_ids: List[str]
    target_folder_id: str

@api_router.post("/documents/bulk/delete")
async def bulk_delete_files(request: BulkDeleteRequest):
    """Delete multiple files from Google Drive"""
    try:
        service = get_drive_service()
        
        results = []
        for file_id in request.file_ids:
            try:
                await async_wrap(lambda: service.files().delete(fileId=file_id).execute())()
                results.append({'file_id': file_id, 'success': True})
            except Exception as e:
                results.append({'file_id': file_id, 'success': False, 'error': str(e)})
        
        return {
            'success': True,
            'results': results
        }
    except Exception as e:
        logging.error(f"Error in bulk delete: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/documents/bulk/move")
async def bulk_move_files(request: BulkMoveRequest):
    """Move multiple files to another folder"""
    try:
        service = get_drive_service()
        
        results = []
        for file_id in request.file_ids:
            try:
                # Get current parents
                file = await async_wrap(lambda: service.files().get(
                    fileId=file_id,
                    fields='parents'
                ).execute())()
                
                previous_parents = ",".join(file.get('parents', []))
                
                # Move file
                await async_wrap(lambda: service.files().update(
                    fileId=file_id,
                    addParents=request.target_folder_id,
                    removeParents=previous_parents,
                    fields='id'
                ).execute())()
                
                results.append({'file_id': file_id, 'success': True})
            except Exception as e:
                results.append({'file_id': file_id, 'success': False, 'error': str(e)})
        
        return {
            'success': True,
            'results': results
        }
    except Exception as e:
        logging.error(f"Error in bulk move: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ===== PHOTO DOCUMENTATION API ROUTES =====
@api_router.get("/photos/folders")
async def get_photo_folder_structure():
    """Get the complete folder structure from Google Drive for photos"""
    try:
        service = get_drive_service()
        
        # Get root folder info
        root_folder = await async_wrap(lambda: service.files().get(
            fileId=PHOTOS_FOLDER_ID,
            fields='id, name, modifiedTime, owners'
        ).execute())()
        
        # Fetch all nested folders
        children = await fetch_folders_recursive(service, PHOTOS_FOLDER_ID, "")
        
        folder_structure = {
            'id': root_folder['id'],
            'name': root_folder['name'],
            'path': '',
            'modifiedTime': root_folder.get('modifiedTime'),
            'owner': root_folder.get('owners', [{}])[0].get('displayName', 'Unknown'),
            'children': children
        }
        
        return folder_structure
    except Exception as e:
        logging.error(f"Error in get_photo_folder_structure: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/photos/files/{folder_id}")
async def get_photos_in_folder(folder_id: str):
    """Get all image files in a specific folder"""
    try:
        service = get_drive_service()
        
        # Build MIME type query for images only
        mime_query = " or ".join([f"mimeType='{mime}'" for mime in IMAGE_MIME_TYPES])
        query = f"'{folder_id}' in parents and ({mime_query}) and trashed=false"
        
        results = await async_wrap(lambda: service.files().list(
            q=query,
            fields='files(id, name, mimeType, modifiedTime, size, owners, webViewLink, webContentLink, iconLink, thumbnailLink, imageMediaMetadata)',
            orderBy='modifiedTime desc',
            pageSize=1000
        ).execute())()
        
        files = results.get('files', [])
        
        # Format file data
        formatted_files = []
        for file in files:
            formatted_files.append({
                'id': file['id'],
                'name': file['name'],
                'mimeType': file['mimeType'],
                'modifiedTime': file.get('modifiedTime'),
                'size': file.get('size', 0),
                'owner': file.get('owners', [{}])[0].get('displayName', 'Unknown'),
                'webViewLink': file.get('webViewLink'),
                'webContentLink': file.get('webContentLink'),
                'iconLink': file.get('iconLink'),
                'thumbnailLink': file.get('thumbnailLink'),
                'imageMediaMetadata': file.get('imageMediaMetadata', {})
            })
        
        return formatted_files
    except Exception as e:
        logging.error(f"Error fetching photos: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/photos/search")
async def search_photos(query: str, folder_id: Optional[str] = None):
    """Search for image files in Google Drive"""
    try:
        service = get_drive_service()
        
        # Build search query for images only
        mime_query = " or ".join([f"mimeType='{mime}'" for mime in IMAGE_MIME_TYPES])
        search_query = f"({mime_query}) and name contains '{query}' and trashed=false"
        
        # Add folder restriction if provided
        if folder_id:
            search_query = f"'{folder_id}' in parents and {search_query}"
        
        results = await async_wrap(lambda: service.files().list(
            q=search_query,
            fields='files(id, name, mimeType, modifiedTime, size, owners, webViewLink, webContentLink, iconLink, thumbnailLink, imageMediaMetadata, parents)',
            orderBy='modifiedTime desc',
            pageSize=100
        ).execute())()
        
        files = results.get('files', [])
        
        # Format file data
        formatted_files = []
        for file in files:
            formatted_files.append({
                'id': file['id'],
                'name': file['name'],
                'mimeType': file['mimeType'],
                'modifiedTime': file.get('modifiedTime'),
                'size': file.get('size', 0),
                'owner': file.get('owners', [{}])[0].get('displayName', 'Unknown'),
                'webViewLink': file.get('webViewLink'),
                'webContentLink': file.get('webContentLink'),
                'iconLink': file.get('iconLink'),
                'thumbnailLink': file.get('thumbnailLink'),
                'imageMediaMetadata': file.get('imageMediaMetadata', {}),
                'parents': file.get('parents', [])
            })
        
        return formatted_files
    except Exception as e:
        logging.error(f"Error searching photos: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/photos/upload/{folder_id}")
async def upload_photo(folder_id: str, file: UploadFile = FastAPIFile(...)):
    """Upload an image file to a specific Google Drive folder"""
    try:
        # Validate file is an image
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="Only image files are allowed")
        
        service = get_drive_service()
        
        # Read file content
        file_content = await file.read()
        
        # Create file metadata
        file_metadata = {
            'name': file.filename,
            'parents': [folder_id]
        }
        
        # Create media upload
        media = MediaIoBaseUpload(
            io.BytesIO(file_content),
            mimetype=file.content_type,
            resumable=True
        )
        
        # Upload file
        uploaded_file = await async_wrap(lambda: service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id, name, mimeType, size, modifiedTime, owners, webViewLink, webContentLink, thumbnailLink, imageMediaMetadata'
        ).execute())()
        
        return {
            'success': True,
            'file': {
                'id': uploaded_file['id'],
                'name': uploaded_file['name'],
                'mimeType': uploaded_file['mimeType'],
                'size': uploaded_file.get('size', 0),
                'modifiedTime': uploaded_file.get('modifiedTime'),
                'owner': uploaded_file.get('owners', [{}])[0].get('displayName', 'Unknown'),
                'webViewLink': uploaded_file.get('webViewLink'),
                'webContentLink': uploaded_file.get('webContentLink'),
                'thumbnailLink': uploaded_file.get('thumbnailLink'),
                'imageMediaMetadata': uploaded_file.get('imageMediaMetadata', {})
            }
        }
    except Exception as e:
        logging.error(f"Error uploading photo: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ===== MAPS MODULE API ROUTES =====
# Map categories with their Google Drive folder IDs
MAP_CATEGORIES = {
    "administrative": {
        "name": "Administrative Map",
        "folder_id": "1Wh2wSQuyzHiz25Vbr4ICETj18RRUEpvi"
    },
    "topographic": {
        "name": "Topographic Map",
        "folder_id": "1Y01dJR_YJdixvsi_B9Xs7nQaXD31_Yn2"
    },
    "hazard": {
        "name": "Hazard Map",
        "folder_id": "16xy_oUAr6sWb3JE9eNrxYJdAMDRKGYLn"
    },
    "mgb": {
        "name": "MGB-Map",
        "folder_id": "1yQmtrKfKiMOFA933W0emzeGoexMpUDGM"
    },
    "mpdc": {
        "name": "MPDC-Map",
        "folder_id": "1MI1aO_-gQwsRbSJsfHY2FI4AOz9Jney1"
    }
}

@api_router.get("/maps/categories")
async def get_map_categories():
    """Get all map categories with their folder IDs"""
    return MAP_CATEGORIES

@api_router.get("/maps/folders/{folder_id}")
async def get_map_folder_structure(folder_id: str):
    """Get the complete folder structure from Google Drive for a specific map category"""
    try:
        service = get_drive_service()
        
        # Get root folder info
        root_folder = await async_wrap(lambda: service.files().get(
            fileId=folder_id,
            fields='id, name, modifiedTime, owners'
        ).execute())()
        
        # Fetch all nested folders
        children = await fetch_folders_recursive(service, folder_id, "")
        
        folder_structure = {
            'id': root_folder['id'],
            'name': root_folder['name'],
            'path': '',
            'modifiedTime': root_folder.get('modifiedTime'),
            'owner': root_folder.get('owners', [{}])[0].get('displayName', 'Unknown'),
            'children': children
        }
        
        return folder_structure
    except Exception as e:
        logging.error(f"Error in get_map_folder_structure: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/maps/files/{folder_id}")
async def get_map_files_in_folder(folder_id: str):
    """Get all image/map files in a specific folder"""
    try:
        service = get_drive_service()
        
        # Build MIME type query for images and PDFs (maps can be images or PDFs)
        map_mime_types = IMAGE_MIME_TYPES + ['application/pdf']
        mime_query = " or ".join([f"mimeType='{mime}'" for mime in map_mime_types])
        query = f"'{folder_id}' in parents and ({mime_query}) and trashed=false"
        
        results = await async_wrap(lambda: service.files().list(
            q=query,
            fields='files(id, name, mimeType, modifiedTime, size, owners, webViewLink, webContentLink, iconLink, thumbnailLink, imageMediaMetadata)',
            orderBy='modifiedTime desc',
            pageSize=1000
        ).execute())()
        
        files = results.get('files', [])
        
        # Format file data
        formatted_files = []
        for file in files:
            formatted_files.append({
                'id': file['id'],
                'name': file['name'],
                'mimeType': file['mimeType'],
                'modifiedTime': file.get('modifiedTime'),
                'size': file.get('size', 0),
                'owner': file.get('owners', [{}])[0].get('displayName', 'Unknown'),
                'webViewLink': file.get('webViewLink'),
                'webContentLink': file.get('webContentLink'),
                'iconLink': file.get('iconLink'),
                'thumbnailLink': file.get('thumbnailLink'),
                'imageMediaMetadata': file.get('imageMediaMetadata', {})
            })
        
        return formatted_files
    except Exception as e:
        logging.error(f"Error fetching map files: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/maps/search")
async def search_maps(query: str, folder_id: Optional[str] = None):
    """Search for map files in Google Drive"""
    try:
        service = get_drive_service()
        
        # Build search query for images and PDFs
        map_mime_types = IMAGE_MIME_TYPES + ['application/pdf']
        mime_query = " or ".join([f"mimeType='{mime}'" for mime in map_mime_types])
        search_query = f"({mime_query}) and name contains '{query}' and trashed=false"
        
        # Add folder restriction if provided
        if folder_id:
            search_query = f"'{folder_id}' in parents and {search_query}"
        
        results = await async_wrap(lambda: service.files().list(
            q=search_query,
            fields='files(id, name, mimeType, modifiedTime, size, owners, webViewLink, webContentLink, iconLink, thumbnailLink, imageMediaMetadata, parents)',
            orderBy='modifiedTime desc',
            pageSize=100
        ).execute())()
        
        files = results.get('files', [])
        
        # Format file data
        formatted_files = []
        for file in files:
            formatted_files.append({
                'id': file['id'],
                'name': file['name'],
                'mimeType': file['mimeType'],
                'modifiedTime': file.get('modifiedTime'),
                'size': file.get('size', 0),
                'owner': file.get('owners', [{}])[0].get('displayName', 'Unknown'),
                'webViewLink': file.get('webViewLink'),
                'webContentLink': file.get('webContentLink'),
                'iconLink': file.get('iconLink'),
                'thumbnailLink': file.get('thumbnailLink'),
                'imageMediaMetadata': file.get('imageMediaMetadata', {}),
                'parents': file.get('parents', [])
            })
        
        return formatted_files
    except Exception as e:
        logging.error(f"Error searching maps: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/maps/upload/{folder_id}")
async def upload_map(folder_id: str, file: UploadFile = FastAPIFile(...)):
    """Upload a map file to a specific Google Drive folder"""
    try:
        # Validate file is an image or PDF
        if not file.content_type or (not file.content_type.startswith('image/') and file.content_type != 'application/pdf'):
            raise HTTPException(status_code=400, detail="Only image files and PDFs are allowed")
        
        service = get_drive_service()
        
        # Read file content
        file_content = await file.read()
        
        # Create file metadata
        file_metadata = {
            'name': file.filename,
            'parents': [folder_id]
        }
        
        # Create media upload
        media = MediaIoBaseUpload(
            io.BytesIO(file_content),
            mimetype=file.content_type,
            resumable=True
        )
        
        # Upload file
        uploaded_file = await async_wrap(lambda: service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id, name, mimeType, size, modifiedTime, owners, webViewLink, webContentLink, thumbnailLink, imageMediaMetadata'
        ).execute())()
        
        return {
            'success': True,
            'file': {
                'id': uploaded_file['id'],
                'name': uploaded_file['name'],
                'mimeType': uploaded_file['mimeType'],
                'size': uploaded_file.get('size', 0),
                'modifiedTime': uploaded_file.get('modifiedTime'),
                'owner': uploaded_file.get('owners', [{}])[0].get('displayName', 'Unknown'),
                'webViewLink': uploaded_file.get('webViewLink'),
                'webContentLink': uploaded_file.get('webContentLink'),
                'thumbnailLink': uploaded_file.get('thumbnailLink'),
                'imageMediaMetadata': uploaded_file.get('imageMediaMetadata', {})
            }
        }
    except Exception as e:
        logging.error(f"Error uploading map: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ===== MONGODB STATUS CHECK ROUTES =====
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
