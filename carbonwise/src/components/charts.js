import { e, formatKg, formatPercent } from "./format.js";

const COLORS = ["#1d7874", "#3a86ff", "#f6ae2d", "#d1495b", "#6d597a"];

export function renderDonut(breakdown) {
  let start = 0;
  const segments = breakdown.map((item, index) => {
    const end = start + item.percent;
    const segment = `${COLORS[index % COLORS.length]} ${start}% ${end}%`;
    start = end;
    return segment;
  }).join(", ");
  const background = segments || "#d8dee4 0 100%";

  return `
    <div class="donut-wrap">
      <div class="donut" style="--donut:${e(background)}" aria-label="Category emission share chart"></div>
      <div class="breakdown-tiles" role="list" aria-label="Category emission tiles">
        ${breakdown.map((item, index) => `
          <article class="breakdown-tile" role="listitem" style="--tile-color:${COLORS[index % COLORS.length]}">
            <span class="tile-swatch" aria-hidden="true"></span>
            <span class="tile-label">${e(item.label)}</span>
            <strong>${formatPercent(item.percent)}</strong>
            <small>${formatKg(item.kg)} / mo</small>
          </article>
        `).join("")}
      </div>
    </div>
  `;
}

export function renderCategoryBars(breakdown) {
  const max = Math.max(...breakdown.map((item) => item.kg), 1);
  return `
    <div class="category-bars" aria-label="Monthly emissions by category">
      ${breakdown.map((item, index) => `
        <div class="bar-row">
          <div class="bar-label">
            <span>${e(item.label)}</span>
            <strong>${formatKg(item.kg)}</strong>
          </div>
          <div class="bar-track">
            <span class="bar-fill" style="--bar-color:${COLORS[index % COLORS.length]}; --bar-width:${Math.max(4, (item.kg / max) * 100)}%"></span>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

export function renderTrendChart(data, title = "Emission trend") {
  const values = data.map((point) => point.kg);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(max - min, 1);
  const width = 620;
  const height = 220;
  const points = data.map((point, index) => {
    const x = 34 + index * ((width - 68) / Math.max(data.length - 1, 1));
    const y = height - 34 - ((point.kg - min) / range) * (height - 68);
    return `${round(x)},${round(y)}`;
  }).join(" ");

  return `
    <figure class="line-chart" aria-label="${e(title)}">
      <svg viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="trend-title">
        <title id="trend-title">${e(title)}</title>
        <path class="chart-grid" d="M34 42H586M34 109H586M34 176H586"></path>
        <polyline class="trend-line" points="${points}"></polyline>
        ${data.map((point, index) => {
          const [x, y] = points.split(" ")[index].split(",");
          return `<circle class="trend-dot" cx="${x}" cy="${y}" r="5"><title>${e(point.label)}: ${formatKg(point.kg)}</title></circle>`;
        }).join("")}
        ${data.map((point, index) => {
          const x = 34 + index * ((width - 68) / Math.max(data.length - 1, 1));
          return `<text class="axis-label" x="${round(x)}" y="210" text-anchor="middle">${e(point.label)}</text>`;
        }).join("")}
      </svg>
    </figure>
  `;
}

export function renderForecastCards(forecast) {
  const first = forecast[0]?.kg || 0;
  return `
    <div class="forecast-grid">
      ${forecast.slice(1).map((point) => {
        const saved = Math.max(0, first - point.kg);
        return `
          <div class="forecast-card">
            <span>${e(point.label)}</span>
            <strong>${formatKg(point.kg)}</strong>
            <small>${formatKg(saved)} avoided</small>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function round(value) {
  return Math.round(value * 10) / 10;
}
