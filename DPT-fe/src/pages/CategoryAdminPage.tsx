import { FormEvent, useEffect, useState } from "react";
import { useAuthApi } from "../api/client";

export type Category = {
  id: number;
  name: string;
  description?: string | null;
};

export default function CategoryAdminPage() {
  const authApi = useAuthApi();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.get("/categories");
      setCategories(res.data?.data ?? []);
    } catch (err) {
      console.error(err);
      setError("Không tải được danh mục");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const resetForm = () => {
    setEditing(null);
    setName("");
    setDescription("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await authApi.put(`/categories/${editing.id}`, {
          name,
          description,
        });
      } else {
        await authApi.post("/categories", {
          name,
          description,
        });
      }
      resetForm();
      await load();
    } catch (err) {
      console.error(err);
      setError("Không lưu được danh mục");
    }
  };

  const handleEdit = (cat: Category) => {
    setEditing(cat);
    setName(cat.name);
    setDescription(cat.description ?? "");
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Xoá danh mục này?")) return;
    try {
      await authApi.delete(`/categories/${id}`);
      await load();
    } catch (err) {
      console.error(err);
      setError("Không xoá được danh mục");
    }
  };

  return (
    <div className="grid grid-2">
      <div>
        <h1>Quản lý danh mục</h1>
        {loading && <p>Đang tải...</p>}
        {error && <div className="alert alert-error">{error}</div>}
        <ul className="list">
          {categories.map((c) => (
            <li key={c.id} className="list-row">
              <div>
                <div>{c.name}</div>
                {c.description && <div className="muted">{c.description}</div>}
              </div>
              <div className="row-actions">
                <button
                  className="btn btn-sm btn-outline"
                  onClick={() => handleEdit(c)}
                >
                  Sửa
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(c.id)}
                >
                  Xoá
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <div className="card">
          <h2>{editing ? "Sửa danh mục" : "Tạo danh mục"}</h2>
          <form onSubmit={handleSubmit} className="form">
            <label>
              Tên
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>
            <label>
              Mô tả
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>
            <div className="form-row">
              <button className="btn btn-primary" type="submit">
                Lưu
              </button>
              {editing && (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={resetForm}
                >
                  Huỷ
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


