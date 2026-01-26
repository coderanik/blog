import express, { Request, Response } from 'express';

const router = express.Router();

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// Submit contact form
router.post('/submit', async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message }: ContactFormData = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!subject || !subject.trim()) {
      return res.status(400).json({ error: 'Subject is required' });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Log the contact form submission (in production, you might want to save to database or send email)
    console.log('📧 Contact Form Submission:', {
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
      timestamp: new Date().toISOString(),
    });

    // TODO: In production, you might want to:
    // 1. Save to MongoDB database
    // 2. Send email notification using nodemailer or similar
    // 3. Send to a service like SendGrid, Mailgun, etc.

    res.json({
      success: true,
      message: 'Thank you for your message! I\'ll get back to you soon.',
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      error: 'Failed to submit contact form. Please try again later.',
    });
  }
});

export default router;
