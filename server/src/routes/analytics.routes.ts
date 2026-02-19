import express, { Request, Response } from 'express';
import Analytics from '../models/Analytics.model';

const router = express.Router();

// Track view (slug only; optional timezone in body)
router.post('/view/:slug', async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug;
    const timezone = req.body?.timezone ? String(req.body.timezone) : undefined;

    await Analytics.create({
      blogSlug: slug,
      eventType: 'view',
      timezone: timezone || undefined,
      ipAddress: req.ip || (req.headers['x-forwarded-for'] as string),
      userAgent: req.headers['user-agent'],
      referrer: req.headers.referer,
    });
    res.json({ message: 'View tracked' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to track view' });
  }
});

// Track click (slug only; optional timezone in body)
router.post('/click/:slug', async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug;
    const timezone = req.body?.timezone ? String(req.body.timezone) : undefined;

    await Analytics.create({
      blogSlug: slug,
      eventType: 'click',
      timezone: timezone || undefined,
      ipAddress: req.ip || (req.headers['x-forwarded-for'] as string),
      userAgent: req.headers['user-agent'],
      referrer: req.headers.referer,
    });
    res.json({ message: 'Click tracked' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to track click' });
  }
});

// Get analytics for a slug (views, clicks, by timezone) — for admin
router.get('/blog/:slug', async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug;

    const [views, clicks, viewsByTz, clicksByTz, viewsOverTime] = await Promise.all([
      Analytics.countDocuments({ blogSlug: slug, eventType: 'view' }),
      Analytics.countDocuments({ blogSlug: slug, eventType: 'click' }),
      Analytics.aggregate([
        { $match: { blogSlug: slug, eventType: 'view', timezone: { $exists: true, $nin: [null, ''] } } },
        { $group: { _id: '$timezone', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Analytics.aggregate([
        { $match: { blogSlug: slug, eventType: 'click', timezone: { $exists: true, $nin: [null, ''] } } },
        { $group: { _id: '$timezone', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Analytics.aggregate([
        { $match: { blogSlug: slug, eventType: 'view', timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    res.json({
      blogSlug: slug,
      views,
      clicks,
      viewsByTimezone: viewsByTz,
      clicksByTimezone: clicksByTz,
      viewsOverTime,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Summary for admin (all slugs; no Blog model)
router.get('/summary', async (req: Request, res: Response) => {
  try {
    const totalViews = await Analytics.countDocuments({ eventType: 'view' });
    const totalClicks = await Analytics.countDocuments({ eventType: 'click' });

    const blogAnalytics = await Analytics.aggregate([
      {
        $group: {
          _id: { blogSlug: '$blogSlug', eventType: '$eventType' },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.blogSlug',
          views: { $sum: { $cond: [{ $eq: ['$_id.eventType', 'view'] }, '$count', 0] } },
          clicks: { $sum: { $cond: [{ $eq: ['$_id.eventType', 'click'] }, '$count', 0] } },
        },
      },
      { $sort: { views: -1 } },
    ]);

    const topByViews = await Analytics.aggregate([
      { $match: { eventType: 'view' } },
      { $group: { _id: '$blogSlug', views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 10 },
    ]);

    const topByClicks = await Analytics.aggregate([
      { $match: { eventType: 'click' } },
      { $group: { _id: '$blogSlug', clicks: { $sum: 1 } } },
      { $sort: { clicks: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      totalViews,
      totalClicks,
      topBlogsByViews: topByViews,
      topBlogsByClicks: topByClicks,
      blogAnalytics: blogAnalytics.map((b) => ({
        _id: { blogId: null, blogSlug: b._id },
        views: b.views,
        clicks: b.clicks,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics summary' });
  }
});

export default router;
