import { Router } from "express";
import { authRouter } from "./auth.routes";
import { empleadosRouter } from "./empleados.routes";
import { empleadoAuthRouter } from "./empleado-auth.routes";
import { dispositivosRouter } from "./dispositivos.routes";
import { asistenciasRouter } from "./asistencias.routes";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/auth/empleado", empleadoAuthRouter);
apiRouter.use("/empleados", empleadosRouter);
apiRouter.use("/dispositivos", dispositivosRouter);
apiRouter.use("/asistencias", asistenciasRouter);
