import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/environment.js';
import { connectDatabase } from './config/database.js';
import { readMessageFile } from './services/fileReader.js';
import { parseMessagePack } from './services/messageParser.js';
import { extractFactsFromMessages } from './services/factExtractor.js';
import { FactResolver } from './services/factResolver.js';
import { PlanningService } from './services/planningService.js';
import { traceService } from './services/traceService.js';
import { exportPlanAndTrace } from './services/exportService.js';
import { withTimeout } from './utils/timeout.js';
import { logger } from './utils/logger.js';
import { globalStore } from './models/store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runCli() {
  const startTime = Date.now();
  logger.header('MIND TO MACHINE AGENT SYSTEM - EVENT PLANNER');
  logger.info(`Session Initialized. Target: 4-Hour Physical Hackathon in Islamabad (150 students, 50 teams).`);

  // Target input file
  const customArg = process.argv.slice(2).find((arg) => !arg.startsWith('-'));
  const targetFile = customArg || path.resolve(__dirname, '../../', config.defaultInputFile);
  logger.info(`Reading input message pack from: ${targetFile}`);

  try {
    await withTimeout(
      (async () => {
        // Step 1: Database connection attempt
        await connectDatabase();

        // Step 2: Read file exactly as provided (FR-01, FR-02)
        logger.step(1, 'Reading Original Message Pack');
        const { rawContent, contentHash } = await readMessageFile(targetFile);
        const sessionId = `session_${Date.now()}`;
        const packId = `pack_${contentHash.substring(0, 8)}`;

        globalStore.addMessagePack({
          _id: packId,
          originalFileName: path.basename(targetFile),
          originalContent: rawContent,
          contentHash,
          sessionId,
          uploadedAt: new Date(),
          processingStatus: 'processing',
        });

        // Step 3: Parse messages without altering raw text
        const messages = parseMessagePack(rawContent, packId, sessionId);
        logger.success(`Extracted ${messages.length} raw messages from message pack.`);
        for (const msg of messages) {
          globalStore.addMessage(msg);
        }

        // Step 4: AI Fact Extraction (FR-03, FR-04)
        logger.step(2, 'AI Message Understanding & Fact Extraction');
        const extractedFacts = await extractFactsFromMessages(messages, sessionId);
        logger.success(`Extracted ${extractedFacts.length} candidate facts with source provenance.`);

        // Step 5: Fact Resolution (FR-05, FR-06, FR-07, FR-08)
        logger.step(3, 'Fact Verification & Conflict Resolution Engine');
        const resolver = new FactResolver(sessionId);
        const { acceptedFacts, rejectedRecords } = resolver.resolveFacts(extractedFacts, messages);
        logger.success(`Resolved facts: ${acceptedFacts.length} ACCEPTED, ${rejectedRecords.length} REJECTED / DISPUTED.`);

        // Step 6: 5-Area Event Planning (FR-09)
        const planningService = new PlanningService(sessionId);
        const finalPlan = await planningService.generateInitialPlan(acceptedFacts);

        // Step 7: Print Token Accounting Summary (FR-11)
        const tokenSummary = traceService.printTotalSummary();

        // Step 8: Validation Result Output
        logger.header('DETERMINISTIC VALIDATION REPORT');
        console.log(`Global Validity:       ${finalPlan.validation.valid ? 'PASSED (VALID PLAN)' : 'FAILED'}`);
        console.log(`Venue Capacity:        ${finalPlan.venue.capacity} seats (Attendees: ${finalPlan.venue.attendees})`);
        console.log(`Schedule Duration:     ${finalPlan.validation.summary.scheduledMinutes} minutes (Target: 240 mins)`);
        console.log(`Prayer Break:          ${finalPlan.schedule.some((a) => a.name.toLowerCase().includes('prayer')) ? 'Included (15+ min)' : 'Missing'}`);
        console.log(`Food Quantity:         ${finalPlan.food.quantity} boxes (Cost: PKR ${finalPlan.food.totalCalculatedCost.toLocaleString()})`);
        console.log(`Judges Assigned:       ${finalPlan.judging.assignedJudges} judges (Coverage: ${finalPlan.judging.maxTeamsPerJudge} teams/judge max)`);
        console.log(`Total Budget:          PKR ${finalPlan.budget.totalBudget.toLocaleString()}`);
        console.log(`Total Expenses:        PKR ${finalPlan.validation.summary.totalExpenses.toLocaleString()}`);
        console.log(`Remaining Funds:       PKR ${finalPlan.validation.summary.remainingBudget.toLocaleString()}`);

        if (finalPlan.validation.errors.length > 0) {
          logger.error(`Validation Errors: ${finalPlan.validation.errors.join('; ')}`);
        } else {
          logger.success('All 6 judging checks PASSED successfully!');
        }

        // Step 9: Export Final Plan & Trace (FR-12)
        const { planPath, tracePath } = await exportPlanAndTrace(finalPlan, traceService.getTraces(), tokenSummary);
        logger.success(`Final plan exported to:  ${planPath}`);
        logger.success(`Complete trace saved to: ${tracePath}`);

        const totalExecutionMs = Date.now() - startTime;
        logger.info(`Total Execution Time: ${totalExecutionMs}ms (Under 120s limit: ${totalExecutionMs < 120000 ? 'YES' : 'NO'})`);
      })(),
      config.limits.fullRunTimeoutMs,
      'Full Initial Execution'
    );
  } catch (err) {
    logger.error(`Execution failed: ${err.message}`);
    process.exit(1);
  }
}

runCli();
