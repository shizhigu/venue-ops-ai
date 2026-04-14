#!/usr/bin/env python3
"""Simple test to see what's happening."""

import asyncio
import json
import httpx

async def test():
    async with httpx.AsyncClient(timeout=30.0) as client:
        import uuid
        thread_id = f"test_task_{uuid.uuid4()}"  # Use unique thread to avoid cached results
        task_id = "c66c8f40-28c1-4b2c-ab1f-bc0eb35b166a"
        
        # First: Establish task context
        print("1. Establishing task context...")
        response = await client.post(
            "http://localhost:8001/api/v2/deputy/chat",
            json={
                "message": f"I'm now looking at task {task_id}. Please show me the details for this task.",
                "venue_id": "00000000-0000-0000-0000-000000000001",
                "thread_id": thread_id,
                "context": {"task_id": task_id}
            }
        )
        data = response.json()
        print(f"  Response type: {data.get('data_type')}")
        
        # Second: Ask "what can i do"
        print("\n2. Asking 'what can i do'...")
        response = await client.post(
            "http://localhost:8001/api/v2/deputy/chat",
            json={
                "message": "what can i do",
                "venue_id": "00000000-0000-0000-0000-000000000001",
                "thread_id": thread_id,
                "context": {}
            }
        )
        
        data = response.json()
        print(f"  Response type: {data.get('data_type')}")
        print(f"  Has task data: {data.get('data') is not None}")
        
        if data.get('data_type') == 'task_detail':
            print("  ❌ ERROR: Agent returned task_detail again!")
            print(f"  Message: {data.get('message')[:100]}...")
        else:
            print("  ✅ Good: Agent didn't re-fetch task details")

if __name__ == "__main__":
    asyncio.run(test())