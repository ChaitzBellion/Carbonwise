const LIMITS = Object.freeze({
  carKmWeek: [0, 2000],
  publicTransportKmWeek: [0, 2000],
  rideShareKmWeek: [0, 1000],
  shortFlightsYear: [0, 60],
  longFlightsYear: [0, 40],
  electricityKwhMonth: [0, 4000],
  fuelThermsMonth: [0, 500],
  renewablePercent: [0, 100],
  localFoodPercent: [0, 100],
  foodWasteMealsWeek: [0, 60],
  clothingSpendMonth: [0, 5000],
  electronicsSpendMonth: [0, 5000],
  generalSpendMonth: [0, 10000],
  secondhandPercent: [0, 100],
  wasteKgWeek: [0, 300],
  recyclingPercent: [0, 100],
  compostPercent: [0, 100],
  target: [1, 100000],
  current: [0, 100000],
});

const DIET_TYPES = new Set(["vegan", "vegetarian", "mixed", "meatHeavy"]);
const GOAL_UNITS = new Set(["kg CO2e", "km", "days", "actions", "%"]);

export function clampNumber(value, min, max, fallback = 0) {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, parsed));
}

export function sanitizeText(value, maxLength = 120) {
  return String(value ?? "")
    .replace(/[<>`]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function validateActivityInput(activity) {
  const transportation = activity?.transportation ?? {};
  const homeEnergy = activity?.homeEnergy ?? {};
  const food = activity?.food ?? {};
  const shopping = activity?.shopping ?? {};
  const waste = activity?.waste ?? {};

  return {
    transportation: {
      carKmWeek: fieldNumber(transportation.carKmWeek, "carKmWeek"),
      publicTransportKmWeek: fieldNumber(transportation.publicTransportKmWeek, "publicTransportKmWeek"),
      rideShareKmWeek: fieldNumber(transportation.rideShareKmWeek, "rideShareKmWeek"),
      shortFlightsYear: fieldNumber(transportation.shortFlightsYear, "shortFlightsYear"),
      longFlightsYear: fieldNumber(transportation.longFlightsYear, "longFlightsYear"),
    },
    homeEnergy: {
      electricityKwhMonth: fieldNumber(homeEnergy.electricityKwhMonth, "electricityKwhMonth"),
      fuelThermsMonth: fieldNumber(homeEnergy.fuelThermsMonth, "fuelThermsMonth"),
      renewablePercent: fieldNumber(homeEnergy.renewablePercent, "renewablePercent"),
    },
    food: {
      dietType: DIET_TYPES.has(food.dietType) ? food.dietType : "mixed",
      localFoodPercent: fieldNumber(food.localFoodPercent, "localFoodPercent"),
      foodWasteMealsWeek: fieldNumber(food.foodWasteMealsWeek, "foodWasteMealsWeek"),
    },
    shopping: {
      clothingSpendMonth: fieldNumber(shopping.clothingSpendMonth, "clothingSpendMonth"),
      electronicsSpendMonth: fieldNumber(shopping.electronicsSpendMonth, "electronicsSpendMonth"),
      generalSpendMonth: fieldNumber(shopping.generalSpendMonth, "generalSpendMonth"),
      secondhandPercent: fieldNumber(shopping.secondhandPercent, "secondhandPercent"),
    },
    waste: {
      wasteKgWeek: fieldNumber(waste.wasteKgWeek, "wasteKgWeek"),
      recyclingPercent: fieldNumber(waste.recyclingPercent, "recyclingPercent"),
      compostPercent: fieldNumber(waste.compostPercent, "compostPercent"),
    },
  };
}

export function validateGoalInput(goal) {
  const title = sanitizeText(goal?.title, 72) || "Sustainability goal";
  const target = fieldNumber(goal?.target, "target", 1);
  const current = Math.min(target, fieldNumber(goal?.current, "current"));
  const unit = GOAL_UNITS.has(goal?.unit) ? goal.unit : "kg CO2e";
  return {
    id: sanitizeText(goal?.id, 48) || `goal-${Date.now()}`,
    title,
    category: sanitizeText(goal?.category, 36) || "Custom",
    current,
    target,
    unit,
    impactKg: clampNumber(goal?.impactKg, 0, 10000, 0),
  };
}

export function validateChallenge(challenge) {
  return {
    id: sanitizeText(challenge?.id, 48),
    title: sanitizeText(challenge?.title, 96),
    cadence: challenge?.cadence === "monthly" ? "monthly" : "weekly",
    progress: clampNumber(challenge?.progress, 0, challenge?.target ?? 1, 0),
    target: clampNumber(challenge?.target, 1, 1000, 1),
    impactKg: clampNumber(challenge?.impactKg, 0, 10000, 0),
    active: Boolean(challenge?.active),
    completed: Boolean(challenge?.completed),
    badge: sanitizeText(challenge?.badge, 48),
  };
}

export function sanitizeStoredState(state, fallback) {
  if (!state || typeof state !== "object") {
    return fallback;
  }

  return {
    ...fallback,
    activity: validateActivityInput(state.activity ?? fallback.activity),
    goals: Array.isArray(state.goals)
      ? state.goals.slice(0, 12).map(validateGoalInput)
      : fallback.goals,
    challenges: Array.isArray(state.challenges)
      ? state.challenges.slice(0, 12).map(validateChallenge)
      : fallback.challenges,
    theme: state.theme === "dark" || state.theme === "light" ? state.theme : fallback.theme,
    activeView: sanitizeText(state.activeView, 24) || fallback.activeView,
    educationSearch: sanitizeText(state.educationSearch, 60),
    educationCategory: sanitizeText(state.educationCategory, 32) || fallback.educationCategory,
    lastMilestone: sanitizeText(state.lastMilestone, 120),
  };
}

function fieldNumber(value, fieldName, fallback = 0) {
  const [min, max] = LIMITS[fieldName];
  return clampNumber(value, min, max, fallback);
}
