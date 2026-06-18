import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { solicitudesService } from "../services/solicitudes.service.js";
import { historialService } from "../services/historial.service.js";
import EstadoBadge from "../componentes/EstadoBadge";
import ErrorMessage from "../componentes/ErrorMessage";

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

function formatFecha(str) {
  if (!str) return "—";
  const d = new Date(str);
  return isNaN(d) ? str : d.toLocaleDateString("es-AR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

function formatFechaHora(str) {
  if (!str) return "—";
  const d = new Date(str);
  return isNaN(d) ? str : d.toLocaleString("es-AR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const SolicitudDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [solicitud, setSolicitud]         = useState(null);
  const [historial, setHistorial]         = useState([]);
  const [loadingSol, setLoadingSol]       = useState(true);
  const [loadingHist, setLoadingHist]     = useState(true);
  const [error, setError]                 = useState(null);
  const [accionError, setAccionError]     = useState(null);
  const [accionLoading, setAccionLoading] = useState(null);

  const cargarSolicitud = useCallback(async () => {
    setLoadingSol(true);
    setError(null);
    try {
      const data = await solicitudesService.getById(id);
      setSolicitud(data);
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo cargar la solicitud.");
    } finally {
      setLoadingSol(false);
    }
  }, [id]);

  const cargarHistorial = useCallback(async () => {
    setLoadingHist(true);
    try {
      const response = await historialService.getBySolicitudId(id);
      setHistorial(response.data || []);
    } catch {
      setHistorial([]);
    } finally {
      setLoadingHist(false);
    }
  }, [id]);

  useEffect(() => {
    cargarSolicitud();
    cargarHistorial();
  }, [cargarSolicitud, cargarHistorial]);

  const ejecutarAccion = async (nombre, fn) => {
    setAccionError(null);
    setAccionLoading(nombre);
    try {
      await fn(id);
      await Promise.all([cargarSolicitud(), cargarHistorial()]);
    } catch (err) {
      setAccionError({
        message: err.response?.data?.error || `Error al intentar ${nombre} la solicitud.`,
        status: err.response?.status || 500,
      });
    } finally {
      setAccionLoading(null);
    }
  };

  const esAdmin       = usuario?.rol === "admin" || usuario?.rol === "encargado";
  const esPropietario = solicitud?.usuarioId === usuario?.id;
  const estado        = solicitud?.estado;

  const puedeAprobar  = esAdmin && estado === "pendiente";
  const puedeRechazar = esAdmin && estado === "pendiente";
  const puedeDevolver = esAdmin && estado === "aprobada";
  const puedeCancelar = (esPropietario || esAdmin) && ["pendiente", "aprobada"].includes(estado);
  const puedeEditar   = (esPropietario || esAdmin) && estado === "pendiente";

  if (loadingSol) {
    return (
      <div style={styles.centro}>
        <div style={styles.spinner} />
        <p style={{ color: "#666", fontSize: "14px" }}>Cargando solicitud...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.centro}>
        <ErrorMessage error={{ message: error, status: 404 }} onRetry={cargarSolicitud} />
        <button onClick={() => navigate("/solicitudes")} style={boton("#333", "#aaa", "#444")}>
          ← Volver al listado
        </button>
      </div>
    );
  }

  if (!solicitud) {
    return (
      <div style={styles.centro}>
        <p style={{ color: "#aaa" }}>No se encontró la solicitud #{id}.</p>
        <button onClick={() => navigate("/solicitudes")} style={boton("#333", "#aaa", "#444")}>
          ← Volver al listado
        </button>
      </div>
    );
  }

  return (
    <div style={styles.pagina}>

      {/* Encabezado */}
      <div style={styles.encabezado}>
        <button onClick={() => navigate("/solicitudes")} style={boton("#1a1a1a", "#aaa", "#333")}>
          ← Volver
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "500", color: "white" }}>
            Solicitud #{solicitud.id}
          </h2>
          <EstadoBadge estado={solicitud.estado} />
        </div>
      </div>

      {/* Error de acción */}
      {accionError && <ErrorMessage error={accionError} />}

      {/* Datos */}
      <div style={styles.card}>
        <h3 style={styles.cardTitulo}>Información</h3>
        <table style={styles.tabla}>
          <tbody>
            <Fila label="Equipo"              valor={solicitud.Equipo?.nombre || solicitud.equipoId} />
            <Fila label="Categoría"           valor={solicitud.Equipo?.categoria || "—"} />
            <Fila label="Ubicación"           valor={solicitud.Equipo?.ubicacion || "—"} />
            <Fila label="Solicitante"         valor={solicitud.solicitante?.nombre || solicitud.usuarioId} />
            <Fila label="Fecha de retiro"     valor={formatFecha(solicitud.fechaRetiro)} />
            <Fila label="Fecha de devolución" valor={formatFecha(solicitud.fechaDevolucion)} />
            <Fila label="Motivo"              valor={solicitud.motivo} />
            {solicitud.autorizadoPor && (
              <Fila label="Autorizado por" valor={solicitud.autorizante?.nombre || solicitud.autorizadoPor} />
            )}
          </tbody>
        </table>
      </div>

      {/* Acciones */}
      {(puedeAprobar || puedeRechazar || puedeCancelar || puedeDevolver || puedeEditar) && (
        <div style={styles.card}>
          <h3 style={styles.cardTitulo}>Acciones</h3>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {puedeEditar && (
              <button style={boton("#1a1a1a", "#aaa", "#444")}
                onClick={() => navigate(`/solicitudes/${id}/editar`)}>
                ✏️ Editar
              </button>
            )}
            {puedeAprobar && (
              <button style={boton("#002a10", "#4dff91", "#166534")}
                disabled={accionLoading === "aprobar"}
                onClick={() => ejecutarAccion("aprobar", solicitudesService.aprobar.bind(solicitudesService))}>
                {accionLoading === "aprobar" ? "Aprobando..." : "✔ Aprobar"}
              </button>
            )}
            {puedeRechazar && (
              <button style={boton("#2a0000", "#ff6b6b", "#7f1d1d")}
                disabled={accionLoading === "rechazar"}
                onClick={() => ejecutarAccion("rechazar", solicitudesService.rechazar.bind(solicitudesService))}>
                {accionLoading === "rechazar" ? "Rechazando..." : "✖ Rechazar"}
              </button>
            )}
            {puedeDevolver && (
              <button style={boton("#001a2a", "#7ab3f0", "#1e3a5f")}
                disabled={accionLoading === "devolver"}
                onClick={() => ejecutarAccion("devolver", solicitudesService.devolver.bind(solicitudesService))}>
                {accionLoading === "devolver" ? "Registrando..." : "↩ Marcar devolución"}
              </button>
            )}
            {puedeCancelar && (
              <button style={boton("#2a0000", "#ff6b6b", "#7f1d1d")}
                disabled={accionLoading === "cancelar"}
                onClick={() => ejecutarAccion("cancelar", solicitudesService.cancelar.bind(solicitudesService))}>
                {accionLoading === "cancelar" ? "Cancelando..." : "🗑 Cancelar"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Historial */}
      <div style={styles.card}>
        <h3 style={styles.cardTitulo}>Historial de cambios</h3>
        {loadingHist ? (
          <p style={{ color: "#666", fontSize: "13px", fontStyle: "italic" }}>Cargando historial...</p>
        ) : historial.length === 0 ? (
          <p style={{ color: "#666", fontSize: "13px", fontStyle: "italic" }}>Sin registros todavía.</p>
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

const Fila = ({ label, valor }) => (
  <tr style={{ borderBottom: "1px solid #2a2a2a" }}>
    <td style={{ padding: "10px 12px", color: "#666", fontSize: "13px", whiteSpace: "nowrap", width: "160px" }}>{label}</td>
    <td style={{ padding: "10px 12px", color: "white", fontSize: "14px" }}>{valor ?? "—"}</td>
  </tr>
);

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
  tabla: {
    width: "100%",
    borderCollapse: "collapse",
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

export default SolicitudDetalle;
