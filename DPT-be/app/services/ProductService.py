
from typing import List, Optional
from app.schemas.Suplier import SupplierOut
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.models.model import Category, Product
from app.schemas.Category import CategoryOut
from app.schemas.Product import (
    ProductCreate,
    ProductUpdate,
    ProductOut,
)
from app.schemas.Image import ProductImageOut
from app.services.CategoryService import CategoryService as cateSer
from app.services.SuplierService import SuplierService as supSer
from app.services.ProductImageService import ProductImageService as ImageService
from app.utils.response import ResponseHandler
from sqlalchemy import or_, and_


class ProductService:
    @staticmethod
    def create_product(db: Session, payload: ProductCreate) -> ProductOut:
        existing = db.query(Product).filter(Product.name == payload.name).first()
        if existing:
            raise ResponseHandler.not_found_error("Product create failed", "name already exists")
        category = cateSer.get_category(db,payload.category_id)
        suplier = supSer.get_supplier(db,payload.supplier_id)
        product = Product(
            name=payload.name,
            category_id=payload.category_id,
            supplier_id=payload.supplier_id,
            description=payload.description,
            cost_price=payload.cost_price,
            sell_price=payload.sell_price,
            stock_quantity=payload.stock_quantity,
            warranty_months=payload.warranty_months,
        )
        db.add(product)
        try:
            db.commit()
        except IntegrityError as exc:
            db.rollback()
            raise ResponseHandler.not_found_error("Product create failed", str(exc.orig) if hasattr(exc, "orig") else None)
        db.refresh(product)
        return ProductOut(
            id=product.id,
            name=product.name,
            supplier=suplier,
            description=product.description,
            cost_price=product.cost_price,
            sell_price=product.sell_price,
            stock_quantity=product.stock_quantity,
            warranty_months=product.warranty_months,
            category=category,
            product_image=None,
            create_at=product.created_at,
            update_at=product.updated_at,
        )

    @staticmethod
    def getProductByCategory(db:Session, category_id : int):
        list_products = db.query(Product).filter(Product.category_id == category_id).all()
        out = [ProductService._to_out(p,cateSer.get_category(db,p.category_id),supSer.get_supplier(db,p.supplier_id) ) for p in list_products]
        return out


    @staticmethod
    def get_product(db: Session, product_id: int) -> ProductOut:
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            ResponseHandler.not_found_error("Product", product_id)
        category = cateSer.get_category(db, product.category_id)
        suplier = supSer.get_supplier(db, product.supplier_id)
        list_image = ImageService.get_image_by_product(db, product_id=product.id)
        return ProductService._to_out(
            product=product, category=category, suplier=suplier, image=list_image
        )

    @staticmethod
    def search_products(
        db: Session,
        category_id: Optional[int] = None,
        supplier_id: Optional[int] = None,
        name: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None
    ) -> list[ProductOut]:
        """
        Tìm kiếm sản phẩm với các bộ lọc tùy chọn
        """
        query = db.query(Product)
        
        # Áp dụng các bộ lọc nếu có
        filters = []
        
        if category_id is not None:
            filters.append(Product.category_id == category_id)
            
        if supplier_id is not None:
            filters.append(Product.supplier_id == supplier_id)
            
        if name is not None and name.strip() != "":
            filters.append(Product.name.ilike(f"%{name.strip()}%"))
            
        if min_price is not None:
            filters.append(Product.sell_price >= min_price)
            
        if max_price is not None:
            filters.append(Product.sell_price <= max_price)
        
        # Áp dụng tất cả filters với điều kiện AND
        if filters:
            query = query.filter(and_(*filters))
        
        # Thực thi query và chuyển đổi sang ProductOut
        products = query.order_by(Product.name).all()
        return [
            ProductService._to_out(
                p,
                cateSer.get_category(db, p.category_id),
                supSer.get_supplier(db, p.supplier_id),
                ImageService.get_image_by_product(db, p.id)
            )
            for p in products
        ]


    @staticmethod
    def list_products(db: Session, skip: int = 0, limit: int = 50) -> list[ProductOut]:
        items = (
            db.query(Product)
            .order_by(Product.id.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
        return [ProductService._to_out(p,cateSer.get_category(db,p.category_id),supSer.get_supplier(db,p.supplier_id),ImageService.get_image_by_product(db,p.id) ) for p in items]

    @staticmethod
    def list_product_by_supplier(db: Session,id_supplier: int, skip: int = 0, limit : int = 50):
        items= db.query(Product).filter(Product.supplier_id == id_supplier).offset(skip).limit(limit).all()
        return [ProductService._to_out(p,cateSer.get_category(db,p.category_id),supSer.get_supplier(db,p.supplier_id),ImageService.get_image_by_product(db,p.id) ) for p in items]
    

    @staticmethod
    def update_product(db: Session, product_id: int, payload: ProductUpdate) -> ProductOut:
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            ResponseHandler.not_found_error("Product", product_id)
        category = cateSer.get_category(db,product.category_id)
        suplier = supSer.get_supplier(db,product.supplier_id)
        data = payload.model_dump()
        for key in [
            "name",
            "category_id",
            "supplier_id",
            "description",
            "cost_price",
            "sell_price",
            "stock_quantity",
            "warranty_months",
        ]:
            if data.get(key) is not None:
                setattr(product, key, data[key])
        try:
            db.commit()
        except IntegrityError as exc:
            db.rollback()
            raise ResponseHandler.not_found_error("Product update failed", str(exc.orig) if hasattr(exc, "orig") else None)
        db.refresh(product)
        return ProductService._to_out(product,category,suplier)

    @staticmethod
    def delete_product(db: Session, product_id: int):
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            ResponseHandler.not_found_error("Product", product_id)
        db.delete(product)
        db.commit()
        return ResponseHandler.delete_success("Product", product_id, None)

    @staticmethod
    def update_stock_quantity(db: Session, product_id: int, quantity_change: int) -> bool:
        """
        Cập nhật số lượng tồn kho của sản phẩm
        quantity_change: số lượng thay đổi (có thể âm để giảm)
        """
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            return False
        
        new_quantity = product.stock_quantity + quantity_change
        if new_quantity < 0:
            return False  # Không đủ hàng
            
        product.stock_quantity = new_quantity
        try:
            db.commit()
            return True
        except IntegrityError:
            db.rollback()
            return False

    @staticmethod
    def check_stock_availability(db: Session, product_id: int, required_quantity: int) -> bool:
        """
        Kiểm tra xem có đủ hàng trong kho không
        """
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            return False
        return product.stock_quantity >= required_quantity

    @staticmethod
    def _to_out(product: Product, category: CategoryOut, suplier: SupplierOut,image : List[ProductImageOut] =None) -> ProductOut:
        return ProductOut(
            id=product.id,
            name=product.name,
            supplier=suplier,
            description=product.description,
            cost_price=product.cost_price,
            sell_price=product.sell_price,
            stock_quantity=product.stock_quantity,
            warranty_months=product.warranty_months,
            category=category,
            product_image=image,
            create_at=product.created_at,
            update_at=product.updated_at,
        )


