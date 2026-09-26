import { Router } from "express";
import { activarDispositivo } from "../controllers/dispositivos.controller";
import { requireEmpleadoAuth } from "../middleware/empleado-auth.middleware";

export const dispositivosRouter = Router();

dispositivosRouter.post("/activar", requireEmpleadoAuth, activarDispositivo);
