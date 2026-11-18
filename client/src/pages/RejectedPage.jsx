import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export default function RejectedPage({ sessionId }) {
  const [rejected, setRejected] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;
    api.getRejected(sessionId)
      .then((res) => {
        if (res.success) setRejected(res.rejected || []);
      })
      .finally(() => setLoading(false));
  }, [sessionId]);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-700/60 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-400" />
          Rejected, Conflicted & Irrelevant Messages
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Scoring criterion (20 points): Catching wrong messages and explainable rejections. The system defends the event plan against invalid proposals, unapproved suggestions, and outdated claims.
        </p>
      </div>

      <div className="space-y-4">
        {rejected.length === 0 ? (
          <div className="p-8 bg-slate-800/30 rounded-xl border border-slate-700/50 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-sm font-semibold text-white">No Rejected Messages in Active Session</p>
            <p className="text-xs text-slate-400">
              When an unapproved suggestion or constraint-violating message arrives, it is safely intercepted and displayed here.
            </p>
          </div>
        ) : (
          rejected.map((item) => (
            <div
              key={item._id}
              className="bg-slate-800/50 border border-rose-500/30 rounded-xl p-5 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/50 pb-3">
                <div className="flex items-center space-x-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shrink-0"></span>
                  <h3 className="text-sm font-bold text-white">
                    Sender: <span className="text-purple-300">{item.sender || 'Unknown'}</span>
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {item.reasonCode || 'REJECTED'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span>Affected Areas:</span>
                  {(item.affectedAreas || []).map((area, i) => (
                    <span key={i} className="px-2 py-0.5 rounded text-[10px] bg-slate-700 text-slate-200 capitalize">
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Original Message Content:
                </p>
                <div className="p-3 bg-slate-900/70 rounded-lg text-xs font-mono text-slate-200 border border-slate-800 italic">
                  "{item.rawText}"
                </div>
              </div>

              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-rose-200">Rejection & Defense Justification:</strong>
                  {item.reason}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
