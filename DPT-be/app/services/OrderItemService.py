from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.models.model import Order, Product, OrderItem
from app.schemas.Order import (
    OrderCreate,
    OrderUpdate,
    OrderOut,
)
from app.schemas.OrerItem import(
    OrderItemCreate,
    OrderItemOut
)
from app.schemas.Customer import CustomerOut
from app.schemas.Employee import EmployeeOut
from app.schemas.Product import ProductOut
from app.services.EmployeeService import EmployeeService as empService
from app.services.customer import CustomerService as cusService 
from app.services.ProductService import ProductService as prodService
from app.utils.response import ResponseHandler

class OrderItemService:
    @staticmethod
    def getOrderItem(db:Session,order_id:int):
        list_items = db.query(OrderItem).filter(OrderItem.order_id == order_id).all()
        return [OrderItemService._to_out(item,prodService.get_product(db,item.product_id)) for item in list_items]

    @staticmethod
    def _to_out(items: OrderItem,product: ProductOut ):
        return OrderItemOut(
            id=items.id,
            order_id=items.order_id,
            product=product,
            quantity=items.quantity,
            unit_price = items.unit_price,
            create_at = items.created_at
            )