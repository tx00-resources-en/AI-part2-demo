# Lab: Building a Tour Recommendation API with Clean JSON Output

## Learning Objectives

By completing this lab, you will:
- Understand how to **reuse existing MVC architecture** for new AI-powered features
- Learn to **iteratively develop** from simple to complex implementations
- Master **prompt engineering** to get clean, structured JSON from AI models
- Implement **data normalization** for predictable API responses
- Follow **separation of concerns** principles in full-stack development

---

## Overview

You will build a **Tour Recommendation API** that accepts travel preferences and returns **clean, predictable, structured JSON** recommendations using the same architecture as the existing fitness plan generator.

### Target Endpoint
```http
POST /api/tour-suggestions
```

### Expected Input
```json
{
  "destination": "Tokyo",
  "duration": "5 days",
  "budget": "1500",
  "season": "Spring",
  "preferences": "food, culture, technology",
  "travelStyle": "guided tour"
}
```

### Expected Output
```json
{
  "tourName": "Adventures in Tokyo - 5 Day Tour",
  "shortDescription": "A vibrant mix of ancient temples, neon-lit districts, and world‑class cuisine.",
  "highlights": [
    "Visit Senso‑ji Temple and Asakusa district",
    "Explore Shibuya Crossing and Akihabara",
    "Guided food tour including sushi and ramen",
    "Stroll through Ueno Park and traditional gardens"
  ],
  "whyItMatches": "This tour fits your interests in culture, food, and modern city life while staying within your 5‑day schedule.",
  "estimatedPriceRange": "$1300–$1600",
  "bestSeasonToVisit": "Spring (March–May)",
  "specialTips": [
    "Book early to secure cherry blossom season spots",
    "Purchase a Suica card for easy transport",
    "Try local izakayas for authentic dining"
  ]
}
```


**Commit messages: Recommended format**

- *feat* Short for feature. Used when you add a new feature or new functionality to the codebase.
- *refactor* used when you change existing code without altering behavior. This improves structure, readability, or organization.
- *chore* used for maintenance tasks that don’t change application behavior. Examples: updating dependencies, adding logging, renaming files, config changes.

---

## Prerequisites

Before starting, ensure you:
1. Have completed the Fitness Plan Generator project
2. Understand the MVC pattern (Model-View-Controller)
3. Have a valid Gemini API key in your `.env` file
4. Can test APIs using Postman or curl

---

## Incremental Development Approach

We'll build this feature in **3 iterations**, each adding more sophistication:

| Iteration | Goal | Output Type | Complexity |
|-----------|------|-------------|------------|
| **1** | Get basic AI response | Markdown text | Low |
| **2** | Request JSON format | Raw JSON | Medium |
| **3** | Ensure clean, predictable JSON | Normalized JSON | High |

---

## Iteration 1: Basic AI Response (Markdown Output)

### Goal
Create a minimal working endpoint that accepts tour preferences and returns an AI-generated recommendation in **human-readable markdown format**.

### What You'll Learn
- How to add a new route to an existing Express app
- How to create a basic controller
- How to build a simple AI prompt
- How to test your endpoint

### High-Level Steps
1. Create a new route in `routes/aiRoutes.js`
2. Create a controller file `controllers/tourController.js`
3. Create a service file `services/tourService.js`
4. Write a basic prompt that requests markdown output
5. Test with Postman

### Why Start Simple?
Starting with markdown output lets you:
- Verify the AI connection works
- Test your routing and controller setup
- Experiment with prompt engineering without worrying about JSON parsing
- Get immediate feedback on the quality of AI recommendations

---

<details>
<summary><strong>Complete Solution for Iteration 1</strong></summary>

### Step 1: Add Route to `routes/aiRoutes.js`

**File:** `routes/aiRoutes.js`

Add this line after the existing route:

```javascript
const express = require('express');
const router = express.Router();

const { generateText } = require('../controllers/fitnessController');
const { generateTourSuggestion } = require('../controllers/tourController'); // ADD THIS

router.post('/generate-text-v2', generateText);
router.post('/tour-suggestions', generateTourSuggestion); // ADD THIS

module.exports = router;
```

---

