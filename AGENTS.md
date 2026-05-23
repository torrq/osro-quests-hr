# AGENTS.md — Context for LLM-assisted development

This document is for AI coding assistants working on this repo. Read it before touching anything.

---

## What this is

A static single-page app (GitHub Pages, no build step) for OSRO Highrate — a Ragnarok Online private server. It helps players manage quests, materials, autoloot, and account cooldown timers. All data lives in `localStorage`; quest/item data auto-imports from JSON files in `data/`.

**Live URL:** `https://torrq.github.io/osro-quests-hr/`  
**No framework. No bundler. No npm.** Vanilla JS, HTML, CSS only.

---

## File map

```
index.html          — single HTML shell; loads all scripts and CSS
css/
  style.css         — base styles + CSS variables
  style_dark.css    — dark theme overrides
  style_light.css   — light theme overrides
js/
  config.js         — VERSION, FILES, LOCAL_STORAGE keys, value constants (load first)
  main.js           — app state, render, routing, notify/push helpers, window exports
  lab.js            — lab experiment registry (loadLabData, saveLabData, registerLabExperiment)
  lab-gc.js         — Guild Contribution timer (6h, single timer)
  lab-gem.js        — Gem Quest timer (24h, per-account)
  lab-credit.js     — Credit Agent timer (24h, per-account)
  quests.js         — quest editor and material tree
  shops.js          — shop viewer
  autoloot.js       — @alootid2 command builder
  groups.js         — group/subgroup management
  items.js          — item catalog
  svg.js            — SVG icon helpers
sw.js               — service worker: handles push events and notificationclick
image/
  favicon.png       — 16×16, used as notification icon and badge
  osro_quests_logo_v3.png — 340×125, used as notification image
```

**`osro-push-worker`** is a separate Cloudflare Worker repo (not here). It handles `/schedule`, `/cancel`, and `/webhook` routes.

---

## localStorage keys

Defined in `config.js` as `LOCAL_STORAGE`:

| Key constant | Storage key | Contents |
|---|---|---|
| `config` | `osrohr_config` | user config object |
| `theme` | `osrohr_theme` | `'dark'` or `'light'` |
| `autoloot_data` | `osrohr_autoloot_data` | autoloot item sets |
| `autoloot_names` | `osrohr_autoloot_names` | set name map |
| `item_values` | `osrohr_item_values` | item zeny value overrides |
| `lab_data` | `osrohr_lab_data` | all lab timer state (shared flat object patched via `saveLabData`) |

---

## Lab timer system

All three lab modules share a single `osrohr_lab_data` key via `loadLabData()` / `saveLabData(patch)` from `lab.js`. Each lab writes its own keys into this flat object.

### Timer state shape (per-account modules: gem, credit)
```js
{
  id: string,               // unique ID
  name: string,             // display name e.g. "Account 1"
  startedAt: number|null,   // Date.now() when started
  finishedAt: number|null,  // set when timer completes
  notifyOnDone: boolean,
  notifiedForFinishedAt: number|null,  // prevents double-notify
  cloudMessageId: string|null,         // QStash message ID for cancellation
}
```

### Timer durations
- `GC_REFRESH_MS` = 6h (`lab-gc.js`)
- `GEM_TIMER_MS` = 24h (`lab-gem.js`)
- `CA_TIMER_MS` = 24h (`lab-credit.js`)

### Push notification helpers (all on `window`, defined in `main.js`)

```js
// Standardised notification title — always use this, never hardcode
osroNotifyTitle(section: string) => `OSRO Quests (HR) - ${section}`

// Request/check browser notification permission + subscribe to push
osroEnsureNotifyPermission() => Promise<boolean>

// Schedule a cloud push via Cloudflare Worker → QStash
// payload must include { title, body, url }
// url must be the full absolute URL: https://torrq.github.io/osro-quests-hr/?tab=lab-*
osroScheduleCloudPush(timerId, delayInSeconds, payload) => Promise<string|null>  // returns messageId

// Cancel a pending QStash message
osroCancelCloudPush(messageId) => void

// Fire an immediate local notification (in-browser only, no SW)
osroFireNotification({ section, body, tag, url }) => void
osroNotifyReady({ section, body, tag, url }) => void
```

