"""AI Deputy API endpoints for conversation-driven management."""

from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, Optional
import uuid
import json
from datetime import datetime
import structlog

from app.models.conversation import (
    ChatRequest, ChatResponse, ConversationType,
    Message, MessageRole, QuickAction
)
from app.graphs.deputy_graph import main_deputy, task_deputy
from app.database import db

router = APIRouter(prefix="/api/deputy", tags=["AI Deputy"])
logger = structlog.get_logger()

# In-memory conversation storage (use Redis in production)
conversation_cache = {}


@router.post("/chat")
async def chat_with_deputy(request: ChatRequest):
    """
    Chat with AI Deputy in main or task context.
    
    This endpoint handles natural language interactions with the AI Deputy,
    maintaining separate contexts for main overview and task-specific conversations.
    """
    try:
        # Determine which graph to use
        if request.context_type == ConversationType.MAIN:
            graph = main_deputy
        else:
            graph = task_deputy
        
        # Get or create conversation context
        cache_key = f"{request.context_type}:{request.context_id}"
        if cache_key not in conversation_cache:
            conversation_cache[cache_key] = {
                "messages": [],
                "created_at": datetime.utcnow(),
                "state": {}
            }
        
        conversation = conversation_cache[cache_key]
        
        # Add user message to history
        conversation["messages"].append({
            "role": "user",
            "content": request.message,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        # Prepare state for LangGraph
        state = {
            "messages": conversation["messages"],
            "context_type": request.context_type.value,
            "context_id": request.context_id,
            "current_intent": None,
            "entities": {},
            "pending_actions": [],
            "response": None,
            "quick_actions": [],
            "venue_id": None,
            "task_id": None,
            "task_data": None,
            "available_workers": [],
            "venue_stats": {}
        }
        
        # Run the graph
        result = await graph.ainvoke(state)
        
        # Extract response
        response_text = result.get("response", "I'm processing your request...")
        quick_actions = [
            QuickAction(**action) for action in result.get("quick_actions", [])
        ]
        
        # Add assistant response to history
        conversation["messages"].append({
            "role": "assistant",
            "content": response_text,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        # Update conversation state
        conversation["state"] = {
            "current_intent": result.get("current_intent"),
            "entities": result.get("entities"),
            "venue_stats": result.get("venue_stats")
        }
        conversation["updated_at"] = datetime.utcnow()
        
        logger.info("deputy_chat_processed",
                   context_type=request.context_type,
                   context_id=request.context_id,
                   intent=result.get("current_intent"))
        
        return ChatResponse(
            message=response_text,
            quick_actions=quick_actions,
            metadata={
                "intent": result.get("current_intent"),
                "confidence": result.get("entities", {}).get("confidence", 1.0)
            }
        )
        
    except Exception as e:
        logger.error("deputy_chat_error", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/overview/{venue_id}")
async def get_venue_overview(venue_id: str):
    """
    Get initial venue overview for AI Deputy.
    
    This is called when manager opens the AI Deputy interface.
    """
    try:
        logger.info("get_venue_overview", venue_id=venue_id, venue_id_type=type(venue_id).__name__)
        
        # Get venue statistics
        stats = await db.fetch_one(
            """
            SELECT 
                COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
                COUNT(*) FILTER (WHERE status = 'active') as active_count,
                COUNT(*) FILTER (WHERE status = 'completed' AND DATE(closed_at) = CURRENT_DATE) as completed_today,
                COUNT(*) FILTER (WHERE (data->>'priority')::int >= 4 AND status = 'pending') as urgent_count
            FROM tasks
            WHERE venue_id = $1
            """,
            venue_id
        )
        
        # Get recent urgent tasks
        urgent_tasks = await db.fetch_all(
            """
            SELECT id, data, created_at
            FROM tasks
            WHERE venue_id = $1 
                AND status = 'pending' 
                AND (data->>'priority')::int >= 4
            ORDER BY (data->>'priority')::int DESC, created_at ASC
            LIMIT 3
            """,
            venue_id
        )
        
        # Generate greeting based on time
        current_hour = datetime.now().hour
        greeting = "Good morning" if current_hour < 12 else \
                  "Good afternoon" if current_hour < 18 else "Good evening"
        
        # Build overview message
        overview = f"{greeting}. "
        
        if stats:
            logger.info("stats_type", stats_type=type(stats).__name__, stats=stats)
            
            if stats.get("urgent_count", 0) > 0:
                overview += f"You have **{stats['urgent_count']} urgent issues** that need immediate attention. "
            
            overview += f"There are {stats.get('pending_count', 0)} pending tasks, " \
                       f"{stats.get('active_count', 0)} in progress, and " \
                       f"{stats.get('completed_today', 0)} completed today."
            
            # Add urgent task details
            if urgent_tasks:
                overview += "\n\n**🚨 Urgent Issues:**"
                for task in urgent_tasks:
                    data = json.loads(task["data"]) if isinstance(task["data"], str) else task["data"]
                    overview += f"\n• {data.get('description', 'Issue')} " \
                              f"in {data.get('location', {}).get('area', 'unknown location')}"
        else:
            overview += "All systems operational. No pending tasks."
        
        # Create quick actions
        quick_actions = []
        if urgent_tasks:
            quick_actions.append(
                QuickAction(
                    label="Handle Urgent Tasks",
                    action="filter_urgent",
                    style="danger"
                )
            )
        
        quick_actions.append(
            QuickAction(
                label="View All Tasks",
                action="view_all_tasks",
                style="secondary"
            )
        )
        
        return ChatResponse(
            message=overview,
            quick_actions=quick_actions,
            metadata={
                "stats": stats if stats else {},
                "urgent_count": len(urgent_tasks)
            }
        )
        
    except Exception as e:
        logger.error("overview_error", venue_id=venue_id, error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/task/{task_id}/context")
async def get_task_context(task_id: str):
    """
    Get initial context when entering a task conversation.
    """
    try:
        # Get task details
        task = await db.get_task(task_id)
        
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        data = json.loads(task.get("data")) if isinstance(task.get("data"), str) else task.get("data", {})
        ai_analysis = data.get("ai_analysis", {})
        
        # Build task overview
        overview = f"""**Task #{task_id[:8]}**
        
**Issue:** {data.get('description', 'No description')}
**Location:** {data.get('location', {}).get('description', 'Unknown')}
**Priority:** {'🔴' if data.get('priority', 3) >= 4 else '🟡' if data.get('priority', 3) >= 3 else '🟢'} {data.get('priority', 3)}/5
**Status:** {task.get('status', 'pending')}
**Reported:** {task.get('created_at', 'Unknown time')}

**AI Analysis:**
• **Type:** {data.get('issue_type', 'unknown')}
• **Confidence:** {ai_analysis.get('confidence', 0) * 100:.0f}%
• **Est. Time:** {ai_analysis.get('estimated_minutes', 30)} minutes
• **Tools:** {', '.join(ai_analysis.get('suggested_tools', ['None specified']))}

{ai_analysis.get('reasoning', '')}"""
        
        # Create actions based on task status
        quick_actions = []
        
        if task.get("status") == "pending":
            # Get available workers
            workers = await db.get_available_workers(
                str(task["venue_id"]),
                skills=ai_analysis.get("required_skills", [])
            )
            
            if workers:
                for worker in workers[:3]:
                    quick_actions.append(
                        QuickAction(
                            label=f"Assign to {worker['name']}",
                            action="assign_worker",
                            payload={"worker_id": str(worker["id"]), "worker_name": worker["name"]},
                            style="primary"
                        )
                    )
        
        quick_actions.append(
            QuickAction(
                label="View History",
                action="view_history",
                style="secondary"
            )
        )
        
        return ChatResponse(
            message=overview,
            quick_actions=quick_actions,
            metadata={
                "task_id": task_id,
                "status": task.get("status"),
                "priority": data.get("priority")
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("task_context_error", task_id=task_id, error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/action")
async def execute_quick_action(action: Dict[str, Any]):
    """
    Execute a quick action from the chat interface.
    
    Quick actions are pre-defined operations that can be triggered
    with a single click instead of typing commands.
    """
    try:
        action_type = action.get("action")
        payload = action.get("payload", {})
        
        if action_type == "assign_worker":
            # Assign task to worker
            task_id = payload.get("task_id")
            worker_id = payload.get("worker_id")
            worker_name = payload.get("worker_name")
            
            success = await db.update_task_status(
                task_id,
                "assigned",
                assignee_id=worker_id
            )
            
            if success:
                await db.create_event(
                    venue_id=payload.get("venue_id"),
                    event_type="task_assigned",
                    target_type="task",
                    target_id=task_id,
                    data={
                        "assigned_to": worker_name,
                        "method": "quick_action"
                    }
                )
                
                return {
                    "success": True,
                    "message": f"Task assigned to {worker_name}"
                }
            else:
                return {
                    "success": False,
                    "message": "Failed to assign task"
                }
        
        elif action_type == "filter_urgent":
            # Return list of urgent tasks
            venue_id = payload.get("venue_id")
            urgent_tasks = await db.fetch_all(
                """
                SELECT id, data, created_at
                FROM tasks
                WHERE venue_id = $1 
                    AND status = 'pending' 
                    AND (data->>'priority')::int >= 4
                ORDER BY (data->>'priority')::int DESC
                """,
                venue_id
            )
            
            return {
                "success": True,
                "data": urgent_tasks,
                "message": f"Found {len(urgent_tasks)} urgent tasks"
            }
        
        else:
            return {
                "success": False,
                "message": f"Unknown action: {action_type}"
            }
            
    except Exception as e:
        logger.error("action_execution_error", action=action, error=str(e))
        return {
            "success": False,
            "message": str(e)
        }