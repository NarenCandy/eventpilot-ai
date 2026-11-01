/**
 * Gemini AI Integration Service with in-memory caching and graceful fallback.
 * Uses Gemini API for:
 * 1. Deep intake analysis & tailored planning recommendations
 * 2. Adaptive personalization (age groups, cultural traditions, accessibility accommodations)
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// In-memory cache to debounce/deduplicate calls and save rate limits
const responseCache = new Map();

function getCacheKey(action, params) {
  return `${action}:${JSON.stringify(params)}`;
}

export function getGeminiModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'YOUR_GEMINI_API_KEY') {
    return null;
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  // Default to fast, capable flash model
  return genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
}

/**
 * Generate adaptive personalization guidance:
 * Takes ages, interests, accessibility requirements, and cultural context.
 */
export async function generatePersonalizedInsights(intakeData) {
  const cacheKey = getCacheKey('personalize', intakeData);
  if (responseCache.has(cacheKey)) {
    return { ...responseCache.get(cacheKey), fromCache: true };
  }

  const model = getGeminiModel();

  if (!model) {
    return generateFallbackInsights(intakeData);
  }

  const prompt = `
You are EventPilot's AI personalization advisor. Analyze the following event specifications and attendee profile:
- Event Type: ${intakeData.eventType} (${intakeData.occasion || 'General'})
- Headcount: ${intakeData.headcount}
- Total Budget: $${intakeData.budget}
- Target Date: ${intakeData.date}
- Core Priorities: ${(intakeData.priorities || []).join(', ')}
- Must-Haves: ${intakeData.mustHaves || 'None specified'}
- Attendee Ages & Demographics: ${intakeData.attendeeAges || 'Mixed general age group'}
- Guest Interests & Vibes: ${intakeData.attendeeInterests || 'Celebratory'}
- Accessibility & Dietary Needs: ${intakeData.accessibilityNeeds || 'None specified'}
- Cultural or Faith Traditions: ${intakeData.culturalContext || 'None specified'}

Provide a structured JSON response with:
1. "curatedThemes": Array of 3 distinct, creative concept ideas tailored specifically to these guests and budget.
2. "accessibilityActionPlan": Array of 4 concrete logistics checklist items addressing the physical, sensory, or dietary needs.
3. "culturalHonoringTouches": Array of 3 subtle or meaningful ways to integrate the requested traditions/cultural context respectfully.
4. "schedulePacingTips": Array of 3 pacing recommendations (e.g. buffer times, rest areas, transitional cues).
5. "vendorBrief": A short 2-sentence guidance note for the organizer when negotiating with vendors.

Respond ONLY with valid JSON. Do not include markdown code block formatting or backticks.
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    // Clean potential markdown backticks
    const cleanedJson = text.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
    const parsed = JSON.parse(cleanedJson);
    
    const resultData = {
      isAiGenerated: true,
      modelUsed: 'gemini-flash-latest',
      data: parsed
    };

    responseCache.set(cacheKey, resultData);
    return resultData;
  } catch (err) {
    console.warn('Gemini API call failed, using high-quality local fallback:', err.message);
    return generateFallbackInsights(intakeData);
  }
}

/**
 * High-quality deterministic fallback ensures the app remains 100% resilient
 * even if rate limited or if no key is configured yet.
 */
export function generateFallbackInsights(intakeData) {
  const { eventType, culturalContext, accessibilityNeeds, attendeeAges, attendeeInterests } = intakeData;
  
  let themes = [];
  if (eventType === 'wedding') {
    themes = [
      { name: 'Timeless Botanical Romance', description: 'Understated greenery, neutral linen tones, ambient candle fixtures, and organic local florals.' },
      { name: 'Modern Celestial Elegance', description: 'Deep slate or midnight palette, architectural geometric backdrops, warm string canopy lights.' },
      { name: 'Heritage Heritage Fusion', description: 'Weaving heritage motifs and ceremonial colors into modern minimalist table and stage settings.' }
    ];
  } else if (eventType === 'birthday') {
    themes = [
      { name: 'Vibrant Retro Neon Lounge', description: 'Interactive photobooth with instant prints, arcade glow stations, and custom signature mocktails.' },
      { name: 'Artisan Garden Soiree', description: 'Acoustic background set, grazing board stations, and personalized keepsake activities.' },
      { name: 'Cosmic Adventure Horizon', description: 'Dynamic lighting cues, galaxy dessert displays, and themed interactive group trivia.' }
    ];
  } else {
    themes = [
      { name: 'Community Unity Pavilion', description: 'Open circular staging, local artisan pavilions, and multi-generational interactive workshop stations.' },
      { name: 'Eco-Harvest Gathering', description: 'Zero-waste composting stations, locally sourced food pop-ups, and interactive planting tables.' },
      { name: 'Heritage & Storytelling Commons', description: 'Acoustic mic circle, community photo mosaic wall, and neighborhood heritage spotlights.' }
    ];
  }

  const accessibilityPlan = [
    accessibilityNeeds
      ? `Prioritize step-free access paths and clear signage for: ${accessibilityNeeds}`
      : 'Ensure step-free zero-threshold venue entrances and visible wayfinding signage for all attendees.',
    'Designate a quiet, low-sensory decompression lounge with soft ambient lighting away from primary amplifiers.',
    'Require full ingredient labeling with visible allergen cards (gluten, dairy, nuts) and pre-arranged certified alternatives.',
    'Provide wide aisle clearance (minimum 42 inches) between dining tables and stage viewing paths.'
  ];

  const culturalTouches = [
    culturalContext
      ? `Incorporate traditional honoring elements highlighting "${culturalContext}" during key welcome speeches.`
      : 'Incorporate meaningful family or community welcome rituals early in the itinerary.',
    'Curate background music transitions that honor generational favorites alongside requested heritage melodies.',
    'Offer non-alcoholic artisan mocktails in matching glassware to ensure inclusive ceremonial toast participation.'
  ];

  const pacingTips = [
    'Insert a 20-minute transition buffer between major activities to prevent rush for elderly or young attendees.',
    'Position high-energy entertainment (speeches/dancing/performances) immediately following food service when energy peaks.',
    'Keep welcome announcements under 10 minutes to maintain crowd engagement and schedule momentum.'
  ];

  return {
    isAiGenerated: false,
    modelUsed: 'EventPilot Rule Engine (Fallback)',
    data: {
      curatedThemes: themes,
      accessibilityActionPlan: accessibilityPlan,
      culturalHonoringTouches: culturalTouches,
      schedulePacingTips: pacingTips,
      vendorBrief: `Organizing a ${intakeData.headcount || 100}-guest ${eventType}. Emphasize timely breakdown, flexible dietary handling (${accessibilityNeeds || 'standard'}), and verified venue accessibility.`
    }
  };
}
