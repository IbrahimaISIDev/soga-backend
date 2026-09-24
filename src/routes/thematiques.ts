import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const router = Router();

const thematiqueSchema = z.object({
  nom: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  published: z.boolean().optional()
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const { published, limit = '50', offset = '0' } = req.query;
    const where = published !== undefined ? { published: published === 'true' } : {};
    const [thematiques, total] = await Promise.all([
      prisma.thematique.findMany({ where, take: Number(limit), skip: Number(offset), orderBy: { createdAt: 'desc' } }),
      prisma.thematique.count({ where })
    ]);
    res.json({ success: true, data: thematiques, meta: { total, limit: Number(limit), offset: Number(offset) } });
  } catch (error) {
    console.error('Get thematiques error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const thematique = await prisma.thematique.findUnique({ where: { slug: req.params.slug } });
    if (!thematique) return res.status(404).json({ success: false, error: 'Thematique not found' });
    res.json({ success: true, data: thematique });
  } catch (error) {
    console.error('Get thematique error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const data = thematiqueSchema.parse(req.body);
    const thematique = await prisma.thematique.create({ data });
    res.status(201).json({ success: true, data: thematique });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ success: false, error: 'Validation error', details: error.issues });
    console.error('Create thematique error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const data = thematiqueSchema.partial().parse(req.body);
    const thematique = await prisma.thematique.update({ where: { id: req.params.id }, data });
    res.json({ success: true, data: thematique });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ success: false, error: 'Validation error', details: error.issues });
    console.error('Update thematique error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.delete('/:id', authMiddleware, roleMiddleware(['admin']), async (req: Request, res: Response) => {
  try {
    await prisma.thematique.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Thematique deleted successfully' });
  } catch (error) {
    console.error('Delete thematique error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
