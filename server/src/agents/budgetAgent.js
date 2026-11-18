import { aiService } from '../services/aiService.js';
import { traceService } from '../services/traceService.js';
import { parseAndValidateAiJson } from '../schemas/aiResponseSchema.js';

export async function runBudgetPlanning(acceptedFacts, venuePlan, foodPlan, judgingPlan, sessionId = 'session_001') {
  // 1. Dynamically find total budget fact
  const totalBudgetFact = acceptedFacts.find((f) => f.category === 'budget' && f.field === 'totalBudget');
  const totalBudget = totalBudgetFact ? Number(totalBudgetFact.value) : 650000;

  // 2. Gather all pre-committed expenses dynamically from accepted facts
  const preCommittedExpenses = [];
  for (const f of acceptedFacts) {
    if (f.category === 'budget' && (f.field === 'expense_item' || f.field === 'pre_committed_expense')) {
      preCommittedExpenses.push({
        name: f.name || f.item || 'Committed Expense',
        category: 'budget',
        amount: Number(f.value) || 0,
        sourceMessageId: f.messageId,
      });
    }
  }

  // 3. Assemble consolidated expenses list
  const consolidatedExpenses = [
    {
      name: `Venue Rental (${venuePlan?.selectedHall || 'Hall Option'})`,
      category: 'venue',
      amount: venuePlan?.cost || 0,
    },
    {
      name: `Food & Catering (${foodPlan?.packageSelected || 'Lunch'} for ${foodPlan?.quantity || 0} heads)`,
      category: 'food',
      amount: foodPlan?.totalCalculatedCost || 0,
    },
    {
      name: `Judges Honorarium (${judgingPlan?.assignedJudges || 0} judges)`,
      category: 'judging',
      amount: judgingPlan?.totalHonorarium || 0,
    },
    ...preCommittedExpenses,
  ];

  const totalCalculatedExpenses = consolidatedExpenses.reduce((sum, e) => sum + e.amount, 0);
  const remainingBudget = totalBudget - totalCalculatedExpenses;

  const prompt = `You are the Budget Planner for the hackathon.
Approved total budget: Rs ${totalBudget.toLocaleString()}
Departmental expenses:
${consolidatedExpenses.map((e) => `- ${e.name}: Rs ${e.amount.toLocaleString()}`).join('\n')}

Compile the itemized expenses and calculate total expenses and remaining funds.
Return JSON format:
{
  "totalBudget": ${totalBudget},
  "totalExpenses": ${totalCalculatedExpenses},
  "remainingBudget": ${remainingBudget},
  "expenses": ${JSON.stringify(consolidatedExpenses, null, 2)}
}`;

  const res = await aiService.generate({
    area: 'budget',
    prompt,
    systemInstruction: 'You compile all budgetary expenses and track remaining funds.',
    expectedJson: true,
  });

  traceService.recordCall({
    sessionId,
    area: 'budget',
    provider: res.provider,
    modelId: res.modelId,
    input: res.input,
    output: res.output,
    usage: res.usage,
    durationMs: res.durationMs,
    status: res.status,
  });

  const parsed = parseAndValidateAiJson(res.output);
  if (parsed.success && parsed.data?.totalBudget && Array.isArray(parsed.data?.expenses)) {
    return parsed.data;
  }

  // Deterministic JavaScript calculation
  return {
    totalBudget,
    totalExpenses: totalCalculatedExpenses,
    remainingBudget,
    expenses: consolidatedExpenses,
  };
}
