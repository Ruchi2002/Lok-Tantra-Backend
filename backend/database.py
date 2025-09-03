# database.py
from sqlmodel import create_engine, SQLModel, Session
from sqlalchemy.orm import sessionmaker
import os
from config import Settings # Assuming 'config.py' exists and has your Settings class

# --- ALL YOUR SQLModel MODELS MUST BE IMPORTED HERE ---
# This ensures they are registered with SQLModel.metadata once and correctly.
from app.models.user import User
from app.models.tenant import Tenant
from app.models.role import Role
from app.models.permission import Permission
from app.models.role_permission import RolePermission
from app.models.citizen_issues import CitizenIssue
# from app.models.issue_status import IssueStatus
# from app.models.issue_Priority import IssuePriority
from app.models.Issue_category import IssueCategory
from app.models.area import Area
from app.models.visit import Visit
from app.models.visit_issue import VisitIssue
from app.models.received_letter import ReceivedLetter
from app.models.sent_grievance_letter import SentGrievanceLetter
from app.models.superadmin import SuperAdmin  #  Add missing import
from app.models.meeting_program import MeetingProgram

# Add any other models you create here (e.g., CitizenIssue, IssueCategory, etc.)
# --- END IMPORTANT IMPORTS ---

settings = Settings()

DATABASE_URL = (
    f"mysql+mysqlconnector://{settings.DB_USER}:{settings.DB_PASSWORD}"
    f"@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"
)

engine = create_engine(
    DATABASE_URL,
    echo=True,
    pool_size=10,          # The number of connections to maintain in the pool
    max_overflow=20,        # The number of connections to allow beyond pool_size
    pool_recycle=3600,     # Recycle connections after 1 hour
    pool_pre_ping=True     # Verify connections before use
)

# SessionLocal for the get_db() dependency style
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, class_=Session) # Use SQLModel's Session class directly

def create_db_and_tables():
    """Create all tables defined in SQLModel models."""
    print("Creating database tables...")
    try:
        SQLModel.metadata.create_all(engine)
        print("Database tables created successfully!")
    except Exception as e:
        print(f"Error creating database tables: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise


def get_db():
    """Dependency to get a database session using SessionLocal (sessionmaker style)."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_session():
    """Dependency to get a database session using SQLModel's Session context manager style."""
    with Session(engine) as session:
        yield session