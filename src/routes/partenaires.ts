import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const router = Router();

const partenaireSchema = z.object({
  nom: z.string().min(1).max(200),
  logo: z.string().optional(),
  description: z.string().optional(),
  siteWeb: z.string().optional(),
  published: z.boolean().optional()
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const { published, limit = '50', offset = '0' } = req.query;
    const where = published !== undefined ? { published: published === 'true' } : {};
    const [partenaires, total] = await Promise.all([
      prisma.partenaire.findMany({ where, take: Number(limit), skip: Number(offset), orderBy: { createdAt: 'desc' } }),
      prisma.partenaire.count({ where })
    ]);
    res.json({ success: true, data: partenaires, meta: { total, limit: Number(limit), offset: Number(offset) } });
  } catch (error) {
    console.error('Get partenaires error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const partenaire = await prisma.partenaire.findUnique({ where: { id: req.params.id } });
    if (!partenaire) return res.status(404).json({ success: false, error: 'Partenaire not found' });
    res.json({ success: true, data: partenaire });
  } catch (error) {
    console.error('Get partenaire error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const data = partenaireSchema.parse(req.body);
    const partenaire = await prisma.partenaire.create({ data });
    res.status(201).json({ success: true, data: partenaire });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ success: false, error: 'Validation error', details: error.issues });
    console.error('Create partenaire error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const data = partenaireSchema.partial().parse(req.body);
    const partenaire = await prisma.partenaire.update({ where: { id: req.params.id }, data });
    res.json({ success: true, data: partenaire });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ success: false, error: 'Validation error', details: error.issues });
    console.error('Update partenaire error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.delete('/:id', authMiddleware, roleMiddleware(['admin']), async (req: Request, res: Response) => {
  try {
    await prisma.partenaire.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Partenaire deleted successfully' });
  } catch (error) {
    console.error('Delete partenaire error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
