export function generatePersonalInsights(
  footprint,
  recommendations
) {
  const topSource = footprint.topSources?.[0];
  const bestRecommendation = recommendations?.[0];

  if (!topSource) {
    return null;
  }

  const BENCHMARKS = {
    sustainable: 500,
    average: 900,
    high: 1200,
  };

  const contribution = Math.round(
    (topSource.kg / footprint.monthlyKg) * 100
  );

  const annualSaving = bestRecommendation
    ? Math.round(bestRecommendation.impactKg * 12)
    : 0;

  const projectedScoreImprovement =
    annualSaving > 0
      ? Math.min(
          25,
          Math.round(
            (annualSaving / footprint.yearlyKg) * 100
          )
        )
      : 0;

  let benchmarkLine;

  if (footprint.monthlyKg >= BENCHMARKS.high) {
    benchmarkLine =
      `Your monthly footprint (${Math.round(
        footprint.monthlyKg
      )} kg CO₂e) is above the high-emission benchmark of ${
        BENCHMARKS.high
      } kg. Transportation and home energy represent the greatest reduction opportunities.`;
  } else if (footprint.monthlyKg >= BENCHMARKS.average) {
    benchmarkLine =
      `Your footprint is close to the average benchmark of ${
        BENCHMARKS.average
      } kg CO₂e/month. Consistently following the top recommendations could move you into a lower-impact range.`;
  } else {
    benchmarkLine =
      `Your footprint is below the average benchmark and approaching the sustainable target of ${
        BENCHMARKS.sustainable
      } kg CO₂e/month. Focus on maintaining your strongest habits.`;
  }

  const bestAction = bestRecommendation
    ? `${bestRecommendation.title} is ranked #1 because it targets your ${
        bestRecommendation.category
      } emissions and could reduce approximately ${
        bestRecommendation.impactKg
      } kg CO₂e per month. ${
        bestRecommendation.reason ?? ""
      }`
    : "No major reduction opportunities detected.";

  return {
    headline:
      `${topSource.label} contributes approximately ${contribution}% of your monthly carbon footprint.`,

    bestAction,

    benchmarkLine,

    annualSaving,

    projectedScoreImprovement,

    confidence:
      bestRecommendation?.confidence ?? 80,
  };
}