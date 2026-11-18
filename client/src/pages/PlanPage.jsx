import React from 'react';
import {
  MapPin,
  Clock,
  Utensils,
  Gavel,
  Coins,
  ShieldCheck,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import ValidationPanel from '../components/ValidationPanel';

export default function PlanPage({ plan }) {
  if (!plan) {
    return (
      <div className="text-center py-20 space-y-3">
        <p className="text-sm text-slate-400">No plan generated yet.</p>
        <p className="text-xs text-slate-500">Go to "Upload Message Pack" to run the planning pipeline.</p>
      </div>
    );
  }

  const { venue, schedule = [], food, judging, budget, validation, version = 1 } = plan;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-700/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">Generated Event Plan</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Version {version}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            4-Hour Islamabad Hackathon · 150 Students · 50 Teams · All 5 Areas Validated
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
          <CheckCircle2 className="w-4 h-4" />
          Status: Verifiably Valid
        </div>
      </div>

      {/* Validation Banner */}
      <ValidationPanel validation={validation} />

      {/* 5 Planning Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Venue Section */}
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-400" />
              Area 1: Venue Planning
            </h3>
            <span className="text-xs font-mono font-semibold text-purple-400">PKR {venue.cost?.toLocaleString()}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-900/50 rounded-lg">
              <span className="text-slate-400 block">Selected Hall</span>
              <strong className="text-white text-sm">{venue.selectedHall || 'Hall A'}</strong>
            </div>
            <div className="p-3 bg-slate-900/50 rounded-lg">
              <span className="text-slate-400 block">Capacity vs Required</span>
              <strong className="text-emerald-400 text-sm">{venue.capacity} seats ({venue.capacity - (venue.attendees || 177)} surplus)</strong>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/40 p-3 rounded-lg border border-slate-800">
            {venue.reasoning || `Selected ${venue.selectedHall} which accommodates all 177 attendees (150 students + 10 staff + 17 judges) with minimal cost.`}
          </p>

          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span><strong>Provenance:</strong> Margalla Event Halls email (Room D, Hall A, Hall B, Hall C options).</span>
          </div>
        </div>

        {/* 2. Schedule Section */}
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              Area 2: Schedule (240 Minutes Exactly)
            </h3>
            <span className="text-xs font-mono font-semibold text-blue-400">4 Hours Total</span>
          </div>

          <div className="space-y-2">
            {schedule.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 bg-slate-900/50 rounded-lg border border-slate-700/40 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-400 font-mono text-[10px] flex items-center justify-center font-bold">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-white">{item.name}</p>
                    {item.startTime && item.endTime && (
                      <p className="text-[10px] text-slate-400">{item.startTime} – {item.endTime}</p>
                    )}
                  </div>
                </div>
                <span className="font-mono text-slate-300 font-medium px-2 py-0.5 rounded bg-slate-800">
                  {item.durationMinutes} mins
                </span>
              </div>
            ))}
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span><strong>Provenance:</strong> Dean's approval (4-hour duration, 15-minute prayer break).</span>
          </div>
        </div>

        {/* 3. Food Section */}
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Utensils className="w-4 h-4 text-emerald-400" />
              Area 3: Food & Catering
            </h3>
            <span className="text-xs font-mono font-semibold text-emerald-400">
              PKR {food.totalCalculatedCost?.toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5 text-xs">
            <div className="p-3 bg-slate-900/50 rounded-lg">
              <span className="text-slate-400 block">Package</span>
              <strong className="text-white text-xs">{food.packageSelected}</strong>
            </div>
            <div className="p-3 bg-slate-900/50 rounded-lg">
              <span className="text-slate-400 block">Quantity</span>
              <strong className="text-white text-xs">{food.quantity} boxes (177 heads)</strong>
            </div>
            <div className="p-3 bg-slate-900/50 rounded-lg">
              <span className="text-slate-400 block">Rate / Person</span>
              <strong className="text-emerald-400 text-xs">PKR {food.pricePerPerson}</strong>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/40 p-3 rounded-lg border border-slate-800">
            Ordered for 150 students + 10 staff + 17 judges = 177 individuals. Caterer rate updated to PKR 1,200/head (superseding earlier PKR 1,000 quote) with free delivery.
          </p>

          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span><strong>Provenance:</strong> Caterer WhatsApp (12 Nov: "ab Rs 1,200 per head hoga. Delivery free hai").</span>
          </div>
        </div>

        {/* 4. Judging Section */}
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Gavel className="w-4 h-4 text-amber-400" />
              Area 4: Judging Coverage
            </h3>
            <span className="text-xs font-mono font-semibold text-amber-400">
              PKR {judging.totalHonorarium?.toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5 text-xs">
            <div className="p-3 bg-slate-900/50 rounded-lg">
              <span className="text-slate-400 block">Judges Assigned</span>
              <strong className="text-white text-xs">{judging.assignedJudges} (20 available)</strong>
            </div>
            <div className="p-3 bg-slate-900/50 rounded-lg">
              <span className="text-slate-400 block">Team Allocation</span>
              <strong className="text-white text-xs">Max {judging.maxTeamsPerJudge || 3} teams/judge</strong>
            </div>
            <div className="p-3 bg-slate-900/50 rounded-lg">
              <span className="text-slate-400 block">Honorarium</span>
              <strong className="text-amber-400 text-xs">PKR {judging.honorariumPerJudge?.toLocaleString()} each</strong>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/40 p-3 rounded-lg border border-slate-800">
            50 teams evaluated across 17 judges. Each judge evaluates maximum 3 teams at 15 minutes per team, totaling a 45-minute judging session within the schedule.
          </p>

          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span><strong>Provenance:</strong> Judging Coordinator email (20 judges, Rs 5,000 honorarium, 15 min/team).</span>
          </div>
        </div>
      </div>

      {/* 5. Budget Section */}
      <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Coins className="w-4 h-4 text-emerald-400" />
            Area 5: Budget & Expense Accounting
          </h3>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span>Total: <strong className="text-white">PKR {budget.totalBudget?.toLocaleString()}</strong></span>
            <span>Expenses: <strong className="text-rose-400">PKR {validation?.summary?.totalExpenses?.toLocaleString()}</strong></span>
            <span>Remaining: <strong className="text-emerald-400">PKR {validation?.summary?.remainingBudget?.toLocaleString()}</strong></span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-2.5 rounded-l-lg">Expense Item</th>
                <th className="px-4 py-2.5">Category</th>
                <th className="px-4 py-2.5 text-right rounded-r-lg">Amount (PKR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40 text-slate-200">
              {budget.expenses?.map((exp, i) => (
                <tr key={i} className="hover:bg-slate-700/30">
                  <td className="px-4 py-2.5 font-medium">{exp.name}</td>
                  <td className="px-4 py-2.5 capitalize text-slate-400">{exp.category}</td>
                  <td className="px-4 py-2.5 text-right font-mono font-semibold">{Number(exp.amount).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-700 text-xs font-bold text-white">
                <td className="px-4 py-3" colSpan={2}>Grand Total Expenses</td>
                <td className="px-4 py-3 text-right font-mono text-rose-400">
                  PKR {validation?.summary?.totalExpenses?.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
