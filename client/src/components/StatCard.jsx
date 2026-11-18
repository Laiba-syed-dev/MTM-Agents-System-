import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'purple' }) {
  const colorMap = {
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4 flex items-start justify-between">
      <div className="space-y-1">
        <p className="text-xs font-medium text-slate-400">{title}</p>
        <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
        {subtitle && <p className="text-[11px] text-slate-400">{subtitle}</p>}
      </div>
      {Icon && (
        <div className={`p-2.5 rounded-lg border ${colorMap[color] || colorMap.purple}`}>
          <Icon className="w-5 h-5" />
        </div>
      )}
    </div>
  );
}
