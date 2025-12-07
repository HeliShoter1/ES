from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime

class SupplierBase(BaseModel):
    name: str
    address: Optional[str] = None
    phone: str
    email: EmailStr

class SupplierCreate(SupplierBase):
    pass

class SupplierUpdate(SupplierBase):
    pass

class SupplierOut(SupplierBase):
    id: int
    create_at: datetime
    update_at: datetime
    
    class Config:
        from_attributes = True