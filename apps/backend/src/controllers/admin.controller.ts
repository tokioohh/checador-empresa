import { Request, Response } from "express";
import { z } from "zod";
import fs from "fs";
import path from "path";
import { prisma } from "../lib/prisma";
import { mediaDir } from "../lib/storage";
import { AppError } from "../utils/AppError";

// En Express 5 los params de ruta están tipados como `string | string[]`.
function paramId(req: Request): string {
  const { id } = req.params;
  if (typeof id !== "string" || id.length === 0) {
    throw new AppError("Id inválido", 400);
  }
  return id;
}

// ---- Zod schemas ----
const crearMediaSchema = z.object({
  archivoId: z.string().uuid(),
  duracionSegundos: z.number().int().positive().optional().nullable(),
  orden: z.number().int().min(0).optional(),
});

const actualizarMediaSchema = z.object({
  duracionSegundos: z.number().int().positive().optional().nullable(),
  orden: z.number().int().min(0).optional(),
  activo: z.boolean().optional(),
});

const crearAvisoSchema = z.object({
  texto: z.string().min(1),
  prioridad: z.number().int().optional(),
  fechaInicio: z.coerce.date(),
  fechaFin: z.coerce.date(),
  activo: z.boolean().optional(),
});

const actualizarAvisoSchema = crearAvisoSchema.partial();

// ---- Archivos (biblioteca) ----
export async function subirArchivo(req: Request, res: Response) {
  const file = req.file;
  if (!file) {
    throw new AppError("No se recibió ningún archivo", 400);
  }

  const tipo = file.mimetype.startsWith("video/") ? "VIDEO" : "IMAGEN";
  const archivo = await prisma.archivo.create({
    data: {
      nombreOriginal: file.originalname,
      archivoUrl: `media/${file.filename}`,
      tipo,
      mimeType: file.mimetype,
      sizeBytes: file.size,
    },
  });

  return res.status(201).json({ archivo });
}

export async function listarArchivos(_req: Request, res: Response) {
  const archivos = await prisma.archivo.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { media: true } } },
  });
  return res.json({ archivos });
}

export async function eliminarArchivo(req: Request, res: Response) {
  const id = paramId(req);
  const archivo = await prisma.archivo.findUnique({ where: { id } });
  if (!archivo) throw new AppError("Archivo no encontrado", 404);

  // Borra el registro (las media asociadas se borran por cascade)
  await prisma.archivo.delete({ where: { id } });

  // Borra el archivo del disco
  const fullPath = path.join(mediaDir(), path.basename(archivo.archivoUrl));
  fs.rm(fullPath, { force: true }, () => {});

  return res.status(204).end();
}

// ---- Media (cola de reproducción) ----
export async function listarMedia(_req: Request, res: Response) {
  const media = await prisma.media.findMany({
    orderBy: { orden: "asc" },
    include: { archivo: true },
  });
  return res.json({ media });
}

export async function crearMedia(req: Request, res: Response) {
  const data = crearMediaSchema.parse(req.body);

  const archivo = await prisma.archivo.findUnique({ where: { id: data.archivoId } });
  if (!archivo) throw new AppError("Archivo no encontrado", 404);

  const orden = data.orden ?? await prisma.media.count();

  const media = await prisma.media.create({
    data: {
      archivoId: data.archivoId,
      duracionSegundos: data.duracionSegundos ?? null,
      orden,
    },
    include: { archivo: true },
  });

  return res.status(201).json({ media });
}

export async function actualizarMedia(req: Request, res: Response) {
  const id = paramId(req);
  const data = actualizarMediaSchema.parse(req.body);

  const media = await prisma.media.update({
    where: { id },
    data,
    include: { archivo: true },
  });

  return res.json({ media });
}

export async function eliminarMedia(req: Request, res: Response) {
  const id = paramId(req);
  await prisma.media.delete({ where: { id } });
  return res.status(204).end();
}

// ---- Avisos ----
export async function listarAvisos(_req: Request, res: Response) {
  const avisos = await prisma.aviso.findMany({
    orderBy: [{ activo: "desc" }, { prioridad: "desc" }, { fechaInicio: "asc" }],
  });
  return res.json({ avisos });
}

export async function crearAviso(req: Request, res: Response) {
  const data = crearAvisoSchema.parse(req.body);
  const aviso = await prisma.aviso.create({ data });
  return res.status(201).json({ aviso });
}

export async function actualizarAviso(req: Request, res: Response) {
  const id = paramId(req);
  const data = actualizarAvisoSchema.parse(req.body);
  const aviso = await prisma.aviso.update({ where: { id }, data });
  return res.json({ aviso });
}

export async function eliminarAviso(req: Request, res: Response) {
  const id = paramId(req);
  await prisma.aviso.delete({ where: { id } });
  return res.status(204).end();
}
