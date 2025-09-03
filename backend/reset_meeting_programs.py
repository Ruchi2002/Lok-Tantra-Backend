#!/usr/bin/env python3
"""
Reset and Seed Meeting Programs Table
Completely recreates the meeting_programs table with fresh, realistic data
"""

from sqlmodel import Session, text
from database import engine
from app.models.meeting_program import MeetingProgram
from datetime import datetime, timedelta
import random
import json

def reset_and_seed_meeting_programs():
    """Reset meeting_programs table and seed with fresh data"""
    
    with Session(engine) as session:
        try:
            print("🔄 Resetting meeting_programs table...")
            
            # Drop the existing table
            session.exec(text("DROP TABLE IF EXISTS meeting_programs"))
            session.commit()
            print("✅ Dropped existing meeting_programs table")
            
            # Recreate the table using SQLModel
            from database import create_db_and_tables
            create_db_and_tables()
            print("✅ Recreated meeting_programs table with correct schema")
            
            # Seed with fresh data
            seed_meeting_programs(session)
                
        except Exception as e:
            print(f"❌ Error during reset: {e}")
            session.rollback()
            raise

def seed_meeting_programs(session: Session):
    """Seed meeting_programs table with comprehensive, realistic test data"""
    
    print("\n🌱 Seeding meeting programs with comprehensive data...")
    
    # Get existing users and tenants for reference
    users = session.exec(text("SELECT id, name, tenant_id FROM users LIMIT 30")).all()
    tenants = session.exec(text("SELECT id, name FROM tenant")).all()
    
    if not users or not tenants:
        print("⚠️  No users or tenants found. Please run seed_data.py first.")
        return
    
    # Comprehensive meeting templates
    meeting_templates = [
        # Government Meetings
        {
            "title": "Municipal Council Meeting",
            "description": "Monthly council meeting to discuss city development projects, budget allocation, and policy decisions",
            "agenda": "1. Review of ongoing infrastructure projects\n2. Budget allocation for next quarter\n3. Public grievances and complaints\n4. New policy proposals\n5. Infrastructure development plans\n6. Q&A session",
            "venue": "City Hall Conference Room A",
            "meeting_type": "Government",
            "expected_attendance": 35,
            "category": "governance"
        },
        {
            "title": "Infrastructure Development Committee",
            "description": "Committee meeting to discuss road construction, maintenance projects, and infrastructure planning",
            "agenda": "1. Road construction project updates\n2. Maintenance schedule review\n3. Budget allocation for infrastructure\n4. Quality control measures\n5. Timeline planning\n6. Resource allocation",
            "venue": "Engineering Department Conference Room",
            "meeting_type": "Government",
            "expected_attendance": 18,
            "category": "infrastructure"
        },
        {
            "title": "Water Supply Management Meeting",
            "description": "Discussion on water supply infrastructure, maintenance, and emergency protocols",
            "agenda": "1. Current water supply status\n2. Maintenance requirements and schedules\n3. Emergency response protocols\n4. Public awareness campaigns\n5. Infrastructure upgrades\n6. Water quality monitoring",
            "venue": "Water Department Office",
            "meeting_type": "Government",
            "expected_attendance": 22,
            "category": "utilities"
        },
        {
            "title": "Waste Management Review",
            "description": "Comprehensive review of waste collection, disposal systems, and recycling initiatives",
            "agenda": "1. Collection efficiency analysis\n2. Disposal methods review\n3. Recycling program updates\n4. Public participation initiatives\n5. Environmental impact assessment\n6. Future planning",
            "venue": "Sanitation Department",
            "meeting_type": "Government",
            "expected_attendance": 20,
            "category": "environment"
        },
        {
            "title": "Public Safety Committee",
            "description": "Committee meeting to discuss public safety measures, emergency response, and community security",
            "agenda": "1. Safety audit results presentation\n2. Emergency response plan updates\n3. Public awareness campaign planning\n4. Resource allocation for safety\n5. Community policing initiatives\n6. Incident response protocols",
            "venue": "Police Station Conference Room",
            "meeting_type": "Government",
            "expected_attendance": 25,
            "category": "safety"
        },
        {
            "title": "Education Development Meeting",
            "description": "Discussion on educational infrastructure, programs, and student welfare initiatives",
            "agenda": "1. School infrastructure assessment\n2. Educational program development\n3. Teacher training initiatives\n4. Student welfare programs\n5. Digital learning implementation\n6. Community engagement",
            "venue": "Education Department",
            "meeting_type": "Government",
            "expected_attendance": 30,
            "category": "education"
        },
        {
            "title": "Healthcare Infrastructure Review",
            "description": "Review of healthcare facilities, medical services, and public health initiatives",
            "agenda": "1. Healthcare facility assessment\n2. Medical service improvements\n3. Public health campaign planning\n4. Emergency medical services\n5. Healthcare accessibility\n6. Community health programs",
            "venue": "Health Department",
            "meeting_type": "Government",
            "expected_attendance": 28,
            "category": "healthcare"
        },
        {
            "title": "Transportation Planning Committee",
            "description": "Planning meeting for public transportation improvements and traffic management",
            "agenda": "1. Public transport route optimization\n2. Traffic management strategies\n3. Infrastructure development plans\n4. Public feedback integration\n5. Technology implementation\n6. Sustainability initiatives",
            "venue": "Transport Department",
            "meeting_type": "Government",
            "expected_attendance": 24,
            "category": "transportation"
        },
        
        # Public Meetings
        {
            "title": "Public Grievance Hearing",
            "description": "Public hearing to address citizen complaints, grievances, and community concerns",
            "agenda": "1. Citizen complaints review and categorization\n2. Action plan development for each issue\n3. Follow-up on previous grievances\n4. Community feedback collection\n5. Resolution timeline planning\n6. Public participation guidelines",
            "venue": "Community Center Main Hall",
            "meeting_type": "Public",
            "expected_attendance": 75,
            "category": "public_service"
        },
        {
            "title": "Town Hall Meeting",
            "description": "Open town hall meeting for community discussion and feedback on city development",
            "agenda": "1. City development updates\n2. Community feedback session\n3. Future project announcements\n4. Public concerns discussion\n5. Interactive Q&A session\n6. Community engagement initiatives",
            "venue": "City Auditorium",
            "meeting_type": "Public",
            "expected_attendance": 120,
            "category": "community"
        },
        {
            "title": "Public Budget Hearing",
            "description": "Public hearing on budget allocation and financial planning for the city",
            "agenda": "1. Budget overview presentation\n2. Department-wise allocation discussion\n3. Public input on priorities\n4. Revenue generation strategies\n5. Transparency measures\n6. Public accountability",
            "venue": "City Council Chamber",
            "meeting_type": "Public",
            "expected_attendance": 90,
            "category": "finance"
        },
        
        # NGO Meetings
        {
            "title": "NGO Partnership Meeting",
            "description": "Meeting with NGO representatives to discuss collaborative projects and community development",
            "agenda": "1. Partnership opportunity identification\n2. Project proposal presentations\n3. Resource sharing strategies\n4. Timeline and milestone planning\n5. Impact assessment methods\n6. Sustainability planning",
            "venue": "Partnership Office Conference Room",
            "meeting_type": "NGO",
            "expected_attendance": 15,
            "category": "partnership"
        },
        {
            "title": "Community Development Workshop",
            "description": "Workshop with NGOs and community leaders to plan development initiatives",
            "agenda": "1. Community needs assessment\n2. Development project planning\n3. Resource mobilization strategies\n4. Stakeholder engagement\n5. Monitoring and evaluation\n6. Success metrics definition",
            "venue": "Community Development Center",
            "meeting_type": "NGO",
            "expected_attendance": 25,
            "category": "development"
        },
        {
            "title": "Environmental Conservation Meeting",
            "description": "Meeting with environmental NGOs to discuss conservation projects and sustainability",
            "agenda": "1. Environmental impact assessment\n2. Conservation project planning\n3. Sustainability initiatives\n4. Community awareness programs\n5. Green infrastructure development\n6. Climate action planning",
            "venue": "Environmental Center",
            "meeting_type": "NGO",
            "expected_attendance": 20,
            "category": "environment"
        }
    ]
    
    # Generate comprehensive meetings for each tenant
    meetings_created = 0
    
    for tenant in tenants:
        tenant_users = [u for u in users if u[2] == tenant[0]]  # Filter users by tenant_id
        if not tenant_users:
            print(f"  ⚠️  No users found for tenant {tenant[1]}, skipping...")
            continue
            
        print(f"  Creating meetings for {tenant[1]} (with {len(tenant_users)} users)...")
        
        # Create 12-20 meetings per tenant (mix of past, present, future)
        num_meetings = random.randint(12, 20)
        
        for i in range(num_meetings):
            template = random.choice(meeting_templates)
            created_by = random.choice(tenant_users)
            
            # Generate diverse dates (past 60 days to future 90 days)
            days_offset = random.randint(-60, 90)
            meeting_date = datetime.now() + timedelta(days=days_offset)
            
            # Generate realistic time slots
            time_slots = [
                ("09:00", "10:30"), ("10:00", "11:30"), ("11:00", "12:30"),
                ("14:00", "15:30"), ("15:00", "16:30"), ("16:00", "17:30"),
                ("18:00", "19:30"), ("19:00", "20:30")
            ]
            start_time, end_time = random.choice(time_slots)
            
            # Determine status based on date and add some randomness
            if meeting_date < datetime.now() - timedelta(days=1):
                # Past meetings
                status = random.choices(["Done", "Cancelled"], weights=[85, 15])[0]
                actual_attendance = None
                if status == "Done":
                    # Realistic attendance (60-100% of expected, capped at expected)
                    attendance_rate = random.uniform(0.6, 1.0)
                    actual_attendance = int(template["expected_attendance"] * attendance_rate)
                    # Ensure actual attendance doesn't exceed expected
                    actual_attendance = min(actual_attendance, template["expected_attendance"])
                reminder_sent = True
                reminder_date = meeting_date - timedelta(days=random.randint(1, 3))
                
                # Generate realistic minutes for completed meetings
                if status == "Done":
                    minutes = generate_meeting_minutes(template, meeting_date, actual_attendance)
                    minutes_uploaded_at = meeting_date + timedelta(hours=random.randint(1, 4))
                else:
                    minutes = f"Meeting cancelled due to {random.choice(['unforeseen circumstances', 'lack of quorum', 'emergency situation', 'weather conditions'])}"
                    minutes_uploaded_at = None
                    
            elif meeting_date < datetime.now() + timedelta(days=7):
                # Upcoming meetings (this week)
                status = "Upcoming"
                actual_attendance = None
                reminder_sent = random.choice([True, False])
                reminder_date = meeting_date - timedelta(days=random.randint(1, 2)) if reminder_sent else None
                minutes = None
                minutes_uploaded_at = None
                
            else:
                # Future meetings
                status = "Upcoming"
                actual_attendance = None
                reminder_sent = False
                reminder_date = None
                minutes = None
                minutes_uploaded_at = None
            
            # Generate participants (safe bounds checking)
            min_participants = min(3, len(tenant_users))  # At least 3, but not more than available users
            max_participants = min(15, len(tenant_users))  # At most 15, but not more than available users
            
            if min_participants <= max_participants:
                num_participants = random.randint(min_participants, max_participants)
                selected_participants = random.sample(tenant_users, num_participants)
            else:
                # Fallback if we have very few users
                num_participants = len(tenant_users)
                selected_participants = tenant_users
            
            participants_data = [
                {
                    "id": p[0], 
                    "name": p[1], 
                    "role": random.choice(["Attendee", "Presenter", "Facilitator", "Observer"])
                } 
                for p in selected_participants
            ]
            participants_json = json.dumps(participants_data, indent=2)
            
            # Create meeting program
            meeting = MeetingProgram(
                title=f"{template['title']} - {tenant[1]}",
                description=template['description'],
                agenda=template['agenda'],
                venue=template['venue'],
                scheduled_date=meeting_date,
                start_time=start_time,
                end_time=end_time,
                meeting_type=template['meeting_type'],
                status=status,
                participants=participants_json,
                expected_attendance=template['expected_attendance'],
                actual_attendance=actual_attendance,
                reminder_sent=reminder_sent,
                reminder_date=reminder_date,
                minutes=minutes,
                minutes_uploaded_at=minutes_uploaded_at,
                created_by=created_by[0],
                tenant_id=tenant[0]
            )
            
            session.add(meeting)
            meetings_created += 1
    
    session.commit()
    print(f"✅ Created {meetings_created} comprehensive meeting programs across {len(tenants)} tenants")
    
    # Show detailed statistics
    print("\n📊 Meeting Programs Statistics:")
    
    # Status distribution
    status_stats = session.exec(text("""
        SELECT status, COUNT(*) as count 
        FROM meeting_programs 
        GROUP BY status 
        ORDER BY count DESC
    """)).all()
    
    print("  Status Distribution:")
    for status, count in status_stats:
        print(f"    {status}: {count}")
    
    # Meeting type distribution
    type_stats = session.exec(text("""
        SELECT meeting_type, COUNT(*) as count 
        FROM meeting_programs 
        GROUP BY meeting_type 
        ORDER BY count DESC
    """)).all()
    
    print("  Meeting Type Distribution:")
    for meeting_type, count in type_stats:
        print(f"    {meeting_type}: {count}")
    
    # Sample upcoming meetings
    print("\n📅 Sample Upcoming Meetings:")
    upcoming_meetings = session.exec(text("""
        SELECT title, meeting_type, scheduled_date, venue 
        FROM meeting_programs 
        WHERE status = 'Upcoming' 
        ORDER BY scheduled_date ASC 
        LIMIT 5
    """)).all()
    
    for meeting in upcoming_meetings:
        print(f"  • {meeting[0]} ({meeting[1]}) - {meeting[2].strftime('%Y-%m-%d %H:%M')} at {meeting[3]}")
    
    # Sample completed meetings
    print("\n✅ Sample Completed Meetings:")
    completed_meetings = session.exec(text("""
        SELECT title, actual_attendance, expected_attendance, scheduled_date 
        FROM meeting_programs 
        WHERE status = 'Done' 
        ORDER BY scheduled_date DESC 
        LIMIT 5
    """)).all()
    
    for meeting in completed_meetings:
        attendance_rate = (meeting[1] / meeting[2] * 100) if meeting[2] else 0
        print(f"  • {meeting[0]} - Attendance: {meeting[1]}/{meeting[2]} ({attendance_rate:.1f}%) on {meeting[3].strftime('%Y-%m-%d')}")

