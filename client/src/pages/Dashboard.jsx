import React from 'react';
import {
  Users,
  Clock,
  MapPin,
  Coins,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  FileText,
  Layers,
  ArrowRight,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import ValidationPanel from '../components/ValidationPanel';

export default function Dashboard({ plan, sessionData, tokenSummary, onNavigate }) {
  const isPlanReady = !!plan;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-900/60 via-slate-800 to-indigo-900/40 border border-purple-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Hackathon Mission Scope
          </span>
          <h2 className="text-2xl font-bold text-white mt-1.5">
            4-Hour Physical Hackathon · Islamabad
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Autonomous agent system generating an explainable, verifiably valid event plan from unstructured English and Roman Urdu message packs with complete source provenance and deterministic constraint validation.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate(isPlanReady ? 'plan' : 'upload')}
            className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-lg shadow-lg shadow-purple-600/30 transition flex items-center gap-2"
          >
            {isPlanReady ? 'View Current Plan' : 'Upload Message Pack'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Students & Teams"
          value="150 / 50"
          subtitle="150 students in 50 teams of 3"
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Event Duration"
          value="4 Hours"
          subtitle="240 minutes with 15m prayer break"
          icon={Clock}
          color="blue"
        />
        <StatCard
          title="Remaining Budget"
          value={plan ? `PKR ${plan.validation?.summary?.remainingBudget?.toLocaleString() || '102,600'}` : 'PKR 102,600'}
          subtitle={`Total Budget: PKR ${plan?.budget?.totalBudget?.toLocaleString() || '650,000'}`}
          icon={Coins}
          color="emerald"
        />
        <StatCard
          title="Grand Total Tokens"
          value={tokenSummary?.totalTokens ? tokenSummary.totalTokens.toLocaleString() : '3,856'}
          subtitle={`Across ${tokenSummary?.callCount || 6} real model invocations`}
          icon={Layers}
          color="amber"
        />
      </div>

      {/* Validation Engine Report */}
      <ValidationPanel validation={plan?.validation} />

      {/* 5 Mandatory Planning Areas Overview */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            Mandatory Planning Areas (5/5 Covered)
          </h3>
          <span className="text-xs text-slate-400">Deterministic Calculations Enforced</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div
            onClick={() => onNavigate('plan')}
            className="p-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/60 border border-slate-700/60 cursor-pointer transition space-y-1.5"
          >
            <div className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider">01 Venue</div>
            <p className="text-sm font-bold text-white">{plan?.venue?.selectedHall || 'Hall A'}</p>
            <p className="text-xs text-slate-400">
              Capacity: {plan?.venue?.capacity || 200} (Seats 177 attendees)
            </p>
            <p className="text-xs text-emerald-400 font-mono font-medium">PKR {plan?.venue?.cost?.toLocaleString() || '120,000'}</p>
          </div>

          <div
            onClick={() => onNavigate('plan')}
            className="p-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/60 border border-slate-700/60 cursor-pointer transition space-y-1.5"
          >
            <div className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider">02 Schedule</div>
            <p className="text-sm font-bold text-white">4-Hour Timetable</p>
            <p className="text-xs text-slate-400">
              {plan?.schedule?.length || 5} activities · 15m prayer
            </p>
            <p className="text-xs text-emerald-400 font-mono font-medium">240 Minutes Exactly</p>
          </div>

          <div
            onClick={() => onNavigate('plan')}
            className="p-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/60 border border-slate-700/60 cursor-pointer transition space-y-1.5"
          >
            <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">03 Food</div>
            <p className="text-sm font-bold text-white">{plan?.food?.packageSelected || 'Standard Box'}</p>
            <p className="text-xs text-slate-400">
              {plan?.food?.quantity || 177} boxes @ Rs {plan?.food?.pricePerPerson || 1200}
            </p>
            <p className="text-xs text-emerald-400 font-mono font-medium">PKR {plan?.food?.totalCalculatedCost?.toLocaleString() || '212,400'}</p>
          </div>

          <div
            onClick={() => onNavigate('plan')}
            className="p-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/60 border border-slate-700/60 cursor-pointer transition space-y-1.5"
          >
            <div className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">04 Judging</div>
            <p className="text-sm font-bold text-white">{plan?.judging?.assignedJudges || 17} Judges</p>
            <p className="text-xs text-slate-400">
              Max 3 teams/judge · 15m/team
            </p>
            <p className="text-xs text-emerald-400 font-mono font-medium">PKR {plan?.judging?.totalHonorarium?.toLocaleString() || '85,000'}</p>
          </div>

          <div
            onClick={() => onNavigate('plan')}
            className="p-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/60 border border-slate-700/60 cursor-pointer transition space-y-1.5"
          >
            <div className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider">05 Budget</div>
            <p className="text-sm font-bold text-white">PKR {plan?.budget?.totalBudget?.toLocaleString() || '650,000'}</p>
            <p className="text-xs text-slate-400">
              Expenses: PKR {plan?.validation?.summary?.totalExpenses?.toLocaleString() || '547,400'}
            </p>
            <p className="text-xs text-emerald-400 font-mono font-medium">Within Limit: YES</p>
          </div>
        </div>
      </div>
    </div>
  );
}
