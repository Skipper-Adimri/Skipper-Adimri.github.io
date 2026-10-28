function controlButton(panel, key) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'atlas-view-switch__button';
  button.dataset.viewSelect = key;
  button.textContent = panel.dataset.viewLabel || panel.querySelector('h3, h4')?.textContent.trim() || key;
  button.setAttribute('aria-pressed', 'false');
  return button;
}

export function initializeViewSwitch(root) {
  const panels = [...root.querySelectorAll(':scope > [data-view-panel], :scope > section.atlas-momentum')];
  if (!panels.length) return;
  const controlsHost = root.querySelector('[data-view-controls-host]');
  if (!controlsHost) return;

  panels.forEach(panel => {
    if (!panel.dataset.viewPanel && panel.classList.contains('atlas-momentum')) panel.dataset.viewPanel = 'momentum';
  });
  const available = new Map(panels.map(panel => [panel.dataset.viewPanel, panel]));
  let selected = panels[0].dataset.viewPanel;
  const controls = document.createElement('div');
  controls.className = 'atlas-view-switch__controls';
  controls.setAttribute('role', 'group');
  const controlLabel = root.id === 'calorimetry'
    ? 'Choose calorimeter view'
    : root.id === 'zero-degree-calorimeters-pileup-rejection'
      ? 'Choose ZDC illustration'
      : 'Choose tracking illustration';
  controls.setAttribute('aria-label', controlLabel);

  const buttons = new Map();
  panels.forEach(panel => {
    const key = panel.dataset.viewPanel;
    const button = controlButton(panel, key);
    button.addEventListener('click', () => select(key, {scroll: true}));
    controls.appendChild(button);
    buttons.set(key, button);
  });

  function select(key, {scroll = false} = {}) {
    if (!available.has(key)) return;
    selected = key;
    panels.forEach(panel => {
      const active = panel.dataset.viewPanel === selected;
      panel.hidden = !active;
      panel.setAttribute('aria-hidden', String(!active));
    });
    buttons.forEach((button, buttonKey) => {
      button.setAttribute('aria-pressed', String(buttonKey === selected));
    });
    if (scroll) {
      const panel = available.get(selected);
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      requestAnimationFrame(() => panel.scrollIntoView({behavior: reduced ? 'auto' : 'smooth', block: 'start'}));
    }
  }

  panels.at(-1).insertAdjacentElement('afterend', controls);
  controlsHost.remove();
  root.classList.add('is-enhanced');
  select(selected);
}

export function initializeViewSwitches(scope = document) {
  scope.querySelectorAll('section.atlas-view-switch').forEach(initializeViewSwitch);
}
