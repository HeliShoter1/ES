from sqlalchemy.orm import Session
from app.models.model import Employees
from app.schemas.Employee import (
    EmployeeCreate,
    EmployeeUpdate,
    EmployeeOut,
)
from app.utils.response import ResponseHandler
from sqlalchemy.exc import IntegrityError


class EmployeeService:
    @staticmethod
    def create_employee(db: Session, payload: EmployeeCreate) -> EmployeeOut:
        existing_email = db.query(Employees).filter(Employees.email == payload.email).first()
        if existing_email:
            raise ResponseHandler.invalid_token("email already exists")

        employee = Employees(
            full_name=payload.full_name,
            phone=payload.phone,
            email=payload.email,
            address=payload.address,
            role=payload.role.value if hasattr(payload.role, "value") else payload.role,
        )
        db.add(employee)
        try:
            db.commit()
        except IntegrityError as exc:
            db.rollback()
            raise ResponseHandler.not_found_error("Employee create failed", str(exc.orig) if hasattr(exc, "orig") else None)
        db.refresh(employee)
        try:
            db.commit()
        except IntegrityError as exc:
            db.rollback()
            raise ResponseHandler.not_found_error("Employee update failed", str(exc.orig) if hasattr(exc, "orig") else None)
        db.refresh(employee)
        return EmployeeOut(
            id=employee.id,
            full_name=employee.full_name,
            phone=employee.phone,
            email=employee.email,
            address=employee.address,
            role=employee.role,
            is_active=employee.is_active,
            create_at=employee.created_at,
            update_at=employee.updated_at,
        )

    @staticmethod
    def get_employee(db: Session, employee_id: int) -> EmployeeOut:
        employee = db.query(Employees).filter(Employees.id == employee_id).first()
        if not employee:
            ResponseHandler.not_found_error("Employee", employee_id)
        return EmployeeOut(
            id=employee.id,
            full_name=employee.full_name,
            phone=employee.phone,
            email=employee.email,
            address=employee.address,
            role=employee.role,
            is_active=employee.is_active,
            create_at=employee.created_at,
            update_at=employee.updated_at,
        )

    @staticmethod
    def list_employees(db: Session, skip: int = 0, limit: int = 50, name: str = "") -> list[EmployeeOut]:
        items = (
            db.query(Employees)
            .filter((Employees.is_active == True) & (Employees.full_name.like(f'%{name.strip()}%')))
            .order_by(Employees.id.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
        return [
            EmployeeOut(
                id=e.id,
                full_name=e.full_name,
                phone=e.phone,
                email=e.email,
                address=e.address,
                role=e.role,
                is_active=e.is_active,
                create_at=e.created_at,
                update_at=e.updated_at,
            )
            for e in items
        ]

    @staticmethod
    def update_employee(db: Session, employee_id: int, payload: EmployeeUpdate) -> EmployeeOut:
        employee = (
            db.query(Employees)
            .filter(Employees.id == employee_id)
            .first()
        )
        if not employee:
            ResponseHandler.not_found_error("Employee", employee_id)

        update_data = payload.model_dump()

        if update_data.get("full_name") is not None:
            employee.full_name = update_data["full_name"]
        if update_data.get("phone") is not None:
            employee.phone = update_data["phone"]
        if update_data.get("email") is not None:
            employee.email = update_data["email"]
        if update_data.get("address") is not None:
            employee.address = update_data["address"]
        # password handling removed per requirement (no password for employees)
        role_value = update_data.get("role")
        if role_value is not None:
            employee.role = role_value.value if hasattr(role_value, "value") else role_value
        if update_data.get("is_active") is not None:
            employee.is_active = bool(update_data["is_active"])

        try:
            db.commit()
        except IntegrityError as exc:
            db.rollback()
            raise ResponseHandler.not_found_error("Employee update failed", str(exc.orig) if hasattr(exc, "orig") else None)
        db.refresh(employee)
        return EmployeeOut(
            id=employee.id,
            full_name=employee.full_name,
            phone=employee.phone,
            email=employee.email,
            address=employee.address,
            role=employee.role,
            is_active = employee.is_active,
            create_at=employee.created_at,
            update_at=employee.updated_at,
        )

    @staticmethod
    def delete_employee(db: Session, employee_id: int):
        employee = db.query(Employees).filter(Employees.id == employee_id).first()
        if not employee:
            ResponseHandler.not_found_error("Employee", employee_id)
        employee.is_active = False
        db.commit()
        return ResponseHandler.delete_success("Employee (soft-deleted)", employee_id, None)


    @staticmethod
    def get_employee_by_name(db:Session, name: str = ""):
        employees = db.query(Employees).filter(Employees.full_name.like(f'%{name}%')).all()
        if not employees:
            ResponseHandler.not_found_error("employee", name)
        employee_out_list = [
            EmployeeOut(
                id=employee.id,
                full_name=employee.full_name,
                phone=employee.phone,
                email=employee.email,
                address=employee.address,
                role= employee.role,
                create_at=employee.created_at,
                update_at=employee.updated_at
            )
            for employee in employees
        ]
        return employee_out_list


 
