import { Router } from "express";
import { generateQrToken } from "../utils/qr";
import { prisma } from "../lib/prisma";
import { broadcastTvEvent } from "../lib/tv-ws";

export const tvRouter = Router();

// QR actual para mostrar en la TV (sin auth)
tvRouter.get("/qr", (_req, res) => {
  const token = generateQrToken();
  const remaining = 30_000 - (Date.now() % 30_000);
  return res.json({ qrToken: token, expiresInMs: remaining });
});

// Multimedia activa (sin auth)
tvRouter.get("/media", async (_req, res) => {
  const media = await prisma.media.findMany({
    where: { activo: true },
    orderBy: { orden: "asc" },
    include: { archivo: true },
  });
  return res.json({
    media: media.map((m) => ({
      id: m.id,
      tipo: m.archivo.tipo,
      archivoUrl: m.archivo.archivoUrl,
      duracionSegundos: m.duracionSegundos,
      orden: m.orden,
    })),
  });
});

// Avisos activos (sin auth)
tvRouter.get("/avisos", async (_req, res) => {
  const now = new Date();
  const avisos = await prisma.aviso.findMany({
    where: {
      activo: true,
      fechaInicio: { lte: now },
      fechaFin: { gte: now },
    },
    orderBy: { prioridad: "desc" },
  });
  return res.json({ avisos });
});

// TEMP: endpoint de prueba para broadcast WS
tvRouter.post("/test-broadcast", (_req, res) => {
  broadcastTvEvent({
    type: "asistencia:success",
    empleado: { nombre: "Juan Pérez", puesto: "Desarrollador" },
    timestamp: new Date().toISOString(),
  });
  return res.json({ ok: true });
});
