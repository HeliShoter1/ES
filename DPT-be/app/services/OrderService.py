from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.models.model import Order, Product, OrderItem
from app.schemas.Order import (
    OrderCreate,
    OrderUpdate,
    OrderOut,
)
from app.schemas.Customer import CustomerOut
from app.schemas.Employee import EmployeeOut
from app.services.EmployeeService import EmployeeService as empService
from app.services.customer import CustomerService as cusService 
from app.services.ProductService import ProductService as prodService
from app.utils.response import ResponseHandler


class OrderService:
    @staticmethod
    def create_order(db: Session, payload: OrderCreate) -> OrderOut:
        # Kiểm tra số lượng sản phẩm trước khi tạo order
        for item in payload.order_items:
            if not prodService.check_stock_availability(db, item.product_id, item.quantity):
                product = db.query(Product).filter(Product.id == item.product_id).first()
                product_name = product.name if product else f"Product ID {item.product_id}"
                raise ResponseHandler.not_found_error(
                    "Insufficient stock", 
                    f"Not enough stock for {product_name}. Required: {item.quantity}"
                )
        
        # Tạo order
        order = Order(
            customer_id=payload.customer_id,
            total_amount=payload.total_amount,
            status=payload.status.value if hasattr(payload.status, "value") else payload.status,
        )
        db.add(order)
        
        try:
            db.commit()
            db.refresh(order)
        except IntegrityError as exc:
            db.rollback()
            raise ResponseHandler.not_found_error("Order create failed", str(exc.orig) if hasattr(exc, "orig") else None)
        
        # Tạo order items và cập nhật số lượng sản phẩm
        try:
            for item in payload.order_items:
                # Tạo order item
                order_item = OrderItem(
                    order_id=order.id,
                    product_id=item.product_id,
                    quantity=item.quantity,
                    unit_price=item.unit_price,
                )
                db.add(order_item)
                
                # Cập nhật số lượng sản phẩm (giảm số lượng)
                if not prodService.update_stock_quantity(db, item.product_id, -item.quantity):
                    # Nếu cập nhật thất bại, rollback toàn bộ
                    db.rollback()
                    raise ResponseHandler.not_found_error(
                        "Stock update failed", 
                        f"Failed to update stock for product ID {item.product_id}"
                    )
            
            db.commit()
        except Exception as exc:
            db.rollback()
            # Xóa order đã tạo nếu có lỗi
            db.delete(order)
            db.commit()
            raise ResponseHandler.not_found_error("Order items create failed", str(exc))
        
        customer = cusService.getCustomer(db, payload.customer_id)
        return OrderService._to_out(order, customer)

    @staticmethod
    def get_order(db: Session, order_id: int) -> OrderOut:
        order = db.query(Order).filter(Order.id == order_id).first()
        customer = cusService.getCustomer(db,order.customer_id)
        if not order:
            ResponseHandler.not_found_error("Order", order_id)
        return OrderService._to_out(order,customer)

    @staticmethod
    def list_orders(db: Session, skip: int = 0, limit: int = 50) -> list[OrderOut]:
        items = (
            db.query(Order)
            .order_by(Order.id.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
        return [OrderService._to_out(o,cusService.getCustomer(db,o.customer_id)) for o in items]

    @staticmethod
    def list_orders_by_customer(db: Session, customer_id: int) -> list[OrderOut]:
        items = (
            db.query(Order)
            .filter(Order.customer_id == customer_id)
            .order_by(Order.id.desc())
            .all()
        )
        return [OrderService._to_out(o,cusService.getCustomer(db,o.customer_id)) for o in items]

    @staticmethod
    def update_order(db: Session, order_id: int, payload: OrderUpdate) -> OrderOut:
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            ResponseHandler.not_found_error("Order", order_id)

        data = payload.model_dump()
        for key in ["customer_id", "employee_id", "total_amount", "status"]:
            if data.get(key) is not None:
                value = data[key]
                if key == "status" and hasattr(value, "value"):
                    value = value.value
                setattr(order, key, value)
        try:
            db.commit()
        except IntegrityError as exc:
            db.rollback()
            raise ResponseHandler.not_found_error("Order update failed", str(exc.orig) if hasattr(exc, "orig") else None)
        db.refresh(order)
        customer = cusService.getCustomer(db,order.customer_id)
        return OrderService._to_out(order,customer)

    @staticmethod
    def delete_order(db: Session, order_id: int):
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            ResponseHandler.not_found_error("Order", order_id)
        db.delete(order)
        db.commit()
        return ResponseHandler.delete_success("Order", order_id, None)

    @staticmethod
    def _to_out(order: Order, customer: CustomerOut) -> OrderOut:
        return OrderOut(
            id=order.id,
            customer=customer,
            total_amount=order.total_amount,
            status=order.status,
            create_at=order.created_at,
            update_at=order.updated_at,
        )


