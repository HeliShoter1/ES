import { FormEvent, useEffect, useState } from "react";
import { useAuthApi } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

export type Employee = {
  id: number;
  full_name: string;
  phone: string;
  email: string;
  address: string;
  role: string;
  is_active?: boolean;
};

export default function AdminEmployeePage() {
  const api = useAuthApi();
  const { token } = useAuth();
  const [search, setSearch] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    address: "",
    role: "staff",
  });

  const loadEmployees = async (searchName: string = "") => {
    setError(null);
    try {
      const res = await api.get("/employee/employees", {
        params: { name: searchName },
      });
      setEmployees(res.data?.data ?? []);
    } catch (err) {
      console.error(err);
      setError("Không tải được danh sách nhân viên");
    }
  };

  const loadByName = async () => {
    await loadEmployees(search);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/employee/create_employee", form);
      setForm({
        full_name: "",
        phone: "",
        email: "",
        address: "",
        role: "staff",
      });
      await loadEmployees();
    } catch (err) {
      console.error(err);
      setError("Không tạo được nhân viên");
    }
  };

  useEffect(() => {
    if (token?.access_token) {
      loadEmployees();
    }
  }, [token]);

  return (
    <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
      <div style={{ display: "flex", flexDirection: "column", height: "100%", flex: "1 1 70%" }}>
        <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Nhân viên (Admin)</h1>
        <div className="page-header" style={{ marginBottom: "0.5rem" }}>
          <div className="search-bar">
            <input
              placeholder="Tìm theo tên nhân viên..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ fontSize: "0.875rem", padding: "0.5rem" }}
            />
            <button className="btn btn-outline" onClick={loadByName} style={{ fontSize: "0.875rem", padding: "0.5rem 1rem" }}>
              Tìm
            </button>
          </div>
        </div>
        {error && <div className="alert alert-error" style={{ fontSize: "0.875rem", padding: "0.5rem", marginBottom: "0.5rem" }}>{error}</div>}
        <div className="card" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ fontSize: "0.8rem", overflow: "auto", flex: 1 }}>
            <DataTable
              value={employees}
              paginator
              rows={5}
              rowsPerPageOptions={[5, 10, 25, 50]}
              tableStyle={{ width: "100%", fontSize: "0.8rem" }}
              style={{ fontSize: "0.8rem" }}
            >
              <Column field="id" header="ID" style={{ width: "4rem" }} sortable />
              <Column field="full_name" header="Họ tên" style={{ width: "10rem" }} sortable />
              <Column field="email" header="Email" style={{ width: "12rem" }} sortable />
              <Column field="phone" header="SĐT" style={{ width: "8rem" }} />
              <Column field="address" header="Địa chỉ" style={{ width: "15rem" }} />
              <Column field="role" header="Vai trò" style={{ width: "6rem" }} />
              <Column field="is_active" header="TT" style={{ width: "5rem" }} />
            </DataTable>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", height: "100%", flex: "0 0 300px", maxWidth: "300px" }}>
        <div className="card" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>Tạo nhân viên</h2>
          <form onSubmit={handleCreate} className="form" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <label style={{ fontSize: "0.875rem", marginBottom: "0.5rem" }}>
              Họ tên
              <input
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                required
                style={{ fontSize: "0.875rem", padding: "0.5rem", marginTop: "0.25rem", width: "100%" }}
              />
            </label>
            <label style={{ fontSize: "0.875rem", marginBottom: "0.5rem" }}>
              Điện thoại
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                style={{ fontSize: "0.875rem", padding: "0.5rem", marginTop: "0.25rem", width: "100%" }}
              />
            </label>
            <label style={{ fontSize: "0.875rem", marginBottom: "0.5rem" }}>
              Email
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                style={{ fontSize: "0.875rem", padding: "0.5rem", marginTop: "0.25rem", width: "100%" }}
              />
            </label>
            <label style={{ fontSize: "0.875rem", marginBottom: "0.5rem" }}>
              Địa chỉ
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                required
                style={{ fontSize: "0.875rem", padding: "0.5rem", marginTop: "0.25rem", width: "100%" }}
              />
            </label>
            <label style={{ fontSize: "0.875rem", marginBottom: "0.5rem" }}>
              Vai trò
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                required
                style={{ fontSize: "0.875rem", padding: "0.5rem", marginTop: "0.25rem", width: "100%" }}
              >
                <option value="staff">Nhân viên</option>
                <option value="admin">Quản trị</option>
              </select>
            </label>
            <button className="btn btn-primary" type="submit" style={{ fontSize: "0.875rem", padding: "0.5rem", marginTop: "auto" }}>
              Tạo
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}


