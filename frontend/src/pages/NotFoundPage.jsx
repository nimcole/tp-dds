import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.centro}>
      <p style={{ fontSize: "48px", margin: "0" }}>404</p>
      <p style={{ color: "#666", fontSize: "14px", margin: "4px 0 24px" }}>
        La página que buscás no existe.
      </p>
      <button onClick={() => navigate("/")} style={boton("#1a1a1a", "#aaa", "#333")}>
        ← Volver al inicio
      </button>
    </div>
  );
};

const styles = {
  centro: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
    color: "white",
    gap: "4px",
  },
};

const boton = (bg, color, border) => ({
  background: bg,
  color: color,
  border: `1px solid ${border}`,
  padding: "8px 16px",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: "500",
});

export default NotFoundPage;