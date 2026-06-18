const sequelize = require('../config/database');
const Usuario = require('./usuario.model');
const Equipo = require('./equipo.model');
const Solicitud = require('./solicitud.model');
const Historial = require('./historialSolicitud.model');

// Asociaciones
Usuario.hasMany(Solicitud, { foreignKey: 'usuarioId' });
Solicitud.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'solicitante' });

Usuario.hasMany(Solicitud, { foreignKey: 'autorizadoPor' });
Solicitud.belongsTo(Usuario, { foreignKey: 'autorizadoPor', as: 'autorizante' });

Equipo.hasMany(Solicitud, { foreignKey: 'equipoId' });
Solicitud.belongsTo(Equipo, { foreignKey: 'equipoId' });

Solicitud.hasMany(Historial, { foreignKey: 'solicitudId' });
Historial.belongsTo(Solicitud, { foreignKey: 'solicitudId' });

Usuario.hasMany(Historial, { foreignKey: 'usuarioId' });
Historial.belongsTo(Usuario, { foreignKey: 'usuarioId' });

module.exports = { sequelize, Usuario, Equipo, Solicitud, Historial };