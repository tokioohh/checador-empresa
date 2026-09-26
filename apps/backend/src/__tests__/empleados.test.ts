import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../app";
import { signAdminToken } from "../utils/jwt";
import { Prisma } from "../generated/prisma/client";

vi.mock("../lib/prisma", () => ({
  prisma: {
    empleado: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { prisma } from "../lib/prisma";

const mockEmpleado = vi.mocked(prisma.empleado);

const TOKEN = signAdminToken({
  adminId: "admin-1",
  correo: "admin@test.com",
  rol: "ADMIN",
});

const authHeader = { Authorization: `Bearer ${TOKEN}` };

const empleadoFixture = {
  id: "emp-uuid-1",
  nombre: "Juan Pérez",
  numeroEmpleado: "EMP001",
  correo: "juan@empresa.com",
  puesto: "Operador",
  horarioEntrada: "08:00",
  horarioSalida: "17:00",
  estado: "ACTIVO" as const,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe("GET /api/empleados — requiere auth", () => {
  it("returns 401 without token", async () => {
    const res = await request(createApp()).get("/api/empleados");
    expect(res.status).toBe(401);
  });
});

describe("GET /api/empleados", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns list of empleados", async () => {
    mockEmpleado.findMany.mockResolvedValueOnce([empleadoFixture]);

    const res = await request(createApp())
      .get("/api/empleados")
      .set(authHeader);

    expect(res.status).toBe(200);
    expect(res.body.empleados).toHaveLength(1);
    expect(res.body.empleados[0].nombre).toBe("Juan Pérez");
  });

  it("returns empty array when no empleados", async () => {
    mockEmpleado.findMany.mockResolvedValueOnce([]);

    const res = await request(createApp())
      .get("/api/empleados")
      .set(authHeader);

    expect(res.status).toBe(200);
    expect(res.body.empleados).toEqual([]);
  });
});

describe("GET /api/empleados/:id", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns the empleado when found", async () => {
    mockEmpleado.findUnique.mockResolvedValueOnce({
      ...empleadoFixture,
      dispositivos: [],
    });

    const res = await request(createApp())
      .get(`/api/empleados/${empleadoFixture.id}`)
      .set(authHeader);

    expect(res.status).toBe(200);
    expect(res.body.empleado.id).toBe(empleadoFixture.id);
  });

  it("returns 404 when not found", async () => {
    mockEmpleado.findUnique.mockResolvedValueOnce(null);

    const res = await request(createApp())
      .get("/api/empleados/id-inexistente")
      .set(authHeader);

    expect(res.status).toBe(404);
  });
});

describe("POST /api/empleados", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates and returns the new empleado with 201", async () => {
    mockEmpleado.create.mockResolvedValueOnce(empleadoFixture);

    const res = await request(createApp())
      .post("/api/empleados")
      .set(authHeader)
      .send({
        nombre: "Juan Pérez",
        numeroEmpleado: "EMP001",
        correo: "juan@empresa.com",
        puesto: "Operador",
        horarioEntrada: "08:00",
        horarioSalida: "17:00",
      });

    expect(res.status).toBe(201);
    expect(res.body.empleado.numeroEmpleado).toBe("EMP001");
  });

  it("returns 400 when nombre is missing", async () => {
    const res = await request(createApp())
      .post("/api/empleados")
      .set(authHeader)
      .send({ numeroEmpleado: "EMP002" });

    expect(res.status).toBe(400);
  });

  it("returns 400 when horarioEntrada has invalid format", async () => {
    const res = await request(createApp())
      .post("/api/empleados")
      .set(authHeader)
      .send({
        nombre: "Ana",
        numeroEmpleado: "EMP003",
        horarioEntrada: "8:00",
      });

    expect(res.status).toBe(400);
  });

  it("returns 409 on duplicate numeroEmpleado", async () => {
    const prismaError = new Prisma.PrismaClientKnownRequestError(
      "Unique constraint failed on the fields: (`numeroEmpleado`)",
      { code: "P2002", clientVersion: "7.10.0", meta: { target: ["numeroEmpleado"] } },
    );
    mockEmpleado.create.mockRejectedValueOnce(prismaError);

    const res = await request(createApp())
      .post("/api/empleados")
      .set(authHeader)
      .send({ nombre: "Carlos", numeroEmpleado: "EMP001" });

    expect(res.status).toBe(409);
  });
});

describe("PUT /api/empleados/:id", () => {
  beforeEach(() => vi.clearAllMocks());

  it("updates and returns the empleado", async () => {
    const updated = { ...empleadoFixture, nombre: "Juan Actualizado" };
    mockEmpleado.update.mockResolvedValueOnce(updated);

    const res = await request(createApp())
      .put(`/api/empleados/${empleadoFixture.id}`)
      .set(authHeader)
      .send({ nombre: "Juan Actualizado" });

    expect(res.status).toBe(200);
    expect(res.body.empleado.nombre).toBe("Juan Actualizado");
  });

  it("returns 404 when empleado does not exist", async () => {
    const prismaError = new Prisma.PrismaClientKnownRequestError(
      "An operation failed because it depends on one or more records that were required but not found.",
      { code: "P2025", clientVersion: "7.10.0", meta: {} },
    );
    mockEmpleado.update.mockRejectedValueOnce(prismaError);

    const res = await request(createApp())
      .put("/api/empleados/id-inexistente")
      .set(authHeader)
      .send({ nombre: "Nadie" });

    expect(res.status).toBe(404);
  });
});

describe("PATCH /api/empleados/:id/estado", () => {
  beforeEach(() => vi.clearAllMocks());

  it("changes estado and returns the empleado", async () => {
    const updated = { ...empleadoFixture, estado: "INACTIVO" as const };
    mockEmpleado.update.mockResolvedValueOnce(updated);

    const res = await request(createApp())
      .patch(`/api/empleados/${empleadoFixture.id}/estado`)
      .set(authHeader)
      .send({ estado: "INACTIVO" });

    expect(res.status).toBe(200);
    expect(res.body.empleado.estado).toBe("INACTIVO");
  });

  it("returns 400 on invalid estado value", async () => {
    const res = await request(createApp())
      .patch(`/api/empleados/${empleadoFixture.id}/estado`)
      .set(authHeader)
      .send({ estado: "DESCONOCIDO" });

    expect(res.status).toBe(400);
  });
});
