#!/usr/bin/env python3
"""Test task-specific conversation flow."""

import asyncio
import json
import httpx

VENUE_ID = "00000000-0000-0000-0000-000000000001"
TASK_ID = "c66c8f40-28c1-4b2c-ab1f-bc0eb35b166a"
API_BASE = "http://localhost:8001/api/v2/deputy"

async def test_task_conversation():
    """Test task conversation flow."""
    
    async with httpx.AsyncClient() as client:
        print("\n=== Testing Task Conversation Flow ===\n")
        
        thread_id = f"venue:{VENUE_ID}:task:{TASK_ID}"
        
        # Message 1: Initial task context
        print("1. Setting task context...")
        response = await client.post(
            f"{API_BASE}/chat",
            json={
                "message": f"I'm now looking at task {TASK_ID}. Please show me the details for this task.",
                "venue_id": VENUE_ID,
                "thread_id": thread_id,
                "context": {"task_id": TASK_ID}
            }
        )
        data = response.json()
        print(f"   Response type: {data.get('data_type')}")
        print(f"   Has task data: {data.get('data') is not None}")
        print(f"   Message preview: {data['message'][:100]}")
        
        # Message 2: Ask "ok"
        print("\n2. Sending: 'ok'")
        response = await client.post(
            f"{API_BASE}/chat",
            json={
                "message": "ok",
                "venue_id": VENUE_ID,
                "thread_id": thread_id,
                "context": {}
            }
        )
        data = response.json()
        print(f"   Response type: {data.get('data_type')}")
        print(f"   Has task data: {data.get('data') is not None}")
        print(f"   Message preview: {data['message'][:100]}")
        
        # Message 3: Ask "mark as emergency"
        print("\n3. Sending: 'mark as emergency'")
        response = await client.post(
            f"{API_BASE}/chat",
            json={
                "message": "mark as emergency",
                "venue_id": VENUE_ID,
                "thread_id": thread_id,
                "context": {}
            }
        )
        data = response.json()
        print(f"   Response type: {data.get('data_type')}")
        print(f"   Requires confirmation: {data.get('requires_confirmation')}")
        print(f"   Message preview: {data['message'][:100]}")
        
        print("\n=== Test Complete ===\n")

if __name__ == "__main__":
    asyncio.run(test_task_conversation())