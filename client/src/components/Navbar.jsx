import React from 'react';
import { Cpu, Download, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function Navbar({ sessionId, onExport, onReset }) {
  return (
    <header className="bg-slate-800/80 backdrop-blur border-b border-slate-700/60 sticky top-0 z-50 px-6 py-3.5 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
          <Cpu className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            MTM Agent System
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
              Islamabad 2026
            </span>
          </h1>
          <p className="text-xs text-slate-400">AI-Powered Message-Driven Event Planner</p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <div className="text-xs text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-md border border-slate-700/50 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Session: <strong className="text-slate-200">{sessionId || 'active'}</strong></span>
        </div>

        <button
          onClick={onExport}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg transition"
        >
          <Download className="w-3.5 h-3.5 text-purple-400" />
          Export Plan & Trace
        </button>

        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition"
          title="Reset to default sample pack"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reload
        </button>
      </div>
    </header>
  );
}
