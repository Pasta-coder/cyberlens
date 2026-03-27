"""
🔐 JWT Authentication for SatyaSetu.AI Admin Routes
"""

import os
import hashlib
import hmac
import json
import base64
import time
from datetime import datetime, timezone
from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from app.database import execute_query

load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET", "satyasetu-ai-secret-key-2026-hackathon")
ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 24

security = HTTPBearer()


# --- Simple JWT Implementation (no PyJWT dependency needed) ---

def _base64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("utf-8")


def _base64url_decode(s: str) -> bytes:
    s += "=" * (4 - len(s) % 4)
    return base64.urlsafe_b64decode(s)


def _sign(header_payload: str) -> str:
    signature = hmac.new(
        SECRET_KEY.encode("utf-8"),
        header_payload.encode("utf-8"),
        hashlib.sha256
    ).digest()
    return _base64url_encode(signature)


def create_token(data: dict) -> str:
    """Create a JWT token."""
    header = _base64url_encode(json.dumps({"alg": ALGORITHM, "typ": "JWT"}).encode())
    payload_data = {
        **data,
        "exp": int(time.time()) + (TOKEN_EXPIRE_HOURS * 3600),
        "iat": int(time.time()),
    }
    payload = _base64url_encode(json.dumps(payload_data).encode())
    header_payload = f"{header}.{payload}"
    signature = _sign(header_payload)
    return f"{header_payload}.{signature}"


def decode_token(token: str) -> dict:
    """Decode and verify a JWT token."""
    try:
        parts = token.split(".")
        if len(parts) != 3:
            raise ValueError("Invalid token format")

        header_payload = f"{parts[0]}.{parts[1]}"
        expected_sig = _sign(header_payload)

        if not hmac.compare_digest(expected_sig, parts[2]):
            raise ValueError("Invalid signature")

        payload = json.loads(_base64url_decode(parts[1]))

        if payload.get("exp", 0) < time.time():
            raise ValueError("Token expired")

        return payload
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")


# --- Password Hashing (simple SHA-256 for hackathon) ---

def hash_password(password: str) -> str:
    """Hash a password with SHA-256 + salt."""
    salt = "satyasetu-salt-2026"
    return hashlib.sha256(f"{salt}{password}".encode()).hexdigest()


def verify_password(password: str, hashed: str) -> bool:
    """Verify a password against its hash."""
    return hash_password(password) == hashed


# --- Auth Dependencies ---

async def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)):
    """Dependency to get the current authenticated user."""
    token = credentials.credentials
    payload = decode_token(token)
    return payload


async def require_admin(credentials: HTTPAuthorizationCredentials = Security(security)):
    """Dependency to require admin role."""
    user = await get_current_user(credentials)
    if user.get("role") not in ("admin", "superadmin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


# --- Initialize default admin user ---

def init_default_admin():
    """Create default admin user if not exists."""
    try:
        existing = execute_query(
            "SELECT id FROM users WHERE username = %s",
            ("admin",),
            fetch_one=True
        )
        if not existing:
            from app.database import execute_insert
            execute_insert(
                """INSERT INTO users (username, password_hash, full_name, department, role)
                   VALUES (%s, %s, %s, %s, %s)""",
                ("admin", hash_password("satyasetu2026"), "System Admin", "IT Department", "superadmin")
            )
            print("✅ Default admin user created (admin / satyasetu2026)")
        else:
            # Update password hash to match our hashing scheme
            from app.database import execute_insert
            execute_insert(
                "UPDATE users SET password_hash = %s WHERE username = %s",
                (hash_password("satyasetu2026"), "admin")
            )
            print("✅ Admin user ready")
    except Exception as e:
        print(f"⚠️ Could not init admin user: {e}")
