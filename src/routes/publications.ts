import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const router = Router();

const publicationSchema = z.object({
  titre: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  fichier: z.string().url().optional(),
  date: z.string().optional(),
  published: z.boolean().optional()
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const { published, limit = '50', offset = '0', year } = req.query;
    const where: any = {};
    if (published !== undefined) {
      where.published = published === 'true';
    }
    if (year) {
      const yearNum = parseInt(year as string);
      where.date = {
        gte: new Date(`${yearNum}-01-01`),
        lt: new Date(`${yearNum + 1}-01-01`)
      };
    }
    const [publications, total] = await Promise.all([
      prisma.publication.findMany({ where, take: Number(limit), skip: Number(offset), orderBy: { date: 'desc' } }),
      prisma.publication.count({ where })
    ]);
    res.json({ success: true, data: publications, meta: { total, limit: Number(limit), offset: Number(offset) } });
  } catch (error) {
    console.error('Get publications error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const publication = await prisma.publication.findUnique({ where: { slug: req.params.slug } });
    if (!publication) return res.status(404).json({ success: false, error: 'Publication not found' });
    res.json({ success: true, data: publication });
  } catch (error) {
    console.error('Get publication error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const data = publicationSchema.parse(req.body);
    const publication = await prisma.publication.create({
      data: { ...data, date: data.date ? new Date(data.date) : new Date() }
    });
    res.status(201).json({ success: true, data: publication });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ success: false, error: 'Validation error', details: error.issues });
    console.error('Create publication error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const data = publicationSchema.partial().parse(req.body);
    const publication = await prisma.publication.update({
      where: { id: req.params.id },
      data: { ...data, date: data.date ? new Date(data.date) : undefined }
    });
    res.json({ success: true, data: publication });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ success: false, error: 'Validation error', details: error.issues });
    console.error('Update publication error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.delete('/:id', authMiddleware, roleMiddleware(['admin']), async (req: Request, res: Response) => {
  try {
    await prisma.publication.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Publication deleted successfully' });
  } catch (error) {
    console.error('Delete publication error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
