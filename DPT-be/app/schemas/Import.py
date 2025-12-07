from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime

class ImportBase(BaseModel):
    supplier_id: int
    employee_id: int
    total_cost: int

class ImportCreate(ImportBase):
    pass

class ImportUpdate(ImportBase):
    pass

class ImportOut(ImportBase):
    id: int
    import_date: datetime
    create_at: datetime
    update_at: datetime
    
    class Config:
        from_attributes = True
