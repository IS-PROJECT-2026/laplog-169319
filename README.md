# LapLog — Workout Tracker

A lightweight, static workout tracker. Log sets (exercise, weight, reps), see
your current logging streak, a 7-day training volume chart, and a running
history — all stored locally in the browser via `localStorage`.

## Features

- **Session clock** — tracks time elapsed since your first logged set today.
- **Lap track** — a visual progress bar that fills as you log sets in a session.
- **Streak counter** — consecutive days with at least one logged set.
- **7-day volume chart** — total `weight × reps` per day, last 7 days.
- **History list** — every set you've logged, most recent first.

## Live demo

[View LapLog live](https://IS-PROJECT-2026.github.io/laplog-169319/)

## Project structure

\`\`\`
index.html   — markup and layout
style.css    — theme, layout, component styles
script.js    — data layer, rendering, event handlers
\`\`\`

## Roadmap

- [x] Core logging (exercise, weight, reps)
- [x] Session clock and lap-track progress indicator
- [x] Streak tracking
- [x] 7-day volume chart
- [x] Personal record badges
- [ ] Export history as CSV
- [ ] Per-exercise progress graphs


## Tech

Plain HTML, CSS, and JavaScript — no build step, no framework, no backend.
Deployed as a static site via GitHub Pages directly from `main`.

## Running locally

Clone the repo and open `index.html` in a browser, or serve it with any
static file server, e.g.:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Data & privacy

All data is stored in your browser's `localStorage` under the key
`laplog:sets`. Nothing is sent to a server. Clearing your browser data or
using a different browser/device will not carry your history over.