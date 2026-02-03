const model = require("../config/gemini"); 

async function generateFitnessPlan(fitnessType, frequency, experience, goal) {
  const prompt = `
    You are a professional fitness coach. Based on the user's fitness experience, training frequency, and goal, generate a **structured fitness plan** in **JSON format**.

    ### Schema Requirements:
    The JSON response should have the following structure:

    {
      "workout": "short description of recommended exercises or routine",
      "diet": "short description of dietary advice",
      "recovery": "short description of recovery tips"
    }

    ### User Input:
    I am a **${experience}** individual looking to focus on **${fitnessType}**.
    My goal is to **${goal}**, and I plan to train **${frequency}** times per week.

    ### Instructions:
    - Keep each field concise (1–3 sentences max).
    - Do not include extra fields outside of the schema.
    - Return only valid JSON.
  `;

  try {
    const result = await model(prompt);

    if (process.env.DEBUG_GEMINI === "true") {
      console.log("🔍 Raw Gemini response:", result);
    }

    return result.text;
  } catch (err) {
    console.error("Error in fitnessService:", err);
    throw new Error("Failed to generate fitness plan");
  }
}

module.exports = { generateFitnessPlan };
// If you want to ask the LLM for more complicated structured output, check the commented code below for an advanced example.

















// === Advanced version (commented out) ===
// === use this if you want to experiment with more detailed JSON output === 

// const model = require("../config/gemini"); 

// async function generateFitnessPlan(fitnessType, frequency, experience, goal) {
//   const prompt = `
//     You are a professional fitness coach. Given the user's fitness experience, training frequency, and goal, generate a **structured fitness plan** in **JSON format**.
  
//   ### **Schema Requirements**:
//   The JSON response should have the following structure:
  
//   {
//     "fitness_plan": {
//       "experience_level": "string",
//       "goal": "string",
//       "training_frequency": "number",
//       "workout_split": [
//         {
//           "day": "string",
//           "focus": "string",
//           "exercises": [
//             {
//               "name": "string",
//               "sets": "number",
//               "reps": "string"
//             }
//           ]
//         }
//       ],
//       "diet_recommendations": {
//         "caloric_intake": "string",
//         "macronutrient_breakdown": {
//           "protein": "string",
//           "carbs": "string",
//           "fats": "string"
//         },
//         "meal_timing": "string",
//         "example_meals": [
//           {
//             "meal": "string",
//             "foods": ["string"]
//           }
//         ]
//       },
//       "recovery_tips": ["string"],
//       "warnings": ["string"]
//     }
//   }
  
//   ### **User Input**:
//   I am a **${experience}** individual looking to focus on **${fitnessType}**.
//   My goal is to **${goal}**, and I plan to train **${frequency}** times per week.
  
//   Provide a structured fitness guideline including:
//   - **Recommended exercises** with sets and reps.
//   - **Workout split** (daily training focus).
//   - **Dietary recommendations** (caloric intake, macronutrient breakdown, example meals).
//   - **Recovery tips** and **warnings** to avoid injury.
//   - **Return the response in the above JSON format**.
//   `;

//   try {
//     const result = await model(prompt);

//     // Log the raw Gemini output for debugging
//     if (process.env.DEBUG_GEMINI === "true") {
//       console.log("🔍 Raw Gemini response:", result);
//     }

//     return result.text;; // still return it to the controller
//   } catch (err) {
//     console.error("Error in fitnessService:", err);
//     throw new Error("Failed to generate fitness plan");
//   }
// }

// module.exports = { generateFitnessPlan };
