export function generatePrediction(history, footprint) {
  if (!history || history.length < 2) {
    return {
      trend: "stable",
      message:
        "Not enough historical data yet to generate a prediction.",
      projectedMonthlyKg: footprint.monthlyKg,
      confidence: 50,
    };
  }

  const first = history[0].monthlyKg;
  const last = history[history.length - 1].monthlyKg;

  const change = last - first;

  let trend = "stable";
  let message = "";
  let projectedMonthlyKg = last;

  if (change < -50) {
    trend = "improving";
    projectedMonthlyKg = Math.max(
      0,
      Math.round(last * 0.9)
    );

    message =
      "Your footprint has been decreasing. If you continue this trend, your emissions could fall another 10% next month.";
  }
  else if (change > 50) {
    trend = "increasing";
    projectedMonthlyKg = Math.round(last * 1.1);

    message =
      "Your footprint has been rising. Without changes, emissions may increase by another 10% next month.";
  }
  else {
    trend = "stable";

    message =
      "Your footprint has remained relatively stable. Small behavior changes could produce measurable improvements.";
  }

  return {
    trend,
    message,
    projectedMonthlyKg,
    confidence: 85,
  };
}