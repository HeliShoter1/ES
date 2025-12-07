from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.Product import ProductCreate, ProductUpdate
from app.services.ProductService import ProductService as productService
from app.utils.response import ResponseHandler
from fastapi.security import HTTPBearer
from fastapi.security.http import HTTPAuthorizationCredentials
from app.config.security import check_customer_admin
from app.models.model import Account
from typing import Optional
from fastapi import File, UploadFile, Form
import json
from app.services.ProductImageService import ProductImageService

router = APIRouter(
    prefix="/products",
    tags=["Product"],
    responses={404: {"description": "Not Found"}},
)
auth_scheme = HTTPBearer()


@router.post("")
async def create_product(
    payload: str = Form(...),  # nhận JSON dạng string
    file: UploadFile = File(None),
    db: Session = Depends(get_db),
    admin_account: Account = Depends(check_customer_admin)
):
    payload_obj = ProductCreate(**json.loads(payload))

    out = productService.create_product(db, payload_obj)
    
    if file != None:
        image_out = ProductImageService.create_product_image(db,file,out.id)
    return ResponseHandler.create_success("Product", out.id, out)


@router.get("/{product_id}")
async def get_product(
    product_id: int, 
    db: Session = Depends(get_db),
):
    out = productService.get_product(db, product_id)
    return ResponseHandler.success("success", out)


@router.get("")
async def list_products(
    skip: int = 0, 
    limit: int = 50, 
    db: Session = Depends(get_db),
):
    items = productService.list_products(db, skip, limit)
    return ResponseHandler.success("success", items)

@router.get("/products/search")
async def search_products(
    category_id: int = Query(None, description="Filter by category"),
    supplier_id: int = Query(None, description="Filter by supplier"),
    name: str = Query(None, description="Search by product name"),
    min_price: float = Query(None, description="Minimum price"),
    max_price: float = Query(None, description="Maximum price"),
    db: Session = Depends(get_db),
):
    products = productService.search_products(
        db=db,
        category_id=category_id,
        supplier_id=supplier_id,
        name=name,
        min_price=min_price,
        max_price=max_price
    )
    
    return ResponseHandler.success("Search results", products)

@router.get('/supplier/{id_supplier}')
async def product_by_category(
    id_supplier: int,
    db: Session =  Depends(get_db)
):
    list_products = productService.list_product_by_supplier(db,id_supplier)
    return ResponseHandler.success("success", list_products)

@router.put("/{product_id}")
async def update_product(
    product_id: int, 
    payload: ProductUpdate, 
    db: Session = Depends(get_db),
    admin_account: Account = Depends(check_customer_admin)
):
    out = productService.update_product(db, product_id, payload)
    return ResponseHandler.success("success", out)


@router.delete("/{product_id}")
async def delete_product(
    product_id: int, 
    db: Session = Depends(get_db),
    admin_account: Account = Depends(check_customer_admin)
):
    return productService.delete_product(db, product_id)


