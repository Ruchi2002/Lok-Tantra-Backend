#!/usr/bin/env python3
"""
Script to add a super admin user to the database
"""

from sqlmodel import Session, select
from app.models.superadmin import SuperAdmin
from app.core.auth import hash_password
from database import engine
import uuid

def add_super_admin():
    """Add a new super admin user"""
    
    # Super admin data
    name = "Ruchi"
    email = "ruchichaudhary.work@gmail.com"
    password = "15$11$2002_R"
    
    with Session(engine) as session:
        print("🔍 Checking if super admin already exists...")
        
        # Check if super admin with this email already exists
        existing_super_admin = session.exec(
            select(SuperAdmin).where(SuperAdmin.email == email)
        ).first()
        
        if existing_super_admin:
            print(f"❌ Super admin with email '{email}' already exists!")
            print(f"   ID: {existing_super_admin.id}")
            print(f"   Name: {existing_super_admin.name}")
            print(f"   Created: {existing_super_admin.created_at}")
            return False
        
        print("✅ No existing super admin found. Creating new one...")
        
        # Hash the password
        hashed_password = hash_password(password)
        
        # Create new super admin
        new_super_admin = SuperAdmin(
            id=str(uuid.uuid4()),
            name=name,
            email=email,
            password_hash=hashed_password,
            is_active=True,
            created_by=None  # No creator since this is the initial super admin
        )
        
        # Add to database
        session.add(new_super_admin)
        session.commit()
        session.refresh(new_super_admin)
        
        print("✅ Super admin created successfully!")
        print(f"   ID: {new_super_admin.id}")
        print(f"   Name: {new_super_admin.name}")
        print(f"   Email: {new_super_admin.email}")
        print(f"   Status: {'Active' if new_super_admin.is_active else 'Inactive'}")
        print(f"   Created: {new_super_admin.created_at}")
        
        return True

def list_all_super_admins():
    """List all super admins in the database"""
    
    with Session(engine) as session:
        print("\n📋 All Super Admins in Database:")
        print("-" * 50)
        
        super_admins = session.exec(select(SuperAdmin)).all()
        
        if not super_admins:
            print("No super admins found in database.")
            return
        
        for i, sa in enumerate(super_admins, 1):
            print(f"{i}. {sa.name}")
            print(f"   Email: {sa.email}")
            print(f"   ID: {sa.id}")
            print(f"   Status: {'Active' if sa.is_active else 'Inactive'}")
            print(f"   Created: {sa.created_at}")
            print()

if __name__ == "__main__":
    print("🚀 Adding Super Admin to Database")
    print("=" * 50)
    
    try:
        # Add the super admin
        success = add_super_admin()
        
        if success:
            # List all super admins
            list_all_super_admins()
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
