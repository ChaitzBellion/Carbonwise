import { escapeHtml } from "../domain/validators.js";

export const e = escapeHtml;

export function formatKg(value) {
  const number = Number(value) || 0;
  if (number >= 1000) {
    return `${(number / 1000).toFixed(1)} t`;
  }
  return `${Math.round(number)} kg`;
}

export function formatExactKg(value) {
  return `${Math.round(Number(value) || 0).toLocaleString()} kg CO2e`;
}

export function formatPercent(value) {
  return `${Math.round(Number(value) || 0)}%`;
}

export function progressPercent(item) {
  if (!item || !item.target) {
    return 0;
  }
  return Math.min(100, Math.round((Number(item.current ?? item.progress ?? 0) / Number(item.target)) * 100));
}

export function categoryClass(category) {
  const normalized = String(category || "").toLowerCase().replace(/\s+/g, "-");
  return `tone-${normalized}`;
}

export function priorityLabel(priority) {
  if (priority === "high") return "High impact";
  if (priority === "medium") return "Medium impact";
  return "Quick win";
}

export function inputValue(value) {
  return Number.isFinite(Number(value)) ? String(value) : "0";
}
