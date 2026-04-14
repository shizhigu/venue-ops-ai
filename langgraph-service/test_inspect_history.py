#!/usr/bin/env python3
"""Inspect the actual message history."""

import asyncio
from langgraph.checkpoint.memory import InMemorySaver
from langchain_openai import ChatOpenAI
from langgraph.prebuilt import create_react_agent
from app.config import settings
from app.agents.deputy_agent import deputy_agent

async def test():
    task_id = "8529fd34-6477-4f1d-a50e-8f27311bac34"
    thread_id = f"venue:00000000-0000-0000-0000-000000000001:task:{task_id}"
    config = {"configurable": {"thread_id": thread_id}}
    
    # Send a simple message
    result = await deputy_agent.ainvoke(
        {"messages": [{"role": "user", "content": "[Task context: 8529fd34-6477-4f1d-a50e-8f27311bac34] what's up"}]},
        config=config
    )
    
    print("=" * 60)
    print("MESSAGE HISTORY AFTER 'what's up':")
    print("=" * 60)
    
    messages = result["messages"]
    for i, msg in enumerate(messages):
        print(f"\n[{i}] {msg.__class__.__name__}:")
        if hasattr(msg, 'content'):
            content = str(msg.content)
            if len(content) > 200:
                print(f"    {content[:200]}...")
            else:
                print(f"    {content}")
        if hasattr(msg, 'tool_calls') and msg.tool_calls:
            print(f"    Tool calls: {msg.tool_calls}")
            
    print("\n" + "=" * 60)
    print(f"Total messages: {len(messages)}")
    
    # Check what happens with another message
    result2 = await deputy_agent.ainvoke(
        {"messages": [{"role": "user", "content": "[Task context: 8529fd34-6477-4f1d-a50e-8f27311bac34] my name is john"}]},
        config=config
    )
    
    print("\n" + "=" * 60)
    print("MESSAGE HISTORY AFTER 'my name is john':")
    print("=" * 60)
    
    messages2 = result2["messages"]
    print(f"Total messages now: {len(messages2)}")
    
    # Show only new messages
    if len(messages2) > len(messages):
        print("\nNEW MESSAGES:")
        for i in range(len(messages), len(messages2)):
            msg = messages2[i]
            print(f"\n[{i}] {msg.__class__.__name__}:")
            if hasattr(msg, 'content'):
                content = str(msg.content)
                if len(content) > 200:
                    print(f"    {content[:200]}...")
                else:
                    print(f"    {content}")

if __name__ == "__main__":
    asyncio.run(test())