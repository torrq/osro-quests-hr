// lab.js — lightweight launcher/registry for lab experiments

window.LAB_EXPERIMENTS = window.LAB_EXPERIMENTS || {};

window.registerLabExperiment = function registerLabExperiment(id, experiment) {
  if (!id || !experiment) return;
  window.LAB_EXPERIMENTS[id] = experiment;
};

const LAB_DEFAULT_EXPERIMENT = 'gc';

function getActiveLabExperiment() {
  return window.LAB_EXPERIMENTS[LAB_DEFAULT_EXPERIMENT] || null;
}

function renderLabSidebar() {
  const experiment = getActiveLabExperiment();
  if (!experiment?.renderSidebar) return;
  experiment.renderSidebar();
}

function renderLabMain() {
  const experiment = getActiveLabExperiment();
  if (!experiment?.renderMain) return;
  experiment.renderMain();
}

window.renderLabSidebar = renderLabSidebar;
window.renderLabMain = renderLabMain;
