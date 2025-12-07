from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.Import import ImportCreate, ImportUpdate
from app.services.ImportService import ImportService as importService
from app.utils.response import ResponseHandler
from app.config.security import check_customer_admin


router = APIRouter(
    prefix="/imports",
    tags=["Import"],
    responses={404: {"description": "Not Found"}},
)


@router.post("/")
async def create_import(
    payload: ImportCreate, 
    db: Session = Depends(get_db),
    admin_account = Depends(check_customer_admin)
):
    out = importService.create_import(db, payload)
    return ResponseHandler.create_success("Import", out.id, out)


@router.get("/{import_id}")
async def get_import(
    import_id: int, 
    db: Session = Depends(get_db),
    admin_account = Depends(check_customer_admin)
):
    out = importService.get_import(db, import_id)
    return ResponseHandler.success("success", out)


@router.get("/")
async def list_imports(
    skip: int = 0, 
    limit: int = 50, 
    db: Session = Depends(get_db),
    admin_account = Depends(check_customer_admin)
):
    items = importService.list_imports(db, skip, limit)
    return ResponseHandler.success("success", items)


@router.put("/{import_id}")
async def update_import(
    import_id: int, 
    payload: ImportUpdate, 
    db: Session = Depends(get_db),
    admin_account = Depends(check_customer_admin)
):
    out = importService.update_import(db, import_id, payload)
    return ResponseHandler.success("success", out)


@router.delete("/{import_id}")
async def delete_import(
    import_id: int, 
    db: Session = Depends(get_db),
    admin_account = Depends(check_customer_admin)
):
    return importService.delete_import(db, import_id)


