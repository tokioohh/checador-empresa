import * as dotenv from "dotenv";
import { z } from "zod";

// La API arranca con cwd = raíz del monorepo (npm workspaces) o con
// apps/backend; el archivo `.env` está en la raíz. Se buscan ambos.
// Las variables ya presentes en el entorno (Docker Compose) tienen prioridad:
// dotenv no sobreescribe process.env.
dotenv.config({ path: [".env", "../../.env"] });

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL es requerida"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET es requerida"),
  QR_SECRET: z.string().min(1, "QR_SECRET es requerida"),
  STORAGE_PATH: z.string().default("/app/storage"),
  ACTIVATION_CODE_TTL_HOURS: z.coerce.number().default(4),
  PUNTUALIDAD_TOLERANCIA_MIN: z.coerce.number().default(15),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Variables de entorno inválidas o faltantes:");
  console.error(parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
