import express from "express";
import cors from "cors";
import { apiRouter } from "./routes";
import { errorMiddleware } from "./middleware/error.middleware";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use("/api", apiRouter);

  // Debe ir al final: Express 5 reenvía automáticamente los errores de
  // handlers async (rechazos de promesa) hasta aquí.
  app.use(errorMiddleware);

  return app;
}
