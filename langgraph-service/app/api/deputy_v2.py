"""AI Deputy v2 API - ReAct Agent Implementation."""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any, Optional
from datetime import datetime
import structlog
from pydantic import BaseModel

from app.agents.deputy_agent import deputy_agent
from app.database import db

router = APIRouter(prefix="/api/v2/deputy", tags=["AI Deputy v2"])
logger = structlog.get_logger()


class ChatRequest(BaseModel):
    """Chat request model."""
    message: str
    venue_id: str
    thread_id: Optional[str] = None  # For conversation isolation
    context: Optional[Dict[str, Any]] = {}


class ChatResponse(BaseModel):
    """Chat response model with structured data."""
    message: str
    data: Optional[Dict[str, Any]] = None
    data_type: str = "text"
    actions: list = []
    requires_confirmation: bool = False
    confirmation_context: Optional[Dict[str, Any]] = None
    metadata: Dict[str, Any] = {}


@router.post("/chat")
async def chat_with_deputy(request: ChatRequest):
    """
    Main chat endpoint for AI Deputy v2.
    
    This endpoint:
    1. Accepts natural language input
    2. Uses ReAct agent to process and call appropriate tools
    3. Returns structured responses for frontend rendering
    """
    try:
        logger.info("deputy_v2_chat", 
                   venue_id=request.venue_id,
                   thread_id=request.thread_id,
                   message_preview=request.message[:100])
        
        # Handle confirmation responses
        if request.context.get("confirmation_action"):
            return await handle_confirmation(request)
        
        # Determine thread_id for conversation isolation
        # Main conversation: venue_id
        # Task conversation: venue_id:task:task_id
        thread_id = request.thread_id or f"venue:{request.venue_id}"
        
        # Prepare the conversation for the agent
        # No need to manually manage history - LangGraph does it!
        config = {"configurable": {"thread_id": thread_id}}
        
        # Determine if this is a task-specific conversation
        is_task_context = ":task:" in thread_id
        
        # Simple message handling
        message_content = request.message
        
        # For task context, add context hint to the message
        if is_task_context:
            # Extract task_id from thread_id (handle extra parts after task_id)
            parts = thread_id.split(":task:")
            if len(parts) > 1:
                # Get everything after :task:, then take only the UUID part
                task_id_part = parts[-1]
                # If there are more colons, take only the first part (the actual task ID)
                task_id = task_id_part.split(":")[0] if ":" in task_id_part else task_id_part
            else:
                task_id = None
            
            # CRITICAL: Don't add task context for casual messages
            # This prevents the agent from fetching task details unnecessarily
            casual_messages = [
                "what's up", "what up", "sup", "hello", "hi", "hey",
                "thanks", "thank you", "ok", "okay", "got it",
                "how are you", "good morning", "good afternoon", "good evening"
            ]
            
            is_casual = any(casual in request.message.lower() for casual in casual_messages)
            
            # Also check if message contains "my name is" or similar personal info
            is_personal = any(phrase in request.message.lower() for phrase in [
                "my name is", "i'm ", "i am ", "call me"
            ])
            
            # Check if this is explicitly asking for task details (should fetch data)
            is_explicit_request = any(phrase in request.message.lower() for phrase in [
                "show me the details", "show me details", "show the details",
                "get the details", "get details", "task details",
                "looking at task", "show me this task", "what is this task"
            ])
            
            if task_id and (is_explicit_request or (not is_casual and not is_personal)):
                # Only add context for non-casual, non-personal messages
                message_content = f"[Task context: {task_id}] {request.message}"
            elif task_id and (is_casual or is_personal):
                # For casual/personal messages in task context, just send as-is
                # The thread_id maintains context, but we don't prompt the agent to fetch data
                logger.info("Casual/personal message in task context, not adding prefix", 
                           message=request.message, task_id=task_id)
        else:
            # Main conversation - add venue_id if needed
            if any(keyword in request.message.lower() for keyword in ['task', 'pending', 'venue', 'statistic', 'overview']):
                if 'venue_id' not in request.message:
                    message_content = f"{request.message} (venue_id: {request.venue_id})"
        
        # Invoke the ReAct agent with persistent memory
        print(f"DEBUG: Final message being sent: {message_content}")
        try:
            result = await deputy_agent.ainvoke(
                {"messages": [{"role": "user", "content": message_content}]},
                config=config
            )
        except Exception as e:
            logger.error("agent_invoke_error", error=str(e), thread_id=thread_id)
            raise
        
        # Look for tool responses in THIS TURN ONLY
        # LangGraph returns all messages including history
        # We only want the response from the current turn
        messages = result["messages"]
        response_data = None
        
        # Debug logging
        logger.info("DEBUG: Total messages", count=len(messages))
        for i, msg in enumerate(messages):
            logger.info(f"DEBUG: Message {i}", 
                       type=msg.__class__.__name__,
                       content_preview=str(msg.content)[:100] if hasattr(msg, 'content') else "N/A")
        
        # CRITICAL FIX: Find the LAST occurrence of this exact user message
        # Since LangGraph includes history, we need to find where THIS request starts
        user_msg_index = -1
        for i in range(len(messages) - 1, -1, -1):
            if messages[i].__class__.__name__ == 'HumanMessage':
                msg_content = str(messages[i].content)
                # Check for exact match with the transformed message
                if message_content == msg_content:
                    user_msg_index = i
                    logger.info("DEBUG: Found EXACT user message", index=i, content=msg_content[:100])
                    break
        
        # If exact match not found, try partial match (but this is less reliable)
        if user_msg_index == -1:
            for i in range(len(messages) - 1, -1, -1):
                if messages[i].__class__.__name__ == 'HumanMessage':
                    msg_content = str(messages[i].content)
                    if request.message in msg_content:
                        user_msg_index = i
                        logger.info("DEBUG: Found PARTIAL user message", index=i, content=msg_content[:100])
                        break
        
        # Only check messages after the current user message
        found_tool_in_this_turn = False
        if user_msg_index >= 0:
            logger.info("DEBUG: Checking messages after index", start_index=user_msg_index + 1)
            for i, msg in enumerate(messages[user_msg_index + 1:], start=user_msg_index + 1):
                logger.info(f"DEBUG: Checking message {i}", type=msg.__class__.__name__)
                
                # If we hit another HumanMessage, we've gone too far
                if msg.__class__.__name__ == 'HumanMessage':
                    logger.info("DEBUG: Hit another HumanMessage, stopping search")
                    break
                    
                # Check for tool responses in this turn
                if msg.__class__.__name__ == 'ToolMessage':
                    try:
                        import json
                        if isinstance(msg.content, str):
                            tool_result = json.loads(msg.content)
                            if isinstance(tool_result, dict) and 'message' in tool_result:
                                logger.info("DEBUG: Found NEW tool response in current turn", 
                                          data_type=tool_result.get('data_type'),
                                          index=i)
                                response_data = tool_result
                                found_tool_in_this_turn = True
                                break  # Use the first tool response in this turn
                    except Exception as e:
                        logger.error("tool_response_parse_error", error=str(e))
        else:
            logger.warning("DEBUG: Could not find user message in history")
        
        # If no tool response found IN THIS TURN, use the last AI message
        if not response_data:
            # Get the last AI message after the user message
            last_ai_message = None
            if user_msg_index >= 0:
                for msg in messages[user_msg_index + 1:]:
                    if msg.__class__.__name__ == 'AIMessage':
                        last_ai_message = msg
            
            if not last_ai_message:
                last_ai_message = messages[-1]
                
            logger.info("DEBUG: No tool in this turn, using AI message", 
                       type=last_ai_message.__class__.__name__,
                       found_tool_in_turn=found_tool_in_this_turn)
            
            response_data = {
                "message": last_ai_message.content if hasattr(last_ai_message, 'content') else str(last_ai_message),
                "data_type": "text",
                "actions": [],
                "data": None
            }
        else:
            logger.info("DEBUG: Using tool response from current turn", data_type=response_data.get('data_type'))
        
        # Log successful interaction
        logger.info("deputy_v2_response",
                   data_type=response_data.get("data_type"),
                   has_actions=len(response_data.get("actions", [])) > 0)
        
        return ChatResponse(**response_data)
        
    except Exception as e:
        logger.error("deputy_v2_error", error=str(e))
        return ChatResponse(
            message=f"I encountered an error: {str(e)}",
            data_type="error",
            metadata={"error": str(e)}
        )


