import { Router } from "express";
import multer from "multer";
import path from "path";
import { randomUUID } from "crypto";
import { requireAdminAuth } from "../middleware/auth.middleware";
import { mediaDir } from "../lib/storage";
import * as adminController from "../controllers/admin.controller";
import { AppError } from "../utils/AppError";

const ALLOWED_MIMES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

// Configuración de subida: guarda en storage/media con nombre único
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, mediaDir());
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${randomUUID()}${ext}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError(`Formato no permitido: ${file.mimetype}`, 400));
    }
  },
});

export const adminRouter = Router();

// Todo el panel admin requiere sesión de admin
adminRouter.use(requireAdminAuth);

// ---- Archivos (biblioteca) ----
adminRouter.post("/archivos/upload", upload.single("archivo"), adminController.subirArchivo);
adminRouter.get("/archivos", adminController.listarArchivos);
adminRouter.delete("/archivos/:id", adminController.eliminarArchivo);

// ---- Media (cola de reproducción) ----
adminRouter.get("/media", adminController.listarMedia);
adminRouter.post("/media", adminController.crearMedia);
adminRouter.put("/media/:id", adminController.actualizarMedia);
adminRouter.delete("/media/:id", adminController.eliminarMedia);

// ---- Avisos ----
adminRouter.get("/avisos", adminController.listarAvisos);
adminRouter.post("/avisos", adminController.crearAviso);
adminRouter.put("/avisos/:id", adminController.actualizarAviso);
adminRouter.delete("/avisos/:id", adminController.eliminarAviso);
