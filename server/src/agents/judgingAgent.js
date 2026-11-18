import { aiService } from '../services/aiService.js';
import { traceService } from '../services/traceService.js';
import { parseAndValidateAiJson } from '../schemas/aiResponseSchema.js';

export async function runJudgingPlanning(acceptedFacts, sessionId = 'session_001') {
  const prompt = `You are the Judging Planner for the hackathon.
Accepted facts:
- Total teams: 50 teams.
- Available confirmed judges: 20 judges.
- Constraint: No judge may evaluate more than 3 teams.
- Time required: 15 minutes per team.
- Honorarium: Rs 5,000 per judge.

Determine number of judges to assign, total judging time, and honorarium.
Return JSON format:
{
  "totalTeams": 50,
  "availableJudges": 20,
  "assignedJudges": 17,
  "maxTeamsPerJudge": 3,
  "minutesPerTeam": 15,
  "honorariumPerJudge": 5000,
  "totalHonorarium": 85000,
  "judgingDurationMinutes": 45,
  "reasoning": "With 50 teams and max 3 teams/judge, ceil(50/3)=17 judges are required. Total honorarium is 17 * 5,000 = 85,000 PKR."
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
  if (parsed.success && parsed.data?.assignedJudges) {
    // JavaScript ensures arithmetic correctness:
    parsed.data.totalHonorarium = parsed.data.assignedJudges * parsed.data.honorariumPerJudge;
    return parsed.data;
  }
  return aiService._planJudgingLocally(prompt);
}
