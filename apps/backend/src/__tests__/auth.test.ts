import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../app";
import { signAdminToken } from "../utils/jwt";

vi.mock("../lib/prisma", () => ({
  prisma: {
    admin: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("../utils/password", () => ({
  hashPassword: vi.fn(),
  comparePassword: vi.fn(),
}));

import { prisma } from "../lib/prisma";
import { comparePassword } from "../utils/password";

const mockFindUnique = vi.mocked(prisma.admin.findUnique);
const mockCompare = vi.mocked(comparePassword);

const adminFixture = {
  id: "admin-uuid-1",
  correo: "admin@empresa.com",
  nombre: "Admin Test",
  rol: "ADMIN" as const,
  passwordHash: "$2b$12$hashedpassword",
  createdAt: new Date(),
};

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 on invalid body (correo sin formato)", async () => {
    const res = await request(createApp())
      .post("/api/auth/login")
      .send({ correo: "no-es-correo", password: "abc" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Datos inválidos");
  });

  it("returns 400 when body is empty", async () => {
    const res = await request(createApp())
      .post("/api/auth/login")
      .send({});

    expect(res.status).toBe(400);
  });

  it("returns 401 when admin does not exist", async () => {
    mockFindUnique.mockResolvedValueOnce(null);

    const res = await request(createApp())
      .post("/api/auth/login")
      .send({ correo: "noexiste@test.com", password: "secret" });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Correo o contraseña incorrectos");
  });

  it("returns 401 when password does not match", async () => {
    mockFindUnique.mockResolvedValueOnce(adminFixture);
    mockCompare.mockResolvedValueOnce(false);

    const res = await request(createApp())
      .post("/api/auth/login")
      .send({ correo: adminFixture.correo, password: "wrong" });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Correo o contraseña incorrectos");
  });

  it("returns token and admin data on valid credentials", async () => {
    mockFindUnique.mockResolvedValueOnce(adminFixture);
    mockCompare.mockResolvedValueOnce(true);

    const res = await request(createApp())
      .post("/api/auth/login")
      .send({ correo: adminFixture.correo, password: "correcta" });

    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe("string");
    expect(res.body.admin.correo).toBe(adminFixture.correo);
    expect(res.body.admin).not.toHaveProperty("passwordHash");
  });
});

describe("GET /api/auth/me", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 without Authorization header", async () => {
    const res = await request(createApp()).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("returns 401 with invalid token", async () => {
    const res = await request(createApp())
      .get("/api/auth/me")
      .set("Authorization", "Bearer token-invalido");

    expect(res.status).toBe(401);
  });

  it("returns admin data with valid token", async () => {
    const token = signAdminToken({
      adminId: adminFixture.id,
      correo: adminFixture.correo,
      rol: adminFixture.rol,
    });

    mockFindUnique.mockResolvedValueOnce({
      id: adminFixture.id,
      correo: adminFixture.correo,
      nombre: adminFixture.nombre,
      rol: adminFixture.rol,
      passwordHash: adminFixture.passwordHash,
      createdAt: adminFixture.createdAt,
    });

    const res = await request(createApp())
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.admin.correo).toBe(adminFixture.correo);
  });

  it("returns 404 if admin no longer exists in DB", async () => {
    const token = signAdminToken({
      adminId: "deleted-admin-id",
      correo: "old@test.com",
      rol: "ADMIN",
    });

    mockFindUnique.mockResolvedValueOnce(null);

    const res = await request(createApp())
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});
