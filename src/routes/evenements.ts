import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const router = Router();

const evenementSchema = z.object({
  titre: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  date: z.string(),
  lieu: z.string().optional(),
  image: z.string().url().optional(),
  published: z.boolean().optional()
});

// GET /api/evenements
router.get('/', async (req: Request, res: Response) => {
  try {
    const { published, limit = '50', offset = '0', upcoming } = req.query;

    const where: any = {};
    if (published !== undefined) {
      where.published = published === 'true';
    }
    if (upcoming === 'true') {
      where.date = { gte: new Date() };
    }

    const [evenements, total] = await Promise.all([
      prisma.evenement.findMany({
        where,
        take: Number(limit),
        skip: Number(offset),
        orderBy: { date: 'asc' }
      }),
      prisma.evenement.count({ where })
    ]);

    res.json({
      success: true,
      data: evenements,
      meta: { total, limit: Number(limit), offset: Number(offset) }
    });
  } catch (error) {
    console.error('Get evenements error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /api/evenements/:slug
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const evenement = await prisma.evenement.findUnique({ where: { slug } });

    if (!evenement) {
      return res.status(404).json({ success: false, error: 'Evenement not found' });
    }

    res.json({ success: true, data: evenement });
  } catch (error) {
    console.error('Get evenement error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /api/evenements
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const data = evenementSchema.parse(req.body);
    const evenement = await prisma.evenement.create({
      data: { ...data, date: new Date(data.date) }
    });
    res.status(201).json({ success: true, data: evenement });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Validation error', details: error.issues });
    }
    console.error('Create evenement error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// PUT /api/evenements/:id
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = evenementSchema.partial().parse(req.body);
    const evenement = await prisma.evenement.update({
      where: { id },
      data: { ...data, date: data.date ? new Date(data.date) : undefined }
    });
    res.json({ success: true, data: evenement });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Validation error', details: error.issues });
    }
    console.error('Update evenement error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// DELETE /api/evenements/:id
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.evenement.delete({ where: { id } });
    res.json({ success: true, message: 'Evenement deleted successfully' });
  } catch (error) {
    console.error('Delete evenement error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
