-- CreateEnum
CREATE TYPE "EstadoEmpleado" AS ENUM ('ACTIVO', 'INACTIVO', 'BAJA');

-- CreateEnum
CREATE TYPE "EstadoDispositivo" AS ENUM ('PENDIENTE', 'ACTIVO', 'REVOCADO');

-- CreateEnum
CREATE TYPE "TipoAsistencia" AS ENUM ('ENTRADA', 'SALIDA');

-- CreateEnum
CREATE TYPE "Puntualidad" AS ENUM ('A_TIEMPO', 'RETARDO');

-- CreateEnum
CREATE TYPE "TipoMedia" AS ENUM ('IMAGEN', 'VIDEO');

-- CreateEnum
CREATE TYPE "RolAdmin" AS ENUM ('SUPERADMIN', 'ADMIN');

-- CreateTable
CREATE TABLE "empleados" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "numeroEmpleado" TEXT NOT NULL,
    "correo" TEXT,
    "puesto" TEXT,
    "horarioEntrada" TEXT,
    "horarioSalida" TEXT,
    "estado" "EstadoEmpleado" NOT NULL DEFAULT 'ACTIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "empleados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispositivos" (
    "id" TEXT NOT NULL,
    "empleadoId" TEXT NOT NULL,
    "publicKey" TEXT NOT NULL,
    "plataforma" TEXT NOT NULL,
    "estado" "EstadoDispositivo" NOT NULL DEFAULT 'PENDIENTE',
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dispositivos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "codigos_activacion" (
    "id" TEXT NOT NULL,
    "empleadoId" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "expiraEn" TIMESTAMP(3) NOT NULL,
    "usado" BOOLEAN NOT NULL DEFAULT false,
    "usadoEn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "codigos_activacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asistencias" (
    "id" TEXT NOT NULL,
    "empleadoId" TEXT NOT NULL,
    "dispositivoId" TEXT NOT NULL,
    "tipo" "TipoAsistencia" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaLaboral" DATE NOT NULL,
    "puntualidad" "Puntualidad",
    "fotoUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asistencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avisos" (
    "id" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "prioridad" INTEGER NOT NULL DEFAULT 0,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "avisos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" TEXT NOT NULL,
    "tipo" "TipoMedia" NOT NULL,
    "archivoUrl" TEXT NOT NULL,
    "duracionSegundos" INTEGER,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rol" "RolAdmin" NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs" (
    "id" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "empleados_numeroEmpleado_key" ON "empleados"("numeroEmpleado");

-- CreateIndex
CREATE UNIQUE INDEX "empleados_correo_key" ON "empleados"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "dispositivos_publicKey_key" ON "dispositivos"("publicKey");

-- CreateIndex
CREATE UNIQUE INDEX "codigos_activacion_codigo_key" ON "codigos_activacion"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "admins_correo_key" ON "admins"("correo");

-- AddForeignKey
ALTER TABLE "dispositivos" ADD CONSTRAINT "dispositivos_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "empleados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "codigos_activacion" ADD CONSTRAINT "codigos_activacion_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "empleados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asistencias" ADD CONSTRAINT "asistencias_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "empleados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asistencias" ADD CONSTRAINT "asistencias_dispositivoId_fkey" FOREIGN KEY ("dispositivoId") REFERENCES "dispositivos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
