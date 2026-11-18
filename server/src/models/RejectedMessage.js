import mongoose from 'mongoose';

const rejectedMessageSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  messageId: { type: String, required: true, index: true },
  sessionId: { type: String, required: true, index: true },
  rawText: { type: String, default: '' },
  sender: { type: String, default: '' },
  reasonCode: { type: String, required: true },
  reason: { type: String, required: true },
  affectedAreas: [{ type: String }],
  decision: { type: String, default: 'rejected' },
  createdAt: { type: Date, default: Date.now },
});

export const RejectedMessageModel = mongoose.models.RejectedMessage || mongoose.model('RejectedMessage', rejectedMessageSchema);
