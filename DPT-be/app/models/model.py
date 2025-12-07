from itertools import product
from time import timezone
from turtle import update
from sqlalchemy import Boolean, Column, Integer, String, ForeignKey, Float, ARRAY, Enum
from sqlalchemy.dialects.postgresql import ENUM
from sqlalchemy.sql.expression import text, func
from sqlalchemy.sql.sqltypes import TIMESTAMP
from sqlalchemy.orm import relationship
from app.db.database import Base

order_status = ENUM('paid','successful', 'unpaid', 'pending', 'cancelled', name='order_status', create_type=False)
employee_role = ENUM('admin', 'staff', 'manager', name='employee_role', create_type=False)  # pyright: ignore[reportUndefinedVariable]
account_role = ENUM('user', 'admin', name='account_role', create_type=False)

class Category(Base):
    __tablename__= "categories"
    
    id = Column("id",Integer,primary_key = True, nullable = False, unique = False, autoincrement = True)
    name = Column('name',String, unique =True, nullable = False)
    description = Column('description',String)
    created_at = Column("created_at",TIMESTAMP(timezone = True),server_default = text("Now()"), nullable = False)
    updated_at = Column("updated_at",TIMESTAMP(timezone = True),server_default = text("Now()"), nullable = False)

    products = relationship("Product", back_populates="category", passive_deletes=True)

class ProductImage(Base):
    __tablename__ = "product_images"

    id = Column("id",Integer,primary_key = True, nullable = False, unique = False, autoincrement = True)
    product_id = Column("product_id",Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable = False)
    image_path = Column('image_path',String,nullable = False)
    created_at = Column("created_at",TIMESTAMP(timezone = True),server_default = text("Now()"), nullable = False)
    updated_at = Column("updated_at",TIMESTAMP(timezone = True),server_default = text("Now()"), nullable = False)    

    products = relationship("Product", back_populates="product_image", passive_deletes=True)

class Suplier(Base):
    __tablename__ = "suppliers"

    id = Column("id",Integer,primary_key = True, nullable = False, unique = False, autoincrement = True)
    name = Column("name" ,String, unique =True,nullable = False)
    address =  Column("address",String)
    phone = Column("phone",String, unique =True,nullable = False)
    email = Column("email",String,unique =True, nullable = False)
    created_at = Column("created_at",TIMESTAMP(timezone = True),server_default = text("Now()"), nullable = False)
    updated_at = Column("updated_at",TIMESTAMP(timezone = True),server_default = text("Now()"), nullable = False)

    products = relationship("Product", back_populates="suplier", passive_deletes=True)
    imp = relationship("Import", back_populates="suplier", passive_deletes=True)

class Product(Base):
    __tablename__ = "products"

    id = Column("id",Integer,primary_key = True, nullable = False, unique = False, autoincrement = True)
    name = Column('name',String, unique =True, nullable = False)
    category_id = Column("category_id",Integer, ForeignKey("categories.id", ondelete="CASCADE"), nullable = False)
    supplier_id = Column("supplier_id",Integer, ForeignKey("suppliers.id", ondelete="CASCADE"), nullable = False)
    description = Column("description", String)
    cost_price = Column("cost_price",Float, nullable = False)
    sell_price = Column("sell_price",Float, nullable = False)
    stock_quantity = Column("stock_quantity",Integer,nullable = False)
    warranty_months = Column("warranty_months",Integer,nullable = False)
    created_at = Column("created_at",TIMESTAMP(timezone = True),server_default = text("Now()"), nullable = False)
    updated_at = Column("updated_at",TIMESTAMP(timezone = True),server_default = text("Now()"), nullable = False)

    category = relationship("Category", back_populates="products", passive_deletes=True)
    product_image = relationship("ProductImage", back_populates= "products", passive_deletes=True)
    suplier = relationship("Suplier", back_populates= "products", passive_deletes=True)
    import_item = relationship("ImportItem", back_populates= "product", passive_deletes=True)
    order_item = relationship("OrderItem", back_populates= "products", passive_deletes=True)
    cart_items = relationship("Cart", back_populates="product")
    
class Customer(Base):
    __tablename__ = "customers"

    id = Column("id",Integer,primary_key = True, nullable = False, unique = False, autoincrement = True)
    full_name = Column("full_name",String,nullable = False)
    phone = Column("phone", String,unique =True, nullable = False)
    email = Column("email", String,unique = True, nullable = False)
    address = Column("address",String, nullable = False)
    password_hash = Column("password_hash",String, nullable = False)
    created_at = Column("created_at",TIMESTAMP(timezone = True),server_default = text("Now()"), nullable = False)
    updated_at = Column("updated_at",TIMESTAMP(timezone = True),server_default = text("Now()"), nullable = False)

    orders = relationship("Order",back_populates = "customer")
    account = relationship("Account", back_populates="customer", uselist=False, passive_deletes=True)
    cart = relationship("Cart", back_populates="customer", cascade="all, delete-orphan")
    
