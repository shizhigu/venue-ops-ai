"""Task-related API endpoints with step-by-step workflow."""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional, List, Dict, Any
import json
import uuid
from datetime import datetime
import structlog

from app.nodes.capture_node import capture_node
from app.nodes.analysis_node import analysis_node
from app.database import db

router = APIRouter(prefix="/api/tasks", tags=["tasks"])
logger = structlog.get_logger()


# In-memory storage for analysis results (in production, use Redis/DB)
analysis_cache = {}


@router.post("/analyze")
async def analyze_issue(
    images: Optional[List[UploadFile]] = File(None),
    audio_description: Optional[str] = Form(None),
    location: Optional[str] = Form(None),
    manual_notes: Optional[str] = Form(None)
):
    """
    Step 1: Analyze the reported issue without creating a task.
    
    This endpoint:
    1. Captures the input data
    2. Runs AI analysis
    3. Returns analysis results for user confirmation
    
    Returns:
        Analysis results including priority, issue type, and AI recommendations
    """
    try:
        # Generate a temporary analysis ID
        analysis_id = str(uuid.uuid4())
        
        # Build initial state
        state = {
            "analysis_id": analysis_id,
            "messages": [],
            "images": images or [],
            "audio_description": audio_description,
            "manual_notes": manual_notes
        }
        
        # Parse location if provided
        if location:
            try:
                state["location"] = json.loads(location)
            except:
                state["location"] = {"description": location}
        
        # Step 1: Capture and process input
        state = await capture_node(state)
        
        # Step 2: Run AI analysis
        state = await analysis_node(state)
        
        # Cache the analysis result for confirmation step
        analysis_cache[analysis_id] = state
        
        # Return analysis results to frontend
        return {
            "analysis_id": analysis_id,
            "ai_analysis": state.get("ai_analysis", {}),
            "priority": state.get("priority", 3),
            "issue_type": state.get("issue_type", "other"),
            "processed_images": state.get("processed_images", []),
            "location": state.get("validated_location", {}),
            "audio_description": audio_description,
            "manual_notes": manual_notes,
            "timestamp": state.get("created_at", datetime.utcnow().isoformat())
        }
        
    except Exception as e:
        logger.error("analyze_issue.error", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/confirm")
async def confirm_and_create_task(data: Dict[str, Any]):
    """
    Step 2: User confirms the analysis and creates an actual task.
    
    This endpoint:
    1. Retrieves the cached analysis
    2. Creates a formal task in the database
    3. Notifies relevant parties (if high priority)
    
    Args:
        data: Contains analysis_id and any user modifications
        
    Returns:
        Created task with task_id
    """
    try:
        logger.info("confirm_task.start", data=data)
        
        analysis_id = data.get("analysis_id")
        if not analysis_id or analysis_id not in analysis_cache:
            logger.error("confirm_task.analysis_not_found", 
                        analysis_id=analysis_id,
                        cache_keys=list(analysis_cache.keys()))
            raise HTTPException(status_code=404, detail="Analysis not found")
        
        # Retrieve cached analysis
        cached_state = analysis_cache[analysis_id]
        
        # Get user info if clerk_user_id provided
        user_info = None
        venue_id = data.get("venue_id")
        
        # Try to get venue from clerk user
        if data.get("clerk_user_id"):
            user_info = await db.get_user_by_clerk_id(data["clerk_user_id"])
            if user_info:
                venue_id = str(user_info["venue_id"])
                logger.info("venue_from_user", 
                           clerk_user_id=data["clerk_user_id"],
                           venue_id=venue_id)
        
        # Validate venue_id is provided and exists
        if not venue_id:
            logger.error("confirm_task.no_venue_id", data=data)
            raise HTTPException(
                status_code=400, 
                detail="venue_id is required. Please provide a valid venue_id."
            )
        
        # Verify venue exists in database
        venue_exists = await db.fetch_one(
            "SELECT id FROM venues WHERE id = $1",
            venue_id
        )
        
        if not venue_exists:
            logger.error("confirm_task.invalid_venue", 
                        venue_id=venue_id,
                        data=data)
            raise HTTPException(
                status_code=400,
                detail=f"Invalid venue_id: {venue_id}. Venue does not exist."
            )
        
        # Prepare task data for database
        task_data = {
            "type": cached_state.get("issue_type", "other"),
            "priority": data.get("priority", cached_state.get("priority", 3)),
            "description": data.get("description", cached_state.get("ai_analysis", {}).get("description")),
            "location": cached_state.get("validated_location"),
            "images": cached_state.get("processed_images", []),
            "audio_description": cached_state.get("audio_description"),
            "ai_analysis": cached_state.get("ai_analysis"),
            "additional_notes": data.get("additional_notes"),
        }
        
        # AI context for tracking
        ai_context = {
            "source": "employee_report",
            "created_via": "langgraph_api",
            "analysis_id": analysis_id,
            "needs_manager_review": cached_state.get("priority", 3) >= 4,
            "auto_assignable": cached_state.get("auto_assignable", False),
            "created_by": data.get("user_id", "unknown"),
            "organization_id": data.get("organization_id")
        }
        
        # Save to database
        task = await db.create_task(
            venue_id=venue_id,
            reporter_id=user_info["id"] if user_info else None,
            task_data=task_data,
            ai_context=ai_context
        )
        
        # Create task creation event
        await db.create_event(
            venue_id=venue_id,
            event_type="task_created",
            actor_id=user_info["id"] if user_info else None,
            target_type="task",
            target_id=str(task["id"]),
            severity="warning" if task_data["priority"] >= 4 else "info",
            data={
                "source": "employee_report",
                "trigger": "ai_analysis_confirmed",
                "has_images": len(task_data.get("images", [])) > 0,
                "has_audio": bool(task_data.get("audio_description")),
                "priority": task_data["priority"]
            }
        )
        
        # Clean up cache
        del analysis_cache[analysis_id]
        
        # If high priority, trigger manager notification
        if task_data["priority"] >= 4:
            # Create high priority event
            await db.create_event(
                venue_id=venue_id,
                event_type="ai_decision",
                target_type="task",
                target_id=str(task["id"]),
                severity="warning",
                data={
                    "decision": "auto_escalate",
                    "reason": "high_priority_issue",
                    "actions": ["notify_manager", "find_nearest_worker"]
                }
            )
            logger.info("high_priority_task_created", 
                       task_id=str(task["id"]), 
                       priority=task_data["priority"])
        
        return {
            "task_id": str(task["id"]),
            "status": "success",
            "message": "Task created successfully",
            "task": {
                "id": str(task["id"]),
                "venue_id": venue_id,
                "status": task["status"],
                "created_at": task["created_at"].isoformat(),
                **task_data,
                **ai_context
            }
        }
        
    except Exception as e:
        logger.error("confirm_task.error", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{task_id}")
async def get_task_details(task_id: str):
    """
    Get task details by ID.
    """
    try:
        # Fetch from database
        task = await db.get_task(task_id)
        
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        return {
            "task_id": str(task["id"]),
            "venue_id": str(task["venue_id"]),
            "status": task["status"],
            "reporter_id": str(task["reporter_id"]) if task["reporter_id"] else None,
            "assignee_id": str(task["assignee_id"]) if task["assignee_id"] else None,
            "created_at": task["created_at"].isoformat() if task["created_at"] else None,
            "data": task["data"],
            "ai_context": task["ai_context"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("get_task.error", task_id=task_id, error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{task_id}/assign")
async def assign_task(task_id: str, data: Dict[str, Any]):
    """
    Step 3: Manager assigns the task to a worker.
    
    Args:
        task_id: The task to assign
        data: Assignment details (worker_id, instructions, etc.)
    """
    try:
        assigned_to = data.get("assigned_to")
        instructions = data.get("instructions")
        
        # TODO: Update task in database
        # TODO: Send notification to assigned worker
        
        return {
            "task_id": task_id,
            "assigned_to": assigned_to,
            "status": "assigned",
            "message": "Task assigned successfully"
        }
        
    except Exception as e:
        logger.error("assign_task.error", task_id=task_id, error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{task_id}/update-status")
async def update_task_status(task_id: str, data: Dict[str, Any]):
    """
    Update task status (worker updates progress).
    """
    try:
        new_status = data.get("status")
        notes = data.get("notes")
        
        # TODO: Update in database
        # TODO: If status is "need_help", notify manager
        
        return {
            "task_id": task_id,
            "status": new_status,
            "updated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error("update_status.error", task_id=task_id, error=str(e))
        raise HTTPException(status_code=500, detail=str(e))