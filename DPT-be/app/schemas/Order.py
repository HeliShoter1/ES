  
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime
from app.schemas.enums import OrderStatus
from app.schemas.Customer import CustomerOut
from app.schemas.Employee import EmployeeOut
from app.schemas.OrerItem import OrderItemCreate

class OrderBase(BaseModel):
    customer_id: int
    total_amount: Optional[int] = None
    status: OrderStatus = OrderStatus.pending

class OrderCreateRequest(BaseModel):
    customer_id: int
    total_amount: Optional[int] = None
    status: OrderStatus = OrderStatus.pending
    order_items: List[OrderItemCreate] = []

class OrderCreate(OrderBase):
    order_items: List[OrderItemCreate] = []

class OrderUpdate(OrderBase):
    pass

class OrderOut(BaseModel):
    id: int
    customer : CustomerOut
    total_amount: Optional[int] = None
    status: OrderStatus = OrderStatus.pending
    create_at: datetime
    update_at: datetime
    
    class Config:
        from_attributes = True