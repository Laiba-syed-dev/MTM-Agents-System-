import { validateVenue } from './venueValidator.js';
import { validateSchedule } from './scheduleValidator.js';
import { validateFood } from './foodValidator.js';
import { validateJudging } from './judgingValidator.js';
import { validateBudget } from './budgetValidator.js';

export function runGlobalValidation(plan) {
  const checks = [];
  const allErrors = [];

  // 1. Venue check
  const venueRes = validateVenue(plan.venue || {});
  checks.push({ name: 'venue_capacity', passed: venueRes.valid, errors: venueRes.errors });
  if (!venueRes.valid) allErrors.push(...venueRes.errors);

  // 2. Schedule check
  const scheduleRes = validateSchedule({
    activities: plan.schedule || [],
    totalDurationMinutes: 240,
    mandatoryPrayerBreakMinutes: 15,
  });
  checks.push({ name: 'schedule', passed: scheduleRes.valid, errors: scheduleRes.errors });
  if (!scheduleRes.valid) allErrors.push(...scheduleRes.errors);

  // 3. Food check
  const foodRes = validateFood(plan.food || {});
  checks.push({ name: 'food_quantity', passed: foodRes.valid, errors: foodRes.errors });
  if (!foodRes.valid) allErrors.push(...foodRes.errors);

  // 4. Judging check
  const judgingRes = validateJudging(plan.judging || {});
  checks.push({ name: 'judging_coverage', passed: judgingRes.valid, errors: judgingRes.errors });
  if (!judgingRes.valid) allErrors.push(...judgingRes.errors);

  // 5. Budget check
  const budgetRes = validateBudget(plan.budget || {});
  checks.push({ name: 'budget', passed: budgetRes.valid, errors: budgetRes.errors });
  if (!budgetRes.valid) allErrors.push(...budgetRes.errors);

  // Check all five areas are present
  const areasCovered = ['venue', 'schedule', 'food', 'judging', 'budget'].every(
    (area) => plan[area] !== undefined && plan[area] !== null
  );
  checks.push({ name: 'all_five_areas_covered', passed: areasCovered, errors: areasCovered ? [] : ['Not all 5 areas are covered in plan.'] });
  if (!areasCovered) allErrors.push('Not all five planning areas are covered.');

  const isGloballyValid = checks.every((c) => c.passed);

  return {
    valid: isGloballyValid,
    checks,
    errors: allErrors,
    summary: {
      venueCapacity: venueRes.availableCapacity,
      scheduledMinutes: scheduleRes.scheduledMinutes,
      totalExpenses: budgetRes.totalExpenses,
      remainingBudget: budgetRes.remainingBudget,
      withinBudget: budgetRes.withinBudget,
      judgesAssigned: judgingRes.assignedJudges,
    },
  };
}
