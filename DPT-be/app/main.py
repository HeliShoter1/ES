from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.auth import router as auth_router
from app.routers.CustomerRouter import router as customer_router
from app.routers.EmployeeRouter import router as employee_router
from app.routers.SuplierRouter import router as suplier_router
from app.routers.CategoryRouter import router as category_router
from app.routers.ImportItemRouter import router as ii_router
from app.routers.ImportRouter import router as import_router
from app.routers.OrderRouter import router as order_router
from app.routers.ProductImageRouter import router as image_router
from app.routers.ProductRouter import router as product_router
from app.routers.SuplierRouter import router as suplier_router
from app.routers.CartRouter import router as cart_router
from app.routers.OrderItemRouter import router as item_router

app = FastAPI(
    title="E-commerce API",
    version="1.0.0",
    swagger_ui_parameters={
        "syntaxHighlight.theme": "monokai",
        "layout": "BaseLayout",
        "filter": True,
        "tryItOutEnabled": True,
        "onComplete": "Ok"
    },
)

# CORS cho frontend React (Vite) chạy ở localhost:5173
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"Hello": "World"}

app.include_router(customer_router)
app.include_router(auth_router)
app.include_router(employee_router)
app.include_router(category_router)
app.include_router(ii_router)
app.include_router(import_router)
app.include_router(order_router)
app.include_router(image_router)
app.include_router(product_router)
app.include_router(suplier_router)
app.include_router(cart_router)
app.include_router(item_router)


