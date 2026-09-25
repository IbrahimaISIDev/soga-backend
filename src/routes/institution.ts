import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();

const campusSchema = z.object({
  ville: z.string(),
  adresse: z.string()
});

const valeurSchema = z.object({
  titre: z.string(),
  sousTitre: z.string(),
  description: z.string()
});

const chiffreSchema = z.object({
  valeur: z.string(),
  libelle: z.string()
});

const fondatriceSchema = z.object({
  nom: z.string(),
  titre: z.string(),
  qualifications: z.string(),
  citation: z.string(),
  biographie: z.array(z.string()),
  portrait: z.string().nullable().optional()
});

const organigrammeItemSchema = z.object({
  label: z.string(),
  niveau: z.number(),
  accent: z.boolean()
});

const infrastructureSchema = z.object({
  titre: z.string(),
  detail: z.string(),
  enPlanification: z.boolean(),
  photo: z.string().nullable().optional()
});

const campusInfoSchema = z.object({
  description: z.string(),
  infrastructures: z.array(infrastructureSchema),
  photos: z.array(z.string())
});

const institutionSchema = z.object({
  nom: z.string().min(1).max(200),
  sigle: z.string().optional(),
  tagline: z.string().optional(),
  presentation: z.string().optional(),
  historique: z.string().optional(),
  adresse: z.string().optional(),
  email: z.string().optional(),
  telephone: z.string().optional(),
  horaires: z.string().optional(),
  logo: z.string().optional(),
  imageHero: z.string().optional(),
  facebook: z.string().optional(),
  linkedin: z.string().optional(),
  instagram: z.string().optional(),
  youtube: z.string().optional(),
  twitter: z.string().optional(),
  campuses: z.array(campusSchema).optional(),
  mission: z.string().optional(),
  vision: z.string().optional(),
  valeurs: z.array(valeurSchema).optional(),
  chiffres: z.array(chiffreSchema).optional(),
  fondatrice: fondatriceSchema.optional(),
  organigramme: z.array(organigrammeItemSchema).optional(),
  campusInfo: campusInfoSchema.optional()
});

// Institution is a singleton — always operate on the oldest row so
// concurrent requests never race into creating duplicates.
async function getOrCreateInstitution() {
  let institution = await prisma.institution.findFirst({ orderBy: { createdAt: 'asc' } });
  if (!institution) {
    institution = await prisma.institution.create({ data: { nom: 'SOGA Senegal' } });
  }
  return institution;
}

// GET /api/institution
router.get('/', async (req: Request, res: Response) => {
  try {
    const institution = await getOrCreateInstitution();
    res.json({ success: true, data: institution });
  } catch (error) {
    console.error('Get institution error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// PUT /api/institution
router.put('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const data = institutionSchema.partial().parse(req.body);
    const existing = await getOrCreateInstitution();

    const institution = await prisma.institution.update({
      where: { id: existing.id },
      data
    });

    res.json({ success: true, data: institution });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Validation error', details: error.issues });
    }
    console.error('Update institution error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
