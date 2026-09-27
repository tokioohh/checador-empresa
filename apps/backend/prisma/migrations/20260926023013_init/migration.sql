-- AlterTable
ALTER TABLE "asistencias" ALTER COLUMN "fotoUrl" DROP NOT NULL;

-- AlterTable
ALTER TABLE "empleados" ADD COLUMN     "passwordHash" TEXT;
