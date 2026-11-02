const SVG_NS = 'http://www.w3.org/2000/svg';
const VIEWBOX = Object.freeze({width: 1672, height: 941});
const BEAMPIPE_CENTER = Object.freeze({x: 835.5, y: 872.5});
const FIELD = Object.freeze({solenoidRadius: 195, toroidInnerRadius: 645, toroidOuterRadius: 770});

const PARTICLE_PROFILES = Object.freeze({
  electron: {color: '#1768D0', chargeSign: -1, kind: 'em-charged', beta: 14, radius: 425, depositRadius: 310},
  positron: {color: '#EA7B20', chargeSign: 1, kind: 'em-charged', beta: -18, radius: 425, depositRadius: 310},
  photon: {color: '#B58A00', chargeSign: 0, kind: 'photon', beta: 1, depositRadius: 305},
  'charged-hadron-plus': {color: '#0B8E8A', chargeSign: 1, kind: 'had-charged', beta: -8, radius: 725, depositRadius: 515},
  'charged-hadron-minus': {color: '#D4472F', chargeSign: -1, kind: 'had-charged', beta: 6, radius: 775, depositRadius: 510},
  'neutral-hadron': {color: '#198C54', chargeSign: 0, kind: 'neutral-hadron', beta: -7, depositRadius: 510},
  muon: {color: '#7138C9', chargeSign: -1, kind: 'muon', beta: 17, radius: 1500, depositRadius: 846}
});

const PARTICLE_LABELS = Object.freeze({
  electron: 'Electron (e⁻)',
  positron: 'Positron (e⁺)',
  photon: 'Photon (γ)',
  'charged-hadron-plus': 'Charged Hadron (h⁺)',
  'charged-hadron-minus': 'Charged Hadron (h⁻)',
  'neutral-hadron': 'Neutral Hadron (h⁰)',
  muon: 'Muon (μ⁻)'
});

const round = value => Math.round(value * 10) / 10;
const point = (x, y) => ({x: round(x), y: round(y)});
const radians = degrees => degrees * Math.PI / 180;
const distance = p => Math.hypot(p.x - BEAMPIPE_CENTER.x, p.y - BEAMPIPE_CENTER.y);

function svgElement(tag, attributes = {}) {
  const element = document.createElementNS(SVG_NS, tag);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));
  return element;
}

function normalizeVector(x, y) {
  const norm = Math.hypot(x, y) || 1;
  return {x: x / norm, y: y / norm};
}

const leftNormal = vector => ({x: -vector.y, y: vector.x});
const pathFromPoints = points => points.map((p, index) => `${index ? 'L' : 'M'} ${p.x} ${p.y}`).join(' ');

function propagateParticle(profile) {
  const origin = BEAMPIPE_CENTER;
  let x = origin.x;
  let y = origin.y;
  let beta = radians(profile.beta);
  const points = [point(x, y)];
  for (let index = 0; index < 650; index += 1) {
    const radius = Math.hypot(x - origin.x, y - origin.y);
    if (profile.depositRadius - radius < 0.1) break;
    const step = Math.min(2, profile.depositRadius - radius);
    let curvature = 0;
    if (profile.chargeSign && radius < FIELD.solenoidRadius) curvature = -profile.chargeSign / profile.radius;
    if (profile.kind === 'muon' && radius >= FIELD.toroidInnerRadius && radius < FIELD.toroidOuterRadius) curvature = -1 / 3500;
    const midpoint = beta + curvature * step / 2;
    x += step * Math.sin(midpoint);
    y -= step * Math.cos(midpoint);
    beta += curvature * step;
    points.push(point(x, y));
  }
  return points;
}

function neutralFlight(profile) {
  const beta = radians(profile.beta);
  return [point(BEAMPIPE_CENTER.x, BEAMPIPE_CENTER.y), point(
    BEAMPIPE_CENTER.x + profile.depositRadius * Math.sin(beta),
    BEAMPIPE_CENTER.y - profile.depositRadius * Math.cos(beta)
  )];
}

