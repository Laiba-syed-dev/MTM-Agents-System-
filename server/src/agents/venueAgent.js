import { aiService } from '../services/aiService.js';
import { traceService } from '../services/traceService.js';
import { parseAndValidateAiJson } from '../schemas/aiResponseSchema.js';

export async function runVenuePlanning(acceptedFacts, sessionId = 'session_001', attendeeHeadcount = null) {
  // 1. Determine attendee requirements dynamically from facts
  const studentsFact = acceptedFacts.find((f) => f.field === 'studentsCount');
  const staffFact = acceptedFacts.find((f) => f.field === 'staffCount');
  const students = studentsFact ? Number(studentsFact.value) : 150;
  const staff = staffFact ? Number(staffFact.value) : 10;
  
  // Calculate or use provided attendee count
  let attendees = attendeeHeadcount;
  if (!attendees) {
    const teamsFact = acceptedFacts.find((f) => f.field === 'totalTeams');
    const teams = teamsFact ? Number(teamsFact.value) : 50;
    const maxTeamsFact = acceptedFacts.find((f) => f.field === 'maxTeamsPerJudge');
    const maxTeams = maxTeamsFact ? Number(maxTeamsFact.value) : 3;
    const judgesNeeded = Math.ceil(teams / maxTeams);
    attendees = students + staff + judgesNeeded;
  }

  // 2. Extract hall options dynamically from facts
  const hallFacts = acceptedFacts.filter((f) => f.category === 'venue' && (f.field === 'hallOption' || f.field === 'venueOption'));
  const availableHalls = hallFacts.map((hf) => {
    if (typeof hf.value === 'object' && hf.value !== null) {
      return {
        hall: hf.value.hall || hf.value.name || 'Hall Option',
        capacity: Number(hf.value.capacity) || 0,
        cost: Number(hf.value.cost) || 0,
        hasGenerator: Boolean(hf.value.hasGenerator),
      };
    }
    return {
      hall: 'Default Hall',
      capacity: 200,
      cost: 120000,
      hasGenerator: false,
    };
  });

  const prompt = `You are the Venue Planner for an event in Islamabad.
Required attendance headcount: ${attendees} attendees.
Available venue options from messages:
${availableHalls.length > 0 ? availableHalls.map((h) => `- ${h.hall}: seats ${h.capacity} at Rs ${h.cost.toLocaleString()}${h.hasGenerator ? ' (has backup generator)' : ''}`).join('\n') : '- Hall A: seats 200 at Rs 120,000'}

Select the venue option that accommodates all ${attendees} attendees while minimizing cost.
Return JSON format:
{
  "selectedHall": "${availableHalls[0]?.hall || 'Hall A'}",
  "capacity": ${availableHalls[0]?.capacity || 200},
  "cost": ${availableHalls[0]?.cost || 120000},
  "hasBackupGenerator": ${availableHalls[0]?.hasGenerator || false},
  "reasoning": "Explain selection based on capacity and cost."
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
  if (parsed.success && parsed.data?.selectedHall && parsed.data?.capacity >= attendees) {
    return parsed.data;
  }

  // Pure deterministic JavaScript fallback based dynamically on extracted halls:
  const suitableHalls = availableHalls.filter((h) => h.capacity >= attendees);
  const bestHall = suitableHalls.length > 0
    ? suitableHalls.sort((a, b) => a.cost - b.cost)[0]
    : availableHalls.sort((a, b) => b.capacity - a.capacity)[0] || {
        hall: 'Default Hall',
        capacity: attendees,
        cost: 100000,
        hasGenerator: false,
      };

  return {
    selectedHall: bestHall.hall,
    capacity: bestHall.capacity,
    cost: bestHall.cost,
    hasBackupGenerator: bestHall.hasGenerator,
    reasoning: `Selected ${bestHall.hall} (capacity ${bestHall.capacity}) to fit all ${attendees} attendees at minimum cost of PKR ${bestHall.cost.toLocaleString()}.`,
  };
}
