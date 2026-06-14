import { renderAnalytics } from "./analytics.js?v=tiles";
import { renderCalculator } from "./calculator.js?v=tiles";
import { renderChallenges } from "./challenges.js?v=tiles";
import { renderEducation } from "./education.js?v=tiles";
import { renderGoals } from "./goals.js?v=tiles";
import { renderOverview } from "./dashboard.js?v=tiles";
import { icon } from "./icons.js";
import { e, formatKg } from "./format.js";

const VIEWS = Object.freeze([
  ["overview", "Overview", "overview"],
  ["calculator", "Calculator", "calculator"],
  ["analytics", "Analytics", "analytics"],
  ["goals", "Goals", "goals"],
  ["challenges", "Challenges", "challenges"],
  ["education", "Learn", "learn"],
]);

export function renderApp(state, model) {
  return `
    <div class="app-shell">
      <aside class="sidebar" aria-label="Primary">
        <div class="brand">
          <span class="brand-mark">${icon("leaf", 22)}</span>
          <div>
            <strong>CarbonWise</strong>
            <small>Personal footprint tracker</small>
          </div>
        </div>
        <nav class="nav-list" aria-label="Main navigation">
          ${VIEWS.map(([id, label, iconName]) => `
            <button
              type="button"
              class="nav-item ${state.activeView === id ? "active" : ""}"
              data-view="${e(id)}"
              aria-current="${state.activeView === id ? "page" : "false"}"
            >
              ${icon(iconName)}
              <span>${e(label)}</span>
            </button>
          `).join("")}
        </nav>
        <div class="sidebar-footer">
          <div>
            <span>Monthly</span>
            <strong>${formatKg(model.footprint.monthlyKg)}</strong>
          </div>
          <button class="ghost-button full" type="button" data-action="reset-sample">${icon("reset")} Reset sample</button>
        </div>
      </aside>

      <div class="content-shell">
        <header class="topbar">
          <div>
            <p class="eyebrow">Carbon score</p>
            <strong>${model.footprint.score}/100</strong>
          </div>
          <div class="topbar-actions">
            <button class="ghost-button" type="button" data-view="calculator">${icon("calculator")} Update footprint</button>
            <button
              class="icon-button"
              type="button"
              data-action="toggle-theme"
              aria-label="Toggle color theme"
              title="Toggle color theme"
            >${icon(state.theme === "dark" ? "sun" : "moon")}</button>
          </div>
        </header>
        <main id="main" tabindex="-1">
          ${renderActiveView(state, model)}
        </main>
      </div>
    </div>
  `;
}

function renderActiveView(state, model) {
  if (state.activeView === "calculator") return renderCalculator(state, model.footprint);
  if (state.activeView === "analytics") return renderAnalytics(model.footprint, model.recommendations, model.trend, model.forecast);
  if (state.activeView === "goals") return renderGoals(state);
  if (state.activeView === "challenges") return renderChallenges(state);
  if (state.activeView === "education") return renderEducation(state);
  return renderOverview(state, model.footprint, model.recommendations, model.trend);
}
