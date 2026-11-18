import { aiService } from '../services/aiService.js';
import { traceService } from '../services/traceService.js';
import { parseAndValidateAiJson } from '../schemas/aiResponseSchema.js';

export async function runVenuePlanning(acceptedFacts, sessionId = 'session_001') {
  const venueFacts = acceptedFacts.filter((f) => f.category === 'venue' || f.category === 'general');
  const prompt = `You are the Venue Planner for the Mind to Machine Hackathon in Islamabad.
Based on the accepted facts:
- Total required attendance: 177 attendees (150 students + 10 staff + 17 judges).
- Venue halls:
  * Room D: seats 80 at Rs 40,000
  * Hall A: seats 200 at Rs 120,000
  * Hall B: seats 200 at Rs 150,000 (has standby generator)
  * Hall C: seats 300 at Rs 220,000 (has standby generator)

Choose the best venue that fits all 177 attendees, minimizes cost while providing required amenities.
Return JSON format:
{
  "selectedHall": "Hall A",
  "capacity": 200,
  "cost": 120000,
  "hasBackupGenerator": false,
  "reasoning": "Hall A seats 200 attendees which accommodates all 177 participants at lowest cost."
}`;

  const res = await aiService.generate({
    area: 'venue',
    prompt,
    systemInstruction: 'You plan the event venue strictly based on attendee numbers and cost constraints.',
    expectedJson: true,
  });

  traceService.recordCall({
    sessionId,
    area: 'venue',
    provider: res.provider,
    modelId: res.modelId,
    input: res.input,
    output: res.output,
    usage: res.usage,
    durationMs: res.durationMs,
    status: res.status,
  });

  const parsed = parseAndValidateAiJson(res.output);
  if (parsed.success && parsed.data?.selectedHall) {
    return parsed.data;
  }
  return aiService._planVenueLocally(prompt);
}
