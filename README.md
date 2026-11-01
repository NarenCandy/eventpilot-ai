# EventPilot

> **Prompt Wars Virtual — Challenge 5: Celebration & Event Planner**  
> An autonomous, full-stack GenAI planning assistant for weddings, birthdays, and community celebrations.

[![Node.js](https://img.shields.io/badge/Node.js-22.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.x-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 1. EventPilot Purpose & Flagship Walkthrough

EventPilot eliminates the chaos of organizing milestones by transforming fragmented ideas into sequenced, mathematically balanced, and culturally adaptive event blueprints. Rather than generating a one-shot generic prompt response, EventPilot guides the user through structured constraints (budget, headcount, milestone vision, accessibility requirements, and cultural traditions) and generates an interactive, recalculating command dashboard.

### Flagship Choice: Modern Multicultural Wedding & Reception
While EventPilot natively supports **Weddings**, **Milestone Birthdays**, and **Community Festivals/Fundraisers** across its intake, budget, timeline, and vendor engines, **Weddings & Receptions** were chosen as the flagship walkthrough. Weddings demand the tightest cross-functional interdependence:
- Multi-thousand-dollar category tradeoffs (e.g. Venue vs Catering vs Photography).
- Strict milestone sequencing where invitations, RSVP deadlines, catering counts, and seating diagrams form a strict dependency graph.
- Non-negotiable attendee requirements spanning multi-generational age groups, accessibility ramps, allergen certifications, and multicultural ceremony honoring rituals.

---

## 2. Core Capabilities & Architectural Alignment

EventPilot implements all 6 required capabilities under Challenge 5:

1. **Guided Intake, Not a One-Shot Prompt:**
   - Multi-step structured questionnaire capturing event type, occasion title, target budget, headcount, target date, investment priority rankings, must-haves, attendee age demographics, guest interests, mobility/dietary needs, and cultural/faith traditions.
   - Presets provided for all three event categories (Wedding, Birthday, Community).
2. **Budget Allocation with Tradeoff Simulation:**
   - Category budget breakdowns (Venue, Catering, Photography, Decor, Attire, Entertainment, Contingency Buffer).
   - Dynamic category lock/unlock toggles.
   - Real-time tradeoff reallocation: increasing one category automatically and proportionally absorbs money from unlocked categories.
   - **Mandatory Estimate Transparency:** All unconfirmed prices carry a visible badge: `Estimated — not a confirmed quote`.
3. **Dependency-Aware Milestone Timeline:**
   - Directed Acyclic Graph (DAG) sequencing with backward milestone dates mapped from event day.
   - Explicit blockers (e.g., *“Finalize RSVP & Guest Count”* is a prerequisite for *“Confirm Catering Order & Dietary Menus”*).
   - Completing a task unblocks downstream dependent tasks in real time.
4. **Adaptive Re-Planning on Change (No Blank Forms):**
   - Re-planning modal allows organizers to alter budget, event date, guest headcount, or accessibility requirements without erasing progress.
   - Pinpoints exactly what changed, recalculates allocations and dates, and surfaces severity-labeled alert banners (e.g. Budget scaled, RSVP urgency heightened).
5. **Structured Vendor Comparison & Gap Detection:**
   - Side-by-side comparison of multiple vendor quotes across base price, mandatory extras, guest capacity limits, and included services.
   - Automated gap detection flagging capacity deficits against target headcount, missing standard inclusions, and hidden surcharges.
   - Visibly labels all entries as `Unverified quote — user-supplied or simulated estimate`.
6. **Adaptive Attendee Personalization:**
   - Evaluates attendee age distribution (toddlers to elderly), mobility needs (ADA ramps, sensory quiet areas), dietary safety (gluten/nut allergies), and cultural rituals.
   - Produces tailored concept themes, accessibility checklists, heritage-honoring customs, and flow pacing advice.

---

## 3. Where GenAI is Used in EventPilot's Functionality

As required by the hackathon submission criteria, GenAI is embedded directly within EventPilot's runtime operations:

| GenAI Use Case | Engine / Model | Trigger & Ingestion | Output & Value |
|---|---|---|---|
| **Adaptive Attendee Personalization** | Google Gemini (`gemini-1.5-flash`) via Google AI Studio | Triggered during Guided Intake (Step 2) and on Re-Planning | Synthesizes customized event themes, concrete accessibility and sensory checklist items, and respectful heritage-honoring customs. |
| **Pacing & Negotiation Intelligence** | Google Gemini (`gemini-1.5-flash`) | Guided Intake analysis | Formulates guest schedule pacing tips (transition buffers, sensory downtime) and a customized 2-sentence vendor negotiation brief. |
| **Resilient In-Memory Caching & Graceful Fallback** | Backend caching layer + deterministic heuristic engine | Request handler | Caches identical parameter calls to avoid redundant API consumption and rate limit exhaustion, falling back to an in-memory rule engine if API keys or network are offline. |

> **Security Note:** The Gemini API key is strictly maintained backend-side (`server/.env` / Render environment variables) and is never exposed client-side.

---

## 4. Architectural & Database Justification

### Database Choice: Structured JSON State & Local Storage
- **Choice:** Lightweight in-memory state with structured client-side persistence and stateless REST backend services.
- **Justification:** EventPilot is designed for frictionless zero-auth planning simulations. By avoiding heavyweight database locks or connection pooling overhead on Render’s free tier, the application operates completely within free-tier limits without incurring idle timeout freezes or database shutdown limits.

---

## 5. Local Setup & Testing

### Prerequisites
- Node.js >= 20.x
- npm >= 10.x

### 1. Backend Server Setup
```bash
cd server
npm install
cp .env.example .env
# Edit .env and supply your GEMINI_API_KEY from Google AI Studio
npm test
npm start
```

### 2. Frontend Client Setup
```bash
cd client
npm install
npm run build
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 6. Deployment Instructions

### Backend (Render Web Service — Free Tier)
1. Fork or push this repository to GitHub.
2. In Render, create a new **Web Service** connected to your repo.
3. Configure settings:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment Variables:**
     - `NODE_ENV` = `production`
     - `GEMINI_API_KEY` = `<your-google-ai-studio-gemini-key>`
     - `ALLOWED_ORIGINS` = `https://<your-vercel-app-name>.vercel.app`

### Frontend (Vercel — Free Tier)
1. In Vercel, import your GitHub repo (`eventpilot-ai`).
2. Configure settings:
   - **Framework Preset:** Vite
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Environment Variables:**
     - `VITE_API_URL` = `https://<your-render-service-name>.onrender.com`
3. Click **Deploy**.

---

## 7. Assumptions & Disclaimers

1. **Pricing Estimates:** All budget distributions, itemized category allocations, and price spreads generated by EventPilot are algorithmic estimates calibrated to standard industry proportions and do not constitute binding or guaranteed contractor quotes.
2. **Vendor Data:** All vendor profiles, capacity thresholds, inclusion catalogs, and extra fees rendered in the Vendor Comparison tab are user-supplied or simulated scenario data. EventPilot does not claim live contract booking or real-time availability guarantees.
