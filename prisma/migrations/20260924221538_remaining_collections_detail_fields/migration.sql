-- AlterTable
ALTER TABLE "Equipe" ADD COLUMN     "direction" TEXT,
ADD COLUMN     "filieres" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "specialite" TEXT;

-- AlterTable
ALTER TABLE "Evenement" ADD COLUMN     "heure" TEXT,
ADD COLUMN     "inscriptionOuverte" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "placesLimitees" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "type" TEXT;

-- AlterTable
ALTER TABLE "Expert" ADD COLUMN     "institution" TEXT,
ADD COLUMN     "titre" TEXT;

-- AlterTable
ALTER TABLE "Publication" ADD COLUMN     "auteurs" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "image" TEXT,
ADD COLUMN     "telechargeable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "thematique" TEXT,
ADD COLUMN     "type" TEXT;

-- AlterTable
ALTER TABLE "Temoignage" ADD COLUMN     "promotion" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Equipe_slug_key" ON "Equipe"("slug");

