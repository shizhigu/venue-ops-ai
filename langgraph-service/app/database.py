"""Database connection and operations module."""

import asyncpg
from typing import Optional, Dict, Any, List
import json
from datetime import datetime
import structlog
from app.config import settings

logger = structlog.get_logger()


class Database:
    """Async PostgreSQL database connection manager."""
    
    def __init__(self):
        self.pool: Optional[asyncpg.Pool] = None
    
    async def connect(self):
        """Create database connection pool."""
        try:
            self.pool = await asyncpg.create_pool(
                settings.database_url,
                min_size=10,
                max_size=settings.database_pool_size,
                max_queries=50000,
                max_inactive_connection_lifetime=300,
            )
            logger.info("database.connected", pool_size=settings.database_pool_size)
        except Exception as e:
            logger.error("database.connection.failed", error=str(e))
            raise
    
    async def disconnect(self):
        """Close database connection pool."""
        if self.pool:
            await self.pool.close()
            logger.info("database.disconnected")
    
    async def execute(self, query: str, *args):
        """Execute a query without returning results."""
        async with self.pool.acquire() as conn:
            return await conn.execute(query, *args)
    
    async def fetch_one(self, query: str, *args) -> Optional[Dict[str, Any]]:
        """Fetch a single row."""
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(query, *args)
            return dict(row) if row else None
    
    async def fetch_all(self, query: str, *args) -> List[Dict[str, Any]]:
        """Fetch multiple rows."""
        async with self.pool.acquire() as conn:
            rows = await conn.fetch(query, *args)
            return [dict(row) for row in rows]
    
    # Task operations
    async def create_task(
        self, 
        venue_id: str,
        reporter_id: Optional[str] = None,
        task_data: Dict[str, Any] = None,
        ai_context: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Create a new task in the database."""
        query = """
            INSERT INTO tasks (
                venue_id,
                reporter_id,
                status,
                created_at,
                data,
                ai_context
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, venue_id, status, created_at
        """
        
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(
                query,
                venue_id,
                reporter_id,
                'pending',
                datetime.utcnow(),
                json.dumps(task_data or {}),
                json.dumps(ai_context or {})
            )
            
            task = dict(row)
            logger.info("task.created", 
                       task_id=str(task['id']), 
                       venue_id=venue_id,
                       priority=task_data.get('priority', 3))
            return task
    
    async def update_task_status(
        self,
        task_id: str,
        status: str,
        assignee_id: Optional[str] = None
    ) -> bool:
        """Update task status."""
        query = """
            UPDATE tasks 
            SET status = $2, assignee_id = $3
            WHERE id = $1
            RETURNING id
        """
        
        async with self.pool.acquire() as conn:
            result = await conn.fetchrow(query, task_id, status, assignee_id)
            success = result is not None
            
            if success:
                logger.info("task.status.updated", 
                           task_id=task_id, 
                           new_status=status)
            return success
    
    async def get_task(self, task_id: str) -> Optional[Dict[str, Any]]:
        """Get task by ID."""
        query = """
            SELECT 
                id, venue_id, status, 
                reporter_id, assignee_id,
                created_at, assigned_at, started_at, closed_at,
                data, ai_context
            FROM tasks
            WHERE id = $1
        """
        
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(query, task_id)
            if row:
                task = dict(row)
                # Parse JSON fields
                task['data'] = json.loads(task['data']) if task['data'] else {}
                task['ai_context'] = json.loads(task['ai_context']) if task['ai_context'] else {}
                return task
            return None
    
    # Event operations
    async def create_event(
        self,
        venue_id: str,
        event_type: str,
        actor_id: Optional[str] = None,
        target_type: Optional[str] = None,
        target_id: Optional[str] = None,
        severity: str = 'info',
        data: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Create a new event in the database."""
        query = """
            INSERT INTO events (
                venue_id,
                type,
                severity,
                actor_id,
                target_type,
                target_id,
                created_at,
                data
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id, created_at
        """
        
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(
                query,
                venue_id,
                event_type,
                severity,
                actor_id,
                target_type,
                target_id,
                datetime.utcnow(),
                json.dumps(data or {})
            )
            
            event = dict(row)
            logger.debug("event.created", 
                        event_type=event_type,
                        target_id=target_id)
            return event
    
    # User operations
    async def get_user_by_clerk_id(self, clerk_user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by Clerk ID."""
        query = """
            SELECT 
                id, venue_id, clerk_user_id,
                email, phone, name, role,
                is_active, metadata
            FROM users
            WHERE clerk_user_id = $1 AND is_active = true
            LIMIT 1
        """
        
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(query, clerk_user_id)
            if row:
                user = dict(row)
                user['metadata'] = json.loads(user['metadata']) if user['metadata'] else {}
                return user
            return None
    
    async def get_available_workers(
        self, 
        venue_id: str,
        skills: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        """Get available workers for task assignment."""
        query = """
            SELECT 
                id, name, role, metadata
            FROM users
            WHERE 
                venue_id = $1 
                AND role = 'worker'
                AND is_active = true
        """
        
        async with self.pool.acquire() as conn:
            rows = await conn.fetch(query, venue_id)
            workers = []
            
            for row in rows:
                worker = dict(row)
                worker['metadata'] = json.loads(worker['metadata']) if worker['metadata'] else {}
                
                # Filter by skills if provided
                if skills:
                    worker_skills = worker['metadata'].get('skills', [])
                    if any(skill in worker_skills for skill in skills):
                        workers.append(worker)
                else:
                    workers.append(worker)
            
            return workers


# Global database instance
db = Database()


async def get_db() -> Database:
    """Get database instance for dependency injection."""
    return db