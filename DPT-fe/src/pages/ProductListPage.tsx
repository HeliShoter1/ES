import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api, useAuthApi } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import Slide from "../components/Slide";
import CategoryList from "../components/CategoryList";
import { Button } from "primereact/button";
import { DataView } from "primereact/dataview";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Category } from "./CategoryAdminPage";
import { Supplier } from "./ProductAdminPage";

export type Product = {
  id: number;
  name: string;
  description?: string;
  sell_price?: number;
  product_image?: ProductImage[];
  category : Category
  supplier: Supplier
  stock_quantity: number
};

interface ProductImage {
  id: number;
  image_path: string;
  product_id: number;
}

// Tự định nghĩa kiểu layout (không import DataViewLayoutType)
type LayoutType = "list" | "grid";

export default function ProductListPage(): JSX.Element {
  const { token } = useAuth();
  const authApi = useAuthApi();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const [addingId, setAddingId] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  const [sortKey, setSortKey] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<0 | 1 | -1 | null>(0);
  const [sortField, setSortField] = useState<string | undefined>(undefined);

  const sortOptions = [
    { label: "Price High to Low", value: "!sell_price" },
    { label: "Price Low to High", value: "sell_price" },
  ];

  // dùng LayoutType thay vì DataViewLayoutType
  const [layout, setLayout] = useState<LayoutType>("grid");

  // Redirect to category detail page if category query param exists
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      const categoryId = parseInt(categoryParam, 10);
      if (!isNaN(categoryId)) {
        navigate(`/category/${categoryId}`, { replace: true });
      }
    }
  }, [searchParams, navigate]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        // Always fetch all products (no filtering on this page)
        const res = await api.get("/products");
        setProducts(res.data?.data ?? []);
      } catch (err) {
        console.error(err);
        setError("Không tải được danh sách sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (search && search.trim() !== "") {
        params.name = search.trim();
        const res = await api.get("/products/products/search", { params });
        setProducts(res.data?.data ?? []);
      } else {
        // If no search term, reload all products
        const res = await api.get("/products");
        setProducts(res.data?.data ?? []);
      }
    } catch (err) {
      console.error(err);
      setError("Không tìm kiếm được sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (categoryId: number | null) => {
    // "Tất cả sản phẩm" - stay on this page
    if (categoryId === null) {
      setSelectedCategoryId(null);
      setSearchParams({});
      setSearch("");
    }
    // Category selection is now handled by CategoryList navigation
  };

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


  // itemTemplate: chú ý param itemLayout kiểu LayoutType
  const itemTemplate = (product: Product, itemLayout?: LayoutType) => {
    return (
      <div className="col-12 sm:col-6 md:col-4 lg:col-3 p-3" key={product.id}>
        <div
          className="p-card h-full flex flex-column"
          style={{
            height: "100%",
            borderRadius: 12,
            overflow: "hidden",
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
                <Link to={`/products/${product.id}`} style={{fontSize:"xx-large"}}>{product.name}</Link>
              </div>
  
              {product.description && (
                <div className="text-sm text-600 mb-1 line-clamp-2" style={{padding:'5px'}}>
                  {product.description}
                </div>
              )}
  
              <div className="text-sm text-600 mb-1" style={{padding: '5px'}}>
                <Link 
                  to={`/category/${product.category.id}`}
                  style={{ color: "#64748b", textDecoration: "underline" }}
                >
                  {product.category.name}
                </Link>
              </div>
  
              <div className="text-sm text-600 mb-2">
                <Link to={`supplier/${product.supplier.id}`} style={{padding: '5px'}}>
                  {product.supplier.name}
                </Link>
              </div>
            </div>
  
            {/* PRICE + BUTTON */}
            <div className="flex align-items-center justify-content-between mt-2">
              <div className="text-xl font-semibold">
                ${product.sell_price ?? 0}
              </div>
  
              <Button
                icon="pi pi-shopping-cart"
                className="p-button-rounded"
                onClick={() => handleAddToCart(product.id)}
                loading={addingId === product.id}
                disabled={addingId === product.id}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };
  

  const onSortChange = (e: DropdownChangeEvent) => {
    const value = e.value as string;
    if (!value) {
      setSortOrder(null);
      setSortField(undefined);
      setSortKey("");
      return;
    }
    if (value.indexOf("!") === 0) {
      setSortOrder(-1);
      setSortField(value.substring(1));
      setSortKey(value);
    } else {
      setSortOrder(1);
      setSortField(value);
      setSortKey(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const header = (
    <div className="flex flex-column sm:flex-row sm:align-items-center sm:justify-content-between gap-2" style={{display:"flex",justifyContent: "space-between"}}>
      <div className="flex gap-2 align-items-center" style={{padding:"0px"}}>
        <input
          type="text"
          value={search}
          onChange={(ev) => setSearch(ev.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tìm sản phẩm theo tên..."
          className="p-inputtext p-component"
          style={{height: "45px", }}
        />
        <Button label="Tìm" onClick={handleSearch} style={{marginLeft:"10px"}}/>
      </div>

      <div className="flex gap-2 align-items-center">
        <Dropdown
          options={sortOptions}
          value={sortKey}
          optionLabel="label"
          placeholder="Sort By Price"
          onChange={onSortChange}
          className="w-full sm:w-14rem"
        />
      </div>
    </div>
  );

  return (
    <div>
      <Slide />

      <div
        className="products-layout"
        style={{
          display: "flex",
          gap: "2rem",
          padding: "1.5rem",
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        {/* Category Sidebar */}
        <div
          className="category-sidebar"
          style={{
            width: "280px",
            flexShrink: 0,
          }}
        >
          <CategoryList
            onCategorySelect={handleCategorySelect}
            selectedCategoryId={selectedCategoryId}
            showAllOption={true}
            navigateToDetail={true}
          />
        </div>

        {/* Products Content */}
        <div className="products-content" style={{ flex: 1, minWidth: 0 }}>
          <div className="card">
            {error && (
              <div className="p-error mb-3" aria-live="polite">
                {error}
              </div>
            )}

            <DataView
              value={products}
              layout={layout}
              itemTemplate={(p) => itemTemplate(p, layout)}
              header={header}
              sortField={sortField}
              sortOrder={sortOrder}
              paginator rows={12}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
