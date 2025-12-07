import os
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.models.model import ProductImage
from app.schemas.Image import (
    ProductImageCreate,
    ProductImageUpdate,
    ProductImageOut,
)
from app.utils.response import ResponseHandler
from datetime import datetime
from fastapi import UploadFile
from fastapi import Depends
from fastapi import HTTPException
import shutil, os



class ProductImageService:

    BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    upload_path = os.path.join(BASE_DIR, "uploads")


    @staticmethod
    def create_product_image(
        db: Session,
        file: UploadFile,
        product_id: int
    ) -> ProductImageOut:

        # Validate file
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File không phải là ảnh")

        # Tạo thư mục upload
        upload_dir = "uploads"
        os.makedirs(ProductImageService.upload_path, exist_ok=True)

        # Tạo tên file
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{timestamp}_{file.filename}"
        file_path = os.path.join(ProductImageService.upload_path, filename)

        # Lưu file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Lưu DB
        image = ProductImage(
            product_id=product_id,
            image_path=filename
        )

        db.add(image)
        try:
            db.commit()
        except IntegrityError as exc:
            db.rollback()
            raise HTTPException(status_code=400, detail=str(exc.orig))

        db.refresh(image)
        return ProductImageService._to_out(image)



    @staticmethod
    def get_product_image(db: Session, image_id: int) -> ProductImageOut:
        image = db.query(ProductImage).filter(ProductImage.id == image_id).first()
        if not image:
            ResponseHandler.not_found_error("ProductImage", image_id)
        return ProductImageService._to_out(image)

    @staticmethod
    def get_image_by_product(db:Session, product_id: int):
        list_image = db.query(ProductImage).filter(ProductImage.product_id == product_id).all()
        return [ProductImageService._to_out(i) for i in list_image]

    @staticmethod
    def delete_product_image(db: Session, image_id: int):
        image = db.query(ProductImage).filter(ProductImage.id == image_id).first()
        if not image:
            ResponseHandler.not_found_error("ProductImage", image_id)
        os.remove(image.image_path)
        db.delete(image)
        db.commit()
        return ResponseHandler.delete_success("ProductImage", image_id, None)

    @staticmethod
    def _to_out(image: ProductImage) -> ProductImageOut:
        return ProductImageOut(
            id=image.id,
            product_id=image.product_id,
            image_path=image.image_path,
            create_at=image.created_at,
            update_at=image.updated_at,
        )


