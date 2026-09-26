import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface AdminTokenPayload {
  adminId: string;
  correo: string;
  rol: "SUPERADMIN" | "ADMIN";
}

export interface EmpleadoTokenPayload {
  empleadoId: string;
  nombre: string;
  tipo: "empleado";
}

const ADMIN_TTL = "8h";
const EMPLEADO_TTL = "12h";

export function signAdminToken(payload: AdminTokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: ADMIN_TTL });
}

export function verifyAdminToken(token: string): AdminTokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as AdminTokenPayload;
}

export function signEmpleadoToken(payload: EmpleadoTokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: EMPLEADO_TTL });
}

export function verifyEmpleadoToken(token: string): EmpleadoTokenPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET) as EmpleadoTokenPayload;
  if (decoded.tipo !== "empleado") {
    throw new Error("Token type mismatch");
  }
  return decoded;
}
