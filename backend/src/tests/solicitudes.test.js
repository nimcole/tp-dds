/* Tests:
 *  - Listado con y sin filtros
 *  - Detalle existente e inexistente
 *  - Creación válida
 *  - Creación inválida por fechas inconsistentes
 *  - Creación inválida por equipo no disponible / superposición
 *  - Acceso sin JWT → 401
 *  - Acceso con rol insuficiente → 403
 *  - Devolución inválida (solicitud no aprobada)
 *  - Transición de estado no permitida
 */

const request = require("supertest");
const app = require("../../src/app");
const {
  setupDB,
  teardownDB,
  loginYObtenerToken,
  generarToken,
} = require("./testHelpers");
const { Solicitud, Equipo, Usuario } = require("../../src/models");

let tokenAdmin;
let tokenUsuario;
let solicitudPendienteId;
let solicitudAprobadaId;
let solicitudCanceladaId;
let equipoDisponibleId;
let equipoPrestadoId;
let usuarioId;

beforeAll(async () => {
  process.env.JWT_SECRET = "test_secret";
  await setupDB();

  // tokens reales via login
  tokenAdmin = await loginYObtenerToken("admin@test.com", "1234");
  tokenUsuario = await loginYObtenerToken("usuario@test.com", "1234");

  // Guardamos IDs para usarlos en los tests
  const pendiente = await Solicitud.findOne({ where: { estado: "pendiente" } });
  const aprobada = await Solicitud.findOne({ where: { estado: "aprobada" } });
  const cancelada = await Solicitud.findOne({ where: { estado: "cancelada" } });
  const disponible = await Equipo.findOne({ where: { estado: "disponible" } });
  const prestado = await Equipo.findOne({ where: { estado: "prestado" } });
  const usuario = await Usuario.findOne({
    where: { email: "usuario@test.com" },
  });

  solicitudPendienteId = pendiente.id;
  solicitudAprobadaId = aprobada.id;
  solicitudCanceladaId = cancelada.id;
  equipoDisponibleId = disponible.id;
  equipoPrestadoId = prestado.id;
  usuarioId = usuario.id;
});

afterAll(async () => {
  await teardownDB();
});

// Acceso sin JWT --------

describe("Acceso sin JWT", () => {
  test("GET /api/solicitudes sin token → 401", async () => {
    const res = await request(app).get("/api/solicitudes");
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error");
  });

  test("POST /api/solicitudes sin token → 401", async () => {
    const res = await request(app).post("/api/solicitudes").send({});
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error");
  });

  test("PATCH /api/solicitudes/:id/aprobar sin token → 401", async () => {
    const res = await request(app).patch(
      `/api/solicitudes/${solicitudPendienteId}/aprobar`,
    );
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error");
  });
});

// Listado ------------

