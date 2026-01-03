import express, { Request, Response } from 'express';
import Blog from '../models/Blog.model';
import { calculateReadingTime } from '../utils/reading-time';

const router = express.Router();

// Get all published blogs
router.get('/published', async (req: Request, res: Response) => {
  try {
    const blogs = await Blog.find({ status: 'published' })
      .sort({ date: -1 })
      .select('-content'); // Exclude content for list view
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
});

// Get all blogs (for admin)
router.get('/', async (req: Request, res: Response) => {
  try {
    const blogs = await Blog.find()
      .sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
});

// Get blog by ID
router.get('/id/:id', async (req: Request, res: Response) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    res.json(blog);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blog' });
  }
});

// Get drafts (must be before /:slug route)
router.get('/drafts/all', async (req: Request, res: Response) => {
  try {
    const drafts = await Blog.find({ status: 'draft' })
      .sort({ updatedAt: -1 });
    res.json(drafts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch drafts' });
  }
});

// Create new blog (must be before /:slug route)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, description, content, tags, readTime, status } = req.body;
    
    if (!title || !description || !content) {
      return res.status(400).json({ error: 'Title, description, and content are required' });
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Calculate reading time from content if not provided
    const calculatedReadTime = readTime || calculateReadingTime(content);

    const blog = new Blog({
      title,
      slug,
      description,
      content,
      tags: tags || [],
      readTime: calculatedReadTime,
      status: status || 'draft'
    });

    await blog.save();
    res.status(201).json(blog);
  } catch (error: any) {
    console.error('Error creating blog:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Blog with this slug already exists' });
    }
    res.status(500).json({ 
      error: 'Failed to create blog',
      message: error.message || 'Unknown error'
    });
  }
});

// Update blog
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { title, description, content, tags, readTime, status } = req.body;
    
    // If content is being updated, recalculate reading time unless explicitly provided
    let finalReadTime = readTime;
    if (content && !readTime) {
      // Get current blog to check if content changed
      const currentBlog = await Blog.findById(req.params.id);
      if (currentBlog && currentBlog.content !== content) {
        finalReadTime = calculateReadingTime(content);
      }
    }
    
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      {
        ...(title && { title }),
        ...(description && { description }),
        ...(content && { content }),
        ...(tags && { tags }),
        ...(finalReadTime && { readTime: finalReadTime }),
        ...(status && { status })
      },
      { new: true, runValidators: true }
    );

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    res.json(blog);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update blog' });
  }
});

// Delete blog
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete blog' });
  }
});

// Get blog by slug (must be last to avoid catching other routes)
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    res.json(blog);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blog' });
  }
});

export default router;

