import { Router } from "express";
import {
  obtenerQrActual,
  iniciarChallenge,
  registrarAsistencia,
} from "../controllers/asistencias.controller";
import { requireEmpleadoAuth } from "../middleware/empleado-auth.middleware";
import { requireAdminAuth } from "../middleware/auth.middleware";

export const asistenciasRouter = Router();

// El admin (o la pantalla TV) puede obtener el QR actual para mostrarlo
asistenciasRouter.get("/qr", requireAdminAuth, obtenerQrActual);

// El empleado inicia el challenge tras escanear el QR
asistenciasRouter.post("/challenge", requireEmpleadoAuth, iniciarChallenge);

// El empleado envía la firma y queda registrado
asistenciasRouter.post("/", requireEmpleadoAuth, registrarAsistencia);