class Employees(Base):
    __tablename__ = "employees"

    id = Column("id",Integer,primary_key = True, nullable = False, unique = False, autoincrement = True)
    full_name = Column("full_name",String,nullable = False)
    phone = Column("phone", String,unique =True, nullable = False)
    email = Column("email", String,unique = True, nullable = False)
    address = Column("address",String, nullable = False)
    role =  Column("role",employee_role, nullable = False, default = "staff")
    is_active = Column("is_active", Boolean, nullable = False, server_default=text("true"))
    created_at = Column("created_at",TIMESTAMP(timezone = True),server_default = text("Now()"), nullable = False)
    updated_at = Column("updated_at",TIMESTAMP(timezone = True),server_default = text("Now()"), nullable = False)

    imp = relationship("Import", back_populates="employee", passive_deletes=True)


class Order(Base):
    __tablename__ = "orders"
    
    id = Column("id",Integer,primary_key = True, nullable = False, unique = False, autoincrement = True)
    customer_id = Column("customer_id", Integer, ForeignKey("customers.id", ondelete="CASCADE"), nullable = False)
    total_amount = Column("total_amount", Integer)
    status = Column("status",order_status,nullable = False, default = "pending")
    created_at = Column("created_at",TIMESTAMP(timezone = True),server_default = text("Now()"), nullable = False)
    updated_at = Column("updated_at",TIMESTAMP(timezone = True),server_default = text("Now()"), nullable = False)

    order_item = relationship("OrderItem",back_populates = "order", passive_deletes=True)
    customer = relationship('Customer', back_populates="orders", passive_deletes=True)


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column("id",Integer,primary_key = True, nullable = False, unique = False, autoincrement = True)
    order_id = Column('order_id',Integer, ForeignKey("orders.id", ondelete="CASCADE"))
    product_id= Column("product_id",Integer, ForeignKey("products.id", ondelete="CASCADE"))
    quantity = Column("quantity", Integer)
    unit_price = Column("unit_price",Integer)
    created_at = Column("created_at",TIMESTAMP(timezone = True),server_default = text("Now()"), nullable = False)

    order = relationship("Order", back_populates="order_item", passive_deletes=True)
    products = relationship("Product", back_populates="order_item", passive_deletes=True)

class Import(Base):
    __tablename__ =  "imports"

    id = Column("id",Integer,primary_key = True, nullable = False, unique = False, autoincrement = True)
    supplier_id = Column('supplier_id',Integer, ForeignKey("suppliers.id", ondelete="CASCADE"))
    employee_id = Column('employee_id',Integer, ForeignKey("employees.id", ondelete="CASCADE"))
    import_date = Column("import_date",TIMESTAMP(timezone = True),server_default = text("Now()"))
    total_cost = Column('total_cost',Integer)
    created_at = Column("created_at",TIMESTAMP(timezone = True),server_default = text("Now()"), nullable = False)
    updated_at = Column("updated_at",TIMESTAMP(timezone = True),server_default = text("Now()"), nullable = False)

    import_item = relationship("ImportItem", back_populates= "imp", passive_deletes=True)
    employee = relationship("Employees", back_populates= "imp", passive_deletes=True)
    suplier = relationship("Suplier", back_populates= "imp", passive_deletes=True)


class ImportItem(Base):
    __tablename__ =  "import_items"

    id = Column("id",Integer,primary_key = True, nullable = False, unique = False, autoincrement = True)
    import_id = Column("import_id",Integer, ForeignKey("imports.id", ondelete="CASCADE"))
    product_id =Column("product_id",Integer, ForeignKey("products.id", ondelete="CASCADE"))
    quantity = Column("quantity", Integer, nullable = False)
    unit_cost = Column("unit_cost",Integer, nullable = False)
    created_at = Column("created_at",TIMESTAMP(timezone = True),server_default = text("Now()"), nullable = False)

    product = relationship("Product", back_populates="import_item", passive_deletes=True)
    imp = relationship("Import", back_populates="import_item", passive_deletes=True)
    

class Account(Base):
    __tablename__ = "accounts"

    id = Column("id", Integer, primary_key=True, autoincrement=True, nullable=False)
    customer_id = Column("customer_id", Integer, ForeignKey("customers.id", ondelete="CASCADE"), nullable=False, unique=True)
    role = Column("role", account_role, nullable=False, server_default=text("'user'"))

    customer = relationship("Customer", back_populates="account")

class Cart(Base):
    __tablename__ = "cart"

    id_customer = Column(Integer, ForeignKey("customers.id", ondelete="CASCADE"), primary_key=True)
    id_product  = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), primary_key=True)
    number = Column(Integer, nullable=False, default=1)

    customer = relationship("Customer", back_populates="cart")
    product = relationship("Product", back_populates="cart_items")