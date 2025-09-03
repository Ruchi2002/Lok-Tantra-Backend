from sqlmodel import Session, select
from typing import List, Optional, Dict
from app.models.role import Role, RoleType, RoleScope
from app.models.permission import Permission, PermissionCategory
from app.models.role_permission import RolePermission
import uuid

class RoleService:
    """Enterprise role management service"""
    
    @staticmethod
    def create_system_roles(db: Session) -> Dict[str, Role]:
        """Create default system roles"""
        roles = {}
        
        # Create SuperAdmin role
        super_admin_role = Role(
            name="SuperAdmin",
            role_type=RoleType.SUPER_ADMIN,
            scope=RoleScope.GLOBAL,
            description="System-wide administrator with full access",
            is_system_role=True,
            is_active=True
        )
        db.add(super_admin_role)
        db.commit()
        db.refresh(super_admin_role)
        roles["super_admin"] = super_admin_role
        
        # Create Admin role
        admin_role = Role(
            name="Admin",
            role_type=RoleType.ADMIN,
            scope=RoleScope.TENANT,
            description="Tenant administrator with organization-level access",
            is_system_role=True,
            is_active=True
        )
        db.add(admin_role)
        db.commit()
        db.refresh(admin_role)
        roles["admin"] = admin_role
        
        # Create Member role
        member_role = Role(
            name="Member",
            role_type=RoleType.MEMBER,
            scope=RoleScope.TENANT,
            description="Basic user with limited access",
            is_system_role=True,
            is_active=True
        )
        db.add(member_role)
        db.commit()
        db.refresh(member_role)
        roles["member"] = member_role
        
        return roles
    
    @staticmethod
    def create_default_permissions(db: Session) -> Dict[str, Permission]:
        """Create default system permissions"""
        permissions = {}
        
        # Define default permissions
        default_permissions = [
            # System Management Permissions
            {
                "name": "system_manage_users",
                "display_name": "Manage System Users",
                "category": PermissionCategory.SYSTEM,
                "description": "Create, update, and delete system users",
                "scope": "global"
            },
            {
                "name": "system_manage_tenants",
                "display_name": "Manage Tenants",
                "category": PermissionCategory.SYSTEM,
                "description": "Create, update, and delete tenant organizations",
                "scope": "global"
            },
            {
                "name": "system_manage_roles",
                "display_name": "Manage Roles",
                "category": PermissionCategory.SYSTEM,
                "description": "Create, update, and delete system roles",
                "scope": "global"
            },
            {
                "name": "system_manage_permissions",
                "display_name": "Manage Permissions",
                "category": PermissionCategory.SYSTEM,
                "description": "Create, update, and delete system permissions",
                "scope": "global"
            },
            {
                "name": "system_view_all_reports",
                "display_name": "View All Reports",
                "category": PermissionCategory.SYSTEM,
                "description": "Access to all system reports and analytics",
                "scope": "global"
            },
            {
                "name": "system_manage_settings",
                "display_name": "Manage System Settings",
                "category": PermissionCategory.SYSTEM,
                "description": "Configure system-wide settings",
                "scope": "global"
            },
            
            # Tenant Management Permissions
            {
                "name": "tenant_manage_users",
                "display_name": "Manage Tenant Users",
                "category": PermissionCategory.TENANT,
                "description": "Create, update, and delete users within tenant",
                "scope": "tenant"
            },
            {
                "name": "tenant_manage_issues",
                "display_name": "Manage Issues",
                "category": PermissionCategory.ISSUE,
                "description": "Create, update, and delete citizen issues",
                "scope": "tenant"
            },
            {
                "name": "tenant_manage_visits",
                "display_name": "Manage Visits",
                "category": PermissionCategory.VISIT,
                "description": "Create, update, and delete visits",
                "scope": "tenant"
            },
            {
                "name": "tenant_view_reports",
                "display_name": "View Reports",
                "category": PermissionCategory.REPORT,
                "description": "Access to tenant reports and analytics",
                "scope": "tenant"
            },
            {
                "name": "tenant_manage_areas",
                "display_name": "Manage Areas",
                "category": PermissionCategory.AREA,
                "description": "Create, update, and delete areas",
                "scope": "tenant"
            },
            
            # User Management Permissions
            {
                "name": "user_view_issues",
                "display_name": "View Issues",
                "category": PermissionCategory.ISSUE,
                "description": "View citizen issues",
                "scope": "tenant"
            },
            {
                "name": "user_create_issues",
                "display_name": "Create Issues",
                "category": PermissionCategory.ISSUE,
                "description": "Create new citizen issues",
                "scope": "tenant"
            },
            {
                "name": "user_manage_own_visits",
                "display_name": "Manage Own Visits",
                "category": PermissionCategory.VISIT,
                "description": "Create and manage own visits",
                "scope": "tenant"
            },
            {
                "name": "user_view_own_reports",
                "display_name": "View Own Reports",
                "category": PermissionCategory.REPORT,
                "description": "View own activity reports",
                "scope": "tenant"
            }
        ]
        
        # Create permissions in database
        for perm_data in default_permissions:
            permission = Permission(
                name=perm_data["name"],
                display_name=perm_data["display_name"],
                category=perm_data["category"],
                description=perm_data["description"],
                scope=perm_data["scope"],
                is_system_permission=True,
                is_active=True
            )
            db.add(permission)
            db.commit()
            db.refresh(permission)
            permissions[perm_data["name"]] = permission
        
        return permissions
    
    @staticmethod
    def assign_default_permissions_to_roles(db: Session, roles: Dict[str, Role], permissions: Dict[str, Permission]):
        """Assign default permissions to roles"""
        
        # Super Admin gets all permissions
        super_admin_role = roles.get("super_admin")
        if super_admin_role:
            for permission in permissions.values():
                role_permission = RolePermission(
                    role_id=super_admin_role.id,
                    permission_id=permission.id
                )
                db.add(role_permission)
        
        # Admin gets tenant and user permissions
        admin_role = roles.get("admin")
        if admin_role:
            admin_permissions = [
                "tenant_manage_users", "tenant_manage_issues", "tenant_manage_visits",
                "tenant_view_reports", "tenant_manage_areas",
                "user_view_issues", "user_create_issues", "user_manage_own_visits", "user_view_own_reports"
            ]
            for perm_name in admin_permissions:
                if perm_name in permissions:
                    role_permission = RolePermission(
                        role_id=admin_role.id,
                        permission_id=permissions[perm_name].id
                    )
                    db.add(role_permission)
        
        # Member gets basic user permissions
        member_role = roles.get("member")
        if member_role:
            member_permissions = [
                "user_view_issues", "user_create_issues", "user_manage_own_visits", "user_view_own_reports"
            ]
            for perm_name in member_permissions:
                if perm_name in permissions:
                    role_permission = RolePermission(
                        role_id=member_role.id,
                        permission_id=permissions[perm_name].id
                    )
                    db.add(role_permission)
        
        db.commit()
    
    @staticmethod
    def get_user_permissions(db: Session, user_id: str) -> List[str]:
        """Get all permissions for a user"""
        from app.models.user import User
        
        user = db.get(User, user_id)
        if not user or not user.role_id:
            return []
        
        # Get role permissions
        role_permissions = db.exec(
            select(RolePermission)
            .where(RolePermission.role_id == user.role_id)
        ).all()
        
        # Get permission names
        permission_ids = [rp.permission_id for rp in role_permissions]
        permissions = db.exec(
            select(Permission)
            .where(Permission.id.in_(permission_ids))
            .where(Permission.is_active == True)
        ).all()
        
        return [p.name for p in permissions]
    
    @staticmethod
    def has_permission(db: Session, user_id: str, permission_name: str) -> bool:
        """Check if user has specific permission"""
        user_permissions = RoleService.get_user_permissions(db, user_id)
        return permission_name in user_permissions
    
    @staticmethod
    def get_role_by_type(db: Session, role_type: RoleType) -> Optional[Role]:
        """Get role by type"""
        return db.exec(
            select(Role)
            .where(Role.role_type == role_type)
            .where(Role.is_active == True)
        ).first()
