"""
Authentication Service
Business logic for authentication operations
"""

from typing import Optional, Dict, Any, Tuple
from datetime import datetime, timezone
from sqlmodel import Session, select
import logging

from database import get_session
from app.core.security import (
    security_utils, jwt_manager, audit_logger, 
    SecurityUtils, JWTManager, AuditLogger
)
from app.schemas.auth_schema import LoginRequest, TokenResponse, PasswordResetRequest
from app.crud.user_crud import get_user_by_email
from app.models.tenant import Tenant, TenantStatus
from app.models.superadmin import SuperAdmin
from app.models.user import User
from app.models.role import Role, RoleType
from app.models.role_permission import RolePermission
from app.models.permission import Permission
from app.services.role_service import RoleService
from app.services.permission_service import permission_service
from config import settings

logger = logging.getLogger(__name__)

class AuthenticationService:
    """Authentication service for handling all auth operations"""
    
    def __init__(self):
        self.security_utils = security_utils
        self.jwt_manager = jwt_manager
        self.audit_logger = audit_logger
    
    def authenticate_user(
        self, 
        payload: LoginRequest, 
        db: Session,
        client_ip: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> TokenResponse:
        """
        Authenticate user across all user types and return access token
        """
        logger.info(f"Authentication attempt for email: {payload.email}")
        
        # Sanitize input
        email = self.security_utils.sanitize_input(payload.email)
        password = payload.password
        
        # Validate email format
        if not self.security_utils.validate_email(email):
            self.audit_logger.log_auth_event(
                "LOGIN_FAILED",
                email=email,
                ip_address=client_ip,
                user_agent=user_agent,
                success=False,
                details={"reason": "Invalid email format"}
            )
            raise ValueError("Invalid email format")
        
        # Try to authenticate user
        user_data = self._find_and_authenticate_user(email, password, db)
        
        if not user_data:
            self.audit_logger.log_auth_event(
                "LOGIN_FAILED",
                email=email,
                ip_address=client_ip,
                user_agent=user_agent,
                success=False,
                details={"reason": "Invalid credentials"}
            )
            raise ValueError("Invalid credentials")
        
        # Create access token with role-based expiry
        access_token = self.jwt_manager.create_access_token(
            user_data["token_data"], 
            user_data["user_type"]
        )
        
        # Log successful login
        self.audit_logger.log_auth_event(
            "LOGIN_SUCCESS",
            user_id=user_data["user_id"],
            email=email,
            ip_address=client_ip,
            user_agent=user_agent,
            success=True,
            details={"user_type": user_data["user_type"]}
        )
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=self._get_token_expiry_minutes(user_data["user_type"]) * 60,
            user_id=user_data["user_id"],
            email=user_data["email"],
            role=user_data["role"],
            name=user_data["name"],
            tenant_id=user_data.get("tenant_id"),
            user_type=user_data["user_type"],
            permissions=user_data.get("permissions", [])
        )
    
    def _get_token_expiry_minutes(self, user_type: str) -> int:
        """Get token expiry minutes based on user type"""
        if user_type in ["superadmin", "tenant"]:
            return settings.ADMIN_TOKEN_EXPIRE_MINUTES
        else:
            return settings.MEMBER_TOKEN_EXPIRE_MINUTES
    
    def _find_and_authenticate_user(
        self, 
        email: str, 
        password: str, 
        db: Session
    ) -> Optional[Dict[str, Any]]:
        """
        Find and authenticate user across all user tables
        """
        # Check users table (assistants)
        user = get_user_by_email(db, email)
        if user and self._verify_user_password(user, password):
            return self._create_user_data(user, "user", db)
        
        # Check tenant table (tenant admins)
        tenant = db.exec(select(Tenant).where(Tenant.email == email)).first()
        if tenant and self._verify_tenant_password(tenant, password):
            return self._create_tenant_data(tenant, db)
        
        # Check super_admins table (super admins)
        super_admin = db.exec(select(SuperAdmin).where(SuperAdmin.email == email)).first()
        if super_admin and self._verify_superadmin_password(super_admin, password):
            return self._create_superadmin_data(super_admin, db)
        
        return None
    
    def _verify_user_password(self, user: User, password: str) -> bool:
        """Verify user password and check status"""
        if not self.security_utils.verify_password(password, user.password_hash or user.password):
            return False
        
        # Check if user is active
        if getattr(user, 'status', 'active') != 'active':
            return False
        
        return True
    
    def _verify_tenant_password(self, tenant: Tenant, password: str) -> bool:
        """Verify tenant password and check status"""
        if not self.security_utils.verify_password(password, tenant.password):
            return False
        
        # Check if tenant is active
        if tenant.status != TenantStatus.ACTIVE:
            return False
        
        return True
    
    def _verify_superadmin_password(self, super_admin: SuperAdmin, password: str) -> bool:
        """Verify super admin password and check status"""
        if not self.security_utils.verify_password(password, super_admin.password_hash):
            return False
        
        # Check if super admin is active
        if not super_admin.is_active:
            return False
        
        return True
    
    def _create_user_data(self, user: User, user_type: str, db: Session) -> Dict[str, Any]:
        """Create user data for token generation"""
        # Get role name
        role_name = "assistant"  # Default
        if hasattr(user, 'role') and user.role and hasattr(user.role, 'name'):
            role_name = user.role.name
            logger.info(f"User {user.email} has role from database: {role_name}")
            # Normalize role names for consistency
            if role_name.lower() in ["fieldagent", "field_agent"]:
                role_name = "FieldAgent"
                logger.info(f"Normalized role name to: {role_name}")
        else:
            logger.warning(f"User {user.email} has no role object or role name")
        
        # Get user permissions from database using role_id
        permissions = []
        if user.role_id:
            permissions = permission_service.get_permissions_by_role_id(db, str(user.role_id))
            logger.info(f"Fetched {len(permissions)} permissions for user {user.id}")
        
        return {
            "user_id": str(user.id),
            "email": user.email,
            "name": user.name,
            "role": role_name,
            "tenant_id": getattr(user, "tenant_id", None),
            "user_type": user_type,
            "permissions": permissions,
            "token_data": {
                "sub": f"user_{user.id}",
                "email": user.email,
                "role": role_name,
                "tenant_id": getattr(user, "tenant_id", None),
                "user_type": user_type
            }
        }
    
    def _create_tenant_data(self, tenant: Tenant, db: Session) -> Dict[str, Any]:
        """Create tenant data for token generation"""
        # For tenants, we need to find their role and get permissions
        permissions = []
        
        # Find tenant admin role
        try:
            from app.models.role import Role, RoleType
            tenant_role = db.exec(
                select(Role)
                .where(Role.role_type == RoleType.ADMIN)
                .where(Role.is_active == True)
            ).first()
            
            if tenant_role:
                permissions = permission_service.get_permissions_by_role_id(db, str(tenant_role.id))
                logger.info(f"Fetched {len(permissions)} permissions for tenant {tenant.id}")
        except Exception as e:
            logger.warning(f"Failed to fetch tenant permissions: {str(e)}")
        
        return {
            "user_id": str(tenant.id),
            "email": tenant.email,
            "name": tenant.name,
            "role": "Tenant_admin",
            "tenant_id": str(tenant.id),
            "user_type": "tenant",
            "permissions": permissions,
            "token_data": {
                "sub": f"tenant_{tenant.id}",
                "email": tenant.email,
                "role": "Tenant_admin",
                "tenant_id": str(tenant.id),
                "user_type": "tenant"
            }
        }
    
    def _create_superadmin_data(self, super_admin: SuperAdmin, db: Session) -> Dict[str, Any]:
        """Create super admin data for token generation"""
        # For super admins, get all permissions
        permissions = []
        
        try:
            from app.models.permission import Permission
            all_permissions = db.exec(
                select(Permission)
                .where(Permission.is_active == True)
            ).all()
            
            permissions = [p.name for p in all_permissions]
            logger.info(f"Fetched {len(permissions)} permissions for super admin {super_admin.id}")
        except Exception as e:
            logger.warning(f"Failed to fetch super admin permissions: {str(e)}")
        
        return {
            "user_id": str(super_admin.id),
            "email": super_admin.email,
            "name": super_admin.name,
            "role": "Super_admins",
            "tenant_id": None,
            "user_type": "superadmin",
            "permissions": permissions,
            "token_data": {
                "sub": f"superadmin_{super_admin.id}",
                "email": super_admin.email,
                "role": "Super_admins",
                "tenant_id": None,
                "user_type": "superadmin"
            }
        }
    
    def validate_password_strength(self, password: str) -> Dict[str, Any]:
        """Validate password strength"""
        return self.security_utils.validate_password_strength(password)
    
    def create_password_reset_token(
        self, 
        email: str,
        db: Session,
        client_ip: Optional[str] = None
    ) -> str:
        """
        Create password reset token for given email
        """
        # Check if user exists
        user = get_user_by_email(db, email)
        if not user:
            # Don't reveal if user exists or not
            logger.info(f"Password reset requested for non-existent email: {email}")
            return ""
        
        # Create reset token
        reset_token = self.jwt_manager.create_password_reset_token(email)
        
        # Log password reset request
        self.audit_logger.log_auth_event(
            "PASSWORD_RESET_REQUESTED",
            user_id=str(user.id),
            email=email,
            ip_address=client_ip,
            success=True
        )
        
        return reset_token
    
    def verify_password_reset_token(self, token: str) -> Optional[str]:
        """
        Verify password reset token and return email
        """
        payload = self.jwt_manager.decode_token(token)
        if not payload or payload.get("type") != "password_reset":
            return None
        
        if self.jwt_manager.is_token_expired(payload):
            return None
        
        return payload.get("sub")  # Email is stored in 'sub' field

# Global instance
auth_service = AuthenticationService()
