import { icon } from "./icons.js";
import { renderCategoryBars, renderDonut, renderTrendChart } from "./charts.js?v=tiles";
import { e, formatExactKg, formatKg, priorityLabel } from "./format.js";

export function renderOverview(state, footprint, recommendations, trend) {
  const topSource = footprint.topSources[0];
  return `
    <section class="view-grid overview-grid" aria-labelledby="overview-title">
      <div class="page-heading">
        <p class="eyebrow">Personal dashboard</p>
        <h1 id="overview-title">CarbonWise</h1>
        <p>${e(footprint.summary.status)} across transportation, home, food, shopping, and waste.</p>
      </div>

      ${state.lastMilestone ? `
        <div class="notice success" role="status">
          ${icon("check")}
          <span>${e(state.lastMilestone)}</span>
        </div>
      ` : ""}

      <section class="score-panel panel" aria-label="Carbon score">
        <div class="score-ring" style="--score:${footprint.score}">
          <span>${footprint.score}</span>
          <small>score</small>
        </div>
        <div>
          <p class="eyebrow">Carbon score</p>
          <h2>${e(scoreMessage(footprint.score))}</h2>
          <p>${formatExactKg(footprint.yearlyKg)} yearly estimate, equal to about ${e(footprint.summary.annualTons)} metric tons CO2e.</p>
        </div>
      </section>

      <section class="metric-card panel">
        <span class="metric-icon">${icon("bolt")}</span>
        <p>Monthly footprint</p>
        <strong>${formatExactKg(footprint.monthlyKg)}</strong>
        <small>Updated from your calculator inputs</small>
      </section>

      <section class="metric-card panel">
        <span class="metric-icon">${icon("leaf")}</span>
        <p>Yearly footprint</p>
        <strong>${formatKg(footprint.yearlyKg)}</strong>
        <small>${footprint.summary.treesEquivalent.toLocaleString()} tree-year equivalent</small>
      </section>

      <section class="panel" aria-labelledby="sources-title">
        <div class="section-title">
          <div>
            <p class="eyebrow">Breakdown</p>
            <h2 id="sources-title">Top emission sources</h2>
          </div>
          <strong>${topSource ? e(topSource.label) : "No source"}</strong>
        </div>
        ${renderDonut(footprint.breakdown)}
      </section>

      <section class="panel" aria-labelledby="trend-title-heading">
        <div class="section-title">
          <div>
            <p class="eyebrow">Trend</p>
            <h2 id="trend-title-heading">Weekly and monthly signals</h2>
          </div>
        </div>
        ${renderTrendChart(trend, "Monthly carbon footprint trend")}
      </section>

      <section class="panel wide" aria-labelledby="opportunities-title">
        <div class="section-title">
          <div>
            <p class="eyebrow">Recommendations</p>
            <h2 id="opportunities-title">Highest-impact next actions</h2>
          </div>
          <button class="ghost-button" type="button" data-view="calculator">${icon("calculator")} Tune inputs</button>
        </div>
        <div class="recommendation-list">
          ${recommendations.slice(0, 4).map((item) => `
            <article class="recommendation">
              <div>
                <span class="pill">${e(priorityLabel(item.priority))}</span>
                <h3>${e(item.title)}</h3>
                <p>${e(item.action)}</p>
              </div>
              <strong>${formatKg(item.impactKg)} / mo</strong>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="panel wide" aria-labelledby="category-analysis-title">
        <div class="section-title">
          <div>
            <p class="eyebrow">Category analysis</p>
            <h2 id="category-analysis-title">Where your emissions concentrate</h2>
          </div>
        </div>
        ${renderCategoryBars(footprint.breakdown)}
      </section>
    </section>
  `;
}

function scoreMessage(score) {
  if (score >= 80) return "Excellent low-carbon routine";
  if (score >= 65) return "Strong progress with room to improve";
  if (score >= 45) return "Meaningful reductions available";
  return "High-impact changes recommended";
}
