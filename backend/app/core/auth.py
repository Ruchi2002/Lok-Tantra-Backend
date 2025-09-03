from typing import Optional, Dict, Any
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session, select
import logging

from config import settings
from database import get_session
from app.models.user import User
from app.models.role import Role
from app.models.tenant import Tenant
from app.models.superadmin import SuperAdmin
from app.core.security import jwt_manager, security_utils, audit_logger, cookie_manager

logger = logging.getLogger(__name__)

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)

# Backward compatibility functions
def hash_password(password: str) -> str:
    """Hash password using bcrypt - backward compatibility"""
    return security_utils.hash_password(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash - backward compatibility"""
    return security_utils.verify_password(plain_password, hashed_password)

def create_access_token(data: Dict[str, Any]) -> str:
    """Create JWT access token - backward compatibility"""
    return jwt_manager.create_access_token(data)

def create_refresh_token(data: Dict[str, Any]) -> str:
    """Create JWT refresh token - backward compatibility"""
    return jwt_manager.create_refresh_token(data)

def decode_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode JWT token - backward compatibility"""
    return jwt_manager.decode_token(token)

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Get user by email with role - backward compatibility"""
    statement = select(User).where(User.email == email)
    user = db.exec(statement).first()
    
    if user and user.role_id:
        role = db.get(Role, user.role_id)
        if role:
            user.role = role
    
    return user

def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """Authenticate user with email and password - backward compatibility"""
    user = get_user_by_email(db, email)
    
    if not user:
        return None
    
    if not verify_password(password, user.password_hash or user.password):
        return None
    
    if getattr(user, 'status', 'active') != 'active':
        return None
    
    return user

def extract_token_from_request(request: Request, header_token: Optional[str] = None) -> Optional[str]:
    """
    Extract access token from multiple sources:
    1. Authorization header (Bearer token)
    2. Cookie (access_token)
    """
    # First try Authorization header
    if header_token:
        return header_token
    
    # Then try cookie
    cookie_token = cookie_manager.get_token_from_cookies(request)
    if cookie_token:
        return cookie_token
    
    return None

def get_current_user(
    request: Request,
    header_token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_session)
) -> User:
    """Get current authenticated user - enhanced version with dual token verification"""
    
    # Extract token from multiple sources
    token = extract_token_from_request(request, header_token)
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    payload = decode_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    # Check token type
    token_type = payload.get("type")
    if token_type != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    user_sub = payload.get("sub")
    if not user_sub:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    # Handle new token format: "user_uuid", "tenant_uuid", "superadmin_uuid"
    user_type = None
    user_id = None
    
    if user_sub.startswith("user_"):
        user_type = "user"
        user_id = user_sub[5:]  # Remove "user_" prefix
    elif user_sub.startswith("tenant_"):
        user_type = "tenant"
        user_id = user_sub[7:]  # Remove "tenant_" prefix
    elif user_sub.startswith("superadmin_"):
        user_type = "superadmin"
        user_id = user_sub[11:]  # Remove "superadmin_" prefix
    else:
        # Fallback for old format
        user_id = user_sub
        user_type = "user"
    
    # Handle different user types
    if user_type == "user":
        # Handle regular users (assistants)
        user = db.get(User, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        if getattr(user, 'status', 'active') != 'active':
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account is inactive",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        # Load role
        if user.role_id:
            role = db.get(Role, user.role_id)
            if role:
                user.role = role
        
        return user
        
    elif user_type == "tenant":
        # Handle tenant users
        tenant = db.get(Tenant, user_id)
        if not tenant:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Tenant not found",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        if getattr(tenant, 'status', 'active') != 'active':
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Tenant account is inactive",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        return tenant
        
    elif user_type == "superadmin":
        # Handle superadmin users
        superadmin = db.get(SuperAdmin, user_id)
        if not superadmin:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="SuperAdmin not found",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        if getattr(superadmin, 'status', 'active') != 'active':
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="SuperAdmin account is inactive",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        return superadmin
    
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user type",
            headers={"WWW-Authenticate": "Bearer"}
        )

def get_current_user_optional(
    request: Request,
    header_token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_session)
) -> Optional[User]:
    """Get current authenticated user - optional version that returns None if not authenticated"""
    try:
        return get_current_user(request, header_token, db)
    except HTTPException:
        return None

def require_role(allowed_roles: list):
    """Decorator to require specific roles"""
    def _require_role(user: User = Depends(get_current_user)):
        if not user.role or user.role.name not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        return user
    return _require_role
