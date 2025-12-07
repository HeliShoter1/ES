from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.schemas.Cart import CartOut, CartUpdate
from app.services.CartService import CartService
from app.db.database import get_db
from fastapi.security import HTTPBearer
from fastapi.security.http import HTTPAuthorizationCredentials

router = APIRouter(prefix="/carts", tags=["Cart"])
auth_scheme = HTTPBearer()


@router.get("/{customer_id}", response_model=CartOut, status_code=status.HTTP_200_OK)
def get_cart(
    customer_id: int,
    db: Session = Depends(get_db),
    token: HTTPAuthorizationCredentials = Depends(auth_scheme),
):
    """
    Trả về CartOut trực tiếp để phù hợp với response_model.
    """
    cart = CartService.getCartByCustomerID(db, customer_id)
    return cart


@router.put("/", status_code=status.HTTP_200_OK)
def update_cart(
    payload: CartUpdate,
    db: Session = Depends(get_db),
    token: HTTPAuthorizationCredentials = Depends(auth_scheme),
):
    """
    Cập nhật / thêm item vào giỏ.
    Frontend hiện không dùng chi tiết response, chỉ cần biết gọi thành công.
    """
    out = CartService.UpdateCart(db, payload)
    return out


@router.delete("/{customer_id}/{product_id}", status_code=status.HTTP_200_OK)
def delete_cart(
    customer_id: int,
    product_id: int,
    db: Session = Depends(get_db),
    token: HTTPAuthorizationCredentials = Depends(auth_scheme),
):
    """
    Xoá item khỏi giỏ; trả về dict message.
    """
    out = CartService.DeleteCart(db, customer_id, product_id)
    return out