function boundedShowerPoint(raw, type) {
  const radius = distance(raw);
  const inner = type === 'em' ? 258 : 392;
  const outer = type === 'em' ? 357 : 648;
  const bounded = Math.max(inner, Math.min(outer, radius));
  const azimuth = Math.atan2(raw.x - BEAMPIPE_CENTER.x, BEAMPIPE_CENTER.y - raw.y);
  const angle = Math.max(-0.66, Math.min(0.66, azimuth));
  return point(BEAMPIPE_CENTER.x + bounded * Math.sin(angle), BEAMPIPE_CENTER.y - bounded * Math.cos(angle));
}

function buildShower(deposit, type) {
  const axis = normalizeVector(deposit.x - BEAMPIPE_CENTER.x, deposit.y - BEAMPIPE_CENTER.y);
  const normal = leftNormal(axis);
  const hadronic = type === 'had';
  const root = boundedShowerPoint(deposit, type);
  const segments = [];
  const primary = hadronic
    ? [[43,-8],[48,5],[39,-23],[41,22],[29,-33],[28,35],[53,0],[34,-14],[35,14]]
    : [[21,-5],[25,3],[19,-14],[20,14],[16,-20],[16,19],[27,0],[22,-10],[22,10]];
  const emit = (start, forward, sideways, kind) => {
    const raw = point(start.x + axis.x * forward + normal.x * sideways, start.y + axis.y * forward + normal.y * sideways);
    const end = boundedShowerPoint(raw, type);
    if (Math.hypot(end.x - start.x, end.y - start.y) > 1.8) segments.push({kind, points: [start, end]});
    return end;
  };
  const first = primary.map(([forward, sideways]) => emit(root, forward, sideways, 'shower'));
  const secondLength = hadronic ? 19 : 12;
  const thirdLength = hadronic ? 11 : 8;
  const second = [];
  first.forEach((start, index) => {
    const outward = index % 3 === 0 ? secondLength * 1.05 : secondLength * 0.8;
    const spread = (index % 2 ? 1 : -1) * (hadronic ? 9 : 6);
    second.push(emit(start, outward, spread, 'shower-secondary'));
    if (index % 3 === 1) second.push(emit(start, outward * 0.7, -spread * 0.8, 'shower-secondary'));
  });
  second.forEach((start, index) => {
    const spread = (index % 2 ? 1 : -1) * (hadronic ? 5 : 3.5);
    const tip = emit(start, thirdLength * (index % 3 === 0 ? 1 : 0.8), spread, 'shower-tertiary');
    if (index % 2 === 0) segments.push({kind: 'spark', x: tip.x, y: tip.y, r: hadronic ? 3 : 2.8});
  });
  segments.push({kind: 'deposit', x: root.x, y: root.y, r: hadronic ? 10.2 : 8.5});
  return segments;
}

function arrowHead(tail, head, size = 18) {
  const direction = normalizeVector(head.x - tail.x, head.y - tail.y);
  const normal = leftNormal(direction);
  const base = point(head.x - direction.x * size, head.y - direction.y * size);
  const wing = size * 0.46;
  return [point(head.x, head.y), point(base.x + normal.x * wing, base.y + normal.y * wing), point(base.x - normal.x * wing, base.y - normal.y * wing)];
}

function particleGeometry(profile) {
  const track = profile.chargeSign ? propagateParticle(profile) : neutralFlight(profile);
  const deposit = track.at(-1);
  const segments = [{kind: profile.chargeSign ? 'track' : 'flight', points: track}];
  if (profile.kind === 'muon') segments.push({kind: 'arrow', points: arrowHead(track.at(-11), deposit, 24)});
  else segments.push(...buildShower(deposit, profile.kind === 'em-charged' || profile.kind === 'photon' ? 'em' : 'had'));
  return segments;
}

function textColor(background) {
  const value = background.replace('#', '');
  const red = parseInt(value.slice(0, 2), 16);
  const green = parseInt(value.slice(2, 4), 16);
  const blue = parseInt(value.slice(4, 6), 16);
  return (0.299 * red + 0.587 * green + 0.114 * blue) / 255 > 0.62 ? '#17301a' : '#fff';
}

function displayName(card) {
  return PARTICLE_LABELS[card.dataset.particleCard] || card.dataset.particleCard;
}

