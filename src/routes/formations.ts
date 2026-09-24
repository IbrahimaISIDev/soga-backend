import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const router = Router();

const formationSchema = z.object({
  titre: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
  codeFiliere: z.string().min(1).max(50),
  pole: z.string().min(1).max(50),
  niveau: z.string().min(1).max(50),
  rythme: z.string().min(1).max(50),
  duree: z.string().max(50),
  description: z.string().optional(),
  image: z.string().optional(),
  published: z.boolean().optional(),
  rentree: z.string().optional(),
  placesLimitees: z.boolean().optional(),
  capacite: z.number().int().positive().optional(),
  brochureUrl: z.string().optional(),
  objectifs: z.string().optional(),
  conditionsAdmission: z.string().optional(),
  publicConcerne: z.string().optional(),
  debouches: z.array(z.string()).optional(),
  semestres: z
    .array(
      z.object({
        numero: z.number(),
        titre: z.string(),
        ues: z.array(z.string())
      })
    )
    .optional()
});

// GET /api/formations
router.get('/', async (req: Request, res: Response) => {
  try {
    const { published, limit = '50', offset = '0' } = req.query;

    const where = published !== undefined ? { published: published === 'true' } : {};

    const [formations, total] = await Promise.all([
      prisma.formation.findMany({
        where,
        take: Number(limit),
        skip: Number(offset),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.formation.count({ where })
    ]);

    res.json({
      success: true,
      data: formations,
      meta: {
        total,
        limit: Number(limit),
        offset: Number(offset)
      }
    });
  } catch (error) {
    console.error('Get formations error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// GET /api/formations/:slug
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const formation = await prisma.formation.findUnique({
      where: { slug }
    });

    if (!formation) {
      return res.status(404).json({ 
        success: false, 
        error: 'Formation not found' 
      });
    }

    res.json({
      success: true,
      data: formation
    });
  } catch (error) {
    console.error('Get formation error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// POST /api/formations
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const data = formationSchema.parse(req.body);

    const formation = await prisma.formation.create({
      data
    });

    res.status(201).json({
      success: true,
      data: formation
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        error: 'Validation error',
        details: error.issues 
      });
    }
    console.error('Create formation error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// PUT /api/formations/:id
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = formationSchema.partial().parse(req.body);

    const formation = await prisma.formation.update({
      where: { id },
      data
    });

    res.json({
      success: true,
      data: formation
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        error: 'Validation error',
        details: error.issues 
      });
    }
    console.error('Update formation error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// DELETE /api/formations/:id
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.formation.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Formation deleted successfully'
    });
  } catch (error) {
    console.error('Delete formation error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

export default router;
