-- Agrega la opción de aviso indefinido (sin fecha de fin).
ALTER TABLE "avisos" ADD COLUMN "indefinido" BOOLEAN NOT NULL DEFAULT false;
