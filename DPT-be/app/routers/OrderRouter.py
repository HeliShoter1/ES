from app.config.security import check_customer_admin
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.Order import OrderCreate, OrderCreateRequest, OrderUpdate
from app.schemas.Customer import CustomerOut
from app.services.OrderService import OrderService as orderService
from app.services.auth import AuthService
from app.utils.response import ResponseHandler
from fastapi.security import HTTPBearer
from fastapi.security.http import HTTPAuthorizationCredentials

auth_scheme = HTTPBearer()


router = APIRouter(
    prefix="/orders",
    tags=["Order"],
    responses={404: {"description": "Not Found"}},
)

@router.post("/")
async def create_order(
    payload: OrderCreateRequest,
    db: Session = Depends(get_db),
    token: HTTPAuthorizationCredentials = Depends(auth_scheme)

):
    """
    Tạo đơn hàng cho customer hiện tại dựa trên token.
    """
    order_data = OrderCreate(
        customer_id=payload.customer_id,
        total_amount=payload.total_amount,
        status=payload.status,
        order_items=payload.order_items,
    )
    out = orderService.create_order(db, order_data)
    return ResponseHandler.create_success("Order", out.id, out)


@router.get("/{order_id}")
async def get_order(
    order_id: int, 
    db: Session = Depends(get_db),
    token: HTTPAuthorizationCredentials = Depends(auth_scheme)
):
    out = orderService.get_order(db, order_id)
    return ResponseHandler.success("success", out)


@router.get("/")
async def list_orders(
    skip: int = 0, 
    limit: int = 50, 
    db: Session = Depends(get_db),
    admin_account = Depends(check_customer_admin)
):
    items = orderService.list_orders(db, skip, limit)
    return ResponseHandler.success("success", items)

@router.get("/customer/{customer_id}")
async def list_orders_by_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    token: HTTPAuthorizationCredentials = Depends(auth_scheme)
):
    print(token)
    items = orderService.list_orders_by_customer(db, customer_id)
    return ResponseHandler.success("success", items)

@router.put("/{order_id}")
async def update_order(
    order_id: int, 
    payload: OrderUpdate, 
    db: Session = Depends(get_db),
    admin_account = Depends(check_customer_admin)
):
    out = orderService.update_order(db, order_id, payload)
    return ResponseHandler.success("success", out)


@router.delete("/{order_id}")
async def delete_order(
    order_id: int, 
    db: Session = Depends(get_db),
    admin_account = Depends(check_customer_admin)
):
    return orderService.delete_order(db, order_id)


