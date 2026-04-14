"""AI Deputy LangGraph for conversation-driven management."""

from typing import Dict, Any, List, TypedDict, Optional
from datetime import datetime
from langgraph.graph import StateGraph, END
import json
import structlog
from openai import OpenAI

from app.config import settings
from app.database import db
from app.models.conversation import (
    ConversationState, MessageRole, ConversationType,
    QuickAction, Message
)

logger = structlog.get_logger()

# Initialize OpenRouter client
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=settings.openrouter_api_key,
)


class DeputyState(TypedDict):
    """State for AI Deputy conversation."""
    messages: List[Dict[str, Any]]
    context_type: str
    context_id: str
    current_intent: Optional[str]
    entities: Dict[str, Any]
    pending_actions: List[str]
    response: Optional[str]
    quick_actions: List[Dict[str, Any]]
    
    # Context specific
    venue_id: Optional[str]
    task_id: Optional[str]
    task_data: Optional[Dict[str, Any]]
    available_workers: List[Dict[str, Any]]
    venue_stats: Dict[str, Any]


async def load_context_node(state: DeputyState) -> DeputyState:
    """Load relevant context based on conversation type."""
    
    if state["context_type"] == "main":
        # Load venue overview
        venue_id = state["context_id"]
        
        # Get pending tasks
        pending_tasks = await db.fetch_all(
            """
            SELECT id, data, created_at 
            FROM tasks 
            WHERE venue_id = $1 AND status = 'pending'
            ORDER BY (data->>'priority')::int DESC, created_at ASC
            LIMIT 10
            """,
            venue_id
        )
        
        # Get venue statistics
        stats = await db.fetch_one(
            """
            SELECT 
                COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
                COUNT(*) FILTER (WHERE status = 'active') as active_count,
                COUNT(*) FILTER (WHERE status = 'completed' AND DATE(closed_at) = CURRENT_DATE) as completed_today
            FROM tasks
            WHERE venue_id = $1
            """,
            venue_id
        )
        
        state["venue_stats"] = stats if stats else {}
        state["venue_id"] = venue_id
        
        logger.info("main_context_loaded", 
                   venue_id=venue_id,
                   pending_tasks=len(pending_tasks))
        
    elif state["context_type"] == "task":
        # Load task specific context
        task_id = state["context_id"]
        
        task = await db.get_task(task_id)
        if task:
            state["task_data"] = task
            state["task_id"] = task_id
            state["venue_id"] = str(task["venue_id"])
            
            # Get available workers for assignment
            workers = await db.get_available_workers(
                str(task["venue_id"]),
                skills=task.get("data", {}).get("ai_analysis", {}).get("required_skills", [])
            )
            state["available_workers"] = workers
            
            logger.info("task_context_loaded",
                       task_id=task_id,
                       priority=task.get("data", {}).get("priority"))
    
    return state


async def understand_intent_node(state: DeputyState) -> DeputyState:
    """Understand user intent from natural language."""
    
    last_message = state["messages"][-1]["content"]
    context_type = state["context_type"]
    
    # Build prompt for intent recognition
    system_prompt = f"""You are an AI Deputy helping manage venue operations.
    Current context: {context_type}
    
    Analyze the user's message and identify:
    1. Intent (one of: query_status, assign_task, modify_priority, get_details, bulk_action, help)
    2. Entities (task_ids, worker_names, priorities, etc.)
    
    Respond in JSON format:
    {{
        "intent": "...",
        "entities": {{...}},
        "confidence": 0.0-1.0
    }}
    """
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": last_message}
    ]
    
    try:
        response = client.chat.completions.create(
            model=settings.openrouter_model,
            messages=messages,
            response_format={"type": "json_object"},
            temperature=0.1,
            max_tokens=200
        )
        
        import json
        result = json.loads(response.choices[0].message.content)
        
        state["current_intent"] = result.get("intent")
        state["entities"] = result.get("entities", {})
        
        logger.info("intent_understood",
                   intent=result.get("intent"),
                   confidence=result.get("confidence"))
        
    except Exception as e:
        logger.error("intent_understanding_failed", error=str(e))
        state["current_intent"] = "unknown"
        state["entities"] = {}
    
    return state


async def generate_overview_node(state: DeputyState) -> DeputyState:
    """Generate venue overview for main conversation."""
    
    stats = state.get("venue_stats", {})
    
    # Create overview message
    current_hour = datetime.now().hour
    greeting = "Good morning" if current_hour < 12 else "Good afternoon" if current_hour < 18 else "Good evening"
    
    overview = f"""{greeting}. Here's your venue status:

• **{stats.get('pending_count', 0)} pending tasks** need attention
• **{stats.get('active_count', 0)} tasks** in progress
• **{stats.get('completed_today', 0)} tasks** completed today"""
    
    # Add urgent tasks if any
    if state.get("venue_stats", {}).get("pending_count", 0) > 0:
        # Get urgent tasks from database
        urgent_tasks = await db.fetch_all(
            """
            SELECT id, data
            FROM tasks
            WHERE venue_id = $1 AND status = 'pending' AND (data->>'priority')::int >= 4
            ORDER BY (data->>'priority')::int DESC
            LIMIT 3
            """,
            state["venue_id"]
        )
        
        if urgent_tasks:
            overview += "\n\n**🚨 Urgent Issues:**"
            for task in urgent_tasks:
                task_data = json.loads(task["data"]) if isinstance(task["data"], str) else task["data"]
                overview += f"\n• {task_data.get('description', 'Issue')} ({task_data.get('location', {}).get('area', 'Unknown location')})"
            
            # Add quick actions for urgent tasks
            state["quick_actions"] = [
                {
                    "label": "View All Urgent",
                    "action": "filter_urgent",
                    "style": "primary"
                },
                {
                    "label": f"Handle #{str(urgent_tasks[0]['id'])[:8]}",
                    "action": "open_task",
                    "payload": {"task_id": str(urgent_tasks[0]["id"])},
                    "style": "danger"
                }
            ]
    
    state["response"] = overview
    return state


