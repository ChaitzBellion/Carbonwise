const paths = {
  overview: "M4 13h7V4H4v9Zm9 7h7V4h-7v16ZM4 20h7v-5H4v5Z",
  calculator: "M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm2 4h8M8 11h2m4 0h2M8 15h2m4 0h2",
  goals: "M12 21a9 9 0 1 0-9-9h4a5 5 0 1 1 5 5v4Zm0-13v5l4 2",
  challenges: "M12 3 4 7v6c0 5 3.5 8 8 8s8-3 8-8V7l-8-4Zm-3 9 2 2 4-5",
  learn: "M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H7a3 3 0 0 0-3 3V5.5Zm3 13H20",
  analytics: "M4 19V5m0 14h16M8 16V9m4 7V6m4 10v-4",
  moon: "M21 13.2A7.7 7.7 0 0 1 10.8 3 9 9 0 1 0 21 13.2Z",
  sun: "M12 4V2m0 20v-2m8-8h2M2 12h2m13.7-5.7 1.4-1.4M4.9 19.1l1.4-1.4m0-11.4L4.9 4.9m14.2 14.2-1.4-1.4M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z",
  plus: "M12 5v14m-7-7h14",
  minus: "M5 12h14",
  trash: "M4 7h16m-10 4v6m4-6v6M9 7V4h6v3m-8 0 1 14h8l1-14",
  check: "M20 6 9 17l-5-5",
  bolt: "M13 2 4 14h7l-1 8 10-13h-7l1-7Z",
  leaf: "M20 4c-8 0-14 5-14 12 0 2 1 4 3 4 7 0 11-7 11-16ZM6 20c2-5 6-8 12-11",
  arrow: "M5 12h14m-6-6 6 6-6 6",
  search: "M11 19a8 8 0 1 1 5.7-2.3L21 21",
  shield: "M12 3 5 6v6c0 4.5 2.8 7.4 7 9 4.2-1.6 7-4.5 7-9V6l-7-3Z",
  reset: "M4 12a8 8 0 1 0 2.3-5.7M4 4v6h6",
};

export function icon(name, size = 18) {
  const path = paths[name] || paths.leaf;
  return `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${path}"/></svg>`;
}
