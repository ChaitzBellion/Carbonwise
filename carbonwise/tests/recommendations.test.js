import test from "node:test";
import assert from "node:assert/strict";
import { calculateFootprint } from "../src/domain/carbonCalculator.js";
import { defaultActivity } from "../src/domain/mockData.js";
import {
  generateRecommendations,
  recommendationForecast,
  totalRecommendationImpact,
} from "../src/domain/recommendations.js";

test("generates prioritized measurable recommendations", () => {
  const footprint = calculateFootprint(defaultActivity);
  const recommendations = generateRecommendations(defaultActivity, footprint);

  assert.ok(recommendations.length >= 4);
  assert.equal(recommendations[0].rank, 1);
  assert.ok(recommendations[0].impactKg >= recommendations.at(-1).impactKg);
  assert.ok(recommendations.every((item) => item.action && item.impactKg > 0));
});

test("recommendation forecast projects lower emissions", () => {
  const footprint = calculateFootprint(defaultActivity);
  const recommendations = generateRecommendations(defaultActivity, footprint);
  const impact = totalRecommendationImpact(recommendations);
  const forecast = recommendationForecast(footprint.monthlyKg, recommendations);

  assert.ok(impact > 0);
  assert.ok(forecast[forecast.length - 1].kg < forecast[0].kg);
});
