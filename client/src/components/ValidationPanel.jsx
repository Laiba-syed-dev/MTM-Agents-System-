import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

export default function ValidationPanel({ validation }) {
  if (!validation) {
    return (
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 text-center text-slate-400 text-xs">
        Validation engine awaiting plan execution...
      </div>
    );
  }

  const { valid, checks = [], errors = [] } = validation;

  return (
    <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
        <div className="flex items-center space-x-2.5">
          {valid ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <XCircle className="w-5 h-5 text-rose-400" />
          )}
          <h3 className="text-sm font-bold text-white">
            Deterministic Constraint Validation: {valid ? (
              <span className="text-emerald-400">PASSED (ALL 6 CHECKS)</span>
            ) : (
              <span className="text-rose-400">FAILED</span>
            )}
          </h3>
        </div>
        <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-medium bg-slate-700 text-slate-300">
          Pure JS Engine
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {checks.map((chk, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg border text-xs flex items-start space-x-2.5 ${
              chk.passed
                ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-300'
                : 'bg-rose-950/20 border-rose-500/20 text-rose-300'
            }`}
          >
            {chk.passed ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-semibold capitalize">{chk.name.replace(/_/g, ' ')}</p>
              <p className="text-[11px] opacity-80">
                {chk.passed ? 'Constraint verified' : chk.errors?.join(', ') || 'Failed check'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {errors.length > 0 && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs space-y-1">
          <div className="font-semibold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" /> Detected Constraint Errors:
          </div>
          <ul className="list-disc list-inside space-y-0.5">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
