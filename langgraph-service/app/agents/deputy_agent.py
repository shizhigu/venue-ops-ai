"""AI Deputy ReAct Agent with Tools for Venue Management."""

from typing import Dict, Any, List, Optional, Literal
from datetime import datetime
import json
from langchain_core.tools import tool
from langchain_core.messages import HumanMessage, AIMessage, ToolMessage
from langgraph.prebuilt import create_react_agent
from openai import OpenAI
import structlog

from app.config import settings
from app.database import db

logger = structlog.get_logger()

# Initialize OpenRouter client
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=settings.openrouter_api_key,
)

# Define response types for frontend rendering
ResponseType = Literal[
    "text",           # Plain text message
    "task_list",      # List of tasks
    "task_detail",    # Single task with details
    "statistics",     # Venue statistics
    "worker_list",    # Available workers
    "confirmation",   # Requires human confirmation
    "emergency",      # Emergency alert
]

class StructuredResponse:
    """Structured response format for frontend."""
    
    def __init__(
        self,
        message: str,
        data: Optional[Dict[str, Any]] = None,
        data_type: Optional[ResponseType] = "text",
        actions: Optional[List[Dict[str, Any]]] = None,
        requires_confirmation: bool = False,
        confirmation_context: Optional[Dict[str, Any]] = None
    ):
        self.message = message
        self.data = data
        self.data_type = data_type
        self.actions = actions or []
        self.requires_confirmation = requires_confirmation
        self.confirmation_context = confirmation_context
    
    def to_dict(self):
        return {
            "message": self.message,
            "data": self.data,
            "data_type": self.data_type,
            "actions": self.actions,
            "requires_confirmation": self.requires_confirmation,
            "confirmation_context": self.confirmation_context
        }


# ============= TOOLS DEFINITION =============

@tool
async def get_pending_tasks(
    venue_id: str,
    priority_filter: Optional[int] = None,
    limit: int = 10
) -> Dict[str, Any]:
    """
    Get pending tasks for a venue.
    
    Args:
        venue_id: The venue ID
        priority_filter: Optional minimum priority filter (1-5)
        limit: Maximum number of tasks to return
    
    Returns:
        Structured task list data for frontend rendering
    """
    try:
        # Ensure database is connected
        if not db.pool:
            await db.connect()
            
        query = """
            SELECT id, data, status, created_at
            FROM tasks
            WHERE venue_id = $1 AND status IN ('pending', 'active')
        """
        params = [venue_id]
        
        if priority_filter:
            query += " AND (data->>'priority')::int >= $2"
            params.append(priority_filter)
        
        query += " ORDER BY (data->>'priority')::int DESC, created_at ASC LIMIT $" + str(len(params) + 1)
        params.append(limit)
        
        tasks = await db.fetch_all(query, *params)
        
        # Parse task data
        parsed_tasks = []
        for task in tasks:
            task_data = json.loads(task["data"]) if isinstance(task["data"], str) else task["data"]
            parsed_tasks.append({
                "id": str(task["id"]),
                "status": task["status"],
                "created_at": task["created_at"].isoformat() if task["created_at"] else None,
                "description": task_data.get("description", "No description"),
                "priority": task_data.get("priority", 3),
                "location": task_data.get("location", {}),
                "type": task_data.get("issue_type", "unknown"),
                "estimated_time": task_data.get("ai_analysis", {}).get("estimated_minutes", 30)
            })
        
        # Generate quick actions for each task
        actions = []
        for task in parsed_tasks[:3]:  # Top 3 tasks
            if task["priority"] >= 4:
                actions.append({
                    "label": f"Handle {task['type']} issue",
                    "action": "open_task",
                    "payload": {
                        "task_id": task["id"],
                        "task_type": task['type']
                    },
                    "style": "danger" if task["priority"] == 5 else "primary"
                })
        
        return StructuredResponse(
            message=f"Found {len(parsed_tasks)} pending tasks",
            data={"tasks": parsed_tasks, "total": len(parsed_tasks)},
            data_type="task_list",
            actions=actions
        ).to_dict()
        
    except Exception as e:
        logger.error("get_pending_tasks_error", error=str(e))
        return StructuredResponse(
            message=f"Error fetching tasks: {str(e)}",
            data_type="text"
        ).to_dict()


