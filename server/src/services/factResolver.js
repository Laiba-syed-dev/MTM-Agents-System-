import { globalStore } from '../models/store.js';

// Generalized date parser for message dates (e.g. "20 Oct", "12 Nov", "2026-11-12")
function parseDateScore(dateStr) {
  if (!dateStr) return 0;
  const months = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
  const match = dateStr.match(/(\d+)\s*([a-zA-Z]+)/);
  if (match) {
    const day = parseInt(match[1], 10);
    const mon = months[match[2].toLowerCase().substring(0, 3)] || 1;
    return (mon * 100) + day;
  }
  const parsed = Date.parse(dateStr);
  return isNaN(parsed) ? 0 : parsed;
}

// Generalized sender authority categorization
function getSenderDomain(sender = '') {
  const s = sender.toLowerCase();
  if (s.includes('dean') || s.includes('director') || s.includes('admin')) return 'executive';
  if (s.includes('finance') || s.includes('account')) return 'finance';
  if (s.includes('cater') || s.includes('food') || s.includes('kitchen')) return 'caterer';
  if (s.includes('hall') || s.includes('venue') || s.includes('event halls')) return 'venue';
  if (s.includes('judg') || s.includes('coordinator')) return 'judging';
  if (s.includes('student') || s.includes('society') || s.includes('club')) return 'student_society';
  return 'general';
}

export class FactResolver {
  constructor(sessionId = 'session_001') {
    this.sessionId = sessionId;
  }

  async resolveFacts(facts, messages) {
    const messageMap = new Map(messages.map((m) => [m._id, m]));
    const acceptedFacts = [];
    const rejectedRecords = [];

    // 1. Calculate confirmed minimum attendee requirements from executive/dean facts
    const studentsFact = facts.find((f) => f.field === 'studentsCount');
    const staffFact = facts.find((f) => f.field === 'staffCount');
    const teamsFact = facts.find((f) => f.field === 'totalTeams');
    const maxTeamsFact = facts.find((f) => f.field === 'maxTeamsPerJudge');

    const confirmedStudents = studentsFact ? Number(studentsFact.value) : 150;
    const confirmedStaff = staffFact ? Number(staffFact.value) : 10;
    const confirmedTeams = teamsFact ? Number(teamsFact.value) : 50;
    const maxTeams = maxTeamsFact ? Number(maxTeamsFact.value) : 3;
    const minJudges = Math.ceil(confirmedTeams / maxTeams);
    const minRequiredAttendees = confirmedStudents + confirmedStaff + minJudges;

    // 2. Identify superseded facts dynamically based on category, field, item, and date
    // Group candidate rate/price facts by (category, field)
    const groupedRates = new Map();
    for (const f of facts) {
      if (f.field === 'pricePerPerson' || f.field === 'printing' || f.field === 'cost') {
        const key = `${f.category}_${f.field}`;
        if (!groupedRates.has(key)) groupedRates.set(key, []);
        groupedRates.get(key).push(f);
      }
    }

    for (const [key, group] of groupedRates.entries()) {
      if (group.length > 1) {
        // Sort by message date score descending
        group.sort((a, b) => {
          const msgA = messageMap.get(a.messageId);
          const msgB = messageMap.get(b.messageId);
          return parseDateScore(msgB?.messageDate) - parseDateScore(msgA?.messageDate);
        });

        // Latest authorized fact supersedes older ones
        const latest = group[0];
        for (let i = 1; i < group.length; i++) {
          const older = group[i];
          older.decision = 'superseded';
          older.decisionReason = `Superseded by later authorized update from ${messageMap.get(latest.messageId)?.sender || 'authorized sender'}`;
          latest.supersedesFactId = older._id;
        }
      }
    }

    // 3. Evaluate each fact for authority, validity, and hard constraints
    for (const fact of facts) {
      const sourceMsg = messageMap.get(fact.messageId);
      const sender = sourceMsg ? sourceMsg.sender : 'Unknown';
      const senderDomain = getSenderDomain(sender);
      const rawText = sourceMsg ? sourceMsg.rawText : fact.evidenceText;

      // Skip already superseded facts
      if (fact.decision === 'superseded') {
        continue;
      }

      // Check for unauthorized requests (e.g. Student society proposing new luxury items or expenses)
      if (senderDomain === 'student_society' || fact.validity === 'suggestion_unapproved' || rawText.includes('?')) {
        if (fact.category === 'budget' || fact.field.includes('proposal') || rawText.toLowerCase().includes('quote')) {
          fact.decision = 'rejected';
          fact.decisionReason = `Unapproved proposal from ${sender} lacking Dean or Finance authorization.`;
          rejectedRecords.push({
            _id: `rej_${fact.messageId}`,
            messageId: fact.messageId,
            sessionId: this.sessionId,
            rawText,
            sender,
            reasonCode: 'UNAUTHORIZED_PROPOSAL',
            reason: `Proposal from ${sender} (${fact.evidenceText}) was not approved by event executive authorities.`,
            affectedAreas: ['budget', 'general'],
            decision: 'rejected',
            createdAt: new Date(),
          });
          continue;
        }
      }

      // Constraint Defense: Food quantity must feed all confirmed attendees
      if (fact.category === 'food' && (fact.field === 'quantity' || fact.field === 'boxCount')) {
        const proposedQty = Number(fact.value);
        if (proposedQty < minRequiredAttendees) {
          fact.decision = 'rejected';
          fact.decisionReason = `Proposed quantity (${proposedQty}) is less than required headcount (${minRequiredAttendees}).`;
          rejectedRecords.push({
            _id: `rej_${fact.messageId}`,
            messageId: fact.messageId,
            sessionId: this.sessionId,
            rawText,
            sender,
            reasonCode: 'INSUFFICIENT_FOOD_QUANTITY',
            reason: `Attempted to order ${proposedQty} boxes, but ${minRequiredAttendees} attendees are confirmed (${confirmedStudents} students + ${confirmedStaff} staff + ${minJudges} judges).`,
            affectedAreas: ['food', 'budget'],
            decision: 'rejected',
            createdAt: new Date(),
          });
          continue;
        }
      }

      // Normal accepted fact
      fact.decision = 'accepted';
      fact.decisionReason = `Validated against authority level (${senderDomain}) and constraints.`;
      acceptedFacts.push(fact);
    }

    // Persist rejected messages
    for (const rej of rejectedRecords) {
      await globalStore.addRejectedMessage(rej);
    }

    return {
      acceptedFacts,
      rejectedRecords,
    };
  }
}
