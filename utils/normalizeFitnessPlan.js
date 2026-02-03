function normalizeFitnessPlan(plan) {
  let fitnessPlan = plan;

  // If the plan is still a JSON string, try parsing it
  if (typeof fitnessPlan === "string") {
    try {
      fitnessPlan = JSON.parse(fitnessPlan);
    } catch (err) {
      console.error("❌ Failed to parse fitness plan JSON:", err);
      return { workout: "", diet: "", recovery: "" };
    }
  }

  // Ensure the simplified schema with safe defaults
  return {
    workout: fitnessPlan.workout || "No workout provided",
    diet: fitnessPlan.diet || "No diet advice provided",
    recovery: fitnessPlan.recovery || "No recovery tips provided",
  };
}

module.exports = { normalizeFitnessPlan };























// function normalizeFitnessPlan(plan) {
//   let fitnessPlan = plan;

//   // Flatten nested keys if needed
//   if (fitnessPlan.plan && fitnessPlan.plan.fitness_plan) {
//     fitnessPlan = fitnessPlan.plan.fitness_plan;
//   }

//   // Standardize caloric intake
//   if (fitnessPlan.diet_recommendations?.caloric_intake) {
//     const intakeRange = fitnessPlan.diet_recommendations.caloric_intake.match(/\d+/g);
//     fitnessPlan.diet_recommendations.caloric_intake = {
//       range: intakeRange ? intakeRange.join("-") : "Unknown",
//       unit: "calories",
//       notes: "Adjust based on individual needs and metabolism",
//     };
//   }

//   // Normalize reps
//   fitnessPlan.workout_split?.forEach((day) => {
//     day.exercises.forEach((exercise) => {
//       if (typeof exercise.reps === "string" && exercise.reps.includes("-")) {
//         const [min, max] = exercise.reps.split("-").map(Number);
//         exercise.reps = { min, max };
//       } else if (!isNaN(exercise.reps)) {
//         exercise.reps = { min: Number(exercise.reps), max: Number(exercise.reps) };
//       }
//     });
//   });

//   // Improve warnings format
//   if (Array.isArray(fitnessPlan.warnings)) {
//     fitnessPlan.warnings = fitnessPlan.warnings.map((warning) => ({
//       category: warning.includes("injuries") ? "Injury Prevention" : "General",
//       message: warning,
//     }));
//   }

//   return fitnessPlan;
// }

// module.exports = { normalizeFitnessPlan };
