/*
  Warnings:

  - You are about to drop the column `archivoUrl` on the `media` table. All the data in the column will be lost.
  - You are about to drop the column `tipo` on the `media` table. All the data in the column will be lost.
  - Added the required column `archivoId` to the `media` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "media" DROP COLUMN "archivoUrl",
DROP COLUMN "tipo",
ADD COLUMN     "archivoId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "archivos" (
    "id" TEXT NOT NULL,
    "nombreOriginal" TEXT NOT NULL,
    "archivoUrl" TEXT NOT NULL,
    "tipo" "TipoMedia" NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "archivos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "archivos_archivoUrl_key" ON "archivos"("archivoUrl");

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_archivoId_fkey" FOREIGN KEY ("archivoId") REFERENCES "archivos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
