import React, { useState } from 'react';
import { Calendar, Users, DollarSign, Sparkles, Heart, Gift, Building2, CheckCircle2, ArrowRight, Accessibility, Globe } from 'lucide-react';

const EVENT_PRESETS = [
  {
    type: 'wedding',
    title: 'Flagship: Wedding & Reception',
    icon: Heart,
    color: 'from-pink-500 to-rose-600',
    description: 'Ceremony, reception banquet, photography, florals, seating and personalized traditions.',
    sample: {
      budget: 32000,
      headcount: 120,
      date: '2026-11-20',
      occasion: 'Modern Multicultural Wedding & Reception',
      priorities: ['venue', 'catering', 'photography'],
      mustHaves: 'Outdoor sunset ceremony space, live acoustic trio, and separate dessert bar.',
      attendeeAges: 'Multi-generational (ages 4 to 82, grandparents and young children present)',
      attendeeInterests: 'Dancing, artisan foodie experiences, memorable photography moments',
      accessibilityNeeds: 'Step-free ramp access to alter/stage, wheelchair accessible restrooms, gluten-free & nut-free dietary options',
      culturalContext: 'Fusion ceremony blending South Asian welcoming rituals with modern Western reception toasts'
    }
  },
  {
    type: 'birthday',
    title: 'Milestone Birthday Party',
    icon: Gift,
    color: 'from-amber-500 to-orange-600',
    description: 'Milestone anniversary or celebration, themed lounge, custom cake, interactive games.',
    sample: {
      budget: 6500,
      headcount: 50,
      date: '2026-08-15',
      occasion: '30th Milestone Glow Retro Party',
      priorities: ['catering', 'entertainment', 'decor'],
      mustHaves: 'Neon light tunnel entrance, signature craft mocktails, retro arcade setup',
      attendeeAges: 'Young adults & peers (ages 24-35)',
      attendeeInterests: 'High energy music, retro gaming, photography photo-ops',
      accessibilityNeeds: 'Low-sensory quiet lounge zone with gentle lighting away from the dancefloor',
      culturalContext: 'Family gathering with traditional blessing before evening party commences'
    }
  },
  {
    type: 'community',
    title: 'Community Festival / Fundraiser',
    icon: Building2,
    color: 'from-emerald-500 to-teal-600',
    description: 'Civic gathering, local maker booths, permits, safety, stage staging, volunteer teams.',
    sample: {
      budget: 18000,
      headcount: 350,
      date: '2026-10-10',
      occasion: 'Annual Neighborhood Arts & Harvest Gala',
      priorities: ['permits_safety', 'equipment', 'logistics'],
      mustHaves: 'Central stage for youth performances, 15 artisan booths, composting stations',
      attendeeAges: 'General public & all ages from infants to seniors',
      attendeeInterests: 'Local music, crafts, local food trucks, community storytelling',
      accessibilityNeeds: 'ADA ramps, designated companion seating, multilingual wayfinding signage, large-print schedules',
      culturalContext: 'Neighborhood heritage celebration honoring indigenous history and diverse immigrant communities'
    }
  }
];

