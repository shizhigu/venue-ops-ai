#!/usr/bin/env python3
"""Test task-specific context behavior."""

import asyncio
import json
import httpx

async def test():
    async with httpx.AsyncClient(timeout=30.0) as client:
        task_id = "c66c8f40-28c1-4b2c-ab1f-bc0eb35b166a"
        thread_id = f"venue:00000000-0000-0000-0000-000000000001:task:{task_id}"
        
        print("Testing task-specific conversation:\n")
        
        # 1. Initial task context
        print("1. Setting task context...")
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
        print(f"   Response type: {data.get('data_type')}")
        
        # 2. Ask "what's my name" 
        print("\n2. Testing conversation: 'My name is John'")
        response = await client.post(
            "http://localhost:8001/api/v2/deputy/chat",
            json={
                "message": "My name is John",
                "venue_id": "00000000-0000-0000-0000-000000000001",
                "thread_id": thread_id,
                "context": {}
            }
        )
        data = response.json()
        print(f"   Response: {data.get('message')[:100]}...")
        
        # 3. Ask "what's my name"
        print("\n3. Testing memory: 'What's my name?'")
        response = await client.post(
            "http://localhost:8001/api/v2/deputy/chat",
            json={
                "message": "What's my name?",
                "venue_id": "00000000-0000-0000-0000-000000000001",
                "thread_id": thread_id,
                "context": {}
            }
        )
        data = response.json()
        print(f"   Response: {data.get('message')[:100]}...")
        if "John" in data.get('message', ''):
            print("   ✅ SUCCESS: Agent remembered the name!")
        else:
            print("   ❌ FAILED: Agent didn't remember the name")
        
        # 4. Ask "what??" (should understand context)
        print("\n4. Testing context understanding: 'what??'")
        response = await client.post(
            "http://localhost:8001/api/v2/deputy/chat",
            json={
                "message": "what??",
                "venue_id": "00000000-0000-0000-0000-000000000001",
                "thread_id": thread_id,
                "context": {}
            }
        )
        data = response.json()
        print(f"   Response: {data.get('message')[:100]}...")
        print(f"   Data type: {data.get('data_type')}")
        
        # Check if it called get_pending_tasks (it shouldn't in task context!)
        if data.get('data_type') == 'task_list':
            print("   ❌ ERROR: Agent called get_pending_tasks in task context!")
        else:
            print("   ✅ Good: Agent stayed in task context")

if __name__ == "__main__":
    asyncio.run(test())