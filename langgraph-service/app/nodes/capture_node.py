"""Capture node for processing initial task input."""

import uuid
import base64
import json
from typing import Dict, Any, List
from datetime import datetime
import structlog
from pathlib import Path
import io
from PIL import Image

from app.config import settings

logger = structlog.get_logger()


async def capture_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Process initial task submission from workers.
    
    Handles:
    - Multiple images (base64 or URLs)
    - Voice recordings (base64 audio)
    - Location data
    - Text notes
    
    Args:
        state: Current graph state containing raw input
        
    Returns:
        Updated state with processed data
    """
    logger.info("capture_node.start", task_id=state.get("task_id"))
    
    # Generate task ID if not present
    if not state.get("task_id"):
        state["task_id"] = str(uuid.uuid4())
    
    # Initialize task metadata
    state["created_at"] = datetime.utcnow().isoformat()
    state["status"] = "capturing"
    state["messages"] = []
    
    # Process images
    if "images" in state:
        state["processed_images"] = await _process_images(state["images"])
        state["messages"].append({
            "role": "system",
            "content": f"Captured {len(state['processed_images'])} images"
        })
    
    # Process audio description (already transcribed in frontend)
    if "audio_description" in state and state["audio_description"]:
        state["messages"].append({
            "role": "user", 
            "content": f"Audio description: {state['audio_description']}"
        })
    
    # Process location
    if "location" in state:
        state["validated_location"] = _validate_location(state["location"])
    
    # Store manual notes
    if "manual_notes" in state:
        state["messages"].append({
            "role": "user",
            "content": state["manual_notes"]
        })
    
    # Update status
    state["status"] = "captured"
    state["capture_completed_at"] = datetime.utcnow().isoformat()
    
    logger.info("capture_node.complete", 
                task_id=state["task_id"],
                has_images=bool(state.get("processed_images")),
                has_voice=bool(state.get("voice_transcript")),
                has_location=bool(state.get("validated_location")))
    
    return state


async def _process_images(images: List[Any]) -> List[Dict[str, Any]]:
    """
    Process uploaded images.
    
    Args:
        images: List of image data (base64 strings or file uploads)
        
    Returns:
        List of processed image metadata
    """
    processed = []
    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    for idx, image_data in enumerate(images):
        try:
            # Handle base64 encoded images
            if isinstance(image_data, str) and image_data.startswith("data:image"):
                # Extract base64 data
                header, encoded = image_data.split(",", 1)
                file_ext = header.split("/")[1].split(";")[0]
                
                # Decode and save
                image_bytes = base64.b64decode(encoded)
                image = Image.open(io.BytesIO(image_bytes))
                
                # Generate filename
                file_id = str(uuid.uuid4())
                filename = f"{file_id}.{file_ext}"
                filepath = upload_dir / filename
                
                # Save optimized version
                image.save(filepath, optimize=True, quality=85)
                
                processed.append({
                    "id": file_id,
                    "filename": filename,
                    "path": str(filepath),
                    "size": len(image_bytes),
                    "width": image.width,
                    "height": image.height,
                    "format": file_ext
                })
            
            # Handle URL references
            elif isinstance(image_data, str) and image_data.startswith("http"):
                processed.append({
                    "id": str(uuid.uuid4()),
                    "url": image_data,
                    "type": "url"
                })
            
            # Handle file upload objects
            elif hasattr(image_data, "read"):
                content = await image_data.read()
                image = Image.open(io.BytesIO(content))
                
                file_id = str(uuid.uuid4())
                filename = f"{file_id}.jpg"
                filepath = upload_dir / filename
                
                image.save(filepath, "JPEG", optimize=True, quality=85)
                
                processed.append({
                    "id": file_id,
                    "filename": filename,
                    "path": str(filepath),
                    "size": len(content),
                    "width": image.width,
                    "height": image.height,
                    "format": "jpg"
                })
                
        except Exception as e:
            logger.error("image_processing_error", error=str(e), image_index=idx)
            continue
    
    return processed


# Voice processing function removed - transcription now happens in frontend


def _validate_location(location: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validate and enrich location data.
    
    Args:
        location: Raw location data
        
    Returns:
        Validated location with additional metadata
    """
    validated = {
        "lat": location.get("lat", 0.0),
        "lng": location.get("lng", 0.0),
        "area": location.get("area", "Unknown"),
        "floor": location.get("floor", ""),
        "spot": location.get("spot", ""),
        "accuracy": location.get("accuracy", 0),
        "timestamp": location.get("timestamp", datetime.utcnow().isoformat())
    }
    
    # Add descriptive location string
    parts = []
    if validated["area"] != "Unknown":
        parts.append(validated["area"])
    if validated["floor"]:
        parts.append(f"Floor {validated['floor']}")
    if validated["spot"]:
        parts.append(validated["spot"])
    
    validated["description"] = " - ".join(parts) if parts else "Location not specified"
    
    return validated