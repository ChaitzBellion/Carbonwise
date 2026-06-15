import { calculateFootprint, buildTrendData } from "./domain/carbonCalculator.js";
import {
  generateRecommendations,
  recommendationForecast,
} from "./domain/recommendations.js";
import { createStore } from "./state/store.js";
import { renderApp } from "./components/app.js?v=tiles";
import { sanitizeText } from "./domain/validators.js";
import { enrichRecommendations } from "./domain/recommendations.js";
import { getMethodology } from "./domain/methodology.js";
import { simulateScenario } from "./domain/scenarioSimulator.js";
import { scenarioLibrary } from "./domain/scenarioLibrary.js";

const app = document.querySelector("#app");
const store = createStore();
let pendingFocus = null;

// Event Listeners
app.addEventListener("click", handleClick);
app.addEventListener("input", handleInput);
app.addEventListener("change", handleInput);
app.addEventListener("submit", handleSubmit);

// Subscribe to store changes to trigger re-renders
// 1. Create a variable to hold the timer
let renderTimer;

// 2. Create the debounced function
function debouncedRender() {
  clearTimeout(renderTimer);
  renderTimer = setTimeout(() => {
    render();
  }, 800); // 400ms is the "sweet spot" for typing speed
}

// 3. Update the subscription to use the NEW function
store.subscribe(debouncedRender);

window.addEventListener("error", () => {
  app.innerHTML = `
    <div class="error-state">
      <h1>CarbonWise could not load</h1>
      <p>Refresh the page or reset stored sample data.</p>
      <button class="primary-button" type="button" data-action="reset-sample">Reset sample</button>
    </div>
  `;
});

// Initial Render
setTimeout(render, 180);

/**
 * Renders the application based on current state
 */

function render() {
  const state = store.getState();
  const footprint = calculateFootprint(state.activity);
  const recommendations = generateRecommendations(state.activity, footprint);
  const trend = buildTrendData(footprint.monthlyKg);
  const forecast = recommendationForecast(footprint.monthlyKg, recommendations);
  const methodology = getMethodology();

  document.documentElement.dataset.theme = state.theme;
  app.className = "";

  const model = { footprint, recommendations, trend, forecast, methodology };

  if (!document.startViewTransition) {
    app.innerHTML = renderApp(state, model);
    // CALL CHART HERE FOR NON-TRANSITION BROWSERS
    if (state.activeView === "analytics") {
      setTimeout(() => initHistoryChart(state.history), 100);
    }
    restoreFocus();
  } else {
    const transition = document.startViewTransition(() => {
      app.innerHTML = renderApp(state, model);
      restoreFocus();
    });

    // CALL CHART HERE FOR TRANSITION BROWSERS
    transition.finished.then(() => {
      if (state.activeView === "analytics") {
        setTimeout(() => initHistoryChart(state.history), 100);
      }
    });
  }
}

/**
 * Handles all button clicks and actions
 */
function handleClick(event) {
  const viewButton = event.target.closest("[data-view]");
  if (viewButton) {
    store.dispatch({ type: "SET_VIEW", view: viewButton.dataset.view });
    render(); 
    focusMain();
    return;
  }

  const button = event.target.closest("[data-action]");
  if (!button) return;

  // 1. Declare 'action' ONCE here
  const { action } = button.dataset;
  
  if (action === "toggle-theme") {
    store.dispatch({ 
      type: "SET_THEME", 
      theme: store.getState().theme === "dark" ? "light" : "dark" 
    });
    render();
  }
  
  if (action === "update-goal") {
    store.dispatch({ 
      type: "UPDATE_GOAL", 
      id: button.dataset.id, 
      delta: Number(button.dataset.delta || 0) 
    });
    render();
  }
  
  if (action === "remove-goal") {
    store.dispatch({ type: "REMOVE_GOAL", id: button.dataset.id });
    render();
  }
  
  if (action === "toggle-challenge") {
    store.dispatch({ type: "TOGGLE_CHALLENGE", id: button.dataset.id });
    render();
  }
  
  if (action === "advance-challenge") {
    store.dispatch({ type: "ADVANCE_CHALLENGE", id: button.dataset.id });
    render();
  }
  
  if (action === "education-category") {
    store.dispatch({ type: "SET_EDUCATION_CATEGORY", value: button.dataset.category });
    render();
  }
  
  if (action === "reset-sample") {
    store.dispatch({ type: "RESET_SAMPLE" });
    render();
  }

  // Inside handleClick in main.js
  if (action === "run-scenario") {
    const { scenarioId } = button.dataset;
    const state = store.getState();
  
  // 1. Find the scenario in your library
    const scenario = scenarioLibrary.find(s => s.id === scenarioId);
    if (!scenario){
      console.error("Scenario not found:", scenarioId);
      return;
    }

  // 2. Generate the "patch" for this specific activity
    const patch = scenario.patchFor(state.activity);

  // 3. Run the simulation
    const result = simulateScenario(state.activity, patch);
  
  // 4. Save and update
    store.dispatch({ type: "SET_SIMULATION", simulation: result });
    render();
    return;
  }
  if (action === "clear-simulation") {
    store.dispatch({ type: "CLEAR_SIMULATION" });
    render(); // This will refresh the screen and show the scenarios again
    return;
  }
  // Inside handleClick in main.js
  if (action === "share-impact") {
    const state = store.getState();
    const footprint = calculateFootprint(state.activity);
  
    const shareText = `🌱 My CarbonWise Update:
  
  ⭐ Score: ${footprint.score}/100
  🌍 Monthly Footprint: ${footprint.monthlyKg}kg CO2e
  🌳 Impact: My lifestyle is equivalent to planting ${footprint.summary.treesEquivalent} trees per year!

  Track your own footprint on CarbonWise.`;

    navigator.clipboard.writeText(shareText).then(() => {
      alert("Impact summary copied to clipboard! You can now paste it to social media.");
    });
    return;
  }
}


