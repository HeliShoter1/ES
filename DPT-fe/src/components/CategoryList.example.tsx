/**
 * Ví dụ sử dụng CategoryList và CategoryGrid components
 * 
 * CategoryList: Component hiển thị danh sách categories dạng sidebar/filter
 * CategoryGrid: Component hiển thị categories dạng grid/cards
 */

import React, { useState } from "react";
import CategoryList from "./CategoryList";
import CategoryGrid from "./CategoryGrid";

// Ví dụ 1: Sử dụng CategoryList làm filter sidebar
export function ExampleWithCategoryFilter() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
    // Gọi API để lọc sản phẩm theo category
    console.log("Selected category:", categoryId);
    // fetchProducts(categoryId);
  };

  return (
    <div style={{ display: "flex", gap: "2rem" }}>
      {/* Sidebar với CategoryList */}
      <div style={{ width: "250px" }}>
        <CategoryList
          onCategorySelect={handleCategorySelect}
          selectedCategoryId={selectedCategoryId}
          showAllOption={true}
        />
      </div>

      {/* Nội dung chính */}
      <div style={{ flex: 1 }}>
        <h1>Sản phẩm</h1>
        {/* Render products dựa trên selectedCategoryId */}
      </div>
    </div>
  );
}

// Ví dụ 2: Sử dụng CategoryGrid trên trang chủ
export function ExampleWithCategoryGrid() {
  const handleCategoryClick = (categoryId: number) => {
    // Navigate đến trang sản phẩm với filter category
    console.log("Category clicked:", categoryId);
    // navigate(`/products?category=${categoryId}`);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <CategoryGrid
        onCategoryClick={handleCategoryClick}
        maxItems={6} // Chỉ hiển thị 6 categories đầu tiên
      />
    </div>
  );
}

// Ví dụ 3: Tích hợp vào ProductListPage
export function ExampleProductListPage() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  return (
    <div style={{ display: "flex", gap: "2rem", padding: "2rem" }}>
      <div style={{ width: "280px", flexShrink: 0 }}>
        <CategoryList
          onCategorySelect={setSelectedCategoryId}
          selectedCategoryId={selectedCategoryId}
        />
      </div>
      <div style={{ flex: 1 }}>
        {/* ProductList component */}
        {/* Filter products based on selectedCategoryId */}
      </div>
    </div>
  );
}
