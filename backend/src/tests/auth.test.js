/* Tests: login correcto e inválido */

const request = require("supertest");
const app = require("../../src/app");
const { setupDB, teardownDB } = require("./testHelpers");

beforeAll(async () => {
    process.env.JWT_SECRET = "text_secret";
    await setupDB();
});

afterAll(async () => {
    await teardownDB();
})


describe("POST /api/auth/login", () => {

  test("login correcto → 200 con token y datos del usuario", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@test.com", password: "1234" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body).toHaveProperty("usuario");
    expect(res.body.usuario.email).toBe("admin@test.com");
    expect(res.body.usuario.rol).toBe("admin");
    // El token no debe contener la contraseña
    expect(res.body.usuario).not.toHaveProperty("passwordHash");
  });

  test("login con contraseña incorrecta → 401", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@test.com", password: "mal_password" });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error");
  });

  test("login con email inexistente → 401", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "noexiste@test.com", password: "1234" });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error");
  });

  test("login sin body → error (no 200)", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({});

    expect(res.status).not.toBe(200);
  });

});
