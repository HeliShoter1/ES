from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.Image import ProductImageCreate, ProductImageUpdate
from app.services.ProductImageService import ProductImageService as imageService
from app.utils.response import ResponseHandler
from app.config.security import check_customer_admin
from fastapi.security.http import HTTPAuthorizationCredentials
from fastapi.security import HTTPBearer
from fastapi import UploadFile, File
from fastapi.responses import FileResponse
from PIL import Image
from fastapi import UploadFile, File, HTTPException, Depends
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
import shutil, os
from datetime import datetime
from fastapi import Form

router = APIRouter(
    prefix="/product-images",
    tags=["ProductImage"],
    responses={404: {"description": "Not Found"}},
)
auth_scheme = HTTPBearer()


@router.post("/")
async def create_product_image(
    product_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    try:
        out = imageService.create_product_image(db, file, product_id)
        return ResponseHandler.create_success("ProductImage", out.id, out)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{image_path}")
async def get_product_image(
    image_path: str, 
    db: Session = Depends(get_db)
):
    upload_dir = "uploads"
    full_path = os.path.join(upload_dir, image_path)
    if not os.path.exists(full_path):
        raise HTTPException(status_code=404, detail="Ảnh không tồn tại")
    return FileResponse(
        full_path,
        media_type="image/png"
    )


@router.delete("/{image_id}")
async def delete_product_image(
    image_id: int, 
    db: Session = Depends(get_db),
    admin_account = Depends(check_customer_admin)
):
    return imageService.delete_product_image(db, image_id)


