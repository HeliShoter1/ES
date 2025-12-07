import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { api, API_BASE_URL, useAuthApi } from "../api/client";
import { Button } from "primereact/button";
import { useAuth } from "../auth/AuthContext";    
import { useNavigate } from "react-router-dom";


interface ProductImage {
  id: number;
  image_path: string;
  product_id: number;
}

type Product = {
  id: number;
  name: string;
  description?: string;
  sell_price?: number;
  stock_quantity?: number;
  warranty_months?: number;
  category?: { name: string };
  supplier?: { name: string };
  product_image?: ProductImage[];
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const authApi = useAuthApi();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const navigate = useNavigate();
  const intervalRef = useRef<number | null>(null);



  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data?.data ?? res.data);
      } catch (err) {
        console.error(err);
        setError("Không tải được chi tiết sản phẩm");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id]);

  const images = product?.product_image ?? [];

  // Auto-slide images every 5 seconds
  useEffect(() => {
    if (images.length <= 1) return;

    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set up new interval
    intervalRef.current = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);

    // Cleanup on unmount or when images change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [images.length, product?.id]);

  // Reset image index when product changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [product?.id]);

  // Helper function to restart auto-slide
  const restartAutoSlide = () => {
    if (images.length <= 1) return;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);
  };

  const handlePreviousImage = () => {
    if (images.length === 0) return;
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
    restartAutoSlide();
  };

  const handleNextImage = () => {
    if (images.length === 0) return;
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    restartAutoSlide();
  };

  const handleImageSelect = (index: number) => {
    setCurrentImageIndex(index);
    restartAutoSlide();
  };

  const handleAddToCart = async (productId: number) => {
    if (!token) return;
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

  if (loading) return <p>Đang tải...</p>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!product) return <p>Không tìm thấy sản phẩm.</p>;

  return (
    <div className="grid grid-2">
      <div>
        {images.length > 0 ? (
          <div className="card" style={{ position: "relative" }}>
            {/* Main Image */}
            <div style={{ position: "relative", width: "100%" }}>
              <img
                src={`http://localhost:8000/product-images/${images[currentImageIndex]?.image_path}`}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/images/image.png";
                }}
                alt={product.name}
                style={{ 
                  width: "100%", 
                  borderRadius: "0.75rem", 
                  objectFit: "cover",
                  display: "block",
                  transition: "opacity 0.3s ease"
                }}
              />
              
              {/* Navigation Buttons */}
              {images.length > 1 && (
                <>
                  <Button
                    icon="pi pi-chevron-left"
                    className="p-button-rounded p-button-text"
                    onClick={handlePreviousImage}
                    style={{
                      position: "absolute",
                      left: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      backgroundColor: "rgba(0, 0, 0, 0.5)",
                      color: "white",
                      border: "none",
                      zIndex: 10,
                    }}
                    tooltip="Ảnh trước"
                    tooltipOptions={{ position: "top" }}
                  />
                  <Button
                    icon="pi pi-chevron-right"
                    className="p-button-rounded p-button-text"
                    onClick={handleNextImage}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      backgroundColor: "rgba(0, 0, 0, 0.5)",
                      color: "white",
                      border: "none",
                      zIndex: 10,
                    }}
                    tooltip="Ảnh sau"
                    tooltipOptions={{ position: "top" }}
                  />
                </>
              )}
            </div>

            {/* Thumbnail Navigation */}
            {images.length > 1 && (
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  marginTop: "1rem",
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => handleImageSelect(index)}
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "8px",
                      overflow: "hidden",
                      border:
                        currentImageIndex === index
                          ? "3px solid #2563eb"
                          : "2px solid transparent",
                      cursor: "pointer",
                      padding: 0,
                      background: "none",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.1)";
                      e.currentTarget.style.borderColor = "#2563eb";
                    }}
                    onMouseLeave={(e) => {
                      if (currentImageIndex !== index) {
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.borderColor = "transparent";
                      }
                    }}
                  >
                    <img
                      src={`http://localhost:8000/product-images/${image.image_path}`}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/images/image.png";
                      }}
                      alt={`${product.name} - ${index + 1}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Image Counter */}
            {images.length > 1 && (
              <div
                style={{
                  textAlign: "center",
                  marginTop: "0.5rem",
                  color: "#64748b",
                  fontSize: "0.875rem",
                }}
              >
                {currentImageIndex + 1} / {images.length}
              </div>
            )}
          </div>
        ) : (
          <div className="card" style={{width: "75%",marginLeft:"15%"}}>
            <img src="/images/image.png" alt="" style={{width :"100%"}}/>
          </div>
        )}
      </div>
      <div style={{margin:"100px"}}>
        <h1 style={{fontSize: "-webkit-xxx-large"}}>{product.name}</h1>
        {product.category && (
          <div className="muted" style={{fontSize:"x-large"}}>Danh mục: {product.category.name}</div>
        )}
        {product.supplier && (
          <div className="muted" style={{fontSize:"x-large"}}>Nhà cung cấp: {product.supplier.name}</div>
        )}
        {typeof product.sell_price === "number" && (
          <p className="price" style={{ marginTop: "1rem",fontSize:"x-large"}}>
            {product.sell_price.toLocaleString("vi-VN", {
              style: "currency",
              currency: "VND",
            })}
          </p>
        )}
        {product.description && (
          <p style={{ marginTop: "1rem", fontSize:"2rem" }}>{product.description}</p>
        )}
        <div className="muted" style={{ marginTop: "0.75rem" }}>
          Tồn kho: {product.stock_quantity ?? "Không rõ"}
        </div>
        {typeof product.warranty_months === "number" && (
          <div className="muted">Bảo hành: {product.warranty_months} tháng</div>
        )}
        <Button 
          label="Đặt hàng" 
          style={{marginTop:"20px"}} 
          severity="success" 
          onClick={() => {
            if (token && product) {
              handleAddToCart(product.id);
            } else {
              navigate("/login");
            }
          }}
        />
      </div>
    </div>
  );
}


