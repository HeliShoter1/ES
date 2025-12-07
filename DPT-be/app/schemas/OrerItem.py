from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime
from app.schemas.Product import ProductOut

class OrderItemBase(BaseModel):
    order_id: int
    product: ProductOut
    quantity: int
    unit_price: int

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int
    unit_price: int

class OrderItemUpdate(OrderItemBase):
    pass

class OrderItemOut(OrderItemBase):
    id: int
    create_at: datetime
    
    class Config:
        from_attributes = True