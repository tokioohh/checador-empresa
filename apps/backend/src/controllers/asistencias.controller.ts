import { Request, Response } from "express";
import { z } from "zod";
import { createHmac, randomUUID, timingSafeEqual } from "crypto";
import fs from "fs/promises";
import path from "path";
import { prisma } from "../lib/prisma";
import { validateQrToken, generateQrToken } from "../utils/qr";
import { createChallenge, consumeChallenge } from "../lib/challengeStore";
import { broadcastTvEvent } from "../lib/tv-ws";
import { AppError } from "../utils/AppError";
import { nextAttendanceType } from "../utils/attendance-state";
import { env } from "../config/env";
import { attendancePhotoDir } from "../lib/storage";

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

  if (!validateQrToken(qrToken)) {
    throw new AppError("QR inválido o expirado", 400);
  }

  const dispositivo = await prisma.dispositivo.findUnique({
    where: { id: dispositivoId },
    include: { empleado: true },
  });

  if (!dispositivo || dispositivo.empleado.estado !== "ACTIVO") {
    throw new AppError("Dispositivo no encontrado o empleado inactivo", 403);
  }

  if (dispositivo.estado !== "ACTIVO") {
    throw new AppError("Dispositivo revocado o inactivo", 403);
  }

  const { challengeId, challenge } = createChallenge(dispositivoId);
  return res.json({ challengeId, challenge });
}

export async function registrarAsistencia(req: Request, res: Response) {
  let savedPhotoPath: string | null = null;
  try {
    const file = req.file;
    if (!file) throw new AppError("La foto es obligatoria para registrar la asistencia", 400);

    const { challengeId, dispositivoId, firma } = registrarSchema.parse(req.body);

    const isJpeg = file.mimetype === "image/jpeg"
      && file.buffer.length >= 3
      && file.buffer[0] === 0xff
      && file.buffer[1] === 0xd8
      && file.buffer[2] === 0xff;
    const isPng = file.mimetype === "image/png"
      && file.buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    if (!isJpeg && !isPng) throw new AppError("El archivo recibido no es una imagen JPG o PNG válida", 400);

    const challenge = consumeChallenge(challengeId, dispositivoId);
    if (!challenge) {
      throw new AppError("Challenge inválido, expirado o ya utilizado", 400);
    }

    const dispositivo = await prisma.dispositivo.findUnique({
      where: { id: dispositivoId },
      include: { empleado: true },
    });

    if (!dispositivo || dispositivo.empleado.estado !== "ACTIVO") {
      throw new AppError("Dispositivo no válido", 403);
    }
    if (dispositivo.estado !== "ACTIVO") {
      throw new AppError("Dispositivo revocado o inactivo", 403);
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

    const now = new Date();
    const fechaLaboral = new Date(now);
    fechaLaboral.setHours(0, 0, 0, 0);

    const extension = isPng ? ".png" : ".jpg";
    const filename = `${randomUUID()}${extension}`;
    const photoDirectory = attendancePhotoDir();
    savedPhotoPath = path.join(photoDirectory, filename);
    await fs.writeFile(savedPhotoPath, file.buffer, { flag: "wx" });
    const fotoUrl = path.posix.join("fotos-asistencia", filename);

    const { asistencia, tipo } = await prisma.$transaction(async (tx) => {
      // Serializa los escaneos del mismo empleado para alternar ENTRADA/SALIDA de forma segura.
      await tx.$queryRaw`SELECT "id" FROM "empleados" WHERE "id" = ${dispositivo.empleadoId} FOR UPDATE`;

      const ultimaAsistencia = await tx.asistencia.findFirst({
        where: { empleadoId: dispositivo.empleadoId },
        orderBy: [{ timestamp: "desc" }, { createdAt: "desc" }],
        select: { tipo: true },
      });
      const nextType = nextAttendanceType(ultimaAsistencia?.tipo ?? null);

      let puntualidad: "A_TIEMPO" | "RETARDO" | null = null;
      if (nextType === "ENTRADA" && dispositivo.empleado.horarioEntrada) {
        const [h, m] = dispositivo.empleado.horarioEntrada.split(":").map(Number);
        const limite = new Date(now);
        limite.setHours(h, m + env.PUNTUALIDAD_TOLERANCIA_MIN, 0, 0);
        puntualidad = now <= limite ? "A_TIEMPO" : "RETARDO";
      }

      const created = await tx.asistencia.create({
        data: {
          empleadoId: dispositivo.empleadoId,
          dispositivoId,
          tipo: nextType,
          fechaLaboral,
          puntualidad,
          fotoUrl,
        } as Parameters<typeof prisma.asistencia.create>[0]["data"],
      });

      return { asistencia: created, tipo: nextType };
    });
    savedPhotoPath = null;

    broadcastTvEvent({
      type: "asistencia:success",
      tipo,
      empleado: {
        nombre: [dispositivo.empleado.nombre, dispositivo.empleado.apellidos].filter(Boolean).join(" "),
        puesto: dispositivo.empleado.puesto,
      },
      timestamp: asistencia.timestamp.toISOString(),
    });

    return res.status(201).json({
      asistencia: {
        id: asistencia.id,
        tipo,
        timestamp: asistencia.timestamp,
        puntualidad: asistencia.puntualidad,
        fotoUrl: asistencia.fotoUrl,
        empleado: {
          nombre: [dispositivo.empleado.nombre, dispositivo.empleado.apellidos].filter(Boolean).join(" "),
          puesto: dispositivo.empleado.puesto,
        },
      },
    });
  } catch (err) {
    if (savedPhotoPath) await fs.unlink(savedPhotoPath).catch(() => undefined);
    const message = err instanceof AppError ? err.message : "Error al registrar asistencia";
    broadcastTvEvent({ type: "asistencia:error", error: message });
    throw err;
  }
}
