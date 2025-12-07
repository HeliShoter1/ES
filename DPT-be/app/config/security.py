from fastapi.security.http import HTTPAuthorizationCredentials
from passlib.context import CryptContext
from datetime import datetime, timedelta
from app.config.config import settings
from jose import JWTError, jwt
from app.schemas.auth import Token
from fastapi.encoders import jsonable_encoder
from fastapi import HTTPException, Depends, status
from app.models.model import Customer, Employees, Account
from sqlalchemy.orm import Session
from fastapi.security import HTTPBearer
from app.db.database import get_db
from app.utils.response import ResponseHandler


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
auth_scheme = HTTPBearer()

# Create Hash Password


def get_password_hash(password):
    return pwd_context.hash(password)


# Verify Hash Password
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


# Create Access & Refresh Token
async def get_user_token(id: int, role: str, refresh_token=None):
    # embed both id and role in JWT payload
    payload = {"id": id, "role": role}

    access_token_expiry = timedelta(minutes=settings.access_token_expire_minutes)

    access_token = await create_access_token(payload, access_token_expiry)

    if not refresh_token:
        # include role as well in refresh token payload
        refresh_token = await create_refresh_token(payload)

    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=access_token_expiry.seconds,
        customer_id=id,
        email="",  # Sẽ được set trong service
        role=role,
    )


# Create Access Token
async def create_access_token(data: dict, access_token_expiry=None):
    payload = data.copy()

    expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    payload.update({"exp": expire})

    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


# Create Refresh Token
async def create_refresh_token(data):
    return jwt.encode(data, settings.secret_key, settings.algorithm)


# Get Payload Of Token
def get_token_payload(token):
    try:
        return jwt.decode(token, settings.secret_key, [settings.algorithm])
    except JWTError:
        raise ResponseHandler.invalid_token('access')


def get_current_user(token):
    user = get_token_payload(token.credentials)
    return user.get('id')


def check_customer_admin(
        token: HTTPAuthorizationCredentials = Depends(auth_scheme),
        db: Session = Depends(get_db)):
    payload = get_token_payload(token.credentials)
    user_id = payload.get('id')
    account = db.query(Account).filter(Account.customer_id == user_id).first()
    print(account.role)
    if not account or account.role != 'admin':
        raise HTTPException(status_code=403, detail="Customer admin role required")
    return account

