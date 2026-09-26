import { PrismaClient } from "../generated/prisma/client";import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "../config/env";

// Desde Prisma 7, PrismaClient requiere un driver adapter explícito para
// cualquier base de datos (antes era opcional / solo para Accelerate).
const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

// Singleton para no abrir múltiples conexiones en desarrollo (ts-node-dev recarga el módulo).
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma = global.__prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}
