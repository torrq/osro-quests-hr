// lab.js — lightweight launcher/registry for lab experiments

window.LAB_EXPERIMENTS = window.LAB_EXPERIMENTS || {};

window.registerLabExperiment = function registerLabExperiment(id, experiment) {
  if (!id || !experiment) return;
  window.LAB_EXPERIMENTS[id] = experiment;
};

const LAB_DEFAULT_EXPERIMENT = 'lab-gc';

function getActiveLabExperiment() {
  const tabId = window.state?.currentTab;
  return window.LAB_EXPERIMENTS[tabId] || window.LAB_EXPERIMENTS[LAB_DEFAULT_EXPERIMENT] || null;
}

function loadLabData() {
  try { return JSON.parse(localStorage.getItem(LOCAL_STORAGE.lab_data)) || {}; }
  catch { return {}; }
}

function saveLabData(patch) {
  const cur = loadLabData();
  localStorage.setItem(LOCAL_STORAGE.lab_data, JSON.stringify({ ...cur, ...patch }));
}

function renderLabSidebar() {
  const el = document.getElementById('labList');
  if (!el) return;

  const experiment = getActiveLabExperiment();
  if (!experiment) {
    el.innerHTML = '';
    return;
  }

  el.innerHTML = `
    <div class="lab-sidebar-content">
      <div class="lab-sidebar-section active" onclick="switchTab('${experiment.tabId || LAB_DEFAULT_EXPERIMENT}')">
        <span class="lab-sidebar-icon">${experiment.sidebarIcon || ''}</span>
        ${experiment.sidebarLabel || experiment.title || LAB_DEFAULT_EXPERIMENT}
      </div>
    </div>`;
}

function renderLabMain() {
  const experiment = getActiveLabExperiment();
  if (!experiment?.renderMain) return;
  experiment.renderMain();
}

window.loadLabData = loadLabData;
window.saveLabData = saveLabData;
window.renderLabSidebar = renderLabSidebar;
window.renderLabMain = renderLabMain;