function buildControls(cards) {
  const selector = document.createElement('div');
  selector.className = 'particle-explorer__selector';
  const label = document.createElement('p');
  label.className = 'detector-explorer__label';
  label.textContent = 'Choose a Particle';
  const choices = document.createElement('div');
  choices.className = 'particle-explorer__choices';
  choices.setAttribute('role', 'group');
  choices.setAttribute('aria-label', 'Select particles to overlay');
  cards.forEach((card, key) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.particleSelect = key;
    button.textContent = displayName(card);
    button.setAttribute('aria-pressed', 'false');
    choices.appendChild(button);
  });
  selector.append(label, choices);
  return selector;
}

function buildToolbar() {
  const toolbar = document.createElement('div');
  toolbar.className = 'particle-explorer__toolbar';
  const buttons = document.createElement('div');
  buttons.className = 'particle-explorer__toolbar-buttons';
  const definitions = [
    ['particleReset', 'Full Detector', 'particle-explorer__reset', 'overview'],
    ['particleLabelled', 'Labelled', 'particle-explorer__labelled', 'labels'],
    ['particleAnimationOpen', 'Watch Animation', 'particle-explorer__animation-button', 'video']
  ];
  definitions.forEach(([datasetKey, label, className, icon]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `btn btn-outline-primary ${className} icon-link icon-${icon}`;
    button.dataset[datasetKey] = '';
    button.textContent = label;
    if (datasetKey === 'particleLabelled') button.setAttribute('aria-pressed', 'false');
    buttons.appendChild(button);
  });
  const status = document.createElement('span');
  status.className = 'particle-explorer__view-status';
  status.dataset.particleLabelStatus = '';
  status.setAttribute('aria-live', 'polite');
  status.textContent = 'Full detector view';
  toolbar.append(buttons, status);
  return toolbar;
}

