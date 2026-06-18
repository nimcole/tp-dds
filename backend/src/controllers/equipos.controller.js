const EquiposService = require('../services/equipos.service');

const EquiposController = {
  async getAll(req, res, next) {
    try {
      const equipos = await EquiposService.getAll();

      res.json(equipos);
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const equipo = await EquiposService.getById(
        req.params.id
      );

      res.json(equipo);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = EquiposController;