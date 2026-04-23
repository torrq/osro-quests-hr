// lab.js — Lab Tab: Guild Contribution Tracker + future utilities

// ===== GUILD CONTRIBUTION DATA =====

const GC_ITEMS = [
  { id: 678,   amount: 25,  name: 'Poison Bottle' },
  { id: 7139,  amount: 50,  name: 'Glistening Coat' },
  { id: 607,   amount: 50,  name: 'Yggdrasil Berry' },
  { id: 608,   amount: 50,  name: 'Yggdrasil Seed' },
  { id: 610,   amount: 50,  name: 'Yggdrasil Leaf' },
  { id: 504,   amount: 100, name: 'White Potion' },
  { id: 505,   amount: 100, name: 'Blue Potion' },
  { id: 12028, amount: 50,  name: 'Box of Thunder' },
  { id: 12114, amount: 50,  name: 'Fire Elemental Converter' },
  { id: 12115, amount: 50,  name: 'Water Elemental Converter' },
  { id: 12116, amount: 50,  name: 'Earth Elemental Converter' },
  { id: 12117, amount: 50,  name: 'Wind Elemental Converter' },
  { id: 4002,  amount: 10,  name: 'Fabre Card' },
  { id: 4003,  amount: 10,  name: 'Pupa Card' },
  { id: 4006,  amount: 10,  name: 'Lunatic Card' },
  { id: 4008,  amount: 10,  name: 'Picky Card' },
  { id: 4009,  amount: 10,  name: 'Chonchon Card' },
  { id: 4010,  amount: 10,  name: 'Willow Card' },
  { id: 4021,  amount: 10,  name: 'Rocker Card' },
  { id: 969,   amount: 100, name: 'Gold' },
  { id: 7444,  amount: 100, name: 'Treasure Box' },
  { id: 7035,  amount: 5,   name: 'Matchstick' },
  { id: 7289,  amount: 5,   name: 'Peridot' },
  { id: 7297,  amount: 5,   name: 'Biotite' }
];

const GC_REFRESH_MS  = 6 * 60 * 60 * 1000; // 6 hours
const LAB_STORAGE_KEY = 'osromr_lab_v1';

let gcTimerInterval = null;

// ===== STORAGE =====

function loadLabData() {
  try {
    return JSON.parse(localStorage.getItem(LAB_STORAGE_KEY)) || {};
  } catch { return {}; }
}

function saveLabData(patch) {
  const cur = loadLabData();
  localStorage.setItem(LAB_STORAGE_KEY, JSON.stringify({ ...cur, ...patch }));
}

// ===== RENDER =====

function renderLabSidebar() {
  const el = document.getElementById('labList');
  if (!el) return;
  el.innerHTML = `
    <div class="lab-sidebar-content">
      <div class="lab-sidebar-section active">
        <span class="lab-sidebar-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 3h6M8 3l-4 9h16L16 3"/><path d="M4 12c0 4.4 3.6 8 8 8s8-3.6 8-8"/>
            <circle cx="9" cy="17" r="1" fill="currentColor" stroke="none" opacity="0.6"/>
            <circle cx="14" cy="15" r="1.2" fill="currentColor" stroke="none" opacity="0.5"/>
            <circle cx="16" cy="18" r="0.8" fill="currentColor" stroke="none" opacity="0.4"/>
          </svg>
        </span>
        Guild Contribution
      </div>
    </div>`;
}

function renderLabMain() {
  const container = document.getElementById('mainContent');
  if (!container) return;

  const data    = loadLabData();
  const selected = new Set(data.gcSelected || []);
  const timerStart = data.gcTimerStart || null;

  // Build items HTML
  const itemsHtml = GC_ITEMS.map(item => {
    const name = (DATA.items?.[item.id]?.name) || item.name;
    const icon = renderItemIcon(item.id, 48);
    const isSelected = selected.has(item.id);
    return `
      <div class="gc-card ${isSelected ? 'gc-card--on' : ''}" onclick="gcToggleItem(${item.id})" title="${name}">
        <div class="gc-card-icon">${icon}</div>
        <div class="gc-card-amt">×${item.amount}</div>
        <div class="gc-card-name">${name}</div>
        <div class="gc-card-id">#${item.id}</div>
      </div>`;
  }).join('');

  container.innerHTML = `
    <div class="lab-main">
      <div class="lab-section">

        <div class="lab-section-header">
          <div class="lab-section-title">
            <svg class="lab-section-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 3h6M8 3l-4 9h16L16 3"/><path d="M4 12c0 4.4 3.6 8 8 8s8-3.6 8-8"/>
              <circle cx="9" cy="17" r="1" fill="currentColor" stroke="none"/>
              <circle cx="14" cy="15" r="1.2" fill="currentColor" stroke="none"/>
              <circle cx="16" cy="18" r="0.8" fill="currentColor" stroke="none"/>
            </svg>
            Guild Contribution
          </div>
          <div class="lab-section-meta">Refreshes every 6 hours from NPC access · 6 items per rotation</div>
        </div>

        <div class="gc-timer-row">
          <div class="gc-timer-block">
            <div class="gc-timer-label">NPC Timer</div>
            <div class="gc-timer-display" id="gcTimerDisplay">—</div>
          </div>
          <div class="gc-timer-actions">
            <button class="btn btn-primary btn-sm" onclick="gcStartTimer()" title="I just accessed the NPC — start 6h countdown">
              Accessed NPC
            </button>
            <button class="btn btn-sm" onclick="gcClearTimer()" title="Clear timer">
              Clear
            </button>
          </div>
        </div>

        <div class="gc-controls">
          <span class="gc-selection-count" id="gcSelCount">${selected.size} / 6 selected</span>
          <button class="btn btn-sm" onclick="gcClearSelection()">Clear Selection</button>
        </div>

        <div class="gc-grid" id="gcGrid">
          ${itemsHtml}
        </div>

        <div class="lab-add-item-row">
          <span class="settings-sublabel">Missing an item?</span>
          <button class="btn btn-sm" onclick="gcShowAddItem()">+ Add Item</button>
        </div>
        <div id="gcAddItemPanel" style="display:none;" class="gc-add-panel">
          <input type="number" id="gcAddId" class="search-input" placeholder="Item ID" style="width:110px;">
          <input type="number" id="gcAddAmt" class="search-input" placeholder="Amount" style="width:90px;">
          <button class="btn btn-primary btn-sm" onclick="gcAddItem()">Add</button>
          <button class="btn btn-sm" onclick="gcHideAddItem()">Cancel</button>
        </div>

      </div>
    </div>`;

  gcStartTickerIfNeeded(timerStart);
}

