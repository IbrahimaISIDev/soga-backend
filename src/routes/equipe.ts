import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const router = Router();

const equipeSchema = z.object({
  nom: z.string().min(1).max(200),
  prenom: z.string().optional(),
  slug: z.string().max(200).regex(/^[a-z0-9-]*$/).optional(),
  role: z.string().optional(),
  direction: z.string().optional(),
  specialite: z.string().optional(),
  bio: z.string().optional(),
  filieres: z.array(z.string()).optional(),
  email: z.string().optional(),
  image: z.string().optional(),
  linkedin: z.string().optional(),
  published: z.boolean().optional()
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const { published, limit = '50', offset = '0' } = req.query;
    const where = published !== undefined ? { published: published === 'true' } : {};
    const [equipe, total] = await Promise.all([
      prisma.equipe.findMany({ where, take: Number(limit), skip: Number(offset), orderBy: { createdAt: 'desc' } }),
      prisma.equipe.count({ where })
    ]);
    res.json({ success: true, data: equipe, meta: { total, limit: Number(limit), offset: Number(offset) } });
  } catch (error) {
    console.error('Get equipe error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const membre = await prisma.equipe.findUnique({ where: { id: req.params.id } });
    if (!membre) return res.status(404).json({ success: false, error: 'Equipe member not found' });
    res.json({ success: true, data: membre });
  } catch (error) {
    console.error('Get equipe member error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const data = equipeSchema.parse(req.body);
    // Empty string would collide under the unique constraint across every
    // member without a real slug yet — store as null instead, like an unset value.
    const membre = await prisma.equipe.create({
      data: { ...data, prenom: data.prenom ?? '', slug: data.slug || null }
    });
    res.status(201).json({ success: true, data: membre });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ success: false, error: 'Validation error', details: error.issues });
    console.error('Create equipe error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const data = equipeSchema.partial().parse(req.body);
    const membre = await prisma.equipe.update({
      where: { id: req.params.id },
      data: { ...data, slug: data.slug === '' ? null : data.slug }
    });
    res.json({ success: true, data: membre });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ success: false, error: 'Validation error', details: error.issues });
    console.error('Update equipe error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.delete('/:id', authMiddleware, roleMiddleware(['admin']), async (req: Request, res: Response) => {
  try {
    await prisma.equipe.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Equipe member deleted successfully' });
  } catch (error) {
    console.error('Delete equipe error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
