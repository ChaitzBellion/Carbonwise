import { calculateFootprint, buildTrendData } from "./domain/carbonCalculator.js";
import {
  generateRecommendations,
  recommendationForecast,
} from "./domain/recommendations.js";
import { createStore } from "./state/store.js";
import { renderApp } from "./components/app.js?v=tiles";
import { sanitizeText } from "./domain/validators.js";

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

  document.documentElement.dataset.theme = state.theme;
  app.className = "";
  
  // This line re-renders the HTML, which is why we need to restore focus later
  app.innerHTML = renderApp(state, { footprint, recommendations, trend, forecast });
  
  restoreFocus();
}

/**
 * Handles all button clicks and actions
 */
function handleClick(event) {
  const viewButton = event.target.closest("[data-view]");
  if (viewButton) {
    store.dispatch({ type: "SET_VIEW", view: viewButton.dataset.view });
    render(); // Update UI to show the new view
    focusMain();
    return;
  }

  const button = event.target.closest("[data-action]");
  if (!button) return;

  const { action } = button.dataset;
  
  if (action === "toggle-theme") {
    store.dispatch({ 
      type: "SET_THEME", 
      theme: store.getState().theme === "dark" ? "light" : "dark" 
    });
    render(); // Update UI to reflect the theme change
  }
  
  if (action === "update-goal") {
    store.dispatch({ 
      type: "UPDATE_GOAL", 
      id: button.dataset.id, 
      delta: Number(button.dataset.delta || 0) 
    });
    render(); // Update UI to show new goal progress
  }
  
  if (action === "remove-goal") {
    store.dispatch({ type: "REMOVE_GOAL", id: button.dataset.id });
    render(); // Update UI to remove the goal card
  }
  
  if (action === "toggle-challenge") {
    store.dispatch({ type: "TOGGLE_CHALLENGE", id: button.dataset.id });
    render(); // Update UI to show challenge status
  }
  
  if (action === "advance-challenge") {
    store.dispatch({ type: "ADVANCE_CHALLENGE", id: button.dataset.id });
    render(); // Update UI to show challenge progress
  }
  
  if (action === "education-category") {
    store.dispatch({ type: "SET_EDUCATION_CATEGORY", value: button.dataset.category });
    render(); // Update UI to show the selected category
  }
  
  if (action === "reset-sample") {
    store.dispatch({ type: "RESET_SAMPLE" });
    render(); // Update UI to clear all data
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
