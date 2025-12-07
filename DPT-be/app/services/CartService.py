from typing import List   
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.models.model import Cart as cart_model
from app.schemas.Customer import CustomerOut
from app.schemas.Product import ProductOut
from app.schemas.Cart import CartOut, CartProduct, CartUpdate
from app.utils.response import ResponseHandler
from app.services.ProductService import ProductService

class CartService:

    @staticmethod
    def getCartByCustomerID(db: Session, cus_id: int):
        cart = db.query(cart_model).filter(cart_model.id_customer == cus_id).all()

        list_product = [CartService.tranferCartItem(ProductService.get_product(db,i.id_product), i.number) for i in cart]

        return CartService.get_out(cus_id, list_product)

    @staticmethod
    def UpdateCart(db:Session, cart_update: CartUpdate):
        cart = db.query(cart_model).filter(
            cart_model.id_customer == cart_update.customer 
            , cart_model.id_product == cart_update.product_id ).first()
        if not cart:
            cart = cart_model(
                id_customer = cart_update.customer,
                id_product = cart_update.product_id,
                number = cart_update.number)
            db.add(cart)
            try: 
                db.commit()
            except IntegrityError as exc:
                db.rollback()
                raise ResponseHandler.not_found_error("Cart add false", str(exc.orig) if hasattr(exc, "orig") else None)
            return {"message": "Cart item added successfully"}
        else:
            # Chỉ cập nhật số lượng, tránh gán nhầm các field quan hệ như 'customer'
            cart.number = cart_update.number
            try:
                db.commit()
                db.refresh(cart)
            except IntegrityError as exc:
                db.rollback()
                raise ResponseHandler.not_found_error(
                    "Cart update failed",
                    str(exc.orig) if hasattr(exc, "orig") else None
                )
            return {"message": "Cart item updated successfully"}

    @staticmethod
    def DeleteCart(db:Session, cus_id : int, product_id : int):
        cart_item = db.query(cart_model).filter(
            cart_model.id_customer == cus_id 
            , cart_model.id_product == product_id).first()
        if not cart_item:
            ResponseHandler.not_found_error("cart", product_id)
        db.delete(cart_item)
        return ResponseHandler.delete_success("Cart", product_id, None)

                

    @staticmethod
    def tranferCartItem(product: ProductOut, number: int):
        return CartProduct(product = product, number = number)

    @staticmethod
    def get_out(customer_id: int , list_product : List[CartProduct]):
        return CartOut(customer= customer_id, products = list_product)
        