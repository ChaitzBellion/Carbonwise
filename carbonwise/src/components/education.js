import { educationArticles } from "../domain/mockData.js";
import { icon } from "./icons.js";
import { e } from "./format.js";

export function renderEducation(state) {
  const categories = ["All", ...new Set(educationArticles.map((article) => article.category))];
  const query = state.educationSearch.toLowerCase();
  const activeCategory = state.educationCategory;
  const results = educationArticles.filter((article) => {
    const categoryMatch = activeCategory === "All" || article.category === activeCategory;
    const queryMatch = !query
      || article.title.toLowerCase().includes(query)
      || article.summary.toLowerCase().includes(query)
      || article.tips.some((tip) => tip.toLowerCase().includes(query));
    return categoryMatch && queryMatch;
  });

  return `
    <section class="view-grid education-grid" aria-labelledby="education-title">
      <div class="page-heading">
        <p class="eyebrow">Educational hub</p>
        <h1 id="education-title">Sustainable habits library</h1>
        <p>${results.length} guides matched across practical carbon reduction topics.</p>
      </div>

      <section class="panel wide filters" aria-label="Education filters">
        <label class="search-field">
          ${icon("search")}
          <span class="sr-only">Search sustainability guides</span>
          <input type="search" placeholder="Search guides" value="${e(state.educationSearch)}" data-action="education-search">
        </label>
        <div class="category-tabs" role="tablist" aria-label="Education categories">
          ${categories.map((category) => `
            <button
              type="button"
              class="tab-button ${category === activeCategory ? "active" : ""}"
              data-action="education-category"
              data-category="${e(category)}"
            >${e(category)}</button>
          `).join("")}
        </div>
      </section>

      <section class="article-grid wide" aria-label="Sustainability articles">
        ${results.length === 0 ? `
          <div class="empty-state panel">
            <h2>No guides found</h2>
            <p>Try a different category or search term.</p>
          </div>
        ` : results.map(renderEducationCard).join("")}
      </section>
    </section>
  `;
}

function renderEducationCard(article) {
  return `
    <a href="${article.url}" 
       target="_blank" 
       rel="noopener noreferrer" 
       class="education-link-wrapper" 
       style="text-decoration: none; color: inherit; display: block;">
       
      <article class="education-card" style="cursor: pointer; transition: transform 0.2s ease;">
        <div class="education-card-content">
          <span class="pill">${article.category} · ${article.duration}</span>
          <h2>${article.title}</h2>
          <p>${article.description}</p>
        </div>
        <div class="education-card-footer" style="margin-top: 1rem; color: var(--primary-color); font-weight: bold;">
          Read full article →
        </div>
      </article>
      
    </a>
  `;
}
