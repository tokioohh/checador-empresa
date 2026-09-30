import { Request, Response } from "express";
import { z } from "zod";
import { randomBytes } from "crypto";
import { EstadoEmpleado } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/AppError";
import { env } from "../config/env";
import { attendancePresence } from "../utils/attendance-state";

const horarioRegex = /^([01]\d|2[0-3]):([0-5]\d)$/; // "HH:mm"

const crearEmpleadoSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  apellidos: z.string().default(""),
  numeroEmpleado: z.string().min(1, "El número de empleado es requerido"),
  correo: z.string().email("Correo inválido").optional(),
  puesto: z.string().optional(),
  horarioEntrada: z
    .string()
    .regex(horarioRegex, "Formato esperado HH:mm")
    .optional(),
  horarioSalida: z
    .string()
    .regex(horarioRegex, "Formato esperado HH:mm")
    .optional(),
});

// Todos los campos opcionales para actualización parcial; el estado se
// maneja aparte (endpoint dedicado) para no mezclarlo con edición de datos.
const actualizarEmpleadoSchema = crearEmpleadoSchema.partial();

const cambiarEstadoSchema = z.object({
  estado: z.enum(EstadoEmpleado),
});

// En Express 5 los params de ruta están tipados como `string | string[]`
// (para rutas con parámetros repetidos), así que hay que narrowing explícito.
// De paso valida en runtime que el id no venga vacío.
function empleadoId(req: Request): string {
  const { id } = req.params;

  if (typeof id !== "string" || id.length === 0) {
    throw new AppError("Id de empleado inválido", 400);
  }

  return id;
}

export async function listar(req: Request, res: Response) {
  const estado = req.query.estado as EstadoEmpleado | undefined;
  const busqueda = req.query.busqueda as string | undefined;

  const empleados = await prisma.empleado.findMany({
    where: {
      ...(estado ? { estado } : {}),
      ...(busqueda
        ? {
            OR: [
              { nombre: { contains: busqueda, mode: "insensitive" } },
              { apellidos: { contains: busqueda, mode: "insensitive" } },
              { numeroEmpleado: { contains: busqueda, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { nombre: "asc" },
    include: {
      asistencias: {
        orderBy: [{ timestamp: "desc" }, { createdAt: "desc" }],
        take: 1,
        select: { tipo: true, timestamp: true },
      },
    },
  });

  return res.json({
    empleados: empleados.map(({ asistencias, ...empleado }) => {
      const ultimaAsistencia = asistencias[0] ?? null;
      return {
        ...empleado,
        estadoAsistencia: empleado.estado === "ACTIVO"
          ? attendancePresence(ultimaAsistencia?.tipo ?? null)
          : "INACTIVO",
        ultimaAsistencia,
      };
    }),
  });
}

export async function obtener(req: Request, res: Response) {
  const empleado = await prisma.empleado.findUnique({
    where: { id: empleadoId(req) },
    include: { dispositivos: true },
  });

  if (!empleado) {
    throw new AppError("Empleado no encontrado", 404);
  }

  return res.json({ empleado });
}

export async function crear(req: Request, res: Response) {
  const datos = crearEmpleadoSchema.parse(req.body);

  const empleado = await prisma.empleado.create({ data: datos });

  return res.status(201).json({ empleado });
}

export async function crearCodigoActivacion(req: Request, res: Response) {
  const id = empleadoId(req);
  const empleado = await prisma.empleado.findUnique({
    where: { id },
    select: { id: true, estado: true },
  });

  if (!empleado) throw new AppError("Empleado no encontrado", 404);
  if (empleado.estado !== "ACTIVO") {
    throw new AppError("Solo se puede vincular un empleado activo", 400);
  }

  const codigo = randomBytes(24).toString("hex").toUpperCase();
  const expiraEn = new Date(Date.now() + env.ACTIVATION_CODE_TTL_HOURS * 3_600_000);

  const activacion = await prisma.$transaction(async (tx) => {
    await tx.codigoActivacion.updateMany({
      where: { empleadoId: id, usado: false },
      data: { usado: true, usadoEn: new Date() },
    });
    return tx.codigoActivacion.create({
      data: { empleadoId: id, codigo, expiraEn },
    });
  });

  return res.status(201).json({
    activacion: { codigo: activacion.codigo, expiraEn: activacion.expiraEn },
  });
}

export async function actualizar(req: Request, res: Response) {
  const datos = actualizarEmpleadoSchema.parse(req.body);

  const empleado = await prisma.empleado.update({
    where: { id: empleadoId(req) },
    data: datos,
  });

  return res.json({ empleado });
}

// Baja lógica: nunca se borra un empleado físicamente para no perder
// el historial de asistencias asociado. Se usa el mismo endpoint para
// cualquier cambio de estado (ACTIVO / INACTIVO / BAJA).
export async function cambiarEstado(req: Request, res: Response) {
  const { estado } = cambiarEstadoSchema.parse(req.body);

  const empleado = await prisma.empleado.update({
    where: { id: empleadoId(req) },
    data: { estado },
  });

  return res.json({ empleado });
}
