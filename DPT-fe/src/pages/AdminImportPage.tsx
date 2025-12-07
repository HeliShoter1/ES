import { FormEvent, useEffect, useState } from "react";
import { useAuthApi } from "../api/client";

type Import = {
  id: number;
  supplier_id: number;
  employee_id: number;
  total_cost: number;
  import_date: string;
};

export default function AdminImportPage() {
  const api = useAuthApi();
  const [imports, setImports] = useState<Import[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    supplier_id: 0,
    employee_id: 0,
    total_cost: 0,
  });

  const load = async () => {
    setError(null);
    try {
      const res = await api.get("/imports");
      setImports(res.data?.data ?? []);
    } catch (err) {
      console.error(err);
      setError("Không tải được phiếu nhập");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name.includes("_id") || name.includes("cost") ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/imports", form);
      setForm({ supplier_id: 0, employee_id: 0, total_cost: 0 });
      await load();
    } catch (err) {
      console.error(err);
      setError("Không tạo được phiếu nhập");
    }
  };

  return (
    <div className="grid grid-2">
      <div>
        <h1>Phiếu nhập (Admin)</h1>
        {error && <div className="alert alert-error">{error}</div>}
        <ul className="list" style={{ marginTop: "1rem" }}>
          {imports.map((imp) => (
            <li key={imp.id} className="list-row">
              <div>
                <div>Phiếu nhập #{imp.id}</div>
                <div className="muted">
                  NCC ID: {imp.supplier_id} • NV ID: {imp.employee_id}
                </div>
                <div className="muted">
                  Tổng tiền:{" "}
                  {imp.total_cost.toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  })}{" "}
                  • Ngày nhập: {new Date(imp.import_date).toLocaleString("vi-VN")}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <div className="card">
          <h2>Tạo phiếu nhập</h2>
          <form onSubmit={handleSubmit} className="form">
            <label>
              NCC (supplier_id)
              <input
                type="number"
                name="supplier_id"
                value={form.supplier_id}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Nhân viên (employee_id)
              <input
                type="number"
                name="employee_id"
                value={form.employee_id}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Tổng tiền
              <input
                type="number"
                name="total_cost"
                value={form.total_cost}
                onChange={handleChange}
                required
              />
            </label>
            <button className="btn btn-primary" type="submit">
              Tạo
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}


