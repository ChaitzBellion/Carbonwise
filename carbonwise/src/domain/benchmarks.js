export const BENCHMARKS = Object.freeze({
  yearlyKg: {
    lowCarbon: 6000,
    averageUrban: 12000,
    highImpact: 18000,
  },
});

export function buildBenchmark(yearlyKg) {
  const { lowCarbon, averageUrban, highImpact } = BENCHMARKS.yearlyKg;

  let band = "Average";
  if (yearlyKg <= lowCarbon) band = "Low carbon";
  else if (yearlyKg >= highImpact) band = "High impact";

  return {
    band,
    vsLowCarbonKg: roundOne(yearlyKg - lowCarbon),
    vsAverageKg: roundOne(yearlyKg - averageUrban),
    vsHighImpactKg: roundOne(highImpact - yearlyKg),
    normalizedPosition: clamp((yearlyKg / highImpact) * 100, 0, 100),
  };
}

function roundOne(value) {
  return Math.round(value * 10) / 10;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}