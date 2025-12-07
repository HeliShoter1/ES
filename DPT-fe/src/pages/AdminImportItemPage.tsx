import { FormEvent, useEffect, useState } from "react";
import { useAuthApi } from "../api/client";

type ImportItem = {
  id: number;
  import_id: number;
  product_id: number;
  quantity: number;
  unit_cost: number;
};

export default function AdminImportItemPage() {
  const api = useAuthApi();
  const [items, setItems] = useState<ImportItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    import_id: 0,
    product_id: 0,
    quantity: 0,
    unit_cost: 0,
  });

  const load = async () => {
    setError(null);
    try {
      const res = await api.get("/import-items");
      setItems(res.data?.data ?? []);
    } catch (err) {
      console.error(err);
      setError("Không tải được chi tiết nhập");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/import-items", form);
      setForm({ import_id: 0, product_id: 0, quantity: 0, unit_cost: 0 });
      await load();
    } catch (err) {
      console.error(err);
      setError("Không tạo được chi tiết nhập");
    }
  };

  return (
    <div className="grid grid-2">
      <div>
        <h1>Chi tiết nhập (Admin)</h1>
        {error && <div className="alert alert-error">{error}</div>}
        <ul className="list" style={{ marginTop: "1rem" }}>
          {items.map((it) => (
            <li key={it.id} className="list-row">
              <div>
                <div>
                  Phiếu #{it.import_id} • Sản phẩm #{it.product_id}
                </div>
                <div className="muted">
                  SL: {it.quantity} • Đơn giá:{" "}
                  {it.unit_cost.toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  })}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <div className="card">
          <h2>Thêm chi tiết nhập</h2>
          <form onSubmit={handleSubmit} className="form">
            <label>
              Phiếu nhập (import_id)
              <input
                type="number"
                name="import_id"
                value={form.import_id}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Sản phẩm (product_id)
              <input
                type="number"
                name="product_id"
                value={form.product_id}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Số lượng
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Đơn giá
              <input
                type="number"
                name="unit_cost"
                value={form.unit_cost}
                onChange={handleChange}
                required
              />
            </label>
            <button className="btn btn-primary" type="submit">
              Thêm
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}


