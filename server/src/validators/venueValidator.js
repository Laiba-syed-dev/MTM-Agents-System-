export function validateVenue({ capacity, attendees, selectedHall, cost, hasBackupGenerator }) {
  const errors = [];
  
  if (!selectedHall) {
    errors.push('No venue hall selected.');
  }

  if (typeof capacity !== 'number' || capacity <= 0) {
    errors.push(`Invalid venue capacity: ${capacity}`);
  }

  if (typeof attendees !== 'number' || attendees <= 0) {
    errors.push(`Invalid attendees count: ${attendees}`);
  }

  if (capacity < attendees) {
    errors.push(`Venue capacity (${capacity}) is less than required attendees (${attendees}).`);
  }

  if (typeof cost !== 'number' || cost < 0) {
    errors.push(`Invalid venue cost: ${cost}`);
  }

  return {
    valid: errors.length === 0,
    passed: errors.length === 0,
    name: 'venue_capacity',
    availableCapacity: Math.max(0, capacity - attendees),
    errors,
  };
}
