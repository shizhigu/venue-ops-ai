#!/usr/bin/env python3
"""Test the complete workflow: analyze -> confirm"""

import requests
import json
from datetime import datetime

# API base URL
BASE_URL = "http://localhost:8001/api/tasks"

def test_workflow():
    print("=== Testing Venue Ops Workflow ===\n")
    
    # Step 1: Analyze issue
    print("Step 1: Analyzing issue...")
    analyze_data = {
        "audio_description": "There's water leaking from the ceiling near the main entrance",
        "location": json.dumps({
            "lat": 40.7128,
            "lng": -74.0060,
            "area": "Main Entrance",
            "floor": 1
        }),
        "manual_notes": "Started about 30 minutes ago, getting worse"
    }
    
    response = requests.post(f"{BASE_URL}/analyze", data=analyze_data)
    
    if response.status_code != 200:
        print(f"❌ Analysis failed: {response.status_code}")
        print(response.text)
        return
    
    analysis_result = response.json()
    analysis_id = analysis_result.get("analysis_id")
    
    print(f"✓ Analysis complete!")
    print(f"  - Analysis ID: {analysis_id}")
    print(f"  - Priority: {analysis_result.get('priority')}")
    print(f"  - Issue Type: {analysis_result.get('issue_type')}")
    print(f"  - AI Analysis: {json.dumps(analysis_result.get('ai_analysis'), indent=2)}")
    print()
    
    # Step 2: Confirm and create task
    print("Step 2: Confirming and creating task...")
    confirm_data = {
        "analysis_id": analysis_id,
        "user_id": "test_user_001",
        "organization_id": "venue_001",
        "priority": analysis_result.get("priority"),  # Could override here
        "description": analysis_result.get("ai_analysis", {}).get("description", "Water leak at main entrance"),
        "additional_notes": "Please handle ASAP - customers are complaining"
    }
    
    response = requests.post(f"{BASE_URL}/confirm", json=confirm_data)
    
    if response.status_code != 200:
        print(f"❌ Task creation failed: {response.status_code}")
        print(response.text)
        return
    
    task_result = response.json()
    task_id = task_result.get("task_id")
    
    print(f"✓ Task created successfully!")
    print(f"  - Task ID: {task_id}")
    print(f"  - Status: {task_result.get('status')}")
    print(f"  - Task Details: {json.dumps(task_result.get('task'), indent=2)}")
    print()
    
    # Step 3: Get task details
    print("Step 3: Fetching task details...")
    response = requests.get(f"{BASE_URL}/{task_id}")
    
    if response.status_code != 200:
        print(f"❌ Failed to fetch task: {response.status_code}")
        print(response.text)
        return
    
    task_details = response.json()
    print(f"✓ Task retrieved!")
    print(f"  - Task: {json.dumps(task_details, indent=2)}")
    print()
    
    print("=== Workflow Test Complete ===")
    print("✅ All steps executed successfully!")
    print("\nSummary:")
    print(f"1. Issue analyzed and given priority {analysis_result.get('priority')}")
    print(f"2. Task {task_id} created")
    print(f"3. Task is ready for assignment")
    
    if analysis_result.get("priority", 3) >= 4:
        print("\n⚠️  Note: This is a high-priority task that would notify managers!")

if __name__ == "__main__":
    test_workflow()