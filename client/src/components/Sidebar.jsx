import React from 'react';
import {
  LayoutDashboard,
  Upload,
  CalendarCheck,
  Database,
  Terminal,
  ShieldAlert,
  History,
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, counts = {} }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'upload', label: 'Upload Message Pack', icon: Upload },
    { id: 'plan', label: 'Generated Plan', icon: CalendarCheck, badge: counts.planVersion ? `v${counts.planVersion}` : null },
    { id: 'facts', label: 'Extracted Facts', icon: Database, badge: counts.factsCount },
    { id: 'trace', label: 'Execution Trace', icon: Terminal, badge: counts.traceCount },
    { id: 'rejected', label: 'Rejected Messages', icon: ShieldAlert, badge: counts.rejectedCount, badgeColor: 'bg-rose-500/20 text-rose-300' },
    { id: 'history', label: 'Version History & Updates', icon: History },
  ];

  return (
    <aside className="w-64 bg-slate-800/40 border-r border-slate-700/50 flex flex-col p-4 space-y-1.5 shrink-0">
      <div className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase px-3 py-2">
        Planning Modules
      </div>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
              isActive
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20 font-semibold'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </div>
            {tab.badge !== undefined && tab.badge !== null && (
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                  tab.badgeColor || (isActive ? 'bg-purple-700 text-white' : 'bg-slate-700/80 text-slate-300')
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}

      <div className="pt-6 mt-auto">
        <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700/40 text-[11px] text-slate-400 space-y-1">
          <div className="text-slate-300 font-semibold">Rules Enforcement</div>
          <div>Hard limit: 120s full / 60s update</div>
          <div>Max 5 model calls per update</div>
          <div className="text-emerald-400 font-mono text-[10px]">Deterministic JS Validator ON</div>
        </div>
      </div>
    </aside>
  );
}
