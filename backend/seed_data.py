#!/usr/bin/env python3
"""
Enhanced Seed Data Script for Smart Politician Assistant
Creates comprehensive, realistic test data for reliable testing
"""

from sqlmodel import Session, create_engine
from app.models.tenant import Tenant, TenantStatus
from app.models.user import User
from app.models.role import Role, RoleType, RoleScope
from app.models.Issue_category import IssueCategory
from app.models.area import Area
from app.models.permission import Permission, PermissionCategory
from app.models.role_permission import RolePermission
from app.models.citizen_issues import CitizenIssue
from app.models.visit import Visit
from app.models.visit_issue import VisitIssue
from database import engine
import bcrypt
from datetime import datetime, date, timedelta
import random
import json

def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    # Encode password to bytes
    password_bytes = password.encode('utf-8')
    # Hash with 12 rounds (enhanced security)
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password_bytes, salt)
    # Return as string
    return hashed.decode('utf-8')

def create_geojson_polygon(lat: float, lng: float, radius: float = 0.01) -> str:
    """Create a simple polygon GeoJSON around a point"""
    coords = [
        [lng - radius, lat - radius],
        [lng + radius, lat - radius],
        [lng + radius, lat + radius],
        [lng - radius, lat + radius],
        [lng - radius, lat - radius]
    ]
    return json.dumps({
        "type": "Polygon",
        "coordinates": [coords]
    })

