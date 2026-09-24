-- AlterTable
ALTER TABLE "Formation" ADD COLUMN     "brochureUrl" TEXT,
ADD COLUMN     "capacite" INTEGER,
ADD COLUMN     "conditionsAdmission" TEXT,
ADD COLUMN     "debouches" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "objectifs" TEXT,
ADD COLUMN     "placesLimitees" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "publicConcerne" TEXT,
ADD COLUMN     "rentree" TEXT,
ADD COLUMN     "semestres" JSONB;

