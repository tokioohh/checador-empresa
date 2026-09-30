import { Router } from "express";
import multer from "multer";
import {
  obtenerQrActual,
  iniciarChallenge,
  registrarAsistencia,
} from "../controllers/asistencias.controller";
import { requireAdminAuth } from "../middleware/auth.middleware";
import { AppError } from "../utils/AppError";

export const asistenciasRouter = Router();

const uploadPhoto = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      callback(null, true);
    } else {
      callback(new AppError("La foto debe ser JPG o PNG", 400));
    }
  },
});

// El admin (o la pantalla TV) puede obtener el QR actual para mostrarlo
asistenciasRouter.get("/qr", requireAdminAuth, obtenerQrActual);

// El dispositivo vinculado inicia el challenge tras escanear el QR de la TV.
asistenciasRouter.post("/challenge", iniciarChallenge);

// La firma y la foto obligatoria se validan antes de registrar/broadcast de asistencia.
asistenciasRouter.post("/", uploadPhoto.single("foto"), registrarAsistencia);
