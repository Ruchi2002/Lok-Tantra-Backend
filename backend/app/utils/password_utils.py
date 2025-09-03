"""
Enhanced Password Utilities for Government Security Standards
"""

import re
import hashlib
import bcrypt
from typing import Tuple, List
import logging

logger = logging.getLogger(__name__)

class PasswordValidator:
    def __init__(self):
        self.min_length = 12
        self.require_uppercase = True
        self.require_lowercase = True
        self.require_numbers = True
        self.require_special = True
        self.common_passwords = self._load_common_passwords()
    
    def validate_password(self, password: str) -> Tuple[bool, List[str]]:
        """Validate password strength according to government standards"""
        errors = []
        
        if len(password) < self.min_length:
            errors.append(f"Password must be at least {self.min_length} characters long")
        
        if self.require_uppercase and not re.search(r'[A-Z]', password):
            errors.append("Password must contain at least one uppercase letter")
        
        if self.require_lowercase and not re.search(r'[a-z]', password):
            errors.append("Password must contain at least one lowercase letter")
        
        if self.require_numbers and not re.search(r'\d', password):
            errors.append("Password must contain at least one number")
        
        if self.require_special and not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            errors.append("Password must contain at least one special character")
        
        # Check against common passwords
        if password.lower() in self.common_passwords:
            errors.append("Password is too common and easily guessable")
        
        # Check for sequential characters
        if self._has_sequential_chars(password):
            errors.append("Password contains sequential characters (e.g., 123, abc)")
        
        # Check for repeated characters
        if self._has_repeated_chars(password):
            errors.append("Password contains too many repeated characters")
        
        # Check for keyboard patterns
        if self._has_keyboard_patterns(password):
            errors.append("Password contains common keyboard patterns")
        
        return len(errors) == 0, errors
    
    def _load_common_passwords(self) -> set:
        """Load list of common passwords"""
        return {
            "password", "123456", "qwerty", "admin", "letmein",
            "welcome", "monkey", "dragon", "master", "football",
            "password123", "admin123", "123456789", "qwerty123",
            "password1", "admin1", "12345678", "qwerty1"
        }
    
    def _has_sequential_chars(self, password: str) -> bool:
        """Check for sequential characters"""
        for i in range(len(password) - 2):
            if (ord(password[i+1]) == ord(password[i]) + 1 and 
                ord(password[i+2]) == ord(password[i]) + 2):
                return True
        return False
    
    def _has_repeated_chars(self, password: str) -> bool:
        """Check for repeated characters"""
        for i in range(len(password) - 2):
            if password[i] == password[i+1] == password[i+2]:
                return True
        return False
    
    def _has_keyboard_patterns(self, password: str) -> bool:
        """Check for common keyboard patterns"""
        patterns = [
            "qwerty", "asdfgh", "zxcvbn",
            "123456", "654321",
            "qazwsx", "edcrfv", "tgbyhn"
        ]
        password_lower = password.lower()
        return any(pattern in password_lower for pattern in patterns)

def hash_password(password: str) -> str:
    """Hash password using bcrypt with enhanced security"""
    try:
        # Use higher cost factor for better security
        salt = bcrypt.gensalt(rounds=12)
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    except Exception as e:
        logger.error(f"Error hashing password: {e}")
        raise

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception as e:
        logger.error(f"Error verifying password: {e}")
        return False

def verify_legacy_password(plain_password: str, hashed_password: str) -> bool:
    """Verify legacy SHA256 password for migration"""
    try:
        hashed_input = hashlib.sha256(plain_password.encode()).hexdigest()
        return hashed_input == hashed_password
    except Exception as e:
        logger.error(f"Error verifying legacy password: {e}")
        return False

# Global password validator instance
password_validator = PasswordValidator()