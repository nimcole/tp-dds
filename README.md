# Sistema de Gestión de Solicitudes de Equipamiento

Aplicación full stack para controlar solicitudes de préstamo de equipos. Permite pedir equipos, validar disponibilidad y gestionar autorizaciones según el rol del usuario.

**Stack:** Node.js + Express + Sequelize + SQLite (backend) · React + Vite + Axios (frontend)

---

## Cómo ejecutar el proyecto

### Backend

```bash
cd backend
npm install
npm run dev
```

Corre en `http://localhost:3000`.

Para cargar los datos de prueba iniciales (8 equipos, 4 usuarios, 12 solicitudes):

```bash
node src/seed/seedData.js
```

> ⚠️ El seed usa `sequelize.sync({ force: true })`, lo que **resetea la base de datos** cada vez que se ejecuta.

Variables de entorno (archivo `.env` en `/backend`):

```
PORT=3000
JWT_SECRET=clave_secreta_dds_2026
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Corre en `http://localhost:5173`. Si el backend usa un puerto distinto, cambiar `baseURL` en `frontend/src/services/axios.js`.

---

## Usuarios de prueba

| Rol | Email | Contraseña |
|---|---|---|
| admin | admin@test.com | 1234 |
| usuario | usuario@test.com | 1234 |

Usuarios adicionales del seed:

| Rol | Email | Contraseña |
|---|---|---|
| admin | admin@dds.com | 1234 |
| encargado | encargado@dds.com | 1234 |
| usuario | ana@dds.com | 1234 |
| usuario | bruno@dds.com | 1234 |

Las contraseñas están hasheadas con bcrypt (`bcrypt.hash('1234', 10)`).

---

## Endpoints del backend

Todas las rutas excepto `/api/auth/*` requieren `Authorization: Bearer <token>`.

### Autenticación

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Registrar nuevo usuario | No |
| `POST` | `/api/auth/login` | Iniciar sesión, devuelve JWT | No |

### Solicitudes

| Método | Ruta | Descripción | Roles |
|---|---|---|---|
| `GET` | `/api/solicitudes` | Listar solicitudes (paginado, filtros, orden) | Todos |
| `GET` | `/api/solicitudes/:id` | Detalle de una solicitud | Todos |
| `POST` | `/api/solicitudes` | Crear nueva solicitud | Todos |
| `PUT` | `/api/solicitudes/:id` | Editar fechas o motivo (solo si pendiente) | Propietario / admin / encargado |
| `PATCH` | `/api/solicitudes/:id/aprobar` | Aprobar solicitud | admin / encargado |
| `PATCH` | `/api/solicitudes/:id/rechazar` | Rechazar solicitud | admin / encargado |
| `PATCH` | `/api/solicitudes/:id/devolver` | Marcar devolución | admin / encargado |
| `PATCH` | `/api/solicitudes/:id/cancelar` | Cancelar solicitud | Propietario / admin / encargado |

Parámetros disponibles en `GET /api/solicitudes`:

```
?estado=pendiente
&equipoId=1
&desde=2026-06-01
&hasta=2026-06-30
&page=1
&limit=10
&sortBy=id
&order=asc
```

### Equipos

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| `GET` | `/api/equipos` | Listar todos los equipos | No |
| `GET` | `/api/equipos/:id` | Detalle de un equipo | No |

### Historial y Resumen

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| `GET` | `/api/historial/solicitud/:id` | Historial de cambios de una solicitud | Sí |
| `GET` | `/api/resumen` | Panel de estadísticas | admin / encargado |

---

## Rutas del frontend

| Ruta | Componente | Acceso |
|---|---|---|
| `/login` | `LoginPage` | Público |
| `/register` | `RegisterPage` | Público |
| `/solicitudes` | `SolicitudesList` | Autenticado |
| `/solicitudes/:id` | `DetalleSolicitud` | Autenticado |
| `/historial/:id` | `HistorialPage` | Autenticado |
| `/resumen` | `ResumenPage` | admin / encargado |
| `*` | `NotFoundPage` | — |

Las rutas protegidas redirigen a `/login` si no hay sesión activa. Las rutas con restricción de rol redirigen a `/solicitudes`.

---

## Disponibilidad del equipo y autorización de préstamos

### ¿Cuándo un equipo está disponible?

Un equipo puede recibir una nueva solicitud si cumple **ambas** condiciones:

