export function validateBudget({ totalBudget, expenses = [] }) {
  const errors = [];

  if (typeof totalBudget !== 'number' || totalBudget <= 0) {
    errors.push(`Invalid total budget: ${totalBudget}`);
  }

  const itemized = expenses.map((exp) => ({
    name: exp.name || 'Expense',
    category: exp.category || 'general',
    amount: Number(exp.amount) || 0,
    sourceMessageId: exp.sourceMessageId || null,
  }));

  const totalExpenses = itemized.reduce((sum, item) => sum + item.amount, 0);
  const remainingBudget = totalBudget - totalExpenses;
  const withinBudget = remainingBudget >= 0;

  if (!withinBudget) {
    errors.push(`Budget exceeded by PKR ${Math.abs(remainingBudget).toLocaleString()}! Total budget: ${totalBudget.toLocaleString()}, Total expenses: ${totalExpenses.toLocaleString()}`);
  }

  return {
    valid: errors.length === 0,
    passed: errors.length === 0,
    name: 'budget',
    totalBudget,
    totalExpenses,
    remainingBudget,
    withinBudget,
    itemized,
    errors,
  };
}
