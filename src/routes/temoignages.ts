import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const router = Router();

const temoignageSchema = z.object({
  nom: z.string().min(1).max(200),
  role: z.string().optional(),
  contenu: z.string(),
  image: z.string().optional(),
  published: z.boolean().optional()
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const { published, limit = '50', offset = '0' } = req.query;
    const where = published !== undefined ? { published: published === 'true' } : {};
    const [temoignages, total] = await Promise.all([
      prisma.temoignage.findMany({ where, take: Number(limit), skip: Number(offset), orderBy: { createdAt: 'desc' } }),
      prisma.temoignage.count({ where })
    ]);
    res.json({ success: true, data: temoignages, meta: { total, limit: Number(limit), offset: Number(offset) } });
  } catch (error) {
    console.error('Get temoignages error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const temoignage = await prisma.temoignage.findUnique({ where: { id: req.params.id } });
    if (!temoignage) return res.status(404).json({ success: false, error: 'Temoignage not found' });
    res.json({ success: true, data: temoignage });
  } catch (error) {
    console.error('Get temoignage error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const data = temoignageSchema.parse(req.body);
    const temoignage = await prisma.temoignage.create({ data });
    res.status(201).json({ success: true, data: temoignage });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ success: false, error: 'Validation error', details: error.issues });
    console.error('Create temoignage error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const data = temoignageSchema.partial().parse(req.body);
    const temoignage = await prisma.temoignage.update({ where: { id: req.params.id }, data });
    res.json({ success: true, data: temoignage });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ success: false, error: 'Validation error', details: error.issues });
    console.error('Update temoignage error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.delete('/:id', authMiddleware, roleMiddleware(['admin']), async (req: Request, res: Response) => {
  try {
    await prisma.temoignage.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Temoignage deleted successfully' });
  } catch (error) {
    console.error('Delete temoignage error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
