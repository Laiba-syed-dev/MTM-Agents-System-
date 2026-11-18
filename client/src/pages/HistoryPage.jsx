import React, { useState, useEffect } from 'react';
import { History, Send, Loader2, CheckCircle2, AlertTriangle, Layers, ArrowUpRight } from 'lucide-react';
import { api } from '../services/api';

export default function HistoryPage({ sessionId, currentPlan, onPlanUpdated }) {
  const [plans, setPlans] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [updateResult, setUpdateResult] = useState(null);
  const [error, setError] = useState('');

  const fetchPlans = () => {
    if (!sessionId) return;
    api.getPlansHistory(sessionId).then((res) => {
      if (res.success) setPlans(res.plans || []);
    });
  };

  useEffect(() => {
    fetchPlans();
  }, [sessionId, currentPlan]);

  const handleSendUpdate = async (msgText) => {
    const textToSend = msgText || newMessage;
    if (!textToSend.trim()) return;

    setError('');
    setUpdateResult(null);
    setLoading(true);

    try {
      const res = await api.sendIncrementalUpdate(sessionId, textToSend);
      setUpdateResult(res);
      if (res.plan) {
        onPlanUpdated(res.plan);
      }
      fetchPlans();
    } catch (err) {
      setError(err.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-700/60 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <History className="w-5 h-5 text-purple-400" />
          Incremental Updates & Plan Version History
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Official judging requirement: Sequential updates arrive individually. Only affected areas make model calls (max 5 calls, 60s hard limit).
        </p>
      </div>

      {/* Incremental Update Interactive Dispatcher */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Send className="w-4 h-4 text-purple-400" />
          Send Incremental Message
        </h3>

        {/* Quick Test Practice Buttons */}
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            onClick={() => {
              const msg = 'Finance here. The printing bill came in at Rs 15,000, not Rs 10,000.';
              setNewMessage(msg);
              handleSendUpdate(msg);
            }}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 font-medium transition"
          >
            Practice 1: Finance Printing Bill Update (Rs 15,000)
          </button>

          <button
            onClick={() => {
              const msg = 'Caterer: I have rounded your order down to 100 boxes to keep the cost low.';
              setNewMessage(msg);
              handleSendUpdate(msg);
            }}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-medium transition"
          >
            Practice 2: Wrong Message (Caterer 100 Boxes)
          </button>
        </div>

        <div className="flex gap-3">
          <textarea
            rows={3}
            placeholder="Type or paste incoming judge message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 bg-slate-900/80 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={() => handleSendUpdate()}
            disabled={loading || !newMessage.trim()}
            className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-xs font-bold text-white transition flex flex-col items-center justify-center gap-1 shrink-0"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            <span>Send Update</span>
          </button>
        </div>

        {/* Update Execution Feedback */}
        {updateResult && (
          <div className={`p-4 rounded-xl border text-xs space-y-2 ${
            updateResult.rejected
              ? 'bg-amber-950/20 border-amber-500/30 text-amber-300'
              : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
          }`}>
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-2">
                {updateResult.rejected ? <AlertTriangle className="w-4 h-4 text-amber-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                {updateResult.rejected ? 'Invalid Proposal Intercepted' : 'Plan Successfully Updated'}
              </span>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                Model Calls Used: {updateResult.modelCallsUsed} / 5 max
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                Affected Areas: <strong className="text-white">[{updateResult.affectedAreas?.join(', ')}]</strong>
              </div>
              <div>
                Version State: <strong className="text-white">v{updateResult.previousVersion} → v{updateResult.currentVersion}</strong>
              </div>
            </div>

            {updateResult.rejectionReason && (
              <p className="text-[11px] text-amber-200 mt-1 italic">
                Reason: {updateResult.rejectionReason} (Retained previous valid plan).
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
            {error}
          </div>
        )}
      </div>

      {/* Version History Cards */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-400" />
          Plan Versions ({plans.length})
        </h3>

        <div className="space-y-3">
          {plans.map((p) => (
            <div
              key={p._id}
              className={`p-4 rounded-xl border transition ${
                currentPlan?.version === p.version
                  ? 'bg-slate-800/90 border-purple-500/50 shadow-md shadow-purple-500/10'
                  : 'bg-slate-800/40 border-slate-700/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 font-mono font-bold text-xs">
                    Version {p.version}
                  </span>
                  <span className="text-xs font-semibold text-white">
                    Status: <strong className="text-emerald-400">{p.status.toUpperCase()}</strong>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Created: {new Date(p.createdAt).toLocaleTimeString()}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono text-slate-300">
                  <span>Venue: <strong>{p.venue?.selectedHall}</strong></span>
                  <span>Food: <strong>{p.food?.quantity} boxes</strong></span>
                  <span>Judges: <strong>{p.judging?.assignedJudges}</strong></span>
                  <span>Expenses: <strong className="text-rose-400">PKR {p.validation?.summary?.totalExpenses?.toLocaleString()}</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
