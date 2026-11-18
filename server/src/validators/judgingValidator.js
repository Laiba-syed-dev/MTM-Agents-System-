export function validateJudging({ totalTeams = 50, availableJudges = 20, assignedJudges = 17, maxTeamsPerJudge = 3, minutesPerTeam = 15, honorariumPerJudge = 5000 }) {
  const errors = [];

  const minJudgesRequired = Math.ceil(totalTeams / maxTeamsPerJudge);

  if (availableJudges < minJudgesRequired) {
    errors.push(`Not enough judges available: ${availableJudges} available, but at least ${minJudgesRequired} are required for ${totalTeams} teams.`);
  }

  if (assignedJudges < minJudgesRequired) {
    errors.push(`Assigned judges (${assignedJudges}) is below required minimum (${minJudgesRequired}) to cover ${totalTeams} teams at max ${maxTeamsPerJudge} teams/judge.`);
  }

  const expectedHonorariumTotal = assignedJudges * honorariumPerJudge;

  return {
    valid: errors.length === 0,
    passed: errors.length === 0,
    name: 'judging_coverage',
    totalTeams,
    minJudgesRequired,
    assignedJudges,
    availableJudges,
    expectedHonorariumTotal,
    maxJudgingMinutes: maxTeamsPerJudge * minutesPerTeam,
    errors,
  };
}
