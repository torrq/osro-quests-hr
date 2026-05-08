// lab-credit.js — Lab: Credit Agent timer tracker

// ===== CONSTANTS =====

const CA_TIMER_MS    = 24 * 60 * 60 * 1000;  // 24 hours
const CA_STORAGE_KEY = 'osrohr_lab_credit_v1';

// Passport info displayed in the info panel
const CA_PASSPORT_INFO = {
  credit: {
    label:    'Credit Passport',
    duration: '14 days · per account',
    limit:    '100 credits/day',
    cost:     '200M zeny',
    items: [
      { id: 4054, amount: 2,  name: 'Angeling Card' },
      { id: 4174, amount: 2,  name: 'Deviling Card' },
      { id: 4241, amount: 2,  name: 'Arc Angeling Card' },
      { id: 4001, amount: 20, name: 'Poring Card' },
      { id: 4004, amount: 20, name: 'Drops Card' },
      { id: 4033, amount: 20, name: 'Poporing Card' },
    ],
  },
  rare: {
    label:    'Rare Credit Passport',
    duration: '7 days · per account',
    limit:    '100 rare credits/day',
    cost:     '400M zeny',
    items: [
      { id: 3100, amount: 20, name: 'Credit' },
      { id: 3134, amount: 20, name: 'Gacha Coin' },
      { id: 3135, amount: 20, name: 'Otherworld Coin' },
    ],
  },
};

// ===== STORAGE =====

function caLoad() {
  try { return JSON.parse(localStorage.getItem(CA_STORAGE_KEY)) || { timers: [] }; }
  catch { return { timers: [] }; }
}

function caSave(data) {
  localStorage.setItem(CA_STORAGE_KEY, JSON.stringify(data));
}

// Active tick intervals keyed by timer id
const caIntervals = {};

// ===== MAIN RENDER =====

function caRenderMain() {
  const container = document.getElementById('mainContent');
  if (!container) return;

  const data = caLoad();

  container.innerHTML = `
    <div class="ca-main">

      <div class="ca-header">
        <div class="ca-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
          Credit Agent
        </div>
        <div class="ca-header-actions">
          <button class="btn btn-sm" onclick="caStopAll()" title="Stop all timers">Stop All</button>
          <button class="btn btn-primary btn-sm" onclick="caAddTimer('credit')">+ Credit</button>
          <button class="btn btn-primary btn-sm ca-rare-btn" onclick="caAddTimer('rare')">+ Rare</button>
        </div>
      </div>

      <div class="ca-timers" id="caTimers">
        ${data.timers.length === 0 ? caEmptyState() : data.timers.map(caTimerCard).join('')}
      </div>

      <div class="ca-info-section">
        ${caPassportInfo('credit')}
        ${caPassportInfo('rare')}
      </div>

    </div>`;

  // Start tickers for running timers
  Object.keys(caIntervals).forEach(id => { clearInterval(caIntervals[id]); delete caIntervals[id]; });
  data.timers.forEach(t => { if (t.startedAt) caStartTick(t.id); });
}

function caEmptyState() {
  return `
    <div class="ca-empty">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.35">
        <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
      </svg>
      <div class="ca-empty-text">No timers yet</div>
      <div class="ca-empty-sub">Add a Credit or Rare Credit timer above</div>
    </div>`;
}

function caTimerCard(t) {
  const isRare    = t.type === 'rare';
  const typeClass = isRare ? 'ca-timer--rare' : 'ca-timer--credit';
  const typeLabel = isRare ? 'Rare Credit' : 'Credit';
  const running   = !!t.startedAt;
  return `
    <div class="ca-timer ${typeClass}" data-id="${t.id}">
      <div class="ca-timer-top">
        <div class="ca-timer-left">
          <input class="ca-name-input" value="${escapeHtml(t.name)}"
                 placeholder="Account name…"
                 onchange="caRenameTimer('${t.id}', this.value)"
                 onclick="this.select()"/>
          <span class="ca-type-badge ca-type-badge--${t.type}">${typeLabel}</span>
        </div>
        <button class="ca-delete-btn" onclick="caDeleteTimer('${t.id}')" title="Delete timer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h18M8 6V4h8v2M19 6l-1 16H6L5 6"/>
          </svg>
        </button>
      </div>

      <div class="ca-timer-display" id="ca-display-${t.id}">
        ${running ? caFormatRemaining(t.startedAt) : '<span class="ca-timer-idle">—</span>'}
      </div>

      <input type="range" class="ca-slider" min="0" max="${CA_TIMER_MS}" step="60000"
             value="${running ? Math.max(0, CA_TIMER_MS - (Date.now() - t.startedAt)) : CA_TIMER_MS}"
             oninput="caSliderInput('${t.id}', this.value)"
             onchange="caSliderCommit('${t.id}', this.value)"
             title="Adjust remaining time"/>

      <div class="ca-timer-actions">
        ${running
          ? `<button class="btn btn-sm" onclick="caStopTimer('${t.id}')">Stop</button>`
          : `<button class="btn btn-primary btn-sm" onclick="caStartTimer('${t.id}')">Start</button>`}
      </div>
    </div>`;
}

function caPassportInfo(type) {
  const p = CA_PASSPORT_INFO[type];
  const isRare = type === 'rare';
  const itemsHtml = p.items.map(item => `
    <div class="ca-passport-req">
      ${renderItemIcon(item.id, 24)}
      <span class="ca-passport-req-amt">×${item.amount}</span>
      <span class="ca-passport-req-name">${item.name}</span>
    </div>`).join('');
  return `
    <div class="ca-passport ca-passport--${type}">
      <div class="ca-passport-title">${p.label}</div>
      <div class="ca-passport-meta">${p.duration} · ${p.limit}</div>
      <div class="ca-passport-reqs">
        ${itemsHtml}
        <div class="ca-passport-req ca-passport-req--zeny">
          ${renderItemIcon(1, 24)}
          <span class="ca-passport-req-amt">${p.cost}</span>
        </div>
      </div>
    </div>`;
}

// ===== TIMER LOGIC =====

function caAddTimer(type) {
  const data = caLoad();
  const id = 'ca_' + Date.now();
  const count = data.timers.filter(t => t.type === type).length + 1;
  data.timers.push({ id, type, name: `Account ${count}`, startedAt: null });
  caSave(data);
  caRenderMain();
}

function caDeleteTimer(id) {
  clearInterval(caIntervals[id]);
  delete caIntervals[id];
  const data = caLoad();
  data.timers = data.timers.filter(t => t.id !== id);
  caSave(data);
  // Remove card from DOM without full re-render so other timers keep ticking
  const card = document.querySelector(`.ca-timer[data-id="${id}"]`);
  if (card) card.remove();
  const timersEl = document.getElementById('caTimers');
  if (timersEl && !timersEl.querySelector('.ca-timer')) {
    timersEl.innerHTML = caEmptyState();
  }
}

function caStartTimer(id) {
  const data = caLoad();
  const t = data.timers.find(t => t.id === id);
  if (!t) return;
  t.startedAt = Date.now();
  caSave(data);
  // Update card UI
  const card = document.querySelector(`.ca-timer[data-id="${id}"]`);
  if (card) {
    const actionsEl = card.querySelector('.ca-timer-actions');
    if (actionsEl) actionsEl.innerHTML = `<button class="btn btn-sm" onclick="caStopTimer('${id}')">Stop</button>`;
    const slider = card.querySelector('.ca-slider');
    if (slider) slider.value = CA_TIMER_MS;
  }
  caStartTick(id);
}

function caStopTimer(id) {
  clearInterval(caIntervals[id]);
  delete caIntervals[id];
  const data = caLoad();
  const t = data.timers.find(t => t.id === id);
  if (!t) return;
  t.startedAt = null;
  caSave(data);
  const card = document.querySelector(`.ca-timer[data-id="${id}"]`);
  if (card) {
    const disp = card.querySelector(`#ca-display-${id}`);
    if (disp) disp.innerHTML = '<span class="ca-timer-idle">—</span>';
    const actionsEl = card.querySelector('.ca-timer-actions');
    if (actionsEl) actionsEl.innerHTML = `<button class="btn btn-primary btn-sm" onclick="caStartTimer('${id}')">Start</button>`;
    const slider = card.querySelector('.ca-slider');
    if (slider) slider.value = CA_TIMER_MS;
  }
}

function caStopAll() {
  const data = caLoad();
  data.timers.forEach(t => { t.startedAt = null; });
  caSave(data);
  Object.keys(caIntervals).forEach(id => { clearInterval(caIntervals[id]); delete caIntervals[id]; });
  caRenderMain();
}

function caRenameTimer(id, name) {
  const data = caLoad();
  const t = data.timers.find(t => t.id === id);
  if (t) { t.name = name; caSave(data); }
}

function caStartTick(id) {
  clearInterval(caIntervals[id]);
  caIntervals[id] = setInterval(() => {
    const data = caLoad();
    const t = data.timers.find(t => t.id === id);
    if (!t?.startedAt) { clearInterval(caIntervals[id]); return; }

    const disp = document.getElementById(`ca-display-${id}`);
    const slider = document.querySelector(`.ca-timer[data-id="${id}"] .ca-slider`);
    const remaining = CA_TIMER_MS - (Date.now() - t.startedAt);

    if (remaining <= 0) {
      if (disp) disp.innerHTML = '<span class="ca-timer-ready">Ready!</span>';
      if (slider) slider.value = 0;
      clearInterval(caIntervals[id]);
      delete caIntervals[id];
      t.startedAt = null;
      caSave(data);
      const actionsEl = document.querySelector(`.ca-timer[data-id="${id}"] .ca-timer-actions`);
      if (actionsEl) actionsEl.innerHTML = `<button class="btn btn-primary btn-sm" onclick="caStartTimer('${id}')">Start</button>`;
    } else {
      if (disp) disp.innerHTML = caFormatRemaining(t.startedAt);
      if (slider) slider.value = Math.max(0, remaining);
    }
  }, 1000);
}

// ===== SLIDER =====

function caSliderInput(id, val) {
  // Live preview while dragging — just update display
  const remaining = parseInt(val);
  const disp = document.getElementById(`ca-display-${id}`);
  if (disp && remaining > 0) {
    disp.innerHTML = caFormatMs(remaining);
  }
}

function caSliderCommit(id, val) {
  const remaining = parseInt(val);
  const data = caLoad();
  const t = data.timers.find(t => t.id === id);
  if (!t) return;

  clearInterval(caIntervals[id]);
  delete caIntervals[id];

  if (remaining <= 0) {
    t.startedAt = null;
    const actionsEl = document.querySelector(`.ca-timer[data-id="${id}"] .ca-timer-actions`);
    if (actionsEl) actionsEl.innerHTML = `<button class="btn btn-primary btn-sm" onclick="caStartTimer('${id}')">Start</button>`;
    const disp = document.getElementById(`ca-display-${id}`);
    if (disp) disp.innerHTML = '<span class="ca-timer-idle">—</span>';
  } else {
    // Back-calculate startedAt so remaining matches
    t.startedAt = Date.now() - (CA_TIMER_MS - remaining);
    caStartTick(id);
    const actionsEl = document.querySelector(`.ca-timer[data-id="${id}"] .ca-timer-actions`);
    if (actionsEl) actionsEl.innerHTML = `<button class="btn btn-sm" onclick="caStopTimer('${id}')">Stop</button>`;
  }
  caSave(data);
}

// ===== FORMAT HELPERS =====

function caFormatRemaining(startedAt) {
  const remaining = CA_TIMER_MS - (Date.now() - startedAt);
  if (remaining <= 0) return '<span class="ca-timer-ready">Ready!</span>';
  return caFormatMs(remaining);
}

function caFormatMs(ms) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `<span class="ca-timer-h">${h}</span><span class="ca-timer-sep">h</span>`
       + `<span class="ca-timer-m">${String(m).padStart(2,'0')}</span><span class="ca-timer-sep">m</span>`
       + `<span class="ca-timer-s">${String(s).padStart(2,'0')}</span><span class="ca-timer-sep">s</span>`;
}

// ===== REGISTRATION =====

window.registerLabExperiment?.('lab-credit', {
  tabId:        'lab-credit',
  title:        'Credit Agent',
  sidebarLabel: 'Credit Agent',
  sidebarIcon: `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
    </svg>`,
  renderMain: caRenderMain,
});

window.caAddTimer    = caAddTimer;
window.caDeleteTimer = caDeleteTimer;
window.caStartTimer  = caStartTimer;
window.caStopTimer   = caStopTimer;
window.caStopAll     = caStopAll;
window.caRenameTimer = caRenameTimer;
window.caSliderInput = caSliderInput;
window.caSliderCommit = caSliderCommit;
