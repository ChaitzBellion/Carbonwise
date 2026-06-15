import { EMISSION_FACTORS } from "./carbonCalculator.js";

export function getMethodology() {
  return {
    referenceYearlyKg: EMISSION_FACTORS.referenceYearlyKg,
    transport: [
      ["Car travel", `${EMISSION_FACTORS.transport.carKgPerKm} kg CO2e per km`],
      ["Public transit", `${EMISSION_FACTORS.transport.publicTransitKgPerKm} kg CO2e per km`],
      ["Rideshare", `${EMISSION_FACTORS.transport.rideShareKgPerKm} kg CO2e per km`],
      ["Short flight", `${EMISSION_FACTORS.transport.shortFlightKg} kg CO2e per flight`],
      ["Long flight", `${EMISSION_FACTORS.transport.longFlightKg} kg CO2e per flight`],
    ],
    homeEnergy: [
      ["Electricity", `${EMISSION_FACTORS.homeEnergy.electricityKgPerKwh} kg CO2e per kWh`],
      ["Fuel", `${EMISSION_FACTORS.homeEnergy.fuelKgPerTherm} kg CO2e per therm`],
    ],
    notes: [
      "Values are estimation factors and should be localized for region-specific accuracy.",
      "Footprint results are directional decision-support outputs, not certified audits.",
    ],
  };
}