import { EMISSION_FACTORS, buildForecast, roundOne } from "./carbonCalculator.js";

const IMPACT_PRIORITY = Object.freeze({
  high: 3,
  medium: 2,
  low: 1,
});

export function generateRecommendations(activity, footprint, factors = EMISSION_FACTORS) {
  const recommendations = [
    carReduction(activity, factors),
    publicTransportSwap(activity, factors),
    renewableEnergy(activity, factors),
    homeEfficiency(activity, footprint),
    foodShift(activity, factors),
    foodWaste(activity, factors),
    shoppingReduction(activity, factors),
    recyclingBoost(activity, factors),
  ].filter(Boolean);

  return recommendations
    .sort((a, b) => b.impactKg - a.impactKg || IMPACT_PRIORITY[b.priority] - IMPACT_PRIORITY[a.priority])
    .slice(0, 6)
    .map((recommendation, index) => ({
      ...recommendation,
      rank: index + 1,
    }));
}

export function totalRecommendationImpact(recommendations) {
  return roundOne(recommendations.reduce((sum, item) => sum + item.impactKg, 0));
}

export function recommendationForecast(monthlyKg, recommendations) {
  return buildForecast(monthlyKg, totalRecommendationImpact(recommendations));
}

function carReduction(activity, factors) {
  const km = activity.transportation.carKmWeek;
  if (km < 40) return null;
  const reductionKm = Math.min(60, Math.max(15, Math.round(km * 0.25)));
  const impactKg = roundOne(reductionKm * factors.transport.carKgPerKm * 52 / 12);
  return {
    id: "reduce-car",
    title: `Reduce car travel by ${reductionKm} km each week`,
    category: "Transportation",
    effort: "Medium",
    priority: impactKg > 45 ? "high" : "medium",
    impactKg,
    action: "Replace two short car trips with walking, cycling, transit, or trip chaining.",
  };
}

function publicTransportSwap(activity, factors) {
  const km = activity.transportation.carKmWeek;
  if (km < 25 || activity.transportation.publicTransportKmWeek > km * 0.5) return null;
  const swapKm = Math.min(45, Math.round(km * 0.2));
  const savedPerKm = factors.transport.carKgPerKm - factors.transport.publicTransitKgPerKm;
  return {
    id: "transit-swap",
    title: "Use public transport twice weekly",
    category: "Transportation",
    effort: "Medium",
    priority: "medium",
    impactKg: roundOne(swapKm * savedPerKm * 52 / 12),
    action: `Move about ${swapKm} km of weekly travel from car to bus, rail, or metro.`,
  };
}

function renewableEnergy(activity, factors) {
  const renewable = activity.homeEnergy.renewablePercent;
  const electricity = activity.homeEnergy.electricityKwhMonth;
  if (electricity < 150 || renewable >= 85) return null;
  const targetIncrease = Math.min(50, 100 - renewable);
  return {
    id: "renewable-energy",
    title: `Increase renewable electricity by ${targetIncrease}%`,
    category: "Home Energy",
    effort: "Low",
    priority: "high",
    impactKg: roundOne(electricity * factors.homeEnergy.electricityKgPerKwh * targetIncrease / 100),
    action: "Choose a renewable utility plan, community solar option, or verified green tariff.",
  };
}

function homeEfficiency(activity, footprint) {
  const home = footprint.breakdown.find((category) => category.id === "homeEnergy");
  if (!home || home.kg < 100) return null;
  return {
    id: "home-efficiency",
    title: "Cut home energy demand by 12%",
    category: "Home Energy",
    effort: "Low",
    priority: home.kg > 220 ? "high" : "medium",
    impactKg: roundOne(home.kg * 0.12),
    action: "Use LED lighting, smart thermostat scheduling, weather stripping, and standby power controls.",
  };
}

