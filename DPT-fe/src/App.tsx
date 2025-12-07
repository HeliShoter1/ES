import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProductListPage from "./pages/ProductListPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import AdminCustomerPage from "./pages/AdminCustomerPage";
import AdminEmployeePage from "./pages/AdminEmployeePage";
import AdminImportPage from "./pages/AdminImportPage";
import AdminImportItemPage from "./pages/AdminImportItemPage";
import AdminOrderPage from "./pages/AdminOrderPage";
import CartPage from "./pages/CartPage";
import CategoryAdminPage from "./pages/CategoryAdminPage";
import ProductAdminPage from "./pages/ProductAdminPage";
import Header from "./components/Header";
import Sidebars from "./components/Sidebar";
import Slide from "./components/Slide";
import Footer from "./components/Footer"
import SupplierDetail from "./pages/SupplierDetail";
import OrderDetail from "./pages/OrderDetail";
import ItemOrderDetail from "./pages/ItemOrder";
import CategoryDetailPage from "./pages/CategoryDetailPage";

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AppInner() {
  return (
    <div className="app">

      <Header />
      <main className="container">
        <Routes>
          <Route path="/" element={<ProductListPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/category/:id" element={<CategoryDetailPage />} />
          <Route path="/supplier/:id" element={<SupplierDetail />} />
          <Route path="/orders" element={<OrderDetail/>}></Route>
          <Route path="/items/:id" element={<ItemOrderDetail></ItemOrderDetail>}/>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/cart"
            element={
              <PrivateRoute>
                <CartPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <PrivateRoute>
                <CategoryAdminPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <PrivateRoute>
                <ProductAdminPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/customers"
            element={
              <PrivateRoute>
                <AdminCustomerPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/employees"
            element={
              <PrivateRoute>
                <AdminEmployeePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/imports"
            element={
              <PrivateRoute>
                <AdminImportPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/import-items"
            element={
              <PrivateRoute>
                <AdminImportItemPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <PrivateRoute>
                <AdminOrderPage />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer></Footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}


