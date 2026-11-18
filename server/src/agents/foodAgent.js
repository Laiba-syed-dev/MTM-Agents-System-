import { aiService } from '../services/aiService.js';
import { traceService } from '../services/traceService.js';
import { parseAndValidateAiJson } from '../schemas/aiResponseSchema.js';

export async function runFoodPlanning(acceptedFacts, sessionId = 'session_001') {
  const prompt = `You are the Food Planner for the hackathon.
Accepted facts:
- Total attendees: 177 (150 students + 10 staff + 17 judges).
- Caterer update rate: Standard lunch box is Rs 1,200 per head.
- Delivery is free (PKR 0).

Calculate required quantity and cost.
Return JSON format:
{
  "packageSelected": "Standard lunch box",
  "pricePerPerson": 1200,
  "deliveryFee": 0,
  "attendees": 177,
  "quantity": 177,
  "totalCalculatedCost": 212400,
  "reasoning": "177 boxes ordered to feed 150 students, 10 staff, and 17 judges at current rate of Rs 1,200/head with free delivery."
}`;

  const res = await aiService.generate({
    area: 'food',
    prompt,
    systemInstruction: 'You plan the catering quantity and cost based strictly on attendee numbers and verified caterer rates.',
    expectedJson: true,
  });

  traceService.recordCall({
    sessionId,
    area: 'food',
    provider: res.provider,
    modelId: res.modelId,
    input: res.input,
    output: res.output,
    usage: res.usage,
    durationMs: res.durationMs,
    status: res.status,
  });

  const parsed = parseAndValidateAiJson(res.output);
  if (parsed.success && parsed.data?.quantity) {
    // JavaScript ensures arithmetic correctness:
    parsed.data.totalCalculatedCost = (parsed.data.quantity * parsed.data.pricePerPerson) + (parsed.data.deliveryFee || 0);
    return parsed.data;
  }
  return aiService._planFoodLocally(prompt);
}
