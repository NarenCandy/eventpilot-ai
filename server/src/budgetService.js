/**
 * Core budget allocation logic and tradeoff simulation
 */

export const DEFAULT_BUDGET_SPLITS = {
  wedding: {
    venue: 0.30,
    catering: 0.28,
    photography: 0.12,
    decor: 0.10,
    attire: 0.08,
    entertainment: 0.07,
    contingency: 0.05
  },
  birthday: {
    venue: 0.25,
    catering: 0.35,
    decor: 0.15,
    entertainment: 0.15,
    photography: 0.05,
    contingency: 0.05
  },
  community: {
    venue: 0.25,
    catering: 0.25,
    equipment: 0.20,
    logistics: 0.15,
    permits_safety: 0.10,
    contingency: 0.05
  }
};

export const CATEGORY_LABELS = {
  venue: 'Venue & Facilities',
  catering: 'Catering & Beverages',
  photography: 'Photography & Videography',
  decor: 'Decor, Florals & Ambiance',
  attire: 'Attire & Styling',
  entertainment: 'Music & Entertainment',
  equipment: 'Audio/Visual & Stage Equipment',
  logistics: 'Signage, Transport & Waste',
  permits_safety: 'Permits, Insurance & First Aid',
  contingency: 'Buffer / Contingency Reserve'
};

/**
 * Calculates initial budget categories based on event type, total budget, and priorities.
 */
export function calculateInitialBudget(eventType, totalBudget, priorities = []) {
  const splits = DEFAULT_BUDGET_SPLITS[eventType] || DEFAULT_BUDGET_SPLITS.wedding;
  const categories = {};
  
  // Weights adjustment based on priorities
  const activeSplits = { ...splits };
  let extraWeight = 0;
  
  priorities.forEach(p => {
    const key = p.toLowerCase();
    if (activeSplits[key] !== undefined) {
      activeSplits[key] += 0.05;
      extraWeight += 0.05;
    }
  });

  // Re-normalize weights to sum to 1.0
  const totalWeight = Object.values(activeSplits).reduce((sum, w) => sum + w, 0);
  
  Object.keys(activeSplits).forEach(cat => {
    const normalizedWeight = activeSplits[cat] / totalWeight;
    const allocated = Math.round(totalBudget * normalizedWeight);
    categories[cat] = {
      id: cat,
      name: CATEGORY_LABELS[cat] || cat,
      allocated,
      percentage: Math.round(normalizedWeight * 100),
      isEstimate: true,
      estimateLabel: 'Estimated — not a confirmed quote'
    };
  });

  return {
    totalBudget: Number(totalBudget),
    allocatedTotal: Object.values(categories).reduce((sum, c) => sum + c.allocated, 0),
    categories
  };
}

/**
 * Rebalance categories when a user shifts budget in a specific category.
 * If user locks certain categories, rebalance only among unlocked categories.
 */
export function rebalanceBudget(currentCategories, targetCategoryId, newAmount, lockedCategories = []) {
  const catKeys = Object.keys(currentCategories);
  if (!catKeys.includes(targetCategoryId)) {
    throw new Error(`Category ${targetCategoryId} not found`);
  }

  const oldAmount = currentCategories[targetCategoryId].allocated;
  const delta = newAmount - oldAmount;
  
  // Available categories to absorb the delta (excluding target and locked)
  const flexibleKeys = catKeys.filter(k => k !== targetCategoryId && !lockedCategories.includes(k));
  
  const updated = JSON.parse(JSON.stringify(currentCategories));
  updated[targetCategoryId].allocated = Math.max(0, Math.round(newAmount));

  if (flexibleKeys.length === 0) {
    // Cannot rebalance across other categories, total changes
    const newTotal = Object.values(updated).reduce((sum, c) => sum + c.allocated, 0);
    Object.keys(updated).forEach(k => {
      updated[k].percentage = newTotal > 0 ? Math.round((updated[k].allocated / newTotal) * 100) : 0;
    });
    return {
      categories: updated,
      totalBudget: newTotal,
      warning: 'All other categories are locked or none available to absorb tradeoff.'
    };
  }

  const flexibleTotal = flexibleKeys.reduce((sum, k) => sum + currentCategories[k].allocated, 0);

  if (flexibleTotal <= 0) {
    // Distribute delta evenly
    const share = Math.round(delta / flexibleKeys.length);
    flexibleKeys.forEach(k => {
      updated[k].allocated = Math.max(0, updated[k].allocated - share);
    });
  } else {
    // Distribute proportionally
    flexibleKeys.forEach(k => {
      const proportion = currentCategories[k].allocated / flexibleTotal;
      const reduction = Math.round(delta * proportion);
      updated[k].allocated = Math.max(0, updated[k].allocated - reduction);
    });
  }

  const finalTotal = Object.values(updated).reduce((sum, c) => sum + c.allocated, 0);
  Object.keys(updated).forEach(k => {
    updated[k].percentage = finalTotal > 0 ? Math.round((updated[k].allocated / finalTotal) * 100) : 0;
    updated[k].isEstimate = true;
    updated[k].estimateLabel = 'Estimated — not a confirmed quote';
  });

  return {
    categories: updated,
    totalBudget: finalTotal,
    absorbedBy: flexibleKeys
  };
}

/**
 * Handle re-planning when total budget changes.
 */
export function adjustTotalBudget(currentCategories, newTotalBudget) {
  const currentTotal = Object.values(currentCategories).reduce((sum, c) => sum + c.allocated, 0);
  const ratio = currentTotal > 0 ? newTotalBudget / currentTotal : 1;
  const updated = {};

  Object.entries(currentCategories).forEach(([key, cat]) => {
    const newAlloc = Math.max(0, Math.round(cat.allocated * ratio));
    updated[key] = {
      ...cat,
      allocated: newAlloc,
      percentage: newTotalBudget > 0 ? Math.round((newAlloc / newTotalBudget) * 100) : 0,
      isEstimate: true,
      estimateLabel: 'Estimated — not a confirmed quote'
    };
  });

  return {
    totalBudget: Number(newTotalBudget),
    allocatedTotal: Object.values(updated).reduce((sum, c) => sum + c.allocated, 0),
    categories: updated
  };
}
