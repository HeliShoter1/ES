from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.models.model import Category
from app.schemas.Category import (
    CategoryCreate,
    CategoryUpdate,
    CategoryOut,
)
from app.utils.response import ResponseHandler


class CategoryService:
    @staticmethod
    def create_category(db: Session, payload: CategoryCreate) -> CategoryOut:
        existing = db.query(Category).filter(Category.name == payload.name).first()
        if existing:
            raise ResponseHandler.not_found_error("Category create failed", "name already exists")

        category = Category(name=payload.name, description=payload.description)
        db.add(category)
        try:
            db.commit()
        except IntegrityError as exc:
            db.rollback()
            raise ResponseHandler.not_found_error("Category create failed", str(exc.orig) if hasattr(exc, "orig") else None)
        db.refresh(category)
        return CategoryOut(
            id=category.id,
            name=category.name,
            description=category.description,
            create_at=category.created_at,
            update_at=category.updated_at,
        )

    @staticmethod
    def get_category(db: Session, category_id: int) -> CategoryOut:
        category = db.query(Category).filter(Category.id == category_id).first()
        if not category:
            ResponseHandler.not_found_error("Category", category_id)
        return CategoryOut(
            id=category.id,
            name=category.name,
            description=category.description,
            create_at=category.created_at,
            update_at=category.updated_at,
        )

    @staticmethod
    def list_categories(db: Session, skip: int = 0, limit: int = 50) -> list[CategoryOut]:
        items = (
            db.query(Category)
            .order_by(Category.id.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
        return [
            CategoryOut(
                id=c.id,
                name=c.name,
                description=c.description,
                create_at=c.created_at,
                update_at=c.updated_at,
            )
            for c in items
        ]

    @staticmethod
    def update_category(db: Session, category_id: int, payload: CategoryUpdate) -> CategoryOut:
        category = db.query(Category).filter(Category.id == category_id).first()
        if not category:
            ResponseHandler.not_found_error("Category", category_id)

        update_data = payload.model_dump()
        if update_data.get("name") is not None:
            category.name = update_data["name"]
        if update_data.get("description") is not None:
            category.description = update_data["description"]

        try:
            db.commit()
        except IntegrityError as exc:
            db.rollback()
            raise ResponseHandler.not_found_error("Category update failed", str(exc.orig) if hasattr(exc, "orig") else None)
        db.refresh(category)
        return CategoryOut(
            id=category.id,
            name=category.name,
            description=category.description,
            create_at=category.created_at,
            update_at=category.updated_at,
        )

    @staticmethod
    def delete_category(db: Session, category_id: int):
        category = db.query(Category).filter(Category.id == category_id).first()
        if not category:
            ResponseHandler.not_found_error("Category", category_id)
        db.delete(category)
        db.commit()
        return ResponseHandler.delete_success("Category", category_id, None)


