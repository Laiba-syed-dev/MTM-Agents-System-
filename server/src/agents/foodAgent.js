import { aiService } from '../services/aiService.js';
import { traceService } from '../services/traceService.js';
import { parseAndValidateAiJson } from '../schemas/aiResponseSchema.js';

export async function runFoodPlanning(acceptedFacts, sessionId = 'session_001', attendeeHeadcount = null) {
  // 1. Calculate required attendee count dynamically from facts
  const studentsFact = acceptedFacts.find((f) => f.field === 'studentsCount');
  const staffFact = acceptedFacts.find((f) => f.field === 'staffCount');
  const students = studentsFact ? Number(studentsFact.value) : 150;
  const staff = staffFact ? Number(staffFact.value) : 10;

  let attendees = attendeeHeadcount;
  if (!attendees) {
    const teamsFact = acceptedFacts.find((f) => f.field === 'totalTeams');
    const teams = teamsFact ? Number(teamsFact.value) : 50;
    const maxTeamsFact = acceptedFacts.find((f) => f.field === 'maxTeamsPerJudge');
    const maxTeams = maxTeamsFact ? Number(maxTeamsFact.value) : 3;
    const judgesNeeded = Math.ceil(teams / maxTeams);
    attendees = students + staff + judgesNeeded;
  }

  // 2. Extract food rate and delivery facts dynamically
  const priceFact = acceptedFacts.find((f) => f.category === 'food' && f.field === 'pricePerPerson');
  const deliveryFact = acceptedFacts.find((f) => f.category === 'food' && f.field === 'deliveryFee');

  const packageName = priceFact?.item || priceFact?.unit || 'Standard lunch box';
  const pricePerPerson = priceFact ? Number(priceFact.value) : 1200;
  const deliveryFee = deliveryFact ? Number(deliveryFact.value) : 0;
  const quantity = attendees;
  const calculatedCost = (quantity * pricePerPerson) + deliveryFee;

  const prompt = `You are the Food Planner for the event.
Dynamic facts extracted from messages:
- Total required headcount to feed: ${attendees} attendees (${students} students + ${staff} staff + ${attendees - students - staff} judges).
- Catering Package: ${packageName}
- Price per person: Rs ${pricePerPerson.toLocaleString()}
- Delivery Fee: Rs ${deliveryFee.toLocaleString()}

Calculate required quantity and cost for all ${attendees} attendees.
Return JSON format:
{
  "packageSelected": "${packageName}",
  "pricePerPerson": ${pricePerPerson},
  "deliveryFee": ${deliveryFee},
  "attendees": ${attendees},
  "quantity": ${quantity},
  "totalCalculatedCost": ${calculatedCost},
  "reasoning": "${quantity} boxes ordered to feed all ${attendees} attendees at rate of Rs ${pricePerPerson}/head."
}`;

  const res = await aiService.generate({
    area: 'food',
    prompt,
    systemInstruction: 'You plan catering quantities and costs strictly based on headcount and verified vendor rates.',
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
  if (parsed.success && parsed.data?.quantity >= attendees && parsed.data?.pricePerPerson) {
    parsed.data.totalCalculatedCost = (parsed.data.quantity * parsed.data.pricePerPerson) + (parsed.data.deliveryFee || 0);
    return parsed.data;
  }

  // Deterministic JavaScript calculation
  return {
    packageSelected: packageName,
    pricePerPerson,
    deliveryFee,
    attendees,
    quantity,
    totalCalculatedCost: calculatedCost,
    reasoning: `Ordered ${quantity} boxes to feed all ${attendees} confirmed participants at Rs ${pricePerPerson}/head with Rs ${deliveryFee} delivery fee.`,
  };
}
