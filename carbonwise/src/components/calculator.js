import { renderCategoryBars, renderDonut } from "./charts.js?v=tiles";
import { e, formatExactKg } from "./format.js";

export function renderCalculator(state, footprint) {
  const activity = state.activity;
  return `
    <section class="view-grid calculator-grid" aria-labelledby="calculator-title">
      <div class="page-heading">
        <p class="eyebrow">Footprint calculator</p>
        <h1 id="calculator-title">Model your daily activity</h1>
        <p>Fill out the details below and click the button to see your updated footprint.</p>
      </div>

      <section class="panel calculator-result" aria-label="Calculated footprint">
        <div>
          <p class="eyebrow">Total footprint</p>
          <strong>${formatExactKg(footprint.monthlyKg)}</strong>
          <span>${formatExactKg(footprint.yearlyKg)} yearly</span>
        </div>
        ${renderDonut(footprint.breakdown)}
      </section>

      <form class="panel calculator-form" data-action="calculator-form">
        ${renderTransportInputs(activity.transportation)}
        ${renderHomeInputs(activity.homeEnergy)}
        ${renderFoodInputs(activity.food)}
        ${renderShoppingInputs(activity.shopping)}
        ${renderWasteInputs(activity.waste)}
        
        <!-- NEW SUBMIT BUTTON BLOCK -->
        <div class="form-actions">
          <button type="submit" class="primary-button full-width">
            Update My Footprint & Charts
          </button>
        </div>
      </form>

      <section class="panel wide" aria-labelledby="calculator-breakdown-title">
        <div class="section-title">
          <div>
            <p class="eyebrow">Monthly estimate</p>
            <h2 id="calculator-breakdown-title">Category breakdown</h2>
          </div>
        </div>
        ${renderCategoryBars(footprint.breakdown)}
      </section>
    </section>
  `;
}

function renderTransportInputs(value) {
  return `
    <fieldset>
      <legend>Transportation</legend>
      <div class="field-grid">
        ${numberField("Car usage", "transportation", "carKmWeek", value.carKmWeek, "km/week")}
        ${numberField("Public transport", "transportation", "publicTransportKmWeek", value.publicTransportKmWeek, "km/week")}
        ${numberField("Ride-sharing", "transportation", "rideShareKmWeek", value.rideShareKmWeek, "km/week")}
        ${numberField("Short flights", "transportation", "shortFlightsYear", value.shortFlightsYear, "flights/year")}
        ${numberField("Long flights", "transportation", "longFlightsYear", value.longFlightsYear, "flights/year")}
      </div>
    </fieldset>
  `;
}

function renderHomeInputs(value) {
  return `
    <fieldset>
      <legend>Home Energy</legend>
      <div class="field-grid">
        ${numberField("Electricity", "homeEnergy", "electricityKwhMonth", value.electricityKwhMonth, "kWh/month")}
        ${numberField("Fuel consumption", "homeEnergy", "fuelThermsMonth", value.fuelThermsMonth, "therms/month")}
        ${numberField("Renewable energy", "homeEnergy", "renewablePercent", value.renewablePercent, "%")}
      </div>
       <!-- MOVE NOTE HERE: Outside the grid, but inside the fieldset -->
      <p style="
        grid-column: 1 / -1; 
        margin-top: 12px; 
        font-size: 0.8rem; 
        color: var(--muted); 
        display: flex; 
        align-items: center; 
        gap: 6px;
      ">
        <span style="font-style: normal;">💡</span> 
        <em>Note: 1 standard LPG cylinder (14.2kg) is approximately 6.3 therms.</em>
      </p>
    </fieldset>
  `;
}

function renderFoodInputs(value) {
  return `
    <fieldset>
      <legend>Food Consumption</legend>
      <div class="field-grid">
        <label class="field">
          <span>Diet pattern</span>
          <select data-action="activity-input" data-section="food" data-field="dietType">
            ${[
              ["vegan", "Vegan"],
              ["vegetarian", "Vegetarian"],
              ["mixed", "Mixed diet"],
              ["meatHeavy", "Meat-heavy diet"],
            ].map(([key, label]) => `<option value="${key}" ${value.dietType === key ? "selected" : ""}>${label}</option>`).join("")}
          </select>
        </label>
        ${numberField("Local or seasonal", "food", "localFoodPercent", value.localFoodPercent, "%")}
        ${numberField("Food waste", "food", "foodWasteMealsWeek", value.foodWasteMealsWeek, "meals/week")}
      </div>
    </fieldset>
  `;
}

function renderShoppingInputs(value) {
  return `
    <fieldset>
      <legend>Shopping Habits</legend>
      <div class="field-grid">
        ${numberField("Clothing", "shopping", "clothingSpendMonth", value.clothingSpendMonth, "$/month")}
        ${numberField("Electronics", "shopping", "electronicsSpendMonth", value.electronicsSpendMonth, "$/month")}
        ${numberField("General purchases", "shopping", "generalSpendMonth", value.generalSpendMonth, "$/month")}
        ${numberField("Secondhand share", "shopping", "secondhandPercent", value.secondhandPercent, "%")}
      </div>
    </fieldset>
  `;
}

function renderWasteInputs(value) {
  return `
    <fieldset>
      <legend>Waste Management</legend>
      <div class="field-grid">
        ${numberField("Waste generation", "waste", "wasteKgWeek", value.wasteKgWeek, "kg/week")}
        ${numberField("Recycling habits", "waste", "recyclingPercent", value.recyclingPercent, "%")}
        ${numberField("Composting", "waste", "compostPercent", value.compostPercent, "%")}
      </div>
    </fieldset>
  `;
}

/**
 * Updated numeric field to handle empty values and step correctly
 */
function numberField(label, section, field, value, suffix) {
  const id = `${section}-${field}`;
  const displayValue = (value !== undefined && value !== null) ? value : "";
  
  return `
    <label class="field" for="${id}">
      <span>${e(label)}</span>
      <span class="input-with-unit">
        <input
          id="${id}"
          type="number"
          inputmode="decimal"
          min="0"
          step="any"
          value="${displayValue}"
          data-action="activity-input"
          data-section="${e(section)}"
          data-field="${e(field)}"
        >
        <small>${e(suffix)}</small>
      </span>
    </label>
  `;
}