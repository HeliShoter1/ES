import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { Product } from "./ProductListPage";
import { useAuth } from "../auth/AuthContext";
import { api, useAuthApi } from "../api/client";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { Skeleton } from 'primereact/skeleton';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Divider } from 'primereact/divider';

type Supplier = {
    id: number;
    name: string;
    address: string;
    phone: string;
    email: string;
}

export default function SupplierDetail() {
    const { id } = useParams();
    const { token } = useAuth();
    const authApi = useAuthApi();
    const [supplier, setSupplier] = useState<Supplier | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const [addingId, setAddingId] = useState<number | null>(null);
    
    const getProductBySupplier = async (id: number) => {
        try {
            const res = await api.get(`/products/supplier/${id}`);
            setProducts(res.data?.data ?? []);
        } catch (err) {
            console.error(err);
            throw new Error("Không tải được danh sách sản phẩm");
        }
    }
    const handleAddToCart = async (productId: number) => {
        if (!token) {
          navigate("/login");
          return;
        }
        setAddingId(productId);
        setError(null);
        try {
          await authApi.put("/carts", {
            customer: token.customer_id,
            product_id: productId,
            number: 1,
          });
        } catch (err) {
          console.error(err);
          setError("Không thêm được sản phẩm vào giỏ");
        } finally {
          setAddingId(null);
        }
      };

    const getSupplier = async (id: number) => {
        try {
            const res = await api.get(`/suplier/${id}`);
            setSupplier(res.data?.data ?? null);
        } catch (err) {
            console.error(err);
            throw new Error("Không tải được thông tin nhà cung cấp");
        }
    }

    useEffect(() => {
        const fetchSupplier = async () => {
            setLoading(true);
            setError(null);

            // Convert id to number if possible
            const supplierId = Number(id);
            if (id !== undefined && !isNaN(supplierId)) {
                try {
                    await Promise.all([
                        getProductBySupplier(supplierId),
                        getSupplier(supplierId)
                    ]);
                } catch (err: any) {
                    setError(err.message || "Đã xảy ra lỗi");
                }
            } else {
                setError("ID nhà cung cấp không hợp lệ");
            }
            setLoading(false);
        };

        fetchSupplier();
    }, [id]);

    // Định dạng giá tiền
    const priceBodyTemplate = (rowData: Product) => {
        return (
            <span className="font-bold text-primary">
                ${rowData.sell_price?.toLocaleString('vi-VN') || '0'}
            </span>
        );
    };

    // Định dạng hình ảnh
    const imageBodyTemplate = (rowData: Product) => {
        const imageUrl = rowData.product_image && rowData.product_image[0]
            ? `http://localhost:8000/product-images/${rowData.product_image[0].image_path}`
            : "/images/image.png";

        return (
            <img
                src={imageUrl}
                alt={rowData.name}
                className="w-10rem shadow-2 border-round"
                style={{ height: '100px', objectFit: 'cover' }}
                onError={(e) => {
                    e.currentTarget.src = "/images/image.png";
                }}
            />
        );
    };

    // Hành động cho mỗi sản phẩm
    const actionBodyTemplate = (rowData: Product) => {
        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-eye"
                    className="p-button-rounded p-button-info"
                    tooltip="Xem chi tiết"
                    tooltipOptions={{ position: 'top' }}
                    onClick={() => navigate(`/products/${rowData.id}`)}
                />
                <Button
                    icon="pi pi-shopping-cart"
                    className="p-button-rounded p-button-success"
                    tooltip="Thêm vào giỏ hàng"
                    tooltipOptions={{ position: 'top' }}
                    onClick={()=>{handleAddToCart(rowData.id)}}
                />
            </div>
        );
    };

    // Hiển thị trạng thái sản phẩm (có thể tùy chỉnh)
    const statusBodyTemplate = (rowData: Product) => {
        if(rowData.stock_quantity > 0){
            return (
                <Tag
                    value="Còn hàng"
                    severity="success"
                    icon="pi pi-check"
                />
            );
        }else{
            return (
                <Tag
                    value= "Hết hàng"
                    severity="danger"
                    icon= "pi pi-check"
                />
            )
        }
    };

    // Header cho DataTable
    const header = (
        <div className="flex flex-wrap justify-content-between align-items-center">
            <span className="text-xl font-bold">Danh sách sản phẩm</span>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <input
                    type="search"
                    className="p-inputtext p-component"
                    placeholder="Tìm kiếm sản phẩm..."
                    style={{ paddingLeft: '2.5rem' }}
                />
            </span>
        </div>
    );

    // Hiển thị loading
    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <ProgressSpinner />
                    <p className="mt-4 text-600">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {error ? (
                <div className="text-center py-8">
                    <i className="pi pi-exclamation-triangle text-4xl text-red-500 mb-4"></i>
                    <p className="text-xl text-red-500 mb-4">{error}</p>
                    <Button
                        label="Quay lại"
                        icon="pi pi-arrow-left"
                        className="p-button-outlined"
                        onClick={() => navigate(-1)}
                    />
                </div>
            ) : (
                <>
                    {/* Thông tin nhà cung cấp */}
                    <Card
                        title={
                            <div className="flex align-items-center">
                                <i className="pi pi-building text-2xl mr-3"></i>
                                <span>Thông tin nhãn hàng</span>
                            </div>
                        }
                        className="mb-6 shadow-2"
                    >
                        {supplier ? (
                            <div className="grid">
                                <div className="col-12 md:col-6">
                                    <div className="mb-4">
                                        <label className="block text-600 font-semibold mb-2">Tên nhà cung cấp</label>
                                        <div className="text-xl font-bold text-900 flex align-items-center">
                                            <i className="pi pi-tag mr-2"></i>
                                            {supplier.name}
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-600 font-semibold mb-2">Địa chỉ</label>
                                        <div className="text-lg text-900 flex align-items-center">
                                            <i className="pi pi-map-marker mr-2"></i>
                                            {supplier.address}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 md:col-6">
                                    <div className="mb-4">
                                        <label className="block text-600 font-semibold mb-2">Số điện thoại</label>
                                        <div className="text-lg text-900 flex align-items-center">
                                            <i className="pi pi-phone mr-2"></i>
                                            {supplier.phone}
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-600 font-semibold mb-2">Email</label>
                                        <div className="text-lg text-900 flex align-items-center">
                                            <i className="pi pi-envelope mr-2"></i>
                                            {supplier.email}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <i className="pi pi-exclamation-circle text-4xl text-yellow-500 mb-3"></i>
                                <p className="text-lg">Không tìm thấy thông tin nhà cung cấp</p>
                            </div>
                        )}
                    </Card>

                    <Divider>
                        <div className="inline-flex align-items-center">
                            <i className="pi pi-box mr-2"></i>
                            <span className="font-bold text-xl">Sản phẩm cung cấp</span>
                        </div>
                    </Divider>

                    {/* Danh sách sản phẩm */}
                    <Card className="shadow-2">
                        {products.length > 0 ? (
                            <DataTable
                                value={products}
                                header={header}
                                paginator
                                rows={10}
                                rowsPerPageOptions={[5, 10, 25, 50]}
                                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                currentPageReportTemplate="Hiển thị {first} đến {last} trong tổng số {totalRecords} sản phẩm"
                                emptyMessage="Không có sản phẩm nào"
                                loading={loading}
                                className="p-datatable-striped p-datatable-gridlines"
                                responsiveLayout="scroll"
                            >
                                <Column
                                    field="id"
                                    header="ID"
                                    sortable
                                    style={{ width: '80px' }}
                                />
                                <Column
                                    field="image"
                                    header="Hình ảnh"
                                    body={imageBodyTemplate}
                                    style={{ width: '150px' }}
                                />
                                <Column
                                    field="name"
                                    header="Tên sản phẩm"
                                    sortable
                                    style={{ minWidth: '250px' }}
                                />
                                <Column
                                    field="description"
                                    header="Mô tả"
                                    body={(rowData) => (
                                        <span className="line-clamp-2" style={{ maxWidth: '300px' }}>
                                            {rowData.description || 'Không có mô tả'}
                                        </span>
                                    )}
                                    style={{ minWidth: '300px' }}
                                />
                                <Column
                                    field="sell_price"
                                    header="Giá bán"
                                    body={priceBodyTemplate}
                                    sortable
                                    style={{ width: '150px' }}
                                />
                                <Column
                                    header="Trạng thái"
                                    body={statusBodyTemplate}
                                    style={{ width: '150px' }}
                                />
                                <Column
                                    header="Hành động"
                                    body={actionBodyTemplate}
                                    style={{ width: '120px' }}
                                />
                            </DataTable>
                        ) : (
                            <div className="text-center py-8">
                                <i className="pi pi-inbox text-5xl text-400 mb-4"></i>
                                <h3 className="text-2xl font-semibold mb-2">Không có sản phẩm</h3>
                                <p className="text-600 mb-6">Nhà cung cấp này chưa có sản phẩm nào</p>
                                <Button
                                    label="Quay lại trang trước"
                                    icon="pi pi-arrow-left"
                                    className="p-button-outlined"
                                    onClick={() => navigate(-1)}
                                />
                            </div>
                        )}
                    </Card>

                    {/* Thống kê */}


                    {/* Thêm CSS tùy chỉnh */}
                    <style>{`
                        .line-clamp-2 {
                            display: -webkit-box;
                            -webkit-line-clamp: 2;
                            -webkit-box-orient: vertical;
                            overflow: hidden;
                            text-overflow: ellipsis;
                        }
                        
                        .border-left-3 {
                            border-left-width: 3px !important;
                        }
                        
                        .p-card {
                            border-radius: 12px;
                        }
                        
                        .p-datatable .p-datatable-thead > tr > th {
                            background-color: #f8f9fa;
                            font-weight: 600;
                        }
                        
                        .p-datatable .p-datatable-tbody > tr:hover {
                            background-color: #f8f9fa !important;
                        }
                        
                        @media (max-width: 768px) {
                            .container {
                                padding-left: 1rem;
                                padding-right: 1rem;
                            }
                            
                            .p-datatable-responsive .p-datatable-tbody > tr > td {
                                display: block;
                                width: 100%;
                            }
                        }
                    `}</style>
                </>
            )}
        </div>
    );
}