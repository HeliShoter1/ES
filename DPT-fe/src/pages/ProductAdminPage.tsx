import { FormEvent, useEffect, useState } from "react";
import { useAuthApi } from "../api/client";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FileUpload } from "primereact/fileupload";

export type Category = { id: number; name: string; };
export type Supplier = { id: number; name: string; };
type Product = {
  id: number;
  name: string;
  description?: string;
  category: Category;
  supplier: Supplier;
  cost_price: number;
  sell_price: number;
  stock_quantity: number;
  warranty_months: number;
};

export default function ProductAdminPage() {
  const authApi = useAuthApi();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null); // <-- new

  const [form, setForm] = useState({
    name: "",
    description: "",
    category_id: 0,
    supplier_id: 0,
    cost_price: 0,
    sell_price: 0,
    stock_quantity: 0,
    warranty_months: 0,
  });

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [prodRes, cateRes, supRes] = await Promise.all([
        authApi.get("/products"),
        authApi.get("/categories"),
        authApi.get("/suplier"),
      ]);
      setProducts(prodRes.data?.data ?? []);
      setCategories(cateRes.data?.data ?? []);
      setSuppliers(supRes.data?.data ?? []);
    } catch (err) {
      console.error(err);
      setError("Không tải được dữ liệu sản phẩm/danh mục/nhà cung cấp");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAll();
  }, []);

  const resetForm = () => {
    setEditing(null);
    setForm({
      name: "",
      description: "",
      category_id: 0,
      supplier_id: 0,
      cost_price: 0,
      sell_price: 0,
      stock_quantity: 0,
      warranty_months: 0,
    });
    setSelectedFile(null); // clear file too
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name.endsWith("_id") ||
        name.includes("price") ||
        name.includes("quantity") ||
        name.includes("months")
          ? Number(value)
          : value,
    }));
  };

  // ----- UPDATED handleSubmit: send multipart/form-data -----
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      // payload as JSON string (server expects Form payload + file)
      formData.append("payload", JSON.stringify(form));
      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      if (editing) {
        // For update: if your backend supports multipart PUT, use it.
        // Some backends require POST to /products/{id}/upload-image - adjust if needed.
        await authApi.put(`/products/${editing.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await authApi.post("/products", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      resetForm();
      await loadAll();
    } catch (err) {
      console.error(err);
      setError("Không lưu được sản phẩm");
    }
  };
  // -----------------------------------------------------------

  const handleEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description ?? "",
      category_id: p.category.id,
      supplier_id: p.supplier.id,
      cost_price: p.cost_price,
      sell_price: p.sell_price,
      stock_quantity: p.stock_quantity,
      warranty_months: p.warranty_months,
    });
    setSelectedFile(null);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Xoá sản phẩm này?")) return;
    try {
      await authApi.delete(`/products/${id}`);
      await loadAll();
    } catch (err) {
      console.error(err);
      setError("Không xoá được sản phẩm");
    }
  };

  const categoryBody = (row: Product) => row.category?.name ?? "";
  const supplierBody = (row: Product) => row.supplier?.name ?? "";
  const priceBody = (row: Product) =>
    row.sell_price.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  const quantityBody = (row: Product) => row.stock_quantity;

  const actionBody = (row: Product) => (
    <div className="row-actions">
      <button
        className="btn btn-sm btn-outline"
        type="button"
        onClick={() => handleEdit(row)}
      >
        Sửa
      </button>
      <button
        className="btn btn-sm btn-danger"
        type="button"
        onClick={() => handleDelete(row.id)}
      >
        Xoá
      </button>
    </div>
  );

  // ----- FileUpload handlers -----
  const onFileSelect = (e: any) => {
    // e.files is an array of File objects
    if (e.files && e.files.length > 0) {
      setSelectedFile(e.files[0]);
    }
  };

  const onFileRemove = (e: any) => {
    setSelectedFile(null);
  };
  // --------------------------------

  return (
    <div className="grid grid-2">
      <div>
        <h1>Quản lý sản phẩm</h1>
        {loading && <p>Đang tải...</p>}
        {error && <div className="alert alert-error">{error}</div>}
        <div className="card" style={{ marginTop: "1rem" }}>
          <DataTable
            value={products}
            removableSort
            tableStyle={{ width: "100%" }}
          >
            <Column field="name" header="Tên sản phẩm" sortable />
            <Column
              field="category"
              header="Danh mục"
              body={categoryBody}
              sortable
            />
            <Column
              field="supplier"
              header="Nhà cung cấp"
              body={supplierBody}
              sortable
            />
            <Column
              field="sell_price"
              header="Giá bán"
              body={priceBody}
              sortable
            />
            <Column
              field="stock_quantity"
              header="Tồn kho"
              body={quantityBody}
              sortable
            />
            <Column header="Thao tác" body={actionBody} />
          </DataTable>
        </div>
      </div>

      <div>
        <div className="card">
          <h2>{editing ? "Sửa sản phẩm" : "Tạo sản phẩm"}</h2>
          <form onSubmit={handleSubmit} className="form" encType="multipart/form-data">
            <label>
              Tên
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Mô tả
              <input
                name="description"
                value={form.description}
                onChange={handleChange}
              />
            </label>
            <label>
              Danh mục
              <select
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                required
              >
                <option value={0}>-- Chọn danh mục --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Nhà cung cấp
              <select
                name="supplier_id"
                value={form.supplier_id}
                onChange={handleChange}
                required
              >
                <option value={0}>-- Chọn nhà cung cấp --</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Giá nhập
              <input
                type="number"
                name="cost_price"
                value={form.cost_price}
                onChange={handleChange}
                required
                min={0}
              />
            </label>
            <label>
              Giá bán
              <input
                type="number"
                name="sell_price"
                value={form.sell_price}
                onChange={handleChange}
                required
                min={0}
              />
            </label>
            <label>
              Tồn kho
              <input
                type="number"
                name="stock_quantity"
                value={form.stock_quantity}
                onChange={handleChange}
                required
                min={0}
              />
            </label>
            <label>
              Bảo hành (tháng)
              <input
                type="number"
                name="warranty_months"
                value={form.warranty_months}
                onChange={handleChange}
                required
                min={0}
              />
            </label>

            {/* PrimeReact FileUpload: không auto upload, chỉ chọn file -> lưu vào state */}
            <label>
              Ảnh sản phẩm (tùy chọn)
              <FileUpload
                mode="basic"
                name="file"
                accept="image/*"
                maxFileSize={5_000_000}
                auto={false} // không tự gửi
                chooseLabel="Chọn ảnh"
                uploadLabel="Upload" // won't be used because auto=false
                onSelect={onFileSelect}
                onRemove={onFileRemove}
                multiple={false}
                // showUploadButton={false} // optional: hide upload button UI in some versions
              />
              {selectedFile && (
                <div style={{ marginTop: 8 }}>
                  <strong>Đã chọn:</strong> {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                  <button
                    type="button"
                    className="btn btn-sm btn-outline"
                    style={{ marginLeft: 8 }}
                    onClick={() => setSelectedFile(null)}
                  >
                    Bỏ chọn
                  </button>
                </div>
              )}
            </label>

            <div className="form-row" style={{ marginTop: 12 }}>
              <button className="btn btn-primary" type="submit">
                Lưu
              </button>
              {editing && (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={resetForm}
                >
                  Huỷ
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