### Step 2: Create Tour Controller

**File:** `controllers/tourController.js` (NEW FILE)

```javascript
const { generateTourRecommendation } = require('../services/tourService');

/**
 * Controller for generating tour suggestions
 * Handles validation and response formatting
 */
async function generateTourSuggestion(req, res) {
  try {
    // Extract input from request body
    const { destination, duration, budget, season, preferences, travelStyle } = req.body;

    // Validate required fields
    if (!destination || !duration || !budget || !season || !preferences || !travelStyle) {
      return res.status(400).json({ 
        error: 'All fields are required',
        required: ['destination', 'duration', 'budget', 'season', 'preferences', 'travelStyle']
      });
    }

    // Call service layer to get AI recommendation
    const recommendation = await generateTourRecommendation({
      destination,
      duration,
      budget,
      season,
      preferences,
      travelStyle
    });

    // Return the markdown response
    res.status(200).json({
      success: true,
      recommendation: recommendation
    });

  } catch (error) {
    console.error('Error in tour controller:', error);
    res.status(500).json({ 
      error: 'Failed to generate tour recommendation',
      details: error.message 
    });
  }
}

module.exports = {
  generateTourSuggestion
};
```

---

### Step 3: Create Tour Service

**File:** `services/tourService.js` (NEW FILE)

```javascript
const { generateContent } = require('../config/gemini');

/**
 * Service for generating tour recommendations using Gemini AI
 * This version returns markdown-formatted text
 */
async function generateTourRecommendation(travelData) {
  const { destination, duration, budget, season, preferences, travelStyle } = travelData;

  // Build a prompt that requests markdown output
  const prompt = `
You are a professional travel advisor. A traveler is planning a trip with the following preferences:

- Destination: ${destination}
- Duration: ${duration}
- Budget: $${budget}
- Preferred Season: ${season}
- Interests: ${preferences}
- Travel Style: ${travelStyle}

Based on this information, create a detailed tour recommendation.

Please include:
1. Tour Name
2. Short Description
3. Highlights (list 4-5 key activities)
4. Why this tour matches their preferences
5. Estimated price range
6. Best season to visit
7. Special tips for travelers

Format your response in clear markdown with headings and bullet points.
  `.trim();

  try {
    // Call Gemini API
    const result = await generateContent(prompt);
    
    // Extract text from response
    const text = result.response.text();
    
    return text;

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw new Error('Failed to generate tour recommendation from AI');
  }
}

module.exports = {
  generateTourRecommendation
};
```

---

### Step 4: Test Your Endpoint

**Using Postman:**

1. **Method:** POST
2. **URL:** `http://localhost:3000/api/tour-suggestions`
3. **Headers:** 
   - `Content-Type: application/json`
4. **Body (raw JSON):**
   ```json
   {
     "destination": "Tokyo",
     "duration": "5 days",
     "budget": "1500",
     "season": "Spring",
     "preferences": "food, culture, technology",
     "travelStyle": "guided tour"
   }
   ```

**Expected Response:**
```json
{
  "success": true,
  "recommendation": "# Tokyo Cultural & Tech Adventure\n\n## Short Description\nA vibrant mix of ancient temples, neon-lit districts, and world‑class cuisine...\n\n## Highlights\n- Visit Senso‑ji Temple and Asakusa district\n- Explore Shibuya Crossing...\n..."
}
```

**Using curl:**
```bash
curl -X POST http://localhost:3000/api/tour-suggestions \
  -H "Content-Type: application/json" \
  -d '{
    "destination": "Tokyo",
    "duration": "5 days",
    "budget": "1500",
    "season": "Spring",
    "preferences": "food, culture, technology",
    "travelStyle": "guided tour"
  }'
```

---

### Iteration 1 Checklist

- [ ] Route added to `routes/aiRoutes.js`
- [ ] `controllers/tourController.js` created
- [ ] `services/tourService.js` created
- [ ] Server restarts without errors
- [ ] Postman test returns markdown recommendation
- [ ] All required fields validated (test with missing fields)

</details>

---

## Iteration 2: Requesting JSON Format

### Goal
Modify the prompt to request **JSON output** instead of markdown, and handle the JSON parsing in the controller.

