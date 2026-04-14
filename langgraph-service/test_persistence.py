#!/usr/bin/env python3
"""Test script to verify LangGraph conversation persistence."""

import asyncio
import json
import httpx
from datetime import datetime

# Test venue ID
VENUE_ID = "00000000-0000-0000-0000-000000000001"
API_BASE = "http://localhost:8001/api/v2/deputy"

async def test_conversation_persistence():
    """Test that conversations maintain context across messages."""
    
    async with httpx.AsyncClient() as client:
        print("\n=== Testing Conversation Persistence ===\n")
        
        # Thread ID for main conversation
        thread_id = f"venue:{VENUE_ID}"
        
        # Test 1: Send first message with name introduction
        print("1. Sending: 'My name is Angelina'")
        response = await client.post(
            f"{API_BASE}/chat",
            json={
                "message": "My name is Angelina",
                "venue_id": VENUE_ID,
                "thread_id": thread_id,
                "context": {}
            }
        )
        data = response.json()
        print(f"   Response: {data['message']}\n")
        
        # Test 2: Ask about the name (should remember)
        print("2. Sending: 'What is my name?'")
        response = await client.post(
            f"{API_BASE}/chat",
            json={
                "message": "What is my name?",
                "venue_id": VENUE_ID,
                "thread_id": thread_id,
                "context": {}
            }
        )
        data = response.json()
        print(f"   Response: {data['message']}")
        
        # Check if name was remembered
        if "Angelina" in data['message']:
            print("   ✅ SUCCESS: Agent remembered the name!\n")
        else:
            print("   ❌ FAILED: Agent didn't remember the name\n")
        
        # Test 3: Ask about tasks (should use tools)
        print("3. Sending: 'Show me pending tasks'")
        response = await client.post(
            f"{API_BASE}/chat",
            json={
                "message": "Show me pending tasks",
                "venue_id": VENUE_ID,
                "thread_id": thread_id,
                "context": {}
            }
        )
        data = response.json()
        print(f"   Response Type: {data.get('data_type', 'text')}")
        print(f"   Has Task Data: {data.get('data') is not None}")
        
        if data.get('data_type') == 'task_list':
            print("   ✅ SUCCESS: Agent returned structured task data!\n")
        else:
            print("   ⚠️  WARNING: Agent didn't return structured task data\n")
        
        # Test 4: Different thread (should NOT remember name)
        print("4. Testing different thread context")
        task_thread_id = f"venue:{VENUE_ID}:task:test123"
        
        response = await client.post(
            f"{API_BASE}/chat",
            json={
                "message": "What is my name?",
                "venue_id": VENUE_ID,
                "thread_id": task_thread_id,
                "context": {}
            }
        )
        data = response.json()
        print(f"   Response: {data['message']}")
        
        if "Angelina" not in data['message']:
            print("   ✅ SUCCESS: Different thread has isolated context!\n")
        else:
            print("   ❌ FAILED: Contexts are not properly isolated\n")
        
        # Test 5: Back to main thread (should still remember)
        print("5. Back to main thread: 'Do you remember my name?'")
        response = await client.post(
            f"{API_BASE}/chat",
            json={
                "message": "Do you remember my name?",
                "venue_id": VENUE_ID,
                "thread_id": thread_id,
                "context": {}
            }
        )
        data = response.json()
        print(f"   Response: {data['message']}")
        
        if "Angelina" in data['message']:
            print("   ✅ SUCCESS: Main thread still remembers!\n")
        else:
            print("   ❌ FAILED: Main thread lost context\n")
        
        print("=== Test Complete ===\n")

if __name__ == "__main__":
    asyncio.run(test_conversation_persistence())