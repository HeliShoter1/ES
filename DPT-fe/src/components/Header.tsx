import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import Sidebars from "./Sidebar";   
import { Button } from "primereact/button";
import { Avatar } from 'primereact/avatar';
import { AvatarGroup } from 'primereact/avatargroup';

export default function Header() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="header">
      <Sidebars />
      <div className="container header-inner">
        <Link to="/" className="logo" style={{marginLeft: "5%"}}>
          DPT Shop
        </Link>

        <div className="auth-area">
        {token && (<>
            <Link to="/cart" style={{ padding: "0px" }} >
              <Button icon="pi pi-cart-plus"></Button>
            </Link>
            <Link to={'/orders'} style={{ padding: "0px" }} >
              <Button  icon="pi pi-shopping-bag" />
            </Link>
          </>
            )}
          {token ? (
            <>
              <span className="user-email">{token.email}</span>
              <Avatar image="/images/avatar.png" shape="circle" />
              <button className="btn btn-outline" onClick={handleLogout}>
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline">
                Đăng nhập
              </Link>
              <Link to="/register" className="btn btn-primary">
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}


