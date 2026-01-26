import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import cloudinary from '../utils/cloudinary';
import { authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();

// Configure multer for memory storage (files will be stored in memory before uploading to Cloudinary)
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Error handler middleware for multer errors
const handleMulterError = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'File size must be less than 10MB'
      });
    }
    return res.status(400).json({
      error: 'Upload error',
      message: err.message
    });
  }
  if (err) {
    return res.status(400).json({
      error: 'Upload error',
      message: err.message || 'Invalid file'
    });
  }
  next(err);
};

// Upload single image
router.post('/image', authenticateToken, upload.single('image'), handleMulterError, async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No image file provided',
        message: 'Please select an image file to upload'
      });
    }

    console.log('Uploading image:', {
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Convert buffer to base64 string for Cloudinary
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: 'blog-images', // Optional: organize images in a folder
      resource_type: 'image',
      transformation: [
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });

    console.log('Image uploaded successfully:', result.secure_url);

    res.json({
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
    });
  } catch (error: any) {
    console.error('Error uploading image:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to upload image';
    if (error.message) {
      errorMessage = error.message;
    } else if (error.http_code) {
      errorMessage = `Cloudinary error: ${error.http_code}`;
    }
    
    res.status(500).json({
      error: 'Failed to upload image',
      message: errorMessage,
    });
  }
});

// Delete image from Cloudinary
router.delete('/image/:publicId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { publicId } = req.params;
    
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      res.json({ message: 'Image deleted successfully' });
    } else {
      res.status(404).json({ error: 'Image not found' });
    }
  } catch (error: any) {
    console.error('Error deleting image:', error);
    res.status(500).json({
      error: 'Failed to delete image',
      message: error.message || 'Unknown error',
    });
  }
});

export default router;
