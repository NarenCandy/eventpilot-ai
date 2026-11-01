import React, { useState } from 'react';
import { 
  Sparkles, 
  Calendar, 
  DollarSign, 
  Store, 
  RefreshCw, 
  AlertCircle, 
  Layers
} from 'lucide-react';
import GuidedIntake from './components/GuidedIntake';
import BudgetTradeoff from './components/BudgetTradeoff';
import DependencyTimeline from './components/DependencyTimeline';
import VendorComparison from './components/VendorComparison';
import PersonalizationInsights from './components/PersonalizationInsights';
import ReplanModal from './components/ReplanModal';
import { generateEventPlan, checkBackendHealth } from './services/api';

export default function App() {
  const [currentPlan, setCurrentPlan] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReplanOpen, setIsReplanOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [errorNotice, setErrorNotice] = useState(null);

  // Check backend connectivity on mount
  React.useEffect(() => {
    checkBackendHealth().then((res) => {
      setBackendStatus(res.status === 'healthy' ? 'connected' : 'offline');
    });
  }, []);

  const handlePlanGenerated = async (intakeData) => {
    setIsGenerating(true);
    setErrorNotice(null);
    try {
      const plan = await generateEventPlan(intakeData);
      setCurrentPlan(plan);
      setActiveTab('overview');
    } catch (err) {
      console.error(err);
      setErrorNotice(err.message || 'Failed to generate plan from backend');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBudgetUpdated = (updatedBudget) => {
    setCurrentPlan(prev => ({
      ...prev,
      budget: {
        ...prev.budget,
        ...updatedBudget
      }
    }));
  };

  const handleTimelineUpdated = (updatedTimeline) => {
    setCurrentPlan(prev => ({
      ...prev,
      timeline: updatedTimeline
    }));
  };

  const handlePlanReplanned = (replannedPlan) => {
    setCurrentPlan(replannedPlan);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                EventPilot
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                GenAI Planner
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mr-2 hidden sm:flex">
              <span className={`w-2 h-2 rounded-full ${backendStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span>{backendStatus === 'connected' ? 'API Active' : 'API Connecting'}</span>
            </div>

            {currentPlan && (
              <>
                <button
                  type="button"
                  onClick={() => setIsReplanOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Re-Plan / Adjust</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentPlan(null)}
                  className="text-xs text-slate-400 hover:text-white px-2 py-1"
                >
                  New Plan
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {errorNotice && (
          <div className="max-w-4xl mx-auto mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorNotice}</span>
          </div>
        )}

        {!currentPlan ? (
          /* Intake Flow */
          <div className="py-4">
            <GuidedIntake onPlanGenerated={handlePlanGenerated} isLoading={isGenerating} />
          </div>
        ) : (
          /* Plan Dashboard View */
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Event Summary Bar */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {currentPlan.eventInfo.eventType}
                  </span>
                  <span className="text-xs text-slate-400">
                    Generated {new Date(currentPlan.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  {currentPlan.eventInfo.occasion}
                </h1>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                  {currentPlan.eventInfo.mustHaves || 'Customized celebration blueprint with adaptive logistics'}
                </p>
              </div>

              {/* Quick Metrics */}
              <div className="flex items-center gap-4 text-xs shrink-0 flex-wrap">
                <div className="bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800">
                  <div className="text-slate-500">Budget Target</div>
                  <div className="text-sm font-bold text-emerald-400 font-mono">
                    ${currentPlan.budget?.totalBudget?.toLocaleString()}
                  </div>
                </div>

                <div className="bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800">
                  <div className="text-slate-500">Headcount</div>
                  <div className="text-sm font-bold text-sky-400 font-mono">
                    {currentPlan.eventInfo.headcount} Guests
                  </div>
                </div>

                <div className="bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800">
                  <div className="text-slate-500">Event Date</div>
                  <div className="text-sm font-bold text-amber-400 font-mono">
                    {currentPlan.eventInfo.date}
                  </div>
                </div>
              </div>
            </div>

            {/* Re-planning Notification Flags */}
            {currentPlan.replanFlags && currentPlan.replanFlags.length > 0 && (
              <div className="space-y-2">
                {currentPlan.replanFlags.map((flag, i) => (
                  <div
                    key={i}
                    className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                      flag.severity === 'urgent'
                        ? 'bg-rose-950/30 border-rose-800 text-rose-300'
                        : flag.severity === 'warning'
                        ? 'bg-amber-950/30 border-amber-800 text-amber-300'
                        : 'bg-indigo-950/30 border-indigo-800 text-indigo-300'
                    }`}
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-xs text-white">{flag.title}</div>
                      <div className="text-xs mt-0.5">{flag.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto pb-2">
              {[
                { id: 'overview', label: 'Plan Blueprint', icon: Layers },
                { id: 'budget', label: 'Budget Tradeoffs', icon: DollarSign },
                { id: 'timeline', label: 'Timeline & Dependencies', icon: Calendar },
                { id: 'vendors', label: 'Vendor Quotes', icon: Store },
                { id: 'personalization', label: 'Adaptive Insights', icon: Sparkles }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Views */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <PersonalizationInsights insights={currentPlan.insights} eventInfo={currentPlan.eventInfo} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <BudgetTradeoff budgetData={currentPlan.budget} onBudgetUpdated={handleBudgetUpdated} />
                  <DependencyTimeline timelineData={currentPlan.timeline} onTimelineUpdated={handleTimelineUpdated} />
                </div>
              </div>
            )}

            {activeTab === 'budget' && (
              <BudgetTradeoff budgetData={currentPlan.budget} onBudgetUpdated={handleBudgetUpdated} />
            )}

            {activeTab === 'timeline' && (
              <DependencyTimeline timelineData={currentPlan.timeline} onTimelineUpdated={handleTimelineUpdated} />
            )}

            {activeTab === 'vendors' && (
              <VendorComparison currentPlan={currentPlan} />
            )}

            {activeTab === 'personalization' && (
              <PersonalizationInsights insights={currentPlan.insights} eventInfo={currentPlan.eventInfo} />
            )}
          </div>
        )}

        {/* Replan Modal */}
        {isReplanOpen && currentPlan && (
          <ReplanModal
            existingPlan={currentPlan}
            onPlanReplanned={handlePlanReplanned}
            onClose={() => setIsReplanOpen(false)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <p>EventPilot &bull; Prompt Wars Virtual Challenge 5 &bull; Flagship: Modern Wedding & Reception</p>
        <p className="mt-1 text-[11px] text-slate-600">All prices and vendor quotes shown are estimates for planning simulation purposes.</p>
      </footer>
    </div>
  );
}
