import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { comparePassword } from "../utils/password";
import { signAdminToken } from "../utils/jwt";
import { AppError } from "../utils/AppError";

const loginSchema = z.object({
  correo: z.string().email("Correo inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export async function login(req: Request, res: Response) {
  const { correo, password } = loginSchema.parse(req.body);

  const admin = await prisma.admin.findUnique({ where: { correo } });

  // Mismo mensaje de error si el correo no existe o la contraseña no coincide,
  // para no revelar si un correo está registrado.
  if (!admin) {
    throw new AppError("Correo o contraseña incorrectos", 401);
  }

  const passwordValida = await comparePassword(password, admin.passwordHash);
  if (!passwordValida) {
    throw new AppError("Correo o contraseña incorrectos", 401);
  }

  const token = signAdminToken({
    adminId: admin.id,
    correo: admin.correo,
    rol: admin.rol,
  });

  return res.json({
    token,
    admin: {
      id: admin.id,
      correo: admin.correo,
      nombre: admin.nombre,
      rol: admin.rol,
    },
  });
}

export async function me(req: Request, res: Response) {
  // req.admin lo llena el middleware requireAdminAuth
  const admin = await prisma.admin.findUnique({
    where: { id: req.admin!.adminId },
    select: { id: true, correo: true, nombre: true, rol: true },
  });

  if (!admin) {
    throw new AppError("Admin no encontrado", 404);
  }

  return res.json({ admin });
}
