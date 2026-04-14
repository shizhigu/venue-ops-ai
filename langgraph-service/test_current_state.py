#!/usr/bin/env python3
"""Test what the backend actually returns."""

import asyncio
import json
import httpx

async def test():
    async with httpx.AsyncClient(timeout=30.0) as client:
        task_id = "8529fd34-6477-4f1d-a50e-8f27311bac34"  # A real task ID
        thread_id = f"venue:00000000-0000-0000-0000-000000000001:task:{task_id}"
        
        # 1. Initial task context
        print("1. Initial task message:")
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
        print(f"  message: {data.get('message')[:50]}...")
        
        # 2. Conversational message
        print("\n2. Conversational message 'what's up':")
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
        
        # 3. Another conversational message
        print("\n3. Conversational message 'my name is john':")
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