### Rules when touching lab timers

- **Always cancel** `cloudMessageId` before starting, stopping, resetting, or slider-adjusting a timer. Null it out afterward.
- **Start functions must be `async`** when calling `osroScheduleCloudPush`.
- **Slider commits**: cancel unconditionally at top, reschedule (fire-and-forget `.then()`) only if `remaining > 0`. Re-read from storage inside the `.then()` to avoid clobbering concurrent saves.
- **`gemSetNotifyOnDone` / `gcSetNotifyOnDone`**: if enabling with a currently-running timer, compute `remaining = DURATION - (Date.now() - startedAt)` and schedule for that remaining time. If disabling, cancel.
- `osroScheduleCloudPush` always fetches the live push subscription from `navigator.serviceWorker.ready` + `pushManager.getSubscription()` — do not pass or cache the subscription object yourself.

---

## Push notification flow

```
Lab module → osroScheduleCloudPush(id, delaySeconds, { title, body, url })
  → POST https://osro-push-worker.osro-push-worker.workers.dev/schedule
  → QStash queues message with Upstash-Delay (seconds, not ms)
  → After delay, QStash POSTs to /webhook
  → Cloudflare Worker calls web-push → Mozilla Push Service
  → sw.js push event fires → showNotification
  → User clicks → notificationclick reads data.url → opens correct tab URL
```

**`sw.js` notification data object:**
```js
data: {
  dateOfArrival: Date.now(),
  primaryKey: 'osro-timer',
  url: data.url || 'https://torrq.github.io/osro-quests-hr/'
}
```

**Image paths in `sw.js`** (absolute, relative to GitHub Pages root):
```
/osro-quests-hr/image/favicon.png          (icon + badge)
/osro-quests-hr/image/osro_quests_logo_v3.png  (image)
```

---

## Cloudflare Worker (`osro-push-worker`) — separate repo

Routes:
- `POST /schedule` — accepts `{ subscription, delay, payload }`, forwards to QStash with `Upstash-Delay: ${delay}s`
- `POST /cancel` — accepts `{ messageId }`, deletes from QStash
- `POST /webhook` — called by QStash; validates `Authorization: Bearer INTERNAL_SECRET`, calls `webpush.sendNotification`

Required env vars: `QSTASH_TOKEN`, `QSTASH_URL` (e.g. `https://qstash-us-east-1.upstash.io/v2/publish/`), `QSTASH_MESSAGES_URL`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `INTERNAL_SECRET`.

QStash region must match the token's region. `wrangler.jsonc` sets `nodejs_compat` flag (required for `web-push`).

---

## Adding a new Lab module

1. Create `js/lab-mymodule.js`.
2. At the bottom, register:
   ```js
   window.registerLabExperiment?.('lab-mymodule', {
     tabId:        'lab-mymodule',
     title:        'My Module',       // UI label (plain string, not osroNotifyTitle)
     sidebarLabel: 'My Module',
     sidebarIcon:  '🔧',
     renderMain:   myModuleRenderMain,
   });
   ```
3. Add `<script src="js/lab-mymodule.js"></script>` in `index.html` after `lab.js`.
4. Use `loadLabData()` / `saveLabData(patch)` for persistence.
5. For push: follow the cancel-then-schedule pattern in the existing lab files. Notification URL must be `https://torrq.github.io/osro-quests-hr/?tab=lab-mymodule`.

---

## Things to be careful about

- **No build step** — changes to JS/CSS are live immediately after push. Don't introduce imports or module syntax.
- **`Upstash-Delay` is in seconds** — passing milliseconds silently schedules 1000+ days in the future.
- **QStash region** — the worker URL must match the token's region or all requests 401.
- **Stale subscriptions** — always use `pushManager.getSubscription()` live, never cache in localStorage.
- **Silent notification failures** — invalid icon paths cause browsers to drop notifications with no error. All image paths must resolve correctly at the GitHub Pages URL.
- **`registerLabExperiment` title** — plain string for the UI label. Only push payload `title` fields should use `osroNotifyTitle()`.
- **CRLF line endings** — existing files use CRLF. Avoid converting to LF if editing on Windows.
