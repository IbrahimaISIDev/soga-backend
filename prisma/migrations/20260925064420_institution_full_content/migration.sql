-- AlterTable
ALTER TABLE "Institution" DROP COLUMN "description",
DROP COLUMN "slogan",
ADD COLUMN     "campusInfo" JSONB,
ADD COLUMN     "campuses" JSONB,
ADD COLUMN     "chiffres" JSONB,
ADD COLUMN     "fondatrice" JSONB,
ADD COLUMN     "historique" TEXT,
ADD COLUMN     "horaires" TEXT,
ADD COLUMN     "instagram" TEXT,
ADD COLUMN     "mission" TEXT,
ADD COLUMN     "organigramme" JSONB,
ADD COLUMN     "presentation" TEXT,
ADD COLUMN     "sigle" TEXT,
ADD COLUMN     "tagline" TEXT,
ADD COLUMN     "valeurs" JSONB,
ADD COLUMN     "vision" TEXT,
ADD COLUMN     "youtube" TEXT;

