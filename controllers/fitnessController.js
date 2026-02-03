const { generateFitnessPlan } = require("../services/fitnessService");
const { normalizeFitnessPlan } = require("../utils/normalizeFitnessPlan");

async function generateText(req, res) {
  try {
    const { fitnessType, frequency, experience, goal } = req.body;

    if (!fitnessType || !frequency || !experience || !goal) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const rawResponse = await generateFitnessPlan(fitnessType, frequency, experience, goal);

    // Try to extract JSON from markdown fences
    const jsonMatch = rawResponse.match(/```json\s*([\s\S]*?)\s*```/);
    const jsonString = jsonMatch ? jsonMatch[1] : rawResponse;
    if (process.env.DEBUG_GEMINI === "true") {
      console.log(jsonString);
    }


    let parsedPlan;
    try {
      parsedPlan = JSON.parse(jsonString);
    } catch (err) {
      return res.status(500).json({ error: "Error parsing JSON response." });
    }

    const normalizedPlan = normalizeFitnessPlan(parsedPlan);
    res.json(normalizedPlan);

  } catch (err) {
    console.error("Error in fitnessController:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
}

module.exports = generateText;