@tool
async def get_task_details(task_id: str) -> Dict[str, Any]:
    """
    Get detailed information about a specific task.
    
    Args:
        task_id: The task ID
    
    Returns:
        Detailed task information with available actions
    """
    try:
        # Ensure database is connected
        if not db.pool:
            await db.connect()
            
        task = await db.get_task(task_id)
        
        if not task:
            return StructuredResponse(
                message=f"Task {task_id} not found",
                data_type="text"
            ).to_dict()
        
        data = json.loads(task["data"]) if isinstance(task["data"], str) else task["data"]
        ai_analysis = data.get("ai_analysis", {})
        
        # Get available workers for this task
        workers = await db.get_available_workers(
            str(task["venue_id"]),
            skills=ai_analysis.get("required_skills", [])
        )
        
        # Create actions based on task status
        actions = []
        if task["status"] == "pending":
            for worker in workers[:3]:
                actions.append({
                    "label": f"Assign to {worker['name']}",
                    "action": "assign_worker",
                    "payload": {
                        "task_id": task_id,
                        "worker_id": str(worker["id"]),
                        "worker_name": worker["name"]
                    },
                    "style": "primary"
                })
            
            if data.get("priority", 3) >= 4:
                actions.append({
                    "label": "Mark as Emergency",
                    "action": "escalate_emergency",
                    "payload": {"task_id": task_id},
                    "style": "danger"
                })
        
        task_detail = {
            "id": str(task["id"]),
            "status": task["status"],
            "created_at": task["created_at"].isoformat() if task["created_at"] else None,
            "description": data.get("description"),
            "priority": data.get("priority", 3),
            "location": data.get("location", {}),
            "type": data.get("issue_type", "unknown"),
            "ai_analysis": ai_analysis,
            "images": data.get("images", []),
            "audio_description": data.get("audio_description"),
            "available_workers": [
                {"id": str(w["id"]), "name": w["name"], "skills": w.get("skills", [])}
                for w in workers
            ]
        }
        
        return StructuredResponse(
            message=f"Task details for {data.get('issue_type', 'issue')} in {data.get('location', {}).get('area', 'unknown location')}",
            data=task_detail,
            data_type="task_detail",
            actions=actions
        ).to_dict()
        
    except Exception as e:
        logger.error("get_task_details_error", task_id=task_id, error=str(e))
        return StructuredResponse(
            message=f"Error fetching task details: {str(e)}",
            data_type="text"
        ).to_dict()


@tool
async def assign_task_to_worker(
    task_id: str,
    worker_id: str,
    require_confirmation: bool = True
) -> Dict[str, Any]:
    """
    Assign a task to a worker.
    
    Args:
        task_id: The task ID
        worker_id: The worker ID
        require_confirmation: Whether to require human confirmation
    
    Returns:
        Assignment result or confirmation request
    """
    try:
        # Ensure database is connected
        if not db.pool:
            await db.connect()
            
        # Get task and worker details
        task = await db.get_task(task_id)
        worker = await db.fetch_one(
            "SELECT * FROM users WHERE id = $1",
            worker_id
        )
        
        if not task or not worker:
            return StructuredResponse(
                message="Task or worker not found",
                data_type="text"
            ).to_dict()
        
        task_data = json.loads(task["data"]) if isinstance(task["data"], str) else task["data"]
        
        # Check if confirmation is required for high-priority tasks
        if require_confirmation and task_data.get("priority", 3) >= 4:
            return StructuredResponse(
                message=f"Please confirm: Assign urgent {task_data.get('issue_type', 'task')} to {worker['name']}?",
                data_type="confirmation",
                requires_confirmation=True,
                confirmation_context={
                    "action": "confirm_assignment",
                    "task_id": task_id,
                    "worker_id": worker_id,
                    "task_description": task_data.get("description"),
                    "worker_name": worker["name"],
                    "priority": task_data.get("priority")
                },
                actions=[
                    {
                        "label": "Confirm Assignment",
                        "action": "confirm",
                        "style": "primary"
                    },
                    {
                        "label": "Cancel",
                        "action": "cancel",
                        "style": "secondary"
                    }
                ]
            ).to_dict()
        
        # Perform assignment
        success = await db.update_task_status(
            task_id,
            "assigned",
            assignee_id=worker_id
        )
        
        if success:
            # Log event
            await db.create_event(
                venue_id=str(task["venue_id"]),
                event_type="task_assigned",
                target_type="task",
                target_id=task_id,
                data={
                    "assigned_to": worker["name"],
                    "assigned_by": "AI Deputy",
                    "priority": task_data.get("priority")
                }
            )
            
            return StructuredResponse(
                message=f"✓ Task assigned to {worker['name']}. They have been notified.",
                data={"task_id": task_id, "worker_id": worker_id},
                data_type="text"
            ).to_dict()
        else:
            return StructuredResponse(
                message="Failed to assign task",
                data_type="text"
            ).to_dict()
            
    except Exception as e:
        logger.error("assign_task_error", error=str(e))
        return StructuredResponse(
            message=f"Error assigning task: {str(e)}",
            data_type="text"
        ).to_dict()


