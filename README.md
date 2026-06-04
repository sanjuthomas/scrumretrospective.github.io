# Scrum Retrospective

Static web app for [scrumretrospective.org](https://scrumretrospective.org) — run lightweight scrum retrospectives in the browser with no accounts.

## Phase 1 (current)

- Landing page with **Initiate a Retrospective**
- Initiator sets their full name and retrospective title
- Session page with unique join link, copy button, and 20% participant sidebar
- Participants open the join link, enter their full name, and join the retro

## Development

```bash
npm install
npm run dev
```

This starts **two processes**:

1. **Web app** — [http://localhost:5173](http://localhost:5173)
2. **Sync API** — `http://localhost:8787` (proxied at `/api` for cross-browser rooms)

Join links work in Chrome, Safari, and other browsers on the same machine/network because room data lives on the sync server, not in each browser’s `localStorage`.

## Build & deploy (GitHub Pages)

```bash
npm run build
```

Deploy the `dist` folder to GitHub Pages. A `public/CNAME` file is included for the custom domain `scrumretrospective.org`.

### GitHub Actions (optional)

Push to `main` and enable Pages with the included workflow, or upload `dist` manually.

## Storage model

Retrospective state is stored on a small **sync API** (`server/index.mjs`) during development. The browser keeps an in-memory cache and polls every 1.5s so participant lists stay in sync across browsers.

For production, deploy the sync server (e.g. Railway, Fly.io, Render) and set `VITE_SYNC_API_URL` to that host at build time. GitHub Pages alone only serves the static UI.

## Routes

| Path | Purpose |
|------|---------|
| `/` | Landing |
| `/initiate` | Initiator setup form |
| `/retro/:id` | Active session |
| `/join/:id` | Participant join form |
