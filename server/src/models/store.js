import { isDbConnected } from '../config/database.js';
import { MessagePackModel } from './MessagePack.js';
import { MessageModel } from './Message.js';
import { FactModel } from './Fact.js';
import { PlanModel } from './Plan.js';
import { ExecutionTraceModel } from './ExecutionTrace.js';
import { RejectedMessageModel } from './RejectedMessage.js';

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
  async addMessagePack(pack) {
    this.messagePacks.push(pack);
    if (isDbConnected()) {
      try {
        await MessagePackModel.findByIdAndUpdate(pack._id, pack, { upsert: true, new: true });
      } catch (err) {
        console.error('[MongoDB Error] Failed to persist MessagePack:', err.message);
      }
    }
    return pack;
  }

  async getMessagePack(id) {
    if (isDbConnected()) {
      try {
        const found = await MessagePackModel.findOne({ $or: [{ _id: id }, { sessionId: id }] }).lean();
        if (found) return found;
      } catch (err) {
        // fallback to memory
      }
    }
    return this.messagePacks.find((p) => p._id === id || p.sessionId === id);
  }

  // Messages
  async addMessage(msg) {
    this.messages.push(msg);
    if (isDbConnected()) {
      try {
        await MessageModel.findByIdAndUpdate(msg._id, msg, { upsert: true, new: true });
      } catch (err) {
        console.error('[MongoDB Error] Failed to persist Message:', err.message);
      }
    }
    return msg;
  }

  async getMessagesBySession(sessionId) {
    if (isDbConnected()) {
      try {
        const docs = await MessageModel.find({ sessionId }).lean();
        if (docs && docs.length > 0) return docs;
      } catch (err) {
        // fallback to memory
      }
    }
    return this.messages.filter((m) => m.sessionId === sessionId);
  }

  async getMessageById(id) {
    if (isDbConnected()) {
      try {
        const doc = await MessageModel.findById(id).lean();
        if (doc) return doc;
      } catch (err) {
        // fallback to memory
      }
    }
    return this.messages.find((m) => m._id === id);
  }

  // Facts
  async addFact(fact) {
    this.facts.push(fact);
    if (isDbConnected()) {
      try {
        await FactModel.findByIdAndUpdate(fact._id, fact, { upsert: true, new: true });
      } catch (err) {
        console.error('[MongoDB Error] Failed to persist Fact:', err.message);
      }
    }
    return fact;
  }

  async getFactsBySession(sessionId) {
    if (isDbConnected()) {
      try {
        const docs = await FactModel.find({ sessionId }).lean();
        if (docs && docs.length > 0) return docs;
      } catch (err) {
        // fallback to memory
      }
    }
    return this.facts.filter((f) => f.sessionId === sessionId);
  }

  async updateFact(id, updates) {
    const fact = this.facts.find((f) => f._id === id);
    if (fact) {
      Object.assign(fact, updates);
    }
    if (isDbConnected()) {
      try {
        await FactModel.findByIdAndUpdate(id, updates);
      } catch (err) {
        console.error('[MongoDB Error] Failed to update Fact:', err.message);
      }
    }
    return fact;
  }

  // Plans
  async addPlan(plan) {
    this.plans.push(plan);
    if (isDbConnected()) {
      try {
        await PlanModel.findByIdAndUpdate(plan._id, plan, { upsert: true, new: true });
      } catch (err) {
        console.error('[MongoDB Error] Failed to persist Plan:', err.message);
      }
    }
    return plan;
  }

  async getPlansBySession(sessionId) {
    if (isDbConnected()) {
      try {
        const docs = await PlanModel.find({ sessionId }).sort({ version: 1 }).lean();
        if (docs && docs.length > 0) return docs;
      } catch (err) {
        // fallback to memory
      }
    }
    return this.plans.filter((p) => p.sessionId === sessionId);
  }

  async getLatestPlan(sessionId) {
    if (isDbConnected()) {
      try {
        const doc = await PlanModel.findOne({ sessionId }).sort({ version: -1 }).lean();
        if (doc) return doc;
      } catch (err) {
        // fallback to memory
      }
    }
    const sessionPlans = this.plans.filter((p) => p.sessionId === sessionId);
    if (sessionPlans.length === 0) return null;
    return sessionPlans.sort((a, b) => b.version - a.version)[0];
  }

  // Traces
  async addTrace(trace) {
    this.executionTraces.push(trace);
    if (isDbConnected()) {
      try {
        await ExecutionTraceModel.findByIdAndUpdate(trace._id, trace, { upsert: true, new: true });
      } catch (err) {
        console.error('[MongoDB Error] Failed to persist ExecutionTrace:', err.message);
      }
    }
    return trace;
  }

  async getTracesBySession(sessionId) {
    if (isDbConnected()) {
      try {
        const docs = await ExecutionTraceModel.find({ sessionId }).sort({ callNumber: 1 }).lean();
        if (docs && docs.length > 0) return docs;
      } catch (err) {
        // fallback to memory
      }
    }
    return this.executionTraces.filter((t) => t.sessionId === sessionId);
  }

  // Rejected Messages
  async addRejectedMessage(rej) {
    this.rejectedMessages.push(rej);
    if (isDbConnected()) {
      try {
        await RejectedMessageModel.findByIdAndUpdate(rej._id, rej, { upsert: true, new: true });
      } catch (err) {
        console.error('[MongoDB Error] Failed to persist RejectedMessage:', err.message);
      }
    }
    return rej;
  }

  async getRejectedBySession(sessionId) {
    if (isDbConnected()) {
      try {
        const docs = await RejectedMessageModel.find({ sessionId }).lean();
        if (docs && docs.length > 0) return docs;
      } catch (err) {
        // fallback to memory
      }
    }
    return this.rejectedMessages.filter((r) => r.sessionId === sessionId);
  }
}

export const globalStore = new DataStore();