@tool
async def get_venue_statistics(venue_id: str) -> Dict[str, Any]:
    """
    Get venue statistics and overview.
    
    Args:
        venue_id: The venue ID
    
    Returns:
        Venue statistics for dashboard display
    """
    try:
        # Ensure database is connected
        if not db.pool:
            await db.connect()
            
        stats = await db.fetch_one(
            """
            SELECT 
                COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
                COUNT(*) FILTER (WHERE status = 'active') as active_count,
                COUNT(*) FILTER (WHERE status = 'completed' AND DATE(closed_at) = CURRENT_DATE) as completed_today,
                COUNT(*) FILTER (WHERE (data->>'priority')::int >= 4 AND status IN ('pending', 'active')) as urgent_count,
                AVG(CASE 
                    WHEN status = 'completed' AND closed_at IS NOT NULL AND created_at IS NOT NULL
                    THEN EXTRACT(EPOCH FROM (closed_at - created_at))/60
                    ELSE NULL
                END) as avg_resolution_time
            FROM tasks
            WHERE venue_id = $1
            """,
            venue_id
        )
        
        # Get worker statistics
        workers = await db.fetch_all(
            """
            SELECT u.*, 
                COUNT(t.id) as active_tasks
            FROM users u
            LEFT JOIN tasks t ON t.assignee_id = u.id AND t.status = 'active'
            WHERE u.venue_id = $1 AND u.role = 'worker'
            GROUP BY u.id
            """,
            venue_id
        )
        
        available_workers = sum(1 for w in workers if w["active_tasks"] == 0)
        
        statistics = {
            "tasks": {
                "pending": stats["pending_count"] if stats else 0,
                "active": stats["active_count"] if stats else 0,
                "completed_today": stats["completed_today"] if stats else 0,
                "urgent": stats["urgent_count"] if stats else 0
            },
            "workers": {
                "total": len(workers),
                "available": available_workers,
                "busy": len(workers) - available_workers
            },
            "performance": {
                "avg_resolution_time": round(stats["avg_resolution_time"], 1) if stats and stats["avg_resolution_time"] else None,
                "completion_rate": round((stats["completed_today"] / (stats["completed_today"] + stats["pending_count"]) * 100), 1) if stats and stats["completed_today"] + stats["pending_count"] > 0 else 0
            }
        }
        
        # Generate insights
        insights = []
        if stats and stats["urgent_count"] > 0:
            insights.append(f"⚠️ {stats['urgent_count']} urgent issues need immediate attention")
        if available_workers == 0:
            insights.append("📍 All workers are currently busy")
        if stats and stats["avg_resolution_time"] and stats["avg_resolution_time"] > 60:
            insights.append(f"⏱️ Average resolution time is {round(stats['avg_resolution_time']/60, 1)} hours")
        
        return StructuredResponse(
            message="Venue statistics overview",
            data=statistics,
            data_type="statistics",
            actions=[
                {
                    "label": "View Urgent Tasks",
                    "action": "filter_urgent",
                    "style": "danger" if stats and stats["urgent_count"] > 0 else "secondary"
                },
                {
                    "label": "View All Tasks",
                    "action": "view_all_tasks",
                    "style": "primary"
                }
            ]
        ).to_dict()
        
    except Exception as e:
        logger.error("get_statistics_error", error=str(e))
        return StructuredResponse(
            message=f"Error fetching statistics: {str(e)}",
            data_type="text"
        ).to_dict()


