import mongoose from 'mongoose';

const factSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  sessionId: { type: String, required: true, index: true },
  messageId: { type: String, required: true, index: true },
  category: { type: String, required: true, index: true },
  field: { type: String, required: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  unit: { type: String, default: '' },
  evidenceText: { type: String, required: true },
  confidence: { type: Number, default: 1.0 },
  decision: { type: String, enum: ['accepted', 'rejected', 'superseded', 'irrelevant', 'uncertain', 'conflicted'], default: 'accepted' },
  decisionReason: { type: String, default: '' },
  supersedesFactId: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

export const FactModel = mongoose.models.Fact || mongoose.model('Fact', factSchema);
