from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.ImportItem import ImportItemCreate, ImportItemUpdate
from app.services.ImportItemService import ImportItemService as itemService
from app.utils.response import ResponseHandler
from app.config.security import check_customer_admin


router = APIRouter(
    prefix="/import-items",
    tags=["ImportItem"],
    responses={404: {"description": "Not Found"}},
)


@router.post("/")
async def create_import_item(
    payload: ImportItemCreate, 
    db: Session = Depends(get_db),
    admin_account = Depends(check_customer_admin)
):
    out = itemService.create_import_item(db, payload)
    return ResponseHandler.create_success("ImportItem", out.id, out)


@router.get("/{item_id}")
async def get_import_item(
    item_id: int, 
    db: Session = Depends(get_db),
    admin_account = Depends(check_customer_admin)
):
    out = itemService.get_import_item(db, item_id)
    return ResponseHandler.success("success", out)


@router.get("/")
async def list_import_items(
    skip: int = 0, 
    limit: int = 50, 
    db: Session = Depends(get_db),
    admin_account = Depends(check_customer_admin)
):
    items = itemService.list_import_items(db, skip, limit)
    return ResponseHandler.success("success", items)


@router.put("/{item_id}")
async def update_import_item(
    item_id: int, 
    payload: ImportItemUpdate, 
    db: Session = Depends(get_db),
    admin_account = Depends(check_customer_admin)
):
    out = itemService.update_import_item(db, item_id, payload)
    return ResponseHandler.success("success", out)


@router.delete("/{item_id}")
async def delete_import_item(
    item_id: int, 
    db: Session = Depends(get_db),
    admin_account = Depends(check_customer_admin)
):
    return itemService.delete_import_item(db, item_id)


