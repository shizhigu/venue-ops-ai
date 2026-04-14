#!/usr/bin/env python3
"""Test a fresh conversation to see if agent is conversational."""

import asyncio
import json
import httpx
import uuid

async def test():
    async with httpx.AsyncClient(timeout=30.0) as client:
        # Use a fresh thread ID to avoid any cached history
        task_id = str(uuid.uuid4())
        thread_id = f"venue:test:task:{task_id}"
        
        print("Testing with fresh thread ID:", thread_id)
        print()
        
        # Test conversational message
        print("1. Testing 'what's up':")
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
        print(f"  message: {data.get('message')[:200]}...")
        print()
        
        # Test another conversational message
        print("2. Testing 'my name is john':")
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
        print(f"  message: {data.get('message')[:200]}...")
        print()
        
        # Test memory
        print("3. Testing 'what's my name?':")
        response = await client.post(
            "http://localhost:8001/api/v2/deputy/chat",
            json={
                "message": "what's my name?",
                "venue_id": "00000000-0000-0000-0000-000000000001",
                "thread_id": thread_id,
                "context": {}
            }
        )
        data = response.json()
        print(f"  data_type: {data.get('data_type')}")
        print(f"  message: {data.get('message')[:200]}...")

if __name__ == "__main__":
    asyncio.run(test())