"""Task processing graph using LangGraph."""

from typing import Dict, Any, List, TypedDict, Annotated
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
import operator

from app.nodes.capture_node import capture_node
from app.nodes.analysis_node import analysis_node


class TaskState(TypedDict):
    """State schema for task processing."""
    # Basic info
    task_id: str
    status: str
    created_at: str
    
    # Input data
    images: List[Any]
    audio_description: str
    location: Dict[str, Any]
    manual_notes: str
    
    # Processed data
    processed_images: List[Dict[str, Any]]
    validated_location: Dict[str, Any]
    
    # AI Analysis
    ai_analysis: Dict[str, Any]
    priority: int
    issue_type: str
    
    # Messages for context
    messages: Annotated[List[Dict[str, str]], operator.add]
    
    # Routing flags
    is_emergency: bool
    auto_assignable: bool
    needs_manager_review: bool


def should_review(state: TaskState) -> str:
    """Determine if manager review is needed."""
    if state.get("is_emergency", False):
        return "manager_review"
    elif state.get("auto_assignable", False):
        return "assignment"
    else:
        return "manager_review"


def create_task_graph():
    """Create the task processing graph."""
    
    # Initialize the workflow
    workflow = StateGraph(TaskState)
    
    # Add nodes
    workflow.add_node("capture", capture_node)
    workflow.add_node("analysis", analysis_node)
    
    # Add edges (flow)
    workflow.add_edge("capture", "analysis")
    
    # Add conditional routing after analysis
    workflow.add_conditional_edges(
        "analysis",
        should_review,
        {
            "manager_review": END,  # For now, end here (will add more nodes later)
            "assignment": END,       # For now, end here
        }
    )
    
    # Set entry point
    workflow.set_entry_point("capture")
    
    # Compile the graph
    memory = MemorySaver()  # In production, use Redis or database
    graph = workflow.compile(checkpointer=memory)
    
    return graph


# Create singleton instance
task_graph = create_task_graph()