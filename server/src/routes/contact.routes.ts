import express, { Request, Response } from 'express';
import Contact from '../models/Contact.model';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';

const router = express.Router();

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// Submit contact form (public)
router.post('/submit', async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message }: ContactFormData = req.body || {};

    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    if (!email || !String(email).trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    if (!subject || !String(subject).trim()) {
      return res.status(400).json({ error: 'Subject is required' });
    }
    if (!message || !String(message).trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    await Contact.create({
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
    });

    res.json({
      success: true,
      message: "Thank you for your message! I'll get back to you soon.",
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      error: 'Failed to submit contact form. Please try again later.',
    });
  }
});

// Get all submissions (admin only)
router.get('/submissions', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const submissions = await Contact.find().sort({ createdAt: -1 }).lean();
    res.json(submissions);
  } catch (error) {
    console.error('Failed to fetch contact submissions:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

export default router;
