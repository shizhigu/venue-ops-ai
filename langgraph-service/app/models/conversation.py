"""Conversation models for AI Deputy."""

from typing import List, Dict, Any, Optional, Literal
from datetime import datetime
from pydantic import BaseModel, Field
from enum import Enum


class MessageRole(str, Enum):
    """Message roles in conversation."""
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class ConversationType(str, Enum):
    """Type of conversation context."""
    MAIN = "main"  # Main Deputy overview
    TASK = "task"  # Task-specific thread


class QuickAction(BaseModel):
    """Quick action button in chat."""
    label: str  # Display text
    action: str  # Action identifier
    payload: Dict[str, Any] = {}  # Action data
    style: Literal["primary", "secondary", "danger"] = "primary"


class Message(BaseModel):
    """Single message in conversation."""
    role: MessageRole
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    quick_actions: List[QuickAction] = []
    metadata: Dict[str, Any] = {}  # Additional context


class ConversationState(BaseModel):
    """LangGraph state for conversation."""
    messages: List[Message] = []
    context_type: ConversationType
    context_id: str  # venue_id for main, task_id for task
    current_intent: Optional[str] = None
    entities: Dict[str, Any] = {}
    pending_actions: List[str] = []
    
    # For main conversation
    active_tasks: List[str] = []
    venue_stats: Dict[str, Any] = {}
    
    # For task conversation
    task_data: Optional[Dict[str, Any]] = None
    task_history: List[Dict[str, Any]] = []


class ChatRequest(BaseModel):
    """Request for chat interaction."""
    message: str
    context_type: ConversationType = ConversationType.MAIN
    context_id: str  # venue_id or task_id
    
    
class ChatResponse(BaseModel):
    """Response from AI Deputy."""
    message: str
    quick_actions: List[QuickAction] = []
    context_switch: Optional[Dict[str, str]] = None  # Switch to different context
    metadata: Dict[str, Any] = {}


class ConversationContext(BaseModel):
    """Full conversation context."""
    id: str
    type: ConversationType
    messages: List[Message]
    created_at: datetime
    updated_at: datetime
    state: Dict[str, Any] = {}  # LangGraph state