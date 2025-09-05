"""
Production-Grade Security Module
Comprehensive security utilities for government deployment
"""

import hashlib
import hmac
import time
import uuid
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional, List
from collections import defaultdict
import logging
from fastapi import HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
import bcrypt
import re

from config import settings

logger = logging.getLogger(__name__)

# HTTP Bearer scheme
security = HTTPBearer()

class SecurityUtils:
    """Security utility functions"""
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash password using bcrypt with enhanced security"""
        # Encode password to bytes
        password_bytes = password.encode('utf-8')
        # Hash with 12 rounds (enhanced security)
        salt = bcrypt.gensalt(rounds=12)
        hashed = bcrypt.hashpw(password_bytes, salt)
        # Return as string
        return hashed.decode('utf-8')
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify password against hash with legacy SHA256 support"""
        # Try bcrypt first
        try:
            password_bytes = plain_password.encode('utf-8')
            hashed_bytes = hashed_password.encode('utf-8')
            if bcrypt.checkpw(password_bytes, hashed_bytes):
                return True
        except Exception:
            pass
        
        # Fallback to legacy SHA256 for migration
        try:
            hashed_input = hashlib.sha256(plain_password.encode()).hexdigest()
            return hashed_input == hashed_password
        except Exception:
            return False
    
    @staticmethod
    def validate_password_strength(password: str) -> Dict[str, Any]:
        """Validate password strength"""
        errors = []
        
        if len(password) < 8:
            errors.append("Password must be at least 8 characters long")
        
        if not re.search(r'[A-Z]', password):
            errors.append("Password must contain at least one uppercase letter")
        
        if not re.search(r'[a-z]', password):
            errors.append("Password must contain at least one lowercase letter")
        
        if not re.search(r'\d', password):
            errors.append("Password must contain at least one digit")
        
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            errors.append("Password must contain at least one special character")
        
        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "score": max(0, 5 - len(errors))
        }
    
    @staticmethod
    def sanitize_input(input_str: str) -> str:
        """Sanitize user input to prevent injection attacks"""
        if not input_str:
            return ""
        
        # Remove potentially dangerous characters
        sanitized = re.sub(r'[<>"\']', '', input_str)
        # Remove multiple spaces
        sanitized = re.sub(r'\s+', ' ', sanitized)
        return sanitized.strip()
    
    @staticmethod
    def validate_email(email: str) -> bool:
        """Validate email format"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))

class JWTManager:
    """JWT token management"""
    
    @staticmethod
    def create_access_token(data: Dict[str, Any], user_type: str = "user") -> str:
        """Create JWT access token with role-based expiry"""
        to_encode = data.copy()
        
        # Set expiry based on user type
        if user_type in ["superadmin", "tenant"]:
            expire_minutes = settings.ADMIN_TOKEN_EXPIRE_MINUTES
        else:
            expire_minutes = settings.MEMBER_TOKEN_EXPIRE_MINUTES
            
        expire = datetime.now(tz=timezone.utc) + timedelta(minutes=expire_minutes)
        to_encode.update({
            "exp": expire,
            "iat": datetime.now(tz=timezone.utc),
            "type": "access",
            "jti": str(uuid.uuid4())  # Unique token ID
        })
        return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    
    @staticmethod
    def create_password_reset_token(email: str) -> str:
        """Create password reset token"""
        to_encode = {
            "sub": email,
            "type": "password_reset",
            "jti": str(uuid.uuid4())
        }
        expire = datetime.now(tz=timezone.utc) + timedelta(minutes=settings.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES)
        to_encode.update({
            "exp": expire,
            "iat": datetime.now(tz=timezone.utc)
        })
        return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    
    @staticmethod
    def decode_token(token: str) -> Optional[Dict[str, Any]]:
        """Decode JWT token with enhanced error handling"""
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            return payload
        except JWTError as e:
            logger.warning(f"JWT decode error: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error decoding JWT: {str(e)}")
            return None
    
    @staticmethod
    def is_token_expired(payload: Dict[str, Any]) -> bool:
        """Check if token is expired"""
        exp = payload.get("exp")
        if not exp:
            return True
        
        try:
            exp_timestamp = datetime.fromtimestamp(exp, tz=timezone.utc)
            return datetime.now(tz=timezone.utc) > exp_timestamp
        except Exception:
            return True

class RateLimiter:
    """In-memory rate limiter for production use"""
    
    def __init__(self):
        self.rate_limit_store = defaultdict(list)
        self.max_requests_per_minute = settings.RATE_LIMIT_PER_MINUTE
        self.max_requests_per_hour = settings.RATE_LIMIT_PER_HOUR
    
    def check_rate_limit(self, identifier: str, window_minutes: int = 1) -> bool:
        """Check rate limit for given identifier"""
        now = time.time()
        key = f"{identifier}:{window_minutes}"
        
        # Clean old entries
        cutoff_time = now - (window_minutes * 60)
        self.rate_limit_store[key] = [
            timestamp for timestamp in self.rate_limit_store[key]
            if timestamp > cutoff_time
        ]
        
        # Check limit
        max_requests = self.max_requests_per_minute if window_minutes == 1 else self.max_requests_per_hour
        if len(self.rate_limit_store[key]) >= max_requests:
            return False
        
        self.rate_limit_store[key].append(now)
        return True
    
    def get_remaining_requests(self, identifier: str, window_minutes: int = 1) -> int:
        """Get remaining requests for given identifier"""
        now = time.time()
        key = f"{identifier}:{window_minutes}"
        
        # Clean old entries
        cutoff_time = now - (window_minutes * 60)
        self.rate_limit_store[key] = [
            timestamp for timestamp in self.rate_limit_store[key]
            if timestamp > cutoff_time
        ]
        
        max_requests = self.max_requests_per_minute if window_minutes == 1 else self.max_requests_per_hour
        return max(0, max_requests - len(self.rate_limit_store[key]))

class AuditLogger:
    """Security audit logging"""
    
    @staticmethod
    def log_auth_event(
        event_type: str,
        user_id: Optional[str] = None,
        email: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        success: bool = True,
        details: Optional[Dict[str, Any]] = None
    ):
        """Log authentication events"""
        if not settings.ENABLE_AUDIT_LOGS:
            return
        
        log_entry = {
            "timestamp": datetime.now(tz=timezone.utc).isoformat(),
            "event_type": event_type,
            "user_id": user_id,
            "email": email,
            "ip_address": ip_address,
            "user_agent": user_agent,
            "success": success,
            "details": details or {}
        }
        
        logger.info(f"AUTH_AUDIT: {log_entry}")
    
    @staticmethod
    def log_security_event(
        event_type: str,
        severity: str = "INFO",
        ip_address: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        """Log security events"""
        if not settings.ENABLE_AUDIT_LOGS:
            return
        
        log_entry = {
            "timestamp": datetime.now(tz=timezone.utc).isoformat(),
            "event_type": event_type,
            "severity": severity,
            "ip_address": ip_address,
            "details": details or {}
        }
        
        logger.warning(f"SECURITY_EVENT: {log_entry}")

class SecurityMiddleware:
    """Enhanced security middleware"""
    
    def __init__(self):
        self.rate_limiter = RateLimiter()
    
    async def process_request(self, request: Request) -> Optional[HTTPException]:
        """Process request for security checks"""
        client_ip = request.client.host
        
        # Rate limiting for sensitive endpoints
        if request.url.path in ["/auth/login", "/auth/password-reset"]:
            if not self.rate_limiter.check_rate_limit(f"auth:{client_ip}"):
                AuditLogger.log_security_event(
                    "RATE_LIMIT_EXCEEDED",
                    "WARNING",
                    client_ip,
                    {"path": request.url.path}
                )
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Rate limit exceeded. Please try again later."
                )
        
        return None
    
    def add_security_headers(self, response):
        """Add security headers to response"""
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        
        # Add HSTS header for HTTPS
        if settings.COOKIE_SECURE:
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

# Global instances
security_utils = SecurityUtils()
jwt_manager = JWTManager()
rate_limiter = RateLimiter()
audit_logger = AuditLogger()
security_middleware = SecurityMiddleware()

class CookieManager:
    """Cookie management utilities"""
    
    @staticmethod
    def set_access_token_cookie(response, access_token: str, user_type: str = "user"):
        """Set access token cookie with role-based expiry"""
        # Set expiry based on user type
        if user_type in ["superadmin", "tenant"]:
            max_age = settings.ADMIN_TOKEN_EXPIRE_MINUTES * 60
        else:
            max_age = settings.MEMBER_TOKEN_EXPIRE_MINUTES * 60
        
        # Debug logging
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"Setting access token cookie: key={settings.ACCESS_TOKEN_COOKIE_NAME}, max_age={max_age}, httponly={settings.COOKIE_HTTPONLY}, secure={settings.COOKIE_SECURE}, samesite={settings.COOKIE_SAMESITE}, domain={settings.COOKIE_DOMAIN}, path={settings.COOKIE_PATH}")
            
        response.set_cookie(
            key=settings.ACCESS_TOKEN_COOKIE_NAME,
            value=access_token,
            max_age=max_age,
            httponly=settings.COOKIE_HTTPONLY,
            secure=settings.COOKIE_SECURE,
            samesite=settings.COOKIE_SAMESITE,
            domain=settings.COOKIE_DOMAIN,
            path=settings.COOKIE_PATH
        )
    
    @staticmethod
    def clear_auth_cookies(response):
        """Clear authentication cookies"""
        response.delete_cookie(
            key=settings.ACCESS_TOKEN_COOKIE_NAME, 
            path=settings.COOKIE_PATH, 
            domain=settings.COOKIE_DOMAIN
        )
    
    @staticmethod
    def get_token_from_cookies(request: Request) -> Optional[str]:
        """Get access token from cookies"""
        return request.cookies.get(settings.ACCESS_TOKEN_COOKIE_NAME)

# Global cookie manager instance
cookie_manager = CookieManager()
