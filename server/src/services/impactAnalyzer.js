export function analyzeMessageImpact(rawMessageText) {
  const text = (rawMessageText || '').toLowerCase();
  const affectedAreas = new Set();

  // Venue keywords
  if (text.includes('venue') || text.includes('hall') || text.includes('capacity') || text.includes('room') || text.includes('seats')) {
    affectedAreas.add('venue');
  }

  // Schedule keywords
  if (text.includes('schedule') || text.includes('prayer') || text.includes('break') || text.includes('timeline') || text.includes('minutes') || text.includes('hours') || text.includes('late')) {
    affectedAreas.add('schedule');
  }

  // Food keywords
  if (text.includes('cater') || text.includes('food') || text.includes('lunch') || text.includes('box') || text.includes('head') || text.includes('menu') || text.includes('biryani')) {
    affectedAreas.add('food');
    // If food cost changes, budget is also directly affected
    affectedAreas.add('budget');
  }

  // Judging keywords
  if (text.includes('judge') || text.includes('judging') || text.includes('honorarium') || text.includes('evaluat')) {
    affectedAreas.add('judging');
  }

  // Budget keywords
  if (text.includes('budget') || text.includes('bill') || text.includes('cost') || text.includes('printing') || text.includes('prizes') || text.includes('internet') || text.includes('rs ') || text.includes('expense') || text.includes('finance')) {
    affectedAreas.add('budget');
  }

  // Default to budget if unspecified financial change, or general if none
  if (affectedAreas.size === 0) {
    affectedAreas.add('general');
  }

  return Array.from(affectedAreas);
}
