import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateInitialBudget, rebalanceBudget, adjustTotalBudget } from '../src/budgetService.js';
import { generateTimeline, resolveTimelineDependencies, updateTaskStatus, shiftEventDate } from '../src/timelineService.js';
import { compareVendors } from '../src/vendorService.js';
import { replanEvent } from '../src/replanService.js';

describe('EventPilot Core Logic Unit Tests', () => {
  describe('Capability 2: Budget Allocation & Tradeoff Simulation', () => {
    it('should split wedding budget with contingency reserve and visible estimate markers', () => {
      const budget = calculateInitialBudget('wedding', 30000, ['photography']);
      assert.strictEqual(budget.totalBudget, 30000);
      assert.ok(budget.categories.venue);
      assert.ok(budget.categories.catering);
      assert.ok(budget.categories.photography);
      assert.strictEqual(budget.categories.venue.isEstimate, true);
      assert.strictEqual(budget.categories.venue.estimateLabel, 'Estimated — not a confirmed quote');
      
      const sum = Object.values(budget.categories).reduce((acc, c) => acc + c.allocated, 0);
      assert.ok(Math.abs(sum - 30000) <= 5); // rounding tolerance
    });

    it('should simulate budget tradeoff by absorbing increase from unlocked categories', () => {
      const initial = calculateInitialBudget('wedding', 20000);
      const targetCategory = 'photography';
      const originalPhoto = initial.categories.photography.allocated;
      const originalVenue = initial.categories.venue.allocated;
      
      // Increase photography by $2,000
      const rebalanced = rebalanceBudget(initial.categories, targetCategory, originalPhoto + 2000, []);
      
      assert.strictEqual(rebalanced.categories.photography.allocated, originalPhoto + 2000);
      assert.ok(rebalanced.categories.venue.allocated < originalVenue);
      
      const newSum = Object.values(rebalanced.categories).reduce((acc, c) => acc + c.allocated, 0);
      assert.ok(Math.abs(newSum - 20000) <= 5);
    });

    it('should adjust category totals proportionally when total budget changes', () => {
      const initial = calculateInitialBudget('birthday', 5000);
      const adjusted = adjustTotalBudget(initial.categories, 10000);
      assert.strictEqual(adjusted.totalBudget, 10000);
      assert.ok(adjusted.categories.catering.allocated > initial.categories.catering.allocated);
    });
  });

  describe('Capability 3: Dependency-Aware Timeline & DAG Resolution', () => {
    it('should generate sequenced tasks with target dates and mark downstream tasks as blocked', () => {
      const tasks = generateTimeline('wedding', '2026-12-01');
      assert.ok(tasks.length >= 7);
      
      const firstTask = tasks.find(t => t.id === 'task_budget_vision');
      assert.strictEqual(firstTask.status, 'pending');
      
      const cateringTask = tasks.find(t => t.id === 'task_catering_order');
      assert.strictEqual(cateringTask.status, 'blocked');
      assert.ok(cateringTask.blockedBy.includes('task_finalize_guest_count'));
    });

    it('should unblock dependent tasks when predecessor is completed', () => {
      let tasks = generateTimeline('wedding', '2026-12-01');
      
      // Step 1: Complete task_budget_vision
      tasks = updateTaskStatus(tasks, 'task_budget_vision', 'completed');
      const guestEstimate = tasks.find(t => t.id === 'task_guest_estimate');
      assert.strictEqual(guestEstimate.status, 'pending');
      
      // Step 2: Complete guest estimate
      tasks = updateTaskStatus(tasks, 'task_guest_estimate', 'completed');
      const venueScout = tasks.find(t => t.id === 'task_venue_scouting');
      assert.strictEqual(venueScout.status, 'pending');
    });

    it('should shift timeline dates when event date moves', () => {
      const tasks = generateTimeline('wedding', '2026-10-01');
      const originalVenueDate = tasks.find(t => t.id === 'task_venue_scouting').targetDate;
      
      const shifted = shiftEventDate(tasks, '2026-11-01');
      const newVenueDate = shifted.find(t => t.id === 'task_venue_scouting').targetDate;
      assert.notStrictEqual(originalVenueDate, newVenueDate);
    });
  });

  describe('Capability 4: Re-Planning On Parameter Changes', () => {
    it('should re-plan without resetting form when budget and headcount change', () => {
      const budget = calculateInitialBudget('wedding', 25000);
      const timeline = generateTimeline('wedding', '2026-12-01');
      const existingPlan = {
        id: 'test_plan',
        eventInfo: {
          eventType: 'wedding',
          budget: 25000,
          headcount: 120,
          date: '2026-12-01'
        },
        budget,
        timeline
      };

      const replanned = replanEvent(existingPlan, {
        budget: 20000,
        headcount: 150
      });

      assert.strictEqual(replanned.eventInfo.budget, 20000);
      assert.strictEqual(replanned.eventInfo.headcount, 150);
      assert.ok(replanned.replanFlags.length >= 2);
      
      const budgetFlag = replanned.replanFlags.find(f => f.type === 'budget');
      const headcountFlag = replanned.replanFlags.find(f => f.type === 'headcount');
      assert.ok(budgetFlag);
      assert.ok(headcountFlag);
    });
  });

  describe('Capability 5: Structured Vendor Comparison & Gap Detection', () => {
    it('should compare vendor quotes, identify price differences, missing essentials, and label as unverified', () => {
      const vendors = [
        {
          id: 'v1',
          name: 'The Grand Ballroom',
          price: 8000,
          capacity: 150,
          inclusions: ['tables & chairs', 'setup & teardown', 'restrooms', 'climate control'],
          extraCharges: [{ name: 'Cleaning fee', amount: 500 }]
        },
        {
          id: 'v2',
          name: 'Rustic Barn Sanctuary',
          price: 5500,
          capacity: 80, // Less than headcount 100!
          inclusions: ['tables & chairs'],
          extraCharges: [{ name: 'Generator fuel', amount: 400 }, { name: 'Late curfew permit', amount: 300 }]
        }
      ];

      const comparison = compareVendors('venue', vendors, {
        headcount: 100,
        budgetAllocated: 7500
      });

      assert.strictEqual(comparison.vendors.length, 2);
      
      const barn = comparison.vendors.find(v => v.id === 'v2');
      assert.ok(barn.gaps.some(g => g.includes('Capacity deficit')));
      assert.strictEqual(barn.isLowestCost, true);
      assert.strictEqual(barn.isVerifiedQuote, false);
      assert.strictEqual(barn.verificationNotice, 'Unverified quote — user-supplied or simulated estimate');
    });
  });
});