def generate_meeting_minutes(template, meeting_date, actual_attendance):
    """Generate realistic meeting minutes for completed meetings"""
    
    minutes_templates = {
        "governance": f"""
Meeting Minutes - {template['title']}
Date: {meeting_date.strftime('%Y-%m-%d')}
Time: {meeting_date.strftime('%H:%M')}
Venue: {template['venue']}
Attendance: {actual_attendance} participants

Agenda Items Discussed:
{template['agenda']}

Key Decisions Made:
1. Approved budget allocation for infrastructure projects
2. Established timeline for policy implementation
3. Assigned responsibilities for follow-up actions
4. Scheduled next review meeting

Action Items:
- Department heads to submit detailed project plans
- Finance team to prepare budget breakdown
- Public relations to announce new initiatives
- Follow-up meeting scheduled for next month

Next Meeting: {meeting_date + timedelta(days=30)}
        """,
        
        "infrastructure": f"""
Meeting Minutes - {template['title']}
Date: {meeting_date.strftime('%Y-%m-%d')}
Time: {meeting_date.strftime('%H:%M')}
Venue: {template['venue']}
Attendance: {actual_attendance} participants

Agenda Items Discussed:
{template['agenda']}

Key Decisions Made:
1. Approved construction timeline for major projects
2. Allocated resources for maintenance activities
3. Established quality control protocols
4. Set up monitoring mechanisms

Action Items:
- Engineering team to finalize project specifications
- Procurement to initiate tender process
- Quality assurance team to establish checkpoints
- Progress review scheduled for next week

Next Meeting: {meeting_date + timedelta(days=14)}
        """,
        
        "public_service": f"""
Meeting Minutes - {template['title']}
Date: {meeting_date.strftime('%Y-%m-%d')}
Time: {meeting_date.strftime('%H:%M')}
Venue: {template['venue']}
Attendance: {actual_attendance} participants

Agenda Items Discussed:
{template['agenda']}

Key Decisions Made:
1. Prioritized grievances based on urgency and impact
2. Established response timelines for each issue
3. Assigned case officers for follow-up
4. Set up feedback mechanism for citizens

Action Items:
- Case officers to contact complainants within 48 hours
- Department heads to provide status updates
- Public relations to communicate resolution timelines
- Follow-up meeting scheduled for next week

Next Meeting: {meeting_date + timedelta(days=7)}
        """
    }
    
    # Choose appropriate template based on meeting category
    category = template.get('category', 'governance')
    if category in minutes_templates:
        return minutes_templates[category].strip()
    else:
        return minutes_templates['governance'].strip()

if __name__ == "__main__":
    reset_and_seed_meeting_programs()
