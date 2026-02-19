import express, { Request, Response } from 'express';
import Engagement from '../models/Engagement.model';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';

const router = express.Router();

async function getOrCreateEngagement(slug: string) {
  let doc = await Engagement.findOne({ slug });
  if (!doc) {
    doc = await Engagement.create({ slug, likes: 0, comments: [] });
  }
  return doc;
}

// GET engagement for a post (public)
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const doc = await Engagement.findOne({ slug: req.params.slug });
    if (!doc) {
      return res.json({ likes: 0, comments: [] });
    }
    res.json({ likes: doc.likes, comments: doc.comments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch engagement' });
  }
});

// POST like (public)
router.post('/:slug/like', async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug;
    const doc = await getOrCreateEngagement(slug);
    doc.likes += 1;
    await doc.save();
    res.json({ likes: doc.likes });
  } catch (error) {
    res.status(500).json({ error: 'Failed to like' });
  }
});

// POST comment (public)
router.post('/:slug/comment', async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug;
    const { content, author } = req.body || {};
    if (!content || !String(content).trim()) {
      return res.status(400).json({ error: 'Comment content is required' });
    }
    const doc = await getOrCreateEngagement(slug);
    const comment = {
      id: Math.random().toString(36).substring(7),
      content: String(content).trim(),
      author: author ? String(author).trim() : 'Anonymous',
      date: new Date(),
    };
    doc.comments.push(comment);
    await doc.save();
    res.json({ comments: doc.comments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Get all engagement (admin only)
router.get('/list/all', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const list = await Engagement.find().sort({ updatedAt: -1 }).lean();
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch engagement' });
  }
});

export default router;
