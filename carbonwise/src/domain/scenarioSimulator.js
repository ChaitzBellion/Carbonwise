import { calculateFootprint, roundOne } from "./carbonCalculator.js"; // Added roundOne to imports

export function simulateScenario(activity, scenarioPatch) {
  const current = calculateFootprint(activity);
  const nextActivity = deepMerge(activity, scenarioPatch);
  const projected = calculateFootprint(nextActivity);

  return {
    current,
    projected,
    monthlySavingsKg: roundOne(current.monthlyKg - projected.monthlyKg),
    yearlySavingsKg: roundOne(current.yearlyKg - projected.yearlyKg),
    improvedScore: projected.score - current.score,
    updatedActivity: nextActivity,
  };
}

function deepMerge(base, patch) {
  if (!patch || typeof patch !== "object") return base;
  const next = { ...base };
  Object.entries(patch).forEach(([key, value]) => {
    next[key] = value && typeof value === "object" && !Array.isArray(value)
      ? deepMerge(base[key] ?? {}, value)
      : value;
  });
  return next;
}

// REMOVED the local roundOne function to prevent "already declared" errors