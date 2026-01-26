import mongoose, { Schema, Document } from 'mongoose';

export interface IBlog extends Document {
  title: string;
  slug: string;
  description: string;
  content: string;
  image?: string;
  tags: string[];
  date: Date;
  readTime: string;
  status: 'published' | 'draft';
  featuredPost?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema = new Schema<IBlog>(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true
    },
    image: {
      type: String,
      default: ''
    },
    tags: {
      type: [String],
      default: []
    },
    date: {
      type: Date,
      default: Date.now
    },
    readTime: {
      type: String,
      default: '5 min read'
    },
    status: {
      type: String,
      enum: ['published', 'draft'],
      default: 'draft'
    },
    featuredPost: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Generate slug from title before saving
BlogSchema.pre('save', function (next) {
  if (!this.slug || (this.isModified('title') && !this.slug)) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

export default mongoose.model<IBlog>('Blog', BlogSchema);

