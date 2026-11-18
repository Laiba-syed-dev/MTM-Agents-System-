import test from 'node:test';
import assert from 'node:assert';
import { validateVenue } from '../../src/validators/venueValidator.js';
import { validateSchedule } from '../../src/validators/scheduleValidator.js';
import { validateFood } from '../../src/validators/foodValidator.js';
import { validateJudging } from '../../src/validators/judgingValidator.js';
import { validateBudget } from '../../src/validators/budgetValidator.js';
import { runGlobalValidation } from '../../src/validators/globalValidator.js';

test('Venue Validator: passes when capacity >= attendees', () => {
  const result = validateVenue({
    capacity: 200,
    attendees: 177,
    selectedHall: 'Hall A',
    cost: 120000,
  });
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.availableCapacity, 23);
});

test('Venue Validator: fails when capacity < attendees', () => {
  const result = validateVenue({
    capacity: 80,
    attendees: 177,
    selectedHall: 'Room D',
    cost: 40000,
  });
  assert.strictEqual(result.valid, false);
  assert.match(result.errors[0], /less than required attendees/);
});

test('Schedule Validator: enforces 240 mins and prayer break', () => {
  const validSchedule = validateSchedule({
    activities: [
      { name: 'Opening', durationMinutes: 30 },
      { name: 'Hacking 1', durationMinutes: 90 },
      { name: 'Prayer & Lunch', durationMinutes: 30 },
      { name: 'Hacking 2', durationMinutes: 45 },
      { name: 'Judging', durationMinutes: 45 },
    ],
    totalDurationMinutes: 240,
    mandatoryPrayerBreakMinutes: 15,
  });
  assert.strictEqual(validSchedule.valid, true);
  assert.strictEqual(validSchedule.scheduledMinutes, 240);

  const missingPrayer = validateSchedule({
    activities: [
      { name: 'Hacking 1', durationMinutes: 120 },
      { name: 'Hacking 2', durationMinutes: 120 },
    ],
  });
  assert.strictEqual(missingPrayer.valid, false);
  assert.match(missingPrayer.errors[0], /missing mandatory/);
});

test('Food Validator: ensures quantity covers attendees and calculates arithmetic correctly', () => {
  const validFood = validateFood({
    quantity: 177,
    attendees: 177,
    pricePerPerson: 1200,
    deliveryFee: 0,
    totalCalculatedCost: 177 * 1200,
  });
  assert.strictEqual(validFood.valid, true);

  const shortFood = validateFood({
    quantity: 100,
    attendees: 177,
    pricePerPerson: 1200,
  });
  assert.strictEqual(shortFood.valid, false);
  assert.match(shortFood.errors[0], /does not cover all required attendees/);
});

test('Judging Validator: enforces maximum 3 teams per judge', () => {
  const validJudging = validateJudging({
    totalTeams: 50,
    availableJudges: 20,
    assignedJudges: 17,
    maxTeamsPerJudge: 3,
  });
  assert.strictEqual(validJudging.valid, true);
  assert.strictEqual(validJudging.minJudgesRequired, 17);

  const tooFewJudges = validateJudging({
    totalTeams: 50,
    availableJudges: 20,
    assignedJudges: 10,
    maxTeamsPerJudge: 3,
  });
  assert.strictEqual(tooFewJudges.valid, false);
});

test('Budget Validator: checks total expenses and remaining funds', () => {
  const result = validateBudget({
    totalBudget: 650000,
    expenses: [
      { name: 'Venue', amount: 120000 },
      { name: 'Food', amount: 212400 },
      { name: 'Judges', amount: 85000 },
      { name: 'Prizes', amount: 100000 },
      { name: 'Internet', amount: 20000 },
      { name: 'Printing', amount: 10000 },
    ],
  });
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.totalExpenses, 547400);
  assert.strictEqual(result.remainingBudget, 102600);
});

test('Global Validator: checks all 5 planning areas independently', () => {
  const mockPlan = {
    venue: { capacity: 200, attendees: 177, selectedHall: 'Hall A', cost: 120000 },
    schedule: [
      { name: 'Opening', durationMinutes: 30 },
      { name: 'Hacking 1', durationMinutes: 90 },
      { name: 'Prayer & Lunch', durationMinutes: 30 },
      { name: 'Hacking 2', durationMinutes: 45 },
      { name: 'Judging', durationMinutes: 45 },
    ],
    food: { quantity: 177, attendees: 177, pricePerPerson: 1200, deliveryFee: 0, totalCalculatedCost: 212400 },
    judging: { totalTeams: 50, availableJudges: 20, assignedJudges: 17, maxTeamsPerJudge: 3 },
    budget: {
      totalBudget: 650000,
      expenses: [
        { name: 'Venue', amount: 120000 },
        { name: 'Food', amount: 212400 },
        { name: 'Judges', amount: 85000 },
      ],
    },
  };

  const globalResult = runGlobalValidation(mockPlan);
  assert.strictEqual(globalResult.valid, true);
  assert.strictEqual(globalResult.checks.length, 6);
});
