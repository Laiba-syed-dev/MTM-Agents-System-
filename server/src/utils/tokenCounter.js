export class TokenAccumulator {
  constructor() {
    this.totalInputTokens = 0;
    this.totalOutputTokens = 0;
    this.totalTokens = 0;
    this.callCount = 0;
  }

  record(usage) {
    this.callCount++;
    if (usage) {
      const inTok = usage.inputTokens || usage.promptTokens || usage.prompt_tokens || 0;
      const outTok = usage.outputTokens || usage.completionTokens || usage.completion_tokens || 0;
      const totTok = usage.totalTokens || usage.total_tokens || (inTok + outTok);

      this.totalInputTokens += inTok;
      this.totalOutputTokens += outTok;
      this.totalTokens += totTok;
    }
  }

  getSummary() {
    return {
      callCount: this.callCount,
      totalInputTokens: this.totalInputTokens,
      totalOutputTokens: this.totalOutputTokens,
      totalTokens: this.totalTokens,
    };
  }
}
