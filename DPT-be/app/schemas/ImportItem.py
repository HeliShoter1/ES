from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime 

class ImportItemBase(BaseModel):
    import_id: int
    product_id: int
    quantity: int
    unit_cost: int

class ImportItemCreate(ImportItemBase):
    pass

class ImportItemUpdate(ImportItemBase):
    pass

class ImportItemOut(ImportItemBase):
    id: int
    create_at: datetime
    
    class Config:
        from_attributes = True