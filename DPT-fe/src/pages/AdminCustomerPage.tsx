import { useEffect, useState } from "react";
import { useAuthApi } from "../api/client";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";


export type Customer = {
  id: number;
  full_name: string;
  phone: string;
  email: string;
  address: string;
};

export default function AdminCustomerPage() {
  const api = useAuthApi();
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAll = async (keyword: string = "") => {
    setLoading(true);
    setError(null);
    try {
      // Backend: /customer?search=...
      const res = await api.get("/customer", {
        params: { skip: 0, limit: 50, search: keyword },
      });
      setCustomers(res.data?.data ?? []);
    } catch (err) {
      console.error(err);
      setError("Không tải được danh sách khách hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAll();
  }, []);

  const handleSearch = async () => {
    await loadAll(search.trim());
  };

  return (
    <div>
      <h1>Khách hàng (Admin)</h1>
      <div className="page-header" style={{ marginTop: "1rem" }}>
        <div className="search-bar">
          <input
            placeholder="Tìm theo tên khách hàng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn btn-outline" onClick={handleSearch}>
            Tìm
          </button>
        </div>
      </div>
      {loading && <p>Đang tải...</p>}
      {error && <div className="alert alert-error">{error}</div>}
      <div className="card" style={{ marginTop: "1rem" }}>
        <DataTable
          value={customers}
          paginator
          rows={5}
          rowsPerPageOptions={[5, 10, 25, 50]}
          tableStyle={{ width: "100%" }}
        >
          <Column field="id" header="ID" style={{ width: "8rem" }} sortable />
          <Column field="full_name" header="Họ tên" sortable />
          <Column field="email" header="Email" sortable />
          <Column field="phone" header="Số điện thoại" />
          <Column field="address" header="Địa chỉ" />
        </DataTable>
      </div>
    </div>
  );
}
