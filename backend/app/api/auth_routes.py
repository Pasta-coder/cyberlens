"""
🔐 Authentication API Routes
Login, token validation, and user management.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.auth import create_token, hash_password, verify_password
from app.database import execute_query

router = APIRouter(tags=["Authentication"])


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


@router.post("/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """🔐 Authenticate user and return JWT token."""
    user = execute_query(
        "SELECT id, username, full_name, department, role, password_hash FROM users WHERE username = %s",
        (request.username,),
        fetch_one=True,
    )

    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    if not verify_password(request.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token = create_token({
        "sub": user["username"],
        "user_id": user["id"],
        "role": user["role"],
        "department": user["department"],
        "full_name": user["full_name"],
    })

    return LoginResponse(
        access_token=token,
        user={
            "id": user["id"],
            "username": user["username"],
            "full_name": user["full_name"],
            "department": user["department"],
            "role": user["role"],
        },
    )


@router.get("/auth/me")
async def get_me():
    """Get current user info (public - for testing)."""
    return {"message": "Use Authorization: Bearer <token> header"}
