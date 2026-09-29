import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import { createApp } from "../app";

vi.mock("../lib/prisma", () => ({
  prisma: {
    asistencia: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    dispositivo: {
      findUnique: vi.fn(),
    },
  },
}));

import { prisma } from "../lib/prisma";

describe("POST /api/asistencias", () => {
  it("rejects an attendance without a photo and does not create an assistance", async () => {
    const response = await request(createApp())
      .post("/api/asistencias")
      .send({
        challengeId: "452778db-86ad-42db-bdec-70f7ca585ce7",
        dispositivoId: "6473903e-94c2-4155-b2c7-0f9bc43c2e95",
        firma: "firmada",
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("La foto es obligatoria para registrar la asistencia");
    expect(prisma.asistencia.findFirst).not.toHaveBeenCalled();
    expect(prisma.asistencia.create).not.toHaveBeenCalled();
    expect(prisma.dispositivo.findUnique).not.toHaveBeenCalled();
  });
});
