import { useEffect, useMemo, useState } from "react";
import { useAuthApi } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column'
import { Button } from "primereact/button";
import { Link } from "react-router-dom";

type Product = {
  id: number;
  name: string;
  description?: string;
  sell_price?: number;
};

type CartProduct = {
  product: Product;
  number: number;
};

type Cart = {
  customer: number;
  products: CartProduct[];
};

export default function CartPage() {
  const authApi = useAuthApi();
  const { token } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ordering, setOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  const customerId = token?.customer_id;
  const totalAmount = useMemo(() => {
    if (!cart?.products) return 0;
    return cart.products.reduce((sum: number, item: CartProduct) => {
      const price = item.product.sell_price ?? 0;
      return sum + price * item.number;
    }, 0);
  }, [cart]);

  useEffect(() => {
    if (!customerId) return;
    const fetchCart = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await authApi.get(`/carts/${customerId}`);
        setCart(res.data?.data ?? res.data);
      } catch (err) {
        console.error(err);
        setError("Không tải được giỏ hàng");
      } finally {
        setLoading(false);
      }
    };
    // chỉ phụ thuộc customerId, tránh việc instance axios mới làm effect chạy liên tục
    void fetchCart();
  }, [customerId]);

  const handleRemove = async (productId: number) => {
    if (!customerId) return;
    try {
      await authApi.delete(`/carts/${customerId}/${productId}`);
      setCart((prev: Cart | null) =>
        prev
          ? {
              ...prev,
              products: prev.products.filter(
                (i: CartProduct) => i.product.id !== productId
              ),
            }
          : prev
      );
    } catch (err) {
      console.error(err);
      setError("Không xoá được sản phẩm khỏi giỏ");
    }
  };

  const handleCreateOrder = async () => {
    if (!cart || !cart.products.length) return;
    setOrdering(true);
    setError(null);
    setOrderSuccess(null);
    try {
      const order_items = cart.products.map((item) => ({
        product_id: item.product.id,
        quantity: item.number,
        unit_price: item.product.sell_price ?? 0,
      }));
      const payload = {
        customer_id: token?.customer_id,
        total_amount: totalAmount,
        status: "pending",
        order_items,
      };
      const res = await authApi.post("/orders", payload);
      setOrderSuccess(`Tạo đơn hàng thành công (ID: ${res.data?.data?.id ?? ""})`);
    } catch (err) {
      console.error(err);
      setError("Không tạo được đơn hàng");
    } finally {
      setOrdering(false);
    }
  };

  if (loading) return <p>Đang tải giỏ hàng...</p>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div>
      <h1>Giỏ hàng</h1>
      {!cart || !cart.products || cart.products.length === 0 ? (
        <p>Giỏ hàng trống.</p>
      ) : (
        <div className="card">
          {/* {cart.products.map((item: CartProduct) => (
            <div key={item.product.id} className="cart-row">
              <div>
                <div>{item.product.name}</div>
                {item.product.description && (
                  <div className="muted">{item.product.description}</div>
                )}
                <div className="muted">Số lượng: {item.number}</div>
              </div>
              <button
                className="btn btn-sm btn-outline"
                onClick={() => handleRemove(item.product.id)}
              >
                Xoá
              </button>
            </div>
          ))} */}
          <DataTable value={cart.products}>
              <Column
                  header="Name"
                  body={(rowData) => (
                      <Link to={`/products/${rowData.product.id}`}>
                          {rowData.product.name}
                      </Link>
                  )}
              />
              <Column field="product.description" header="description"></Column>
              <Column field="product.sell_price" header="price"></Column>
              <Column
              header="Actions"
              body={(rowData) => (
                  // <button
                  //     className="btn btn-sm btn-outline"
                  //     onClick={() => handleRemove(rowData.product.id)}
                  // >
                  <Button label="Xoá" severity="danger" onClick={() => handleRemove(rowData.product.id)} />
                  )}
                />
          </DataTable>
          <div style={{ marginTop: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem" }}>
            <div className="muted">
              Tổng tiền:{" "}
              {totalAmount.toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
              })}
            </div>
            {/* <button
              className="btn btn-primary"
              onClick={handleCreateOrder}
              disabled={ordering}
            >
              {ordering ? "Đang tạo đơn..." : "Đặt hàng"}
            </button> */}
            <Button label="Đặt hàng" severity="success" onClick={handleCreateOrder}/>
          </div>
          {orderSuccess && (
            <div className="alert alert-success" style={{ marginTop: "0.75rem" }}>
              {orderSuccess}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


