import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { Card } from "primereact/card";
import { Skeleton } from "primereact/skeleton";
import { Tag } from "primereact/tag";
import { Category } from "../model/models";

interface CategoryGridProps {
  onCategoryClick?: (categoryId: number) => void;
  className?: string;
  maxItems?: number;
}

export default function CategoryGrid({
  onCategoryClick,
  className = "",
  maxItems,
}: CategoryGridProps): JSX.Element {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/categories");
        let fetchedCategories = res.data?.data ?? [];
        if (maxItems) {
          fetchedCategories = fetchedCategories.slice(0, maxItems);
        }
        setCategories(fetchedCategories);
      } catch (err) {
        console.error(err);
        setError("Không tải được danh mục");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [maxItems]);

  const handleCategoryClick = (categoryId: number) => {
    if (onCategoryClick) {
      onCategoryClick(categoryId);
    } else {
      // Default behavior: navigate to category detail page
      navigate(`/category/${categoryId}`);
    }
  };

  if (loading) {
    return (
      <div className={className}>
        <h2 style={{ marginBottom: "1.5rem", fontSize: "1.5rem", fontWeight: 600 }}>
          Danh mục sản phẩm
        </h2>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} style={{ borderRadius: "12px" }}>
              <div className="flex flex-column gap-2">
                <Skeleton width="100%" height="120px" />
                <Skeleton width="80%" height="1.5rem" />
                <Skeleton width="60%" height="1rem" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <h2 style={{ marginBottom: "1.5rem", fontSize: "1.5rem", fontWeight: 600 }}>
          Danh mục sản phẩm
        </h2>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className={className}>
        <h2 style={{ marginBottom: "1.5rem", fontSize: "1.5rem", fontWeight: 600 }}>
          Danh mục sản phẩm
        </h2>
        <p className="text-600" style={{ padding: "2rem", textAlign: "center" }}>
          Chưa có danh mục nào
        </p>
      </div>
    );
  }

  return (
    <div className={className} style={{ marginBottom: "2rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: 600,
            color: "#1e293b",
            margin: 0,
          }}
        >
          Danh mục sản phẩm
        </h2>
        <Tag
          value={`${categories.length} danh mục`}
          severity="info"
          style={{ fontSize: "0.875rem" }}
        />
      </div>

      <div
        className="grid"
        style={{
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {categories.map((category) => (
          <Card
            key={category.id}
            style={{
              borderRadius: "12px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              border: "1px solid #e2e8f0",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
            }}
            onClick={() => handleCategoryClick(category.id)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.1)";
              e.currentTarget.style.borderColor = "#3b82f6";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.05)";
              e.currentTarget.style.borderColor = "#e2e8f0";
            }}
          >
            <div className="flex flex-column align-items-center gap-3" style={{ padding: "1rem" }}>
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2rem",
                  color: "white",
                  boxShadow: "0 4px 6px rgba(102, 126, 234, 0.3)",
                }}
              >
                <i className="pi pi-tag" style={{ fontSize: "2rem" }}></i>
              </div>
              <div className="flex flex-column align-items-center gap-1" style={{ width: "100%" }}>
                <h3
                  style={{
                    margin: 0,
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    color: "#1e293b",
                    textAlign: "center",
                  }}
                >
                  {category.name}
                </h3>
                {category.description && (
                  <p
                    className="text-600"
                    style={{
                      margin: 0,
                      fontSize: "0.875rem",
                      textAlign: "center",
                      lineHeight: "1.4",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {category.description}
                  </p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
