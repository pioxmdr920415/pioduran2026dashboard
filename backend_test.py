#!/usr/bin/env python3
"""
Backend API Testing for Maps Module
Tests the Maps Module Backend API endpoints for MDRRMO Pio Duran system
"""

import requests
import json
import sys
from typing import Dict, Any, List, Optional

# Backend URL from environment
BACKEND_URL = "https://repo-setup-36.preview.emergentagent.com/api"

class MapsAPITester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.test_results = []
        self.session = requests.Session()
        self.session.timeout = 30
        
    def log_test(self, test_name: str, success: bool, details: str, response_data: Any = None):
        """Log test results"""
        result = {
            'test': test_name,
            'success': success,
            'details': details,
            'response_data': response_data
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        print(f"   Details: {details}")
        if not success and response_data:
            print(f"   Response: {response_data}")
        print()

    def test_maps_categories(self) -> Optional[Dict]:
        """Test GET /api/maps/categories endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/maps/categories")
            
            if response.status_code == 200:
                data = response.json()
                
                # Validate response structure
                expected_categories = ["administrative", "topographic", "hazard", "mgb", "mpdc"]
                
                if isinstance(data, dict):
                    # Check if all expected categories exist
                    missing_categories = []
                    for category in expected_categories:
                        if category not in data:
                            missing_categories.append(category)
                    
                    if missing_categories:
                        self.log_test(
                            "GET /api/maps/categories - Structure Validation",
                            False,
                            f"Missing categories: {missing_categories}",
                            data
                        )
                        return None
                    
                    # Validate each category has required fields
                    for category, info in data.items():
                        if not isinstance(info, dict) or 'name' not in info or 'folder_id' not in info:
                            self.log_test(
                                "GET /api/maps/categories - Field Validation",
                                False,
                                f"Category '{category}' missing required fields (name, folder_id)",
                                data
                            )
                            return None
                    
                    self.log_test(
                        "GET /api/maps/categories",
                        True,
                        f"Successfully retrieved {len(data)} map categories with proper structure",
                        data
                    )
                    return data
                else:
                    self.log_test(
                        "GET /api/maps/categories",
                        False,
                        f"Expected dict response, got {type(data)}",
                        data
                    )
                    return None
            else:
                self.log_test(
                    "GET /api/maps/categories",
                    False,
                    f"HTTP {response.status_code}: {response.text}",
                    response.text
                )
                return None
                
        except Exception as e:
            self.log_test(
                "GET /api/maps/categories",
                False,
                f"Request failed: {str(e)}",
                str(e)
            )
            return None

    def test_maps_folders(self, folder_id: str, category_name: str) -> bool:
        """Test GET /api/maps/folders/{folder_id} endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/maps/folders/{folder_id}")
            
            if response.status_code == 200:
                data = response.json()
                
                # Validate response structure
                required_fields = ['id', 'name', 'path', 'modifiedTime', 'owner', 'children']
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_test(
                        f"GET /api/maps/folders/{folder_id} ({category_name}) - Structure",
                        False,
                        f"Missing required fields: {missing_fields}",
                        data
                    )
                    return False
                
                # Validate folder ID matches
                if data['id'] != folder_id:
                    self.log_test(
                        f"GET /api/maps/folders/{folder_id} ({category_name}) - ID Validation",
                        False,
                        f"Folder ID mismatch: expected {folder_id}, got {data['id']}",
                        data
                    )
                    return False
                
                # Validate children is a list
                if not isinstance(data['children'], list):
                    self.log_test(
                        f"GET /api/maps/folders/{folder_id} ({category_name}) - Children Type",
                        False,
                        f"Children should be list, got {type(data['children'])}",
                        data
                    )
                    return False
                
                self.log_test(
                    f"GET /api/maps/folders/{folder_id} ({category_name})",
                    True,
                    f"Successfully retrieved folder structure with {len(data['children'])} children",
                    {"folder_name": data['name'], "children_count": len(data['children'])}
                )
                return True
                
            else:
                self.log_test(
                    f"GET /api/maps/folders/{folder_id} ({category_name})",
                    False,
                    f"HTTP {response.status_code}: {response.text}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test(
                f"GET /api/maps/folders/{folder_id} ({category_name})",
                False,
                f"Request failed: {str(e)}",
                str(e)
            )
            return False

    def test_maps_files(self, folder_id: str, category_name: str) -> bool:
        """Test GET /api/maps/files/{folder_id} endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/maps/files/{folder_id}")
            
            if response.status_code == 200:
                data = response.json()
                
                # Validate response is a list
                if not isinstance(data, list):
                    self.log_test(
                        f"GET /api/maps/files/{folder_id} ({category_name})",
                        False,
                        f"Expected list response, got {type(data)}",
                        data
                    )
                    return False
                
                # If files exist, validate structure
                if data:
                    required_fields = ['id', 'name', 'mimeType', 'modifiedTime', 'size', 'owner']
                    for i, file_info in enumerate(data[:3]):  # Check first 3 files
                        missing_fields = [field for field in required_fields if field not in file_info]
                        if missing_fields:
                            self.log_test(
                                f"GET /api/maps/files/{folder_id} ({category_name}) - File Structure",
                                False,
                                f"File {i} missing fields: {missing_fields}",
                                file_info
                            )
                            return False
                        
                        # Validate MIME type is image or PDF
                        mime_type = file_info.get('mimeType', '')
                        if not (mime_type.startswith('image/') or mime_type == 'application/pdf'):
                            self.log_test(
                                f"GET /api/maps/files/{folder_id} ({category_name}) - MIME Type",
                                False,
                                f"Invalid MIME type for map file: {mime_type}",
                                file_info
                            )
                            return False
                
                self.log_test(
                    f"GET /api/maps/files/{folder_id} ({category_name})",
                    True,
                    f"Successfully retrieved {len(data)} map files",
                    {"file_count": len(data)}
                )
                return True
                
            else:
                self.log_test(
                    f"GET /api/maps/files/{folder_id} ({category_name})",
                    False,
                    f"HTTP {response.status_code}: {response.text}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test(
                f"GET /api/maps/files/{folder_id} ({category_name})",
                False,
                f"Request failed: {str(e)}",
                str(e)
            )
            return False

    def test_maps_search(self, query: str, folder_id: Optional[str] = None) -> bool:
        """Test GET /api/maps/search endpoint"""
        try:
            params = {'query': query}
            if folder_id:
                params['folder_id'] = folder_id
            
            response = self.session.get(f"{self.base_url}/maps/search", params=params)
            
            test_name = f"GET /api/maps/search (query='{query}'"
            if folder_id:
                test_name += f", folder_id='{folder_id}'"
            test_name += ")"
            
            if response.status_code == 200:
                data = response.json()
                
                # Validate response is a list
                if not isinstance(data, list):
                    self.log_test(
                        test_name,
                        False,
                        f"Expected list response, got {type(data)}",
                        data
                    )
                    return False
                
                # If results exist, validate structure
                if data:
                    required_fields = ['id', 'name', 'mimeType', 'modifiedTime', 'size', 'owner', 'parents']
                    for i, file_info in enumerate(data[:3]):  # Check first 3 results
                        missing_fields = [field for field in required_fields if field not in file_info]
                        if missing_fields:
                            self.log_test(
                                f"{test_name} - Result Structure",
                                False,
                                f"Result {i} missing fields: {missing_fields}",
                                file_info
                            )
                            return False
                        
                        # Validate search query appears in filename (case insensitive)
                        if query.lower() not in file_info.get('name', '').lower():
                            self.log_test(
                                f"{test_name} - Search Relevance",
                                False,
                                f"Search query '{query}' not found in filename '{file_info.get('name')}'",
                                file_info
                            )
                            return False
                
                self.log_test(
                    test_name,
                    True,
                    f"Successfully found {len(data)} matching files",
                    {"result_count": len(data)}
                )
                return True
                
            else:
                self.log_test(
                    test_name,
                    False,
                    f"HTTP {response.status_code}: {response.text}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test(
                test_name,
                False,
                f"Request failed: {str(e)}",
                str(e)
            )
            return False

    def test_error_handling(self):
        """Test error handling with invalid inputs"""
        # Test invalid folder ID
        try:
            response = self.session.get(f"{self.base_url}/maps/folders/invalid_folder_id")
            if response.status_code in [400, 404, 500]:
                self.log_test(
                    "Error Handling - Invalid Folder ID",
                    True,
                    f"Properly returned error status {response.status_code} for invalid folder ID"
                )
            else:
                self.log_test(
                    "Error Handling - Invalid Folder ID",
                    False,
                    f"Expected error status, got {response.status_code}",
                    response.text
                )
        except Exception as e:
            self.log_test(
                "Error Handling - Invalid Folder ID",
                False,
                f"Request failed: {str(e)}",
                str(e)
            )

    def run_comprehensive_tests(self):
        """Run all Maps API tests"""
        print("=" * 60)
        print("MAPS MODULE BACKEND API TESTING")
        print("=" * 60)
        print(f"Backend URL: {self.base_url}")
        print()
        
        # Test 1: Get map categories
        categories = self.test_maps_categories()
        if not categories:
            print("❌ CRITICAL: Cannot proceed without map categories")
            return False
        
        # Test 2: Test folder structure for each category
        folder_tests_passed = 0
        for category_key, category_info in categories.items():
            folder_id = category_info.get('folder_id')
            category_name = category_info.get('name')
            
            if self.test_maps_folders(folder_id, category_name):
                folder_tests_passed += 1
        
        # Test 3: Test file retrieval for each category
        file_tests_passed = 0
        for category_key, category_info in categories.items():
            folder_id = category_info.get('folder_id')
            category_name = category_info.get('name')
            
            if self.test_maps_files(folder_id, category_name):
                file_tests_passed += 1
        
        # Test 4: Test search functionality
        search_tests = [
            ("map", None),  # General search
            ("administrative", categories.get('administrative', {}).get('folder_id')),  # Folder-specific search
            ("hazard", None),  # Another general search
        ]
        
        search_tests_passed = 0
        for query, folder_id in search_tests:
            if self.test_maps_search(query, folder_id):
                search_tests_passed += 1
        
        # Test 5: Error handling
        self.test_error_handling()
        
        # Summary
        print("=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result['success'])
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {total_tests - passed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        print()
        
        # Critical functionality check
        categories_working = categories is not None
        folders_working = folder_tests_passed >= len(categories) * 0.8  # 80% success rate
        files_working = file_tests_passed >= len(categories) * 0.8  # 80% success rate
        search_working = search_tests_passed >= len(search_tests) * 0.5  # 50% success rate
        
        print("CRITICAL FUNCTIONALITY STATUS:")
        print(f"✅ Map Categories API: {'Working' if categories_working else 'Failed'}")
        print(f"✅ Folder Structure API: {'Working' if folders_working else 'Failed'}")
        print(f"✅ File Retrieval API: {'Working' if files_working else 'Failed'}")
        print(f"✅ Search API: {'Working' if search_working else 'Failed'}")
        print()
        
        overall_success = categories_working and folders_working and files_working and search_working
        
        if overall_success:
            print("🎉 OVERALL STATUS: Maps Module Backend APIs are WORKING")
        else:
            print("⚠️  OVERALL STATUS: Maps Module Backend APIs have ISSUES")
        
        return overall_success

def main():
    """Main test execution"""
    tester = MapsAPITester()
    success = tester.run_comprehensive_tests()
    
    # Return appropriate exit code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()