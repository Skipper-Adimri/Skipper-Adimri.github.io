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
  controls.setAttribute('aria-label', root.id === 'calorimetry' ? 'Choose calorimeter view' : 'Choose tracking illustration');

  const buttons = new Map();
  panels.forEach(panel => {
    const key = panel.dataset.viewPanel;
    const button = controlButton(panel, key);
    button.addEventListener('click', () => select(key));
    controls.appendChild(button);
    buttons.set(key, button);
  });

  function select(key) {
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
  }

  panels.at(-1).insertAdjacentElement('afterend', controls);
  controlsHost.remove();
  root.classList.add('is-enhanced');
  select(selected);
}

export function initializeViewSwitches(scope = document) {
  scope.querySelectorAll('section.atlas-view-switch').forEach(initializeViewSwitch);
}
