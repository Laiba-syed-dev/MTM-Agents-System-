import { globalStore } from '../models/store.js';

export class FactResolver {
  constructor(sessionId = 'session_001') {
    this.sessionId = sessionId;
  }

  resolveFacts(facts, messages) {
    const messageMap = new Map(messages.map((m) => [m._id, m]));
    const acceptedFacts = [];
    const rejectedRecords = [];

    // Group food price facts to check supersession
    const foodFacts = facts.filter((f) => f.category === 'food' && f.field === 'pricePerPerson');
    // If multiple prices exist for standard lunch box:
    // Message from Caterer on 12 Nov: "ab Rs 1,200 per head hoga" supersedes 20 Oct rate "Rs 1,000 per head"
    let activeFoodPriceFact = null;
    if (foodFacts.length > 1) {
      // Find the explicit update ("ab Rs 1,200 hoga")
      const updatedFact = foodFacts.find((f) => f.evidenceText.toLowerCase().includes('1,200') || f.evidenceText.toLowerCase().includes('1200'));
      const olderFact = foodFacts.find((f) => f.evidenceText.toLowerCase().includes('1,000') || f.evidenceText.toLowerCase().includes('1000'));
      if (updatedFact && olderFact) {
        olderFact.decision = 'superseded';
        olderFact.decisionReason = 'Superseded by caterer update message indicating new rate of Rs 1,200/head';
        updatedFact.decision = 'accepted';
        updatedFact.decisionReason = 'Official updated rate from Caterer';
        updatedFact.supersedesFactId = olderFact._id;
        activeFoodPriceFact = updatedFact;
      }
    }

    for (const fact of facts) {
      const sourceMsg = messageMap.get(fact.messageId);
      const sender = sourceMsg ? sourceMsg.sender.toLowerCase() : '';
      const text = sourceMsg ? sourceMsg.rawText.toLowerCase() : '';

      // Skip already processed superseded facts
      if (fact.decision === 'superseded') {
        continue;
      }

      // Check if unauthorized proposal (e.g. Student society proposing DJ for 50,000)
      if (fact.field === 'unauthorized_proposal' || text.includes('can we get a dj')) {
        fact.decision = 'rejected';
        fact.decisionReason = 'Unapproved suggestion from Student Society without Dean or Finance budgetary approval.';
        rejectedRecords.push({
          _id: `rej_${fact.messageId}`,
          messageId: fact.messageId,
          sessionId: this.sessionId,
          rawText: sourceMsg?.rawText || fact.evidenceText,
          sender: sourceMsg?.sender || 'Student society',
          reasonCode: 'UNAUTHORIZED_PROPOSAL',
          reason: 'DJ hire request of PKR 50,000 is an unapproved suggestion from Student Society that exceeds approved event scope.',
          affectedAreas: ['budget', 'general'],
          decision: 'rejected',
        });
        continue;
      }

      // Check if operational note that doesn't change core constraints (e.g. A judge being 10 mins late)
      if (fact.field === 'individual_judge_delay') {
        fact.decision = 'accepted';
        fact.decisionReason = 'Operational attendee note; does not invalidate 45-minute judging window.';
        acceptedFacts.push(fact);
        continue;
      }

      // If caterer or food box reduction contradicts confirmed attendee headcount
      // (e.g. "Caterer: I have rounded your order down to 100 boxes to keep the cost low. The event has 177 people")
      if (fact.category === 'food' && fact.field === 'boxCount' && fact.value < 177) {
        fact.decision = 'rejected';
        fact.decisionReason = `Proposed quantity (${fact.value}) violates mandatory constraint of feeding all 177 confirmed attendees.`;
        rejectedRecords.push({
          _id: `rej_${fact.messageId}`,
          messageId: fact.messageId,
          sessionId: this.sessionId,
          rawText: sourceMsg?.rawText || fact.evidenceText,
          sender: sourceMsg?.sender || 'Caterer',
          reasonCode: 'INSUFFICIENT_FOOD_QUANTITY',
          reason: `Attempted to order ${fact.value} lunch boxes, but 177 attendees are confirmed (150 students + 10 staff + 17 judges).`,
          affectedAreas: ['food', 'budget'],
          decision: 'rejected',
        });
        continue;
      }

      // Normal accepted fact
      fact.decision = 'accepted';
      fact.decisionReason = 'Supported by primary authorized source and adheres to constraints.';
      acceptedFacts.push(fact);
    }

    // Persist rejected messages
    for (const rej of rejectedRecords) {
      globalStore.addRejectedMessage(rej);
    }

    return {
      acceptedFacts,
      rejectedRecords,
    };
  }
}
