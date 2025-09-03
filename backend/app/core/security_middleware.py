"""
Enhanced Security Middleware
Production-grade security middleware with comprehensive protection
"""

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
import time
import logging

from app.core.security import security_middleware, audit_logger

logger = logging.getLogger(__name__)

class SecurityMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        self.security_middleware = security_middleware
        
    async def dispatch(self, request: Request, call_next):
        # Process security checks
        try:
            security_exception = await self.security_middleware.process_request(request)
            if security_exception:
                return Response(
                    content=f'{{"detail": "{security_exception.detail}"}}',
                    status_code=security_exception.status_code,
                    media_type="application/json"
                )
        except Exception as e:
            logger.error(f"Security middleware error: {str(e)}")
            return Response(
                content='{"detail": "Security check failed"}',
                status_code=500,
                media_type="application/json"
            )
        
        # Process request
        response = await call_next(request)
        
        # Add security headers
        self.security_middleware.add_security_headers(response)
        
        return response
