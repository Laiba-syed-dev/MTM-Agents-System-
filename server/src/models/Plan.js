import mongoose from 'mongoose';

const planSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  sessionId: { type: String, required: true, index: true },
  version: { type: Number, required: true, default: 1 },
  status: { type: String, default: 'valid' },
  venue: { type: mongoose.Schema.Types.Mixed, required: true },
  schedule: { type: Array, required: true },
  food: { type: mongoose.Schema.Types.Mixed, required: true },
  judging: { type: mongoose.Schema.Types.Mixed, required: true },
  budget: { type: mongoose.Schema.Types.Mixed, required: true },
  validation: {
    valid: { type: Boolean, default: false },
    checks: { type: Array, default: [] },
    errors: { type: Array, default: [] },
  },
  sourceFactIds: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

export const PlanModel = mongoose.models.Plan || mongoose.model('Plan', planSchema);