describe("GET /api/solicitudes", () => {
  test("sin filtros → 200 con array paginado", async () => {
    const res = await request(app)
      .get("/api/solicitudes")
      .set("Authorization", `Bearer ${tokenAdmin}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body).toHaveProperty("total");
  });

  test("con filtro por estado=pendiente → solo devuelve pendientes", async () => {
    const res = await request(app)
      .get("/api/solicitudes?estado=pendiente")
      .set("Authorization", `Bearer ${tokenAdmin}`);

    expect(res.status).toBe(200);
    const todas = res.body.data || res.body;
    if (Array.isArray(todas) && todas.length > 0) {
      todas.forEach((s) => expect(s.estado).toBe("pendiente"));
    }
  });

  test("con paginación (page=1&limit=2) → respeta el limit", async () => {
    const res = await request(app)
      .get("/api/solicitudes?page=1&limit=2")
      .set("Authorization", `Bearer ${tokenAdmin}`);

    expect(res.status).toBe(200);
    const data = res.body.data || res.body;
    if (Array.isArray(data)) {
      expect(data.length).toBeLessThanOrEqual(2);
    }
  });
});

// Detalle ----------

describe("GET /api/solicitudes/:id", () => {
  test("id existente → 200 con la solicitud", async () => {
    const res = await request(app)
      .get(`/api/solicitudes/${solicitudPendienteId}`)
      .set("Authorization", `Bearer ${tokenAdmin}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id", solicitudPendienteId);
    expect(res.body).toHaveProperty("estado");
  });

  test("id inexistente → 404", async () => {
    const res = await request(app)
      .get("/api/solicitudes/999999")
      .set("Authorization", `Bearer ${tokenAdmin}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error");
  });
});

// Creación ---------

describe("POST /api/solicitudes", () => {
  test("creación válida → 201 con la nueva solicitud", async () => {
    const res = await request(app)
      .post("/api/solicitudes")
      .set("Authorization", `Bearer ${tokenUsuario}`)
      .send({
        equipoId: equipoDisponibleId,
        fechaRetiro: "2026-11-01",
        fechaDevolucion: "2026-11-05",
        motivo: "Test creación válida",
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.estado).toBe("pendiente");
  });

  test("fechas inconsistentes (retiro >= devolución) → 400", async () => {
    const res = await request(app)
      .post("/api/solicitudes")
      .set("Authorization", `Bearer ${tokenUsuario}`)
      .send({
        equipoId: equipoDisponibleId,
        fechaRetiro: "2026-11-10",
        fechaDevolucion: "2026-11-05", // anterior al retiro
        motivo: "Test fechas inválidas",
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  test("equipo no disponible (estado prestado) → 400", async () => {
    const res = await request(app)
      .post("/api/solicitudes")
      .set("Authorization", `Bearer ${tokenUsuario}`)
      .send({
        equipoId: equipoPrestadoId,
        fechaRetiro: "2026-11-01",
        fechaDevolucion: "2026-11-05",
        motivo: "Test equipo no disponible",
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  test("superposición con solicitud aprobada existente → 400", async () => {
    // La solicitud aprobada en la semilla es de 2026-08-01 a 2026-08-05
    const res = await request(app)
      .post("/api/solicitudes")
      .set("Authorization", `Bearer ${tokenUsuario}`)
      .send({
        equipoId: equipoDisponibleId,
        fechaRetiro: "2026-08-02", // superpone con la aprobada
        fechaDevolucion: "2026-08-04",
        motivo: "Test superposición",
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });
});

// Permisos por rol ----------

describe("Acciones que requieren rol admin/encargado", () => {
  test("usuario común intenta aprobar → 403", async () => {
    const res = await request(app)
      .patch(`/api/solicitudes/${solicitudPendienteId}/aprobar`)
      .set("Authorization", `Bearer ${tokenUsuario}`);

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty("error");
  });

  test("usuario común intenta rechazar → 403", async () => {
    const res = await request(app)
      .patch(`/api/solicitudes/${solicitudPendienteId}/rechazar`)
      .set("Authorization", `Bearer ${tokenUsuario}`);

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty("error");
  });

  test("admin puede aprobar solicitud pendiente → 200", async () => {
    // Creamos una solicitud fresca para no pisar la semilla
    const nueva = await request(app)
      .post("/api/solicitudes")
      .set("Authorization", `Bearer ${tokenUsuario}`)
      .send({
        equipoId: equipoDisponibleId,
        fechaRetiro: "2026-12-01",
        fechaDevolucion: "2026-12-05",
        motivo: "Para test de aprobación",
      });

    const res = await request(app)
      .patch(`/api/solicitudes/${nueva.body.id}/aprobar`)
      .set("Authorization", `Bearer ${tokenAdmin}`);

    expect(res.status).toBe(200);
    expect(res.body.estado).toBe("aprobada");
  });
});

// Transiciones de estado inválidas -------------
describe("Transiciones de estado no permitidas", () => {
  test("devolver una solicitud no aprobada → 400", async () => {
    // La solicitud pendiente no puede devolverse
    const res = await request(app)
      .patch(`/api/solicitudes/${solicitudPendienteId}/devolver`)
      .set("Authorization", `Bearer ${tokenAdmin}`);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  test("aprobar una solicitud cancelada → 400", async () => {
    const res = await request(app)
      .patch(`/api/solicitudes/${solicitudCanceladaId}/aprobar`)
      .set("Authorization", `Bearer ${tokenAdmin}`);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });
});