@tool
async def escalate_to_emergency(
    task_id: str,
    reason: str,
    require_confirmation: bool = True
) -> Dict[str, Any]:
    """
    Escalate a task to emergency status.
    
    Args:
        task_id: The task ID
        reason: Reason for escalation
        require_confirmation: Whether to require human confirmation
    
    Returns:
        Escalation result or confirmation request
    """
    if require_confirmation:
        return StructuredResponse(
            message=f"⚠️ Confirm emergency escalation: {reason}",
            data_type="confirmation",
            requires_confirmation=True,
            confirmation_context={
                "action": "confirm_emergency",
                "task_id": task_id,
                "reason": reason
            },
            actions=[
                {
                    "label": "Confirm Emergency",
                    "action": "confirm",
                    "style": "danger"
                },
                {
                    "label": "Cancel",
                    "action": "cancel",
                    "style": "secondary"
                }
            ]
        ).to_dict()
    
    # Execute emergency protocol
    # ... implementation ...
    
    return StructuredResponse(
        message="🚨 Emergency protocol activated",
        data_type="emergency",
        data={"task_id": task_id, "reason": reason}
    ).to_dict()


# ============= AGENT CREATION =============

def create_deputy_agent():
    """Create the AI Deputy ReAct agent with tools and memory."""
    
    tools = [
        get_pending_tasks,
        get_task_details,
        assign_task_to_worker,
        get_venue_statistics,
        escalate_to_emergency,
    ]
    
    system_prompt = """You are an AI Deputy - a conversational assistant for venue operations.

🚨 CRITICAL: DEFAULT TO NO TOOLS 🚨
Unless the user EXPLICITLY asks for specific data, DO NOT call any tools.

NEVER CALL TOOLS FOR THESE MESSAGES:
❌ "what's up" / "what up" / "sup" -> These are greetings! Reply: "Hey there! How can I help you?"
❌ "hello" / "hi" / "hey" -> Greetings. Reply conversationally.
❌ "my name is..." -> Just acknowledge: "Nice to meet you, [name]!"
❌ "thanks" / "ok" / "got it" -> Just acknowledge
❌ Any casual conversation -> Just chat naturally

ONLY CALL TOOLS WHEN USER EXPLICITLY ASKS:
✅ "show me the task details" -> Call get_task_details
✅ "get pending tasks" -> Call get_pending_tasks  
✅ "assign this to worker X" -> Call assign_task_to_worker
✅ "what are the venue statistics" -> Call get_venue_statistics

TASK MODE (messages with [Task context:]):
- You're discussing a SPECIFIC task that's already been loaded
- If you see [Task context: task-id], assume the task details are already known
- DO NOT call get_task_details unless user EXPLICITLY asks "show me the details"
- Just have a conversation about the task
- "what's up" in task context is STILL just a greeting, not asking for task info!

REMEMBER: When in doubt, DON'T call tools. Just have a conversation."""
    
    # Create agent using LangGraph with persistence
    from langgraph.prebuilt import create_react_agent
    from langchain_openai import ChatOpenAI
    from langgraph.checkpoint.memory import InMemorySaver
    
    llm = ChatOpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=settings.openrouter_api_key,
        model=settings.openrouter_model,
        temperature=0.3
    ).bind(system=system_prompt)
    
    # Create checkpointer for conversation memory
    checkpointer = InMemorySaver()
    
    agent = create_react_agent(
        model=llm,
        tools=tools,
        checkpointer=checkpointer  # Enable conversation persistence
    )
    
    return agent


# Create singleton agent instance
deputy_agent = create_deputy_agent()