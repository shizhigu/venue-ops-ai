#!/usr/bin/env python3
"""Test the frontend flow with all required fields"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8001/api/tasks"

def test_frontend_flow():
    print("=== Testing Frontend Flow ===\n")
    
    # Step 1: Analyze issue (simulating frontend call)
    print("Step 1: Analyzing issue...")
    
    # Create FormData as frontend does
    analyze_data = {
        "audio_description": "Broken window in conference room B needs urgent repair",
        "location": json.dumps({
            "lat": 40.7128,
            "lng": -74.0060,
            "area": "Conference Room B",
            "floor": 2,
            "description": "Conference Room B - Floor 2"
        }),
        "manual_notes": "Glass shattered, temporary covering in place"
    }
    
    response = requests.post(f"{BASE_URL}/analyze", data=analyze_data)
    
    if response.status_code != 200:
        print(f"❌ Analysis failed: {response.status_code}")
        print(response.text)
        return
    
    analysis = response.json()
    print(f"✓ Analysis complete!")
    print(f"  - Analysis ID: {analysis['analysis_id']}")
    print(f"  - Priority: {analysis['priority']}")
    print(f"  - Issue Type: {analysis['issue_type']}")
    print()
    
    # Step 2: Confirm (simulating frontend confirmation)
    print("Step 2: Confirming and creating task...")
    
    # This is what frontend sends
    confirm_data = {
        "analysis_id": analysis["analysis_id"],
        "clerk_user_id": None,  # No Clerk user in test
        "venue_id": "00000000-0000-0000-0000-000000000001",  # Test venue
        "user_id": "frontend_test_user",
        "organization_id": "venue_001",
        "priority": analysis["priority"],
        "description": analysis["ai_analysis"].get("description", "Window repair needed"),
        "additional_notes": "Customer area - please prioritize"
    }
    
    response = requests.post(
        f"{BASE_URL}/confirm",
        headers={"Content-Type": "application/json"},
        json=confirm_data
    )
    
    if response.status_code != 200:
        print(f"❌ Confirm failed: {response.status_code}")
        print(response.text)
        return
    
    result = response.json()
    print(f"✓ Task created!")
    print(f"  - Task ID: {result['task_id']}")
    print(f"  - Venue ID: {result['task']['venue_id']}")
    print(f"  - Status: {result['task']['status']}")
    print(f"  - Priority: {result['task']['priority']}")
    print()
    
    # Step 3: Verify in database
    print("Step 3: Fetching from database...")
    
    response = requests.get(f"{BASE_URL}/{result['task_id']}")
    
    if response.status_code != 200:
        print(f"❌ Fetch failed: {response.status_code}")
        return
    
    task = response.json()
    print(f"✓ Task verified in database!")
    print(f"  - Venue ID: {task['venue_id']}")
    print(f"  - Description: {task['data']['description']}")
    print(f"  - Audio: {task['data']['audio_description']}")
    print(f"  - Location: {task['data']['location']['area']}")
    print()
    
    print("=== All Steps Successful! ===")
    print("✅ Frontend flow working correctly")
    print("✅ All data properly saved to database")
    return True

if __name__ == "__main__":
    success = test_frontend_flow()
    if not success:
        print("\n⚠️  Test failed - check error messages above")