import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, useAuthApi } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import Slide from "../components/Slide";
import { Card } from "primereact/card";
import { DataView } from "primereact/dataview";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import { Tag } from "primereact/tag";
import { Divider } from "primereact/divider";
import { Category } from "../model/models";
import { Product } from "./ProductListPage";

export default function CategoryDetailPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const authApi = useAuthApi();
  const navigate = useNavigate();

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchCategoryDetail = async () => {
      if (!id) {
        setError("ID danh mục không hợp lệ");
        setLoading(false);
        return;
      }

      const categoryId = parseInt(id, 10);
      if (isNaN(categoryId)) {
        setError("ID danh mục không hợp lệ");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Lấy thông tin category
        const categoryRes = await api.get(`/categories/${categoryId}`);
        console.log("Category response:", categoryRes.data);
        setCategory(categoryRes.data?.data ?? null);

        // Lấy danh sách sản phẩm theo category
        const productsRes = await api.get("/products/products/search", {
          params: { category_id: categoryId },
        });
        console.log("Products response:", productsRes.data);
        const productsData = productsRes.data?.data ?? [];
        console.log("Products array:", productsData);
        setProducts(productsData);
      } catch (err: any) {
        console.error("Error fetching category detail:", err);
        console.error("Error response:", err.response);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Không tải được thông tin danh mục và sản phẩm"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryDetail();
  }, [id]);

  const handleAddToCart = async (productId: number) => {
    if (!token) {
      navigate("/login");
      return;
    }
    setAddingId(productId);
    setError(null);
    try {
      await authApi.put("/carts", {
        customer: token.customer_id,
        product_id: productId,
        number: 1,
      });
    } catch (err) {
      console.error(err);
      setError("Không thêm được sản phẩm vào giỏ");
    } finally {
      setAddingId(null);
    }
  };

  // Template để hiển thị từng sản phẩm
  const itemTemplate = (product: Product) => {
    return (
      <div className="col-12 sm:col-6 md:col-4 lg:col-3 p-3" key={product.id}>
        <div
          className="p-card h-full flex flex-column"
          style={{
            height: "100%",
            borderRadius: 12,
            overflow: "hidden",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
          }}
        >
          {/* IMAGE */}
          <div
            style={{
              width: "100%",
              height: 180,
              overflow: "hidden",
            }}
          >
            <img
              src={
                product.product_image && product.product_image[0]
                  ? `http://localhost:8000/product-images/${product.product_image[0].image_path}`
                  : "/images/image.png"
              }
              alt={product.name}
              onError={(e) => (e.currentTarget.src = "/images/image.png")}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>

          {/* CONTENT */}
          <div className="p-card-body flex flex-column justify-content-between flex-1">
            <div>
              <div className="text-lg font-bold mb-1">
                <Link
                  to={`/products/${product.id}`}
                  style={{ fontSize: "1.1rem", color: "#2563eb" }}
                >
                  {product.name}
                </Link>
              </div>

              {product.description && (
                <div
                  className="text-sm text-600 mb-1 line-clamp-2"
                  style={{ padding: "5px" }}
                >
                  {product.description}
                </div>
              )}

              {product.supplier && (
                <div className="text-sm text-600 mb-1" style={{ padding: "5px" }}>
                  <Link
                    to={`/supplier/${product.supplier.id}`}
                    style={{ color: "#64748b" }}
                  >
                    {product.supplier.name}
                  </Link>
                </div>
              )}

              {product.stock_quantity !== undefined && (
                <div className="mb-2" style={{ padding: "5px" }}>
                  {product.stock_quantity > 0 ? (
                    <Tag
                      value="Còn hàng"
                      severity="success"
                      style={{ fontSize: "0.75rem" }}
                    />
                  ) : (
                    <Tag
                      value="Hết hàng"
                      severity="danger"
                      style={{ fontSize: "0.75rem" }}
                    />
                  )}
                </div>
              )}
            </div>

            {/* PRICE + BUTTON */}
            <div className="flex align-items-center justify-content-between mt-2">
              <div className="text-xl font-semibold" style={{ color: "#ef4444" }}>
                ${product.sell_price ?? 0}
              </div>

              <Button
                icon="pi pi-shopping-cart"
                className="p-button-rounded"
                onClick={() => handleAddToCart(product.id)}
                loading={addingId === product.id}
                disabled={addingId === product.id || product.stock_quantity === 0}
                tooltip="Thêm vào giỏ hàng"
                tooltipOptions={{ position: "top" }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
          flexDirection: "column",
        }}
      >
        <ProgressSpinner />
        <p style={{ marginTop: "1rem", color: "#64748b" }}>
          Đang tải thông tin danh mục...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <Card>
          <div className="flex flex-column align-items-center gap-3">
            <i
              className="pi pi-exclamation-triangle"
              style={{ fontSize: "3rem", color: "#ef4444" }}
            ></i>
            <h2 style={{ color: "#ef4444" }}>Lỗi</h2>
            <p style={{ color: "#64748b" }}>{error}</p>
            <div className="flex gap-2">
              <Button
                label="Quay lại"
                icon="pi pi-arrow-left"
                className="p-button-outlined"
                onClick={() => navigate(-1)}
              />
              <Button
                label="Về trang chủ"
                icon="pi pi-home"
                onClick={() => navigate("/")}
              />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <Slide />
      <div style={{ padding: "1.5rem", maxWidth: "1400px", margin: "0 auto" }}>
        {/* Thông tin Category */}
        <Card
          style={{
            marginBottom: "2rem",
            borderRadius: "12px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
        <div className="flex align-items-center justify-content-between">
          <div className="flex align-items-center gap-3">
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2rem",
                color: "white",
              }}
            >
              <i className="pi pi-tag"></i>
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: 700 }}>
                {category?.name || "Danh mục"}
              </h1>
              {category?.description && (
                <p style={{ margin: "0.5rem 0 0 0", color: "#64748b" }}>
                  {category.description}
                </p>
              )}
            </div>
          </div>
          <Button
            label="Quay lại"
            icon="pi pi-arrow-left"
            className="p-button-outlined"
            onClick={() => navigate(-1)}
          />
        </div>
      </Card>

      <Divider>
        <div className="inline-flex align-items-center gap-2">
          <i className="pi pi-box"></i>
          <span className="font-bold text-xl">
            Sản phẩm trong danh mục
            {products.length > 0 && (
              <Tag
                value={products.length}
                severity="info"
                style={{ marginLeft: "0.5rem" }}
              />
            )}
          </span>
        </div>
      </Divider>

      {/* Danh sách sản phẩm */}
      {products.length > 0 ? (
        <div className="card" style={{ marginTop: "1.5rem" }}>
          <DataView
            value={products}
            layout="grid"
            itemTemplate={itemTemplate}
            paginator
            rows={12}
            emptyMessage="Không có sản phẩm nào trong danh mục này"
          />
        </div>
      ) : (
        <Card style={{ marginTop: "1.5rem", textAlign: "center", padding: "3rem" }}>
          <div className="flex flex-column align-items-center gap-3">
            <i
              className="pi pi-inbox"
              style={{ fontSize: "4rem", color: "#cbd5e1" }}
            ></i>
            <h3 style={{ color: "#1e293b" }}>Chưa có sản phẩm</h3>
            <p style={{ color: "#64748b" }}>
              Danh mục này hiện chưa có sản phẩm nào
            </p>
            <div className="flex gap-2">
              <Button
                label="Xem tất cả sản phẩm"
                icon="pi pi-th-large"
                onClick={() => navigate("/")}
              />
              <Button
                label="Quay lại"
                icon="pi pi-arrow-left"
                className="p-button-outlined"
                onClick={() => navigate(-1)}
              />
            </div>
          </div>
        </Card>
      )}
      </div>
    </div>
  );
}
