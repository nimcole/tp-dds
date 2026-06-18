const ResumenService = require("../services/resumen.service");

const ResumenController = {
  async obtenerResumen(req, res, next) {
    try {
      const resumen = await ResumenService.getResumen();
      return res.status(200).json(resumen);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = ResumenController;