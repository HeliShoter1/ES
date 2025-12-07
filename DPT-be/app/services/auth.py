from fastapi import HTTPException, Depends, status
from fastapi.security.oauth2 import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.models.model import Customer, Account
from app.db.database import get_db
from app.config.security import verify_password, get_user_token, get_token_payload
from app.config.security import get_password_hash
from app.utils.response import ResponseHandler
from app.schemas.auth import CustomerRegister, TokenData
from app.schemas.Customer import CustomerOut


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


class AuthService:
    @staticmethod
    async def login(user_credentials: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
        # OAuth2 form uses 'username' field; treat it as email
        user = db.query(Customer).filter(Customer.email == user_credentials.username).first()
        account = db.query(Account).filter(Account.customer_id == (user.id if user else None)).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid Credentials")

        if not verify_password(user_credentials.password, user.password_hash):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid Credentials")

        role = account.role if account else "user"
        token_data = await get_user_token(id=user.id, role=role)
        token_data.email = user.email
        token_data.role = role
        return token_data

    @staticmethod
    async def signup(db: Session, user: CustomerRegister):
        # Kiểm tra email đã tồn tại chưa
        existing_user = db.query(Customer).filter(Customer.email == user.email).first()
        if existing_user:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
        
        # Kiểm tra phone đã tồn tại chưa
        existing_phone = db.query(Customer).filter(Customer.phone == user.phone).first()
        if existing_phone:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Phone number already registered")
        
        hashed_password = get_password_hash(user.password)
        
        # Tạo Customer object với các field đúng từ model
        db_user = Customer(
            full_name=user.full_name,
            phone=user.phone,
            email=user.email,
            address=user.address,
            password_hash=hashed_password
        )
        
        try:
            db.add(db_user)
            db.commit()
            db.refresh(db_user)

            # Create default account with role 'user'
            account = Account(customer_id=db_user.id)
            db.add(account)
            db.commit()
            db.refresh(account)

            # Trả về CustomerOut object
            return CustomerOut(
                id=db_user.id,
                full_name=db_user.full_name,
                phone=db_user.phone,
                email=db_user.email,
                address=db_user.address,
                create_at=db_user.created_at,
                update_at=db_user.updated_at
            )
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Lỗi khi tạo tài khoản: {str(e)}"
            )

    @staticmethod
    async def get_refresh_token(token, db):
        payload = get_token_payload(token)
        user_id = payload.get('id', None)
        role = payload.get('role', 'user')
        if not user_id:
            raise ResponseHandler.invalid_token('refresh')

        user = db.query(Customer).filter(Customer.id == user_id).first()
        if not user:
            raise ResponseHandler.invalid_token('refresh')

        return await get_user_token(id=user.id, role=role, refresh_token=token)

    @staticmethod
    async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
        """
        Lấy thông tin user hiện tại từ token
        """
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
        try:
            payload = get_token_payload(token)
            customer_id: int = payload.get("id")
            if customer_id is None:
                raise credentials_exception
            
            token_data = TokenData(customer_id=customer_id)
        except Exception:
            raise credentials_exception
        
        user = db.query(Customer).filter(Customer.id == token_data.customer_id).first()
        if user is None:
            raise credentials_exception
        
        return CustomerOut(
            id=user.id,
            full_name=user.full_name,
            phone=user.phone,
            email=user.email,
            address=user.address,
            create_at=user.created_at,
            update_at=user.updated_at
        )
