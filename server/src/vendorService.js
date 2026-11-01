/**
 * Structured vendor comparison engine
 * Analyzes vendor quotes across price, inclusions, capacity, extra fees, and flags gaps.
 */

export function compareVendors(category, vendors = [], eventRequirements = {}) {
  if (!vendors || vendors.length === 0) {
    return {
      category,
      vendors: [],
      analysis: 'No vendors provided for comparison.'
    };
  }

  const { headcount = 0, budgetAllocated = 0 } = eventRequirements;

  // Enhance each vendor with gap analysis and calculations
  const analyzedVendors = vendors.map(v => {
    const quotePrice = Number(v.price) || 0;
    const capacity = Number(v.capacity) || 0;
    const extraCharges = Array.isArray(v.extraCharges) ? v.extraCharges : [];
    const inclusions = Array.isArray(v.inclusions) ? v.inclusions : [];
    
    // Total estimated cost including mandatory extras
    const extraFeesTotal = extraCharges.reduce((sum, fee) => sum + (Number(fee.amount) || 0), 0);
    const totalEstimatedCost = quotePrice + extraFeesTotal;

    const gaps = [];
    const advantages = [];

    // Capacity checks
    if (headcount > 0 && capacity > 0) {
      if (capacity < headcount) {
        gaps.push(`Capacity deficit: Holds ${capacity} guests, but your event requires ${headcount} (short by ${headcount - capacity}).`);
      } else {
        advantages.push(`Capacity satisfied: Comfortably accommodates ${capacity} guests (fits ${headcount} target).`);
      }
    }

    // Budget checks
    if (budgetAllocated > 0) {
      if (totalEstimatedCost > budgetAllocated) {
        const overage = totalEstimatedCost - budgetAllocated;
        gaps.push(`Over budget: Exceeds category target of $${budgetAllocated.toLocaleString()} by $${overage.toLocaleString()} (${Math.round((overage/budgetAllocated)*100)}% over).`);
      } else {
        const savings = budgetAllocated - totalEstimatedCost;
        advantages.push(`Under category budget: Saves $${savings.toLocaleString()} for other categories.`);
      }
    }

    // Inclusions vs common essentials check
    const essentialCheck = checkCategoryEssentials(category, inclusions);
    if (essentialCheck.missing.length > 0) {
      gaps.push(`Missing typical category inclusions: ${essentialCheck.missing.join(', ')}.`);
    }
    if (essentialCheck.included.length > 0) {
      advantages.push(`Includes key essentials: ${essentialCheck.included.join(', ')}.`);
    }

    // Pricing transparency check
    if (extraCharges.length > 0) {
      gaps.push(`Notice: Contains ${extraCharges.length} additional fees ($${extraFeesTotal.toLocaleString()} total), e.g., ${extraCharges.map(f => f.name).join(', ')}.`);
    }

    return {
      ...v,
      quotePrice,
      extraFeesTotal,
      totalEstimatedCost,
      costPerGuest: headcount > 0 ? Math.round(totalEstimatedCost / headcount) : null,
      gaps,
      advantages,
      isVerifiedQuote: false,
      verificationNotice: 'Unverified quote — user-supplied or simulated estimate'
    };
  });

  // Identify Best Value, Lowest Cost, and Most Inclusive
  let lowestCostId = null;
  let minCost = Infinity;
  let mostInclusiveId = null;
  let maxInclusions = -1;

  analyzedVendors.forEach(v => {
    if (v.totalEstimatedCost < minCost) {
      minCost = v.totalEstimatedCost;
      lowestCostId = v.id;
    }
    if ((v.inclusions?.length || 0) > maxInclusions) {
      maxInclusions = v.inclusions.length;
      mostInclusiveId = v.id;
    }
  });

  const finalVendors = analyzedVendors.map(v => ({
    ...v,
    isLowestCost: v.id === lowestCostId,
    isMostInclusive: v.id === mostInclusiveId
  }));

  return {
    category,
    vendors: finalVendors,
    comparisonSummary: {
      totalCompared: finalVendors.length,
      lowestEstimatedCost: minCost === Infinity ? 0 : minCost,
      priceSpread: finalVendors.length > 1 ? Math.max(...finalVendors.map(v => v.totalEstimatedCost)) - minCost : 0,
      disclaimer: 'All vendor quotes displayed are user-supplied or simulated estimates. No real-time vendor API contract or automated pricing guarantee is implied.'
    }
  };
}

/**
 * Standard essential criteria by category to catch gaps in vendor quotes
 */
function checkCategoryEssentials(category, inclusions) {
  const essentialsByCategory = {
    venue: ['tables & chairs', 'setup & teardown', 'restrooms', 'climate control', 'curfew flexibility'],
    catering: ['waitstaff', 'barware/tableware', 'dietary accommodations', 'cake cutting fee waiver', 'cleanup'],
    photography: ['high-res digital gallery', 'second shooter', 'print rights', 'timeline coordination'],
    decor: ['delivery & installation', 'breakdown', 'lighting elements', 'strike team'],
    entertainment: ['sound equipment / pa', 'microphones', 'mc services', 'backup equipment']
  };

  const expected = essentialsByCategory[category.toLowerCase()] || ['setup & delivery', 'contract cancellation terms'];
  const inclusionTexts = inclusions.map(i => i.toLowerCase());

  const included = [];
  const missing = [];

  expected.forEach(item => {
    const words = item.split(' ');
    const found = inclusionTexts.some(inc => words.some(w => w.length > 3 && inc.includes(w)));
    if (found) {
      included.push(item);
    } else {
      missing.push(item);
    }
  });

  return { included, missing };
}
