import express from 'express';
import { globalStore } from '../models/store.js';
import { parseMessagePack } from '../services/messageParser.js';
import { extractFactsFromMessages } from '../services/factExtractor.js';
import { FactResolver } from '../services/factResolver.js';
import { PlanningService } from '../services/planningService.js';
import { traceService } from '../services/traceService.js';
import { exportPlanAndTrace } from '../services/exportService.js';

const router = express.Router();

// Create session
router.post('/', (req, res) => {
  const sessionId = req.body.sessionId || `session_${Date.now()}`;
  res.json({ success: true, sessionId });
});

// Process session
router.post('/:id/process', async (req, res) => {
  const sessionId = req.params.id;
  const pack = await globalStore.getMessagePack(sessionId);

  if (!pack) {
    return res.status(404).json({ success: false, error: 'Message pack for session not found' });
  }

  try {
    traceService.clear();

    // 1. Parse messages
    const messages = parseMessagePack(pack.originalContent, pack._id, sessionId);
    for (const msg of messages) {
      await globalStore.addMessage(msg);
    }

    // 2. Extract facts
    const extractedFacts = await extractFactsFromMessages(messages, sessionId);

    // 3. Resolve conflicts
    const resolver = new FactResolver(sessionId);
    const { acceptedFacts, rejectedRecords } = await resolver.resolveFacts(extractedFacts, messages);

    // 4. Run planning & validation
    const planningService = new PlanningService(sessionId);
    const plan = await planningService.generateInitialPlan(acceptedFacts);

    // 5. Export
    const tokenSummary = traceService.tokenAccumulator.getSummary();
    await exportPlanAndTrace(plan, traceService.getTraces(), tokenSummary);

    res.json({
      success: true,
      sessionId,
      messagesCount: messages.length,
      factsCount: acceptedFacts.length,
      rejectedCount: rejectedRecords.length,
      plan,
      tokenSummary,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get session info / status
router.get('/:id', async (req, res) => {
  const sessionId = req.params.id;
  const plan = await globalStore.getLatestPlan(sessionId);
  const messages = await globalStore.getMessagesBySession(sessionId);
  const facts = await globalStore.getFactsBySession(sessionId);
  const rejected = await globalStore.getRejectedBySession(sessionId);

  res.json({
    success: true,
    sessionId,
    status: plan ? 'completed' : messages.length ? 'uploaded' : 'empty',
    stats: {
      messagesCount: messages.length,
      factsCount: facts.length,
      rejectedCount: rejected.length,
      currentVersion: plan ? plan.version : 0,
      isValid: plan ? plan.validation.valid : false,
    },
  });
});

// Get messages
router.get('/:id/messages', async (req, res) => {
  const messages = await globalStore.getMessagesBySession(req.params.id);
  res.json({ success: true, count: messages.length, messages });
});

// Get facts
router.get('/:id/facts', async (req, res) => {
  const facts = await globalStore.getFactsBySession(req.params.id);
  res.json({ success: true, count: facts.length, facts });
});

// Get current plan
router.get('/:id/plan', async (req, res) => {
  const plan = await globalStore.getLatestPlan(req.params.id);
  if (!plan) {
    return res.status(404).json({ success: false, error: 'No plan generated yet' });
  }
  res.json({ success: true, plan });
});

// Get all plan versions (history)
router.get('/:id/plans', async (req, res) => {
  const plans = await globalStore.getPlansBySession(req.params.id);
  res.json({ success: true, count: plans.length, plans });
});

// Get execution trace
router.get('/:id/trace', async (req, res) => {
  const traces = await globalStore.getTracesBySession(req.params.id);
  const tokenSummary = traceService.tokenAccumulator.getSummary();
  res.json({ success: true, count: traces.length, traces, tokenSummary });
});

// Get rejected messages
router.get('/:id/rejected', async (req, res) => {
  const rejected = await globalStore.getRejectedBySession(req.params.id);
  res.json({ success: true, count: rejected.length, rejected });
});

// Incremental update (FR-10)
router.post('/:id/update', async (req, res) => {
  const sessionId = req.params.id;
  const { message } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ success: false, error: 'Message content is required for update' });
  }

  try {
    const planningService = new PlanningService(sessionId);
    const result = await planningService.updatePlanWithNewMessage(message.trim());
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Export plan & trace
router.get('/:id/export', async (req, res) => {
  const sessionId = req.params.id;
  const plan = await globalStore.getLatestPlan(sessionId);
  const traces = await globalStore.getTracesBySession(sessionId);
  const tokenSummary = traceService.tokenAccumulator.getSummary();

  if (!plan) {
    return res.status(404).json({ success: false, error: 'No plan available to export' });
  }

  const exported = await exportPlanAndTrace(plan, traces, tokenSummary);
  res.json({ success: true, ...exported, plan, traces, tokenSummary });
});

export default router;
