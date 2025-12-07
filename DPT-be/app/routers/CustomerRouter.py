from app.db.database import get_db
from fastapi import APIRouter, Depends, HTTPException, status
from app.models.model import Customer
from app.services.customer import CustomerService as customerService
from app.schemas.Customer import CustomerOut
from app.utils.response import ResponseHandler
from sqlalchemy.orm import Session
from app.config.security import check_customer_admin

router = APIRouter(
    prefix = "/customer",
    tags = ["Customer"],
    responses = {404:{"description": "Not Found"}}
)


@router.get("/{user_id}")
async def getUser(
    user_id: int,
    db: Session = Depends(get_db),
    admin_account = Depends(check_customer_admin)):
    """Xem thông tin khách hàng - Chỉ admin"""
    try:
        user = customerService.getCustomer(db,user_id)
        return ResponseHandler.success("success", user)
    except:
        ResponseHandler.not_found_error(f"{user_id}", {user_id})

@router.get("")
async def getAllUser(db: Session= Depends(get_db), skip: int = 0, limit: int = 50, search: str = ""):
    try:
        list_user = customerService.get_all_customer(db,skip,limit,search)
        return ResponseHandler.success("success",list_user)
    except:
        ResponseHandler.not_found_error("error", "error")


@router.get("/username/")
async def getUserByName(
    full_name: str,
    db: Session = Depends(get_db),
    admin_account = Depends(check_customer_admin)):
    """Tìm kiếm khách hàng theo tên - Chỉ admin"""
    try:
        list_user = customerService.getCustomerByName(db,full_name)
        return ResponseHandler.success("success", list_user)
    except:
         ResponseHandler.not_found_error(f"{full_name}", {full_name})
