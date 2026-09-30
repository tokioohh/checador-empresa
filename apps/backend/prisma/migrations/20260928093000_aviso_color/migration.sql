-- Reemplaza "prioridad" (INT) por "color" (TEXT) con valores predefinidos.
ALTER TABLE "avisos" DROP COLUMN "prioridad";
ALTER TABLE "avisos" ADD COLUMN "color" TEXT NOT NULL DEFAULT 'negro';
