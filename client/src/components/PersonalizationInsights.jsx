import React from 'react';
import { Sparkles, Accessibility, Heart, Clock, CheckCircle2 } from 'lucide-react';

export default function PersonalizationInsights({ insights }) {
  if (!insights || !insights.data) return null;
  const { data, modelUsed } = insights;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
      {/* Header with GenAI Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Adaptive Attendee Personalization & Cultural Insights
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Tailored specifically for attendee age distribution, accessibility requirements, and cultural traditions.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Powered by {modelUsed || 'Google Gemini Flash Latest'}</span>
        </div>
      </div>

      {/* Grid of Tailored Deliverables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Curated Themes */}
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
          <div className="text-sm font-bold text-white flex items-center gap-2">
            <Heart className="w-4 h-4 text-pink-400" />
            <span>Curated Conceptual Themes</span>
          </div>
          <div className="space-y-2.5">
            {data.curatedThemes?.map((theme, i) => (
              <div key={i} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80">
                <div className="text-xs font-bold text-indigo-300">{theme.name}</div>
                <div className="text-xs text-slate-400 mt-1">{theme.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Accessibility Action Checklist */}
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
          <div className="text-sm font-bold text-white flex items-center gap-2">
            <Accessibility className="w-4 h-4 text-emerald-400" />
            <span>Accessibility & Dietary Action Plan</span>
          </div>
          <div className="space-y-2">
            {data.accessibilityActionPlan?.map((item, i) => (
              <div key={i} className="text-xs text-slate-300 flex items-start gap-2 p-2 rounded-lg bg-slate-900/40">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cultural Honoring Touches */}
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
          <div className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Cultural & Heritage Honoring Touches</span>
          </div>
          <div className="space-y-2">
            {data.culturalHonoringTouches?.map((touch, i) => (
              <div key={i} className="text-xs text-slate-300 flex items-start gap-2 p-2 rounded-lg bg-slate-900/40">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                <span>{touch}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Schedule Pacing & Vendor Brief */}
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
          <div className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-400" />
            <span>Guest Flow & Schedule Pacing</span>
          </div>
          <div className="space-y-2">
            {data.schedulePacingTips?.map((tip, i) => (
              <div key={i} className="text-xs text-slate-300 flex items-start gap-2 p-2 rounded-lg bg-slate-900/40">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0 mt-1.5" />
                <span>{tip}</span>
              </div>
            ))}
          </div>

          {data.vendorBrief && (
            <div className="mt-3 p-3 rounded-lg bg-indigo-950/30 border border-indigo-900/40 text-xs text-indigo-300">
              <span className="font-semibold text-white block mb-0.5">Negotiation Brief for Vendors:</span>
              {data.vendorBrief}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
