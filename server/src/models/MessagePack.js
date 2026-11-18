import mongoose from 'mongoose';

const messagePackSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  originalFileName: { type: String, required: true },
  originalContent: { type: String, required: true },
  contentHash: { type: String, required: true },
  sessionId: { type: String, required: true, index: true },
  uploadedAt: { type: Date, default: Date.now },
  processingStatus: { type: String, default: 'uploaded' },
});

export const MessagePackModel = mongoose.models.MessagePack || mongoose.model('MessagePack', messagePackSchema);
