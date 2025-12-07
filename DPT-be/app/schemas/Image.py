from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime
from fastapi import Form

class ProductImageBase(BaseModel):
    product_id: int

class ProductImageCreate(ProductImageBase):
    pass

    @classmethod
    def as_form(
        cls,
        product_id: int = Form(...)
    ):
        return cls(product_id=product_id)

class ProductImageUpdate(ProductImageBase):
    pass

class ProductImageOut(ProductImageBase):
    id: int
    image_path: str
    create_at: datetime
    update_at: datetime
    
    class Config:
        from_attributes = True