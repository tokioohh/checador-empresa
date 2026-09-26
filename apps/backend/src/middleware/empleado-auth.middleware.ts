import { Request, Response, NextFunction } from "express";
import { verifyEmpleadoToken, EmpleadoTokenPayload } from "../utils/jwt";
import { AppError } from "../utils/AppError";

declare global {
  namespace Express {
    interface Request {
      empleado?: EmpleadoTokenPayload;
    }
  }
}

export function requireEmpleadoAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    throw new AppError("No autorizado: falta el token de acceso", 401);
  }

  const token = header.slice("Bearer ".length);

  try {
    req.empleado = verifyEmpleadoToken(token);
    next();
  } catch {
    throw new AppError("No autorizado: token inválido o expirado", 401);
  }
}
