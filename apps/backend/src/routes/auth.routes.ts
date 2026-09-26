import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { requireAdminAuth } from "../middleware/auth.middleware";

export const authRouter = Router();

authRouter.post("/login", authController.login);
authRouter.get("/me", requireAdminAuth, authController.me);
