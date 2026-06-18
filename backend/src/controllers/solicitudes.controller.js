const SolicitudesService = require('../services/solicitudes.service');

const SolicitudesController = {
  async listar(req, res, next) {
    try {
      const resultado = await SolicitudesService.getAll(req.query);
      return res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  },

  async obtenerPorId(req, res, next) {
    try {
      const solicitud = await SolicitudesService.getById(req.params.id);
      return res.status(200).json(solicitud);
    } catch (error) {
      next(error);
    }
  },

  async crear(req, res, next) {
    try {
      const usuarioId = req.usuario.id; 
      const nueva = await SolicitudesService.create(req.body, usuarioId);
      return res.status(201).json(nueva);
    } catch (error) {
      next(error);
    }
  },

  async editar(req, res, next) {
    try {
      const usuarioId = req.usuario.id;
      const usuarioRol = req.usuario.rol;
      const editada = await SolicitudesService.update(req.params.id, req.body, usuarioId, usuarioRol);
      return res.status(200).json(editada);
    } catch (error) {
      next(error);
    }
  },

  async cancelar(req, res, next) {
    try {
      const usuarioId = req.usuario.id;
      const usuarioRol = req.usuario.rol;
      const editada = await SolicitudesService.cambiarEstado(req.params.id, 'cancelada', usuarioId, usuarioRol);
      return res.status(200).json(editada);
    } catch (error) {
      next(error);
    }
  },

  async aprobar(req, res, next) {
    try {
      const usuarioId = req.usuario.id;
      const usuarioRol = req.usuario.rol;
      const editada = await SolicitudesService.cambiarEstado(req.params.id, 'aprobada', usuarioId, usuarioRol);
      return res.status(200).json(editada);
    } catch (error) {
      next(error);
    }
  },

  async rechazar(req, res, next) {
    try {
      const usuarioId = req.usuario.id;
      const usuarioRol = req.usuario.rol;
      const editada = await SolicitudesService.cambiarEstado(req.params.id, 'rechazada', usuarioId, usuarioRol);
      return res.status(200).json(editada);
    } catch (error) {
      next(error);
    }
  },

  async devolver(req, res, next) {
    try {
      const usuarioId = req.usuario.id;
      const usuarioRol = req.usuario.rol;
      const editada = await SolicitudesService.cambiarEstado(req.params.id, 'devuelta', usuarioId, usuarioRol);
      return res.status(200).json(editada);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = SolicitudesController;