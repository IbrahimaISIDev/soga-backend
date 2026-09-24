import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const router = Router();

const articleSchema = z.object({
  titre: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
  resume: z.string().optional(),
  contenu: z.string(),
  image: z.string().url().optional(),
  date: z.string().optional(),
  published: z.boolean().optional()
});

// GET /api/articles
router.get('/', async (req: Request, res: Response) => {
  try {
    const { published, limit = '50', offset = '0', year, month } = req.query;

    const where: any = {};
    if (published !== undefined) {
      where.published = published === 'true';
    }
    if (year) {
      const yearNum = parseInt(year as string);
      where.date = {
        ...where.date,
        gte: new Date(`${yearNum}-01-01`),
        lt: new Date(`${yearNum + 1}-01-01`)
      };
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        take: Number(limit),
        skip: Number(offset),
        orderBy: { date: 'desc' }
      }),
      prisma.article.count({ where })
    ]);

    res.json({
      success: true,
      data: articles,
      meta: { total, limit: Number(limit), offset: Number(offset) }
    });
  } catch (error) {
    console.error('Get articles error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /api/articles/:slug
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const article = await prisma.article.findUnique({ where: { slug } });

    if (!article) {
      return res.status(404).json({ success: false, error: 'Article not found' });
    }

    res.json({ success: true, data: article });
  } catch (error) {
    console.error('Get article error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /api/articles
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const data = articleSchema.parse(req.body);
    const article = await prisma.article.create({
      data: {
        ...data,
        date: data.date ? new Date(data.date) : new Date()
      }
    });
    res.status(201).json({ success: true, data: article });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Validation error', details: error.issues });
    }
    console.error('Create article error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// PUT /api/articles/:id
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = articleSchema.partial().parse(req.body);
    const article = await prisma.article.update({
      where: { id },
      data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined
      }
    });
    res.json({ success: true, data: article });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Validation error', details: error.issues });
    }
    console.error('Update article error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// DELETE /api/articles/:id
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.article.delete({ where: { id } });
    res.json({ success: true, message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Delete article error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
