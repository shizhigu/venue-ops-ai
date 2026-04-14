"""Analysis node for AI-powered issue analysis using OpenRouter."""

import json
from typing import Dict, Any
from datetime import datetime
import structlog
from openai import OpenAI

from app.config import settings

logger = structlog.get_logger()

# Initialize OpenRouter client (OpenAI-compatible)
client = OpenAI(
    api_key=settings.openrouter_api_key,
    base_url=settings.openrouter_base_url,
)


async def analysis_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Analyze the captured issue using AI.
    
    Uses OpenRouter to call multimodal models for analysis.
    """
    logger.info("analysis_node.start", task_id=state.get("task_id"))
    
    # Update status
    state["status"] = "analyzing"
    
    try:
        # Build context from captured data
        context = _build_analysis_context(state)
        
        # Prepare messages for AI
        messages = [
            {
                "role": "system",
                "content": """You are an expert facility maintenance AI assistant. 
                Analyze the reported issue and provide a structured assessment.
                
                Return a JSON object with:
                {
                    "issue_type": "leak|damage|malfunction|safety|cleaning|other",
                    "priority": 1-5 (1=low, 5=critical),
                    "description": "Clear description of the issue",
                    "suggested_tools": ["tool1", "tool2"],
                    "estimated_minutes": 30,
                    "confidence": 0.0-1.0,
                    "reasoning": "Brief explanation"
                }
                
                Consider:
                - Safety implications (injuries, hazards)
                - Business impact (customer experience, operations)
                - Urgency (water damage, electrical hazards escalate quickly)
                """
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": context
                    }
                ]
            }
        ]
        
        # Add images if available
        if state.get("processed_images"):
            for img in state["processed_images"][:3]:  # Limit to 3 images
                # For base64 images, we need to format them properly
                if "path" in img:
                    # In production, load image and convert to base64
                    # For now, skip file-based images
                    continue
                    
        # Call AI model via OpenRouter
        response = client.chat.completions.create(
            model=settings.openrouter_model,
            messages=messages,
            response_format={ "type": "json_object" },
            temperature=0.2,
            max_tokens=500
        )
        
        # Parse AI response
        try:
            ai_result = json.loads(response.choices[0].message.content)
        except json.JSONDecodeError as e:
            logger.error("json_decode_error", 
                        content=response.choices[0].message.content[:200],
                        error=str(e))
            # Fallback to default analysis
            ai_result = {
                "issue_type": "other",
                "priority": 3,
                "description": state.get("audio_description", "Issue reported"),
                "confidence": 0.5,
                "reasoning": "AI analysis failed, using defaults"
            }
        
        # Update state with analysis
        state["ai_analysis"] = ai_result
        state["priority"] = ai_result.get("priority", 3)
        state["issue_type"] = ai_result.get("issue_type", "other")
        
        # Set routing flags based on analysis
        state["is_emergency"] = ai_result.get("priority", 3) >= 4
        state["auto_assignable"] = (
            ai_result.get("confidence", 0) > 0.8 
            and ai_result.get("priority", 3) < 4
        )
        state["needs_manager_review"] = (
            state["is_emergency"] 
            or ai_result.get("confidence", 0) < 0.7
        )
        
        # Add analysis to messages
        state["messages"].append({
            "role": "assistant",
            "content": f"Analysis complete: {ai_result.get('issue_type', 'unknown')} - Priority {ai_result.get('priority', 3)}"
        })
        
        # Update status
        state["status"] = "analyzed"
        state["analysis_completed_at"] = datetime.utcnow().isoformat()
        
    except Exception as e:
        logger.error("analysis_node.error", 
                    task_id=state.get("task_id"),
                    error=str(e))
        
        # Fallback analysis on error
        state["ai_analysis"] = {
            "issue_type": "other",
            "priority": 3,
            "description": "Manual review required - AI analysis failed",
            "confidence": 0.0,
            "error": str(e)
        }
        state["needs_manager_review"] = True
        state["status"] = "analysis_failed"
    
    logger.info("analysis_node.complete", 
                task_id=state.get("task_id"),
                priority=state.get("priority"),
                issue_type=state.get("issue_type"))
    
    return state


def _build_analysis_context(state: Dict[str, Any]) -> str:
    """Build context string for AI analysis."""
    parts = []
    
    # Location information
    if state.get("validated_location"):
        loc = state["validated_location"]
        parts.append(f"Location: {loc.get('description', 'Unknown')}")
    
    # Audio description
    if state.get("audio_description"):
        parts.append(f"Voice description: {state['audio_description']}")
    
    # Manual notes
    if state.get("manual_notes"):
        parts.append(f"Additional notes: {state['manual_notes']}")
    
    # Image count
    if state.get("processed_images"):
        parts.append(f"Number of photos: {len(state['processed_images'])}")
    
    return "\n".join(parts)