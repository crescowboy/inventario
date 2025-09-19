import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface IActivity extends Document {
  user: {
    id: mongoose.Schema.Types.ObjectId;
    name: string;
  };
  action: 'created' | 'updated' | 'deleted';
  entity: 'article' | 'section' | 'employee';
  entityId: mongoose.Schema.Types.ObjectId;
  articleCode?: string;
  articleName?: string;
  details?: string;
  timestamp: Date;
}

const ActivitySchema = new Schema<IActivity>({
  user: {
    id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
  },
  action: {
    type: String,
    enum: ['created', 'updated', 'deleted'],
    required: true,
  },
  entity: {
    type: String,
    enum: ['article', 'section', 'employee'],
    required: true,
  },
  entityId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  articleCode: { type: String },
  articleName: { type: String },
  details: { type: String },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Activity = models.Activity || model<IActivity>('Activity', ActivitySchema);

export default Activity;
