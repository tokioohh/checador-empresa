import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { comparePassword } from "../utils/password";
import { signEmpleadoToken } from "../utils/jwt";
import { AppError } from "../utils/AppError";

const loginSchema = z.object({
  numeroEmpleado: z.string().min(1),
  password: z.string().min(1),
});

export async function loginEmpleado(req: Request, res: Response) {
  const { numeroEmpleado, password } = loginSchema.parse(req.body);

  type EmpleadoConDispositivos = Awaited<ReturnType<typeof prisma.empleado.findUnique>> & {
    passwordHash?: string | null;
    dispositivos: { id: string; estado: string }[];
  };

  const empleado = await prisma.empleado.findUnique({
    where: { numeroEmpleado },
    include: { dispositivos: { where: { estado: "ACTIVO" }, take: 1 } },
  }) as EmpleadoConDispositivos | null;

  if (!empleado || !empleado.passwordHash) {
    throw new AppError("Número de empleado o contraseña incorrectos", 401);
  }

  if (empleado.estado !== "ACTIVO") {
    throw new AppError("Empleado inactivo o dado de baja", 403);
  }

  const ok = await comparePassword(password, empleado.passwordHash);
  if (!ok) {
    throw new AppError("Número de empleado o contraseña incorrectos", 401);
  }

  const token = signEmpleadoToken({
    empleadoId: empleado.id,
    nombre: empleado.nombre,
    tipo: "empleado",
  });

  return res.json({
    token,
    empleado: {
      id: empleado.id,
      nombre: empleado.nombre,
      numeroEmpleado: empleado.numeroEmpleado,
      puesto: empleado.puesto ?? null,
      estado: empleado.estado,
      dispositivoRegistrado: empleado.dispositivos.length > 0,
      dispositivoId: empleado.dispositivos[0]?.id ?? null,
    },
  });
}

export async function meEmpleado(req: Request, res: Response) {
  const empleado = await prisma.empleado.findUnique({
    where: { id: req.empleado!.empleadoId },
    include: { dispositivos: { where: { estado: "ACTIVO" }, take: 1 } },
  });

  if (!empleado) throw new AppError("Empleado no encontrado", 404);

  // No exponer passwordHash en la respuesta
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash: _pw, ...empleadoSafe } = empleado as typeof empleado & { passwordHash?: string };

  return res.json({
    empleado: {
      ...empleadoSafe,
      dispositivoRegistrado: empleado.dispositivos.length > 0,
      dispositivoId: empleado.dispositivos[0]?.id ?? null,
    },
  });
}
