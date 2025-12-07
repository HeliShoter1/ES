from app.config.security import auth_scheme, check_customer_admin
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.OrerItem import OrderItemOut
from app.services.OrderItemService import OrderItemService
from app.utils.response import ResponseHandler
from fastapi.security import HTTPBearer
from fastapi.security.http import HTTPAuthorizationCredentials


auth_scheme = HTTPBearer()

router = APIRouter(
    prefix="/items",
    tags = ['items'],
    responses = {404:{"description": "Not Found"}}
)

@router.get("/{order_id}")
async def getItems(
    order_id: int,
    db: Session = Depends(get_db),
    # token: HTTPAuthorizationCredentials = Depends(auth_scheme),
):
    item_list = OrderItemService.getOrderItem(db,order_id)
    return ResponseHandler.success("success",item_list);