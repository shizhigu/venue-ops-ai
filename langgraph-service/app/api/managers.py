"""Manager API endpoints for advanced task management."""

from fastapi import APIRouter, HTTPException, Depends
from typing import Optional, List
from datetime import datetime, timedelta
from pydantic import BaseModel

from app.agents.task_graph import task_graph
from app.auth.dependencies import get_current_user, require_manager
from app.db.queries import (
    get_tasks_overview,
    get_worker_stats,
    get_venue_analytics,
    update_task,
    reassign_task
)
from app.agents.manager_agent import ManagerAgent

router = APIRouter()

# Initialize manager agent
manager_agent = ManagerAgent()


class ManagerInstruction(BaseModel):
    """Manager instruction model."""
    instruction: str
    priority_override: Optional[int] = None
    assign_to: Optional[str] = None


class TaskOverview(BaseModel):
    """Task overview for manager dashboard."""
    total_tasks: int
    pending: int
    in_progress: int
    completed_today: int
    critical_tasks: List[dict]
    worker_availability: dict


@router.get("/dashboard", response_model=TaskOverview)
async def get_manager_dashboard(
    current_user: dict = Depends(require_manager)
):
    """Get manager dashboard overview."""
    venue_id = current_user["venue_id"]
    
    # Get tasks overview
    tasks = await get_tasks_overview(venue_id)
    
    # Get worker stats
    workers = await get_worker_stats(venue_id)
    
    # Filter critical tasks
    critical = [
        t for t in tasks 
        if t.get("priority", 0) >= 4 and t["status"] != "completed"
    ]
    
    return TaskOverview(
        total_tasks=len(tasks),
        pending=len([t for t in tasks if t["status"] == "pending"]),
        in_progress=len([t for t in tasks if t["status"] == "in_progress"]),
        completed_today=len([
            t for t in tasks 
            if t["status"] == "completed" and 
            t.get("completion_time", "") > datetime.utcnow().date().isoformat()
        ]),
        critical_tasks=critical[:5],
        worker_availability={
            "available": workers["available"],
            "busy": workers["busy"],
            "offline": workers["offline"]
        }
    )


@router.post("/tasks/{task_id}/intervene")
async def manager_intervention(
    task_id: str,
    instruction: ManagerInstruction,
    current_user: dict = Depends(require_manager)
):
    """
    Manager intervention in task processing.
    
    Allows managers to:
    - Override AI decisions
    - Reassign tasks
    - Change priorities
    - Add specific instructions
    """
    # Process manager instruction through AI
    ai_interpretation = await manager_agent.process_instruction(
        task_id=task_id,
        instruction=instruction.instruction,
        context={
            "manager_id": current_user["user_id"],
            "venue_id": current_user["venue_id"],
            "timestamp": datetime.utcnow()
        }
    )
    
    # Apply changes through task graph
    updates = {
        "manager_instructions": instruction.instruction,
        "manager_id": current_user["user_id"],
        "intervention_time": datetime.utcnow()
    }
    
    if instruction.priority_override:
        updates["priority"] = instruction.priority_override
    
    if instruction.assign_to:
        updates["assigned_to"] = instruction.assign_to
        updates["reassigned_by"] = current_user["user_id"]
    
    # Add AI interpretation
    updates["ai_interpretation"] = ai_interpretation
    
    # Update through graph to maintain consistency
    result = await task_graph.update_task(
        task_id, 
        updates,
        start_node="manager_review"
    )
    
    return {
        "message": "Intervention processed successfully",
        "interpretation": ai_interpretation,
        "new_status": result["status"],
        "assigned_to": result.get("assigned_to")
    }


@router.post("/ai-command")
async def process_ai_command(
    command: str,
    current_user: dict = Depends(require_manager)
):
    """
    Process natural language command from manager.
    
    Examples:
    - "Show me all urgent tasks"
    - "Assign all plumbing issues to Wang"
    - "What's the status of water leak in Zone B?"
    """
    result = await manager_agent.process_command(
        command=command,
        venue_id=current_user["venue_id"],
        manager_id=current_user["user_id"]
    )
    
    return result


@router.get("/analytics")
async def get_analytics(
    time_range: str = "day",  # day, week, month
    current_user: dict = Depends(require_manager)
):
    """Get venue analytics and insights."""
    # Calculate time range
    if time_range == "day":
        start_date = datetime.utcnow() - timedelta(days=1)
    elif time_range == "week":
        start_date = datetime.utcnow() - timedelta(days=7)
    else:
        start_date = datetime.utcnow() - timedelta(days=30)
    
    analytics = await get_venue_analytics(
        venue_id=current_user["venue_id"],
        start_date=start_date
    )
    
    # Get AI insights
    insights = await manager_agent.generate_insights(analytics)
    
    return {
        "period": time_range,
        "metrics": analytics,
        "ai_insights": insights,
        "recommendations": insights.get("recommendations", [])
    }


@router.post("/batch-assign")
async def batch_assign_tasks(
    task_ids: List[str],
    worker_id: str,
    current_user: dict = Depends(require_manager)
):
    """Batch assign multiple tasks to a worker."""
    results = []
    
    for task_id in task_ids:
        try:
            await reassign_task(
                task_id=task_id,
                worker_id=worker_id,
                manager_id=current_user["user_id"],
                venue_id=current_user["venue_id"]
            )
            results.append({"task_id": task_id, "status": "assigned"})
        except Exception as e:
            results.append({"task_id": task_id, "status": "failed", "error": str(e)})
    
    return {
        "message": f"Processed {len(task_ids)} tasks",
        "results": results
    }