### What You'll Learn
- How to engineer prompts for structured JSON output
- How to extract JSON from AI responses
- How to handle JSON parsing errors
- Why AI responses aren't always perfectly structured

### High-Level Steps
1. Modify the service prompt to request JSON format
2. Update the controller to parse JSON from the AI response
3. Add error handling for malformed JSON
4. Test edge cases

### Why This Matters
Real applications need **machine-readable** data, not markdown. JSON allows:
- Frontend frameworks to easily consume data
- Type checking and validation
- Database storage
- Integration with other services

---

<details>
<summary><strong>Complete Solution for Iteration 2</strong></summary>

### Step 1: Update Tour Service to Request JSON

**File:** `services/tourService.js`

Replace the entire file with:

```javascript
const { generateContent } = require('../config/gemini');

/**
 * Service for generating tour recommendations using Gemini AI
 * This version requests structured JSON output
 */
async function generateTourRecommendation(travelData) {
  const { destination, duration, budget, season, preferences, travelStyle } = travelData;

  // Build a prompt that enforces JSON structure
  const prompt = `
You are a professional travel advisor. A traveler is planning a trip with the following preferences:

- Destination: ${destination}
- Duration: ${duration}
- Budget: $${budget}
- Preferred Season: ${season}
- Interests: ${preferences}
- Travel Style: ${travelStyle}

Based on this information, recommend a suitable tour.

IMPORTANT: Respond ONLY in valid JSON using the following structure:

{
  "tourName": "",
  "shortDescription": "",
  "highlights": [],
  "whyItMatches": "",
  "estimatedPriceRange": "",
  "bestSeasonToVisit": "",
  "specialTips": []
}

Do not include any text before or after the JSON. Do not wrap it in markdown code blocks.
Fill all fields with appropriate content for this traveler.
  `.trim();

  try {
    // Call Gemini API
    const result = await generateContent(prompt);
    
    // Extract text from response
    const text = result.response.text();
    
    // Debug logging (if enabled)
    if (process.env.DEBUG_GEMINI === 'true') {
      console.log('Raw AI Response:', text);
    }
    
    return text;

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw new Error('Failed to generate tour recommendation from AI');
  }
}

module.exports = {
  generateTourRecommendation
};
```

---

### Step 2: Update Controller to Parse JSON

**File:** `controllers/tourController.js`

Replace the entire file with:

```javascript
const { generateTourRecommendation } = require('../services/tourService');

/**
 * Helper function to extract JSON from AI response
 * AI sometimes wraps JSON in markdown code blocks
 */
function extractJSON(text) {
  // Try to find JSON within markdown code blocks
  const codeBlockMatch = text.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1];
  }
  
  // Try to find raw JSON object
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0];
  }
  
  // Return original text if no pattern matches
  return text;
}

/**
 * Controller for generating tour suggestions
 * Handles validation, JSON parsing, and response formatting
 */
async function generateTourSuggestion(req, res) {
  try {
    // Extract input from request body
    const { destination, duration, budget, season, preferences, travelStyle } = req.body;

    // Validate required fields
    if (!destination || !duration || !budget || !season || !preferences || !travelStyle) {
      return res.status(400).json({ 
        error: 'All fields are required',
        required: ['destination', 'duration', 'budget', 'season', 'preferences', 'travelStyle']
      });
    }

    // Call service layer to get AI recommendation
    const rawResponse = await generateTourRecommendation({
      destination,
      duration,
      budget,
      season,
      preferences,
      travelStyle
    });

    // Extract and parse JSON
    const jsonString = extractJSON(rawResponse);
    
    let tourPlan;
    try {
      tourPlan = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Raw Response:', rawResponse);
      
      return res.status(500).json({
        error: 'Failed to parse AI response as JSON',
        rawResponse: rawResponse.substring(0, 500) // First 500 chars for debugging
      });
    }

    // Return the parsed JSON
    res.status(200).json(tourPlan);

  } catch (error) {
    console.error('Error in tour controller:', error);
    res.status(500).json({ 
      error: 'Failed to generate tour recommendation',
      details: error.message 
    });
  }
}

module.exports = {
  generateTourSuggestion
};
```

