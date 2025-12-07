from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security.oauth2 import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.services.auth import AuthService
from app.schemas.auth import CustomerRegister, AuthResponse, Token
from app.schemas.Customer import CustomerOut
from app.utils.response import ResponseHandler

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
    responses={404: {"description": "Not found"}},
)


@router.post("/login", response_model=AuthResponse)
async def login(
    user_credentials: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Đăng nhập customer với email và password
    """
    try:
        token_data = await AuthService.login(user_credentials, db)
        return AuthResponse(
            success=True,
            message="Đăng nhập thành công",
            data=token_data
        )
    except HTTPException as e:
        return AuthResponse(
            success=False,
            message=e.detail
        )
    except Exception as e:
        return AuthResponse(
            success=False,
            message="Lỗi hệ thống khi đăng nhập"
        )

@router.post("/register", response_model=AuthResponse)
async def register(
    user_data: CustomerRegister,
    db: Session = Depends(get_db)
):
    """
    Đăng ký tài khoản customer mới
    """
    try:
        result = await AuthService.signup(db, user_data)
        return AuthResponse(
            success=True,
            message="Đăng ký thành công",
            customer=result
        )
    except HTTPException as e:
        return AuthResponse(
            success=False,
            message=e.detail
        )
    except Exception as e:
        return AuthResponse(
            success=False,
            message=f"Lỗi hệ thống khi đăng ký: {str(e)}"
        )

@router.post("/refresh", response_model=AuthResponse)
async def refresh_token(
    token: str,
    db: Session = Depends(get_db)
):
    """
    Làm mới access token
    """
    try:
        token_data = await AuthService.get_refresh_token(token, db)
        return AuthResponse(
            success=True,
            message="Token được làm mới thành công",
            data=token_data
        )
    except HTTPException as e:
        return AuthResponse(
            success=False,
            message=e.detail
        )
    except Exception as e:
        return AuthResponse(
            success=False,
            message="Lỗi hệ thống khi làm mới token"
        )

