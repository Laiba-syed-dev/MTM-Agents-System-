export const FACT_CATEGORIES = ['venue', 'schedule', 'food', 'judging', 'budget', 'general'];

export const DECISION_TYPES = {
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  SUPERSEDED: 'superseded',
  IRRELEVANT: 'irrelevant',
  UNCERTAIN: 'uncertain',
  CONFLICTED: 'conflicted',
};

export function validateFactObject(fact) {
  if (!fact || typeof fact !== 'object') return false;
  if (!fact.category || !FACT_CATEGORIES.includes(fact.category)) return false;
  if (!fact.field || typeof fact.field !== 'string') return false;
  if (fact.value === undefined) return false;
  if (!fact.sourceMessageId) return false;
  return true;
}
