"""
Permission Service
Simple permission fetching based on role_id
"""

from typing import List
from sqlmodel import Session, select
import logging

from app.models.role_permission import RolePermission
from app.models.permission import Permission

logger = logging.getLogger(__name__)

class PermissionService:
    """Simple permission service"""
    
    @staticmethod
    def get_permissions_by_role_id(db: Session, role_id: str) -> List[str]:
        """
        Get permissions for a role_id
        
        Args:
            db: Database session
            role_id: Role ID
            
        Returns:
            List of permission names
        """
        try:
            if not role_id:
                return []
            
            # Get role permissions
            role_permissions = db.exec(
                select(RolePermission)
                .where(RolePermission.role_id == role_id)
            ).all()
            
            # Get permission names
            permission_ids = [rp.permission_id for rp in role_permissions]
            permissions = db.exec(
                select(Permission)
                .where(Permission.id.in_(permission_ids))
                .where(Permission.is_active == True)
            ).all()
            
            return [p.name for p in permissions]
            
        except Exception as e:
            logger.error(f"Error fetching permissions for role {role_id}: {str(e)}")
            return []

# Global instance
permission_service = PermissionService()
