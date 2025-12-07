import { useEffect, useState } from "react";
import { useAuthApi } from "../api/client";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import {Customer} from "../pages/AdminCustomerPage"
import { Employee } from "./AdminEmployeePage";

type Order = {
  id: number;
  customer:Customer;
  total_amount?: number;
  status: string;
  create_at: string;
  // nếu có các field khác thì khai báo thêm ở đây
};

  type OrderUpdate = {
    id: number;
    customer_id?:number;
    total_amount?: number;
    status: string;
    create_at: string;
  }

export default function AdminOrderPage() {
  const api = useAuthApi();
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    try {
      const res = await api.get("/orders");
      setOrders(res.data?.data ?? []);
    } catch (err) {
      console.error(err);
      setError("Không tải được đơn hàng");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  // Gửi nguyên order (hoặc order đã chỉnh sửa) lên API
  const updateOrder = async (order: Order, newStatus: string) => {
    setError(null);
    try {
      // tạo bản copy và cập nhật trường status trước khi gửi
      const payload: OrderUpdate = { 
        id: order.id,
        customer_id: order.customer?.id,
        total_amount: order.total_amount,
        status: newStatus,
        create_at: order.create_at
      };

      // Gửi toàn bộ object payload. Nhiều backend mong PUT nhận toàn bộ resource.
      const res = await api.put(`/orders/${order.id}`, payload);

      // Nếu backend trả về object đã update thì dùng nó để update state cục bộ
      const updatedOrder: Order = res.data?.data ?? payload;

      // Cập nhật state cục bộ để không phải load() lại toàn bộ danh sách
      setOrders(prev => prev.map(o => (o.id === order.id ? updatedOrder : o)));
    } catch (err) {
      console.error(err);
      setError("Cập nhật đơn hàng thất bại");
    }
  };

  const actionBody = (rowData: Order) => {
    const isSuccessful = rowData.status === "successful";
    const isCancelled = rowData.status === "cancelled";

    return (
      <>
        <Button
          icon="pi pi-check"
          className="p-button-sm p-mr-2"
          onClick={() => updateOrder(rowData, "successful")}
          aria-label={`Mark order ${rowData.id} as successful`}
          disabled={isSuccessful}
        />
        <Button
          icon="pi pi-times"
          className="p-button-sm p-button-danger"
          onClick={() => updateOrder(rowData, "cancelled")}
          aria-label={`Cancel order ${rowData.id}`}
          disabled={isCancelled}
        />
      </>
    );
  };

  const dateBody = (rowData: Order) => {
    try {
      return new Date(rowData.create_at).toLocaleString();
    } catch {
      return rowData.create_at;
    }
  };

  return (
    <div>
      <h1>Đơn hàng (Admin)</h1>
      {error && <div className="alert alert-error">{error}</div>}

      <DataTable value={orders} dataKey="id" paginator rows={5} rowsPerPageOptions={[5, 10, 25, 50]} tableStyle={{ minWidth: '50rem' }}>
        <Column field="id" header="Code" />
        <Column field="status" header="Status" />
        <Column field="create_at" header="Create at" body={dateBody} />
        <Column field="total_amount" header="Total amount" />
        <Column field="customer.email" header="customer"></Column>
        <Column header="Action" body={actionBody} />
      </DataTable>
    </div>
  );
}