async def handle_confirmation(request: ChatRequest):
    """Handle confirmation responses for human-in-the-loop."""
    
    context = request.context.get("confirmation_context", {})
    action = request.context.get("confirmation_action")
    
    if action == "confirm":
        # User confirmed the action
        if context.get("action") == "confirm_assignment":
            # Execute the assignment without confirmation
            from app.agents.deputy_agent import assign_task_to_worker
            result = await assign_task_to_worker(
                task_id=context["task_id"],
                worker_id=context["worker_id"],
                require_confirmation=False
            )
            return ChatResponse(**result)
            
        elif context.get("action") == "confirm_emergency":
            # Execute emergency escalation
            from app.agents.deputy_agent import escalate_to_emergency
            result = await escalate_to_emergency(
                task_id=context["task_id"],
                reason=context["reason"],
                require_confirmation=False
            )
            return ChatResponse(**result)
    
    # User cancelled
    return ChatResponse(
        message="Action cancelled",
        data_type="text"
    )


def parse_agent_response(message) -> Dict[str, Any]:
    """Parse agent response to extract structured data."""
    
    # The response from LangGraph ReAct agent can be:
    # 1. AIMessage with tool_calls
    # 2. ToolMessage with the tool response
    # 3. AIMessage with plain text
    
    # Get all messages from the result (not just the last one)
    # We need to look for tool responses in the message history
    if hasattr(message, 'content'):
        content = message.content
        
        # Try to parse as JSON if it looks like JSON
        if isinstance(content, str) and content.strip().startswith('{'):
            try:
                import json
                parsed = json.loads(content)
                if isinstance(parsed, dict) and 'message' in parsed:
                    return parsed
            except:
                pass
        
        # Check for tool calls in the message
        if hasattr(message, 'tool_calls') and message.tool_calls:
            # The actual tool response will be in a separate ToolMessage
            # For now, return a placeholder
            return {
                "message": "Processing request...",
                "data_type": "text",
                "actions": [],
                "data": None
            }
    
    # If content is already a dict (from tool response)
    if isinstance(message, dict):
        return message
    
    # Plain text response
    content_str = str(message.content if hasattr(message, 'content') else message)
    return {
        "message": content_str,
        "data_type": "text", 
        "actions": [],
        "data": None
    }


@router.get("/status/{venue_id}")
async def get_venue_status(venue_id: str):
    """
    Get initial venue status when opening AI Deputy.
    
    This provides a quick overview without agent processing.
    """
    try:
        # Use the get_venue_statistics tool directly
        from app.agents.deputy_agent import get_venue_statistics
        result = await get_venue_statistics.ainvoke({"venue_id": venue_id})
        
        # Add greeting based on time
        current_hour = datetime.now().hour
        greeting = "Good morning" if current_hour < 12 else \
                  "Good afternoon" if current_hour < 18 else "Good evening"
        
        if isinstance(result, dict):
            result["message"] = f"{greeting}. Here's your venue overview:\n\n{result.get('message', '')}"
        
        return ChatResponse(**result)
        
    except Exception as e:
        logger.error("status_error", venue_id=venue_id, error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/task/{task_id}")
async def get_task_context(task_id: str):
    """Get detailed task context for task-specific conversation."""
    try:
        from app.agents.deputy_agent import get_task_details
        result = await get_task_details.ainvoke({"task_id": task_id})
        return ChatResponse(**result)
        
    except Exception as e:
        logger.error("task_context_error", task_id=task_id, error=str(e))
        raise HTTPException(status_code=500, detail=str(e))