---

### Step 3: Test JSON Output

**Using Postman:**

Same request as Iteration 1, but now the response should be pure JSON:

**Expected Response:**
```json
{
  "tourName": "Tokyo Spring Discovery Tour",
  "shortDescription": "Experience Tokyo's perfect blend of ancient traditions and cutting-edge technology during the beautiful cherry blossom season.",
  "highlights": [
    "Visit historic Senso-ji Temple in Asakusa",
    "Explore the tech paradise of Akihabara",
    "Guided food tour through Tsukiji Outer Market",
    "Experience traditional tea ceremony in a historic tea house"
  ],
  "whyItMatches": "This tour perfectly combines your interests in food, culture, and technology while fitting your 5-day timeframe and guided tour preference.",
  "estimatedPriceRange": "$1400-$1600",
  "bestSeasonToVisit": "Spring (March-May)",
  "specialTips": [
    "Book accommodations early during cherry blossom season",
    "Get a JR Pass if planning day trips",
    "Download Google Translate for easier navigation"
  ]
}
```

---

### Step 4: Test Edge Cases

Test what happens when things go wrong:

**Test 1: Missing Field**
```json
{
  "destination": "Tokyo",
  "duration": "5 days"
}
```
Expected: 400 error with list of required fields

**Test 2: Invalid Budget**
```json
{
  "destination": "Tokyo",
  "duration": "5 days",
  "budget": "free",
  "season": "Spring",
  "preferences": "food",
  "travelStyle": "budget"
}
```
Expected: AI should handle gracefully or you might get parsing errors

---

### Iteration 2 Checklist

- [ ] Service updated to request JSON format
- [ ] Controller extracts JSON from AI response
- [ ] JSON parsing errors are caught and handled
- [ ] Successful test returns pure JSON object
- [ ] Edge cases tested (missing fields, malformed responses)
- [ ] Debug logging works (set `DEBUG_GEMINI=true`)

### Reflection Questions

1. Did the AI always return perfect JSON? Why or why not?
2. What happens if the AI includes extra text before/after the JSON?
3. How reliable is the `extractJSON` function compared to the fitness app's approach?
4. What fields might be missing or malformed in the response?

</details>

---

## Iteration 3: Clean, Predictable JSON with Normalization

### Goal
Add a **normalization utility** that ensures the API always returns consistent, complete JSON even when the AI response is incomplete or malformed.

### What You'll Learn
- Why normalization is critical for production APIs
- How to provide safe defaults for missing data
- How to make your API fault-tolerant
- The importance of data consistency

### High-Level Steps
1. Create a normalization utility `utils/normalizeTourPlan.js`
2. Update the controller to use the normalizer
3. Test with various malformed AI responses
4. Compare to the fitness app's normalization approach

### Why This Is Essential
In production, you **cannot trust AI output** to always be perfect:
- Fields might be missing
- Data types might be wrong (string instead of array)
- Extra fields might be included
- Values might be in unexpected formats

Normalization ensures:
- **Predictable API contracts** for frontend developers
- **Graceful degradation** when AI fails
- **Type safety** for TypeScript/typed frontends
- **Consistent user experience**

---

<details>
<summary><strong>Complete Solution for Iteration 3</strong></summary>

### Step 1: Create Normalization Utility

**File:** `utils/normalizeTourPlan.js` (NEW FILE)

