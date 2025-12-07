from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime
from enum import Enum
from app.schemas.enums import EmployeeRole

class EmployeeBase(BaseModel):
    full_name: str
    phone: str
    email: EmailStr
    address: str
    role: EmployeeRole = EmployeeRole.staff

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    role: Optional[EmployeeRole] = "staff"
    is_active: Optional[bool] = None

class EmployeeOut(BaseModel):
    id: int
    full_name: str
    phone: str
    email: EmailStr
    address: str
    role: EmployeeRole = "staff"
    is_active: Optional[bool] = None
    create_at: datetime
    update_at: datetime
    
    class Config:
        from_attributes = True