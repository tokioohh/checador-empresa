import { Router } from "express";
import { authRouter } from "./auth.routes";
import { empleadosRouter } from "./empleados.routes";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/empleados", empleadosRouter);

// Próximas fases agregan aquí: /dispositivos, /codigos-activacion,
// /asistencias, /avisos, /media.
