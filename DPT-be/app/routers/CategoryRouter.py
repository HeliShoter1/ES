from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.Category import CategoryCreate, CategoryUpdate
from app.services.CategoryService import CategoryService as categoryService
from app.utils.response import ResponseHandler
from app.models.model import Account
from app.config.security import check_customer_admin
from fastapi.security import HTTPBearer
from fastapi.security.http import HTTPAuthorizationCredentials

router = APIRouter(
    prefix="/categories",
    tags=["Category"],
    responses={404: {"description": "Not Found"}},
)
auth_scheme = HTTPBearer()


@router.post("/")
async def create_category(
    payload: CategoryCreate, 
    db: Session = Depends(get_db),
    admin_account: Account = Depends(check_customer_admin)
):
    out = categoryService.create_category(db, payload)
    return ResponseHandler.create_success("Category", out.id, out)


@router.get("/{category_id}")
async def get_category(
    category_id: int, 
    db: Session = Depends(get_db),
):
    out = categoryService.get_category(db, category_id)
    return ResponseHandler.success("success", out)


@router.get("/")
async def list_categories(
    skip: int = 0, 
    limit: int = 50, 
    db: Session = Depends(get_db)
):
    items = categoryService.list_categories(db, skip, limit)
    return ResponseHandler.success("success", items)


@router.put("/{category_id}")
async def update_category(
    category_id: int,
    payload: CategoryUpdate, 
    db: Session = Depends(get_db),
    admin_account: Account = Depends(check_customer_admin)
):
    out = categoryService.update_category(db, category_id, payload)
    return ResponseHandler.success("success", out)


@router.delete("/{category_id}")
async def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    admin_account: Account = Depends(check_customer_admin)
):
    return categoryService.delete_category(db, category_id)