```javascript
/**
 * Normalizes tour recommendation data to ensure consistent structure
 * Provides safe defaults for missing or malformed fields
 * 
 * @param {string|object} input - Raw AI response (JSON string or object)
 * @returns {object} Normalized tour plan with guaranteed structure
 */
function normalizeTourPlan(input) {
  // Default structure - what we promise to always return
  const defaultPlan = {
    tourName: "Custom Tour Package",
    shortDescription: "A personalized travel experience tailored to your preferences.",
    highlights: [
      "Explore iconic landmarks and hidden gems",
      "Enjoy local cuisine and cultural experiences",
      "Comfortable accommodations and guided activities"
    ],
    whyItMatches: "This tour is designed based on your specific travel preferences and budget.",
    estimatedPriceRange: "Contact for pricing",
    bestSeasonToVisit: "Year-round availability",
    specialTips: [
      "Book early for best rates",
      "Check visa requirements",
      "Purchase travel insurance"
    ]
  };

  try {
    // Parse input if it's a string
    let parsedInput = input;
    if (typeof input === 'string') {
      parsedInput = JSON.parse(input);
    }

    // Normalize each field with type checking
    return {
      tourName: 
        typeof parsedInput.tourName === 'string' && parsedInput.tourName.trim() 
          ? parsedInput.tourName.trim() 
          : defaultPlan.tourName,
      
      shortDescription: 
        typeof parsedInput.shortDescription === 'string' && parsedInput.shortDescription.trim()
          ? parsedInput.shortDescription.trim()
          : defaultPlan.shortDescription,
      
      highlights: 
        Array.isArray(parsedInput.highlights) && parsedInput.highlights.length > 0
          ? parsedInput.highlights.filter(h => typeof h === 'string' && h.trim()).map(h => h.trim())
          : defaultPlan.highlights,
      
      whyItMatches: 
        typeof parsedInput.whyItMatches === 'string' && parsedInput.whyItMatches.trim()
          ? parsedInput.whyItMatches.trim()
          : defaultPlan.whyItMatches,
      
      estimatedPriceRange: 
        typeof parsedInput.estimatedPriceRange === 'string' && parsedInput.estimatedPriceRange.trim()
          ? parsedInput.estimatedPriceRange.trim()
          : defaultPlan.estimatedPriceRange,
      
      bestSeasonToVisit: 
        typeof parsedInput.bestSeasonToVisit === 'string' && parsedInput.bestSeasonToVisit.trim()
          ? parsedInput.bestSeasonToVisit.trim()
          : defaultPlan.bestSeasonToVisit,
      
      specialTips: 
        Array.isArray(parsedInput.specialTips) && parsedInput.specialTips.length > 0
          ? parsedInput.specialTips.filter(t => typeof t === 'string' && t.trim()).map(t => t.trim())
          : defaultPlan.specialTips
    };

  } catch (error) {
    // If parsing fails completely, return full default
    console.error('Normalization error, returning defaults:', error);
    return defaultPlan;
  }
}

module.exports = {
  normalizeTourPlan
};
```

---

### Step 2: Update Controller to Use Normalizer

**File:** `controllers/tourController.js`

Replace the entire file with:

```javascript
const { generateTourRecommendation } = require('../services/tourService');
const { normalizeTourPlan } = require('../utils/normalizeTourPlan');

/**
 * Helper function to extract JSON from AI response
 * AI sometimes wraps JSON in markdown code blocks
 */
function extractJSON(text) {
  // Try to find JSON within markdown code blocks
  const codeBlockMatch = text.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1];
  }
  
  // Try to find raw JSON object
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0];
  }
  
  // Return original text if no pattern matches
  return text;
}

/**
 * Controller for generating tour suggestions
 * Handles validation, JSON parsing, normalization, and response formatting
 */
async function generateTourSuggestion(req, res) {
  try {
    // Extract input from request body
    const { destination, duration, budget, season, preferences, travelStyle } = req.body;

    // Validate required fields
    if (!destination || !duration || !budget || !season || !preferences || !travelStyle) {
      return res.status(400).json({ 
        error: 'All fields are required',
        required: ['destination', 'duration', 'budget', 'season', 'preferences', 'travelStyle']
      });
    }

    // Call service layer to get AI recommendation
    const rawResponse = await generateTourRecommendation({
      destination,
      duration,
      budget,
      season,
      preferences,
      travelStyle
    });

    // Extract JSON from response
    const jsonString = extractJSON(rawResponse);
    
    // Parse JSON (normalizer will handle parse errors)
    let tourPlan;
    try {
      tourPlan = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Attempting normalization with raw response...');
      
      // Try to normalize the raw string
      tourPlan = {};
    }

    // Normalize the data to ensure consistent structure
    const normalizedPlan = normalizeTourPlan(tourPlan);

    // Return the clean, predictable JSON
    res.status(200).json(normalizedPlan);

  } catch (error) {
    console.error('Error in tour controller:', error);
    res.status(500).json({ 
      error: 'Failed to generate tour recommendation',
      details: error.message 
    });
  }
}

module.exports = {
  generateTourSuggestion
};
```

