import mongoose, { Schema, Document } from 'mongoose';

export interface IComment {
  id: string;
  content: string;
  author: string;
  date: Date;
}

export interface IEngagement extends Document {
  slug: string;
  likes: number;
  comments: IComment[];
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    id: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, default: 'Anonymous' },
    date: { type: Date, default: Date.now },
  },
  { _id: false }
);

const EngagementSchema = new Schema<IEngagement>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    likes: { type: Number, default: 0 },
    comments: { type: [CommentSchema], default: [] },
  },
  { timestamps: true }
);

EngagementSchema.index({ slug: 1 });

export default mongoose.model<IEngagement>('Engagement', EngagementSchema);
