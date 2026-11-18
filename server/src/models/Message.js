import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  packId: { type: String, required: true, index: true },
  sessionId: { type: String, required: true, index: true },
  rawText: { type: String, required: true },
  sender: { type: String, default: 'Unknown' },
  messageDate: { type: String, default: null },
  sourceType: { type: String, default: 'unspecified' },
  language: { type: String, default: 'english' },
  receivedAt: { type: Date, default: Date.now },
  lineStart: { type: Number, default: 0 },
  lineEnd: { type: Number, default: 0 },
});

export const MessageModel = mongoose.models.Message || mongoose.model('Message', messageSchema);