---

### Step 3: Test Normalization with Edge Cases

**Test 1: Perfect AI Response**
Normal request should work exactly as before.

**Test 2: Simulate Missing Fields**
Temporarily modify `tourService.js` to return incomplete JSON:

```javascript
// In tourService.js (TEMPORARY TEST ONLY)
return JSON.stringify({
  tourName: "Test Tour",
  // Missing other fields
});
```

Expected: Should return with default values for missing fields.

**Test 3: Simulate Malformed Response**
```javascript
// In tourService.js (TEMPORARY TEST ONLY)
return "This is not JSON at all!";
```

Expected: Should return the complete default tour plan.

**Test 4: Wrong Data Types**
```javascript
// In tourService.js (TEMPORARY TEST ONLY)
return JSON.stringify({
  tourName: 123,  // Should be string
  highlights: "Not an array",  // Should be array
  specialTips: ["Valid tip", 456, ""]  // Mixed types and empty
});
```

Expected: 
- `tourName` → defaults to "Custom Tour Package"
- `highlights` → defaults to default highlights array
- `specialTips` → filters to only valid strings: `["Valid tip"]`

---

### Step 4: Compare with Fitness App

**Exercise:** Open `utils/normalizeFitnessPlan.js` and compare:

1. **Structure Similarity:** Both ensure specific fields exist
2. **Default Strategy:** Both provide sensible defaults
3. **Type Checking:** Both validate data types
4. **Error Handling:** Both gracefully handle parsing errors

**Key Differences:**
- Fitness plan has 3 simple string fields
- Tour plan has 7 fields including 2 arrays
- Tour plan requires more complex validation (array filtering)

---

### Iteration 3 Checklist

- [ ] `utils/normalizeTourPlan.js` created
- [ ] Controller updated to use normalizer
- [ ] Perfect AI responses still work correctly
- [ ] Missing fields are replaced with defaults
- [ ] Malformed JSON returns complete default plan
- [ ] Wrong data types are handled gracefully
- [ ] Array fields filter out invalid entries
- [ ] Comparison with fitness app normalization completed

### Success Criteria

Your API now:
- **Always returns valid JSON** (never crashes on bad AI output)
- **Has predictable structure** (frontend can trust the schema)
- **Degrades gracefully** (provides defaults when AI fails)
- **Validates data types** (no unexpected strings where arrays should be)
- **Follows production-ready patterns** (same as fitness app)

</details>

---

##  Bonus Challenges

Once you've completed all 3 iterations, try these enhancements:

### Challenge 1: Add Input Validation
- Validate that `budget` is a positive number
- Ensure `duration` follows a format like "X days" or "X weeks"
- Restrict `season` to: Spring, Summer, Fall, Winter
- Limit `travelStyle` to predefined options

### Challenge 2: Enhance the Prompt
- Request more detailed highlights (with descriptions)
- Ask for day-by-day itinerary
- Include accommodation recommendations
- Add transportation options

### Challenge 3: Add Multiple Tour Options
- Modify the prompt to request 3 tour options
- Update the schema to return an array of tours
- Update the normalizer to handle array of tours
- Let the client choose which tour to book

---

## Key Takeaways

### Architecture Patterns
1. **MVC Separation:** Controllers handle HTTP, services handle business logic
2. **Reusability:** The same Gemini config serves multiple features
3. **Error Boundaries:** Each layer handles its own error types
4. **Data Flow:** Request → Route → Controller → Service → AI → Normalize → Response

### Prompt Engineering
1. **Be explicit:** "Respond ONLY in valid JSON"
2. **Provide schema:** Show exact structure you want
3. **Set constraints:** "Do not include markdown code blocks"
4. **Give context:** Include all relevant user preferences

### Production Readiness
1. **Never trust AI output:** Always validate and normalize
2. **Fail gracefully:** Provide defaults when things go wrong
3. **Log for debugging:** Use `DEBUG_GEMINI=true` during development
4. **Type safety:** Validate data types, not just presence