def seed_initial_data():
    """Seed the database with comprehensive, realistic data"""
    
    with Session(engine) as session:
        print("🌱 Seeding comprehensive test data...")
        
        # 1. Create roles
        print("Creating roles...")
        super_admin_role = Role(
            name="SuperAdmin",
            role_type=RoleType.SUPER_ADMIN,
            scope=RoleScope.GLOBAL,
            description="System-wide administrator with full access",
            is_system_role=True,
            is_active=True
        )
        session.add(super_admin_role)
        
        admin_role = Role(
            name="Admin",
            role_type=RoleType.ADMIN,
            scope=RoleScope.TENANT,
            description="Tenant administrator with management privileges",
            is_system_role=True,
            is_active=True
        )
        session.add(admin_role)
        
        member_role = Role(
            name="Member",
            role_type=RoleType.MEMBER,
            scope=RoleScope.TENANT,
            description="Basic user with limited access",
            is_system_role=True,
            is_active=True
        )
        session.add(member_role)
        
        field_agent_role = Role(
            name="FieldAgent",
            role_type=RoleType.MEMBER,
            scope=RoleScope.TENANT,
            description="Field agent for on-ground operations",
            is_system_role=True,
            is_active=True
        )
        session.add(field_agent_role)
        
        session.commit()
        session.refresh(super_admin_role)
        session.refresh(admin_role)
        session.refresh(member_role)
        session.refresh(field_agent_role)
        print("✅ Roles created")
        
        # 2. Create permissions
        print("Creating permissions...")
        permissions_data = [
            # System permissions
            ("system.view", "View System", PermissionCategory.SYSTEM, "Access system overview"),
            ("system.manage", "Manage System", PermissionCategory.SYSTEM, "Full system management"),
            
            # Tenant permissions
            ("tenant.view", "View Tenant", PermissionCategory.TENANT, "View tenant information"),
            ("tenant.manage", "Manage Tenant", PermissionCategory.TENANT, "Manage tenant settings"),
            
            # User permissions
            ("user.view", "View Users", PermissionCategory.USER, "View user list and details"),
            ("user.create", "Create Users", PermissionCategory.USER, "Create new users"),
            ("user.edit", "Edit Users", PermissionCategory.USER, "Edit user information"),
            ("user.delete", "Delete Users", PermissionCategory.USER, "Delete users"),
            
            # Issue permissions
            ("issue.view", "View Issues", PermissionCategory.ISSUE, "View citizen issues"),
            ("issue.create", "Create Issues", PermissionCategory.ISSUE, "Create new issues"),
            ("issue.edit", "Edit Issues", PermissionCategory.ISSUE, "Edit issue details"),
            ("issue.assign", "Assign Issues", PermissionCategory.ISSUE, "Assign issues to users"),
            ("issue.resolve", "Resolve Issues", PermissionCategory.ISSUE, "Mark issues as resolved"),
            
            # Visit permissions
            ("visit.view", "View Visits", PermissionCategory.VISIT, "View scheduled visits"),
            ("visit.create", "Create Visits", PermissionCategory.VISIT, "Schedule new visits"),
            ("visit.edit", "Edit Visits", PermissionCategory.VISIT, "Edit visit details"),
            ("visit.complete", "Complete Visits", PermissionCategory.VISIT, "Mark visits as completed"),
            
            # Area permissions
            ("area.view", "View Areas", PermissionCategory.AREA, "View area information"),
            ("area.create", "Create Areas", PermissionCategory.AREA, "Create new areas"),
            ("area.edit", "Edit Areas", PermissionCategory.AREA, "Edit area details"),
            
            # Report permissions
            ("report.view", "View Reports", PermissionCategory.REPORT, "Access reports and analytics"),
            ("report.export", "Export Reports", PermissionCategory.REPORT, "Export report data"),
            
            # Settings permissions
            ("settings.view", "View Settings", PermissionCategory.SETTINGS, "View system settings"),
            ("settings.edit", "Edit Settings", PermissionCategory.SETTINGS, "Modify system settings"),
        ]
        
        permissions = {}
        for perm_name, display_name, category, description in permissions_data:
            permission = Permission(
                name=perm_name,
                display_name=display_name,
                category=category,
                description=description,
                is_system_permission=True,
                is_active=True
            )
            session.add(permission)
            permissions[perm_name] = permission
        
        session.commit()
        print(f"✅ Created {len(permissions)} permissions")
        
        # 3. Create role-permission mappings
        print("Creating role-permission mappings...")
        
        # SuperAdmin gets all permissions
        for permission in permissions.values():
            role_perm = RolePermission(role_id=super_admin_role.id, permission_id=permission.id)
            session.add(role_perm)
        
        # Admin gets most permissions except system management
        admin_permissions = [p for name, p in permissions.items() if not name.startswith("system.")]
        for permission in admin_permissions:
            role_perm = RolePermission(role_id=admin_role.id, permission_id=permission.id)
            session.add(role_perm)
        
        # Member gets basic permissions
        member_permissions = [
            "issue.view", "issue.create", "visit.view", "visit.create", 
            "area.view", "report.view"
        ]
        for perm_name in member_permissions:
            if perm_name in permissions:
                role_perm = RolePermission(role_id=member_role.id, permission_id=permissions[perm_name].id)
                session.add(role_perm)
        
        # Field agent gets field-specific permissions
        field_permissions = [
            "issue.view", "issue.edit", "visit.view", "visit.edit", "visit.complete",
            "area.view", "report.view"
        ]
        for perm_name in field_permissions:
            if perm_name in permissions:
                role_perm = RolePermission(role_id=field_agent_role.id, permission_id=permissions[perm_name].id)
                session.add(role_perm)
        
        session.commit()
        print("✅ Role-permission mappings created")
        
        # 4. Create multiple tenants
        print("Creating tenants...")
        tenants_data = [
            {
                "name": "Mumbai Municipal Corporation",
                "email": "admin@mumbai.gov.in",
                "password": "mumbai@2024",
                "status": TenantStatus.ACTIVE
            },
            {
                "name": "Delhi Development Authority",
                "email": "admin@dda.gov.in", 
                "password": "delhi@2024",
                "status": TenantStatus.ACTIVE
            },
            {
                "name": "Bangalore City Corporation",
                "email": "admin@bbmp.gov.in",
                "password": "bangalore@2024", 
                "status": TenantStatus.ACTIVE
            },
            {
                "name": "Chennai Municipal Corporation",
                "email": "admin@chennai.gov.in",
                "password": "chennai@2024",
                "status": TenantStatus.ACTIVE
            }
        ]
        
        tenants = {}
        for tenant_data in tenants_data:
            tenant = Tenant(
                name=tenant_data["name"],
                email=tenant_data["email"],
                password=hash_password(tenant_data["password"]),  # Now using bcrypt
                status=tenant_data["status"]
            )
            session.add(tenant)
            tenants[tenant_data["name"]] = tenant
        
        session.commit()
        print(f"✅ Created {len(tenants)} tenants")
        
        # 5. Create areas for each tenant
        print("Creating areas...")
        areas_data = {
            "Mumbai Municipal Corporation": [
                {"name": "Andheri West", "lat": 19.1197, "lng": 72.8464},
                {"name": "Bandra West", "lat": 19.0596, "lng": 72.8295},
                {"name": "Juhu", "lat": 19.0996, "lng": 72.8347},
                {"name": "Worli", "lat": 19.0176, "lng": 72.8138},
                {"name": "Colaba", "lat": 18.9149, "lng": 72.8316}
            ],
            "Delhi Development Authority": [
                {"name": "Connaught Place", "lat": 28.6315, "lng": 77.2167},
                {"name": "Khan Market", "lat": 28.6001, "lng": 77.2276},
                {"name": "Lajpat Nagar", "lat": 28.5675, "lng": 77.2431},
                {"name": "Hauz Khas", "lat": 28.5478, "lng": 77.2014},
                {"name": "Dwarka", "lat": 28.5921, "lng": 77.0485}
            ],
            "Bangalore City Corporation": [
                {"name": "Indiranagar", "lat": 12.9789, "lng": 77.6412},
                {"name": "Koramangala", "lat": 12.9349, "lng": 77.6055},
                {"name": "Whitefield", "lat": 12.9692, "lng": 77.7499},
                {"name": "Electronic City", "lat": 12.8458, "lng": 77.6658},
                {"name": "Marathahalli", "lat": 12.9584, "lng": 77.7014}
            ],
            "Chennai Municipal Corporation": [
                {"name": "T Nagar", "lat": 13.0367, "lng": 80.2423},
                {"name": "Anna Nagar", "lat": 13.0827, "lng": 80.2707},
                {"name": "Adyar", "lat": 13.0067, "lng": 80.2544},
                {"name": "Mylapore", "lat": 13.0370, "lng": 80.2707},
                {"name": "Velachery", "lat": 12.9789, "lng": 80.2204}
            ]
        }
        
        areas = {}
        for tenant_name, tenant_areas in areas_data.items():
            tenant = tenants[tenant_name]
            for area_data in tenant_areas:
                area = Area(
                    name=area_data["name"],
                    description=f"Administrative area in {tenant_name}",
                    tenant_id=tenant.id,
                    latitude=area_data["lat"],
                    longitude=area_data["lng"],
                    geojson_data=create_geojson_polygon(area_data["lat"], area_data["lng"]),
                    is_active=True
                )
                session.add(area)
                areas[f"{tenant_name}_{area_data['name']}"] = area
        
        session.commit()
        print(f"✅ Created {len(areas)} areas")
        
        # 6. Create users for each tenant
        print("Creating users...")
        users_data = {
            "Mumbai Municipal Corporation": [
                {"name": "Rajesh Kumar", "email": "rajesh@mumbai.gov.in", "role": admin_role, "phone": "9876543210"},
                {"name": "Priya Sharma", "email": "priya@mumbai.gov.in", "role": field_agent_role, "phone": "9876543211"},
                {"name": "Amit Patel", "email": "amit@mumbai.gov.in", "role": member_role, "phone": "9876543212"},
                {"name": "Sneha Reddy", "email": "sneha@mumbai.gov.in", "role": field_agent_role, "phone": "9876543213"}
            ],
            "Delhi Development Authority": [
                {"name": "Vikram Singh", "email": "vikram@dda.gov.in", "role": admin_role, "phone": "9876543220"},
                {"name": "Meera Gupta", "email": "meera@dda.gov.in", "role": field_agent_role, "phone": "9876543221"},
                {"name": "Arjun Malhotra", "email": "arjun@dda.gov.in", "role": member_role, "phone": "9876543222"},
                {"name": "Kavya Joshi", "email": "kavya@dda.gov.in", "role": field_agent_role, "phone": "9876543223"}
            ],
            "Bangalore City Corporation": [
                {"name": "Suresh Kumar", "email": "suresh@bbmp.gov.in", "role": admin_role, "phone": "9876543230"},
                {"name": "Anjali Rao", "email": "anjali@bbmp.gov.in", "role": field_agent_role, "phone": "9876543231"},
                {"name": "Rahul Iyer", "email": "rahul@bbmp.gov.in", "role": member_role, "phone": "9876543232"},
                {"name": "Divya Menon", "email": "divya@bbmp.gov.in", "role": field_agent_role, "phone": "9876543233"}
            ],
            "Chennai Municipal Corporation": [
                {"name": "Karthik Rajan", "email": "karthik@chennai.gov.in", "role": admin_role, "phone": "9876543240"},
                {"name": "Lakshmi Devi", "email": "lakshmi@chennai.gov.in", "role": field_agent_role, "phone": "9876543241"},
                {"name": "Mohan Kumar", "email": "mohan@chennai.gov.in", "role": member_role, "phone": "9876543242"},
                {"name": "Geetha Priya", "email": "geetha@chennai.gov.in", "role": field_agent_role, "phone": "9876543243"}
            ]
        }
        
        users = {}
        for tenant_name, tenant_users in users_data.items():
            tenant = tenants[tenant_name]
            for user_data in tenant_users:
                user = User(
                    name=user_data["name"],
                    email=user_data["email"],
                    password_hash=hash_password("password123"),  # Now using bcrypt
                    phone=user_data["phone"],
                    status="active",
                    language_preference="English",
                    role_id=user_data["role"].id,
                    tenant_id=tenant.id
                )
                session.add(user)
                users[user_data["email"]] = user
        
        session.commit()
        print(f"✅ Created {len(users)} users")
        
        # 7. Create issue categories
        print("Creating issue categories...")
        categories_data = [
            "Roads & Infrastructure",
            "Water Supply", 
            "Sanitation",
            "Street Lighting",
            "Public Transport",
            "Healthcare",
            "Education",
            "Parks & Recreation",
            "Waste Management",
            "Traffic Management",
            "Public Safety",
            "Environmental Issues"
        ]
        
        categories = {}
        for category_name in categories_data:
            category = IssueCategory(name=category_name)
            session.add(category)
            categories[category_name] = category
        
        session.commit()
        print(f"✅ Created {len(categories)} categories")
        
        # 8. Create realistic citizen issues
        print("Creating citizen issues...")
        issue_templates = [
            {
                "title": "Pothole on Main Road",
                "description": "Large pothole causing traffic congestion and vehicle damage",
                "category": "Roads & Infrastructure",
                "priority": "High",
                "status": "Open"
            },
            {
                "title": "Water Supply Disruption",
                "description": "No water supply for the past 3 days in the area",
                "category": "Water Supply", 
                "priority": "High",
                "status": "In Progress"
            },
            {
                "title": "Street Light Not Working",
                "description": "Street light pole number 45 is not functioning since last week",
                "category": "Street Lighting",
                "priority": "Medium",
                "status": "Open"
            },
            {
                "title": "Garbage Not Collected",
                "description": "Garbage collection has been irregular for the past week",
                "category": "Waste Management",
                "priority": "Medium",
                "status": "Resolved"
            },
            {
                "title": "Public Park Maintenance",
                "description": "Children's play equipment needs repair and maintenance",
                "category": "Parks & Recreation",
                "priority": "Low",
                "status": "Open"
            },
            {
                "title": "Traffic Signal Malfunction",
                "description": "Traffic signal at the main intersection is not working properly",
                "category": "Traffic Management",
                "priority": "High",
                "status": "In Progress"
            },
            {
                "title": "Sewage Overflow",
                "description": "Sewage water overflowing from manhole near residential area",
                "category": "Sanitation",
                "priority": "High",
                "status": "Open"
            },
            {
                "title": "Public Transport Delay",
                "description": "Bus service is frequently delayed during peak hours",
                "category": "Public Transport",
                "priority": "Medium",
                "status": "Open"
            }
        ]
        
        # Create issues for each area
        issues = []
        for area_key, area in areas.items():
            # Create 3-8 issues per area
            num_issues = random.randint(3, 8)
            for i in range(num_issues):
                template = random.choice(issue_templates)
                tenant_name = area_key.split('_')[0]
                tenant = tenants[tenant_name]
                
                # Get random user from the same tenant
                tenant_users = [u for u in users.values() if u.tenant_id == tenant.id]
                created_by = random.choice(tenant_users)
                assigned_to = random.choice(tenant_users) if random.random() > 0.3 else None
                
                issue = CitizenIssue(
                    title=f"{template['title']} - {area.name}",
                    description=template['description'],
                    status=template['status'],
                    priority=template['priority'],
                    category_id=categories[template['category']].id,
                    created_by=created_by.id,
                    assigned_to=assigned_to.id if assigned_to else None,
                    area_id=area.id,
                    tenant_id=tenant.id,
                    location=f"{area.name}, {tenant_name}",
                    latitude=area.latitude + random.uniform(-0.001, 0.001),
                    longitude=area.longitude + random.uniform(-0.001, 0.001)
                )
                session.add(issue)
                issues.append(issue)
        
        session.commit()
        print(f"✅ Created {len(issues)} citizen issues")
        
        # 9. Create visits for some issues
        print("Creating visits...")
        visit_statuses = ["Upcoming", "Completed", "Rejected", "Cancelled"]
        visit_reasons = [
            "Site inspection required",
            "Issue verification needed", 
            "Follow-up visit",
            "Resolution assessment",
            "Public consultation"
        ]
        
        visits = []
        for issue in random.sample(issues, min(50, len(issues))):  # Create visits for 50 random issues
            tenant_users = [u for u in users.values() if u.tenant_id == issue.tenant_id]
            assistant = random.choice(tenant_users)
            
            # Random date within next 30 days
            visit_date = date.today() + timedelta(days=random.randint(1, 30))
            visit_time = datetime.strptime(f"{random.randint(9, 17)}:{random.randint(0, 59):02d}", "%H:%M").time()
            
            visit = Visit(
                citizen_issue_id=issue.id,
                assistant_id=assistant.id,
                area_id=issue.area_id,
                tenant_id=issue.tenant_id,
                visit_reason=random.choice(visit_reasons),
                location=issue.location,
                priority=issue.priority,
                visit_date=visit_date,
                visit_time=visit_time,
                status=random.choice(visit_statuses),
                notes=f"Visit scheduled for {issue.title}"
            )
            session.add(visit)
            visits.append(visit)
        
        session.commit()
        print(f"✅ Created {len(visits)} visits")
        
        print("\n🎉 Comprehensive seeding completed!")
        print("\n📋 Test Data Summary:")
        print(f"   • {len(tenants)} Tenants")
        print(f"   • {len(areas)} Areas") 
        print(f"   • {len(users)} Users")
        print(f"   • {len(categories)} Issue Categories")
        print(f"   • {len(permissions)} Permissions")
        print(f"   • {len(issues)} Citizen Issues")
        print(f"   • {len(visits)} Visits")
        
        print("\n🔑 Default Login Credentials:")
        for tenant_name, tenant_data in tenants_data.items():
            print(f"   {tenant_name}:")
            print(f"     Email: {tenant_data['email']}")
            print(f"     Password: {tenant_data['password']}")
        
        print("\n👥 Sample User Logins:")
        sample_users = list(users.keys())[:3]
        for email in sample_users:
            print(f"   Email: {email}")
            print(f"   Password: password123")

if __name__ == "__main__":
    seed_initial_data()
