import { renderCategoryBars, renderForecastCards, renderTrendChart } from "./charts.js?v=tiles";
import { e, formatKg } from "./format.js";

export function renderAnalytics(state, footprint, recommendations, trend, forecast, insight) {
  const history = state.history ?? [];
  const potential = recommendations.reduce((sum, item) => sum + item.impactKg, 0);
  const yearlyPotential =
  Math.round(potential * 12);
  return `
    <section class="view-grid analytics-grid" aria-labelledby="analytics-title">
      <div class="page-heading">
        <p class="eyebrow">Analytics</p>
        <h1 id="analytics-title">Forecast carbon reduction</h1>
        <p>${formatKg(potential)} monthly savings identified from prioritized recommendations.</p>
        <p>${yearlyPotential.toLocaleString()} kg CO₂e could be avoided annually if all recommendations are adopted.</p>
      </div>

      ${insight ? `
        <section class="panel wide">
        <div class="section-title">

        <div>
        <p class="eyebrow">AI Analysis</p>
        <h2>Key Findings</h2>
        </div>
        </div>
        
        <p>
        <strong>Main Source:</strong>
        ${e(insight.headline)}
        </p>
        
        <p>
        <strong>Recommended Action:</strong>
        ${e(insight.bestAction)}
        </p>

        <p>
        <strong>Benchmark:</strong>
        ${e(insight.benchmarkLine)}
        </p>

        <p>
        <strong>Potential Annual Reduction:</strong>
        ${insight.annualSaving} kg CO₂e
        </p>
        </section>
        ` : ""}


      <!-- New Visual History Chart Section -->
      ${history.length > 0 ? `
        <section class="panel wide" aria-labelledby="history-chart-title">
          <div class="section-title">
            <div>
              <p class="eyebrow">Visual Progress</p>
              <h2 id="history-chart-title">Personal Footprint History</h2>
            </div>
          </div>
          <div style="height: 320px; width: 100%; position: relative;">
            <canvas id="historyChart"></canvas>
          </div>
        </section>
      ` : `
        <section class="panel wide" style="text-align: center; padding: 3rem;">
           <div style="font-size: 3rem; margin-bottom: 1rem;">📈</div>
           <h3>No historical data yet</h3>
           <p style="opacity: 0.7;">Complete a calculation in the Calculator tab to start tracking your progress over time.</p>
        </section>
      `}

      <section class="panel wide" aria-labelledby="historical-title">
        <div class="section-title">
          <div>
            <p class="eyebrow">Historical comparison</p>
            <h2 id="historical-title">Six-month trend</h2>
          </div>
        </div>
        ${renderTrendChart(trend, "Historical monthly footprint")}
      </section>

      <section class="panel wide" aria-labelledby="forecast-title">
        <div class="section-title">
          <div>
            <p class="eyebrow">Reduction forecast</p>
            <h2 id="forecast-title">If you apply top recommendations</h2>
          </div>
        </div>
        ${renderForecastCards(forecast)}
      </section>

      <section class="panel" aria-labelledby="analytics-breakdown-title">
        <div class="section-title">
          <div>
            <p class="eyebrow">Category analysis</p>
            <h2 id="analytics-breakdown-title">Monthly CO2e profile</h2>
          </div>
        </div>
        ${renderCategoryBars(footprint.breakdown)}
      </section>

      <section class="panel" aria-labelledby="analytics-actions-title">
        <div class="section-title">
          <div>
            <p class="eyebrow">Action plan</p>
            <h2 id="analytics-actions-title">Prioritized by impact</h2>
          </div>
        </div>
        <ol class="ranked-list">
        ${recommendations.map((item) => `
          <li>

          <span>${e(String(item.rank))}</span>
          <div>
          <strong>${e(item.title)}</strong>
          
          <small>
          ${e(item.category)}
          · ${formatKg(item.impactKg)} per month
          </small>
          
          <div style="margin-top: 0.35rem;">
          <small>
          Confidence: ${item.confidence ?? 80}%
          </small>
          </div>
          </div>
          </li>
          `).join("")}
          </ol>
      </section>
    </section>
  `;
}
