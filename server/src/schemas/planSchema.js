export function validatePlanObject(plan) {
  if (!plan || typeof plan !== 'object') return false;
  if (!plan.venue || typeof plan.venue !== 'object') return false;
  if (!Array.isArray(plan.schedule)) return false;
  if (!plan.food || typeof plan.food !== 'object') return false;
  if (!plan.judging || typeof plan.judging !== 'object') return false;
  if (!plan.budget || typeof plan.budget !== 'object') return false;
  return true;
}
