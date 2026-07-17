from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session

from app.api import deps
from app.crud import crud_user
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.core.database import get_db

router = APIRouter()

@router.post("/", response_model=UserResponse)
def create_user(
    *,
    db: Session = Depends(get_db),
    user_in: UserCreate,
) -> Any:
    """
    Create new user.
    """
    user = crud_user.get_user_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The user with this username/email already exists in the system.",
        )
    user = crud_user.create_user(db, user_in=user_in)
    return user

@router.get("/me", response_model=UserResponse)
def read_user_me(
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get current user.
    """
    return current_user

@router.put("/me", response_model=UserResponse)
def update_user_me(
    *,
    db: Session = Depends(get_db),
    user_in: UserUpdate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Update own user.
    """
    user = crud_user.update_user(db, db_user=current_user, user_in=user_in)
    return user

@router.post("/me/avatar")
def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Upload and update user avatar.
    """
    return {"avatar_url": f"/assets/avatars/user_{current_user.id}_{file.filename}"}

@router.delete("/me")
def delete_user_me(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Delete current user.
    """
    db.delete(current_user)
    db.commit()
    return {"message": "Account deleted successfully"}

@router.get("/me/export")
def export_user_data(
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Export current user data in JSON format.
    """
    return {
        "user": {
            "email": current_user.email,
            "full_name": current_user.full_name,
            "created_at": str(current_user.created_at)
        },
        "modules": {
            "goals": [],
            "habits": [],
            "notes": [],
            "finances": []
        },
        "preferences": {
            "language": "en",
            "timezone": "UTC"
        }
    }
