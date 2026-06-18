const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const errorMiddleware = require('./middlewares/error.middleware');
const solicitudesRoutes = require('./routes/solicitudes.routes');
const equiposRoutes = require('./routes/equipos.routes');
const app = express();
const resumenRoutes = require('./routes/resumen.routes');
const historialRoutes = require('./routes/historial.routes');

app.use(cors());
app.use(express.json());
app.use('/api/resumen', resumenRoutes);
app.use('/api/historial', historialRoutes);

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/solicitudes', solicitudesRoutes);
app.use('/api/equipos', equiposRoutes);
// Middleware de errores — siempre al final
app.use(errorMiddleware);

module.exports = app;