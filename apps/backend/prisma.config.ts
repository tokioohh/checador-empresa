// Requerido desde Prisma 7: la URL de conexión y la configuración del CLI
// (generate, migrate, studio) ya no viven en schema.prisma, viven aquí.
// Prisma 7 tampoco carga .env automáticamente, por eso la carga explícita.
import * as dotenv from "dotenv";
import { defineConfig } from "prisma/config";

// El CLI de Prisma se ejecuta con cwd = apps/backend, pero el archivo `.env`
// vive en la RAÍZ del monorepo (es el que lee docker-compose). Se busca
// primero en el backend y después en la raíz; el primero que exista gana.
dotenv.config({ path: [".env", "../../.env"] });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // OJO: usamos process.env directo, NO el helper env() de "prisma/config".
    // env() lanza un error si la variable no existe, incluso para comandos
    // como `prisma generate` que no necesitan conectarse a la BD (solo leen
    // el schema). Eso rompería el build de Docker, donde DATABASE_URL aún
    // no está disponible en la etapa de `npx prisma generate` (ver Dockerfile).
    // El valor de respaldo nunca se usa para conectar de verdad, solo evita
    // que la carga del config falle cuando la variable no está definida.
    url:
      process.env.DATABASE_URL ??
      "postgresql://placeholder:placeholder@localhost:5432/placeholder",
  },
});
