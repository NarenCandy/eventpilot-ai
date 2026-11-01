import React, { useState } from 'react';
import { DollarSign, AlertCircle, Lock, Unlock, ArrowRightLeft, Info } from 'lucide-react';
import { rebalanceCategoryBudget } from '../services/api';

export default function BudgetTradeoff({ budgetData, onBudgetUpdated }) {
  const [categories, setCategories] = useState(budgetData?.categories || {});
  const [lockedCategories, setLockedCategories] = useState([]);
  const [lastNotification, setLastNotification] = useState(null);

  React.useEffect(() => {
    if (budgetData?.categories) {
      setCategories(budgetData.categories);
    }
  }, [budgetData]);

  const totalAllocated = Object.values(categories).reduce((sum, c) => sum + (c.allocated || 0), 0);
  const targetBudget = budgetData?.totalBudget || totalAllocated;

  const toggleLock = (catId) => {
    setLockedCategories(prev =>
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  const handleSliderChange = async (catId, newAmount) => {
    const numericAmount = Math.max(0, Number(newAmount));
    const updated = {
      ...categories,
      [catId]: {
        ...categories[catId],
        allocated: numericAmount
      }
    };
    setCategories(updated);

    try {
      const res = await rebalanceCategoryBudget(categories, catId, numericAmount, lockedCategories);
      setCategories(res.categories);
      setLastNotification(res.absorbedBy ? `Tradeoff absorbed by: ${res.absorbedBy.join(', ')}` : res.warning);
      if (onBudgetUpdated) {
        onBudgetUpdated({
          totalBudget: res.totalBudget,
          categories: res.categories
        });
      }
    } catch (err) {
      console.error('Failed to rebalance:', err);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
      {/* Top Banner with Strict Estimate Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            Interactive Budget Allocation & Tradeoff Simulation
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Drag any category slider to see immediate budget tradeoff repercussions across other sectors.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Notice: All line items are <strong>estimated — not confirmed quotes</strong>.</span>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400">Total Budget Target</div>
          <div className="text-2xl font-bold text-white mt-1">
            ${targetBudget.toLocaleString()}
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400">Total Allocated Sum</div>
          <div className={`text-2xl font-bold mt-1 ${totalAllocated > targetBudget ? 'text-rose-400' : 'text-emerald-400'}`}>
            ${totalAllocated.toLocaleString()}
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400">Variance Balance</div>
          <div className="text-2xl font-bold text-slate-300 mt-1">
            {targetBudget - totalAllocated === 0
              ? 'Balanced (100%)'
              : `$${(targetBudget - totalAllocated).toLocaleString()} remaining`}
          </div>
        </div>
      </div>

      {lastNotification && (
        <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs flex items-center gap-2">
          <ArrowRightLeft className="w-4 h-4 shrink-0" />
          <span>{lastNotification}</span>
        </div>
      )}

      {/* Visual Bar Breakdown */}
      <div className="space-y-1.5">
        <div className="text-xs font-semibold text-slate-300">Category Proportions</div>
        <div className="w-full h-3 bg-slate-950 rounded-full flex overflow-hidden border border-slate-800">
          {Object.entries(categories).map(([key, cat], i) => {
            const colors = ['bg-indigo-500', 'bg-rose-500', 'bg-amber-500', 'bg-emerald-500', 'bg-sky-500', 'bg-purple-500', 'bg-teal-500'];
            const colorClass = colors[i % colors.length];
            return (
              <div
                key={key}
                title={`${cat.name}: $${cat.allocated.toLocaleString()} (${cat.percentage}%)`}
                style={{ width: `${Math.max(2, cat.percentage)}%` }}
                className={`${colorClass} h-full transition-all duration-300`}
              />
            );
          })}
        </div>
      </div>

      {/* Category Slider List */}
      <div className="space-y-4">
        {Object.entries(categories).map(([key, cat]) => {
          const isLocked = lockedCategories.includes(key);
          const maxPossible = Math.round(targetBudget * 0.8);

          return (
            <div
              key={key}
              className={`p-4 rounded-xl border transition-all ${
                isLocked
                  ? 'bg-slate-950/40 border-slate-800/60 opacity-80'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleLock(key)}
                    title={isLocked ? 'Unlock category from tradeoffs' : 'Lock category to preserve current allocation'}
                    className={`p-1.5 rounded-lg border text-xs transition-colors ${
                      isLocked
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  </button>
                  <span className="text-sm font-semibold text-white">{cat.name}</span>
                  {isLocked && (
                    <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      Protected
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 font-mono">
                    {cat.percentage}%
                  </span>
                  <span className="text-sm font-bold text-white font-mono bg-slate-900 px-3 py-1 rounded-md border border-slate-800">
                    ${cat.allocated.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Slider Control */}
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max={maxPossible}
                  step="250"
                  disabled={isLocked}
                  value={cat.allocated}
                  onChange={(e) => handleSliderChange(key, e.target.value)}
                  className={`w-full accent-indigo-500 ${isLocked ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}`}
                />
              </div>

              {/* Strict Estimate Label */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                <span className="italic flex items-center gap-1">
                  <Info className="w-3 h-3 text-slate-600" />
                  Estimated — not a confirmed quote
                </span>
                <span>{isLocked ? 'Locked from auto-balancing' : 'Shifts distribute across flexible categories'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
