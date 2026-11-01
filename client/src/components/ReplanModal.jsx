import React, { useState } from 'react';
import { RefreshCw, AlertTriangle, TrendingDown, TrendingUp, Calendar, Users, DollarSign } from 'lucide-react';
import { replanExistingEvent } from '../services/api';

export default function ReplanModal({ existingPlan, onPlanReplanned, onClose }) {
  const [budget, setBudget] = useState(existingPlan?.eventInfo?.budget || 30000);
  const [headcount, setHeadcount] = useState(existingPlan?.eventInfo?.headcount || 100);
  const [date, setDate] = useState(existingPlan?.eventInfo?.date || '2026-11-20');
  const [accessibilityNeeds, setAccessibilityNeeds] = useState(existingPlan?.eventInfo?.accessibilityNeeds || '');
  const [culturalContext, setCulturalContext] = useState(existingPlan?.eventInfo?.culturalContext || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const replanned = await replanExistingEvent(existingPlan, {
        budget: Number(budget),
        headcount: Number(headcount),
        date,
        accessibilityNeeds,
        culturalContext
      });
      onPlanReplanned(replanned);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const budgetDelta = Number(budget) - (existingPlan?.eventInfo?.budget || 0);
  const headcountDelta = Number(headcount) - (existingPlan?.eventInfo?.headcount || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-semibold mb-2">
              <RefreshCw className="w-3 h-3" />
              <span>Adaptive Re-Planning Engine</span>
            </div>
            <h3 className="text-xl font-bold text-white">
              Modify Parameters Without Restarting
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              EventPilot keeps your locked selections and pinpoints exactly which categories and timeline dates require adjustment.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-mono p-1"
          >
            &times;
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                Updated Total Budget ($)
              </label>
              <input
                type="number"
                min="500"
                step="250"
                required
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {budgetDelta !== 0 && (
                <div className={`text-[11px] mt-1 flex items-center gap-1 ${budgetDelta > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {budgetDelta > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span>{budgetDelta > 0 ? `+$${budgetDelta.toLocaleString()} surplus` : `-$${Math.abs(budgetDelta).toLocaleString()} reduction`}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-sky-400" />
                Updated Headcount
              </label>
              <input
                type="number"
                min="5"
                max="5000"
                required
                value={headcount}
                onChange={(e) => setHeadcount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {headcountDelta !== 0 && (
                <div className={`text-[11px] mt-1 flex items-center gap-1 ${headcountDelta > 0 ? 'text-indigo-400' : 'text-slate-400'}`}>
                  <span>{headcountDelta > 0 ? `+${headcountDelta} additional guests` : `${headcountDelta} fewer guests`}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              Updated Event Date
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Accessibility or Dietary Needs Adjustment
            </label>
            <textarea
              rows={2}
              value={accessibilityNeeds}
              onChange={(e) => setAccessibilityNeeds(e.target.value)}
              placeholder="e.g. Added mobility ramp requests, new allergen constraints"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Cultural Context or Traditions Adjustment
            </label>
            <textarea
              rows={2}
              value={culturalContext}
              onChange={(e) => setCulturalContext(e.target.value)}
              placeholder="e.g. Added ceremony traditions, prayers, or cultural performances"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-indigo-600/30"
            >
              {isSubmitting ? (
                <span>Recomputing Plan Impact...</span>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Update & Replan Event</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
