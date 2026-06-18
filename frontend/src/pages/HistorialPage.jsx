import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { historialService } from "../services/historial.service.js";

const etiquetaAccion = {
  creacion:    "Creación",
  edicion:     "Edición",
  aprobacion:  "Aprobación",
  rechazo:     "Rechazo",
  cancelacion: "Cancelación",
  devolucion:  "Devolución",
};

const colorDot = {
  creacion:    "#7ab3f0",
  edicion:     "#fbbf24",
  aprobacion:  "#4dff91",
  rechazo:     "#ff4d4d",
  cancelacion: "#888",
  devolucion:  "#a78bfa",
};

function formatFechaHora(str) {
  if (!str) return "—";
  const d = new Date(str);
  return isNaN(d) ? str : d.toLocaleString("es-AR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const HistorialPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarHistorial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const cargarHistorial = async () => {
    try {
      setLoading(true);
      const response = await historialService.getBySolicitudId(id);
      setHistorial(response.data || []);
      setError(null);
    } catch (err) {
      console.error("Error al cargar historial:", err);
      setError(err.response?.data?.message || "No se pudo cargar el historial.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.centro}>
        <div style={styles.spinner} />
        <p style={{ color: "#666", fontSize: "14px" }}>Cargando historial...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.centro}>
        <p style={{ color: "#ff4d4d" }}>{error}</p>
        <button onClick={() => navigate(-1)} style={boton("#1a1a1a", "#aaa", "#333")}>
          ← Volver
        </button>
      </div>
    );
  }

  return (
    <div style={styles.pagina}>

      {/* Encabezado */}
      <div style={styles.encabezado}>
        <button onClick={() => navigate(-1)} style={boton("#1a1a1a", "#aaa", "#333")}>
          ← Volver
        </button>
        <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "500", color: "white" }}>
          Historial de Solicitud #{id}
        </h2>
      </div>

      {/* Historial */}
      <div style={styles.card}>
        <h3 style={styles.cardTitulo}>Historial de cambios</h3>

        {historial.length === 0 ? (
          <p style={{ color: "#666", fontSize: "13px", fontStyle: "italic" }}>
            No hay entradas de historial para esta solicitud.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {historial.map((entrada, idx) => (
              <div key={entrada.id} style={{ display: "flex", gap: "14px", paddingBottom: "20px" }}>

                {/* Línea de tiempo */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "3px" }}>
                  <div style={{
                    width: "10px", height: "10px", borderRadius: "50%",
                    background: colorDot[entrada.accion] || "#555",
                    flexShrink: 0,
                  }} />
                  {idx < historial.length - 1 && (
                    <div style={{ flex: 1, width: "2px", background: "#2a2a2a", marginTop: "4px", minHeight: "24px" }} />
                  )}
                </div>

                {/* Contenido */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "2px" }}>
                    <span style={{ fontSize: "14px", fontWeight: "500", color: "white" }}>
                      {etiquetaAccion[entrada.accion] ?? entrada.accion}
                    </span>
                    <span style={{ fontSize: "12px", color: "#555" }}>
                      {formatFechaHora(entrada.fechaHora)}
                    </span>
                  </div>
                  <p style={{ margin: "0 0 6px", fontSize: "12px", color: "#666" }}>
                    por <span style={{ color: "#aaa" }}>{entrada.Usuario?.nombre || entrada.usuarioId}</span>
                  </p>
                  {(entrada.valorAnterior || entrada.valorNuevo) && (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {entrada.valorAnterior && (
                        <span style={{ background: "#2a0000", color: "#ff4d4d", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontFamily: "monospace", textDecoration: "line-through" }}>
                          {entrada.valorAnterior}
                        </span>
                      )}
                      {entrada.valorAnterior && entrada.valorNuevo && (
                        <span style={{ color: "#555", fontSize: "12px" }}>→</span>
                      )}
                      {entrada.valorNuevo && (
                        <span style={{ background: "#002a10", color: "#4dff91", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontFamily: "monospace" }}>
                          {entrada.valorNuevo}
                        </span>
                      )}
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

const styles = {
  pagina: {
    padding: "24px 20px",
    color: "white",
    maxWidth: "760px",
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

export default HistorialPage;