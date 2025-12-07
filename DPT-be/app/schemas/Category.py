from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime

class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(CategoryBase):
    pass

class CategoryOut(CategoryBase):
    id: int
    create_at: datetime
    update_at: datetime
    
    class Config:
        from_attributes = True

class CategoryResponse(BaseModel):
    message: str
    data: CategoryOut

class CategoriesResponse(BaseModel):
    message: str
    data: List[CategoryOut]

class CategoryDeleteResponse(BaseModel):
    message: str
    data: CategoryOut