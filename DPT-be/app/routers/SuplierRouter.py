from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.Suplier import SupplierCreate, SupplierUpdate
from app.services.SuplierService import SuplierService as suplierService
from app.utils.response import ResponseHandler
from app.config.security import check_customer_admin



router = APIRouter(
    prefix="/suplier",
    tags=["Suplier"],
    responses={404: {"description": "Not Found"}},
)


@router.post("/")
async def create_suplier(
    payload: SupplierCreate, 
    db: Session = Depends(get_db),
    admin_account = Depends(check_customer_admin)
):
    try:
        out = suplierService.create_supplier(db, payload)
        return ResponseHandler.create_success("Suplier", out.id, out)
    except Exception:
        return ResponseHandler.not_found_error("Suplier create failed")


@router.get("/{suplier_id}")
async def get_suplier_by_id(
    suplier_id: int, 
    db: Session = Depends(get_db),
):
    try:
        out = suplierService.get_supplier(db, suplier_id)
        return ResponseHandler.success("success", out)
    except Exception:
        return ResponseHandler.not_found_error("Suplier", suplier_id)


@router.get("/")
async def list_supliers(
    skip: int = 0, 
    limit: int = 50, 
    db: Session = Depends(get_db),
):
    try:
        items = suplierService.list_suppliers(db, skip, limit)
        return ResponseHandler.success("success", items)
    except Exception:
        return ResponseHandler.not_found_error("Suplier list", None)


@router.get("/search/by-name")
async def search_suplier_by_name(
    name: str, 
    db: Session = Depends(get_db)
):
    try:
        items = suplierService.getSuplierByName(db, name)
        return ResponseHandler.success("success", items)
    except Exception:
        return ResponseHandler.not_found_error("Suplier", name)


@router.put("/{suplier_id}")
async def update_suplier(
    suplier_id: int, 
    payload: SupplierUpdate, 
    db: Session = Depends(get_db),
    admin_account = Depends(check_customer_admin)
):
    try:
        out = suplierService.update_supplier(db, suplier_id, payload)
        return ResponseHandler.success("success", out)
    except Exception:
        return ResponseHandler.not_found_error("Suplier update failed", suplier_id)


@router.delete("/{suplier_id}")
async def delete_suplier(
    suplier_id: int, 
    db: Session = Depends(get_db),
    admin_account = Depends(check_customer_admin)
):
    try:
        return suplierService.delete_supplier(db, suplier_id)
    except Exception:
        return ResponseHandler.not_found_error("Suplier delete failed", suplier_id)

