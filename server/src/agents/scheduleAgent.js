import { aiService } from '../services/aiService.js';
import { traceService } from '../services/traceService.js';
import { parseAndValidateAiJson } from '../schemas/aiResponseSchema.js';

export async function runSchedulePlanning(acceptedFacts, sessionId = 'session_001') {
  const prompt = `You are the Schedule Planner for a 4-hour (240 minutes) physical hackathon in Islamabad.
Constraints:
- Total event duration: Exactly 4 hours (240 minutes).
- Mandatory: At least one 15-minute prayer break.
- Mandatory: 45 minutes of judging session (to allow 15 minutes per team for 3 teams per judge).
- Mandatory: Non-overlapping activities that total exactly 240 minutes.

Return JSON format:
{
  "totalDurationMinutes": 240,
  "activities": [
    { "name": "Opening Ceremony & Briefing", "durationMinutes": 30, "startTime": "10:00", "endTime": "10:30" },
    { "name": "Hacking Block 1", "durationMinutes": 90, "startTime": "10:30", "endTime": "12:00" },
    { "name": "Mandatory Prayer & Lunch Break", "durationMinutes": 30, "startTime": "12:00", "endTime": "12:30" },
    { "name": "Hacking Block 2", "durationMinutes": 45, "startTime": "12:30", "endTime": "13:15" },
    { "name": "Judging & Project Demos", "durationMinutes": 45, "startTime": "13:15", "endTime": "14:00" }
  ],
  "mandatoryPrayerBreakIncluded": true,
  "prayerBreakMinutes": 15
}`;

  const res = await aiService.generate({
    area: 'schedule',
    prompt,
    systemInstruction: 'You produce a valid 4-hour hackathon timetable including prayer break and judging.',
    expectedJson: true,
  });

  traceService.recordCall({
    sessionId,
    area: 'schedule',
    provider: res.provider,
    modelId: res.modelId,
    input: res.input,
    output: res.output,
    usage: res.usage,
    durationMs: res.durationMs,
    status: res.status,
  });

  const parsed = parseAndValidateAiJson(res.output);
  if (parsed.success && Array.isArray(parsed.data?.activities)) {
    return parsed.data;
  }
  return aiService._planScheduleLocally(prompt);
}
