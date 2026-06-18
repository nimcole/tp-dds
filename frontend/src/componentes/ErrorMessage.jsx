export default function ErrorMessage({ error, onRetry }) {
  if (!error) return null;

  const message = typeof error === "string" ? error : error.message;
  const status  = typeof error === "object"  ? error.status : null;

  const icon    = iconByStatus(status);
  const estilos = estilosByStatus(status);

  return (
    <div style={estilos.contenedor} role="alert">
      <span style={{ fontSize: "16px" }}>{icon}</span>
      <span style={{ flex: 1, fontSize: "13px" }}>{message}</span>
      {onRetry && (
        <button onClick={onRetry} type="button" style={estilos.botonReintentar}>
          Reintentar
        </button>
      )}
    </div>
  );
}

function iconByStatus(status) {
  if (status === 401) return "🔒";
  if (status === 403) return "⛔";
  if (status === 404) return "🔍";
  if (status === 400) return "⚠️";
  return "❌";
}

function estilosByStatus(status) {
  const base = {
    contenedor: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "10px 14px",
      borderRadius: "8px",
      marginBottom: "16px",
      borderLeft: "4px solid",
    },
    botonReintentar: {
      marginLeft: "auto",
      background: "none",
      border: "1px solid currentColor",
      borderRadius: "6px",
      padding: "4px 10px",
      fontSize: "12px",
      cursor: "pointer",
      color: "inherit",
    },
  };

  if (status === 401 || status === 403) {
    base.contenedor = { ...base.contenedor, background: "#1a0f00", borderColor: "#f59e0b", color: "#f59e0b" };
  } else if (status === 404) {
    base.contenedor = { ...base.contenedor, background: "#001a2a", borderColor: "#7ab3f0", color: "#7ab3f0" };
  } else if (status === 400) {
    base.contenedor = { ...base.contenedor, background: "#1a1000", borderColor: "#fbbf24", color: "#fbbf24" };
  } else {
    base.contenedor = { ...base.contenedor, background: "#2a0000", borderColor: "#ff4d4d", color: "#ff4d4d" };
  }

  return base;
}