1. Su campo `estado` es `disponible` (no `prestado`, `mantenimiento` ni `baja`).
2. No tiene ninguna solicitud en estado `aprobada` con fechas superpuestas al período solicitado.

Esta validación se realiza **en el servicio del backend** (`solicitudes.service.js`) y no puede evitarse desde el frontend.

### Cambio automático de estado del equipo

- Al **aprobar** una solicitud → el equipo pasa a `prestado`.
- Al **devolver** una solicitud (o al **cancelar** una que estaba aprobada) → el equipo vuelve a `disponible`.

### Equipos que requieren autorización

El campo `requiereAutorizacion` del equipo indica si necesita aprobación especial. En todos los casos, solo un usuario con rol `admin` o `encargado` puede aprobar solicitudes. Un usuario común puede crear la solicitud, pero no aprobarla.

### Validaciones de negocio aplicadas

- `fechaRetiro` debe ser anterior a `fechaDevolucion` (400).
- El equipo debe existir (400).
- El equipo debe estar en estado `disponible` (400).
- No debe haber otra solicitud aprobada con fechas superpuestas (400).
- Al editar, si se cambian fechas, se re-valida la disponibilidad.

---

## JWT, roles y permisos

### Flujo de autenticación

1. El usuario hace `POST /api/auth/login` con email y contraseña.
2. El backend valida credenciales y devuelve un JWT firmado.
3. El frontend guarda el token en `localStorage` y lo incluye en cada request como `Authorization: Bearer <token>`.
4. El middleware `auth.middleware.js` verifica y decodifica el token en cada ruta protegida, inyectando `req.usuario` con `{ id, nombre, email, rol }`.

El JWT **no contiene** contraseña ni datos sensibles.

### Roles disponibles

| Rol | Descripción |
|---|---|
| `usuario` | Puede crear solicitudes, ver las propias y cancelarlas |
| `encargado` | Puede ver todas las solicitudes, aprobar, rechazar y marcar devolución |
| `admin` | Igual que encargado, más acceso al panel de resumen |

### Respuestas de error por permisos

- **401** — No se envió token o el token es inválido/expirado.
- **403** — El usuario está autenticado pero no tiene permisos para la acción (ej: un `usuario` intenta aprobar).

### Máquina de estados de una solicitud

```
pendiente ──→ aprobada ──→ devuelta
          ↘ rechazada
pendiente o aprobada ──→ cancelada
```

Transiciones no permitidas devuelven **400** con mensaje descriptivo.

---

## Pruebas automatizadas

El backend incluye pruebas con **Jest** y **Supertest**.

```bash
cd backend
npm test
```

Otros comandos:

```bash
npm run test:watch     # modo watch
npm run test:coverage  # con reporte de cobertura
```

### Casos cubiertos

- Login correcto e inválido
- Listado de solicitudes con y sin filtros
- Detalle de solicitud existente e inexistente
- Creación válida de una solicitud
- Creación inválida por fechas inconsistentes
- Creación inválida por equipo no disponible o superposición de fechas
- Acceso sin JWT a una ruta protegida → 401
- Acceso con JWT de usuario a una acción solo de admin/encargado → 403
- Devolución inválida de una solicitud no aprobada
- Transición de estado no permitida (ej: aprobar una solicitud cancelada)

---

## Limitaciones conocidas

- **Filtro por categoría** en el listado de solicitudes no está implementado en el backend (el endpoint acepta `equipoId` pero no `categoria` directamente sobre solicitudes; se puede filtrar por equipo y luego por categoría del equipo).
- **El frontend no implementa filtros avanzados** en `SolicitudesList` (estado, fechas, paginación avanzada); los parámetros existen en el backend pero la UI solo usa page y limit.
- **La pantalla de alta/edición** (`SolicitudForm`) permite ingresar el `equipoId` manualmente como número en lugar de seleccionarlo de un listado desplegable de equipos disponibles.
- **Préstamos vencidos**: el backend los detecta comparando `fechaDevolucion` con la fecha actual cuando el estado sigue `aprobada`, pero no hay un proceso automático que cambie su estado; se muestran en el resumen como vencidos.
- **El seed resetea la base de datos** (`force: true`). No ejecutarlo en producción o con datos reales.
- **Sin refresh token**: al vencer el JWT el usuario debe volver a loguearse manualmente.
