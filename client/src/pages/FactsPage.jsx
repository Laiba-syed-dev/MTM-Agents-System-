import React, { useState, useEffect } from 'react';
import { Database, Search, Filter, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function FactsPage({ sessionId }) {
  const [facts, setFacts] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;
    api.getFacts(sessionId)
      .then((res) => {
        if (res.success) setFacts(res.facts || []);
      })
      .finally(() => setLoading(false));
  }, [sessionId]);

  const filteredFacts = facts.filter((f) => {
    const matchesSearch =
      (f.field || '').toLowerCase().includes(search.toLowerCase()) ||
      (f.evidenceText || '').toLowerCase().includes(search.toLowerCase()) ||
      (f.category || '').toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'all' || f.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const getBadgeColor = (decision) => {
    switch (decision) {
      case 'accepted':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'superseded':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'rejected':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-700/60 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-purple-400" />
          Extracted Facts & Provenance Ledger
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Every proposition extracted by the Reading Engine is mapped to its original source message ID with verification status.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search facts, fields, evidence..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Categories</option>
            <option value="venue">Venue</option>
            <option value="schedule">Schedule</option>
            <option value="food">Food</option>
            <option value="judging">Judging</option>
            <option value="budget">Budget</option>
            <option value="general">General</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700/60">
              <tr>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Field & Value</th>
                <th className="px-4 py-3">Source & Evidence</th>
                <th className="px-4 py-3">Decision</th>
                <th className="px-4 py-3">Verification Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40 text-slate-200">
              {filteredFacts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400 text-xs">
                    {loading ? 'Loading facts...' : 'No facts match the filter.'}
                  </td>
                </tr>
              ) : (
                filteredFacts.map((fact) => (
                  <tr key={fact._id} className="hover:bg-slate-700/20">
                    <td className="px-4 py-3 align-top">
                      <span className="font-mono uppercase text-[10px] px-2 py-0.5 rounded bg-slate-700 text-purple-300">
                        {fact.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top font-medium">
                      <div className="text-white font-semibold">{fact.field}</div>
                      <div className="text-slate-300 font-mono text-[11px] mt-0.5">
                        {typeof fact.value === 'object' ? JSON.stringify(fact.value) : String(fact.value)}{' '}
                        {fact.unit && <span className="text-slate-400 text-[10px]">{fact.unit}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top text-slate-400 max-w-xs">
                      <div className="font-mono text-purple-400 text-[10px]">{fact.messageId}</div>
                      <div className="text-[11px] italic text-slate-300 mt-0.5 line-clamp-2">
                        "{fact.evidenceText}"
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase border ${getBadgeColor(fact.decision)}`}>
                        {fact.decision || 'accepted'}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top text-[11px] text-slate-400 max-w-sm">
                      {fact.decisionReason || 'Verified and compliant with constraints.'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
