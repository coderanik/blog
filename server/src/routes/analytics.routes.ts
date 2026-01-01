import express, { Request, Response } from 'express';
import Analytics from '../models/Analytics.model';
import Blog from '../models/Blog.model';

const router = express.Router();

// Track view
router.post('/view/:slug', async (req: Request, res: Response) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    const analytics = new Analytics({
      blogId: blog._id,
      blogSlug: req.params.slug,
      eventType: 'view',
      ipAddress: req.ip || req.headers['x-forwarded-for'] as string,
      userAgent: req.headers['user-agent'],
      referrer: req.headers.referer
    });

    await analytics.save();
    res.json({ message: 'View tracked' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to track view' });
  }
});

// Track click
router.post('/click/:slug', async (req: Request, res: Response) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    const analytics = new Analytics({
      blogId: blog._id,
      blogSlug: req.params.slug,
      eventType: 'click',
      ipAddress: req.ip || req.headers['x-forwarded-for'] as string,
      userAgent: req.headers['user-agent'],
      referrer: req.headers.referer
    });

    await analytics.save();
    res.json({ message: 'Click tracked' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to track click' });
  }
});

// Get analytics for a specific blog
router.get('/blog/:slug', async (req: Request, res: Response) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    const views = await Analytics.countDocuments({
      blogId: blog._id,
      eventType: 'view'
    });

    const clicks = await Analytics.countDocuments({
      blogId: blog._id,
      eventType: 'click'
    });

    // Get views over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const viewsOverTime = await Analytics.aggregate([
      {
        $match: {
          blogId: blog._id,
          eventType: 'view',
          timestamp: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      blogId: blog._id,
      blogSlug: req.params.slug,
      views,
      clicks,
      viewsOverTime
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get all analytics summary (for admin dashboard)
router.get('/summary', async (req: Request, res: Response) => {
  try {
    const totalViews = await Analytics.countDocuments({ eventType: 'view' });
    const totalClicks = await Analytics.countDocuments({ eventType: 'click' });

    // Get top blogs by views
    const topBlogsByViews = await Analytics.aggregate([
      { $match: { eventType: 'view' } },
      {
        $group: {
          _id: '$blogSlug',
          views: { $sum: 1 }
        }
      },
      { $sort: { views: -1 } },
      { $limit: 10 }
    ]);

    // Get top blogs by clicks
    const topBlogsByClicks = await Analytics.aggregate([
      { $match: { eventType: 'click' } },
      {
        $group: {
          _id: '$blogSlug',
          clicks: { $sum: 1 }
        }
      },
      { $sort: { clicks: -1 } },
      { $limit: 10 }
    ]);

    // Get analytics per blog
    const blogAnalytics = await Analytics.aggregate([
      {
        $group: {
          _id: {
            blogId: '$blogId',
            blogSlug: '$blogSlug',
            eventType: '$eventType'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: {
            blogId: '$_id.blogId',
            blogSlug: '$_id.blogSlug'
          },
          views: {
            $sum: {
              $cond: [{ $eq: ['$_id.eventType', 'view'] }, '$count', 0]
            }
          },
          clicks: {
            $sum: {
              $cond: [{ $eq: ['$_id.eventType', 'click'] }, '$count', 0]
            }
          }
        }
      },
      { $sort: { views: -1 } }
    ]);

    res.json({
      totalViews,
      totalClicks,
      topBlogsByViews,
      topBlogsByClicks,
      blogAnalytics
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics summary' });
  }
});

export default router;

