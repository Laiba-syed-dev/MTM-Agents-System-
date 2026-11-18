import { aiService } from '../services/aiService.js';
import { traceService } from '../services/traceService.js';
import { parseAndValidateAiJson } from '../schemas/aiResponseSchema.js';

export async function runBudgetPlanning(acceptedFacts, venuePlan, foodPlan, judgingPlan, sessionId = 'session_001') {
  const budgetFacts = acceptedFacts.filter((f) => f.category === 'budget');
  const totalBudgetFact = budgetFacts.find((f) => f.field === 'totalBudget');
  const totalBudget = totalBudgetFact ? totalBudgetFact.value : 650000;

  // Extract other expenses from accepted facts (prizes, internet, printing)
  const otherExpenses = [];
  for (const f of budgetFacts) {
    if (f.field === 'expense_item') {
      otherExpenses.push({
        name: f.name || 'Pre-committed Expense',
        category: 'budget',
        amount: Number(f.value) || 0,
        sourceMessageId: f.messageId,
      });
    }
  }

  // If no other expenses extracted yet, populate defaults from facts
  if (otherExpenses.length === 0) {
    otherExpenses.push(
      { name: 'Prizes', category: 'budget', amount: 100000 },
      { name: 'Backup Internet', category: 'budget', amount: 20000 },
      { name: 'Printing', category: 'budget', amount: 10000 }
    );
  }

  const prompt = `You are the Budget Planner for the hackathon.
Approved total budget: Rs ${totalBudget.toLocaleString()}
Departmental expenses:
- Venue (${venuePlan?.selectedHall || 'Hall A'}): Rs ${venuePlan?.cost?.toLocaleString() || '120,000'}
- Food Catering: Rs ${foodPlan?.totalCalculatedCost?.toLocaleString() || '212,400'}
- Judges Honorarium: Rs ${judgingPlan?.totalHonorarium?.toLocaleString() || '85,000'}
- Other pre-committed expenses: ${otherExpenses.map((e) => `${e.name}: Rs ${e.amount.toLocaleString()}`).join(', ')}

Compile the itemized expenses and calculate total expenses and remaining funds.
Return JSON format:
{
  "totalBudget": ${totalBudget},
  "expenses": [
    { "name": "Venue Rental (${venuePlan?.selectedHall || 'Hall A'})", "category": "venue", "amount": ${venuePlan?.cost || 120000} },
    { "name": "Food Catering", "category": "food", "amount": ${foodPlan?.totalCalculatedCost || 212400} },
    { "name": "Judges Honorarium", "category": "judging", "amount": ${judgingPlan?.totalHonorarium || 85000} },
    ${otherExpenses.map((e) => JSON.stringify(e)).join(',\n    ')}
  ]
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
  return aiService._planBudgetLocally(prompt);
}
