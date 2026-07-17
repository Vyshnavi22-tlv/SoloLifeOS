from datetime import datetime, timedelta, timezone
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import jwt
from pydantic import ValidationError

from app.core import security
from app.core.config import settings
from app.core.database import get_db
from app.crud import crud_user
from app.schemas.token import Token, TokenPayload
from app.schemas.user import UserResponse
from app.api import deps

router = APIRouter()

@router.post("/login/access-token", response_model=Token)
def login_access_token(
    db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get access and refresh tokens.
    """
    user = crud_user.authenticate_user(
        db, email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password",
        )
    elif not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user"
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "refresh_token": security.create_refresh_token(user.id),
        "token_type": "bearer",
    }

@router.post("/refresh", response_model=Token)
def refresh_token(
    *,
    db: Session = Depends(get_db),
    refresh_token: str
) -> Any:
    """
    Refresh access token using refresh token.
    """
    try:
        payload = jwt.decode(
            refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
        if token_data.type != "refresh":
            raise HTTPException(status_code=400, detail="Invalid token type")
    except (jwt.JWTError, ValidationError):
        raise HTTPException(status_code=403, detail="Could not validate credentials")

    user = crud_user.get_user(db, user_id=int(token_data.sub))
    if not user or not user.is_active:
        raise HTTPException(status_code=400, detail="User is inactive or not found")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "refresh_token": security.create_refresh_token(user.id),
        "token_type": "bearer",
    }

@router.post("/forgot-password")
def forgot_password(email: str, db: Session = Depends(get_db)) -> Any:
    """
    Generate password reset token.
    """
    user = crud_user.get_user_by_email(db, email=email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    reset_token = jwt.encode(
        {"exp": expire, "sub": email, "type": "reset"},
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    return {
        "message": "Password reset token generated successfully. In production, this would be emailed.",
        "reset_token": reset_token
    }

@router.post("/reset-password")
def reset_password(token: str, new_password: str, db: Session = Depends(get_db)) -> Any:
    """
    Reset password using reset token.
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email = payload.get("sub")
        token_type = payload.get("type")
        if not email or token_type != "reset":
            raise HTTPException(status_code=400, detail="Invalid reset token")
    except jwt.JWTError:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    user = crud_user.get_user_by_email(db, email=email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.hashed_password = security.get_password_hash(new_password)
    db.add(user)
    db.commit()
    return {"message": "Password updated successfully"}

@router.post("/test-token", response_model=UserResponse)
def test_token(current_user=Depends(deps.get_current_user)) -> Any:
    """
    Test access token.
    """
    return current_user
