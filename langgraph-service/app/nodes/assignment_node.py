"""Assignment node for allocating tasks to workers."""

from typing import Dict, Any, List, Optional
import logging
from datetime import datetime

from app.db.queries import get_available_workers, get_worker_skills, get_worker_location
from app.utils.assignment_optimizer import find_best_worker

logger = logging.getLogger(__name__)


async def process(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Assign task to the most suitable worker.
    
    This node:
    1. Gets list of available workers
    2. Matches skills with requirements
    3. Considers location proximity
    4. Assigns to best match
    5. Sends notifications
    """
    logger.info(f"Assigning task {state['task_id']}")
    
    # Get available workers
    available_workers = await get_available_workers(state["venue_id"])
    
    if not available_workers:
        logger.warning(f"No available workers for task {state['task_id']}")
        state["needs_manager_review"] = True
        state["messages"].append({
            "role": "system",
            "content": "No available workers found. Manager intervention required."
        })
        return state
    
    # Find best worker based on multiple factors
    best_worker = await find_best_worker(
        task=state,
        workers=available_workers,
        factors={
            "skills": 0.3,
            "location": 0.3,
            "workload": 0.2,
            "history": 0.2
        }
    )
    
    if best_worker:
        # Assign the task
        state["assigned_to"] = best_worker["id"]
        state["status"] = "assigned"
        state["assigned_at"] = datetime.utcnow().isoformat()
        
        # Calculate estimated arrival time based on location
        distance = await _calculate_distance(
            worker_location=best_worker.get("current_location"),
            task_location=state.get("location")
        )
        
        state["estimated_arrival_minutes"] = _estimate_travel_time(distance)
        
        # Add assignment details to messages
        state["messages"].append({
            "role": "system",
            "content": f"Task assigned to {best_worker['name']} (ID: {best_worker['id']}). "
                      f"Skills match: {best_worker['skill_match']}%. "
                      f"ETA: {state['estimated_arrival_minutes']} minutes."
        })
        
        # Trigger notification (would be handled by separate service)
        await _notify_worker(best_worker["id"], state["task_id"])
        
        logger.info(f"Task {state['task_id']} assigned to worker {best_worker['id']}")
    else:
        # Could not auto-assign
        state["needs_manager_review"] = True
        state["messages"].append({
            "role": "system",
            "content": "Could not find suitable worker for auto-assignment."
        })
        logger.info(f"Task {state['task_id']} requires manager assignment")
    
    return state


async def _calculate_distance(
    worker_location: Optional[Dict],
    task_location: Optional[Dict]
) -> float:
    """Calculate distance between worker and task locations."""
    if not worker_location or not task_location:
        return 0.0
    
    # In a real implementation, this would use proper distance calculation
    # For indoor venues, might use floor plan pathfinding
    
    # Simple example: estimate based on area and floor
    if worker_location.get("area") == task_location.get("area"):
        if worker_location.get("floor") == task_location.get("floor"):
            return 50  # Same floor, same area (meters)
        else:
            floor_diff = abs(
                int(worker_location.get("floor", "1").replace("Level ", "")) -
                int(task_location.get("floor", "1").replace("Level ", ""))
            )
            return 50 + (floor_diff * 20)  # Add 20m per floor
    else:
        return 200  # Different area
    
    return 100  # Default


def _estimate_travel_time(distance: float) -> int:
    """Estimate travel time in minutes based on distance."""
    # Assume average walking speed of 5 km/h (83 m/min)
    walking_time = distance / 83
    
    # Add buffer for elevator, doors, etc.
    return int(walking_time + 2)


async def _notify_worker(worker_id: str, task_id: str) -> None:
    """Send notification to assigned worker."""
    # In production, this would trigger push notification
    # via FCM, APNS, or WebSocket
    logger.info(f"Notification sent to worker {worker_id} for task {task_id}")