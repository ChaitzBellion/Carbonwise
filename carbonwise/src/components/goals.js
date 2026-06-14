import { icon } from "./icons.js";
import { e, formatKg, formatPercent, progressPercent } from "./format.js";

export function renderGoals(state) {
  const completed = state.goals.filter((goal) => progressPercent(goal) >= 100).length;
  return `
    <section class="view-grid goals-grid" aria-labelledby="goals-title">
      <div class="page-heading">
        <p class="eyebrow">Goals</p>
        <h1 id="goals-title">Track sustainable progress</h1>
        <p>${completed} completed, ${state.goals.length - completed} active, ${formatKg(totalGoalImpact(state.goals))} estimated monthly impact.</p>
      </div>

      <form class="panel goal-form" data-action="add-goal">
        <div class="section-title">
          <div>
            <p class="eyebrow">New goal</p>
            <h2>Create a measurable goal</h2>
          </div>
          <button class="primary-button" type="submit">${icon("plus")} Add goal</button>
        </div>
        <div class="field-grid">
          <label class="field">
            <span>Goal title</span>
            <input name="title" maxlength="72" required value="" placeholder="Reduce emissions by 10%">
          </label>
          <label class="field">
            <span>Target</span>
            <input name="target" type="number" min="1" step="1" required value="100">
          </label>
          <label class="field">
            <span>Unit</span>
            <select name="unit">
              <option>kg CO2e</option>
              <option>km</option>
              <option>days</option>
              <option>actions</option>
              <option>%</option>
            </select>
          </label>
        </div>
      </form>

      <section class="panel wide" aria-label="Goal progress list">
        ${state.goals.length === 0 ? `
          <div class="empty-state">
            <h2>No goals yet</h2>
            <p>Add one measurable goal to start tracking reduction progress.</p>
          </div>
        ` : `
          <div class="goal-list">
            ${state.goals.map((goal) => renderGoalCard(goal)).join("")}
          </div>
        `}
      </section>
    </section>
  `;
}

function renderGoalCard(goal) {
  const progress = progressPercent(goal);
  return `
    <article class="goal-card">
      <div class="goal-main">
        <span class="pill">${e(goal.category)}</span>
        <h2>${e(goal.title)}</h2>
        <p>${e(String(goal.current))} of ${e(String(goal.target))} ${e(goal.unit)} complete</p>
        <div class="progress-track" aria-label="${e(goal.title)} progress">
          <span style="--progress:${progress}%"></span>
        </div>
      </div>
      <div class="goal-actions">
        <strong>${formatPercent(progress)}</strong>
        <span>${formatKg(goal.impactKg)} / mo</span>
        <div class="button-row">
          <button class="icon-button" type="button" aria-label="Decrease goal progress" data-action="update-goal" data-id="${e(goal.id)}" data-delta="-1">${icon("minus")}</button>
          <button class="icon-button" type="button" aria-label="Increase goal progress" data-action="update-goal" data-id="${e(goal.id)}" data-delta="1">${icon("plus")}</button>
          <button class="icon-button danger" type="button" aria-label="Remove goal" data-action="remove-goal" data-id="${e(goal.id)}">${icon("trash")}</button>
        </div>
      </div>
    </article>
  `;
}

function totalGoalImpact(goals) {
  return goals.reduce((sum, goal) => sum + Number(goal.impactKg || 0), 0);
}
