from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict

# Shared properties
class UserBase(BaseModel):
    email: str
    full_name: Optional[str] = None
    is_active: bool = True
    is_superuser: bool = False

# Properties to receive on user creation
class UserCreate(UserBase):
    password: str

# Properties to receive on user update
class UserUpdate(BaseModel):
    password: Optional[str] = None
    email: Optional[str] = None
    full_name: Optional[str] = None

# Properties to return to client
class UserResponse(UserBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
