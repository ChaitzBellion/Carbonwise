import test from "node:test";
import assert from "node:assert/strict";
import {
  clampNumber,
  escapeHtml,
  sanitizeText,
  validateActivityInput,
  validateGoalInput,
} from "../src/domain/validators.js";

test("clamps unsafe numeric input to configured ranges", () => {
  assert.equal(clampNumber("999", 0, 100), 100);
  assert.equal(clampNumber("-8", 0, 100), 0);
  assert.equal(clampNumber("not-a-number", 0, 100, 12), 12);
});

test("sanitizes and escapes user-visible text", () => {
  assert.equal(sanitizeText("<script>alert(1)</script>"), "scriptalert(1)/script");
  assert.equal(escapeHtml("<b>test</b>"), "&lt;b&gt;test&lt;/b&gt;");
});

test("validates activity and goal schemas", () => {
  const activity = validateActivityInput({
    transportation: { carKmWeek: 99999 },
    food: { dietType: "unknown" },
  });
  const goal = validateGoalInput({
    title: "<Reduce fast>",
    target: -5,
    unit: "unknown",
  });

  assert.equal(activity.transportation.carKmWeek, 2000);
  assert.equal(activity.food.dietType, "mixed");
  assert.equal(goal.target, 1);
  assert.equal(goal.unit, "kg CO2e");
  assert.equal(goal.title, "Reduce fast");
});
