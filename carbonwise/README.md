# CarbonWise

CarbonWise is a production-ready static web app for calculating, tracking, and reducing a personal carbon footprint. It includes a calculator, sustainability dashboard, AI-style recommendations, goals, challenges, analytics, and an educational hub.

## Features

- Carbon footprint calculator across transportation, home energy, food, shopping, and waste.
- Personalized dashboard with carbon score, top emission sources, trends, and impact summaries.
- Prioritized recommendations with estimated monthly carbon savings.
- Goal tracking with progress bars and milestone signals.
- Weekly and monthly sustainability challenges, streaks, badges, and score.
- Searchable education hub with articles, quick tips, and reduction guides.
- Responsive light and dark mode interface.
- Input validation, sanitized persistence, XSS-safe rendering, and security headers in the local server.
- Unit, component, and utility tests using the built-in Node test runner.

## Quick Start

```bash
npm.cmd run dev
```

Then open [http://localhost:4173](http://localhost:4173).

If you are using a shell where `npm` is not blocked, `npm run dev` also works.

## Tests

```bash
npm.cmd test
npm.cmd run lint
```

The test suite covers calculator totals, validation/sanitization, recommendations, and component rendering behavior.

## Project Structure

```text
src/
  components/      UI render modules and chart helpers
  domain/          Carbon math, recommendation logic, validation, and mock data
  state/           Reducer store and guarded local storage
  main.js          App bootstrap and event delegation
tests/             Node test runner tests
server.js          Local static server with security headers
```

## Emission Model

CarbonWise uses transparent sample emission factors to estimate kilograms of CO2e. These are intended for product demonstration and education. For regulated reporting or jurisdiction-specific calculations, replace `src/domain/carbonCalculator.js` factors with audited regional datasets.

## Security Notes

- No remote scripts or third-party runtime dependencies.
- User inputs are clamped, validated, and sanitized before state updates.
- Stored state is schema-checked before it is trusted.
- Dynamic UI text is escaped before rendering.
- The local server sets `nosniff`, frame, referrer, permissions, and cache headers.
- The app avoids secrets and environment-specific credentials.

## Deployment

This app is static and can be deployed to Netlify, Vercel, GitHub Pages, Cloudflare Pages, S3, or any web server.

1. Upload the contents of this folder.
2. Configure the host to serve `index.html` for fallback navigation.
3. Add production headers matching or extending the headers in `server.js`.
4. Replace sample emission factors with region-specific production data if needed.

## Accessibility

The interface uses semantic landmarks, labeled form controls, keyboard-accessible controls, ARIA labels, high-contrast themes, reduced-motion support, and responsive layouts for desktop, tablet, and mobile.
