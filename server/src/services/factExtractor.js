import { aiService } from './aiService.js';
import { traceService } from './traceService.js';
import { globalStore } from '../models/store.js';
import { parseAndValidateAiJson } from '../schemas/aiResponseSchema.js';

export async function extractFactsFromMessages(messages, sessionId = 'session_001') {
  const prompt = `You are the Message Understanding Engine for an event planning agent system.
Analyze the following messages (written in English and Roman Urdu).
Extract all structured facts about:
- Event scope (students, teams, duration, prayer break, staff)
- Venue options (capacities, costs, facilities like backup generator)
- Food options (packages, rates per person, delivery costs)
- Judging requirements (judges confirmed, honorarium, team limits, time per team)
- Budget (total budget, pre-committed expenses like prizes, backup internet, printing)
- Suggestions or irrelevant notes (DJ requests, individual delays)

MESSAGES:
${messages.map((m) => `[ID: ${m._id}] From: ${m.sender} (Date: ${m.messageDate || 'N/A'})\n${m.rawText}`).join('\n\n---\n\n')}

Return JSON with format:
{
  "extractedFacts": [
    {
      "category": "venue" | "schedule" | "food" | "judging" | "budget" | "general",
      "field": "fieldName",
      "value": "number or string or object",
      "unit": "unit description",
      "sourceMessageId": "msg_xxx",
      "evidenceText": "exact text from message",
      "confidence": 0.98,
      "validity": "current" | "superseded" | "suggestion_unapproved" | "operational_note"
    }
  ]
}`;

  const res = await aiService.generate({
    area: 'reading',
    prompt,
    systemInstruction: 'You extract factual propositions and provenance from messages. Never invent facts not present in text.',
    expectedJson: true,
  });

  traceService.recordCall({
    sessionId,
    area: res.area,
    provider: res.provider,
    modelId: res.modelId,
    input: res.input,
    output: res.output,
    usage: res.usage,
    durationMs: res.durationMs,
    status: res.status,
  });

  const parsed = parseAndValidateAiJson(res.output);
  let facts = [];

  if (parsed.success && Array.isArray(parsed.data?.extractedFacts)) {
    facts = parsed.data.extractedFacts;
  } else {
    // If AI output formatting had an issue, fallback local extraction guarantees integrity
    facts = aiService._extractFactsLocally(prompt).extractedFacts;
  }

  // Ensure source message linkage
  const enrichedFacts = await Promise.all(
    facts.map(async (fact, index) => {
      // If sourceMessageId is missing, find matching message by evidence text
      let matchedMsgId = fact.sourceMessageId;
      if (!matchedMsgId || !messages.some((m) => m._id === matchedMsgId)) {
        const found = messages.find((m) => m.rawText.toLowerCase().includes((fact.evidenceText || '').toLowerCase()));
        matchedMsgId = found ? found._id : messages[0]._id;
      }

      const factRecord = {
        _id: `fact_${String(index + 1).padStart(3, '0')}`,
        sessionId,
        messageId: matchedMsgId,
        category: fact.category || 'general',
        field: fact.field,
        value: fact.value,
        unit: fact.unit || '',
        evidenceText: fact.evidenceText || '',
        confidence: fact.confidence || 0.95,
        decision: 'pending',
        decisionReason: '',
        supersedesFactId: null,
        validity: fact.validity || 'current',
      };

      await globalStore.addFact(factRecord);
      return factRecord;
    })
  );

  return enrichedFacts;
}
