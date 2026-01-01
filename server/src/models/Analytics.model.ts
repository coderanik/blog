import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalytics extends Document {
  blogId: mongoose.Types.ObjectId;
  blogSlug: string;
  eventType: 'view' | 'click';
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  timestamp: Date;
}

const AnalyticsSchema = new Schema<IAnalytics>(
  {
    blogId: {
      type: Schema.Types.ObjectId,
      ref: 'Blog',
      required: true
    },
    blogSlug: {
      type: String,
      required: true,
      index: true
    },
    eventType: {
      type: String,
      enum: ['view', 'click'],
      required: true
    },
    ipAddress: {
      type: String
    },
    userAgent: {
      type: String
    },
    referrer: {
      type: String
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Index for efficient queries
AnalyticsSchema.index({ blogId: 1, eventType: 1, timestamp: -1 });
AnalyticsSchema.index({ blogSlug: 1, eventType: 1 });

export default mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);

