const { Op } = require("sequelize");
const { Solicitud, Historial } = require("../models");

async function registrarHistorial({
  solicitudId,
  usuarioId,
  accion,
  valorAnterior = null,
  valorNuevo = null,
}) {
  return Historial.create({
    solicitudId,
    usuarioId,
    accion,
    fechaHora: new Date().toISOString(),
    valorAnterior,
    valorNuevo,
  });
}

const SolicitudesService = {
  async getAll({
    estado,
    equipoId,
    desde,
    hasta,
    page = 1,
    limit = 10,
    sortBy = "id",
    order = "asc",
  }) {
    const where = {};

    if (estado) where.estado = estado;
    if (equipoId) where.equipoId = equipoId;

    if (desde || hasta) {
      where.fechaRetiro = {};
      if (desde) where.fechaRetiro[Op.gte] = desde;
      if (hasta) where.fechaRetiro[Op.lte] = hasta;
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Solicitud.findAndCountAll({
      where,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      order: [[sortBy, order.toUpperCase()]],
    });

    return {
      total: count,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      data: rows,
    };
  },

  async getById(id) {
    const solicitud = await Solicitud.findByPk(id);
    if (!solicitud) {
      const error = new Error("Solicitud no encontrada");
      error.status = 404;
      throw error;
    }
    return solicitud;
  },

  async create(datosSolicitud, usuarioId) {
    if (
      new Date(datosSolicitud.fechaRetiro) >=
      new Date(datosSolicitud.fechaDevolucion)
    ) {
      const error = new Error(
        "La fecha de retiro debe ser anterior a la fecha de devolución.",
      );
      error.status = 400;
      throw error;
    }

    const { Equipo } = require("../models");
    const equipo = await Equipo.findByPk(datosSolicitud.equipoId);
    if (!equipo) {
      const error = new Error("El equipo no existe.");
      error.status = 400;
      throw error;
    }
    if (equipo.estado !== "disponible") {
      const error = new Error("El equipo no está disponible.");
      error.status = 400;
      throw error;
    }

    // Validar superposición con solicitudes aprobadas
    const superposicion = await Solicitud.findOne({
      where: {
        equipoId: datosSolicitud.equipoId,
        estado: "aprobada",
        fechaRetiro: { [Op.lt]: datosSolicitud.fechaDevolucion },
        fechaDevolucion: { [Op.gt]: datosSolicitud.fechaRetiro },
      },
    });
    if (superposicion) {
      const error = new Error(
        "El equipo ya tiene una solicitud aprobada en ese período.",
      );
      error.status = 400;
      throw error;
    }

    const nuevaSolicitud = await Solicitud.create({
      equipoId: datosSolicitud.equipoId,
      usuarioId,
      fechaRetiro: datosSolicitud.fechaRetiro,
      fechaDevolucion: datosSolicitud.fechaDevolucion,
      motivo: datosSolicitud.motivo,
      estado: "pendiente",
    });

    await registrarHistorial({
      solicitudId: nuevaSolicitud.id,
      usuarioId,
      accion: "creacion",
      valorNuevo: JSON.stringify({
        equipoId: nuevaSolicitud.equipoId,
        fechaRetiro: nuevaSolicitud.fechaRetiro,
        fechaDevolucion: nuevaSolicitud.fechaDevolucion,
        motivo: nuevaSolicitud.motivo,
        estado: nuevaSolicitud.estado,
      }),
    });

    return nuevaSolicitud;
  },

  async update(id, datos, usuarioId, usuarioRol) {
    const solicitud = await this.getById(id);

    if (solicitud.estado !== "pendiente") {
      const error = new Error(
        "Solo se pueden editar solicitudes en estado pendiente.",
      );
      error.status = 400;
      throw error;
    }

    if (usuarioRol === "usuario" && solicitud.usuarioId !== usuarioId) {
      const error = new Error(
        "No tenés permisos para modificar una solicitud ajena.",
      );
      error.status = 403;
      throw error;
    }

    const valorAnterior = JSON.stringify({
      fechaRetiro: solicitud.fechaRetiro,
      fechaDevolucion: solicitud.fechaDevolucion,
      motivo: solicitud.motivo,
    });

    await solicitud.update({
      fechaRetiro: datos.fechaRetiro || solicitud.fechaRetiro,
      fechaDevolucion: datos.fechaDevolucion || solicitud.fechaDevolucion,
      motivo: datos.motivo || solicitud.motivo,
    });

    await registrarHistorial({
      solicitudId: solicitud.id,
      usuarioId,
      accion: "edicion",
      valorAnterior,
      valorNuevo: JSON.stringify({
        fechaRetiro: solicitud.fechaRetiro,
        fechaDevolucion: solicitud.fechaDevolucion,
        motivo: solicitud.motivo,
      }),
    });

    return solicitud;
  },

  async cambiarEstado(id, nuevoEstado, usuarioId, usuarioRol) {
    const solicitud = await this.getById(id);
    const estadoAnterior = solicitud.estado;

    if (nuevoEstado === "cancelada") {
      if (usuarioRol === "usuario" && solicitud.usuarioId !== usuarioId) {
        const error = new Error(
          "No podés cancelar una solicitud que no te pertenece.",
        );
        error.status = 403;
        throw error;
      }
      if (estadoAnterior !== "pendiente" && estadoAnterior !== "aprobada") {
        const error = new Error(
          `No se puede cancelar una solicitud en estado: ${estadoAnterior}`,
        );
        error.status = 400;
        throw error;
      }
    } else {
      if (usuarioRol !== "admin" && usuarioRol !== "encargado") {
        const error = new Error(
          "Acceso denegado: Se requieren permisos de administrador o encargado.",
        );
        error.status = 403;
        throw error;
      }

      if (nuevoEstado === "aprobada" || nuevoEstado === "rechazada") {
        if (estadoAnterior !== "pendiente") {
          const error = new Error(
            "Solo se pueden aprobar o rechazar solicitudes pendientes.",
          );
          error.status = 400;
          throw error;
        }
      } else if (nuevoEstado === "devuelta") {
        if (estadoAnterior !== "aprobada") {
          const error = new Error(
            "No se puede marcar como devuelta una solicitud que no fue aprobada.",
          );
          error.status = 400;
          throw error;
        }
      }
    }

    const updateData = { estado: nuevoEstado };
    if (nuevoEstado === "aprobada") {
      updateData.autorizadoPor = usuarioId;
    }

    await solicitud.update(updateData);
    // Cambiar estado del equipo cuando se aprueba o devuelve
    if (nuevoEstado === "aprobada") {
      const { Equipo } = require("../models");
      const equipo = await Equipo.findByPk(solicitud.equipoId);
      if (equipo) {
        equipo.estado = "prestado";
        await equipo.save();
      }
    }

    if (nuevoEstado === "devuelta") {
      const { Equipo } = require("../models");
      const equipo = await Equipo.findByPk(solicitud.equipoId);
      if (equipo) {
        equipo.estado = "disponible";
        await equipo.save();
      }
    }

    // ✅ AGREGAR ESTO:
    if (nuevoEstado === "rechazada") {
      const { Equipo } = require("../models");
      const equipo = await Equipo.findByPk(solicitud.equipoId);
      if (equipo) {
        equipo.estado = "disponible";
        await equipo.save();
  }
}

    await registrarHistorial({
      solicitudId: solicitud.id,
      usuarioId,
      accion:
        nuevoEstado === "aprobada"
          ? "aprobacion"
          : nuevoEstado === "rechazada"
            ? "rechazo"
            : nuevoEstado === "cancelada"
              ? "cancelacion"
              : "devolucion",
      valorAnterior: estadoAnterior,
      valorNuevo: nuevoEstado,
    });

    return solicitud;
  },
};

module.exports = SolicitudesService;
