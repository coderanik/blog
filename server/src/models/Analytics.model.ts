import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalytics extends Document {
  blogSlug: string;
  eventType: 'view' | 'click';
  timezone?: string;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  timestamp: Date;
}

const AnalyticsSchema = new Schema<IAnalytics>(
  {
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
    timezone: {
      type: String,
      default: null
    },
    ipAddress: { type: String },
    userAgent: { type: String },
    referrer: { type: String },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  { timestamps: true }
);

AnalyticsSchema.index({ blogSlug: 1, eventType: 1, timestamp: -1 });
AnalyticsSchema.index({ blogSlug: 1, timezone: 1 });

export default mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);