### Development Workflow
1. **Start simple:** Markdown → JSON → Normalized JSON
2. **Test incrementally:** Verify each iteration works before moving on
3. **Handle edge cases:** Test with missing/malformed/wrong data
4. **Compare patterns:** Learn from existing code (fitness app)

---

## Troubleshooting Guide

### Problem: "All fields are required" error
**Solution:** Ensure your request body includes all 6 required fields:
```json
{
  "destination": "...",
  "duration": "...",
  "budget": "...",
  "season": "...",
  "preferences": "...",
  "travelStyle": "..."
}
```

### Problem: AI returns markdown instead of JSON
**Solution:** 
1. Check your prompt includes "Respond ONLY in valid JSON"
2. Add "Do not wrap in markdown code blocks"
3. Enable debug mode: `DEBUG_GEMINI=true`
4. The `extractJSON` function should handle this automatically

### Problem: Normalization always returns defaults
**Solution:**
1. Check if JSON parsing is successful
2. Verify AI response includes the expected fields
3. Check for typos in field names (case-sensitive)
4. Enable debug logging to see raw AI output

### Problem: Server crashes on bad AI response
**Solution:**
1. Ensure you're using try/catch in controller
2. Verify normalizer handles all error cases
3. Check that extractJSON doesn't throw errors
4. Add error logging to identify the crash point

### Problem: Arrays contain invalid data
**Solution:**
The normalizer should filter arrays:
```javascript
highlights: 
  Array.isArray(parsedInput.highlights) && parsedInput.highlights.length > 0
    ? parsedInput.highlights.filter(h => typeof h === 'string' && h.trim())
    : defaultPlan.highlights
```

---

## Additional Resources

### Related Documentation
- [Gemini API Prompt Engineering](https://ai.google.dev/docs/prompt_best_practices)
- [Express.js Routing Guide](https://expressjs.com/en/guide/routing.html)
- [Node.js Error Handling](https://nodejs.org/api/errors.html)

### Code References
- Compare your code with `controllers/fitnessController.js`
- Study the pattern in `utils/normalizeFitnessPlan.js`
- Review `services/fitnessService.js` for prompt examples

### Testing Tools
- [Postman](https://www.postman.com/) for API testing
- [JSONLint](https://jsonlint.com/) for validating JSON
- [Regex101](https://regex101.com/) for testing extraction patterns

---

## Final Verification

Before considering this lab complete, ensure:

- [ ] All 3 iterations are implemented and working
- [ ] Route is registered in `routes/aiRoutes.js`
- [ ] Controller validates input and handles errors
- [ ] Service builds proper prompt and calls Gemini
- [ ] Normalizer ensures consistent output structure
- [ ] Tested with Postman: valid requests work
- [ ] Tested with Postman: invalid requests return proper errors
- [ ] Tested edge cases: missing fields, malformed JSON, wrong types
- [ ] Compared your code with fitness app for consistency
- [ ] Code is commented and follows existing style

---

## Reflection Questions

Answer these to solidify your understanding:

1. **Why do we separate routes, controllers, and services?**
   - What would happen if everything was in one file?
   - How does this help with testing and team development?

2. **What makes a good AI prompt for structured output?**
   - Why is "Respond ONLY in valid JSON" important?
   - What happens if you don't provide a schema?

3. **Why is normalization critical for production APIs?**
   - What could go wrong without it?
   - How does it improve the developer experience?

4. **How does this architecture scale?**
   - How would you add a new endpoint for hotel recommendations?
   - Could you reuse the same service with different prompts?

5. **What security considerations are missing?**
   - Should there be rate limiting?
   - How could malicious input harm the system?
   - What about API key exposure?

---

## Submission

Include:

1. **All source files:**
   - `routes/aiRoutes.js`
   - `controllers/tourController.js`
   - `services/tourService.js`
   - `utils/normalizeTourPlan.js`

2. **Postman Collection Export** with test requests

3. **Brief reflection** (200-300 words) answering:
   - What was the most challenging part?
   - What did you learn about AI integration?
   - How would you improve this further?