// ===== TIMER =====

function gcStartTimer() {
  const now = Date.now();
  saveLabData({ gcTimerStart: now });
  gcStartTickerIfNeeded(now);
  renderLabMain();
}

function gcClearTimer() {
  saveLabData({ gcTimerStart: null });
  clearInterval(gcTimerInterval);
  gcTimerInterval = null;
  const el = document.getElementById('gcTimerDisplay');
  if (el) el.textContent = '—';
}

function gcStartTickerIfNeeded(timerStart) {
  clearInterval(gcTimerInterval);
  gcTimerInterval = null;
  if (!timerStart) return;

  function tick() {
    const el = document.getElementById('gcTimerDisplay');
    if (!el) { clearInterval(gcTimerInterval); return; }
    const elapsed = Date.now() - timerStart;
    const remaining = GC_REFRESH_MS - elapsed;
    if (remaining <= 0) {
      el.textContent = 'Ready!';
      el.classList.add('gc-timer--ready');
      el.classList.remove('gc-timer--warn');
      clearInterval(gcTimerInterval);
      gcTimerInterval = null;
    } else {
      const h = Math.floor(remaining / 3600000);
      const m = Math.floor((remaining % 3600000) / 60000);
      const s = Math.floor((remaining % 60000) / 1000);
      el.textContent = `${h}h ${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`;
      el.classList.toggle('gc-timer--warn', remaining < 30 * 60 * 1000);
      el.classList.remove('gc-timer--ready');
    }
  }
  tick();
  gcTimerInterval = setInterval(tick, 1000);
}

// ===== ITEM TOGGLE =====

function gcToggleItem(id) {
  const data = loadLabData();
  const selected = new Set(data.gcSelected || []);
  if (selected.has(id)) {
    selected.delete(id);
  } else {
    selected.add(id);
  }
  saveLabData({ gcSelected: [...selected] });

  // Update DOM directly (avoid full re-render so timer keeps ticking)
  const card = document.querySelector(`.gc-card[onclick="gcToggleItem(${id})"]`);
  if (card) card.classList.toggle('gc-card--on', selected.has(id));
  const cnt = document.getElementById('gcSelCount');
  if (cnt) cnt.textContent = `${selected.size} / 6 selected`;
}

function gcClearSelection() {
  saveLabData({ gcSelected: [] });
  document.querySelectorAll('.gc-card').forEach(c => c.classList.remove('gc-card--on'));
  const cnt = document.getElementById('gcSelCount');
  if (cnt) cnt.textContent = '0 / 6 selected';
}

// ===== ADD CUSTOM ITEM =====

function gcShowAddItem() {
  const p = document.getElementById('gcAddItemPanel');
  if (p) p.style.display = 'flex';
}

function gcHideAddItem() {
  const p = document.getElementById('gcAddItemPanel');
  if (p) p.style.display = 'none';
}

function gcAddItem() {
  const idEl  = document.getElementById('gcAddId');
  const amtEl = document.getElementById('gcAddAmt');
  const id  = parseInt(idEl?.value);
  const amt = parseInt(amtEl?.value);
  if (!id || isNaN(id) || id <= 0) { showToast('Enter a valid item ID', 'error'); return; }
  if (!amt || isNaN(amt) || amt <= 0) { showToast('Enter a valid amount', 'error'); return; }
  if (GC_ITEMS.find(i => i.id === id)) { showToast('Item already in list', 'warning'); return; }

  const name = DATA.items?.[id]?.name || `Item #${id}`;
  GC_ITEMS.push({ id, amount: amt, name });
  if (idEl)  idEl.value  = '';
  if (amtEl) amtEl.value = '';
  gcHideAddItem();
  renderLabMain();
  showToast(`Added ${name}`, 'success');
}

// ===== WINDOW EXPORTS =====

window.renderLabSidebar  = renderLabSidebar;
window.renderLabMain     = renderLabMain;
window.gcToggleItem      = gcToggleItem;
window.gcClearSelection  = gcClearSelection;
window.gcStartTimer      = gcStartTimer;
window.gcClearTimer      = gcClearTimer;
window.gcShowAddItem     = gcShowAddItem;
window.gcHideAddItem     = gcHideAddItem;
window.gcAddItem         = gcAddItem;