function foodShift(activity, factors) {
  const diet = activity.food.dietType;
  if (diet === "vegan") return null;
  const currentKey = `${diet}MonthlyKg`;
  const targetKey = diet === "meatHeavy" ? "mixedMonthlyKg" : "vegetarianMonthlyKg";
  const impact = (factors.food[currentKey] ?? factors.food.mixedMonthlyKg) - factors.food[targetKey];
  if (impact <= 0) return null;
  return {
    id: "plant-forward",
    title: diet === "meatHeavy" ? "Shift three meals weekly away from red meat" : "Add two plant-based meals weekly",
    category: "Food",
    effort: "Medium",
    priority: impact > 80 ? "high" : "medium",
    impactKg: roundOne(impact * 0.45),
    action: "Start with repeatable meals such as lentil bowls, tofu stir fry, bean chili, or vegetable pasta.",
  };
}

function foodWaste(activity, factors) {
  const meals = activity.food.foodWasteMealsWeek;
  if (meals < 2) return null;
  const preventedMeals = Math.min(4, Math.ceil(meals / 2));
  return {
    id: "food-waste",
    title: `Prevent ${preventedMeals} wasted meals each week`,
    category: "Food",
    effort: "Low",
    priority: "medium",
    impactKg: roundOne(preventedMeals * factors.food.foodWasteKgPerMeal * 52 / 12),
    action: "Plan portions, freeze leftovers, and create one weekly use-it-first meal.",
  };
}

function shoppingReduction(activity, factors) {
  const spend = activity.shopping.clothingSpendMonth
    + activity.shopping.electronicsSpendMonth
    + activity.shopping.generalSpendMonth;
  if (spend < 180) return null;
  const current = activity.shopping.clothingSpendMonth * factors.shopping.clothingKgPerDollar
    + activity.shopping.electronicsSpendMonth * factors.shopping.electronicsKgPerDollar
    + activity.shopping.generalSpendMonth * factors.shopping.generalKgPerDollar;
  return {
    id: "buy-less-better",
    title: "Move 20% of purchases to repair, rental, or secondhand",
    category: "Shopping",
    effort: "Medium",
    priority: current > 100 ? "high" : "medium",
    impactKg: roundOne(current * 0.2),
    action: "Set a 48-hour pause for nonessential purchases and choose repair or certified resale first.",
  };
}

function recyclingBoost(activity, factors) {
  const recycling = activity.waste.recyclingPercent;
  const waste = activity.waste.wasteKgWeek;
  if (waste < 5 || recycling >= 75) return null;
  const boost = Math.min(30, 85 - recycling);
  const gross = waste * 52 / 12 * factors.waste.landfillKgPerKg;
  return {
    id: "recycling-boost",
    title: `Increase recycling by ${boost}%`,
    category: "Waste",
    effort: "Low",
    priority: "low",
    impactKg: roundOne(gross * factors.waste.recyclingAvoidedRate * boost / 100),
    action: "Place a labeled recycling station next to landfill bins and check local accepted materials.",
  };
}

export function enrichRecommendations(recommendations, activity) {
  return recommendations.map((item) => ({
    ...item,
    impactKgMonth: estimateImpact(item, activity),
    difficulty: estimateDifficulty(item),
    payback: estimatePayback(item),
  }));
}

function estimateImpact(item, activity) {
  const map = {
    transportation: activity.transportation.carKmWeek * 0.192 * 52 / 12 * 0.15,
    homeEnergy: activity.homeEnergy.electricityKwhMonth * 0.386 * 0.12,
    food: 18,
    shopping: activity.shopping.generalSpendMonth * 0.18 * 0.1,
    waste: activity.waste.wasteKgWeek * 52 / 12 * 0.58 * 0.12,
  };

  return roundOne(map[item.category] ?? 10);
}

function estimateDifficulty(item) {
  if (item.category === "food" || item.category === "transportation") return "Medium";
  if (item.category === "waste") return "Easy";
  return "Medium";
}

function estimatePayback(item) {
  if (item.category === "homeEnergy") return "2-6 months";
  if (item.category === "shopping") return "Immediate";
  return "Behavioral";
}


