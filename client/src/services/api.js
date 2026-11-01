/**
 * API client connecting frontend to EventPilot backend.
 * Uses VITE_API_URL if defined, otherwise falls back to current origin or localhost.
 */

const API_BASE = import.meta.env.VITE_API_URL || '';

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch (err) {
    return { status: 'offline', error: err.message };
  }
}

export async function generateEventPlan(intakeData) {
  const res = await fetch(`${API_BASE}/api/plan/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(intakeData)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to generate plan (${res.status})`);
  }

  return await res.json();
}

export async function rebalanceCategoryBudget(categories, targetCategoryId, newAmount, lockedCategories = []) {
  const res = await fetch(`${API_BASE}/api/plan/budget/rebalance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      categories,
      targetCategoryId,
      newAmount,
      lockedCategories
    })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to rebalance budget');
  }

  return await res.json();
}

export async function updateTimelineTask(tasks, taskId, status) {
  const res = await fetch(`${API_BASE}/api/plan/timeline/task`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tasks, taskId, status })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update timeline');
  }

  return await res.json();
}

export async function replanExistingEvent(existingPlan, changes) {
  const res = await fetch(`${API_BASE}/api/plan/replan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ existingPlan, changes })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to re-plan event');
  }

  return await res.json();
}

export async function compareVendorQuotes(category, vendors, eventRequirements) {
  const res = await fetch(`${API_BASE}/api/vendors/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category, vendors, eventRequirements })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to compare vendors');
  }

  return await res.json();
}
