#!/usr/bin/env python3
"""Test script to debug tool response structure."""

import asyncio
import json
from app.agents.deputy_agent import deputy_agent

async def test_tool_response():
    """Test what the agent actually returns when calling tools."""
    
    print("\n=== Testing Tool Response Structure ===\n")
    
    # Test with a message that should trigger tool use
    config = {"configurable": {"thread_id": "test_debug"}}
    
    result = await deputy_agent.ainvoke(
        {"messages": [{"role": "user", "content": "Show me pending tasks (venue_id: 00000000-0000-0000-0000-000000000001)"}]},
        config=config
    )
    
    print(f"Number of messages returned: {len(result['messages'])}")
    print("\nMessage types and content:")
    
    for i, msg in enumerate(result["messages"]):
        print(f"\n{i}. Type: {type(msg).__name__}")
        
        if hasattr(msg, 'content'):
            content_preview = str(msg.content)[:200]
            print(f"   Content: {content_preview}")
        
        if hasattr(msg, 'tool_calls'):
            print(f"   Has tool_calls: {msg.tool_calls}")
        
        if hasattr(msg, 'name'):
            print(f"   Tool name: {msg.name}")
        
        # Try to parse as JSON if it's a string
        if hasattr(msg, 'content') and isinstance(msg.content, str):
            try:
                parsed = json.loads(msg.content)
                if isinstance(parsed, dict):
                    print(f"   Parsed JSON keys: {list(parsed.keys())}")
                    if 'data_type' in parsed:
                        print(f"   data_type: {parsed['data_type']}")
            except:
                pass
    
    print("\n=== End Test ===\n")

if __name__ == "__main__":
    asyncio.run(test_tool_response())