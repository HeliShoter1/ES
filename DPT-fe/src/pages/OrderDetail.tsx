import { useEffect, useState } from "react";
import { api,useAuthApi } from "../api/client";
import { useAuth, } from "../auth/AuthContext";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Card } from "primereact/card";
import { ProgressSpinner } from "primereact/progressspinner";
import { Link, useNavigate } from "react-router-dom";
import { Customer } from "./AdminCustomerPage";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

type Order = {
    id: number;
    customer: Customer;
    total_amount: number;
    status: string;
    create_at: string ;
    items?: OrderItem[];
}

type OrderItem = {
    id: number;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
}

type OrderUpdate = {
    id: number;
    customer_id?:number;
    total_amount?: number;
    status: string;
    create_at: string;
  }

export default function OrderDetail() {
    const { token } = useAuth();
    const authApi = useAuthApi(); 
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const getOrders = async (user_id: number) => {
        setLoading(true);
        setError(null);
        try {
            const res = await authApi.get(`/orders/customer/${user_id}`);
            setOrders(res?.data?.data ?? []);
        } catch (err) {
            console.error(err);
            setError("Không tải được danh sách đơn hàng");
        } finally {
            setLoading(false);
        }
    };

    

    useEffect(() => {
        if (typeof token?.customer_id === "number") {
            getOrders(token.customer_id);
        }
    }, [token?.customer_id]);

    // Định dạng tiền tệ
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(value);
    };

    // Định dạng ngày tháng
    const formatDate = (value: string | Date) => {
        if (!value) return '';
        const date = new Date(value);
        return new Intl.DateTimeFormat('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    // Hàm xử lý trạng thái đơn hàng
    const getStatusSeverity = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'warning';
            case 'processing':
                return 'info';
            case 'completed':
                return 'success';
            case 'cancelled':
                return 'danger';
            case 'shipped':
                return 'primary';
            default:
                return null;
        }
    };

    // Hàm chuyển đổi trạng thái sang tiếng Việt
    const getStatusLabel = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'Chờ xử lý';
            case 'processing':
                return 'Đang xử lý';
            case 'successful':
                return 'Hoàn thành';
            case 'cancelled':
                return 'Đã hủy';
            case 'shipped':
                return 'Đang giao';
            default:
                return status;
        }
    };

    // Template cho trạng thái
    const statusBodyTemplate = (rowData: Order) => {
        const severity = (() => {
            const value = getStatusSeverity(rowData.status);
            // "primary" is not a valid severity, map it to "secondary"
            return value === "primary" ? "secondary" : value;
        })();
        const label = getStatusLabel(rowData.status);
        return <Tag value={label} severity={severity} />;
    };

    // Template cho số tiền
    const amountBodyTemplate = (rowData: Order) => {
        return formatCurrency(rowData.total_amount);
    };

    // Template cho ngày tạo
    const dateBodyTemplate = (rowData: Order) => {
        return formatDate(rowData.create_at);
    };

    // Template cho nút hành động
    const actionBodyTemplate = (rowData: Order) => {
        return (
            <div className="flex gap-2">
                <Button
                    label="Xem chi tiết"
                    icon="pi pi-eye"
                    className="p-button-sm p-button-outlined"
                    onClick={() => navigate(`/items/${rowData.id}`)}
                />
                {rowData.status.toLowerCase() === 'pending' && (
                    <Button
                        label="Hủy đơn"
                        icon="pi pi-times"
                        className="p-button-sm p-button-danger p-button-outlined"
                        onClick={() => updateOrder(rowData,"cancelled")}
                    />
                )}
            </div>
        );
    };

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
          const res = await authApi.put(`/orders/${order.id}`, payload);
    
          // Nếu backend trả về object đã update thì dùng nó để update state cục bộ
          const updatedOrder: Order = res.data?.data ?? payload;
    
          // Cập nhật state cục bộ để không phải load() lại toàn bộ danh sách
          setOrders(prev => prev.map(o => (o.id === order.id ? updatedOrder : o)));
        } catch (err) {
          console.error(err);
          setError("Cập nhật đơn hàng thất bại");
        }
      };

    // Hiển thị loading
    if (loading) {
        return (
            <div className="flex justify-content-center align-items-center min-h-screen">
                <ProgressSpinner />
            </div>
        );
    }

    // Hiển thị lỗi
    if (error) {
        return (
            <Card className="m-4">
                <div className="text-center p-4">
                    <i className="pi pi-exclamation-triangle text-4xl text-red-500 mb-4"></i>
                    <h3 className="text-xl font-semibold mb-2">Đã xảy ra lỗi</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <Button
                        label="Thử lại"
                        icon="pi pi-refresh"
                        onClick={() => token?.customer_id && getOrders(token.customer_id)}
                    />
                </div>
            </Card>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-bold text-gray-800">Đơn hàng của tôi</h1>
                    <Link to="/products">
                        <Button
                            label="Tiếp tục mua sắm"
                            icon="pi pi-shopping-cart"
                            className="p-button-success"
                        />
                    </Link>
                </div>
                
                {orders.length === 0 ? (
                    <Card className="text-center p-6">
                        <i className="pi pi-inbox text-6xl text-gray-300 mb-4"></i>
                        <h3 className="text-xl font-semibold mb-2">Không có đơn hàng nào</h3>
                        <p className="text-gray-600 mb-4">Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm!</p>
                        <Link to="/products">
                            <Button
                                label="Mua sắm ngay"
                                icon="pi pi-shopping-bag"
                            />
                        </Link>
                    </Card>
                ) : (
                    <>
                        <div className="grid mb-4">
                            <div className="col-12 md:col-3">
                                <Card className="bg-blue-50 border-blue-200">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-700">
                                            {orders.filter(o => o.status.toLowerCase() === 'pending').length}
                                        </div>
                                        <div className="text-gray-600">Chờ xử lý</div>
                                    </div>
                                </Card>
                            </div>
                            <div className="col-12 md:col-3">
                                <Card className="bg-green-50 border-green-200">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-700">
                                            {orders.filter(o => o.status.toLowerCase() === 'successful').length}
                                        </div>
                                        <div className="text-gray-600">Hoàn thành</div>
                                    </div>
                                </Card>
                            </div>
                        </div>

                        <Card>
                            <DataTable
                                value={orders}
                                paginator
                                rows={10}
                                rowsPerPageOptions={[5, 10, 25, 50]}
                                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                currentPageReportTemplate="Hiển thị {first} đến {last} trong tổng số {totalRecords} đơn hàng"
                                loading={loading}
                                emptyMessage="Không tìm thấy đơn hàng nào"
                                className="p-datatable-sm"
                                scrollable
                                scrollHeight="500px"
                            >
                                <Column
                                    field="id"
                                    header="Mã đơn"
                                    sortable
                                    style={{ width: '100px' }}
                                />
                                <Column
                                    field="create_at"
                                    header="Ngày đặt"
                                    body={dateBodyTemplate}
                                    sortable
                                    style={{ width: '180px' }}
                                />
                                <Column
                                    field="total_amount"
                                    header="Tổng tiền"
                                    body={amountBodyTemplate}
                                    sortable
                                    style={{ width: '150px' }}
                                />
                                <Column
                                    field="status"
                                    header="Trạng thái"
                                    body={statusBodyTemplate}
                                    sortable
                                    style={{ width: '150px' }}
                                />
                                <Column
                                    header="Hành động"
                                    body={actionBodyTemplate}
                                    style={{ width: '200px' }}
                                />
                            </DataTable>
                        </Card>

                    </>
                )}
            </div>
        </div>
    );
}