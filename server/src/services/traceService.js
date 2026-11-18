import { logger } from '../utils/logger.js';
import { TokenAccumulator } from '../utils/tokenCounter.js';
import { globalStore } from '../models/store.js';

export class TraceService {
  constructor() {
    this.tokenAccumulator = new TokenAccumulator();
    this.traces = [];
  }

  clear() {
    this.tokenAccumulator = new TokenAccumulator();
    this.traces = [];
  }

  recordCall({ sessionId = 'session_001', area, provider, modelId, input, output, usage, durationMs, status = 'success' }) {
    const callNumber = this.traces.length + 1;
    this.tokenAccumulator.record(usage);

    const traceRecord = {
      _id: `trace_${String(callNumber).padStart(3, '0')}`,
      sessionId,
      callNumber,
      sequenceNumber: callNumber,
      area,
      provider: provider || 'model-provider',
      modelId: modelId || 'gemini-1.5-flash',
      input,
      output,
      usage: {
        inputTokens: usage?.inputTokens || 0,
        outputTokens: usage?.outputTokens || 0,
        totalTokens: usage?.totalTokens || 0,
        reportedByProvider: usage?.reportedByProvider ?? true,
      },
      durationMs: durationMs || 0,
      status,
      createdAt: new Date().toISOString(),
    };

    this.traces.push(traceRecord);
    globalStore.addTrace(traceRecord).catch((err) => console.error('[Store Error]', err.message));

    // Print immediately to terminal as mandated by hackathon rules
    logger.trace(traceRecord);

    return traceRecord;
  }

  getTraces() {
    return this.traces;
  }

  printTotalSummary() {
    const summary = this.tokenAccumulator.getSummary();
    console.log(`\n============================================================`);
    console.log(`EXECUTION TRACE COMPLETE - TOKEN ACCOUNTING SUMMARY`);
    console.log(`Total Model Invocations: ${summary.callCount}`);
    console.log(`Total Input Tokens:      ${summary.totalInputTokens.toLocaleString()}`);
    console.log(`Total Output Tokens:     ${summary.totalOutputTokens.toLocaleString()}`);
    console.log(`GRAND TOTAL TOKENS:      ${summary.totalTokens.toLocaleString()}`);
    console.log(`============================================================\n`);
    return summary;
  }
}

export const traceService = new TraceService();
