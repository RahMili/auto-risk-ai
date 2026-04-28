import uuid

from botocore.exceptions import ClientError
from fastapi import APIRouter, HTTPException

from app.core.aws import create_user
from app.core.security import hash_password
from app.schemas.auth import RegisterRequest, RegisterResponse

router = APIRouter()


@router.post("/register", response_model=RegisterResponse)
async def register(payload: RegisterRequest):
    email = payload.email.lower()

    password_hash = hash_password(payload.password)
    user_id = str(uuid.uuid4())

    try:
        await create_user(
            user_id=user_id,
            email=email,
            password_hash=password_hash,
            name=(payload.name or "").strip(),
            user_name="",
        )
    except ClientError as e:
        if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
            raise HTTPException(status_code=409, detail="Email already registered")
        raise

    return RegisterResponse(user_id=user_id, email=email)
