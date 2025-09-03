from pydantic_settings import BaseSettings
from typing import Optional, List
import os
import secrets

class Settings(BaseSettings):
    # Database
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_USER: str = "root"
    DB_PASSWORD: str = "15112002"
    DB_NAME: str = "smart_politician_assistant"

    # JWT Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", secrets.token_urlsafe(64))
    ALGORITHM: str = "HS256"
    
    # Role-based token expiry (in minutes)
    ADMIN_TOKEN_EXPIRE_MINUTES: int = 24 * 60  # 24 hours for admin
    MEMBER_TOKEN_EXPIRE_MINUTES: int = 60  # 1 hour for member
    
    # Security Settings
    RATE_LIMIT_PER_MINUTE: int = 10
    RATE_LIMIT_PER_HOUR: int = 100
    ENABLE_AUDIT_LOGS: bool = True
    PASSWORD_RESET_TOKEN_EXPIRE_MINUTES: int = 15
    
    # Cookie Settings
    COOKIE_SECURE: bool = False  # Set to True in production with HTTPS
    COOKIE_HTTPONLY: bool = True
    COOKIE_SAMESITE: str = "lax"  # Options: "strict", "lax", "none"
    COOKIE_DOMAIN: Optional[str] = None
    COOKIE_PATH: str = "/"
    ACCESS_TOKEN_COOKIE_NAME: str = "access_token"
    
    # CORS Settings
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]
    ALLOW_CREDENTIALS: bool = True
    
    # Email Settings (for password reset)
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    SMTP_TLS: bool = True
    
    # Application Settings
    APP_NAME: str = "Smart Politician Assistant"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"

    class Config:
        env_file = ".env"

settings = Settings()



