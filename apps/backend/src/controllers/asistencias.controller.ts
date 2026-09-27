import { Request, Response } from "express";
import { z } from "zod";
import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "../lib/prisma";
import { validateQrToken, generateQrToken } from "../utils/qr";
import { createChallenge, consumeChallenge } from "../lib/challengeStore";
import { broadcastTvEvent } from "../lib/tv-ws";
import { AppError } from "../utils/AppError";
import { env } from "../config/env";

const challengeSchema = z.object({
  qrToken: z.string().min(1),
  dispositivoId: z.string().uuid(),
});

const registrarSchema = z.object({
  challengeId: z.string().uuid(),
  dispositivoId: z.string().uuid(),
  firma: z.string().min(1),
});

export async function obtenerQrActual(_req: Request, res: Response) {
  const token = generateQrToken();
  // Expira en ms hasta el próximo cambio de ventana
  const remaining = 30_000 - (Date.now() % 30_000);
  return res.json({ qrToken: token, expiresInMs: remaining });
}

export async function iniciarChallenge(req: Request, res: Response) {
  const { qrToken, dispositivoId } = challengeSchema.parse(req.body);
  const empleadoId = req.empleado!.empleadoId;

  if (!validateQrToken(qrToken)) {
    throw new AppError("QR inválido o expirado", 400);
  }

  const dispositivo = await prisma.dispositivo.findUnique({
    where: { id: dispositivoId },
  });

  if (!dispositivo || dispositivo.empleadoId !== empleadoId) {
    throw new AppError("Dispositivo no encontrado o no pertenece al empleado", 403);
  }

  if (dispositivo.estado !== "ACTIVO") {
    throw new AppError("Dispositivo revocado o inactivo", 403);
  }

  const { challengeId, challenge } = createChallenge(dispositivoId);
  return res.json({ challengeId, challenge });
}

export async function registrarAsistencia(req: Request, res: Response) {
  try {
    const { challengeId, dispositivoId, firma } = registrarSchema.parse(req.body);
    const empleadoId = req.empleado!.empleadoId;

    const challenge = consumeChallenge(challengeId, dispositivoId);
    if (!challenge) {
      throw new AppError("Challenge inválido, expirado o ya utilizado", 400);
    }

    const dispositivo = await prisma.dispositivo.findUnique({
      where: { id: dispositivoId },
      include: { empleado: true },
    });

    if (!dispositivo || dispositivo.empleadoId !== empleadoId) {
      throw new AppError("Dispositivo no válido", 403);
    }

    // Verifica la firma: HMAC-SHA256(challenge, publicKey del dispositivo)
    const expected = createHmac("sha256", dispositivo.publicKey)
      .update(challenge)
      .digest("hex");

    let firmaValida = false;
    try {
      firmaValida = timingSafeEqual(
        Buffer.from(firma.toLowerCase(), "hex"),
        Buffer.from(expected, "hex")
      );
    } catch {
      firmaValida = false;
    }

    if (!firmaValida) {
      throw new AppError("No se pudo verificar la identidad del dispositivo", 401);
    }

    // Determina puntualidad si el empleado tiene horario configurado
    const now = new Date();
    let puntualidad: "A_TIEMPO" | "RETARDO" | null = null;

    if (dispositivo.empleado.horarioEntrada) {
      const [h, m] = dispositivo.empleado.horarioEntrada.split(":").map(Number);
      const limite = new Date(now);
      limite.setHours(h, m + env.PUNTUALIDAD_TOLERANCIA_MIN, 0, 0);
      puntualidad = now <= limite ? "A_TIEMPO" : "RETARDO";
    }

    const fechaLaboral = new Date(now);
    fechaLaboral.setHours(0, 0, 0, 0);

    const asistencia = await prisma.asistencia.create({
      data: {
        empleadoId,
        dispositivoId,
        tipo: "ENTRADA",
        fechaLaboral,
        puntualidad,
      } as Parameters<typeof prisma.asistencia.create>[0]["data"],
    });

    broadcastTvEvent({
      type: "asistencia:success",
      empleado: {
        nombre: dispositivo.empleado.nombre,
        puesto: dispositivo.empleado.puesto,
      },
      timestamp: asistencia.timestamp.toISOString(),
    });

    return res.status(201).json({
      asistencia: {
        id: asistencia.id,
        tipo: asistencia.tipo,
        timestamp: asistencia.timestamp,
        puntualidad: asistencia.puntualidad,
        empleado: {
          nombre: dispositivo.empleado.nombre,
          puesto: dispositivo.empleado.puesto,
        },
      },
    });
  } catch (err) {
    const message = err instanceof AppError ? err.message : "Error al registrar asistencia";
    broadcastTvEvent({ type: "asistencia:error", error: message });
    throw err;
  }
}