function initializeParticles(root) {
  const cards = new Map([...root.querySelectorAll(':scope > section[data-particle-card]')].map(card => [card.dataset.particleCard, card]));
  if (!cards.size || [...cards.keys()].some(key => !PARTICLE_PROFILES[key])) return;
  const overlay = root.querySelector('[data-particle-overlay]');
  const labels = root.querySelector('[data-particle-labels]');
  const emptyState = root.querySelector('[data-particle-empty-state]');
  const controlsHost = root.querySelector('[data-particle-controls-host]');
  const toolbarHost = root.querySelector('[data-particle-toolbar-host]');
  if (!overlay || !labels || !emptyState || !controlsHost || !toolbarHost) return;
  const selector = buildControls(cards);
  const toolbar = buildToolbar();
  controlsHost.replaceWith(selector);
  toolbarHost.replaceWith(toolbar);
  const selected = new Set();
  let labelled = false;

  overlay.setAttribute('viewBox', `0 0 ${VIEWBOX.width} ${VIEWBOX.height}`);
  Object.entries(PARTICLE_PROFILES).forEach(([key, profile]) => {
    if (!cards.has(key)) return;
    const group = svgElement('g', {class: 'particle-explorer__trajectory', 'data-particle-trace': key, 'aria-hidden': 'true'});
    group.style.setProperty('--particle-color', profile.color);
    particleGeometry(profile).forEach(segment => {
      if (segment.kind === 'spark') group.appendChild(svgElement('circle', {cx: segment.x, cy: segment.y, r: segment.r, class: 'particle-explorer__spark'}));
      else if (segment.kind === 'deposit') group.appendChild(svgElement('circle', {cx: segment.x, cy: segment.y, r: segment.r, class: 'particle-explorer__deposit'}));
      else if (segment.kind === 'arrow') group.appendChild(svgElement('polygon', {points: segment.points.map(p => `${p.x},${p.y}`).join(' '), fill: profile.color, stroke: '#fff', 'stroke-width': 2.2, 'stroke-linejoin': 'round'}));
      else group.appendChild(svgElement('path', {d: pathFromPoints(segment.points), class: `particle-explorer__path particle-explorer__path--${segment.kind}`}));
    });
    overlay.appendChild(group);
  });

  const status = toolbar.querySelector('[data-particle-label-status]');
  const labelledButton = toolbar.querySelector('[data-particle-labelled]');
  const buttons = new Map([...selector.querySelectorAll('[data-particle-select]')].map(button => [button.dataset.particleSelect, button]));
  buttons.forEach((button, key) => {
    const profile = PARTICLE_PROFILES[key];
    button.style.setProperty('--particle-button-color', profile.color);
    button.style.setProperty('--particle-button-text', textColor(profile.color));
  });

  function render() {
    labels.hidden = !labelled;
    labelledButton.setAttribute('aria-pressed', String(labelled));
    emptyState.hidden = selected.size > 0;
    cards.forEach((card, key) => { card.hidden = !selected.has(key); });
    buttons.forEach((button, key) => {
      const active = selected.has(key);
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
      button.style.borderColor = active ? PARTICLE_PROFILES[key].color : '';
      button.style.background = active ? PARTICLE_PROFILES[key].color : '';
      button.style.color = active ? textColor(PARTICLE_PROFILES[key].color) : '';
    });
    root.querySelectorAll('[data-particle-trace]').forEach(group => {
      const active = selected.has(group.dataset.particleTrace);
      group.classList.toggle('is-active', active);
      group.setAttribute('aria-hidden', String(!active));
    });
    const names = [...cards.keys()].filter(key => selected.has(key)).map(key => displayName(cards.get(key)));
    if (!names.length) status.textContent = labelled ? 'Labelled detector slice' : 'Full detector view';
    else if (names.length <= 2) status.textContent = `${names.join(' + ')} overlay${names.length > 1 ? 's' : ''}${labelled ? ' + labels' : ''}`;
    else status.textContent = `${names.length} particle overlays${labelled ? ' + labels' : ''}`;
    overlay.setAttribute('aria-label', names.length ? `Conceptual detector response for ${names.join(', ')}` : 'ATLAS detector slice');
  }

  buttons.forEach((button, key) => button.addEventListener('click', () => {
    if (selected.has(key)) selected.delete(key); else selected.add(key);
    render();
  }));
  toolbar.querySelector('[data-particle-reset]').addEventListener('click', () => {
    selected.clear();
    labelled = false;
    render();
  });
  labelledButton.addEventListener('click', () => {
    labelled = !labelled;
    render();
  });

  const dialog = root.querySelector('[data-particle-animation-dialog]');
  const animationImage = root.querySelector('[data-particle-animation-image]');
  const animationToggle = root.querySelector('[data-particle-animation-toggle]');
  const animationError = root.querySelector('[data-particle-animation-error]');
  const animationCredit = root.querySelector('#atlas-animation-source')?.closest('p');
  const openButton = toolbar.querySelector('[data-particle-animation-open]');
  if (dialog && animationImage && animationToggle && openButton) {
    function setAnimationPlaying(playing) {
      animationImage.src = playing ? animationImage.dataset.src : animationImage.dataset.poster;
      animationToggle.setAttribute('aria-label', playing ? 'Pause animation' : 'Play animation');
      animationToggle.setAttribute('aria-pressed', String(playing));
    }
    if (animationCredit) {
      animationCredit.classList.add('particle-explorer__animation-credit');
      dialog.querySelector('.particle-explorer__animation-media')?.appendChild(animationCredit);
    }
    openButton.addEventListener('click', () => {
      if (typeof dialog.showModal !== 'function') return;
      setAnimationPlaying(false);
      dialog.showModal();
    });
    animationToggle.addEventListener('click', () => {
      const playing = animationToggle.getAttribute('aria-pressed') === 'true';
      setAnimationPlaying(!playing);
    });
    animationImage.addEventListener('error', () => { if (animationError) animationError.hidden = false; });
    animationImage.addEventListener('load', () => { if (animationError) animationError.hidden = true; });
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => {
      setAnimationPlaying(false);
      openButton.focus();
    });
  }
  root.classList.add('is-enhanced');
  root.querySelector('.particle-explorer')?.classList.add('is-enhanced');
  render();
}

export function initializeParticleExplorers(scope = document) {
  scope.querySelectorAll('[data-particle-explorer]').forEach(initializeParticles);
}
