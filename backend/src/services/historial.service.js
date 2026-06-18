const { Historial, Usuario } = require("../models");

const HistorialService = {
  async createEntry({ solicitudId, usuarioId, accion, valorAnterior = null, valorNuevo = null }) {
    return Historial.create({
      solicitudId,
      usuarioId,
      accion,
      fechaHora: new Date().toISOString(),
      valorAnterior,
      valorNuevo
    });
  },

  async getBySolicitudId(solicitudId) {
    return Historial.findAll({
      where: { solicitudId },
      include: [
        {
          model: Usuario,
          attributes: ["id", "nombre", "rol"]
        }
      ],
      order: [["id", "DESC"]]
    });
  }
};

module.exports = HistorialService;