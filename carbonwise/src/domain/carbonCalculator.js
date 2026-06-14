export const EMISSION_FACTORS = Object.freeze({
  referenceYearlyKg: 14500,
  transport: {
    carKgPerKm: 0.192,
    publicTransitKgPerKm: 0.064,
    rideShareKgPerKm: 0.155,
    shortFlightKg: 255,
    longFlightKg: 1100,
  },
  homeEnergy: {
    electricityKgPerKwh: 0.386,
    fuelKgPerTherm: 5.3,
  },
  food: {
    veganMonthlyKg: 120,
    vegetarianMonthlyKg: 165,
    mixedMonthlyKg: 255,
    meatHeavyMonthlyKg: 385,
    foodWasteKgPerMeal: 2.7,
    localFoodReductionRate: 0.08,
  },
  shopping: {
    clothingKgPerDollar: 0.42,
    electronicsKgPerDollar: 0.31,
    generalKgPerDollar: 0.18,
    secondhandReductionRate: 0.55,
  },
  waste: {
    landfillKgPerKg: 0.58,
    recyclingAvoidedRate: 0.45,
    compostAvoidedRate: 0.38,
  },
});

export const CATEGORY_LABELS = Object.freeze({
  transportation: "Transportation",
  homeEnergy: "Home Energy",
  food: "Food",
  shopping: "Shopping",
  waste: "Waste",
});

export function calculateFootprint(activity, factors = EMISSION_FACTORS) {
  const transportation = calculateTransportation(activity.transportation, factors);
  const homeEnergy = calculateHomeEnergy(activity.homeEnergy, factors);
  const food = calculateFood(activity.food, factors);
  const shopping = calculateShopping(activity.shopping, factors);
  const waste = calculateWaste(activity.waste, factors);

  const monthlyKg = roundOne(transportation + homeEnergy + food + shopping + waste);
  const yearlyKg = roundOne(monthlyKg * 12);
  const score = calculateCarbonScore(yearlyKg, factors.referenceYearlyKg);
  const breakdown = buildBreakdown({
    transportation,
    homeEnergy,
    food,
    shopping,
    waste,
  });

  return {
    monthlyKg,
    yearlyKg,
    score,
    breakdown,
    topSources: [...breakdown].sort((a, b) => b.kg - a.kg).slice(0, 3),
    summary: buildImpactSummary(monthlyKg, yearlyKg, score),
  };
}

export function calculateTransportation(transportation, factors = EMISSION_FACTORS) {
  const car = transportation.carKmWeek * factors.transport.carKgPerKm * 52 / 12;
  const transit = transportation.publicTransportKmWeek * factors.transport.publicTransitKgPerKm * 52 / 12;
  const rideShare = transportation.rideShareKmWeek * factors.transport.rideShareKgPerKm * 52 / 12;
  const flights = (
    transportation.shortFlightsYear * factors.transport.shortFlightKg
    + transportation.longFlightsYear * factors.transport.longFlightKg
  ) / 12;
  return roundOne(car + transit + rideShare + flights);
}

export function calculateHomeEnergy(homeEnergy, factors = EMISSION_FACTORS) {
  const renewableMultiplier = 1 - homeEnergy.renewablePercent / 100;
  const electricity = homeEnergy.electricityKwhMonth
    * factors.homeEnergy.electricityKgPerKwh
    * renewableMultiplier;
  const fuel = homeEnergy.fuelThermsMonth * factors.homeEnergy.fuelKgPerTherm;
  return roundOne(electricity + fuel);
}

export function calculateFood(food, factors = EMISSION_FACTORS) {
  const dietKey = `${food.dietType}MonthlyKg`;
  const baseDiet = factors.food[dietKey] ?? factors.food.mixedMonthlyKg;
  const localReduction = baseDiet * factors.food.localFoodReductionRate * (food.localFoodPercent / 100);
  const waste = food.foodWasteMealsWeek * factors.food.foodWasteKgPerMeal * 52 / 12;
  return roundOne(Math.max(0, baseDiet - localReduction + waste));
}

export function calculateShopping(shopping, factors = EMISSION_FACTORS) {
  const gross = shopping.clothingSpendMonth * factors.shopping.clothingKgPerDollar
    + shopping.electronicsSpendMonth * factors.shopping.electronicsKgPerDollar
    + shopping.generalSpendMonth * factors.shopping.generalKgPerDollar;
  const secondhandReduction = gross * factors.shopping.secondhandReductionRate * (shopping.secondhandPercent / 100);
  return roundOne(Math.max(0, gross - secondhandReduction));
}

export function calculateWaste(waste, factors = EMISSION_FACTORS) {
  const monthlyWasteKg = waste.wasteKgWeek * 52 / 12;
  const gross = monthlyWasteKg * factors.waste.landfillKgPerKg;
  const recyclingReduction = gross * factors.waste.recyclingAvoidedRate * (waste.recyclingPercent / 100);
  const compostReduction = gross * factors.waste.compostAvoidedRate * (waste.compostPercent / 100);
  return roundOne(Math.max(0, gross - recyclingReduction - compostReduction));
}

export function calculateCarbonScore(yearlyKg, referenceYearlyKg = EMISSION_FACTORS.referenceYearlyKg) {
  const ratio = yearlyKg / referenceYearlyKg;
  return clamp(Math.round(100 - ratio * 60), 0, 100);
}

export function buildTrendData(currentMonthlyKg, baselineMonthlyKg = currentMonthlyKg * 1.16) {
  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const values = labels.map((_, index) => {
    const progress = index / (labels.length - 1);
    const seasonal = Math.sin(index * 1.2) * 18;
    return roundOne(baselineMonthlyKg - (baselineMonthlyKg - currentMonthlyKg) * progress + seasonal);
  });
  return labels.map((label, index) => ({ label, kg: Math.max(0, values[index]) }));
}

export function buildForecast(currentMonthlyKg, monthlyReductionKg) {
  const labels = ["Now", "30d", "60d", "90d", "120d", "150d"];
  return labels.map((label, index) => ({
    label,
    kg: roundOne(Math.max(0, currentMonthlyKg - monthlyReductionKg * index)),
  }));
}

function buildBreakdown(categories) {
  const total = Object.values(categories).reduce((sum, value) => sum + value, 0);
  return Object.entries(categories).map(([id, kg]) => ({
    id,
    label: CATEGORY_LABELS[id],
    kg: roundOne(kg),
    percent: total === 0 ? 0 : Math.round((kg / total) * 100),
  }));
}

function buildImpactSummary(monthlyKg, yearlyKg, score) {
  const annualTons = yearlyKg / 1000;
  const treesEquivalent = Math.round(yearlyKg / 21.8);
  const status = score >= 78 ? "Low-impact trajectory" : score >= 55 ? "Improving trajectory" : "High-impact trajectory";
  return {
    annualTons: roundOne(annualTons),
    treesEquivalent,
    status,
  };
}

export function roundOne(value) {
  return Math.round((Number(value) + Number.EPSILON) * 10) / 10;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
