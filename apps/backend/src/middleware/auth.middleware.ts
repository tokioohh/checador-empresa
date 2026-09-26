import { Request, Response, NextFunction } from "express";
import { verifyAdminToken, AdminTokenPayload } from "../utils/jwt";
import { AppError } from "../utils/AppError";

// Extiende Request para adjuntar el admin autenticado.
declare global {
  namespace Express {
    interface Request {
      admin?: AdminTokenPayload;
    }
  }
}

export function requireAdminAuth(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    throw new AppError("No autorizado: falta el token de acceso", 401);
  }

  const token = header.slice("Bearer ".length);

  try {
    req.admin = verifyAdminToken(token);
    next();
  } catch {
    throw new AppError("No autorizado: token inválido o expirado", 401);
  }
}
