from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime 
from app.schemas.Customer import CustomerOut
from app.schemas.Product import ProductOut

class CartProduct(BaseModel):
    product: ProductOut
    number: int

class CartBase(BaseModel):
    customer: int
    products: List[CartProduct]

class CartUpdate(BaseModel):
    customer: int
    product_id: int
    number: int

class CartDelete(BaseModel):
    customer_id: int
    product_id: int 

class CartOut(CartBase):
    pass

    
