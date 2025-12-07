import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    address: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await api.post("/auth/register", form);
      if (!res.data?.success) {
        setError(res.data?.message ?? "Đăng ký thất bại");
      } else {
        setSuccess("Đăng ký thành công, vui lòng đăng nhập");
        setTimeout(() => navigate("/login"), 1200);
      }
    } catch (err) {
      console.error(err);
      setError("Lỗi hệ thống, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card auth-card">
      <h1>Đăng ký</h1>
      <form onSubmit={handleSubmit} className="form">
        <label>
          Họ tên
          <input
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Số điện thoại
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Địa chỉ
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Mật khẩu
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </label>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Đang đăng ký..." : "Đăng ký"}
        </button>
      </form>
    </div>
  );
}