export default function GuidedIntake({ onPlanGenerated, isLoading }) {
  const [selectedType, setSelectedType] = useState('wedding');
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(EVENT_PRESETS[0].sample);

  const handleSelectPreset = (preset) => {
    setSelectedType(preset.type);
    setFormData(preset.sample);
  };

  const handlePriorityToggle = (priorityKey) => {
    setFormData(prev => {
      const exists = prev.priorities.includes(priorityKey);
      const updated = exists
        ? prev.priorities.filter(p => p !== priorityKey)
        : [...prev.priorities, priorityKey];
      return { ...prev, priorities: updated };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onPlanGenerated({
      ...formData,
      eventType: selectedType
    });
  };

  return (
    <div className="max-w-4xl mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-10 backdrop-blur-md">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Step {step} of 2 &bull; Structured Guided Intake</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Let’s Architect Your Event Vision
        </h2>
        <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-2xl mx-auto">
          EventPilot asks structured questions before generating your plan — no one-shot generic lists.
        </p>
      </div>

      {/* Flagship Notice & Event Type Selector */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs uppercase tracking-wider font-semibold text-slate-300">
            Select Event Type
          </label>
          <span className="text-xs text-indigo-400 font-medium">
            Flagship Showcase: Wedding & Reception
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {EVENT_PRESETS.map((p) => {
            const Icon = p.icon;
            const isSelected = selectedType === p.type;
            return (
              <button
                key={p.type}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className={`text-left p-4 rounded-xl border transition-all duration-200 relative ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-950/40 ring-2 ring-indigo-500/30'
                    : 'border-slate-800 bg-slate-800/40 hover:border-slate-700 hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${p.color} text-white`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="font-semibold text-white text-sm">
                    {p.type.charAt(0).toUpperCase() + p.type.slice(1)}
                  </div>
                  {p.type === 'wedding' && (
                    <span className="ml-auto text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30">
                      Flagship
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 line-clamp-2">
                  {p.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 1 ? (
          /* Step 1: Core Metrics & Priorities */
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  Total Budget (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500 text-sm">$</span>
                  <input
                    type="number"
                    min="500"
                    step="100"
                    required
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">All unconfirmed figures marked as estimates.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-sky-400" />
                  Target Headcount
                </label>
                <input
                  type="number"
                  min="5"
                  max="5000"
                  required
                  value={formData.headcount}
                  onChange={(e) => setFormData({ ...formData, headcount: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">Directly calibrates catering & venue minimums.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  Target Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">Generates backwards milestone schedule.</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Occasion Title & Vision
              </label>
              <input
                type="text"
                required
                value={formData.occasion}
                onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                placeholder="e.g. Modern Multicultural Wedding & Reception"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Priority Weights */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Top Investment Priorities (Influences initial budget weightings)
              </label>
              <div className="flex flex-wrap gap-2">
                {['venue', 'catering', 'photography', 'decor', 'entertainment', 'logistics', 'permits_safety'].map((p) => {
                  const isChecked = formData.priorities.includes(p);
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handlePriorityToggle(p)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                        isChecked
                          ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                          : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <CheckCircle2 className={`w-3.5 h-3.5 ${isChecked ? 'text-indigo-400' : 'opacity-40'}`} />
                      {p.charAt(0).toUpperCase() + p.slice(1).replace('_', ' & ')}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Non-Negotiable Must-Haves
              </label>
              <textarea
                rows={2}
                value={formData.mustHaves}
                onChange={(e) => setFormData({ ...formData, mustHaves: e.target.value })}
                placeholder="Specific elements that MUST be included in the plan..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
              >
                <span>Continue to Attendee Personalization</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Step 2: Adaptive Personalization & Accessibility */
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="bg-slate-800/40 border border-slate-800 p-4 rounded-xl flex items-start gap-3">
              <Accessibility className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300">
                <span className="font-semibold text-white">Adaptive Personalization Rule:</span> We don't assume a "default" guest. Tell us about ages, interests, mobility, sensory, dietary, and cultural traditions so the AI tailors a tailored itinerary.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-400" />
                  Attendee Ages & Demographics
                </label>
                <input
                  type="text"
                  value={formData.attendeeAges}
                  onChange={(e) => setFormData({ ...formData, attendeeAges: e.target.value })}
                  placeholder="e.g. Toddlers to seniors (ages 4-82)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Guest Interests & Atmosphere
                </label>
                <input
                  type="text"
                  value={formData.attendeeInterests}
                  onChange={(e) => setFormData({ ...formData, attendeeInterests: e.target.value })}
                  placeholder="e.g. High energy dancing, foodie experience, photo moments"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Accessibility className="w-4 h-4 text-rose-400" />
                Accessibility, Mobility & Dietary Needs
              </label>
              <textarea
                rows={2}
                value={formData.accessibilityNeeds}
                onChange={(e) => setFormData({ ...formData, accessibilityNeeds: e.target.value })}
                placeholder="e.g. Step-free wheelchair access, quiet low-sensory area, gluten-free & nut-free certified food"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-sky-400" />
                Cultural, Heritage, or Faith Traditions
              </label>
              <textarea
                rows={2}
                value={formData.culturalContext}
                onChange={(e) => setFormData({ ...formData, culturalContext: e.target.value })}
                placeholder="e.g. Fusion traditions, ceremonial timings, respectful customs, specific blessings"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-sm transition-colors"
              >
                Back to Core Details
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Synthesizing Plan with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Structured Event Plan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
