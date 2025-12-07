from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime 
from app.schemas.Category import CategoryOut
from app.schemas.Suplier import SupplierOut
from app.schemas.Image import ProductImageOut

class ProductBase(BaseModel):
    name: str
    category_id: int
    supplier_id: int
    description: Optional[str] = None
    cost_price: float
    sell_price: float
    stock_quantity: int
    warranty_months: int
    category: Optional[str] = None
    product_image: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(ProductBase):
    pass

class ProductOut(BaseModel):
    id: int
    name: str
    supplier: SupplierOut
    description: Optional[str] = None
    cost_price: float
    sell_price: float
    stock_quantity: int
    warranty_months: int

    product_image: Optional[List[ProductImageOut]] = None
    category: CategoryOut
    create_at: datetime
    update_at: datetime

    class Config:
        from_attributes = True

