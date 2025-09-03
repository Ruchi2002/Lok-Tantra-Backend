"""
Email Service
Simple email service for password reset and notifications
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import logging

from config import settings

logger = logging.getLogger(__name__)

class EmailService:
    """Simple email service for sending notifications"""
    
    def __init__(self):
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_user = settings.SMTP_USER
        self.smtp_password = settings.SMTP_PASSWORD
        self.smtp_tls = settings.SMTP_TLS
    
    def send_password_reset_email(
        self, 
        to_email: str, 
        reset_token: str, 
        reset_url: Optional[str] = None
    ) -> bool:
        """
        Send password reset email
        """
        try:
            if not self.smtp_user or not self.smtp_password:
                logger.warning("SMTP credentials not configured, skipping email send")
                return False
            
            subject = f"Password Reset - {settings.APP_NAME}"
            
            # Create email content
            if reset_url:
                body = f"""
                Hello,
                
                You have requested a password reset for your {settings.APP_NAME} account.
                
                Click the following link to reset your password:
                {reset_url}?token={reset_token}
                
                This link will expire in {settings.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES} minutes.
                
                If you did not request this password reset, please ignore this email.
                
                Best regards,
                {settings.APP_NAME} Team
                """
            else:
                body = f"""
                Hello,
                
                You have requested a password reset for your {settings.APP_NAME} account.
                
                Your password reset token is: {reset_token}
                
                This token will expire in {settings.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES} minutes.
                
                If you did not request this password reset, please ignore this email.
                
                Best regards,
                {settings.APP_NAME} Team
                """
            
            # Create message
            msg = MIMEMultipart()
            msg['From'] = self.smtp_user
            msg['To'] = to_email
            msg['Subject'] = subject
            
            msg.attach(MIMEText(body, 'plain'))
            
            # Send email
            server = smtplib.SMTP(self.smtp_host, self.smtp_port)
            if self.smtp_tls:
                server.starttls()
            
            server.login(self.smtp_user, self.smtp_password)
            server.send_message(msg)
            server.quit()
            
            logger.info(f"Password reset email sent to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send password reset email to {to_email}: {str(e)}")
            return False
    
    def send_welcome_email(self, to_email: str, user_name: str) -> bool:
        """
        Send welcome email to new users
        """
        try:
            if not self.smtp_user or not self.smtp_password:
                logger.warning("SMTP credentials not configured, skipping email send")
                return False
            
            subject = f"Welcome to {settings.APP_NAME}"
            
            body = f"""
            Hello {user_name},
            
            Welcome to {settings.APP_NAME}!
            
            Your account has been successfully created.
            
            Best regards,
            {settings.APP_NAME} Team
            """
            
            # Create message
            msg = MIMEMultipart()
            msg['From'] = self.smtp_user
            msg['To'] = to_email
            msg['Subject'] = subject
            
            msg.attach(MIMEText(body, 'plain'))
            
            # Send email
            server = smtplib.SMTP(self.smtp_host, self.smtp_port)
            if self.smtp_tls:
                server.starttls()
            
            server.login(self.smtp_user, self.smtp_password)
            server.send_message(msg)
            server.quit()
            
            logger.info(f"Welcome email sent to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send welcome email to {to_email}: {str(e)}")
            return False

# Global instance
email_service = EmailService()
