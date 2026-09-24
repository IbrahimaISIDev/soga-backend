import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();

const institutionSchema = z.object({
  nom: z.string().min(1).max(200),
  slogan: z.string().optional(),
  description: z.string().optional(),
  adresse: z.string().optional(),
  email: z.string().optional(),
  telephone: z.string().optional(),
  logo: z.string().optional(),
  imageHero: z.string().optional(),
  facebook: z.string().optional(),
  linkedin: z.string().optional(),
  twitter: z.string().optional()
});

// GET /api/institution
router.get('/', async (req: Request, res: Response) => {
  try {
    let institution = await prisma.institution.findFirst();
    
    if (!institution) {
      institution = await prisma.institution.create({
        data: { nom: 'SOGA Senegal' }
      });
    }

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
    
    let institution = await prisma.institution.findFirst();
    
    if (!institution) {
      institution = await prisma.institution.create({
        data: { nom: data.nom || 'SOGA Senegal', ...data }
      });
    } else {
      institution = await prisma.institution.update({
        where: { id: institution.id },
        data
      });
    }

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
