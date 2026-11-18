import test from 'node:test';
import assert from 'node:assert';
import path from 'path';
import { fileURLToPath } from 'url';
import { readMessageFile } from '../../src/services/fileReader.js';
import { parseMessagePack } from '../../src/services/messageParser.js';
import { extractFactsFromMessages } from '../../src/services/factExtractor.js';
import { FactResolver } from '../../src/services/factResolver.js';
import { PlanningService } from '../../src/services/planningService.js';
import { globalStore } from '../../src/models/store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('Integration Pipeline: Process Sample Pack & Sequential Updates', async () => {
  const samplePath = path.resolve(__dirname, '../../../input/messages.txt');
  const { rawContent } = await readMessageFile(samplePath);
  const sessionId = 'test_integration_session';

  // 1. Ingestion & Parsing
  const messages = parseMessagePack(rawContent, 'pack_test', sessionId);
  assert.strictEqual(messages.length, 8);
  for (const m of messages) globalStore.addMessage(m);

  // 2. Fact Extraction
  const extractedFacts = await extractFactsFromMessages(messages, sessionId);
  assert.ok(extractedFacts.length >= 10);

  // 3. Fact Resolution
  const resolver = new FactResolver(sessionId);
  const { acceptedFacts, rejectedRecords } = await resolver.resolveFacts(extractedFacts, messages);
  assert.ok(acceptedFacts.length > 0);
  assert.strictEqual(rejectedRecords.length, 1); // DJ proposal rejected

  // 4. Initial Plan Generation
  const planningService = new PlanningService(sessionId);
  const initialPlan = await planningService.generateInitialPlan(acceptedFacts);
  assert.strictEqual(initialPlan.status, 'valid');
  assert.strictEqual(initialPlan.version, 1);
  assert.strictEqual(initialPlan.venue.capacity, 200);
  assert.strictEqual(initialPlan.food.quantity, 177);
  assert.strictEqual(initialPlan.judging.assignedJudges, 17);
  assert.strictEqual(initialPlan.budget.totalBudget, 650000);

  // 5. Sequential Update 1: Change (Finance printing bill Rs 15,000 not Rs 10,000)
  const update1Result = await planningService.updatePlanWithNewMessage(
    'Finance here. The printing bill came in at Rs 15,000, not Rs 10,000.'
  );
  assert.strictEqual(update1Result.success, true);
  assert.strictEqual(update1Result.currentVersion, 2);
  assert.deepStrictEqual(update1Result.affectedAreas, ['budget']);
  assert.strictEqual(update1Result.validationStatus, 'valid');

  // Verify printing was updated in budget
  const printingExpense = update1Result.plan.budget.expenses.find((e) => e.name.toLowerCase().includes('printing'));
  assert.strictEqual(printingExpense.amount, 15000);

  // 6. Sequential Update 2: Wrong Message (Caterer rounding down to 100 boxes)
  const update2Result = await planningService.updatePlanWithNewMessage(
    'Caterer: I have rounded your order down to 100 boxes to keep the cost low.'
  );
  assert.strictEqual(update2Result.success, true);
  assert.strictEqual(update2Result.rejected, true);
  assert.strictEqual(update2Result.retainedPreviousValid, true);
  assert.strictEqual(update2Result.currentVersion, 2); // Retained version 2
  assert.strictEqual(update2Result.plan.food.quantity, 177); // Retained 177 boxes!
  assert.match(update2Result.rejectionReason, /contradicts confirmed attendance requirement/i);
});