/**
 * Handles all input changes (The Dynamic Logic)
 */
function handleInput(event) {
  const target = event.target;
  if (!target.dataset.action) return;

  // 1. If it's the calculator, do NOTHING (let the user type)
  if (target.dataset.action === "activity-input") {
    return; 
  }

  // 2. For everything else (like search or goals), keep the live update
  if (target.dataset.action === "education-search") {
    store.dispatch({ type: "SET_EDUCATION_SEARCH", value: target.value });
  }
}

/**
 * Handles form submissions
 */


function handleSubmit(event) {
  event.preventDefault();

  const form = event.target;
  if (form.dataset.action === "calculator-form") {
    
    // 1. Manually find all inputs and update the store one last time
    // This ensures no "half-typed" values are missed.
    const inputs = form.querySelectorAll('input[data-action="activity-input"], select[data-action="activity-input"]');
    
    inputs.forEach(input => {
      const { section, field } = input.dataset;
      const value = input.type === "number" ? Number(input.value) : input.value;
      
      store.dispatch({ 
        type: "UPDATE_ACTIVITY", 
        patch: { [section]: { [field]: value } } 
      });
    });

    // 2. NOW render. The store is guaranteed to have the latest data.
    console.log("Calculation triggered with fresh data!");

// Inside handleSubmit in main.js
const finalFootprint = calculateFootprint(store.getState().activity);
store.dispatch({ 
  type: "RECORD_FOOTPRINT", 
  monthlyKg: finalFootprint.monthlyKg,
  score: finalFootprint.score
});
    render();

    // 3. Scroll to results
    document.querySelector('.calculator-result')?.scrollIntoView({ behavior: 'smooth' });
  }
}

// ALSO: Change your subscription back to regular render or remove it for inputs
// store.subscribe(render); // You can keep this, but ensure handleInput doesn't trigger it constantly
function focusMain() {
  requestAnimationFrame(() => {
    document.querySelector("#main")?.focus();
  });
}

function rememberFocus(target) {
  if (target.id) {
    pendingFocus = `#${CSS.escape(target.id)}`;
    return;
  }
  if (target.dataset.action) {
    const section = target.dataset.section ? `[data-section="${CSS.escape(target.dataset.section)}"]` : "";
    const field = target.dataset.field ? `[data-field="${CSS.escape(target.dataset.field)}"]` : "";
    pendingFocus = `[data-action="${CSS.escape(target.dataset.action)}"]${section}${field}`;
  }
}

function restoreFocus() {
  if (!pendingFocus) return;
  const selector = pendingFocus;
  pendingFocus = null;
  requestAnimationFrame(() => {
    const target = document.querySelector(selector);
    if (target instanceof HTMLInputElement || target instanceof HTMLSelectElement) {
      target.focus({ preventScroll: true });
      if (target instanceof HTMLInputElement && target.type !== "number") {
        const end = target.value.length;
        target.setSelectionRange(end, end);
      }
    }
  });
}

function initHistoryChart(history) {
  const canvas = document.getElementById('historyChart');
  if (!canvas) return; 

  // 1. Prepare data (Date for X-axis, kg for Y-axis)
  const labels = history.map(item => new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
  const dataPoints = history.map(item => item.monthlyKg);

  // 2. Create the chart
  new Chart(canvas, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Monthly Emissions (kg)',
        data: dataPoints,
        borderColor: '#153f35', // Match your dark green theme
        backgroundColor: 'rgba(148, 210, 189, 0.2)', // Light green fill
        borderWidth: 3,
        fill: true,
        tension: 0.4, // Smooth curved lines
        pointRadius: 4,
        pointBackgroundColor: '#153f35'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false } // Keep it clean
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(0,0,0,0.05)' },
          title: { display: true, text: 'kg CO2e' }
        },
        x: {
          grid: { display: false }
        }
      }
    }
  });
}

