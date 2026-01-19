#!/usr/bin/env python3
"""
Test Google Drive Service Account Authentication
"""

import os
import sys
from pathlib import Path
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
import json

# Add backend to path
sys.path.append('/app/backend')

ROOT_DIR = Path('/app/backend')
SERVICE_ACCOUNT_FILE = 'service_account.json'

SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.readonly'
]

def test_service_account_auth():
    """Test service account authentication"""
    print("Testing Google Drive Service Account Authentication...")
    print("=" * 60)
    
    # Check if service account file exists
    service_account_path = ROOT_DIR / SERVICE_ACCOUNT_FILE
    if not service_account_path.exists():
        print(f"❌ Service account file not found: {service_account_path}")
        return False
    
    print(f"✅ Service account file found: {service_account_path}")
    
    # Load and inspect service account JSON
    try:
        with open(service_account_path, 'r') as f:
            creds_info = json.load(f)
        
        print(f"✅ Service account JSON loaded successfully")
        print(f"   - Project ID: {creds_info.get('project_id')}")
        print(f"   - Client Email: {creds_info.get('client_email')}")
        print(f"   - Private Key ID: {creds_info.get('private_key_id')}")
        print(f"   - Private Key Length: {len(creds_info.get('private_key', ''))}")
        
    except Exception as e:
        print(f"❌ Failed to load service account JSON: {e}")
        return False
    
    # Test credentials creation
    try:
        creds = Credentials.from_service_account_file(
            service_account_path,
            scopes=SCOPES
        )
        print(f"✅ Credentials created successfully")
        print(f"   - Valid: {creds.valid}")
        print(f"   - Expired: {creds.expired}")
        
    except Exception as e:
        print(f"❌ Failed to create credentials: {e}")
        return False
    
    # Test Drive service creation
    try:
        service = build('drive', 'v3', credentials=creds)
        print(f"✅ Drive service created successfully")
        
    except Exception as e:
        print(f"❌ Failed to create Drive service: {e}")
        return False
    
    # Test simple Drive API call
    try:
        # Try to get info about the root folder
        about = service.about().get(fields='user').execute()
        print(f"✅ Drive API call successful")
        print(f"   - User: {about.get('user', {}).get('displayName', 'Unknown')}")
        
    except Exception as e:
        print(f"❌ Drive API call failed: {e}")
        return False
    
    # Test accessing a specific folder (using one of the map folder IDs)
    try:
        folder_id = "1Wh2wSQuyzHiz25Vbr4ICETj18RRUEpvi"  # Administrative Map folder
        folder = service.files().get(fileId=folder_id, fields='id, name').execute()
        print(f"✅ Folder access successful")
        print(f"   - Folder: {folder.get('name')} ({folder.get('id')})")
        
    except Exception as e:
        print(f"❌ Folder access failed: {e}")
        print(f"   This might indicate permission issues with the specific folder")
        return False
    
    print("\n🎉 All authentication tests passed!")
    return True

if __name__ == "__main__":
    success = test_service_account_auth()
    sys.exit(0 if success else 1)