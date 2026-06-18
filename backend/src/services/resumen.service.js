const { Solicitud } = require("../models");
const { fn, col } = require("sequelize");

const ResumenService = {
  async getResumen() {
    const total = await Solicitud.count();

    const estadosRaw = await Solicitud.findAll({
      attributes: ["estado", [fn("COUNT", col("estado")), "cantidad"]],
      group: ["estado"]
    });

    const porEstado = estadosRaw.map((item) => ({
      estado: item.estado,
      cantidad: parseInt(item.dataValues.cantidad, 10)
    }));

    const equiposRaw = await Solicitud.findAll({
      attributes: ["equipoId", [fn("COUNT", col("equipoId")), "cantidad"]],
      group: ["equipoId"]
    });

    const porEquipo = equiposRaw.map((item) => ({
      equipoId: item.equipoId,
      cantidad: parseInt(item.dataValues.cantidad, 10)
    }));

    const ultimasSolicitudes = await Solicitud.findAll({
      limit: 5,
      order: [["id", "DESC"]],
      attributes: ["id", "equipoId", "usuarioId", "fechaRetiro", "fechaDevolucion", "estado"]
    });

    return {
      total,
      porEstado,
      porEquipo,
      ultimasSolicitudes
    };
  }
};

module.exports = ResumenService;