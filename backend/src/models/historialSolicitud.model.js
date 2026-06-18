const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Historial = sequelize.define('Historial', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  solicitudId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  accion: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['creacion', 'edicion', 'aprobacion', 'rechazo', 'cancelacion', 'devolucion']]
    }
  },
  fechaHora: {
    type: DataTypes.STRING,
    allowNull: false
  },
  valorAnterior: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  valorNuevo: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'historial_solicitudes',
  timestamps: false
});

module.exports = Historial;