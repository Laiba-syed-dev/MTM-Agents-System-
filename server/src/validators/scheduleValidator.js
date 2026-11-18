export function validateSchedule({ activities, totalDurationMinutes = 240, mandatoryPrayerBreakMinutes = 15 }) {
  const errors = [];

  if (!Array.isArray(activities) || activities.length === 0) {
    errors.push('Schedule must contain a non-empty list of activities.');
    return {
      valid: false,
      passed: false,
      name: 'schedule',
      scheduledMinutes: 0,
      errors,
    };
  }

  const scheduledMinutes = activities.reduce((sum, a) => sum + (Number(a.durationMinutes) || 0), 0);

  if (scheduledMinutes !== totalDurationMinutes) {
    errors.push(`Schedule duration is ${scheduledMinutes} minutes, but required duration is exactly ${totalDurationMinutes} minutes (4 hours).`);
  }

  // Check mandatory prayer break
  const hasPrayerBreak = activities.some((a) => {
    const title = (a.title || a.name || '').toLowerCase();
    return (title.includes('prayer') || title.includes('namaz')) && Number(a.durationMinutes) >= mandatoryPrayerBreakMinutes;
  });

  if (!hasPrayerBreak) {
    errors.push(`Schedule missing mandatory ${mandatoryPrayerBreakMinutes}-minute prayer break.`);
  }

  return {
    valid: errors.length === 0,
    passed: errors.length === 0,
    name: 'schedule',
    scheduledMinutes,
    hasPrayerBreak,
    errors,
  };
}
