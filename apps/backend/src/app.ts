import express from "express";
import cors from "cors";
import { apiRouter } from "./routes";
import { errorMiddleware } from "./middleware/error.middleware";
import { attendancePhotoDir, resolveStoragePath } from "./lib/storage";
import { env } from "./config/env";
import { requireAdminAuth } from "./middleware/auth.middleware";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Las fotos de asistencia contienen datos personales: solo admin puede consultarlas.
  app.use("/storage/fotos-asistencia", requireAdminAuth, express.static(attendancePhotoDir()));

  // Sirve archivos multimedia públicos desde disco.
  app.use("/storage", express.static(resolveStoragePath(env.STORAGE_PATH)));

  app.use("/api", apiRouter);

  // Debe ir al final: Express 5 reenvía automáticamente los errores de
  // handlers async (rechazos de promesa) hasta aquí.
  app.use(errorMiddleware);

  return app;
}
