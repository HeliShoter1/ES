import { useEffect, useState } from "react";
import { api,useAuthApi } from "../api/client";
import { useAuth, } from "../auth/AuthContext";
import { useParams } from "react-router-dom";
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
import { Product } from "./ProductListPage";

type OrderItem = {
    order_id : number,
    product : Product
    quantity: number,
    unit_price: number,
    id : number,
    create_at: string,
}

export default function ItemOrderDetail(){
    const { token } = useAuth();
    const authApi = useAuthApi(); 
    const { id } = useParams();
    const [listItem,setListItems] = useState<OrderItem[]>([])
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);


    const getItemOrder = async(order_id : number)=>{
        setLoading(true);
        setError(null);
        try{
            const res = await authApi.get(`/items/${order_id}`);
            setListItems(res?.data?.data ?? [])
        }catch (err) {
            console.error(err);
            setError("Không tải được chi tiết đơn hàng");
        } finally {
            setLoading(false);
        }
    }
    const totalPrice = listItem.reduce(
        (sum, item) => sum + item.unit_price * item.quantity,
        0
      );

    useEffect(() => {
        if (id !== undefined) {
            const numericId = Number(id);
            if (!isNaN(numericId)) {
                getItemOrder(numericId);
            } else {
                setError("ID đơn hàng không hợp lệ");
            }
        }
    }, [id]); // Add dependency array

    return (
        <>
        <div>
            <header style={{fontSize:"xx-large"}}>
                Chi tiết đơn hàng
            </header>
        </div>
        <div className="card" style={{marginTop:"30px"}}>
        <DataTable value={listItem}>
  <Column
    header="Name"
    body={(rowData) => (
      <Link
        to={`/products/${rowData.product.id}`}
        style={{ color: "#2563eb", fontWeight: 600 }}
      >
        {rowData.product.name}
      </Link>
    )}
    footer="Tổng cộng"
    footerStyle={{ fontWeight: "bold", textAlign: "left" }}
  />

  <Column
    field="unit_price"
    header="price"
    footer={totalPrice.toLocaleString()}
    footerStyle={{ fontWeight: "bold", color: "red" }}
  />

  <Column field="product.category.name" header="category" />
  <Column field="quantity" header="quantity" />
  <Column field="create_at" header="create at" />
</DataTable>

        </div>
        </>
    )
}