from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.models.model import ImportItem
from app.schemas.ImportItem import (
    ImportItemCreate,
    ImportItemUpdate,
    ImportItemOut,
)
from app.utils.response import ResponseHandler


class ImportItemService:
    @staticmethod
    def create_import_item(db: Session, payload: ImportItemCreate) -> ImportItemOut:
        item = ImportItem(
            import_id=payload.import_id,
            product_id=payload.product_id,
            quantity=payload.quantity,
            unit_cost=payload.unit_cost,
        )
        db.add(item)
        try:
            db.commit()
        except IntegrityError as exc:
            db.rollback()
            raise ResponseHandler.not_found_error("ImportItem create failed", str(exc.orig) if hasattr(exc, "orig") else None)
        db.refresh(item)
        return ImportItemService._to_out(item)

    @staticmethod
    def get_import_item(db: Session, item_id: int) -> ImportItemOut:
        item = db.query(ImportItem).filter(ImportItem.id == item_id).first()
        if not item:
            ResponseHandler.not_found_error("ImportItem", item_id)
        return ImportItemService._to_out(item)

    @staticmethod
    def list_import_items(db: Session, skip: int = 0, limit: int = 50) -> list[ImportItemOut]:
        items = (
            db.query(ImportItem)
            .order_by(ImportItem.id.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
        return [ImportItemService._to_out(i) for i in items]

    @staticmethod
    def update_import_item(db: Session, item_id: int, payload: ImportItemUpdate) -> ImportItemOut:
        item = db.query(ImportItem).filter(ImportItem.id == item_id).first()
        if not item:
            ResponseHandler.not_found_error("ImportItem", item_id)
        data = payload.model_dump()
        for key in ["import_id", "product_id", "quantity", "unit_cost"]:
            if data.get(key) is not None:
                setattr(item, key, data[key])
        try:
            db.commit()
        except IntegrityError as exc:
            db.rollback()
            raise ResponseHandler.not_found_error("ImportItem update failed", str(exc.orig) if hasattr(exc, "orig") else None)
        db.refresh(item)
        return ImportItemService._to_out(item)

    @staticmethod
    def delete_import_item(db: Session, item_id: int):
        item = db.query(ImportItem).filter(ImportItem.id == item_id).first()
        if not item:
            ResponseHandler.not_found_error("ImportItem", item_id)
        db.delete(item)
        db.commit()
        return ResponseHandler.delete_success("ImportItem", item_id, None)

    @staticmethod
    def _to_out(item: ImportItem) -> ImportItemOut:
        return ImportItemOut(
            id=item.id,
            import_id=item.import_id,
            product_id=item.product_id,
            quantity=item.quantity,
            unit_cost=item.unit_cost,
            create_at=item.created_at,
        )


