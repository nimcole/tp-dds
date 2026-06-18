import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { solicitudesService } from "../services/solicitudes.service.js";
import SolicitudForm from "./SolicitudForm.jsx";

const SolicitudesList = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    cargarSolicitudes(page, limit);
  }, [page, limit]);

  const cargarSolicitudes = async (pageActual = page, limitActual = limit) => {
    try {
      setLoading(true);
      const response = await solicitudesService.getAll({
        page: pageActual,
        limit: limitActual,
      });
      const datos = response.data || response;
      setSolicitudes(Array.isArray(datos) ? datos : datos.data || []);
      setTotal(datos.total || 0);
      setPage(datos.page || pageActual);
      setError(null);
    } catch (err) {
      console.error("Error al traer solicitudes:", err);
      setError("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (id, accion) => {
    try {
      setLoading(true);
      if (accion === "aprobar") await solicitudesService.aprobar(id);
      if (accion === "rechazar") await solicitudesService.rechazar(id);
      if (accion === "cancelar") await solicitudesService.cancelar(id);
      if (accion === "devolver") await solicitudesService.devolver(id);
      await cargarSolicitudes(1, limit);
    } catch (err) {
      console.error(`Error al ${accion}:`, err);
      alert(
        err.response?.data?.message ||
          `Error al intentar ${accion} la solicitud.`,
      );
      setLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  if (loading && solicitudes.length === 0) {
    return (
      <div style={{ padding: "20px", color: "white" }}>
        Cargando solicitudes...
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", color: "white" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "15px",
          flexWrap: "wrap",
        }}
      >
        <h2>Listado de Solicitudes</h2>
        {usuario && ["admin", "encargado"].includes(usuario.rol) && (
          <button
            onClick={() => navigate("/resumen")}
            style={{
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              padding: "10px 16px",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Ver resumen
          </button>
        )}
      </div>

      <SolicitudForm alCrearExito={() => cargarSolicitudes(1, limit)} />

      {error && (
        <div style={{ color: "red", marginBottom: "15px" }}>{error}</div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "10px",
          marginBottom: "15px",
          flexWrap: "wrap",
        }}
      >
        <div>
          Mostrando {solicitudes.length} de {total} solicitudes
        </div>
        <div>
          <label>
            Mostrar
            <select
              value={limit}
              onChange={(e) => {
                setLimit(parseInt(e.target.value, 10));
                setPage(1);
              }}
              style={{ marginLeft: "8px" }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
            resultados
          </label>
        </div>
      </div>

      <table
        border="1"
        cellPadding="10"
        style={{
          width: "100%",
          marginTop: "20px",
          borderCollapse: "collapse",
          textAlign: "left",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#333" }}>
            <th>ID</th>
            <th>Equipo ID</th>
            <th>Fecha Retiro</th>
            <th>Fecha Devolución</th>
            <th>Estado</th>
            <th>Motivo</th>
            <th>Acciones</th>
            <th>Historial</th>
          </tr>
        </thead>
        <tbody>
          {solicitudes.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: "center", padding: "16px" }}>
                No hay solicitudes cargadas en el sistema todavía.
              </td>
            </tr>
          ) : (
            solicitudes.map((sol) => (
              <tr key={sol.id}>
                <td>{sol.id}</td>
                <td>{sol.equipoId}</td>
                <td>{sol.fechaRetiro}</td>
                <td>{sol.fechaDevolucion}</td>
                <td>
                  <strong
                    style={{
                      color:
                        sol.estado === "aprobada"
                          ? "lightgreen"
                          : sol.estado === "pendiente"
                            ? "orange"
                            : sol.estado === "devuelta"
                              ? "lightblue"
                              : "gray",
                    }}
                  >
                    {sol.estado.toUpperCase()}
                  </strong>
                </td>
                <td>{sol.motivo}</td>
                <td>
                  {sol.estado === "pendiente" && (
                    <div
                      style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}
                    >
                      <button
                        onClick={() => cambiarEstado(sol.id, "aprobar")}
                        style={botonStyle("green")}
                      >
                        Aprobar
                      </button>
                      <button
                        onClick={() => cambiarEstado(sol.id, "rechazar")}
                        style={botonStyle("red")}
                      >
                        Rechazar
                      </button>
                      <button
                        onClick={() => cambiarEstado(sol.id, "cancelar")}
                        style={botonStyle("gray")}
                      >
                        Cancelar
                      </button>
                    </div>
                  )}

                  {sol.estado === "aprobada" && (
                    <div
                      style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}
                    >
                      <button
                        onClick={() => cambiarEstado(sol.id, "devolver")}
                        style={botonStyle("blue")}
                      >
                        Devolver
                      </button>
                      <button
                        onClick={() => cambiarEstado(sol.id, "cancelar")}
                        style={botonStyle("gray")}
                      >
                        Cancelar
                      </button>
                    </div>
                  )}

                  {["rechazada", "cancelada", "devuelta"].includes(
                    sol.estado,
                  ) && (
                    <span style={{ color: "gray", fontSize: "12px" }}>
                      Sin acciones disponibles
                    </span>
                  )}
                </td>
                <td>
                  <button
                    onClick={() => navigate(`/solicitudes/${sol.id}`)}
                    style={botonStyle("#6a5acd")}
                  >
                    Ver detalle
                  </button>
                </td>
                <td>
                  <button
                    onClick={() => navigate(`/historial/${sol.id}`)}
                    style={botonStyle("#6a5acd")}
                  >
                    Ver historial
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div
        style={{
          marginTop: "20px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page <= 1}
        >
          Anterior
        </button>
        <span>
          Página {page} de {totalPages}
        </span>
        <button
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page >= totalPages}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

const botonStyle = (background) => ({
  background,
  color: "white",
  border: "none",
  padding: "5px 10px",
  cursor: "pointer",
  borderRadius: "3px",
});

export default SolicitudesList;
