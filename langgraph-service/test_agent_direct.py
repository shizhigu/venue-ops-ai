#!/usr/bin/env python3
"""Test agent directly to see its behavior."""

import asyncio
from app.agents.deputy_agent import deputy_agent

async def test():
    task_id = "8529fd34-6477-4f1d-a50e-8f27311bac34"
    thread_id = f"venue:00000000-0000-0000-0000-000000000001:task:{task_id}:direct"
    config = {"configurable": {"thread_id": thread_id}}
    
    print("=" * 60)
    print("Testing: 'what's up' (should be conversational)")
    print("=" * 60)
    
    # Send greeting - should NOT call tools
    result = await deputy_agent.ainvoke(
        {"messages": [{"role": "user", "content": "[Task context: 8529fd34-6477-4f1d-a50e-8f27311bac34] what's up"}]},
        config=config
    )
    
    messages = result["messages"]
    last_msg = messages[-1]
    
    # Check if tools were called
    has_tool_call = False
    for msg in messages:
        if hasattr(msg, 'tool_calls') and msg.tool_calls:
            has_tool_call = True
            print(f"❌ TOOL CALLED: {msg.tool_calls[0]['name']}")
            break
    
    if not has_tool_call:
        print("✅ No tools called - good!")
    
    print(f"\nAgent response: {str(last_msg.content)[:200]}...")
    
    print("\n" + "=" * 60)
    print("Testing: 'my name is john' (should be conversational)")
    print("=" * 60)
    
    # Send name - should NOT call tools
    result2 = await deputy_agent.ainvoke(
        {"messages": [{"role": "user", "content": "[Task context: 8529fd34-6477-4f1d-a50e-8f27311bac34] my name is john"}]},
        config=config
    )
    
    messages2 = result2["messages"]
    
    # Check only new messages for tool calls
    new_msgs = messages2[len(messages):]
    has_tool_call = False
    for msg in new_msgs:
        if hasattr(msg, 'tool_calls') and msg.tool_calls:
            has_tool_call = True
            print(f"❌ TOOL CALLED: {msg.tool_calls[0]['name']}")
            break
    
    if not has_tool_call:
        print("✅ No tools called - good!")
        
    last_msg2 = messages2[-1]
    print(f"\nAgent response: {str(last_msg2.content)[:200]}...")

if __name__ == "__main__":
    asyncio.run(test())