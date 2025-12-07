import { Button } from "primereact/button";
import { Divider } from "primereact/divider";

export default function AppFooter() {
  return (
    <footer style={{ background: "#111827", color: "white", marginTop: "2rem" }}>

      {/* ===== MIDDLE ===== */}
      <section
        className="p-d-flex p-flex-wrap p-jc-between"
        style={{
          maxWidth: "1120px",
          margin: "0 auto",
          padding: "2rem 1rem",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: "2rem",
        }}
      >
        {/* Column 1 */}
        <div style={{ flex: "1 1 250px" }}>
          <h3 className="text-lg mb-3">Về chúng tôi</h3>
          <p style={{ opacity: 0.8 }}>
            Chúng tôi cung cấp UI hiện đại và tối ưu cho dự án React.
          </p>
        </div>

        {/* Column 2 */}
        <div style={{ flex: "1 1 250px" }}>
          <h3 className="text-lg mb-3">Liên hệ</h3>
          <ul style={{ lineHeight: "1.8", opacity: 0.9 }}>
            <li>Email: support@example.com</li>
            <li>Hotline: 0123 456 789</li>
            <li>Hà Nội, Việt Nam</li>
          </ul>
        </div>

        {/* Column 3 */}
        <div style={{ flex: "1 1 250px" }}>
          <h3 className="text-lg mb-3">Mạng xã hội</h3>
          <div style={{ display: "flex", gap: "1rem" }}>
            <Button icon="pi pi-facebook" rounded text />
            <Button icon="pi pi-instagram" rounded text />
            <Button icon="pi pi-twitter" rounded text />
          </div>
        </div>
      </section>

      <Divider />

      {/* ===== BOTTOM ===== */}
      <section
        style={{
          padding: "1rem",
          textAlign: "center",
          opacity: 0.7,
          fontSize: "14px",
        }}
      >
        © {new Date().getFullYear()} My Website. All rights reserved.
      </section>
    </footer>
  );
}
