// MAKE SURE THESE IMPORTS ARE AT THE TOP
import { achievements } from "../domain/mockData.js";
import { icon } from "./icons.js";
import { e, formatKg, formatPercent, progressPercent } from "./format.js";

/**
 * Main function to render the challenges view
 */
export function renderChallenges(state) {
  // 1. General Stats
  const completedCount = state.challenges.filter((c) => c.completed).length;
  const activeCount = state.challenges.filter((c) => c.active && !c.completed).length;
  const score = Math.min(100, 48 + completedCount * 14 + activeCount * 6);
  const streak = completedCount + activeCount + 4;

  // 2. Weekly Specific Stats
  const weeklyChallenges = state.challenges.filter((c) => c.cadence?.toLowerCase() === "weekly");
  const totalWeekly = weeklyChallenges.length;
  const completedWeekly = weeklyChallenges.filter((c) => c.progress >= c.target).length;
  const weeklyPercent = totalWeekly > 0 ? Math.round((completedWeekly / totalWeekly) * 100) : 0;

  // 3. Filter Achievements based on rules
  const earnedAchievements = (achievements || []).filter(achievement => {
    switch (achievement.label) {
      case "Baseline Builder":
        return state.challenges.some(c => c.progress > 0);
      case "7-Day Streak":
        return streak >= 7;
      case "Energy Optimizer":
        return state.challenges.some(c => c.title.toLowerCase().includes('energy') && c.completed);
      case "Efficiency Expert":
        return completedCount >= 3;
      default:
        return false; 
    }
  });

  return `
    <section class="view-grid challenges-grid" aria-labelledby="challenges-title">
      <div class="page-heading">
        <p class="eyebrow">Challenges</p>
        <h1 id="challenges-title">Build a sustainability streak</h1>
        
        <div class="weekly-summary-container" style="margin-top: 1rem; max-width: 400px;">
          <p style="margin-bottom: 0.5rem;">
            <strong>${weeklyPercent}%</strong> of weekly goals reached (${completedWeekly}/${totalWeekly})
          </p>
          <div class="progress-track" aria-label="Total weekly progress" style="height: 12px; background: rgb(31, 43, 40); border-radius: 999px; overflow: hidden;">
            <span style="width: ${weeklyPercent}%; background: rgb(98, 196, 184); height: 100%; display: block; border-radius: 999px; transition: width 0.3s ease;"></span>
          </div>
        </div>
      </div>

      <section class="panel challenge-score" aria-label="Sustainability score">
        <div class="score-ring compact" style="--score:${score}">
          <span>${score}</span>
          <small class="ai-style-change-1">score</small>
        </div>
        <div>
          <h2>Challenge momentum</h2>
          <p>${streak}-day behavior streak from weekly and monthly activity.</p>
        </div>
      </section>

      <section class="panel achievement-panel" aria-labelledby="achievement-title">
        <div class="section-title">
          <div>
            <p class="eyebrow">Achievements</p>
            <h2 id="achievement-title">Badges unlocked</h2>
          </div>
        </div>
        <div class="badge-grid">
          ${earnedAchievements.length > 0 
            ? earnedAchievements.map((achievement) => `
                <article class="badge earned">
                  ${icon("shield")}
                  <strong>${e(achievement.label)}</strong>
                  <span>${e(achievement.detail)}</span>
                </article>
              `).join("")
            : `<p class="empty-state">Complete challenges to unlock your first badge!</p>`
          }
        </div>
      </section>

      <section class="panel wide" aria-label="Sustainability challenges">
        <div class="challenge-list">
          ${state.challenges.map((challenge) => renderChallengeCard(challenge)).join("")}
        </div>
      </section>
    </section>
  `;
}

/**
 * Helper function to render an individual challenge card
 */
function renderChallengeCard(challenge) {
  const progress = progressPercent(challenge);
  return `
    <article class="challenge-card ${challenge.completed ? "is-complete" : ""}">
      <div>
        <span class="pill">${e(challenge.cadence)}</span>
        <h2>${e(challenge.title)}</h2>
        <p>${e(String(challenge.progress))} of ${e(String(challenge.target))} actions completed</p>
        <div class="progress-track" aria-label="${e(challenge.title)} progress">
          <span style="--progress:${progress}%"></span>
        </div>
      </div>
      <div class="challenge-actions">
        <strong>${formatPercent(progress)}</strong>
        <span>${formatKg(challenge.impactKg)} potential</span>
        <div class="button-row">
          <button class="ghost-button" type="button" data-action="toggle-challenge" data-id="${e(challenge.id)}">
            ${challenge.active ? "Pause" : "Join"}
          </button>
          <button class="primary-button" type="button" data-action="advance-challenge" data-id="${e(challenge.id)}" ${challenge.completed ? "disabled" : ""}>
            ${icon("check")} Log action
          </button>
        </div>
      </div>
    </article>
  `;
}