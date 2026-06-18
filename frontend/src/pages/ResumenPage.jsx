import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { resumenService } from "../services/resumen.service.js";
import EstadoBadge from "../componentes/EstadoBadge";
import ErrorMessage from "../componentes/ErrorMessage";

function formatFecha(str) {
  if (!str) return "—";
  const d = new Date(str);
  return isNaN(d) ? str : d.toLocaleDateString("es-AR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

const colorPorEstado = {
  pendiente:  { bg: "#2a1f00", color: "#f59e0b" },
  aprobada:   { bg: "#002a10", color: "#4dff91" },
  rechazada:  { bg: "#2a0000", color: "#ff4d4d" },
  cancelada:  { bg: "#1a1a1a", color: "#888"    },
  devuelta:   { bg: "#001a2a", color: "#7ab3f0" },
};

const ResumenPage = () => {
  const navigate = useNavigate();
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => { cargarResumen(); }, []);

  const cargarResumen = async () => {
    try {
      setLoading(true);
      const data = await resumenService.getResumen();
      setResumen(data);
      setError(null);
    } catch (err) {
      console.error("Error al cargar resumen:", err);
      setError({ message: "No se pudo cargar el resumen. Verificá el backend.", status: 500 });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.centro}>
        <div style={styles.spinner} />
        <p style={{ color: "#666", fontSize: "14px" }}>Cargando resumen...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.centro}>
        <ErrorMessage error={error} onRetry={cargarResumen} />
      </div>
    );
  }

  if (!resumen) return null;

  return (
    <div style={styles.pagina}>

      {/* Encabezado */}
      <div style={styles.encabezado}>
        <button onClick={() => navigate("/solicitudes")} style={boton("#1a1a1a", "#aaa", "#333")}>
          ← Volver
        </button>
        <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "500", color: "white" }}>
          Panel de resumen
        </h2>
      </div>

      {/* Tarjetas de estado */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>

        {/* Total */}
        <div style={{ ...styles.statCard, borderColor: "#333" }}>
          <span style={styles.statLabel}>Total</span>
          <span style={{ ...styles.statNum, color: "white" }}>{resumen.total}</span>
        </div>

        {/* Por estado */}
        {resumen.porEstado.map((item) => {
          const cfg = colorPorEstado[item.estado] ?? { bg: "#1a1a1a", color: "#aaa" };
          return (
            <div key={item.estado} style={{ ...styles.statCard, backgroundColor: cfg.bg, borderColor: cfg.color + "44" }}>
              <span style={{ ...styles.statLabel, color: cfg.color + "99" }}>
                {item.estado.charAt(0).toUpperCase() + item.estado.slice(1)}
              </span>
              <span style={{ ...styles.statNum, color: cfg.color }}>{item.cantidad}</span>
            </div>
          );
        })}
      </div>

      {/* Solicitudes por equipo */}
      <div style={styles.card}>
        <h3 style={styles.cardTitulo}>Solicitudes por equipo</h3>
        <table style={styles.tabla}>
          <thead>
            <tr>
              <Th>Equipo ID</Th>
              <Th>Cantidad</Th>
            </tr>
          </thead>
          <tbody>
            {resumen.porEquipo.map((item) => (
              <tr key={item.equipoId} style={{ borderBottom: "1px solid #2a2a2a" }}>
                <Td>{item.equipoId}</Td>
                <Td>{item.cantidad}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Últimas solicitudes */}
      <div style={styles.card}>
        <h3 style={styles.cardTitulo}>Últimas solicitudes</h3>
        <table style={styles.tabla}>
          <thead>
            <tr>
              <Th>#</Th>
              <Th>Equipo</Th>
              <Th>Retiro</Th>
              <Th>Devolución</Th>
              <Th>Estado</Th>
            </tr>
          </thead>
          <tbody>
            {resumen.ultimasSolicitudes.map((sol) => (
              <tr
                key={sol.id}
                onClick={() => navigate(`/solicitudes/${sol.id}`)}
                style={{ borderBottom: "1px solid #2a2a2a", cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#222"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
              >
                <Td>#{sol.id}</Td>
                <Td>{sol.equipoId}</Td>
                <Td>{formatFecha(sol.fechaRetiro)}</Td>
                <Td>{formatFecha(sol.fechaDevolucion)}</Td>
                <Td><EstadoBadge estado={sol.estado} /></Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

const Th = ({ children }) => (
  <th style={{ padding: "10px 12px", color: "#555", fontSize: "11px", fontWeight: "500",
    textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "left",
    borderBottom: "1px solid #2a2a2a" }}>
    {children}
  </th>
);

const Td = ({ children }) => (
  <td style={{ padding: "10px 12px", color: "white", fontSize: "13px" }}>
    {children}
  </td>
);

const styles = {
  pagina: {
    padding: "24px 20px",
    color: "white",
    maxWidth: "900px",
    margin: "0 auto",
  },
  encabezado: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "24px",
  },
  card: {
    backgroundColor: "#1a1a1a",
    border: "1px solid #333",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "16px",
  },
  cardTitulo: {
    margin: "0 0 14px 0",
    fontSize: "11px",
    color: "#666",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    borderBottom: "1px solid #2a2a2a",
    paddingBottom: "10px",
  },
  tabla: {
    width: "100%",
    borderCollapse: "collapse",
  },
  statCard: {
    backgroundColor: "#1a1a1a",
    border: "1px solid",
    borderRadius: "12px",
    padding: "16px 20px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    minWidth: "120px",
  },
  statLabel: {
    fontSize: "11px",
    color: "#666",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  statNum: {
    fontSize: "32px",
    fontWeight: "600",
    lineHeight: 1,
  },
  centro: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
    color: "white",
    gap: "16px",
  },
  spinner: {
    width: "32px",
    height: "32px",
    border: "3px solid #333",
    borderTop: "3px solid #7ab3f0",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
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

export default ResumenPage;