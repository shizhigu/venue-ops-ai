"""Main FastAPI application."""

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional, Dict, Any
import json
import logging
import structlog

from app.config import settings
from app.api import tasks, deputy
from app.database import db

# Configure Python logging
logging.basicConfig(
    level=getattr(logging, settings.log_level.upper()),
    format="%(message)s"
)

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer() if settings.log_format == "json" else structlog.dev.ConsoleRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    debug=settings.debug
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Initialize app on startup."""
    logger.info("app.startup", 
                env=settings.app_env,
                debug=settings.debug,
                cors_origins=settings.cors_origins_list)
    
    # Initialize database connection
    await db.connect()
    logger.info("database.initialized")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    await db.disconnect()
    logger.info("app.shutdown")


# Include API routers
app.include_router(tasks.router)
app.include_router(deputy.router)

# Include new v2 API
from app.api import deputy_v2
app.include_router(deputy_v2.router)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "service": "Venue Ops LangGraph",
        "version": "0.1.0",
        "status": "running"
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}


# Old endpoints removed - using new API structure in app/api/tasks.py


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )