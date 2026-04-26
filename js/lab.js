// lab.js — Lab Tab: Guild Contribution Tracker + future utilities

const GC_REFRESH_MS   = 6 * 60 * 60 * 1000;
const LAB_STORAGE_KEY = 'osromr_lab_v1';
const SORT_AMT_ALPHA  = 'amt_alpha';
const SORT_ALPHA      = 'alpha';
const SORT_MANUAL     = 'manual';
const GC_SIZE_SMALL   = 'small';
const GC_SIZE_MEDIUM  = 'medium';
const GC_SIZE_LARGE   = 'large';
const GC_GROUP_ORDER  = { Consumable: 0, Card: 1, Loot: 2 };

let gcTimerInterval = null;

const GC_CARD_ART_IDS = new Set([4002, 4003, 4006, 4008, 4009, 4010, 4021]);

function renderGcItemVisual(itemId) {
  if (GC_CARD_ART_IDS.has(itemId)) {
    return `<img class="gc-card-art" src="image/card/${itemId}.jpg" alt="" loading="lazy" decoding="async">`;
  }
  return renderItemIcon(itemId, 48);
}

// ===== SORT HELPERS =====

function gcBaseComparator(mode, manualOrder) {
  if (mode === SORT_ALPHA) {
    return (a, b) => a.name.localeCompare(b.name);
  }

  if (mode === SORT_MANUAL && manualOrder?.length) {
    const idx = Object.fromEntries(manualOrder.map((id, i) => [id, i]));
    return (a, b) => {
      const ai = idx[a.id] ?? 9999;
      const bi = idx[b.id] ?? 9999;
      if (ai !== bi) return ai - bi;
      return a.amount - b.amount || a.name.localeCompare(b.name);
    };
  }

  return (a, b) => {
    const ag = GC_GROUP_ORDER[a.group] ?? 9999;
    const bg = GC_GROUP_ORDER[b.group] ?? 9999;
    if (ag !== bg) return ag - bg;
    return a.name.localeCompare(b.name);
  };
}

function gcSortItems(items, mode, manualOrder, selected = new Set(), selectedFirst = false) {
  const list = [...items];
  const compare = gcBaseComparator(mode, manualOrder);

  if (selectedFirst) {
    list.sort((a, b) => {
      const aSel = selected.has(a.id);
      const bSel = selected.has(b.id);
      if (aSel !== bSel) return aSel ? -1 : 1;
      return compare(a, b);
    });
    return list;
  }

  list.sort(compare);
  return list;
}

// ===== STORAGE =====

function loadLabData() {
  try { return JSON.parse(localStorage.getItem(LAB_STORAGE_KEY)) || {}; }
  catch { return {}; }
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

  const data        = loadLabData();
  const selected    = new Set(data.gcSelected || []);
  const timerStart  = data.gcTimerStart || null;
  const sortMode    = data.gcSortMode || SORT_AMT_ALPHA;
  const manualOrder = data.gcManualOrder || [];
  const selectedFirst = !!data.gcSelectedFirst;
  const sizeMode    = data.gcSizeMode || GC_SIZE_MEDIUM;
  const sorted      = gcSortItems(GUILD_CONTRIBUTION_ITEMS, sortMode, manualOrder, selected, selectedFirst);

  const itemsHtml = sorted.map(item => {
    const name = DATA.items?.[item.id]?.name || item.name;
    const icon = renderGcItemVisual(item.id);
    const isOn = selected.has(item.id);
    return `
      <div class="gc-card ${isOn ? 'gc-card--on' : ''} ${sortMode === SORT_MANUAL ? 'gc-card--draggable' : ''}"
           data-id="${item.id}" title="${name}">
        <div class="gc-card-icon">${icon}</div>
        <div class="gc-card-amt">×${item.amount}</div>
        <div class="gc-card-name">${name}</div>
      </div>`;
  }).join('');

  const radio = (val, label) => `
    <label class="gc-sort-option ${sortMode === val ? 'gc-sort-option--active' : ''}">
      <input type="radio" name="gcSort" value="${val}" ${sortMode === val ? 'checked' : ''}
             onchange="gcSetSort('${val}')">
      ${label}
    </label>`;

  container.innerHTML = `
    <div class="lab-main lab-main--gc lab-main--gc-size-${sizeMode}">
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
            <button class="btn btn-primary btn-sm" onclick="gcStartTimer()">Accessed NPC</button>
            <button class="btn btn-sm" onclick="gcClearTimer()">Clear</button>
          </div>
        </div>

        <div class="gc-toolbar">
          <div class="gc-sort-group">
            ${radio(SORT_AMT_ALPHA, 'Type → A–Z')}
            ${radio(SORT_ALPHA,     'A–Z')}
            ${radio(SORT_MANUAL,    'Manual')}
          </div>
          <span class="gc-hotkey-note" title="${selectedFirst ? 'C clears selection.' : '1-9 toggle the first visible items. C clears selection.'}">
            ${selectedFirst ? 'Hotkey: C clears' : 'Hotkeys: 1-9 toggle, C clears'}
          </span>
          <div class="gc-toolbar-right">
            <select class="gc-size-select" onchange="gcSetSize(this.value)" aria-label="Item size">
              <option value="${GC_SIZE_SMALL}" ${sizeMode === GC_SIZE_SMALL ? 'selected' : ''}>Small</option>
              <option value="${GC_SIZE_MEDIUM}" ${sizeMode === GC_SIZE_MEDIUM ? 'selected' : ''}>Medium</option>
              <option value="${GC_SIZE_LARGE}" ${sizeMode === GC_SIZE_LARGE ? 'selected' : ''}>Large</option>
            </select>
            <label class="gc-check-option">
              <input type="checkbox" ${selectedFirst ? 'checked' : ''} onchange="gcSetSelectedFirst(this.checked)">
              Selected to top
            </label>
            <span class="gc-selection-count" id="gcSelCount">${selected.size} / 6</span>
            <button class="btn btn-sm btn-danger gc-clear-btn" onclick="gcClearSelection()" title="Clear selected items (C)">
              Clear Selected
            </button>
          </div>
        </div>

        <div class="gc-grid" id="gcGrid">
          ${itemsHtml}
        </div>

      </div>
    </div>`;

  gcStartTickerIfNeeded(timerStart);
  gcInitGridInteraction(sortMode);
}

// ===== SORT =====

function gcSetSort(mode) {
  saveLabData({ gcSortMode: mode });
  renderLabMain();
}

function gcSetSelectedFirst(enabled) {
  saveLabData({ gcSelectedFirst: !!enabled });
  renderLabMain();
}

function gcSetSize(mode) {
  const next = [GC_SIZE_SMALL, GC_SIZE_MEDIUM, GC_SIZE_LARGE].includes(mode) ? mode : GC_SIZE_MEDIUM;
  saveLabData({ gcSizeMode: next });
  renderLabMain();
}

// ===== GRID INTERACTION (click-to-toggle + hold-to-drag) =====

function gcInitGridInteraction(sortMode) {
  const grid = document.getElementById('gcGrid');
  if (!grid) return;
  grid.style.touchAction = sortMode === SORT_MANUAL ? 'none' : '';

  // ── Drag state ──
  let dragEl       = null;
  let ghost        = null;
  let pointerDown  = null;
  let dragStarted  = false;
  let holdTimer    = null;
  const HOLD_MS    = 220;   // ms before drag activates
  const MOVE_THRESH = 6;    // px before we decide it's a drag attempt

  function getCardFromTarget(el) {
    return el?.closest?.('.gc-card');
  }

  function getCardId(card) {
    return parseInt(card?.dataset?.id);
  }

  function buildGhost(card) {
    const g = card.cloneNode(true);
    const r = card.getBoundingClientRect();
    g.style.cssText = `
      position: fixed; z-index: 9999; pointer-events: none;
      width: ${r.width}px; height: ${r.height}px;
      left: ${r.left}px; top: ${r.top}px;
      opacity: 0.85; transform: scale(1.06) rotate(2deg);
      transition: transform 0.1s; box-shadow: 0 8px 24px rgba(0,0,0,0.5);
    `;
    g.classList.add('gc-card--ghost');
    document.body.appendChild(g);
    return g;
  }

  function moveGhost(e) {
    if (!ghost) return;
    const r = dragEl.getBoundingClientRect();
    ghost.style.left = `${e.clientX - r.width / 2}px`;
    ghost.style.top  = `${e.clientY - r.height / 2}px`;
  }

  function getDropTarget(e) {
    ghost.style.display = 'none';
    const el = document.elementFromPoint(e.clientX, e.clientY);
    ghost.style.display = '';
    return getCardFromTarget(el);
  }

  function commitDragOrder() {
    const cards = [...grid.querySelectorAll('.gc-card[data-id]')];
    const order = cards.map(c => parseInt(c.dataset.id));
    saveLabData({ gcManualOrder: order });
  }

  grid.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    const card = getCardFromTarget(e.target);
    if (!card) return;

    pointerDown  = { x: e.clientX, y: e.clientY, card };
    dragStarted  = false;

    if (sortMode !== SORT_MANUAL) return; // drag only in manual mode

    holdTimer = setTimeout(() => {
      if (!pointerDown) return;
      dragEl = card;
      dragStarted = true;
      ghost = buildGhost(card);
      card.classList.add('gc-card--dragging');
      grid.setPointerCapture?.(e.pointerId);
    }, HOLD_MS);
  }, { passive: true });

  grid.addEventListener('pointermove', e => {
    if (!pointerDown) return;

    if (!dragStarted && sortMode === SORT_MANUAL) {
      const dx = Math.abs(e.clientX - pointerDown.x);
      const dy = Math.abs(e.clientY - pointerDown.y);
      if (dx > MOVE_THRESH || dy > MOVE_THRESH) {
        // Moved before hold timer — start drag immediately
        clearTimeout(holdTimer);
        dragEl = pointerDown.card;
        dragStarted = true;
        ghost = buildGhost(dragEl);
        dragEl.classList.add('gc-card--dragging');
      }
    }

    if (!dragStarted || !ghost) return;
    e.preventDefault();

    moveGhost(e);

    // Highlight drop target
    const target = getDropTarget(e);
    grid.querySelectorAll('.gc-card--drop-target').forEach(c => c.classList.remove('gc-card--drop-target'));
    if (target && target !== dragEl) {
      target.classList.add('gc-card--drop-target');
    }
  });

  function endDrag(e) {
    clearTimeout(holdTimer);

    if (dragStarted && dragEl && ghost) {
      // Perform the reorder
      const target = getDropTarget(e);
      if (target && target !== dragEl) {
        const cards = [...grid.querySelectorAll('.gc-card[data-id]')];
        const fromIdx = cards.indexOf(dragEl);
        const toIdx   = cards.indexOf(target);
        if (fromIdx !== -1 && toIdx !== -1) {
          if (fromIdx < toIdx) {
            grid.insertBefore(dragEl, target.nextSibling);
          } else {
            grid.insertBefore(dragEl, target);
          }
          commitDragOrder();
        }
      }

      ghost.remove();
      ghost = null;
      dragEl.classList.remove('gc-card--dragging');
      grid.querySelectorAll('.gc-card--drop-target').forEach(c => c.classList.remove('gc-card--drop-target'));
      dragEl = null;
    } else if (pointerDown && !dragStarted) {
      // It was a short tap — toggle
      const id = getCardId(pointerDown.card);
      if (id) gcToggleItem(id);
    }

    pointerDown = null;
    dragStarted = false;
  }

  grid.addEventListener('pointerup',     endDrag);
  grid.addEventListener('pointercancel', endDrag);
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
    const elapsed   = Date.now() - timerStart;
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
  const data     = loadLabData();
  const selected = new Set(data.gcSelected || []);
  if (selected.has(id)) {
    selected.delete(id);
  } else {
    if (selected.size >= 6) {
      showToast('Maximum 6 items selected', 'warning');
      return;
    }
    selected.add(id);
  }
  saveLabData({ gcSelected: [...selected] });

  if (data.gcSelectedFirst) {
    renderLabMain();
    return;
  }

  const card = document.querySelector(`.gc-card[data-id="${id}"]`);
  if (card) card.classList.toggle('gc-card--on', selected.has(id));
  const cnt = document.getElementById('gcSelCount');
  if (cnt) cnt.textContent = `${selected.size} / 6`;
}

function gcClearSelection() {
  saveLabData({ gcSelected: [] });

  if (loadLabData().gcSelectedFirst) {
    renderLabMain();
    return;
  }

  document.querySelectorAll('.gc-card').forEach(c => c.classList.remove('gc-card--on'));
  const cnt = document.getElementById('gcSelCount');
  if (cnt) cnt.textContent = '0 / 6';
}

function gcHandleKeydown(e) {
  if (e.defaultPrevented || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
  if ((e.target instanceof HTMLElement) && (
    e.target.closest('input, textarea, select, [contenteditable="true"]') ||
    e.target.isContentEditable
  )) return;

  const labRoot = document.querySelector('.lab-main--gc');
  if (!labRoot || !labRoot.isConnected) return;
  const selectedFirstEnabled = !!loadLabData().gcSelectedFirst;

  if (e.key?.toLowerCase() === 'c') {
    e.preventDefault();
    gcClearSelection();
    return;
  }

  const digitKey = /^[0-9]$/.test(e.key) ? e.key
    : /^Numpad[0-9]$/.test(e.code) ? e.code.replace('Numpad', '')
    : null;

  if (!selectedFirstEnabled && digitKey) {
    const cards = [...document.querySelectorAll('.gc-grid .gc-card[data-id]')];
    const index = digitKey === '0' ? 9 : Number(digitKey) - 1;
    const card = cards[index];
    const id = parseInt(card?.dataset?.id, 10);
    if (!Number.isNaN(id)) {
      e.preventDefault();
      gcToggleItem(id);
    }
  }
}

// ===== WINDOW EXPORTS =====

window.renderLabSidebar  = renderLabSidebar;
window.renderLabMain     = renderLabMain;
window.gcToggleItem      = gcToggleItem;
window.gcClearSelection  = gcClearSelection;
window.gcStartTimer      = gcStartTimer;
window.gcClearTimer      = gcClearTimer;
window.gcSetSort         = gcSetSort;
window.gcSetSelectedFirst = gcSetSelectedFirst;
window.gcSetSize         = gcSetSize;

window.addEventListener('keydown', gcHandleKeydown);
