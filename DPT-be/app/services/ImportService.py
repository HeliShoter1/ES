from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.models.model import Import
from app.schemas.Import import (
    ImportCreate,
    ImportUpdate,
    ImportOut,
)
from app.utils.response import ResponseHandler


class ImportService:
    @staticmethod
    def create_import(db: Session, payload: ImportCreate) -> ImportOut:
        imp = Import(
            supplier_id=payload.supplier_id,
            employee_id=payload.employee_id,
            total_cost=payload.total_cost,
        )
        db.add(imp)
        try:
            db.commit()
        except IntegrityError as exc:
            db.rollback()
            raise ResponseHandler.not_found_error("Import create failed", str(exc.orig) if hasattr(exc, "orig") else None)
        db.refresh(imp)
        return ImportService._to_out(imp)

    @staticmethod
    def get_import(db: Session, import_id: int) -> ImportOut:
        imp = db.query(Import).filter(Import.id == import_id).first()
        if not imp:
            ResponseHandler.not_found_error("Import", import_id)
        return ImportService._to_out(imp)

    @staticmethod
    def list_imports(db: Session, skip: int = 0, limit: int = 50) -> list[ImportOut]:
        items = (
            db.query(Import)
            .order_by(Import.id.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
        return [ImportService._to_out(i) for i in items]

    @staticmethod
    def update_import(db: Session, import_id: int, payload: ImportUpdate) -> ImportOut:
        imp = db.query(Import).filter(Import.id == import_id).first()
        if not imp:
            ResponseHandler.not_found_error("Import", import_id)
        data = payload.model_dump()
        for key in ["supplier_id", "employee_id", "total_cost"]:
            if data.get(key) is not None:
                setattr(imp, key, data[key])
        try:
            db.commit()
        except IntegrityError as exc:
            db.rollback()
            raise ResponseHandler.not_found_error("Import update failed", str(exc.orig) if hasattr(exc, "orig") else None)
        db.refresh(imp)
        return ImportService._to_out(imp)

    @staticmethod
    def delete_import(db: Session, import_id: int):
        imp = db.query(Import).filter(Import.id == import_id).first()
        if not imp:
            ResponseHandler.not_found_error("Import", import_id)
        db.delete(imp)
        db.commit()
        return ResponseHandler.delete_success("Import", import_id, None)

    @staticmethod
    def _to_out(imp: Import) -> ImportOut:
        return ImportOut(
            id=imp.id,
            supplier_id=imp.supplier_id,
            employee_id=imp.employee_id,
            total_cost=imp.total_cost,
            import_date=imp.import_date,
            create_at=imp.created_at,
            update_at=imp.updated_at,
        )


