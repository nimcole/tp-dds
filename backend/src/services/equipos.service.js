const { Equipo, Solicitud } = require('../models');

const EquiposService = {
  async getAll(filtros = {}) {
  const where = {};

  if (filtros.categoria) {
    where.categoria = filtros.categoria;
  }

  if (filtros.estado) {
    where.estado = filtros.estado;
  }

  return await Equipo.findAll({ where });
  },
  
  async getById(id) {
    const equipo = await Equipo.findByPk(id);

    if (!equipo) {
      const error = new Error('Equipo no encontrado');
      error.status = 404;
      throw error;
    }

    return equipo;
  },

  async verificarDisponibilidad(
    equipoId,
    fechaRetiro,
    fechaDevolucion
  ) {
    const equipo = await this.getById(equipoId);

    const inicioNueva = new Date(fechaRetiro);
    const finNueva = new Date(fechaDevolucion);

    if (equipo.estado !== 'disponible') {
      const error = new Error(
        `El equipo no está disponible. Estado actual: ${equipo.estado}`
      );
      error.status = 400;
      throw error;
    }

    const solicitudesAprobadas = await Solicitud.findAll({
      where: {
        equipoId,
        estado: 'aprobada'
      }
    });

    const conflicto = solicitudesAprobadas.some((s) => {
      const inicioExistente = new Date(s.fechaRetiro);
      const finExistente = new Date(s.fechaDevolucion);

      return (
        inicioNueva <= finExistente &&
        finNueva >= inicioExistente
      );
    });

    if (conflicto) {
      const error = new Error(
        'Existe una solicitud aprobada para ese período'
      );
      error.status = 400;
      throw error;
    }

    return true;
  },

  async marcarPrestado(equipoId) {
    const equipo = await this.getById(equipoId);

    equipo.estado = 'prestado';

    await equipo.save();

    return equipo;
  },

  async marcarDisponible(equipoId) {
    const equipo = await this.getById(equipoId);

    equipo.estado = 'disponible';

    await equipo.save();

    return equipo;
  }
};

module.exports = EquiposService;