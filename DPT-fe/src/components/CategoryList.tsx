import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { Card } from "primereact/card";
import { Skeleton } from "primereact/skeleton";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";
import { Category } from "../model/models";

interface CategoryListProps {
  onCategorySelect?: (categoryId: number | null) => void;
  selectedCategoryId?: number | null;
  showAllOption?: boolean;
  className?: string;
  navigateToDetail?: boolean; // New prop to control navigation behavior
}

export default function CategoryList({
  onCategorySelect,
  selectedCategoryId = null,
  showAllOption = true,
  className = "",
  navigateToDetail = true, // Default to navigating to detail page
}: CategoryListProps): JSX.Element {
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
        setCategories(res.data?.data ?? []);
      } catch (err) {
        console.error(err);
        setError("Không tải được danh mục");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryId: number | null) => {
    if (categoryId === null) {
      // "Tất cả sản phẩm" - always use callback if provided
      if (onCategorySelect) {
        onCategorySelect(null);
      } else {
        navigate("/");
      }
      return;
    }

    // If navigateToDetail is true, navigate to detail page
    if (navigateToDetail) {
      navigate(`/category/${categoryId}`);
    } else if (onCategorySelect) {
      // Otherwise use callback for filtering
      onCategorySelect(categoryId);
    }
  };

  if (loading) {
    return (
      <Card className={className} style={{ marginBottom: "1rem" }}>
        <div className="flex flex-column gap-2">
          <h3 style={{ marginTop: 0 }}>Danh mục sản phẩm</h3>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex align-items-center gap-2">
              <Skeleton width="100%" height="2.5rem" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className} style={{ marginBottom: "1rem" }}>
        <div className="flex flex-column gap-2">
          <h3 style={{ marginTop: 0 }}>Danh mục sản phẩm</h3>
          <p className="text-red-500">{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={className}
      style={{
        marginBottom: "1rem",
        borderRadius: "12px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div className="flex flex-column gap-2">
        <h3
          style={{
            marginTop: 0,
            marginBottom: "1rem",
            fontSize: "1.25rem",
            fontWeight: 600,
            color: "#1e293b",
          }}
        >
          Danh mục sản phẩm
        </h3>

        {showAllOption && (
          <Button
            label="Tất cả sản phẩm"
            icon="pi pi-th-large"
            className={`p-button-text p-button-plain ${
              selectedCategoryId === null ? "p-button-secondary" : ""
            }`}
            onClick={() => handleCategoryClick(null)}
            style={{
              justifyContent: "flex-start",
              padding: "0.75rem 1rem",
              borderRadius: "8px",
              backgroundColor:
                selectedCategoryId === null
                  ? "rgba(59, 130, 246, 0.1)"
                  : "transparent",
              color: selectedCategoryId === null ? "#2563eb" : "#64748b",
              fontWeight: selectedCategoryId === null ? 600 : 400,
              border:
                selectedCategoryId === null
                  ? "1px solid rgba(59, 130, 246, 0.3)"
                  : "1px solid transparent",
            }}
          />
        )}

        {categories.length === 0 ? (
          <p className="text-600" style={{ padding: "1rem", textAlign: "center" }}>
            Chưa có danh mục nào
          </p>
        ) : (
          <div className="flex flex-column gap-2">
            {categories.map((category) => {
              const isSelected = selectedCategoryId === category.id;
              return (
                <Button
                  key={category.id}
                  label={category.name}
                  icon="pi pi-tag"
                  className={`p-button-text p-button-plain ${
                    isSelected ? "p-button-secondary" : ""
                  }`}
                  onClick={() => handleCategoryClick(category.id)}
                  style={{
                    justifyContent: "flex-start",
                    padding: "0.75rem 1rem",
                    borderRadius: "8px",
                    backgroundColor: isSelected
                      ? "rgba(59, 130, 246, 0.1)"
                      : "transparent",
                    color: isSelected ? "#2563eb" : "#64748b",
                    fontWeight: isSelected ? 600 : 400,
                    border: isSelected
                      ? "1px solid rgba(59, 130, 246, 0.3)"
                      : "1px solid transparent",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = "rgba(59, 130, 246, 0.05)";
                      e.currentTarget.style.color = "#475569";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "#64748b";
                    }
                  }}
                />
              );
            })}
          </div>
        )}

        {categories.length > 0 && (
          <div
            style={{
              marginTop: "0.5rem",
              paddingTop: "1rem",
              borderTop: "1px solid #e2e8f0",
            }}
          >
            <Tag
              value={`${categories.length} danh mục`}
              severity="info"
              style={{ fontSize: "0.875rem" }}
            />
          </div>
        )}
      </div>
    </Card>
  );
}
