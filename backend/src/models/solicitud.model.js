const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Solicitud = sequelize.define('Solicitud', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  equipoId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fechaRetiro: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fechaDevolucion: {
    type: DataTypes.STRING,
    allowNull: false
  },
  motivo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  estado: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pendiente',
    validate: {
      isIn: [['pendiente', 'aprobada', 'rechazada', 'cancelada', 'devuelta']]
    }
  },
  autorizadoPor: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'solicitudes',
  timestamps: false
});

module.exports = Solicitud;