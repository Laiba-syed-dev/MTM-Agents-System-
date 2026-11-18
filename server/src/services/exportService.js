import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputDir = path.resolve(__dirname, '../../../output');

export async function exportPlanAndTrace(plan, traces, tokenSummary) {
  await fs.mkdir(outputDir, { recursive: true });

  // 1. Export final plan JSON
  const planPath = path.join(outputDir, 'final_plan.json');
  await fs.writeFile(planPath, JSON.stringify(plan, null, 2), 'utf-8');

  // 2. Export execution trace text file
  const tracePath = path.join(outputDir, 'trace.txt');
  const lines = [];
  lines.push('================================================================================');
  lines.push('MIND TO MACHINE HACKATHON - COMPLETE MODEL EXECUTION TRACE');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('================================================================================\n');

  for (const t of traces) {
    lines.push(`--------------------------------------------------------------------------------`);
    lines.push(`CALL #${t.callNumber} | AREA: [${t.area.toUpperCase()}] | MODEL: ${t.modelId} (${t.provider})`);
    lines.push(`STATUS: ${t.status} | DURATION: ${t.durationMs}ms`);
    lines.push(`TOKENS: Input: ${t.usage?.inputTokens ?? 'N/A'} | Output: ${t.usage?.outputTokens ?? 'N/A'} | Total: ${t.usage?.totalTokens ?? 'N/A'}`);
    lines.push(`\n[EXACT INPUT SENT]:\n${t.input}`);
    lines.push(`\n[EXACT OUTPUT RECEIVED]:\n${t.output}`);
    lines.push(`--------------------------------------------------------------------------------\n`);
  }

  lines.push('================================================================================');
  lines.push('TOKEN ACCOUNTING SUMMARY:');
  lines.push(`Total Model Invocations: ${tokenSummary.callCount}`);
  lines.push(`Total Input Tokens:      ${tokenSummary.totalInputTokens.toLocaleString()}`);
  lines.push(`Total Output Tokens:     ${tokenSummary.totalOutputTokens.toLocaleString()}`);
  lines.push(`GRAND TOTAL TOKENS:      ${tokenSummary.totalTokens.toLocaleString()}`);
  lines.push('================================================================================\n');

  await fs.writeFile(tracePath, lines.join('\n'), 'utf-8');

  return { planPath, tracePath };
}
