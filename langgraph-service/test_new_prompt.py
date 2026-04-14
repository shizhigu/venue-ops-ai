#!/usr/bin/env python3
"""Test with new prompt and fresh thread."""

import asyncio
import httpx
import uuid

async def test():
    async with httpx.AsyncClient(timeout=30.0) as client:
        task_id = "8529fd34-6477-4f1d-a50e-8f27311bac34"
        # Completely fresh thread
        thread_id = f"venue:00000000-0000-0000-0000-000000000001:task:{task_id}:new:{uuid.uuid4()}"
        
        print("Testing with new prompt, fresh thread:", thread_id[-8:])
        print()
        
        # Test greeting first
        print("1. Testing greeting 'what's up':")
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
        print(f"  message: {data.get('message')}")
        print()

if __name__ == "__main__":
    asyncio.run(test())