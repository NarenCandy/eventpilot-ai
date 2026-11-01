/**
 * Re-planning engine:
 * Evaluates changes to budget, date, headcount, priorities, or accessibility requirements,
 * and pinpoints exactly what tasks, categories, and logistics are affected.
 */

import { adjustTotalBudget } from './budgetService.js';
import { shiftEventDate, resolveTimelineDependencies } from './timelineService.js';

export function replanEvent(existingPlan, changes) {
  if (!existingPlan) {
    throw new Error('Existing plan is required for re-planning.');
  }

  const flags = [];
  let updatedBudget = existingPlan.budget;
  let updatedTimeline = existingPlan.timeline;
  let updatedEventInfo = { ...existingPlan.eventInfo };

  // 1. Budget Change
  if (changes.budget !== undefined && Number(changes.budget) !== Number(existingPlan.eventInfo.budget)) {
    const oldBudget = Number(existingPlan.eventInfo.budget);
    const newBudget = Number(changes.budget);
    const diff = newBudget - oldBudget;
    
    updatedEventInfo.budget = newBudget;
    updatedBudget = adjustTotalBudget(existingPlan.budget.categories, newBudget);

    flags.push({
      type: 'budget',
      severity: diff < 0 ? 'warning' : 'info',
      title: diff < 0 ? `Budget Reduced by $${Math.abs(diff).toLocaleString()}` : `Budget Increased by $${diff.toLocaleString()}`,
      message: diff < 0
        ? `All category allocations have been scaled down proportionally. Check high-cost commitments (Venue, Catering) for potential shortfalls.`
        : `Surplus funds have been distributed proportionally across categories. You can also rebalance into your top priority.`
    });
  }

  // 2. Date Change
  if (changes.date && changes.date !== existingPlan.eventInfo.date) {
    const oldDate = new Date(existingPlan.eventInfo.date);
    const newDate = new Date(changes.date);
    const daysDiff = Math.round((newDate - oldDate) / (1000 * 60 * 60 * 24));
    
    updatedEventInfo.date = changes.date;
    updatedTimeline = shiftEventDate(existingPlan.timeline, changes.date);

    flags.push({
      type: 'timeline',
      severity: daysDiff < 0 ? 'urgent' : 'info',
      title: daysDiff < 0 ? `Event Moved Earlier by ${Math.abs(daysDiff)} Days` : `Event Postponed by ${daysDiff} Days`,
      message: daysDiff < 0
        ? `Deadlines for venue booking, vendor contracting, and RSVPs have shifted closer. Tasks nearing their deadline should be expedited.`
        : `All task milestones have been extended to match your new target date.`
    });
  }

  // 3. Headcount Change
  if (changes.headcount !== undefined && Number(changes.headcount) !== Number(existingPlan.eventInfo.headcount)) {
    const oldHeadcount = Number(existingPlan.eventInfo.headcount);
    const newHeadcount = Number(changes.headcount);
    const headDiff = newHeadcount - oldHeadcount;
    
    updatedEventInfo.headcount = newHeadcount;

    flags.push({
      type: 'headcount',
      severity: headDiff > 0 ? 'warning' : 'info',
      title: `Guest Count Changed (${oldHeadcount} → ${newHeadcount})`,
      message: headDiff > 0
        ? `Added ${headDiff} guests. Recalibrate catering order quantities, seating layout, and verify venue max capacity thresholds.`
        : `Reduced by ${Math.abs(headDiff)} guests. Consider right-sizing catering orders and seating tables to reduce waste.`
    });
  }

  // 4. Accessibility / Cultural Changes
  if (changes.accessibilityNeeds && changes.accessibilityNeeds !== existingPlan.eventInfo.accessibilityNeeds) {
    updatedEventInfo.accessibilityNeeds = changes.accessibilityNeeds;
    flags.push({
      type: 'personalization',
      severity: 'info',
      title: 'Accessibility & Dietary Needs Updated',
      message: `Ensure venue ramps, ADA restroom access, allergen separation, or sensory rest zones reflect the updated requirements.`
    });
  }

  if (changes.culturalContext && changes.culturalContext !== existingPlan.eventInfo.culturalContext) {
    updatedEventInfo.culturalContext = changes.culturalContext;
    flags.push({
      type: 'personalization',
      severity: 'info',
      title: 'Cultural Context Updated',
      message: `Ceremony traditions, ceremonial timing buffers, and specialized menu selections will be realigned with: "${changes.culturalContext}".`
    });
  }

  return {
    ...existingPlan,
    eventInfo: updatedEventInfo,
    budget: updatedBudget,
    timeline: updatedTimeline,
    replanFlags: flags,
    lastReplannedAt: new Date().toISOString()
  };
}
