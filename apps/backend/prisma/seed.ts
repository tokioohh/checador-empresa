// Crea (o actualiza) el primer administrador, necesario porque sin ningún
// Admin en la base de datos nadie podría iniciar sesión la primera vez.
// Uso: npm run prisma:seed
// Variables opcionales: ADMIN_SEED_EMAIL, ADMIN_SEED_PASSWORD, ADMIN_SEED_NOMBRE

import * as dotenv from "dotenv";
// Con el generator "prisma-client" (Prisma 7) el cliente se genera en
// src/generated/prisma; @prisma/client ya no expone PrismaClient.
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";

// El seed corre con cwd = apps/backend, pero el `.env` está en la raíz del
// monorepo (es el que lee docker-compose). Se buscan ambos; las variables ya
// presentes en el entorno tienen prioridad porque dotenv no sobreescribe.
dotenv.config({ path: [".env", "../../.env"] });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error(
    "❌ Falta DATABASE_URL. Crea el .env en la raíz a partir de .env.example."
  );
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const correo = process.env.ADMIN_SEED_EMAIL ?? "admin@empresa.com";
  const password = process.env.ADMIN_SEED_PASSWORD ?? "changeme123";
  const nombre = process.env.ADMIN_SEED_NOMBRE ?? "Administrador";

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.admin.upsert({
    where: { correo },
    update: {},
    create: {
      correo,
      passwordHash,
      nombre,
      rol: "SUPERADMIN",
    },
  });

  console.log("✅ Admin listo:", admin.correo);
  if (!process.env.ADMIN_SEED_PASSWORD) {
    console.log(
      `⚠️  Se usó la contraseña por defecto ("${password}"). Cámbiala después de tu primer login.`
    );
  }
}

main()
  .catch((e) => {
    console.error("Error corriendo el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
