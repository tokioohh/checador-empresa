import { describe, it, expect } from "vitest";
import { AppError } from "../utils/AppError";
import { signAdminToken, verifyAdminToken } from "../utils/jwt";
import { hashPassword, comparePassword } from "../utils/password";
import { attendancePresence, nextAttendanceType } from "../utils/attendance-state";

describe("attendance state", () => {
  it("starts inactive and enters on the first scan", () => {
    expect(attendancePresence(null)).toBe("INACTIVO");
    expect(nextAttendanceType(null)).toBe("ENTRADA");
  });

  it("toggles to inactive after an entry", () => {
    expect(attendancePresence("ENTRADA")).toBe("ACTIVO");
    expect(nextAttendanceType("ENTRADA")).toBe("SALIDA");
  });

  it("toggles back to active after an exit", () => {
    expect(attendancePresence("SALIDA")).toBe("INACTIVO");
    expect(nextAttendanceType("SALIDA")).toBe("ENTRADA");
  });
});

describe("AppError", () => {
  it("sets message and default status 400", () => {
    const err = new AppError("algo salió mal");
    expect(err.message).toBe("algo salió mal");
    expect(err.statusCode).toBe(400);
    expect(err.name).toBe("AppError");
    expect(err).toBeInstanceOf(Error);
  });

  it("accepts a custom status code", () => {
    const err = new AppError("no encontrado", 404);
    expect(err.statusCode).toBe(404);
  });
});

describe("JWT utils", () => {
  const payload = { adminId: "abc-123", correo: "admin@test.com", rol: "ADMIN" as const };

  it("signs and verifies a token", () => {
    const token = signAdminToken(payload);
    expect(typeof token).toBe("string");
    const decoded = verifyAdminToken(token);
    expect(decoded.adminId).toBe(payload.adminId);
    expect(decoded.correo).toBe(payload.correo);
    expect(decoded.rol).toBe(payload.rol);
  });

  it("throws on a tampered token", () => {
    const token = signAdminToken(payload);
    expect(() => verifyAdminToken(token + "x")).toThrow();
  });
});

describe("Password utils", () => {
  it("hashes a password and verifies it", async () => {
    const hash = await hashPassword("mi-clave-segura");
    expect(hash).not.toBe("mi-clave-segura");
    await expect(comparePassword("mi-clave-segura", hash)).resolves.toBe(true);
  });

  it("rejects a wrong password", async () => {
    const hash = await hashPassword("correcta");
    await expect(comparePassword("incorrecta", hash)).resolves.toBe(false);
  });
});
