import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
// Con el generator "prisma-client" (Prisma 7) el cliente se genera en
// src/generated/prisma, así que @prisma/client ya no exporta el namespace
// Prisma con las clases de error: hay que importar del cliente generado.
import { Prisma } from "../generated/prisma/client";
import multer from "multer";
import { AppError } from "../utils/AppError";

/**
 * Manejador de errores centralizado. Express 5 reenvía automáticamente los
 * rechazos de promesas de los controladores async hasta aquí, así que los
 * controladores no necesitan try/catch para errores esperados.
 */
export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Datos inválidos",
      detalles: err.issues.map((i) => ({
        campo: i.path.join("."),
        mensaje: i.message,
      })),
    });
  }

  if (err instanceof multer.MulterError) {
    const status = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    return res.status(status).json({
      error: err.code === "LIMIT_FILE_SIZE" ? "La foto no puede superar 8 MB" : "No se pudo procesar la foto",
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const campos = (err.meta?.target as string[] | undefined)?.join(", ");
      return res.status(409).json({
        error: `Ya existe un registro con ese valor${campos ? ` (${campos})` : ""}`,
      });
    }
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Registro no encontrado" });
    }
  }

  console.error("Error no controlado:", err);
  return res.status(500).json({ error: "Error interno del servidor" });
}
