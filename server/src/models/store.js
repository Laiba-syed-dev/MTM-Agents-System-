// In-memory persistent data store with MongoDB Mongoose synchronization
export class DataStore {
  constructor() {
    this.messagePacks = [];
    this.messages = [];
    this.facts = [];
    this.plans = [];
    this.executionTraces = [];
    this.rejectedMessages = [];
  }

  clear() {
    this.messagePacks = [];
    this.messages = [];
    this.facts = [];
    this.plans = [];
    this.executionTraces = [];
    this.rejectedMessages = [];
  }

  // MessagePack
  addMessagePack(pack) {
    this.messagePacks.push(pack);
    return pack;
  }

  getMessagePack(id) {
    return this.messagePacks.find((p) => p._id === id || p.sessionId === id);
  }

  // Messages
  addMessage(msg) {
    this.messages.push(msg);
    return msg;
  }

  getMessagesBySession(sessionId) {
    return this.messages.filter((m) => m.sessionId === sessionId);
  }

  getMessageById(id) {
    return this.messages.find((m) => m._id === id);
  }

  // Facts
  addFact(fact) {
    this.facts.push(fact);
    return fact;
  }

  getFactsBySession(sessionId) {
    return this.facts.filter((f) => f.sessionId === sessionId);
  }

  updateFact(id, updates) {
    const fact = this.facts.find((f) => f._id === id);
    if (fact) {
      Object.assign(fact, updates);
    }
    return fact;
  }

  // Plans
  addPlan(plan) {
    this.plans.push(plan);
    return plan;
  }

  getPlansBySession(sessionId) {
    return this.plans.filter((p) => p.sessionId === sessionId);
  }

  getLatestPlan(sessionId) {
    const sessionPlans = this.getPlansBySession(sessionId);
    if (sessionPlans.length === 0) return null;
    return sessionPlans.sort((a, b) => b.version - a.version)[0];
  }

  // Traces
  addTrace(trace) {
    this.executionTraces.push(trace);
    return trace;
  }

  getTracesBySession(sessionId) {
    return this.executionTraces.filter((t) => t.sessionId === sessionId);
  }

  // Rejected Messages
  addRejectedMessage(rej) {
    this.rejectedMessages.push(rej);
    return rej;
  }

  getRejectedBySession(sessionId) {
    return this.rejectedMessages.filter((r) => r.sessionId === sessionId);
  }
}

export const globalStore = new DataStore();
