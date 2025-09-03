# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import os

# Import routers
from app.routes.auth import router as auth_router
from app.routes.translate import router as translate_router
from app.routes.users import router as user_router
from app.routes.tenant import router as tenant_router
from app.routes.role import router as role_router
from app.routes.permission_routes import router as permission_router
from app.routes.role_permission import router as role_permission_router
from app.routes.superadmin import router as superAdmin_router
from app.routes.citizen_issues import router as citizen_issues
from app.routes.issue_category import router as Issue_category
from app.routes.areas import router as Area
from app.routes.visits import router as Visit
from app.routes.visit_issue import router as Visit_Issue
from app.routes.dashboard import router as dashboard_router
from app.routes.received_letters import router as received_letters_router
from app.routes.sent_letters import router as sent_letters_router
from app.routes.sent_grievance_letters import router as sent_grievance_letters_router
from app.routes.meeting_programs import router as meeting_programs_router

# Import middleware
from app.core.request_middleware import RequestLoggingMiddleware
from app.core.security_middleware import SecurityMiddleware

# Import database functions
from database import create_db_and_tables
from config import settings

app = FastAPI(
    title=settings.APP_NAME,
    description="Backend API for Smart Politicians Assistant application",
    version=settings.APP_VERSION
)

# Add security middleware
app.add_middleware(SecurityMiddleware)
app.add_middleware(RequestLoggingMiddleware)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=settings.ALLOW_CREDENTIALS,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def on_startup():
    """Initialize database on startup"""
    print("🚀 Starting Smart Politicians Assistant API...")
    try:
        create_db_and_tables()
        print("✅ Database tables creation complete.")
    except Exception as e:
        print(f"❌ Error during startup: {str(e)}")

# Include routers
app.include_router(auth_router, tags=["Authentication"])
app.include_router(translate_router, tags=["Translation"])
app.include_router(user_router, tags=["Users"])
app.include_router(tenant_router, prefix="/tenant", tags=["Tenants"])
app.include_router(role_router, tags=["Roles"])
app.include_router(permission_router, tags=["Permissions"])
app.include_router(role_permission_router, tags=["Role Permissions"])
app.include_router(superAdmin_router, tags=["Super Admin"])
app.include_router(citizen_issues, tags=["Citizen Issues"])
app.include_router(Issue_category, tags=["Issue Categories"])
app.include_router(Area, tags=["Areas"])
app.include_router(Visit, tags=["Visits"])
app.include_router(Visit_Issue, tags=["Visit Issues"])
app.include_router(dashboard_router, tags=["Dashboard"])
app.include_router(received_letters_router, tags=["Received Letters"])
app.include_router(sent_letters_router, tags=["Sent Letters - Public Interest"])
app.include_router(meeting_programs_router, tags=["Meeting Programs"])
app.include_router(sent_grievance_letters_router, tags=["Sent Letters - Public Grievance"])

@app.get("/", tags=["Health Check"])
def root():
    return {
        "message": f"{settings.APP_NAME} API is running!",
        "status": "healthy",
        "version": settings.APP_VERSION,
        "docs": "/docs"
    }

@app.get("/health", tags=["Health Check"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION
    }
