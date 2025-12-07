import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Sidebar } from 'primereact/sidebar';
import { useState } from "react";
import { Button } from 'primereact/button';
import { PrimeIcons } from 'primereact/api';

export default function Sidebars() {
    const { token, logout } = useAuth();
    const navigate = useNavigate();
    const [visible, setVisible] = useState(false);
    

    return (
      <>
        <Sidebar
          className="app-sidebar"
          visible={visible}
          position="left"
          onHide={() => setVisible(false)}
          modal
          dismissable
          style={{ backgroundColor: "#0066CC", borderRadius: "10px" }}
        >
          <nav className="sidebar-nav" style={{ marginTop: "50px", padding: "20px" }}>
            <Link to="/" style={{ padding: "20px" }}>
              Sản phẩm
            </Link>
            {token?.role === "admin" && (
              <Link to="/admin/categories" style={{ padding: "20px" }}>
                Quản lý danh mục
              </Link>
            )}
            {token?.role === "admin" && (
              <Link to="/admin/products" style={{ padding: "20px" }}>
                Quản lý sản phẩm
              </Link>
            )}
            {token?.role === "admin" && (
              <Link to="/admin/customers" style={{ padding: "20px" }}>
                Khách hàng
              </Link>
            )}
            {token?.role === "admin" && (
              <Link to="/admin/employees" style={{ padding: "20px" }}>
                Nhân viên
              </Link>
            )}
            {token?.role === "admin" && (
              <Link to="/admin/imports" style={{ padding: "20px" }}>
                Phiếu nhập
              </Link>
            )}
            {token?.role === "admin" && (
              <Link to="/admin/import-items" style={{ padding: "20px" }}>
                Chi tiết nhập
              </Link>
            )}
            {token?.role === "admin" && (
              <Link to="/admin/orders" style={{ padding: "20px" }}>
                Đơn hàng
              </Link>
            )}
          </nav>
          </Sidebar>
          {token?.role ==="admin" &&(
            <Button
            className="sidebar-toggle-btn"
            icon="pi pi-list"
            onClick={() => setVisible(true)}
            style={{backgroundColor: "transparent"}}
            />
            )
          }
        
      </>
    );
}