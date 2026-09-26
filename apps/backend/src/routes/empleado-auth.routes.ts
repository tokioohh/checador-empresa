import { Router } from "express";
import { loginEmpleado, meEmpleado } from "../controllers/empleado-auth.controller";
import { requireEmpleadoAuth } from "../middleware/empleado-auth.middleware";

export const empleadoAuthRouter = Router();

empleadoAuthRouter.post("/login", loginEmpleado);
empleadoAuthRouter.get("/me", requireEmpleadoAuth, meEmpleado);
