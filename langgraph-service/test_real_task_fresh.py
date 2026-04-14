#!/usr/bin/env python3
"""Test with real task but fresh conversation."""

import asyncio
import json
import httpx
import uuid

async def test():
    async with httpx.AsyncClient(timeout=30.0) as client:
        task_id = "8529fd34-6477-4f1d-a50e-8f27311bac34"  # Real task
        # Use a fresh thread ID to avoid cached conversation
        thread_id = f"venue:00000000-0000-0000-0000-000000000001:task:{task_id}:fresh:{uuid.uuid4()}"
        
        print("Testing with fresh thread for real task:", task_id)
        print()
        
        # First message should fetch task details
        print("1. Initial task context message:")
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
        print(f"  data_type: {data.get('data_type')}")
        print(f"  message: {data.get('message')[:100]}...")
        print()
        
        # Now test conversational messages
        print("2. Conversational 'what's up':")
        response = await client.post(
            "http://localhost:8001/api/v2/deputy/chat",
            json={
                "message": "what's up",
                "venue_id": "00000000-0000-0000-0000-000000000001",
                "thread_id": thread_id,
                "context": {}
            }
        )
        data = response.json()
        print(f"  data_type: {data.get('data_type')}")
        print(f"  message: {data.get('message')[:100]}...")
        print()
        
        print("3. Conversational 'my name is john':")
        response = await client.post(
            "http://localhost:8001/api/v2/deputy/chat",
            json={
                "message": "my name is john",
                "venue_id": "00000000-0000-0000-0000-000000000001",
                "thread_id": thread_id,
                "context": {}
            }
        )
        data = response.json()
        print(f"  data_type: {data.get('data_type')}")
        print(f"  message: {data.get('message')[:100]}...")

if __name__ == "__main__":
    asyncio.run(test())