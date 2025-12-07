from app.schemas.Customer import CustomerOut
from sqlalchemy.orm import Session  # pyright: ignore[reportMissingImports]
from app.models.model import Customer
from app.utils.response import ResponseHandler
from app.config.security import get_password_hash, get_token_payload

class CustomerService:
    @staticmethod
    def get_my_info(db: Session, token):
        user_id = get_token_payload(token.credentials).get('id')
        user = db.query(Customer).filter(Customer.id == user_id).first()
        if not user:
            ResponseHandler.not_found_error("User", user_id)
        return ResponseHandler.get_single_success(user.username, user.id, user)

    @staticmethod
    def edit_my_info(db: Session, token, updated_user):
        user_id = get_token_payload(token.credentials).get('id')
        db_user = db.query(Customer).filter(Customer.id == user_id).first()
        if not db_user:
            ResponseHandler.not_found_error("User", user_id)

        for key, value in updated_user.model_dump().items():
            setattr(db_user, key, value)

        db.commit()
        db.refresh(db_user)
        return ResponseHandler.update_success(db_user.username, db_user.id, db_user)

    @staticmethod
    def remove_my_account(db: Session, token):
        user_id = get_token_payload(token.credentials).get('id')
        db_user = db.query(Customer).filter(Customer.id == user_id).first()
        if not db_user:
            ResponseHandler.not_found_error("User", user_id)
        db.delete(db_user)
        db.commit()
        return ResponseHandler.delete_success(db_user.username, db_user.id, db_user)

    @staticmethod
    def get_all_customer(db:Session, skip:int, limit: int,full_name:str = ""):
        list_customer = db.query(Customer).filter(
            Customer.full_name.like(f"%{full_name}%")
        ).order_by(Customer.id.desc()).offset(skip).limit(limit)
        return [CustomerOut(
                id=user.id,
                full_name=user.full_name,
                phone=user.phone,
                email=user.email,
                address=user.address,
                create_at=user.created_at,
                update_at=user.updated_at
            )
            for user in list_customer]
    
    @staticmethod
    def getCustomer(db:Session,user_id: int):
        user = db.query(Customer).filter(Customer.id == user_id).first()
        if not user:
            ResponseHandler.not_found_error("User", user_id)
        user_out = CustomerOut(
                id=user.id,
                full_name=user.full_name,
                phone=user.phone,
                email=user.email,
                address=user.address,
                create_at=user.created_at,
                update_at=user.updated_at
            )
        return user_out

    @staticmethod
    def getCustomerByName(db:Session,full_name):
        users = db.query(Customer).filter(
            Customer.full_name.like(f"%{full_name}%")
        ).all()
        
        if not users:
            return ResponseHandler.not_found_error("user", full_name)

        user_out_list = [
            CustomerOut(
                id=user.id,
                full_name=user.full_name,
                phone=user.phone,
                email=user.email,
                address=user.address,
                create_at=user.created_at,
                update_at=user.updated_at
            )
            for user in users
        ]
        
        return user_out_list
        
