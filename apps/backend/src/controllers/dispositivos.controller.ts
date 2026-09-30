import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/AppError";

const activarSchema = z.object({
  codigo: z.string().min(1),
  publicKey: z.string().min(1),
  plataforma: z.enum(["ios", "android"]),
});

export async function activarDispositivo(req: Request, res: Response) {
  const { codigo, publicKey, plataforma } = activarSchema.parse(req.body);

  const activacion = await prisma.codigoActivacion.findFirst({
    where: {
      codigo,
      usado: false,
      expiraEn: { gt: new Date() },
    },
    include: { empleado: true },
  });

  if (!activacion) {
    throw new AppError("Código de activación inválido o expirado", 400);
  }
  if (activacion.empleado.estado !== "ACTIVO") {
    throw new AppError("El empleado no está activo", 403);
  }

  // Consume el código una sola vez y vincula el dispositivo al empleado asociado.
  const dispositivo = await prisma.$transaction(async (tx) => {
    const consumo = await tx.codigoActivacion.updateMany({
      where: { id: activacion.id, usado: false, expiraEn: { gt: new Date() } },
      data: { usado: true, usadoEn: new Date() },
    });
    if (consumo.count !== 1) {
      throw new AppError("El código de activación ya fue utilizado", 400);
    }

    return tx.dispositivo.create({
      data: { empleadoId: activacion.empleadoId, publicKey, plataforma, estado: "ACTIVO" },
    });
  });

  return res.status(201).json({
    dispositivo: {
      id: dispositivo.id,
      plataforma: dispositivo.plataforma,
      estado: dispositivo.estado,
      fechaRegistro: dispositivo.fechaRegistro,
    },
  });
}
