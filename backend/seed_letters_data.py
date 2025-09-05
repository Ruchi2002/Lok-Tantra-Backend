#!/usr/bin/env python3
"""
Seed Data Script for Letters (Received, Sent, Sent Grievance)
Creates realistic letter data for testing role-based access control
"""

from sqlmodel import Session, select
from app.models.received_letter import ReceivedLetter, LetterStatus, LetterPriority, LetterCategory
from app.models.sent_letter import SentLetter, SentLetterStatus, SentLetterPriority, SentLetterCategory
from app.models.sent_grievance_letter import SentGrievanceLetter, SentGrievanceLetterStatus, SentGrievanceLetterPriority, SentGrievanceLetterCategory
from app.models.user import User
from app.models.tenant import Tenant
from app.models.role import Role
from database import engine
from datetime import datetime, timedelta
import random

def seed_letters_data():
    """Seed the database with comprehensive letter data"""
    
    with Session(engine) as session:
        print("🌱 Seeding letters data...")
        
        # Get existing data
        print("Fetching existing users and tenants...")
        
        # Get all tenants
        tenants = session.exec(select(Tenant)).all()
        if not tenants:
            print("❌ No tenants found. Please run the main seed script first.")
            return
        
        # Get all users with their roles
        users = session.exec(select(User)).all()
        if not users:
            print("❌ No users found. Please run the main seed script first.")
            return
        
        # Get roles
        admin_role = session.exec(select(Role).where(Role.name == "Admin")).first()
        field_agent_role = session.exec(select(Role).where(Role.name == "FieldAgent")).first()
        
        if not admin_role or not field_agent_role:
            print("❌ Required roles not found. Please run the main seed script first.")
            return
        
        # Separate users by role and tenant
        admin_users = [u for u in users if u.role_id == admin_role.id]
        field_agent_users = [u for u in users if u.role_id == field_agent_role.id]
        
        print(f"Found {len(admin_users)} admin users and {len(field_agent_users)} field agent users")
        
        # Sample data templates
        received_letter_templates = [
            {
                "sender": "Dr. Rajesh Kumar",
                "sender_email": "rajesh.kumar@hospital.com",
                "sender_phone": "9876543210",
                "sender_address": "123 Medical Center, Mumbai",
                "subject": "Request for Medical Equipment in Local Health Center",
                "content": "Dear Sir/Madam,\n\nI am writing to request urgent medical equipment for our local health center. We are in dire need of basic diagnostic equipment to serve the community better.\n\nPlease consider this request at the earliest.\n\nBest regards,\nDr. Rajesh Kumar",
                "category": LetterCategory.HEALTH,
                "priority": LetterPriority.HIGH
            },
            {
                "sender": "Mrs. Priya Sharma",
                "sender_email": "priya.sharma@school.edu",
                "sender_phone": "9876543211",
                "sender_address": "456 School Road, Delhi",
                "subject": "School Infrastructure Improvement Request",
                "content": "Respected Sir/Madam,\n\nOur school building requires urgent repairs and infrastructure improvements. The roof is leaking and the playground needs renovation.\n\nWe request your immediate attention to this matter.\n\nThank you,\nMrs. Priya Sharma\nPrincipal",
                "category": LetterCategory.EDUCATION,
                "priority": LetterPriority.MEDIUM
            },
            {
                "sender": "Mr. Amit Patel",
                "sender_email": "amit.patel@business.com",
                "sender_phone": "9876543212",
                "sender_address": "789 Business District, Bangalore",
                "subject": "Business License Application Support",
                "content": "Dear Authority,\n\nI am applying for a new business license and would appreciate your guidance on the process. I have submitted all required documents.\n\nPlease let me know if any additional information is needed.\n\nSincerely,\nMr. Amit Patel",
                "category": LetterCategory.BUSINESS,
                "priority": LetterPriority.MEDIUM
            },
            {
                "sender": "Environmental Protection Society",
                "sender_email": "contact@eps.org",
                "sender_phone": "9876543213",
                "sender_address": "321 Green Street, Chennai",
                "subject": "Environmental Concerns in Local Area",
                "content": "To Whom It May Concern,\n\nWe are writing to bring to your attention serious environmental issues in our locality. Air pollution levels have increased significantly.\n\nWe request immediate action to address these concerns.\n\nBest regards,\nEnvironmental Protection Society",
                "category": LetterCategory.ENVIRONMENT,
                "priority": LetterPriority.HIGH
            },
            {
                "sender": "Ms. Sneha Reddy",
                "sender_email": "sneha.reddy@welfare.org",
                "sender_phone": "9876543214",
                "sender_address": "654 Welfare Center, Mumbai",
                "subject": "Social Welfare Program Proposal",
                "content": "Dear Sir/Madam,\n\nWe propose a new social welfare program for underprivileged children in our area. The program will focus on education and nutrition.\n\nWe seek your support and approval for this initiative.\n\nThank you,\nMs. Sneha Reddy\nProgram Coordinator",
                "category": LetterCategory.SOCIAL_WELFARE,
                "priority": LetterPriority.MEDIUM
            }
        ]
        
        sent_letter_templates = [
            {
                "recipient_name": "Ministry of Health",
                "recipient_email": "health@ministry.gov.in",
                "recipient_organization": "Ministry of Health and Family Welfare",
                "subject": "Request for Additional Medical Staff",
                "content": "Dear Ministry Officials,\n\nWe are writing to request additional medical staff for our district hospitals. The current staff is overburdened and we need more doctors and nurses.\n\nPlease consider our request for the welfare of the citizens.\n\nBest regards,\nDistrict Health Officer",
                "category": SentLetterCategory.HEALTH,
                "priority": SentLetterPriority.HIGH
            },
            {
                "recipient_name": "Education Department",
                "recipient_email": "education@dept.gov.in",
                "recipient_organization": "State Education Department",
                "subject": "School Infrastructure Development Proposal",
                "content": "Dear Education Department,\n\nWe propose to develop new school infrastructure in our area. This will help improve the quality of education for local children.\n\nWe request your approval and funding for this project.\n\nSincerely,\nDistrict Education Officer",
                "category": SentLetterCategory.EDUCATION,
                "priority": SentLetterPriority.MEDIUM
            },
            {
                "recipient_name": "Public Works Department",
                "recipient_email": "pwd@dept.gov.in",
                "recipient_organization": "Public Works Department",
                "subject": "Road Construction and Maintenance Request",
                "content": "Dear PWD Officials,\n\nWe request immediate attention to road construction and maintenance in our area. Several roads are in poor condition and need urgent repair.\n\nPlease prioritize this work for public safety.\n\nThank you,\nMunicipal Commissioner",
                "category": SentLetterCategory.INFRASTRUCTURE,
                "priority": SentLetterPriority.HIGH
            },
            {
                "recipient_name": "Environmental Protection Agency",
                "recipient_email": "epa@agency.gov.in",
                "recipient_organization": "Environmental Protection Agency",
                "subject": "Environmental Conservation Initiative",
                "content": "Dear EPA Officials,\n\nWe are launching an environmental conservation initiative in our district. We seek your support and guidance for this important project.\n\nPlease let us know how we can collaborate.\n\nBest regards,\nDistrict Environmental Officer",
                "category": SentLetterCategory.ENVIRONMENT,
                "priority": SentLetterPriority.MEDIUM
            }
        ]
        
        grievance_letter_templates = [
            {
                "grievance_id": "GRV-001",
                "recipient_name": "Chief Minister's Office",
                "recipient_email": "cm@state.gov.in",
                "recipient_organization": "Chief Minister's Office",
                "subject": "Grievance: Water Supply Issues in Residential Area",
                "content": "Honorable Chief Minister,\n\nWe are writing to bring to your attention the severe water supply issues in our residential area. Residents are facing water shortage for the past month.\n\nWe request your immediate intervention to resolve this critical issue.\n\nRespectfully,\nResidents Association",
                "category": SentGrievanceLetterCategory.UTILITIES,
                "priority": SentGrievanceLetterPriority.HIGH
            },
            {
                "grievance_id": "GRV-002",
                "recipient_name": "Police Commissioner",
                "recipient_email": "commissioner@police.gov.in",
                "recipient_organization": "Police Department",
                "subject": "Grievance: Security Concerns in Local Area",
                "content": "Dear Police Commissioner,\n\nWe are concerned about the increasing security issues in our locality. There have been several incidents of theft and vandalism.\n\nWe request increased police patrolling and security measures.\n\nThank you,\nLocal Residents",
                "category": SentGrievanceLetterCategory.PUBLIC_SAFETY,
                "priority": SentGrievanceLetterPriority.HIGH
            },
            {
                "grievance_id": "GRV-003",
                "recipient_name": "Transport Department",
                "recipient_email": "transport@dept.gov.in",
                "recipient_organization": "Transport Department",
                "subject": "Grievance: Public Transport Issues",
                "content": "Dear Transport Officials,\n\nWe are facing severe public transport issues in our area. Bus services are irregular and overcrowded.\n\nWe request immediate improvement in public transport services.\n\nSincerely,\nCommuters Association",
                "category": SentGrievanceLetterCategory.TRANSPORTATION,
                "priority": SentGrievanceLetterPriority.MEDIUM
            }
        ]
        
        # Create received letters
        print("Creating received letters...")
        received_letters = []
        
        for tenant in tenants:
            tenant_users = [u for u in users if u.tenant_id == tenant.id]
            if not tenant_users:
                continue
                
            # Create 8-12 received letters per tenant
            num_letters = random.randint(8, 12)
            for i in range(num_letters):
                template = random.choice(received_letter_templates)
                created_by = random.choice(tenant_users)
                assigned_to = random.choice(tenant_users) if random.random() > 0.3 else None
                
                # Random dates within last 30 days
                received_date = datetime.utcnow() - timedelta(days=random.randint(1, 30))
                due_date = received_date + timedelta(days=random.randint(7, 21))
                
                letter = ReceivedLetter(
                    sender=template["sender"],
                    sender_email=template["sender_email"],
                    sender_phone=template["sender_phone"],
                    sender_address=template["sender_address"],
                    subject=f"{template['subject']} - {tenant.name}",
                    content=template["content"],
                    category=template["category"],
                    priority=template["priority"],
                    status=random.choice(list(LetterStatus)),
                    received_date=received_date,
                    due_date=due_date,
                    assigned_to=assigned_to.id if assigned_to else None,
                    response_content=f"Response to {template['subject']}" if random.random() > 0.5 else None,
                    response_date=received_date + timedelta(days=random.randint(1, 15)) if random.random() > 0.5 else None,
                    notes=f"Letter received from {template['sender']} regarding {template['subject']}",
                    tenant_id=tenant.id,
                    created_by=created_by.id,
                    updated_by=created_by.id
                )
                session.add(letter)
                received_letters.append(letter)
        
        session.commit()
        print(f"✅ Created {len(received_letters)} received letters")
        
        # Create sent letters (public interest)
        print("Creating sent letters (public interest)...")
        sent_letters = []
        
        for tenant in tenants:
            tenant_users = [u for u in users if u.tenant_id == tenant.id]
            if not tenant_users:
                continue
                
            # Create 6-10 sent letters per tenant
            num_letters = random.randint(6, 10)
            for i in range(num_letters):
                template = random.choice(sent_letter_templates)
                created_by = random.choice(tenant_users)
                assigned_to = random.choice(tenant_users) if random.random() > 0.3 else None
                
                # Random dates within last 30 days
                sent_date = datetime.utcnow() - timedelta(days=random.randint(1, 30))
                follow_up_date = sent_date + timedelta(days=random.randint(14, 30))
                
                letter = SentLetter(
                    recipient_name=template["recipient_name"],
                    recipient_email=template["recipient_email"],
                    recipient_organization=template["recipient_organization"],
                    subject=f"{template['subject']} - {tenant.name}",
                    content=template["content"],
                    category=template["category"],
                    priority=template["priority"],
                    status=random.choice(list(SentLetterStatus)),
                    sent_date=sent_date,
                    follow_up_date=follow_up_date,
                    response_received_date=sent_date + timedelta(days=random.randint(5, 20)) if random.random() > 0.4 else None,
                    response_content=f"Response received regarding {template['subject']}" if random.random() > 0.4 else None,
                    assigned_to=assigned_to.id if assigned_to else None,
                    notes=f"Letter sent to {template['recipient_name']} regarding {template['subject']}",
                    tenant_id=tenant.id,
                    created_by=created_by.id,
                    updated_by=created_by.id
                )
                session.add(letter)
                sent_letters.append(letter)
        
        session.commit()
        print(f"✅ Created {len(sent_letters)} sent letters")
        
        # Create sent grievance letters
        print("Creating sent grievance letters...")
        grievance_letters = []
        
        for tenant in tenants:
            tenant_users = [u for u in users if u.tenant_id == tenant.id]
            if not tenant_users:
                continue
                
            # Create 4-8 grievance letters per tenant
            num_letters = random.randint(4, 8)
            for i in range(num_letters):
                template = random.choice(grievance_letter_templates)
                created_by = random.choice(tenant_users)
                assigned_to = random.choice(tenant_users) if random.random() > 0.3 else None
                
                # Random dates within last 30 days
                sent_date = datetime.utcnow() - timedelta(days=random.randint(1, 30))
                follow_up_date = sent_date + timedelta(days=random.randint(10, 25))
                
                letter = SentGrievanceLetter(
                    grievance_id=f"{template['grievance_id']}-{tenant.id}-{i+1}",
                    recipient_name=template["recipient_name"],
                    recipient_email=template["recipient_email"],
                    recipient_organization=template["recipient_organization"],
                    subject=f"{template['subject']} - {tenant.name}",
                    content=template["content"],
                    category=template["category"],
                    priority=template["priority"],
                    status=random.choice(list(SentGrievanceLetterStatus)),
                    sent_date=sent_date,
                    follow_up_date=follow_up_date,
                    response_received_date=sent_date + timedelta(days=random.randint(7, 25)) if random.random() > 0.3 else None,
                    response_content=f"Response received regarding grievance {template['grievance_id']}" if random.random() > 0.3 else None,
                    closure_date=sent_date + timedelta(days=random.randint(15, 30)) if random.random() > 0.6 else None,
                    assigned_to=assigned_to.id if assigned_to else None,
                    notes=f"Grievance letter sent to {template['recipient_name']} regarding {template['subject']}",
                    tenant_id=tenant.id,
                    created_by=created_by.id,
                    updated_by=created_by.id
                )
                session.add(letter)
                grievance_letters.append(letter)
        
        session.commit()
        print(f"✅ Created {len(grievance_letters)} grievance letters")
        
        print("\n🎉 Letters seeding completed!")
        print("\n📋 Letters Data Summary:")
        print(f"   • {len(received_letters)} Received Letters")
        print(f"   • {len(sent_letters)} Sent Letters (Public Interest)")
        print(f"   • {len(grievance_letters)} Sent Grievance Letters")
        
        print("\n👥 Role-Based Access Test:")
        print("   • Admin users can see all letters from their tenant")
        print("   • Field Agent users can see only their assigned/created letters")
        print("   • Super Admin can see all letters across all tenants")
        
        print("\n🔍 Test Scenarios:")
        for tenant in tenants:
            tenant_users = [u for u in users if u.tenant_id == tenant.id]
            admin_user = next((u for u in tenant_users if u.role_id == admin_role.id), None)
            field_agent_user = next((u for u in tenant_users if u.role_id == field_agent_role.id), None)
            
            if admin_user and field_agent_user:
                print(f"   • {tenant.name}:")
                print(f"     - Admin: {admin_user.email}")
                print(f"     - Field Agent: {field_agent_user.email}")

if __name__ == "__main__":
    seed_letters_data()
