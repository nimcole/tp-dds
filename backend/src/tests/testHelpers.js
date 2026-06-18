const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const request = require("supertest");
const app = require("../../src/app");

const { sequelize, Usuario, Equipo, Solicitud } = require("../../src/models");

// Setup / teardown ---------------

async function setupDB() {
  await sequelize.sync({ force: true });
  await crearDatosSemilla();
}

async function teardownDB() {
  await sequelize.close();
}

// Semilla mínima para tests ------

async function crearDatosSemilla() {
  // Usuarios
  await Usuario.bulkCreate([
    {
      nombre: "Admin Test",
      email: "admin@test.com",
      passwordHash: await bcrypt.hash("1234", 10),
      rol: "admin",
      activo: true,
    },
    {
      nombre: "Usuario Test",
      email: "usuario@test.com",
      passwordHash: await bcrypt.hash("1234", 10),
      rol: "usuario",
      activo: true,
    },
  ]);

  // Equipos
  await Equipo.bulkCreate([
    {
      codigoInventario: "INV-TEST-001",
      nombre: "Notebook Test",
      categoria: "notebook",
      estado: "disponible",
      ubicacion: "Lab Test",
      requiereAutorizacion: false,
    },
    {
      codigoInventario: "INV-TEST-002",
      nombre: "Proyector Test",
      categoria: "proyector",
      estado: "disponible",
      ubicacion: "Sala Test",
      requiereAutorizacion: true,
    },
    {
      codigoInventario: "INV-TEST-003",
      nombre: "Equipo Prestado",
      categoria: "notebook",
      estado: "prestado",
      ubicacion: "Lab Test",
      requiereAutorizacion: false,
    },
  ]);

  // Solicitudes base
  const admin = await Usuario.findOne({ where: { email: "admin@test.com" } });
  const usuario = await Usuario.findOne({
    where: { email: "usuario@test.com" },
  });
  const equipo = await Equipo.findOne({
    where: { codigoInventario: "INV-TEST-001" },
  });

  await Solicitud.bulkCreate([
    {
      equipoId: equipo.id,
      usuarioId: usuario.id,
      fechaRetiro: "2026-07-01",
      fechaDevolucion: "2026-07-05",
      motivo: "Solicitud pendiente de prueba",
      estado: "pendiente",
    },
    {
      equipoId: equipo.id,
      usuarioId: usuario.id,
      fechaRetiro: "2026-08-01",
      fechaDevolucion: "2026-08-05",
      motivo: "Solicitud aprobada de prueba",
      estado: "aprobada",
      autorizadoPor: admin.id,
    },
    {
      equipoId: equipo.id,
      usuarioId: usuario.id,
      fechaRetiro: "2026-09-01",
      fechaDevolucion: "2026-09-05",
      motivo: "Solicitud cancelada de prueba",
      estado: "cancelada",
    },
  ]);
}

// Helpers de autenticación --------

async function loginYObtenerToken(email, password) {
  const res = await request(app)
    .post("/api/auth/login")
    .send({ email, password });
  return res.body.token;
}

function generarToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET || "test_secret", {
    expiresIn: "1h",
  });
}

module.exports = {setupDB, teardownDB, loginYObtenerToken, generarToken };

