from app.utils import response
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.models.model import Suplier
from app.schemas.Suplier import (
    SupplierCreate,
    SupplierUpdate,
    SupplierOut,
)
from app.utils.response import ResponseHandler


class SuplierService:
    @staticmethod
    def create_supplier(db: Session, payload: SupplierCreate) -> SupplierOut:
        existing_email = db.query(Suplier).filter(Suplier.email == payload.email).first()
        if existing_email:
            raise ResponseHandler.not_found_error("Supplier create failed", "email already exists")

        existing_phone = db.query(Suplier).filter(Suplier.phone == payload.phone).first()
        if existing_phone:
            raise ResponseHandler.not_found_error("Supplier create failed", "phone already exists")

        existing_name = db.query(Suplier).filter(Suplier.name == payload.name).first()
        if existing_name:
            raise ResponseHandler.not_found_error("Supplier create failed", "name already exists")

        supplier = Suplier(
            name=payload.name,
            address=payload.address,
            phone=payload.phone,
            email=payload.email,
        )

        db.add(supplier)
        try:
            db.commit()
        except IntegrityError as exc:
            db.rollback()
            raise ResponseHandler.not_found_error("Supplier create failed", str(exc.orig) if hasattr(exc, "orig") else None)
        db.refresh(supplier)

        return SupplierOut(
            id=supplier.id,
            name=supplier.name,
            address=supplier.address,
            phone=supplier.phone,
            email=supplier.email,
            create_at=supplier.created_at,
            update_at=supplier.updated_at,
        )

    @staticmethod
    def get_supplier(db: Session, supplier_id: int) -> SupplierOut:
        supplier = db.query(Suplier).filter(Suplier.id == supplier_id).first()
        if not supplier:
            ResponseHandler.not_found_error("Supplier", supplier_id)
        return SupplierOut(
            id=supplier.id,
            name=supplier.name,
            address=supplier.address,
            phone=supplier.phone,
            email=supplier.email,
            create_at=supplier.created_at,
            update_at=supplier.updated_at,
        )
    
    @staticmethod
    def getSuplierByName(db: Session, suplier_name: str):
        suplier = db.query(Suplier).filter(Suplier.name.like(f'%{suplier_name}%'))
        if not suplier:
            ResponseHandler.not_found_error("Suplier", suplier_name)
        suplier_out = [SupplierOut(
            id=sp.id,
            name=sp.name,
            address=sp.address,
            phone=sp.phone,
            email=sp.email,
            create_at=sp.created_at,
            update_at=sp.updated_at,
            ) for sp in suplier ]
        return suplier_out

    @staticmethod
    def list_suppliers(db: Session, skip: int = 0, limit: int = 50) -> list[SupplierOut]:
        items = (
            db.query(Suplier)
            .order_by(Suplier.id.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
        return [
            SupplierOut(
                id=s.id,
                name=s.name,
                address=s.address,
                phone=s.phone,
                email=s.email,
                create_at=s.created_at,
                update_at=s.updated_at,
            )
            for s in items
        ]

    @staticmethod
    def update_supplier(db: Session, supplier_id: int, payload: SupplierUpdate) -> SupplierOut:
        supplier = db.query(Suplier).filter(Suplier.id == supplier_id).first()
        if not supplier:
            ResponseHandler.not_found_error("Supplier", supplier_id)

        update_data = payload.model_dump()

        if update_data.get("name") is not None:
            supplier.name = update_data["name"]
        if update_data.get("address") is not None:
            supplier.address = update_data["address"]
        if update_data.get("phone") is not None:
            supplier.phone = update_data["phone"]
        if update_data.get("email") is not None:
            supplier.email = update_data["email"]

        try:
            db.commit()
        except IntegrityError as exc:
            db.rollback()
            raise ResponseHandler.not_found_error("Supplier update failed", str(exc.orig) if hasattr(exc, "orig") else None)
        db.refresh(supplier)

        return SupplierOut(
            id=supplier.id,
            name=supplier.name,
            address=supplier.address,
            phone=supplier.phone,
            email=supplier.email,
            create_at=supplier.created_at,
            update_at=supplier.updated_at,
        )

    @staticmethod
    def delete_supplier(db: Session, supplier_id: int):
        supplier = db.query(Suplier).filter(Suplier.id == supplier_id).first()
        if not supplier:
            ResponseHandler.not_found_error("Supplier", supplier_id)
        db.delete(supplier)
        db.commit()
        return ResponseHandler.delete_success("Supplier", supplier_id, None)

    

