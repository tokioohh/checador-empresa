import { Router } from "express";
import * as empleadosController from "../controllers/empleados.controller";
import { requireAdminAuth } from "../middleware/auth.middleware";

export const empleadosRouter = Router();

// Todo el CRUD de empleados requiere sesión de admin.
empleadosRouter.use(requireAdminAuth);

empleadosRouter.get("/", empleadosController.listar);
empleadosRouter.get("/:id", empleadosController.obtener);
empleadosRouter.post("/", empleadosController.crear);
empleadosRouter.post("/:id/codigo-activacion", empleadosController.crearCodigoActivacion);
empleadosRouter.put("/:id", empleadosController.actualizar);
empleadosRouter.patch("/:id/estado", empleadosController.cambiarEstado);
