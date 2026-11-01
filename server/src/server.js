import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { calculateInitialBudget, rebalanceBudget, adjustTotalBudget } from './budgetService.js';
import { generateTimeline, updateTaskStatus, shiftEventDate } from './timelineService.js';
import { compareVendors } from './vendorService.js';
import { replanEvent } from './replanService.js';
import { generatePersonalizedInsights } from './geminiService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server) or matching origin
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production' || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS policy.`));
  },
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));

// Request validation middleware
function validatePlanInput(req, res, next) {
  const { eventType, budget, headcount, date } = req.body;
  if (!eventType || !budget || !headcount || !date) {
    return res.status(400).json({
      error: 'Missing required event fields: eventType, budget, headcount, and date are mandatory.'
    });
  }
  if (Number(budget) <= 0 || isNaN(Number(budget))) {
    return res.status(400).json({ error: 'Budget must be a positive number.' });
  }
  if (Number(headcount) <= 0 || isNaN(Number(headcount))) {
    return res.status(400).json({ error: 'Headcount must be a positive integer.' });
  }
  next();
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'EventPilot AI Backend',
    geminiConfigured: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY')
  });
});

/**
 * 1. Generate Complete Plan from Guided Intake
 */
app.post('/api/plan/generate', validatePlanInput, async (req, res) => {
  try {
    const intake = req.body;
    const { eventType, budget, headcount, date, priorities = [], occasion, mustHaves, attendeeAges, attendeeInterests, accessibilityNeeds, culturalContext } = intake;

    // 1. Budget calculation
    const budgetPlan = calculateInitialBudget(eventType, Number(budget), priorities);

    // 2. Timeline with dependencies
    const timeline = generateTimeline(eventType, date);

    // 3. AI Personalization & Adaptive Recommendations
    const personalizedInsights = await generatePersonalizedInsights({
      eventType,
      occasion,
      budget,
      headcount,
      date,
      priorities,
      mustHaves,
      attendeeAges,
      attendeeInterests,
      accessibilityNeeds,
      culturalContext
    });

    const fullPlan = {
      id: `plan_${Date.now()}`,
      createdAt: new Date().toISOString(),
      eventInfo: {
        eventType,
        occasion: occasion || '',
        budget: Number(budget),
        headcount: Number(headcount),
        date,
        priorities,
        mustHaves: mustHaves || '',
        attendeeAges: attendeeAges || '',
        attendeeInterests: attendeeInterests || '',
        accessibilityNeeds: accessibilityNeeds || '',
        culturalContext: culturalContext || ''
      },
      budget: budgetPlan,
      timeline,
      insights: personalizedInsights,
      replanFlags: []
    };

    return res.status(201).json(fullPlan);
  } catch (err) {
    console.error('Error generating event plan:', err);
    return res.status(500).json({ error: 'Failed to generate plan: ' + err.message });
  }
});

/**
 * 2. Rebalance Budget Category (Tradeoff Simulation)
 */
app.post('/api/plan/budget/rebalance', (req, res) => {
  try {
    const { categories, targetCategoryId, newAmount, lockedCategories = [] } = req.body;
    if (!categories || !targetCategoryId || newAmount === undefined) {
      return res.status(400).json({ error: 'categories, targetCategoryId, and newAmount are required.' });
    }

    const rebalanced = rebalanceBudget(categories, targetCategoryId, Number(newAmount), lockedCategories);
    return res.json(rebalanced);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

/**
 * 3. Update Timeline Task Status (Dependency Resolution)
 */
app.post('/api/plan/timeline/task', (req, res) => {
  try {
    const { tasks, taskId, status } = req.body;
    if (!tasks || !taskId || !status) {
      return res.status(400).json({ error: 'tasks, taskId, and status are required.' });
    }

    const updated = updateTaskStatus(tasks, taskId, status);
    return res.json({ timeline: updated });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

/**
 * 4. Re-plan Existing Plan on parameter changes
 */
app.post('/api/plan/replan', (req, res) => {
  try {
    const { existingPlan, changes } = req.body;
    if (!existingPlan || !changes) {
      return res.status(400).json({ error: 'existingPlan and changes payload are required.' });
    }

    const replanned = replanEvent(existingPlan, changes);
    return res.json(replanned);
  } catch (err) {
    console.error('Error replanning event:', err);
    return res.status(400).json({ error: err.message });
  }
});

/**
 * 5. Structured Vendor Comparison
 */
app.post('/api/vendors/compare', (req, res) => {
  try {
    const { category, vendors, eventRequirements } = req.body;
    if (!category || !vendors) {
      return res.status(400).json({ error: 'category and vendors array are required.' });
    }

    const comparison = compareVendors(category, vendors, eventRequirements);
    return res.json(comparison);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

/**
 * 6. Adaptive Personalization Direct Endpoint
 */
app.post('/api/personalize', async (req, res) => {
  try {
    const insights = await generatePersonalizedInsights(req.body);
    return res.json(insights);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`EventPilot Server running on port ${PORT}`);
});

export default app;
