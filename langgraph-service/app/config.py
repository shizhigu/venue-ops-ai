"""Application configuration using Pydantic Settings."""

from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # App settings
    app_name: str = "venue-ops-langgraph"
    app_env: str = "development"
    host: str = "0.0.0.0"
    port: int = 8001
    debug: bool = True
    
    # Database
    database_url: str
    database_pool_size: int = 20
    database_max_overflow: int = 40
    
    # Redis
    redis_url: str = "redis://localhost:6379/0"
    
    # OpenRouter Configuration
    openrouter_api_key: str
    openrouter_base_url: str = "https://openrouter.ai/api/v1"
    openrouter_model: str = "anthropic/claude-3.5-sonnet"
    
    # Auth
    jwt_secret_key: str = "dev-secret-key-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 24
    
    # CORS (comma-separated string from env, converted to list)
    cors_origins: str = "http://localhost:3000,http://localhost:3007"
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Convert comma-separated origins to list."""
        return [origin.strip() for origin in self.cors_origins.split(",")]
    
    # File storage
    upload_dir: str = "/tmp/venue-ops/uploads"
    max_upload_size: int = 10485760  # 10MB
    
    # LangGraph
    langgraph_checkpointer: str = "redis"
    langgraph_memory_ttl: int = 3600
    
    # Logging
    log_level: str = "DEBUG"
    log_format: str = "console"
    
    # Monitoring
    enable_metrics: bool = True
    metrics_port: int = 9090
    
    # Logging
    log_level: str = "INFO"
    log_format: str = "json"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
        
    @property
    def is_development(self) -> bool:
        return self.app_env == "development"
    
    @property
    def is_production(self) -> bool:
        return self.app_env == "production"


# Create global settings instance
settings = Settings()