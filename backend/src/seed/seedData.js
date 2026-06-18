const bcrypt = require('bcrypt');
const { sequelize, Usuario, Equipo, Solicitud } = require('../models');

async function seed() {
  await sequelize.sync({ force: true });
  console.log('📦 Tablas creadas');

  const usuarios = await Usuario.bulkCreate([
    { nombre: 'Admin General',    email: 'admin@dds.com',      passwordHash: await bcrypt.hash('1234', 10), rol: 'admin',     activo: true },
    { nombre: 'Carlos Encargado', email: 'encargado@dds.com',  passwordHash: await bcrypt.hash('1234', 10), rol: 'encargado', activo: true },
    { nombre: 'Ana Usuario',      email: 'ana@dds.com',        passwordHash: await bcrypt.hash('1234', 10), rol: 'usuario',   activo: true },
    { nombre: 'Bruno Usuario',    email: 'bruno@dds.com',      passwordHash: await bcrypt.hash('1234', 10), rol: 'usuario',   activo: true },
  ]);
  console.log('👤 Usuarios creados');

  const equipos = await Equipo.bulkCreate([
    { codigoInventario: 'INV-2026-001', nombre: 'Notebook Dell 14',     categoria: 'notebook',   estado: 'disponible',    ubicacion: 'Lab A5', requiereAutorizacion: false },
    { codigoInventario: 'INV-2026-002', nombre: 'Notebook HP Pavilion', categoria: 'notebook',   estado: 'disponible',    ubicacion: 'Lab A5', requiereAutorizacion: false },
    { codigoInventario: 'INV-2026-003', nombre: 'Proyector Epson X3',   categoria: 'proyector',  estado: 'disponible',    ubicacion: 'Sala 2', requiereAutorizacion: true  },
    { codigoInventario: 'INV-2026-004', nombre: 'Proyector BenQ MH',    categoria: 'proyector',  estado: 'prestado',      ubicacion: 'Sala 1', requiereAutorizacion: true  },
    { codigoInventario: 'INV-2026-005', nombre: 'Cámara Canon EOS',     categoria: 'camara',     estado: 'disponible',    ubicacion: 'Depósito', requiereAutorizacion: true },
    { codigoInventario: 'INV-2026-006', nombre: 'Kit de red Cisco',     categoria: 'kit de red', estado: 'disponible',    ubicacion: 'Lab B2', requiereAutorizacion: true  },
    { codigoInventario: 'INV-2026-007', nombre: 'Tablet Samsung A8',    categoria: 'tablet',     estado: 'mantenimiento', ubicacion: 'Lab A5', requiereAutorizacion: false },
    { codigoInventario: 'INV-2026-008', nombre: 'Monitor LG 27"',       categoria: 'monitor',    estado: 'disponible',    ubicacion: 'Lab A5', requiereAutorizacion: false },
  ]);
  console.log('🖥️  Equipos creados');

  await Solicitud.bulkCreate([
    { equipoId: equipos[0].id, usuarioId: usuarios[2].id, fechaRetiro: '2026-06-18', fechaDevolucion: '2026-06-20', motivo: 'Práctica de laboratorio',  estado: 'pendiente',  autorizadoPor: null },
    { equipoId: equipos[7].id, usuarioId: usuarios[2].id, fechaRetiro: '2026-06-19', fechaDevolucion: '2026-06-21', motivo: 'Taller de diseño',          estado: 'pendiente',  autorizadoPor: null },
    { equipoId: equipos[1].id, usuarioId: usuarios[3].id, fechaRetiro: '2026-06-17', fechaDevolucion: '2026-06-19', motivo: 'Exposición oral',            estado: 'pendiente',  autorizadoPor: null },
    { equipoId: equipos[3].id, usuarioId: usuarios[2].id, fechaRetiro: '2026-06-05', fechaDevolucion: '2026-06-12', motivo: 'Clase magistral Sala 1',     estado: 'aprobada',   autorizadoPor: usuarios[0].id },
    { equipoId: equipos[0].id, usuarioId: usuarios[3].id, fechaRetiro: '2026-06-10', fechaDevolucion: '2026-06-11', motivo: 'Examen práctico',            estado: 'aprobada',   autorizadoPor: usuarios[1].id },
    { equipoId: equipos[2].id, usuarioId: usuarios[2].id, fechaRetiro: '2026-06-01', fechaDevolucion: '2026-06-03', motivo: 'Prueba de proyector',        estado: 'rechazada',  autorizadoPor: null },
    { equipoId: equipos[5].id, usuarioId: usuarios[3].id, fechaRetiro: '2026-06-02', fechaDevolucion: '2026-06-04', motivo: 'Configuración de red',       estado: 'rechazada',  autorizadoPor: null },
    { equipoId: equipos[1].id, usuarioId: usuarios[2].id, fechaRetiro: '2026-06-08', fechaDevolucion: '2026-06-09', motivo: 'Proyecto cancelado',         estado: 'cancelada',  autorizadoPor: null },
    { equipoId: equipos[7].id, usuarioId: usuarios[3].id, fechaRetiro: '2026-05-28', fechaDevolucion: '2026-05-30', motivo: 'Muestra final',              estado: 'devuelta',   autorizadoPor: usuarios[0].id },
    { equipoId: equipos[0].id, usuarioId: usuarios[2].id, fechaRetiro: '2026-05-20', fechaDevolucion: '2026-05-22', motivo: 'Práctica anterior',          estado: 'devuelta',   autorizadoPor: usuarios[1].id },
    { equipoId: equipos[1].id, usuarioId: usuarios[3].id, fechaRetiro: '2026-05-01', fechaDevolucion: '2026-05-10', motivo: 'Préstamo largo vencido',     estado: 'aprobada',   autorizadoPor: usuarios[0].id },
    { equipoId: equipos[4].id, usuarioId: usuarios[2].id, fechaRetiro: '2026-05-15', fechaDevolucion: '2026-05-20', motivo: 'Fotografía de proyecto',     estado: 'aprobada',   autorizadoPor: usuarios[1].id },
  ]);
  console.log('📋 Solicitudes creadas');

  console.log('✅ Semilla completada');
  await sequelize.close();
}

seed().catch(console.error);