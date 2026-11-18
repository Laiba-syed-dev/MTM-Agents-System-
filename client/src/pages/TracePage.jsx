import React, { useState, useEffect } from 'react';
import { Terminal, Cpu, Clock, CheckCircle2, ChevronDown, ChevronUp, Layers } from 'lucide-react';
import { api } from '../services/api';

export default function TracePage({ sessionId }) {
  const [traces, setTraces] = useState([]);
  const [tokenSummary, setTokenSummary] = useState(null);
  const [expandedCalls, setExpandedCalls] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;
    api.getTrace(sessionId)
      .then((res) => {
        if (res.success) {
          setTraces(res.traces || []);
          setTokenSummary(res.tokenSummary || null);
          // Auto-expand first call
          if (res.traces?.length > 0) {
            setExpandedCalls({ 1: true });
          }
        }
      })
      .finally(() => setLoading(false));
  }, [sessionId]);

  const toggleExpand = (callNum) => {
    setExpandedCalls((prev) => ({ ...prev, [callNum]: !prev[callNum] }));
  };

  const getAreaBadgeColor = (area) => {
    switch (area.toLowerCase()) {
      case 'reading': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'venue': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'schedule': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'food': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'judging': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'budget': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-slate-700 text-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-700/60 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Terminal className="w-5 h-5 text-purple-400" />
          Model Call Execution Trace & Token Ledger
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Mandatory judging requirement: Every actual model call is recorded with real model ID, area tag, exact prompt, exact response, and provider-reported tokens.
        </p>
      </div>

      {/* Grand Token Accounting Box */}
      {tokenSummary && (
        <div className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-500/30 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-purple-300 font-semibold uppercase tracking-wider">
                Official Token Accounting Summary
              </p>
              <h3 className="text-xl font-bold text-white mt-0.5">
                {tokenSummary.totalTokens?.toLocaleString()} Total Tokens
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Model Calls</span>
              <strong className="text-white text-sm">{tokenSummary.callCount}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Input Tokens</span>
              <strong className="text-blue-400 text-sm">{tokenSummary.totalInputTokens?.toLocaleString()}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Output Tokens</span>
              <strong className="text-purple-400 text-sm">{tokenSummary.totalOutputTokens?.toLocaleString()}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Grand Total</span>
              <strong className="text-emerald-400 text-sm">{tokenSummary.totalTokens?.toLocaleString()}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Trace Calls List */}
      <div className="space-y-4">
        {traces.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs bg-slate-800/20 rounded-xl border border-slate-700/50">
            {loading ? 'Loading execution trace...' : 'No model calls recorded yet.'}
          </div>
        ) : (
          traces.map((trace) => {
            const isExpanded = !!expandedCalls[trace.callNumber];
            return (
              <div
                key={trace._id || trace.callNumber}
                className="bg-slate-800/50 border border-slate-700/60 rounded-xl overflow-hidden transition"
              >
                {/* Header row */}
                <div
                  onClick={() => toggleExpand(trace.callNumber)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-700/30 transition select-none"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 font-mono font-bold text-xs flex items-center justify-center border border-purple-500/30">
                      #{trace.callNumber}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${getAreaBadgeColor(trace.area)}`}>
                      {trace.area}
                    </span>
                    <span className="text-xs font-semibold text-white">
                      Model: <code className="text-purple-300">{trace.modelId}</code>
                    </span>
                    <span className="text-[11px] text-slate-400">({trace.provider})</span>
                  </div>

                  <div className="flex items-center space-x-4 text-xs font-mono">
                    <span className="text-slate-300">
                      Tokens: <strong className="text-emerald-400">{trace.usage?.totalTokens ?? 'N/A'}</strong> (In: {trace.usage?.inputTokens ?? 'N/A'} | Out: {trace.usage?.outputTokens ?? 'N/A'})
                    </span>
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {trace.durationMs}ms
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Collapsible body */}
                {isExpanded && (
                  <div className="p-4 bg-slate-900/70 border-t border-slate-700/50 space-y-4">
                    <div>
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                        Exact Request Input Sent
                      </div>
                      <pre className="p-3 bg-slate-950/90 rounded-lg text-slate-300 text-[11px] font-mono overflow-x-auto whitespace-pre-wrap border border-slate-800">
                        {trace.input}
                      </pre>
                    </div>

                    <div>
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                        Exact Model Output Received
                      </div>
                      <pre className="p-3 bg-slate-950/90 rounded-lg text-emerald-300 text-[11px] font-mono overflow-x-auto whitespace-pre-wrap border border-slate-800">
                        {trace.output}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
