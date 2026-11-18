export function validateFood({ quantity, attendees, pricePerPerson, deliveryFee = 0, totalCalculatedCost }) {
  const errors = [];

  if (typeof quantity !== 'number' || quantity < attendees) {
    errors.push(`Food quantity (${quantity}) does not cover all required attendees (${attendees}).`);
  }

  if (typeof pricePerPerson !== 'number' || pricePerPerson <= 0) {
    errors.push(`Invalid price per person: ${pricePerPerson}`);
  }

  const expectedCost = (quantity * pricePerPerson) + (deliveryFee || 0);

  if (totalCalculatedCost !== undefined && Math.abs(totalCalculatedCost - expectedCost) > 0.01) {
    errors.push(`Food cost arithmetic mismatch: reported ${totalCalculatedCost}, calculated ${expectedCost}`);
  }

  return {
    valid: errors.length === 0,
    passed: errors.length === 0,
    name: 'food_quantity',
    quantity,
    attendees,
    pricePerPerson,
    deliveryFee,
    expectedCost,
    errors,
  };
}
