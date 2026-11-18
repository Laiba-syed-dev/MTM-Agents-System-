// server/src/utils/logger.js
export const Colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
};

export const logger = {
  info: (msg) => console.log(`${Colors.blue}[INFO]${Colors.reset} ${msg}`),
  success: (msg) => console.log(`${Colors.green}[SUCCESS]${Colors.reset} ${msg}`),
  warn: (msg) => console.log(`${Colors.yellow}[WARN]${Colors.reset} ${msg}`),
  error: (msg) => console.error(`${Colors.red}[ERROR]${Colors.reset} ${msg}`),
  step: (stepNum, title) => console.log(`\n${Colors.bright}${Colors.cyan}=== STEP ${stepNum}: ${title} ===${Colors.reset}`),
  trace: (traceRecord) => {
    console.log(`\n${Colors.bright}${Colors.magenta}------------------------------------------------------------${Colors.reset}`);
    console.log(`${Colors.bright}MODEL CALL #${traceRecord.callNumber} [Area: ${traceRecord.area.toUpperCase()}]${Colors.reset}`);
    console.log(`Model:      ${traceRecord.modelId} (${traceRecord.provider})`);
    console.log(`Status:     ${traceRecord.status} (${traceRecord.durationMs}ms)`);
    console.log(`Tokens:     Input: ${traceRecord.usage?.inputTokens ?? 'N/A'} | Output: ${traceRecord.usage?.outputTokens ?? 'N/A'} | Total: ${traceRecord.usage?.totalTokens ?? 'N/A'}`);
    console.log(`${Colors.dim}Input:${Colors.reset}\n${traceRecord.input.trim()}`);
    console.log(`${Colors.dim}Output:${Colors.reset}\n${traceRecord.output.trim()}`);
    console.log(`${Colors.magenta}------------------------------------------------------------${Colors.reset}`);
  },
  header: (title) => {
    console.log(`\n${Colors.bright}${Colors.bgBlue}${Colors.white} ${title} ${Colors.reset}\n`);
  }
};
