import mongoose from 'mongoose';

const executionTraceSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  sessionId: { type: String, required: true, index: true },
  callNumber: { type: Number, required: true },
  sequenceNumber: { type: Number, required: true },
  area: { type: String, required: true, enum: ['reading', 'venue', 'schedule', 'food', 'judging', 'budget'] },
  provider: { type: String, required: true },
  modelId: { type: String, required: true },
  input: { type: String, required: true },
  output: { type: String, required: true },
  usage: {
    inputTokens: { type: Number, default: 0 },
    outputTokens: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 },
    reportedByProvider: { type: Boolean, default: true },
  },
  durationMs: { type: Number, default: 0 },
  status: { type: String, default: 'success' },
  createdAt: { type: Date, default: Date.now },
});

export const ExecutionTraceModel = mongoose.models.ExecutionTrace || mongoose.model('ExecutionTrace', executionTraceSchema);