async def handle_task_action_node(state: DeputyState) -> DeputyState:
    """Handle actions specific to a task."""
    
    intent = state["current_intent"]
    task_data = state.get("task_data", {})
    
    if intent == "assign_task":
        # Handle task assignment
        worker_name = state["entities"].get("worker_name")
        
        if worker_name:
            # Find worker
            workers = state.get("available_workers", [])
            worker = next((w for w in workers if worker_name.lower() in w["name"].lower()), None)
            
            if worker:
                # Assign task
                success = await db.update_task_status(
                    state["task_id"],
                    "assigned",
                    assignee_id=worker["id"]
                )
                
                if success:
                    state["response"] = f"✓ Task assigned to {worker['name']}. They have been notified."
                    
                    # Log event
                    await db.create_event(
                        venue_id=state["venue_id"],
                        event_type="task_assigned",
                        target_type="task",
                        target_id=state["task_id"],
                        data={
                            "assigned_to": worker["name"],
                            "method": "natural_language"
                        }
                    )
                else:
                    state["response"] = "Failed to assign task. Please try again."
            else:
                state["response"] = f"Worker '{worker_name}' not found. Available workers: " + \
                                  ", ".join([w["name"] for w in workers[:5]])
        else:
            # Show available workers
            workers = state.get("available_workers", [])[:3]
            state["response"] = "Who should handle this task?"
            state["quick_actions"] = [
                {
                    "label": f"Assign to {w['name']}",
                    "action": "assign_worker",
                    "payload": {"worker_id": w["id"], "worker_name": w["name"]},
                    "style": "primary"
                }
                for w in workers
            ]
    
    elif intent == "get_details":
        # Provide task details
        raw_data = task_data.get("data", {})
        data = json.loads(raw_data) if isinstance(raw_data, str) else raw_data
        ai_analysis = data.get("ai_analysis", {})
        
        details = f"""**Task Details:**
        
**Issue:** {data.get('description', 'No description')}
**Location:** {data.get('location', {}).get('description', 'Unknown')}
**Priority:** {data.get('priority', 3)}/5
**Type:** {data.get('type', 'unknown')}

**AI Analysis:**
• Confidence: {ai_analysis.get('confidence', 0) * 100:.0f}%
• Estimated time: {ai_analysis.get('estimated_minutes', 30)} minutes
• Tools needed: {', '.join(ai_analysis.get('suggested_tools', ['None specified']))}

**Recommendation:** {ai_analysis.get('reasoning', 'No specific recommendation')}"""
        
        state["response"] = details
        
        # Add action buttons
        state["quick_actions"] = [
            {
                "label": "Auto-assign",
                "action": "auto_assign",
                "style": "primary"
            },
            {
                "label": "View History",
                "action": "view_history",
                "style": "secondary"
            }
        ]
    
    return state


async def generate_response_node(state: DeputyState) -> DeputyState:
    """Generate natural language response."""
    
    # If response already generated by previous node, return
    if state.get("response"):
        return state
    
    # Generate contextual response based on intent
    intent = state.get("current_intent", "unknown")
    
    if intent == "unknown":
        state["response"] = "I didn't understand that. You can ask me to:\n" \
                          "• Show task status\n" \
                          "• Assign tasks to workers\n" \
                          "• View task details\n" \
                          "• Modify priorities"
    else:
        # Generate appropriate response based on context
        state["response"] = f"Processing your request: {intent}"
    
    return state


def create_main_deputy_graph():
    """Create the main Deputy conversation graph."""
    
    graph = StateGraph(DeputyState)
    
    # Add nodes
    graph.add_node("load_context", load_context_node)
    graph.add_node("understand_intent", understand_intent_node)
    graph.add_node("generate_overview", generate_overview_node)
    graph.add_node("generate_response", generate_response_node)
    
    # Add edges
    graph.add_edge("load_context", "understand_intent")
    
    # Conditional routing based on intent
    def route_by_intent(state):
        intent = state.get("current_intent")
        if intent in ["query_status", None]:
            return "generate_overview"
        else:
            return "generate_response"
    
    graph.add_conditional_edges(
        "understand_intent",
        route_by_intent,
        {
            "generate_overview": "generate_overview",
            "generate_response": "generate_response"
        }
    )
    
    graph.add_edge("generate_overview", END)
    graph.add_edge("generate_response", END)
    
    # Set entry point
    graph.set_entry_point("load_context")
    
    return graph.compile()


def create_task_deputy_graph():
    """Create the task-specific Deputy conversation graph."""
    
    graph = StateGraph(DeputyState)
    
    # Add nodes
    graph.add_node("load_context", load_context_node)
    graph.add_node("understand_intent", understand_intent_node)
    graph.add_node("handle_task_action", handle_task_action_node)
    graph.add_node("generate_response", generate_response_node)
    
    # Add edges
    graph.add_edge("load_context", "understand_intent")
    graph.add_edge("understand_intent", "handle_task_action")
    graph.add_edge("handle_task_action", "generate_response")
    graph.add_edge("generate_response", END)
    
    # Set entry point
    graph.set_entry_point("load_context")
    
    return graph.compile()


# Create compiled graphs
main_deputy = create_main_deputy_graph()
task_deputy = create_task_deputy_graph()