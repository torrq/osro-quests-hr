
<p align="center"><img width="340" height="125" alt="osro_quests_logo_v3" src="https://github.com/user-attachments/assets/7dfd1268-7c1b-44ee-adbe-c90a1ae22a60" />
</p>

# OSRO Quests 

A web-based quest, material and autoloot management tool for [OSRO Highrate](https://osro.gg). Organize quests, track materials needed for crafting chains, generate @alootid2 commands, and calculate total resource costs with ease.

<h1 align="center">
   Try it now! 🔗 <a href="https://torrq.github.io/osro-quests-hr">OSRO Quests: Highrate</a>
</h1>
<p>&nbsp;</p>
<p align="center">
  <img width="1311" height="578" alt="image" src="https://github.com/user-attachments/assets/07a6e8ab-7610-470e-8bb0-62fb0e7f5ad6" />
</p>

## ✨ Features

- **Quest Organization**: Organize quests into groups and subgroups for easy navigation
- **Material Tracking**: Track all materials needed for each quest
- **Crafting Chain Analysis**: Automatically calculate material requirements across linked quests
- **Multiple Currency Support**: Support for Zeny, Gold, Credits, and various point systems
- **Item Management**: Create and manage item catalogs with zeny values
- **Material Breakdown Tree**: Visualize the complete material tree with multiple crafting options
- **Summary Calculator**: Get total material costs with zeny value conversions
- **Search & Filter**: Quickly find quests and items with built-in search
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Import/Export**: Save your quest data as JSON or import from others
- **Drag & Drop**: Reorder quests within subgroups for organization

## 🧪 Lab (Timers)

The Lab tab hosts persistent background timers that survive browser close, backed by push notifications via Cloudflare Worker + Upstash QStash.

| Tab | Timer | Purpose |
|-----|-------|---------|
| Guild Contribution (`lab-gc`) | 6 hours | NPC rotation refresh reminder |
| Gem Quest (`lab-gem`) | 24 hours | Per-account gem quest cooldown |
| Credit Agent (`lab-credit`) | 24 hours | Per-account credit NPC cooldown |

Each lab module supports multiple accounts, per-timer notify toggles, a drag slider for manual adjustment, and cloud-scheduled push notifications that fire even when the browser is closed.

### Push Notification Architecture

```
Browser → Cloudflare Worker (osro-push-worker) → Upstash QStash → Mozilla Push Service → sw.js
```

- **`sw.js`** (repo root): Service worker that handles `push` events and `notificationclick`. Clicking a notification navigates to the correct `?tab=lab-*` URL.
- **`js/main.js`**: Exports `osroScheduleCloudPush(timerId, delaySeconds, payload)`, `osroCancelCloudPush(messageId)`, `osroEnsureNotifyPermission()`, and `osroNotifyTitle(section)` — all consumed by lab modules.
- **Cloudflare Worker** (`osro-push-worker`, separate repo): Routes `/schedule` → QStash, `/cancel` → QStash delete, `/webhook` → `web-push` delivery. Env vars: `QSTASH_TOKEN`, `QSTASH_URL`, `QSTASH_MESSAGES_URL`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `INTERNAL_SECRET`.
- **QStash region**: must match the token's region (e.g. `qstash-us-east-1.upstash.io`). `Upstash-Delay` is in **seconds**.

### Notification assets

- Icon/badge: `image/favicon.png` (16×16, upscaled by browser)
- Preview image: `image/osro_quests_logo_v3.png` (340×125, shown in notification body on Chrome/Android)

## 📊 Quest Editor Features

### Basic Information
- Quest name
- Produced item (ID and name)
- Success rate percentage
- Account-bound flag
- Description/effects

### Requirements
Add multiple requirement types:
- **Items**: With quantities and immunity flags
- **Zeny**: Direct currency cost
- **Gold/Credits**: Convertible currencies
- **Points**: Various point types (Vote, Hourly, Activity, etc.)

### Material Analysis
- **Breakdown Tree**: Shows all materials needed with multipliers for success rates
- **Summary View**: Complete material list with total zeny values
- **Multi-option Support**: Handles items that can be crafted through different quest chains

## 📱 Mobile Support

The app is fully responsive and optimized for mobile devices:
- Collapsible sidebar with hamburger menu
- Touch-friendly interface
- Proper spacing and padding for comfortable scrolling

## 🛠️ Development

### Local Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/torrq/osro-quests-hr.git
   cd osro-quests-hr
   ```

2. Open `index.html` in a web browser or use a local server:
   ```bash
   python -m http.server 8000
   # or
   npx http-server
   ```

3. Navigate to `http://localhost:8000`

### Adding a new Lab module

1. Create `js/lab-mymodule.js`. At the bottom, call:
   ```js
   window.registerLabExperiment?.('lab-mymodule', {
     tabId:       'lab-mymodule',
     title:       'My Module',
     sidebarLabel:'My Module',
     sidebarIcon: '🔧',
     renderMain:  myModuleRenderMain,
   });
   ```
2. Add `<script src="js/lab-mymodule.js"></script>` to `index.html` after `lab.js`.
3. For push notifications, use the helpers from `main.js`:
   - `osroNotifyTitle('My Section')` → standardized title string
   - `osroScheduleCloudPush(id, delaySeconds, { title, body, url })` → returns `messageId`
   - `osroCancelCloudPush(messageId)` → cancels a pending push
   - Store `cloudMessageId` on your timer state object and null it after cancel/fire.

## 🔧 Technologies

- **HTML5**: Semantic markup
- **CSS3**: Responsive grid and flexbox layout with CSS variables
- **Vanilla JavaScript**: No dependencies, pure JavaScript implementation
- **Cloudflare Workers**: Serverless push proxy (separate repo: `osro-push-worker`)
- **Upstash QStash**: Delayed message queue for persistent timers
- **Web Push API**: Browser push notifications via service worker

## 📝 License

This project is provided as-is for the OSRO community. Check the LICENSE file for details.

## 🤝 Contributing

Found a bug or have a feature idea? Feel free to open an issue or submit a pull request!

## 📧 Support

For questions or issues, please open a GitHub issue or contact the maintainers.
