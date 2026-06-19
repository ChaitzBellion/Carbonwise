import { icon } from "./icons.js";
import { renderCategoryBars, renderDonut, renderTrendChart } from "./charts.js?v=tiles";
import { e, formatExactKg, formatKg, priorityLabel } from "./format.js";
import { scenarioLibrary } from "../domain/scenarioLibrary.js"; 

export function renderOverview(state, footprint, recommendations, trend, forecast, insight, badges, benchmark, prediction) {
  const topSource = footprint.topSources[0];
  return `
    <section class="view-grid overview-grid" aria-labelledby="overview-title">
      <div class="page-heading">
        <p class="eyebrow">Personal dashboard</p>
        <h1 id="overview-title">CarbonWise</h1>
        <div class="button-group" style="display: flex; gap: 1rem; grid-row: 4; grid-column: 1 / -1;">
        <!-- Feature 1: Share Button -->
        <button class="primary-button" type="button" data-action="share-impact">
        ${icon("share")} Share my impact
        </button>
        
        <!-- Feature 2: Export Button -->
        <button class="primary-button" type="button" data-action="export-report">
        ${icon("file")} Export PDF Report
        </button>
        </div>
        <p>${e(footprint.summary.status)} across transportation, home, food, shopping, and waste.</p>
      </div>
        ${insight ? renderAICoach(insight) : ""}
        ${badges?.length ? renderBadges(badges) : ""}

        ${prediction ? `
          <section class="panel wide" aria-labelledby="prediction-title" style=" border-left:4px solid var(--primary); margin-bottom:1rem; background:var(--surface-2);">
  <div class="section-title">
    <div>
      <p class="eyebrow">
        AI Prediction
      </p>

      <h2 id="prediction-title">
        Future Carbon Outlook
      </h2>
    </div>

    <span class="pill">
      ${prediction.confidence}% confidence
    </span>
  </div>

  <p>
    ${e(prediction.message)}
  </p>

  <p>
    Projected next-month footprint:
    <strong>
      ${prediction.projectedMonthlyKg} kg CO₂e
    </strong>
  </p>

  <p>
    Trend:
    <strong>
      ${e(prediction.trend)}
    </strong>
  </p>
</section>
` : ""}

      <!-- Simulation Section -->
      ${state.simulation && state.simulation.monthlySavingsKg > 0 ? `
        <div class="panel highlight-panel simulation-result" style="background: var(--surface-2); border: 2px solid var(--primary); grid-column: 1 / -1; margin-bottom: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 1.5rem;">
            <div>
              <p class="eyebrow" style="color: var(--primary); margin: 0;">Simulation Active</p>
              <h2 style="margin: 0.5rem 0">🌱 Projected Savings</h2>
              <p style="margin: 0">By making this change, your monthly footprint would drop by <strong>${state.simulation.monthlySavingsKg} kg</strong>!</p>
              <p style="font-size: 0.9rem; margin-top: 0.5rem; opacity: 0.8;">Carbon score improvement: <strong>+${state.simulation.improvedScore} points</strong>.</p>
            </div>
            <button class="primary-button" type="button" data-action="clear-simulation">
              ${icon("reset")} Reset View
            </button>
          </div>
        </div>
      ` : `
        <div class="panel wide" style="grid-column: 1 / -1; margin-bottom: 1rem; padding: 1.5rem;">
          <h2 style="margin-top: 0">What if you made a change?</h2>
          <p style="opacity: 0.8; margin-bottom: 1.5rem;">Select a scenario below to see how it affects your carbon footprint and score.</p>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem;">
            ${scenarioLibrary.map(scenario => `
              <div style="padding: 1.25rem; border: 1px solid var(--border); border-radius: 12px; background: var(--surface-1); display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                  <h3 style="margin: 0 0 0.5rem 0; font-size: 1.1rem;">${e(scenario.title)}</h3>
                  <p style="font-size: 0.9rem; line-height: 1.4; margin-bottom: 1.25rem; opacity: 0.7;">${e(scenario.description)}</p>
                </div>
                <button class="ghost-button" style="width: 100%; border: 1px solid var(--primary); color: var(--primary);" type="button" data-action="run-scenario" data-scenario-id="${scenario.id}">
                  ⚡ Try this
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      `}

      ${state.lastMilestone ? `
        <div class="notice success" role="status">
          ${icon("check")}
          <span>${e(state.lastMilestone)}</span>
        </div>
      ` : ""}

      ${state.streak?.current > 0 ? `
        <section
        class="panel wide"
        style="
        grid-column: 1 / -1;
        border-left: 4px solid #ff9800;
        background: var(--surface-2);
        "
        >
        <div class="section-title">
        <div>
        <p class="eyebrow">Carbon Streak</p>
        <h2>🔥 ${state.streak.current} Day Streak</h2>
        </div>
        </div>
        <p>
        You've tracked your footprint for <strong>${state.streak.current}</strong> consecutive days.
        </p>
        <p> Best streak: <strong>${state.streak.best}</strong> days. </p>
        </section>
        ` : ""}

      <section class="score-panel panel" aria-label="Carbon score">
        <div class="score-ring" style="--score:${footprint.score}" role="progressbar" aria-valuemin="0" aria-valuemax="100" ariavaluenow="${footprint.score}" aria-label="Carbon score">
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

      <section class="metric-card panel">
      <span class="metric-icon">🔥</span>
      <p>Current Streak</p>
      <strong>
      ${state.streak?.current ?? 0} days
      </strong>
      <small>
      Best streak: ${state.streak?.best ?? 0} days
      </small>
      </section>

      <section class="metric-card panel">
      <span class="metric-icon">${icon("target")}</span>
      
      <p>Benchmark</p>
      
      <strong>
      ${footprint.monthlyKg < 500
        ? "Below Target"
        : footprint.monthlyKg < 900
        ? "Average"
        : "Above Average"}
      </strong>
      
      <small>
      Sustainable target: 500 kg/month
      </small>
      </section>

      ${benchmark ? `
        <section class="panel" aria-labelledby="benchmark-comparison-title">
        <div class="section-title">
        <div>
        <p class="eyebrow">Benchmark Comparison</p>
        <h2 id="benchmark-comparison-title"> How you compare </h2>
        </div>
        </div>
        
        <div style=" display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:1rem;">
        <div class="metric-card"> <p>Category</p> 
        <strong>
        ${e(benchmark.band)}</strong></div>
        <div class="metric-card"> <p>vs Low Carbon</p> <strong>
        ${benchmark.vsLowCarbonKg > 0
          ? "+" + formatKg(benchmark.vsLowCarbonKg)
          : formatKg(Math.abs(benchmark.vsLowCarbonKg))}
          </strong>
          </div>
          
          <div class="metric-card"> <p>vs Average</p>
          <strong>
          ${benchmark.vsAverageKg > 0
            ? "+" + formatKg(benchmark.vsAverageKg)
            : formatKg(Math.abs(benchmark.vsAverageKg))}
            </strong>
            </div>
            </div>
            <div style="margin-top:1rem;"> <p style="margin-bottom:0.5rem;"> Position against benchmark scale </p>
            <div style=" width:100%; height:12px; background:var(--surface-2); border-radius:999px; overflow:hidden;"            role="img" aria-label="Benchmark position: ${benchmark.band}">
      <div
        style="
          width:${benchmark.normalizedPosition}%;
          height:100%;
          background:var(--primary);
        "
      ></div>
    </div>
  </div>
</section>
` : ""}

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
                <small> AI confidence: ${item.confidence}% - ${e(item.reason)}</small>
                <p class="recommendation-why" style="margin-top: 0.5rem; font-size: 0.8rem; opacity: 0.75;">Why? ${e(item.reason)}</p>
                <section class="metric-card panel">
                  <span class="metric-icon">${icon("bolt")}</span>
                  <p>Estimated impact</p>
                  <strong>${formatExactKg(item.impactKg)} / mo</strong>
                </section>
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

      <!-- Feature 2: Offset Calculator Integration -->
      ${renderOffsetCalculator(footprint.monthlyKg)}

    </section>
  `;
}

function renderOffsetCalculator(monthlyKg) {
  const burgerEquivalent = Math.round(monthlyKg / 2.5); 
  const flightEquivalent = (monthlyKg / 250).toFixed(1); 
  const smartphoneEquivalent = Math.round(monthlyKg / 0.06); 

  return `
    <section class="panel wide" style="background: var(--surface-2); border-left: 4px solid var(--primary); grid-column: 1 / -1;">
      <div class="section-title">
        <div>
          <p class="eyebrow">Real-world perspective</p>
          <h2>Your monthly impact is equal to...</h2>
        </div>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1.5rem; padding: 1rem 0;">
        <div style="text-align: center;">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🍔</div>
          <strong>${burgerEquivalent}</strong>
          <p style="font-size: 0.8rem; opacity: 0.7;">Average cheeseburgers</p>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">✈️</div>
          <strong>${flightEquivalent}</strong>
          <p style="font-size: 0.8rem; opacity: 0.7;">Short-haul flights</p>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">📱</div>
          <strong>${smartphoneEquivalent.toLocaleString()}</strong>
          <p style="font-size: 0.8rem; opacity: 0.7;">Smartphone charges</p>
        </div>
      </div>
    </section>
  `;
}

function scoreMessage(score) {
  if (score >= 80) return "Excellent low-carbon routine";
  if (score >= 65) return "Strong progress with room to improve";
  if (score >= 45) return "Meaningful reductions available";
  return "High-impact changes recommended";
}


function renderAICoach(insight) {
  return `
    <section
      class="panel wide"
      aria-labelledby="ai-coach-title"
      aria-live="polite"
      style="
        margin: 1rem 0;
        border-left: 4px solid var(--primary);
      "
    >
      <div class="section-title">
        <div>
          <p class="eyebrow">
            AI Sustainability Coach
          </p>

          <h2 id="ai-coach-title">
            Personalized Insights
          </h2>
        </div>

        <span class="pill">
          ${insight.confidence}% confidence
        </span>
      </div>

      <p>
        ${e(insight.headline)}
      </p>

      <p>
        ${e(insight.bestAction)}
      </p>

      <p>
        ${e(insight.benchmarkLine)}
      </p>

      <strong>
        Potential yearly reduction:
        ${insight.annualSaving} kg CO₂e
      </strong>
    </section>
  `;
}

function renderBadges(badges) {
  return `
    <section
      class="panel wide"
      aria-labelledby="badges-title"
      style="margin: 1rem 0;"
    >
      <div class="section-title">
        <div>
          <p class="eyebrow">Achievements</p>
          <h2 id="badges-title">
            Sustainability Badges
          </h2>
        </div>
      </div>

      <div
        style="
          display:grid;
          grid-template-columns:repeat(auto-fit,minmax(180px,1fr));
          gap:1rem;
        "
      >
        ${badges.map(badge => `
          <div
            class="metric-card panel"
            style="text-align:center;"
          >
            <div style="font-size:2rem;">
              ${badge.icon}
            </div>

            <strong>
              ${e(badge.title)}
            </strong>

            <small>
              ${e(badge.description)}
            </small>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}
