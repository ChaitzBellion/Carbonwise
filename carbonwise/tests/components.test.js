import test from "node:test";
import assert from "node:assert/strict";
import { calculateFootprint, buildTrendData } from "../src/domain/carbonCalculator.js";
import { defaultActivity } from "../src/domain/mockData.js";
import { generateRecommendations, recommendationForecast } from "../src/domain/recommendations.js";
import { renderApp } from "../src/components/app.js";
import { renderCalculator } from "../src/components/calculator.js";
import { renderEducation } from "../src/components/education.js";
import { renderGoals } from "../src/components/goals.js";

test("renders the application shell and active dashboard", () => {
  const state = {
    activity: defaultActivity,
    goals: [],
    challenges: [],
    achievements: [],
    theme: "light",
    activeView: "overview",
    educationSearch: "",
    educationCategory: "All",
    lastMilestone: "",
  };
  const footprint = calculateFootprint(defaultActivity);
  const recommendations = generateRecommendations(defaultActivity, footprint);
  const html = renderApp(state, {
    footprint,
    recommendations,
    trend: buildTrendData(footprint.monthlyKg),
    forecast: recommendationForecast(footprint.monthlyKg, recommendations),
  });

  assert.match(html, /CarbonWise/);
  assert.match(html, /Highest-impact next actions/);
});

test("renders calculator input groups", () => {
  const footprint = calculateFootprint(defaultActivity);
  const html = renderCalculator({ activity: defaultActivity }, footprint);

  assert.match(html, /Transportation/);
  assert.match(html, /Home Energy/);
  assert.match(html, /Food Consumption/);
});

test("renders education empty state when filters have no match", () => {
  const html = renderEducation({
    educationSearch: "unmatched query",
    educationCategory: "All",
  });

  assert.match(html, /No guides found/);
});

test("renders goal empty state", () => {
  const html = renderGoals({ goals: [] });

  assert.match(html, /No goals yet/);
});
