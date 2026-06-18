const HistorialService = require("../services/historial.service");

const HistorialController = {
  async obtenerPorSolicitud(req, res, next) {
    try {
      const historial = await HistorialService.getBySolicitudId(req.params.id);
      return res.status(200).json({ data: historial });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = HistorialController;