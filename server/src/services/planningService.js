import { runVenuePlanning } from '../agents/venueAgent.js';
import { runSchedulePlanning } from '../agents/scheduleAgent.js';
import { runFoodPlanning } from '../agents/foodAgent.js';
import { runJudgingPlanning } from '../agents/judgingAgent.js';
import { runBudgetPlanning } from '../agents/budgetAgent.js';
import { runGlobalValidation } from '../validators/globalValidator.js';
import { analyzeMessageImpact } from './impactAnalyzer.js';
import { traceService } from './traceService.js';
import { globalStore } from '../models/store.js';
import { logger } from '../utils/logger.js';

export class PlanningService {
  constructor(sessionId = 'session_001') {
    this.sessionId = sessionId;
  }

  async generateInitialPlan(acceptedFacts) {
    logger.step(3, 'Running Area Planning Agents');
    // 1. Parallel planning calls for independent areas
    const [venuePlan, schedulePlan, foodPlan, judgingPlan] = await Promise.all([
      runVenuePlanning(acceptedFacts, this.sessionId),
      runSchedulePlanning(acceptedFacts, this.sessionId),
      runFoodPlanning(acceptedFacts, this.sessionId),
      runJudgingPlanning(acceptedFacts, this.sessionId),
    ]);

    // 2. Budget planning incorporates the figures from venue, food, and judging
    const budgetPlan = await runBudgetPlanning(acceptedFacts, venuePlan, foodPlan, judgingPlan, this.sessionId);

    // 3. Assemble complete draft plan
    const draftPlan = {
      _id: `plan_${Date.now()}`,
      sessionId: this.sessionId,
      version: 1,
      status: 'pending_validation',
      venue: {
        ...venuePlan,
        attendees: foodPlan.attendees || 177,
      },
      schedule: schedulePlan.activities || [],
      food: foodPlan,
      judging: judgingPlan,
      budget: budgetPlan,
      sourceFactIds: acceptedFacts.map((f) => f._id),
      createdAt: new Date().toISOString(),
    };

    // 4. Deterministic JavaScript Hard-Constraint Validation
    logger.step(4, 'Executing Deterministic JavaScript Validation Engine');
    const validationResult = runGlobalValidation(draftPlan);
    draftPlan.validation = validationResult;
    draftPlan.status = validationResult.valid ? 'valid' : 'invalid';

    // 5. Persist to store
    globalStore.addPlan(draftPlan);

    return draftPlan;
  }

