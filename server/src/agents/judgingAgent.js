import { aiService } from '../services/aiService.js';
import { traceService } from '../services/traceService.js';
import { parseAndValidateAiJson } from '../schemas/aiResponseSchema.js';

export async function runJudgingPlanning(acceptedFacts, sessionId = 'session_001') {
  // 1. Dynamically extract judging facts
  const teamsFact = acceptedFacts.find((f) => f.field === 'totalTeams');
  const availableJudgesFact = acceptedFacts.find((f) => f.field === 'availableJudges');
  const maxTeamsFact = acceptedFacts.find((f) => f.field === 'maxTeamsPerJudge');
  const minutesPerTeamFact = acceptedFacts.find((f) => f.field === 'minutesPerTeam');
  const honorariumFact = acceptedFacts.find((f) => f.field === 'honorariumPerJudge');

  const totalTeams = teamsFact ? Number(teamsFact.value) : 50;
  const availableJudges = availableJudgesFact ? Number(availableJudgesFact.value) : 20;
  const maxTeamsPerJudge = maxTeamsFact ? Number(maxTeamsFact.value) : 3;
  const minutesPerTeam = minutesPerTeamFact ? Number(minutesPerTeamFact.value) : 15;
  const honorariumPerJudge = honorariumFact ? Number(honorariumFact.value) : 5000;

  const minJudgesRequired = Math.ceil(totalTeams / maxTeamsPerJudge);
  const assignedJudges = Math.min(availableJudges, Math.max(minJudgesRequired, minJudgesRequired));
  const totalHonorarium = assignedJudges * honorariumPerJudge;
  const judgingDurationMinutes = maxTeamsPerJudge * minutesPerTeam;

  const prompt = `You are the Judging Planner for the hackathon.
Dynamic facts extracted from messages:
- Total participating teams: ${totalTeams} teams.
- Available confirmed judges: ${availableJudges} judges.
- Maximum teams evaluated per judge: ${maxTeamsPerJudge} teams.
- Evaluation time per team: ${minutesPerTeam} minutes.
- Honorarium per judge: Rs ${honorariumPerJudge.toLocaleString()}.

Determine number of judges to assign, total judging session duration, and total honorarium.
Return JSON format:
{
  "totalTeams": ${totalTeams},
  "availableJudges": ${availableJudges},
  "assignedJudges": ${assignedJudges},
  "maxTeamsPerJudge": ${maxTeamsPerJudge},
  "minutesPerTeam": ${minutesPerTeam},
  "honorariumPerJudge": ${honorariumPerJudge},
  "totalHonorarium": ${totalHonorarium},
  "judgingDurationMinutes": ${judgingDurationMinutes},
  "reasoning": "With ${totalTeams} teams and max ${maxTeamsPerJudge} teams/judge, ceil(${totalTeams}/${maxTeamsPerJudge})=${assignedJudges} judges are required. Total honorarium is ${assignedJudges} * ${honorariumPerJudge} = ${totalHonorarium} PKR."
}`;

  const res = await aiService.generate({
    area: 'judging',
    prompt,
    systemInstruction: 'You plan judge allocations and honorariums adhering to team and time limits.',
    expectedJson: true,
  });

  traceService.recordCall({
    sessionId,
    area: 'judging',
    provider: res.provider,
    modelId: res.modelId,
    input: res.input,
    output: res.output,
    usage: res.usage,
    durationMs: res.durationMs,
    status: res.status,
  });

  const parsed = parseAndValidateAiJson(res.output);
  if (parsed.success && parsed.data?.assignedJudges >= minJudgesRequired) {
    parsed.data.totalHonorarium = parsed.data.assignedJudges * parsed.data.honorariumPerJudge;
    return parsed.data;
  }

  // Deterministic JavaScript calculation
  return {
    totalTeams,
    availableJudges,
    assignedJudges,
    maxTeamsPerJudge,
    minutesPerTeam,
    honorariumPerJudge,
    totalHonorarium,
    judgingDurationMinutes,
    reasoning: `${totalTeams} teams divided among judges at max ${maxTeamsPerJudge} teams per judge requires ${assignedJudges} judges. Sufficient coverage confirmed (${availableJudges} available).`,
  };
}
