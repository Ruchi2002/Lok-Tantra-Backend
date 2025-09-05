"""
Enhanced Authentication Routes
Production-grade authentication endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from sqlmodel import Session
import logging
from sqlalchemy import select
from typing import Optional
from pydantic import BaseModel, Field

from database import get_session
from app.schemas.auth_schema import (
    LoginRequest, TokenResponse, PasswordResetRequest, 
    PasswordResetConfirm, PasswordChangeRequest, AuthResponse
)
from app.services.auth_service import auth_service
from app.core.auth import get_current_user
from typing import Union
from app.core.security import audit_logger, security_middleware, cookie_manager
from config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=TokenResponse)
async def login(
    payload: LoginRequest, 
    request: Request,
    response: Response,
    db: Session = Depends(get_session)
):
    """
    Authenticate user and return JWT access token with role-based expiry
    """
    try:
        # Get client information for audit logging
        client_ip = request.client.host
        user_agent = request.headers.get("user-agent", "")
        
        # Authenticate user
        token_response = auth_service.authenticate_user(
            payload=payload,
            db=db,
            client_ip=client_ip,
            user_agent=user_agent
        )
        
        # Set access token cookie with role-based expiry
        cookie_manager.set_access_token_cookie(
            response, 
            token_response.access_token,
            token_response.user_type
        )
        
        return token_response
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.post("/logout", response_model=AuthResponse)
async def logout(
    request: Request,
    response: Response,
    current_user = Depends(get_current_user)
):
    """
    Logout endpoint - logs the logout event and clears cookies
    """
    try:
        client_ip = request.client.host
        user_agent = request.headers.get("user-agent", "")
        
        # Log logout event
        audit_logger.log_auth_event(
            "LOGOUT",
            user_id=str(current_user.id),
            email=current_user.email,
            ip_address=client_ip,
            user_agent=user_agent,
            success=True
        )
        
        # Clear authentication cookies
        cookie_manager.clear_auth_cookies(response)
        
        return AuthResponse(
            success=True,
            message="Successfully logged out"
        )
        
    except Exception as e:
        logger.error(f"Logout error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.post("/logout-force", response_model=AuthResponse)
async def logout_force(
    request: Request,
    response: Response
):
    """
    Force logout endpoint - clears cookies without requiring authentication
    Used when user session has already expired
    """
    try:
        client_ip = request.client.host
        user_agent = request.headers.get("user-agent", "")
        
        # Log force logout event
        audit_logger.log_auth_event(
            "FORCE_LOGOUT",
            user_id="unknown",
            email="unknown",
            ip_address=client_ip,
            user_agent=user_agent,
            success=True
        )
        
        # Clear authentication cookies
        cookie_manager.clear_auth_cookies(response)
        
        return AuthResponse(
            success=True,
            message="Successfully logged out (force logout)"
        )
        
    except Exception as e:
        logger.error(f"Force logout error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.get("/me")
async def get_current_user_info(
    current_user = Depends(get_current_user),
    request: Request = None,
    db: Session = Depends(get_session)
):
    """
    Get current user information
    """
    try:
        # Determine user type based on the object type
        from app.models.user import User
        from app.models.tenant import Tenant
        from app.models.superadmin import SuperAdmin
        
        user_type = "user"  # Default
        if isinstance(current_user, SuperAdmin):
            user_type = "superadmin"
        elif isinstance(current_user, Tenant):
            user_type = "tenant"
        elif isinstance(current_user, User):
            user_type = "user"
        
        # Get role name safely
        role_name = None
        if hasattr(current_user, 'role') and current_user.role:
            if hasattr(current_user.role, 'name'):
                role_name = current_user.role.name
            else:
                role_name = str(current_user.role)
        elif hasattr(current_user, 'role_name'):
            role_name = current_user.role_name
        elif user_type == "superadmin":
            role_name = "Super_admins"  # Default role for superadmin
        elif user_type == "tenant":
            role_name = "Tenant_admin"  # Default role for tenant
        
        # Get user permissions from database using role_id
        permissions = []
        if hasattr(current_user, 'role_id') and current_user.role_id:
            try:
                from app.services.permission_service import permission_service
                permissions = permission_service.get_permissions_by_role_id(db, str(current_user.role_id))
            except Exception as e:
                logger.warning(f"Failed to fetch permissions for user {current_user.id}: {str(e)}")
                permissions = []
        
        user_info = {
            "id": current_user.id,
            "email": current_user.email,
            "name": getattr(current_user, 'name', ''),
            "role": role_name,
            "tenant_id": getattr(current_user, 'tenant_id', None),
            "status": getattr(current_user, 'status', 'active'),
            "user_type": user_type,
            "permissions": permissions
        }
        
        return user_info
        
    except Exception as e:
        logger.error(f"Get user info error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.post("/password-reset", response_model=AuthResponse)
async def request_password_reset(
    payload: PasswordResetRequest,
    request: Request,
    db: Session = Depends(get_session)
):
    """
    Request password reset token
    """
    try:
        client_ip = request.client.host
        
        # Create reset token
        reset_token = auth_service.create_password_reset_token(
            email=payload.email,
            db=db,
            client_ip=client_ip
        )
        
        # In a real implementation, you would send this token via email
        # For now, we'll return it in the response (NOT recommended for production)
        if settings.DEBUG:
            return AuthResponse(
                success=True,
                message="Password reset token created successfully",
                data={"reset_token": reset_token}
            )
        else:
            return AuthResponse(
                success=True,
                message="If the email exists, a password reset link has been sent"
            )
            
    except Exception as e:
        logger.error(f"Password reset request error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.post("/password-reset/confirm", response_model=AuthResponse)
async def confirm_password_reset(
    payload: PasswordResetConfirm,
    request: Request,
    db: Session = Depends(get_session)
):
    """
    Confirm password reset with token and new password
    """
    try:
        client_ip = request.client.host
        
        # Verify reset token
        email = auth_service.verify_password_reset_token(payload.token)
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token"
            )
        
        # Validate new password strength
        password_validation = auth_service.validate_password_strength(payload.new_password)
        if not password_validation["valid"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Password validation failed: {', '.join(password_validation['errors'])}"
            )
        
        # Find user and update password
        from app.crud.user_crud import get_user_by_email
        user = get_user_by_email(db, email)
    
        if not user:
            raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found"
                )
        
        # Hash new password
        hashed_password = auth_service.security_utils.hash_password(payload.new_password)
        
        # Update user password
        if hasattr(user, 'password_hash'):
            user.password_hash = hashed_password
        else:
            user.password = hashed_password
        
        db.commit()
        
        # Log password reset
        audit_logger.log_auth_event(
            "PASSWORD_RESET_SUCCESS",
        user_id=str(user.id),
            email=email,
            ip_address=client_ip,
            success=True
        )
        
        return AuthResponse(
            success=True,
            message="Password reset successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Password reset confirmation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.post("/change-password", response_model=AuthResponse)
async def change_password(
    payload: PasswordChangeRequest,
    request: Request,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """
    Change password for authenticated user
    """
    try:
        client_ip = request.client.host
        
        # Verify current password
        if not auth_service.security_utils.verify_password(
            payload.current_password, 
            current_user.password_hash or current_user.password
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )
        
        # Validate new password strength
        password_validation = auth_service.validate_password_strength(payload.new_password)
        if not password_validation["valid"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Password validation failed: {', '.join(password_validation['errors'])}"
            )
        
        # Hash new password
        hashed_password = auth_service.security_utils.hash_password(payload.new_password)
        
        # Update user password
        if hasattr(current_user, 'password_hash'):
            current_user.password_hash = hashed_password
        else:
            current_user.password = hashed_password
        
        db.commit()
        
        # Log password change
        audit_logger.log_auth_event(
            "PASSWORD_CHANGED",
            user_id=str(current_user.id),
            email=current_user.email,
            ip_address=client_ip,
            success=True
        )
        
        return AuthResponse(
            success=True,
            message="Password changed successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Password change error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.post("/validate-password")
async def validate_password_strength(payload: dict):
    """
    Validate password strength without changing it
    """
    try:
        password = payload.get("password", "")
        validation_result = auth_service.validate_password_strength(password)
        
        return {
            "valid": validation_result["valid"],
            "score": validation_result["score"],
            "errors": validation_result["errors"]
        }
        
    except Exception as e:
        logger.error(f"Password validation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

# Debug endpoint to help troubleshoot permission issues (only in debug mode)
@router.get("/debug-permissions")
async def debug_permissions(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """
    Debug endpoint to check user permissions (REMOVE IN PRODUCTION!)
    """
    if not settings.DEBUG:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Endpoint not found"
        )
    
    try:
        debug_info = {
            "user_id": str(current_user.id),
            "email": current_user.email,
            "role_id": getattr(current_user, 'role_id', None),
            "role_name": None,
            "user_type": getattr(current_user, 'user_type', 'user'),
            "has_role_object": hasattr(current_user, 'role') and current_user.role is not None,
            "permissions_fetched": [],
            "permissions_count": 0,
            "error": None
        }
        
        # Get role name
        if hasattr(current_user, 'role') and current_user.role:
            if hasattr(current_user.role, 'name'):
                debug_info["role_name"] = current_user.role.name
            else:
                debug_info["role_name"] = str(current_user.role)
        
        # Try to fetch permissions
        if hasattr(current_user, 'role_id') and current_user.role_id:
            try:
                from app.services.role_service import RoleService
                permissions = RoleService.get_user_permissions(db, str(current_user.id))
                debug_info["permissions_fetched"] = permissions
                debug_info["permissions_count"] = len(permissions)
            except Exception as e:
                debug_info["error"] = str(e)
        
        return debug_info
        
    except Exception as e:
        logger.error(f"Debug permissions error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )
