  
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime

class CustomerBase(BaseModel):
    full_name: str
    phone: str
    email: EmailStr
    address: str
    password: str

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(CustomerBase):
    pass

class CustomerOut(BaseModel):
    id: int
    full_name: str
    phone: str
    email: EmailStr
    address: str
    create_at: datetime
    update_at: datetime
    
    class Config:
        from_attributes = True