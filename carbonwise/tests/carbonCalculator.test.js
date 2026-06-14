import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateFootprint,
  calculateHomeEnergy,
  buildForecast,
  buildTrendData,
} from "../src/domain/carbonCalculator.js";
import { defaultActivity } from "../src/domain/mockData.js";

test("calculates a complete monthly and yearly footprint", () => {
  const result = calculateFootprint(defaultActivity);

  assert.ok(result.monthlyKg > 0);
  assert.equal(result.yearlyKg, Math.round(result.monthlyKg * 12 * 10) / 10);
  assert.equal(result.breakdown.length, 5);
  assert.ok(result.score >= 0 && result.score <= 100);
});

test("renewable energy percentage reduces home electricity emissions", () => {
  const lowRenewable = calculateHomeEnergy({
    electricityKwhMonth: 500,
    fuelThermsMonth: 0,
    renewablePercent: 0,
  });
  const highRenewable = calculateHomeEnergy({
    electricityKwhMonth: 500,
    fuelThermsMonth: 0,
    renewablePercent: 80,
  });

  assert.ok(highRenewable < lowRenewable);
});

test("trend and forecast helpers return stable chart data", () => {
  const trend = buildTrendData(900);
  const forecast = buildForecast(900, 30);

  assert.equal(trend.length, 6);
  assert.equal(forecast.length, 6);
  assert.ok(forecast[5].kg < forecast[0].kg);
});