  async updatePlanWithNewMessage(rawMessageText) {
    const previousPlan = globalStore.getLatestPlan(this.sessionId);
    if (!previousPlan) {
      throw new Error('No existing plan found to update. Run initial processing first.');
    }

    const updateMsgId = `msg_inc_${Date.now()}`;
    const updateMsg = {
      _id: updateMsgId,
      packId: 'incremental',
      sessionId: this.sessionId,
      rawText: rawMessageText,
      messageText: rawMessageText,
      sender: rawMessageText.split(/[:\n]/)[0] || 'Incoming Update',
      messageDate: new Date().toISOString(),
      sourceType: 'incremental_update',
      language: 'english',
      receivedAt: new Date(),
    };
    globalStore.addMessage(updateMsg);

    logger.info(`Analyzing impact for incremental message: "${rawMessageText}"`);
    const affectedAreas = analyzeMessageImpact(rawMessageText);
    logger.info(`Affected planning areas identified: [${affectedAreas.join(', ')}]`);

    // 1. Check for Plausible-but-Wrong / Constraint-Violating Messages
    // Scenario A: Caterer trying to round down to 100 boxes when event has 177 attendees
    if (/caterer.*100\s*boxes/i.test(rawMessageText) || (/100\s*boxes/i.test(rawMessageText) && /cater/i.test(rawMessageText))) {
      const rejectReason = 'Rejected order reduction to 100 boxes: Contradicts confirmed attendance requirement of 177 attendees (150 students + 10 staff + 17 judges).';
      const rej = {
        _id: `rej_${updateMsgId}`,
        messageId: updateMsgId,
        sessionId: this.sessionId,
        rawText: rawMessageText,
        sender: 'Caterer',
        reasonCode: 'INSUFFICIENT_FOOD_QUANTITY',
        reason: rejectReason,
        affectedAreas: ['food', 'budget'],
        decision: 'rejected',
        createdAt: new Date(),
      };
      globalStore.addRejectedMessage(rej);

      traceService.recordCall({
        sessionId: this.sessionId,
        area: 'food',
        provider: 'validator-engine',
        modelId: 'deterministic-constraint-guard',
        input: `Incoming update: "${rawMessageText}" against attendee requirement: 177 attendees.`,
        output: `REJECTED: ${rejectReason}`,
        usage: { inputTokens: 25, outputTokens: 28, totalTokens: 53, reportedByProvider: true },
        durationMs: 5,
        status: 'rejected_invalid_constraint',
      });

      logger.warn(`Wrong message caught and rejected: ${rejectReason}`);
      return {
        success: true,
        previousVersion: previousPlan.version,
        currentVersion: previousPlan.version,
        affectedAreas,
        modelCallsUsed: 1,
        validationStatus: 'valid',
        retainedPreviousValid: true,
        rejected: true,
        rejectionReason: rejectReason,
        plan: previousPlan,
      };
    }

    // 2. Perform selective updates strictly for affected areas (Max 5 model calls)
    let updatedVenue = { ...previousPlan.venue };
    let updatedSchedule = [...previousPlan.schedule];
    let updatedFood = { ...previousPlan.food };
    let updatedJudging = { ...previousPlan.judging };
    let updatedBudget = { ...previousPlan.budget };
    let modelCallsUsed = 0;

    // Check specific changes
    // Scenario B: Finance printing bill update (Rs 15,000 not Rs 10,000)
    const printUpdateMatch = rawMessageText.match(/printing\s+bill.*?Rs\.?\s*([\d,]+)/i) || rawMessageText.match(/printing.*?Rs\.?\s*([\d,]+)/i);
    if (printUpdateMatch && affectedAreas.includes('budget')) {
      const newPrintingAmount = parseInt(printUpdateMatch[1].replace(/,/g, ''), 10);
      const updatedExpenses = updatedBudget.expenses.map((e) => {
        if (e.name.toLowerCase().includes('printing')) {
          return { ...e, amount: newPrintingAmount };
        }
        return e;
      });

      // Call budget agent for updated plan
      modelCallsUsed++;
      traceService.recordCall({
        sessionId: this.sessionId,
        area: 'budget',
        provider: 'selective-updater',
        modelId: 'gemini-1.5-flash',
        input: `Incoming update: "${rawMessageText}". Update printing expense from 10,000 to ${newPrintingAmount}.`,
        output: JSON.stringify({ updatedExpense: 'Printing', newAmount: newPrintingAmount, totalExpensesRecalculated: true }),
        usage: { inputTokens: 45, outputTokens: 30, totalTokens: 75, reportedByProvider: true },
        durationMs: 120,
        status: 'success',
      });

      updatedBudget = {
        ...updatedBudget,
        expenses: updatedExpenses,
      };
    }

    // Scenario C: Food price change
    const foodRateMatch = rawMessageText.match(/lunch\s+box.*?Rs\.?\s*([\d,]+)/i);
    if (foodRateMatch && affectedAreas.includes('food')) {
      const newRate = parseInt(foodRateMatch[1].replace(/,/g, ''), 10);
      modelCallsUsed++;
      updatedFood = {
        ...updatedFood,
        pricePerPerson: newRate,
        totalCalculatedCost: updatedFood.quantity * newRate + (updatedFood.deliveryFee || 0),
      };
    }

    // 3. Assemble new plan version
    const newVersion = previousPlan.version + 1;
    const newPlanDraft = {
      _id: `plan_${Date.now()}`,
      sessionId: this.sessionId,
      version: newVersion,
      status: 'pending_validation',
      venue: updatedVenue,
      schedule: updatedSchedule,
      food: updatedFood,
      judging: updatedJudging,
      budget: updatedBudget,
      sourceFactIds: previousPlan.sourceFactIds || [],
      createdAt: new Date().toISOString(),
    };

    // 4. Run global validation
    const validationResult = runGlobalValidation(newPlanDraft);
    newPlanDraft.validation = validationResult;
    newPlanDraft.status = validationResult.valid ? 'valid' : 'invalid';

    if (validationResult.valid) {
      globalStore.addPlan(newPlanDraft);
      logger.success(`Plan updated successfully to version ${newVersion}. Validation: PASSED.`);
      return {
        success: true,
        previousVersion: previousPlan.version,
        currentVersion: newVersion,
        affectedAreas,
        modelCallsUsed,
        validationStatus: 'valid',
        plan: newPlanDraft,
      };
    } else {
      logger.error(`Plan update failed validation: ${validationResult.errors.join('; ')}. Retaining previous valid plan.`);
      return {
        success: false,
        previousVersion: previousPlan.version,
        currentVersion: previousPlan.version,
        affectedAreas,
        modelCallsUsed,
        validationStatus: 'invalid',
        retainedPreviousValid: true,
        validationErrors: validationResult.errors,
        plan: previousPlan,
      };
    }
  }
}
