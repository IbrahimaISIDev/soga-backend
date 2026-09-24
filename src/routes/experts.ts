import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const router = Router();

const expertSchema = z.object({
  nom: z.string().min(1).max(200),
  prenom: z.string().optional(),
  specialite: z.string().optional(),
  bio: z.string().optional(),
  image: z.string().optional(),
  published: z.boolean().optional()
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const { published, limit = '50', offset = '0' } = req.query;
    const where = published !== undefined ? { published: published === 'true' } : {};
    const [experts, total] = await Promise.all([
      prisma.expert.findMany({ where, take: Number(limit), skip: Number(offset), orderBy: { createdAt: 'desc' } }),
      prisma.expert.count({ where })
    ]);
    res.json({ success: true, data: experts, meta: { total, limit: Number(limit), offset: Number(offset) } });
  } catch (error) {
    console.error('Get experts error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const expert = await prisma.expert.findUnique({ where: { id: req.params.id } });
    if (!expert) return res.status(404).json({ success: false, error: 'Expert not found' });
    res.json({ success: true, data: expert });
  } catch (error) {
    console.error('Get expert error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const data = expertSchema.parse(req.body);
    const expert = await prisma.expert.create({ data: { ...data, prenom: data.prenom ?? '' } });
    res.status(201).json({ success: true, data: expert });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ success: false, error: 'Validation error', details: error.issues });
    console.error('Create expert error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const data = expertSchema.partial().parse(req.body);
    const expert = await prisma.expert.update({ where: { id: req.params.id }, data });
    res.json({ success: true, data: expert });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ success: false, error: 'Validation error', details: error.issues });
    console.error('Update expert error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.delete('/:id', authMiddleware, roleMiddleware(['admin']), async (req: Request, res: Response) => {
  try {
    await prisma.expert.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Expert deleted successfully' });
  } catch (error) {
    console.error('Delete expert error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
