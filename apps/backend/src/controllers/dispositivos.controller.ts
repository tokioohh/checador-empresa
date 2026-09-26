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
  const empleadoId = req.empleado!.empleadoId;

  const activacion = await prisma.codigoActivacion.findFirst({
    where: {
      codigo,
      empleadoId,
      usado: false,
      expiraEn: { gt: new Date() },
    },
  });

  if (!activacion) {
    throw new AppError("Código de activación inválido o expirado", 400);
  }

  // Crea el dispositivo y marca el código como usado en una transacción
  const dispositivo = await prisma.$transaction(async (tx) => {
    await tx.codigoActivacion.update({
      where: { id: activacion.id },
      data: { usado: true, usadoEn: new Date() },
    });

    return tx.dispositivo.create({
      data: { empleadoId, publicKey, plataforma, estado: "ACTIVO" },
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
