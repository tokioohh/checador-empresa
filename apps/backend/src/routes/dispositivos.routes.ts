import { Router } from "express";
import { activarDispositivo } from "../controllers/dispositivos.controller";

export const dispositivosRouter = Router();

// El código de activación emitido por RH es de un solo uso y autoriza esta operación.
dispositivosRouter.post("/activar", activarDispositivo);
