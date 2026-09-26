import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface AdminTokenPayload {
  adminId: string;
  correo: string;
  rol: "SUPERADMIN" | "ADMIN";
}

const TOKEN_TTL = "8h";

export function signAdminToken(payload: AdminTokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: TOKEN_TTL });
}

export function verifyAdminToken(token: string): AdminTokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as AdminTokenPayload;
}
