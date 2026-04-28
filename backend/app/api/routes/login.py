from fastapi import APIRouter, HTTPException

from app.core.aws import get_user_by_email
from app.core.security import verify_password
from app.schemas.auth import LoginRequest, LoginResponse

router = APIRouter()


@router.post("/login", response_model=LoginResponse)
async def login(payload: LoginRequest):
    email = payload.email.lower()

    user = await get_user_by_email(email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(payload.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return LoginResponse(user_id=user["user_id"], email=user["email"])
