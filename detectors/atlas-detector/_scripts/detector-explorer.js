const SVG_NS = 'http://www.w3.org/2000/svg';
const LABEL_FONT_FRACTION = 0.030;

const COMPONENT_GEOMETRY = Object.freeze({
  inner: {
    focus: [0.590, 0.448], zoom: 1.85,
    annotations: [{label: ['Inner detectors'], box: [0.78, 0.21], points: [[0.590, 0.449]]}]
  },
  em: {
    focus: [0.590, 0.451], zoom: 1.77,
    annotations: [
      {label: ['Barrel electromagnetic calorimeter'], box: [0.230, 0.155], points: [[0.593, 0.398], [0.593, 0.506]]},
      {label: ['End-cap calorimeters'], box: [0.660, 0.810], leaderAnchor: 'top', fan: true,
        points: [[0.505, 0.470], [0.649, 0.446]], hidden: {center: [0.505, 0.470], radius: 0.020, pointIndex: 0}}
    ]
  },
  hadronic: {
    focus: [0.575, 0.467], zoom: 1.48,
    annotations: [
      {label: ['Barrel hadronic', 'calorimeter'], box: [0.410, 0.120], points: [[0.575, 0.381], [0.576, 0.538]]},
      {label: ['End-cap hadronic', 'calorimeters'], box: [0.470, 0.825], leaderAnchor: 'top', fan: true,
        points: [[0.505, 0.470], [0.649, 0.446]], hidden: {center: [0.505, 0.470], radius: 0.020, pointIndex: 0}}
    ]
  },
  solenoid: {
    focus: [0.572, 0.463], zoom: 1.73,
    annotations: [{label: ['Solenoid magnet'], box: [0.765, 0.175], leaderAnchor: 'bottom', fan: true, points: [[0.575, 0.430], [0.575, 0.487]]}]
  },
  barrelToroid: {
    focus: [0.630, 0.295], zoom: 1.23,
    annotations: [{label: ['Barrel toroid', 'magnet'], box: [0.785, 0.115], leaderAnchor: 'bottom', fan: true, points: [[0.690, 0.215], [0.688, 0.788]]}]
  },
  endcapToroid: {
    focus: [0.440, 0.520], zoom: 1.33,
    annotations: [{label: ['End-cap toroid', 'magnet'], box: [0.765, 0.155], points: [[0.440, 0.540]]}]
  },
  muon: {
    focus: [0.500, 0.460], zoom: 1.06,
    annotations: [
      {label: ['Barrel muon chambers'], box: [0.480, 0.080], leaderAnchor: 'bottom', fan: true, points: [[0.536, 0.150], [0.513, 0.239], [0.505, 0.324]]},
      {label: ['New Small Wheel', '(NSW) chambers'], box: [0.855, 0.825], leaderAnchor: 'top', fan: true, points: [[0.485, 0.467], [0.708, 0.378]]},
      {label: ['End-cap muon', 'chambers'], box: [0.190, 0.770], leaderAnchor: 'top', fan: true, points: [[0.164, 0.211], [0.294, 0.212], [0.364, 0.251]]}
    ]
  }
});

function svgElement(tag, attributes = {}) {
  const element = document.createElementNS(SVG_NS, tag);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));
  return element;
}

function cardTitle(card) {
  return card.querySelector('h3')?.textContent.trim() || card.dataset.detectorCard;
}

function buildSelector(cards) {
  const selector = document.createElement('div');
  selector.className = 'detector-explorer__selector';
  const label = document.createElement('p');
  label.className = 'detector-explorer__label';
  label.textContent = 'Detector Components';
  const choices = document.createElement('div');
  choices.className = 'detector-explorer__choices';
  choices.setAttribute('role', 'group');
  choices.setAttribute('aria-label', 'Choose a detector subsystem');
  cards.forEach((card, key) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.detectorSelect = key;
    button.setAttribute('aria-pressed', 'false');
    button.textContent = cardTitle(card);
    choices.appendChild(button);
  });
  selector.append(label, choices);
  return selector;
}

function buildToolbar() {
  const toolbar = document.createElement('div');
  toolbar.className = 'detector-explorer__toolbar';
  const buttons = document.createElement('div');
  buttons.className = 'detector-explorer__toolbar-buttons';
  const reset = document.createElement('button');
  reset.type = 'button';
  reset.className = 'btn btn-outline-primary detector-explorer__reset';
  reset.dataset.detectorReset = '';
  reset.textContent = 'Full Detector';
  const labelled = document.createElement('button');
  labelled.type = 'button';
  labelled.className = 'btn btn-outline-primary detector-explorer__labelled';
  labelled.dataset.detectorLabelled = '';
  labelled.setAttribute('aria-pressed', 'false');
  labelled.textContent = 'Labelled';
  const status = document.createElement('span');
  status.className = 'detector-explorer__zoom';
  status.dataset.detectorZoom = '';
  status.setAttribute('aria-live', 'polite');
  status.textContent = 'Full-detector view';
  buttons.append(reset, labelled);
  toolbar.append(buttons, status);
  return toolbar;
}

function initializeDetector(root) {
  const cards = new Map([...root.querySelectorAll(':scope > section[data-detector-card]')].map(card => [card.dataset.detectorCard, card]));
  if (!cards.size || [...cards.keys()].some(key => !COMPONENT_GEOMETRY[key])) return;
  const stage = root.querySelector('[data-detector-stage]');
  const image = root.querySelector('[data-detector-image]');
  const overlay = root.querySelector('[data-detector-overlay]');
  const emptyState = root.querySelector('[data-detector-empty-state]');
  const controlsHost = root.querySelector('[data-detector-controls-host]');
  const toolbarHost = root.querySelector('[data-detector-toolbar-host]');
  if (!stage || !image || !overlay || !emptyState || !controlsHost || !toolbarHost) return;

  const selector = buildSelector(cards);
  const toolbar = buildToolbar();
  controlsHost.replaceWith(selector);
  toolbarHost.replaceWith(toolbar);
  const status = toolbar.querySelector('[data-detector-zoom]');
  const labelledButton = toolbar.querySelector('[data-detector-labelled]');
  const cleanSrc = image.getAttribute('src');
  const cleanAlt = image.alt;
  const labelledSrc = image.dataset.labelledSrc;
  let selection = null;
  let labelled = false;
  let cleanSize = image.complete && image.naturalWidth ? [image.naturalWidth, image.naturalHeight] : null;

  const projected = ([x, y]) => {
    if (!selection) return [x, y];
    const {focus, zoom} = COMPONENT_GEOMETRY[selection];
    return [0.5 + zoom * (x - focus[0]), 0.5 + zoom * (y - focus[1])];
  };

  function addAnnotation(parent, annotation, width, height) {
    const font = LABEL_FONT_FRACTION * width;
    const leading = font * 1.20;
    const measure = document.createElement('canvas').getContext('2d');
    if (measure) measure.font = `700 ${font}px "Times New Roman", Times, serif`;
    const textWidth = Math.max(...annotation.label.map(line => measure ? measure.measureText(line).width : line.length * font * 0.5));
    const padX = font * 0.28;
    const padY = font * 0.16;
    const boxWidth = textWidth + 2 * padX;
    const boxHeight = font * 1.08 + (annotation.label.length - 1) * leading + 2 * padY;
    const margin = 0.014 * width;
    const centerX = Math.max(boxWidth / 2 + margin, Math.min(width - boxWidth / 2 - margin, annotation.box[0] * width));
    const centerY = Math.max(boxHeight / 2 + margin, Math.min(height - boxHeight / 2 - margin, annotation.box[1] * height));
    const left = centerX - boxWidth / 2;
    const top = centerY - boxHeight / 2;
    const points = annotation.points.map(projected).map(([x, y]) => [x * width, y * height]);
    const group = svgElement('g', {class: 'detector-explorer__callout', 'aria-hidden': 'true'});
    const fanAnchor = annotation.fan && annotation.leaderAnchor
      ? annotation.leaderAnchor === 'top' ? [centerX, top]
        : annotation.leaderAnchor === 'left' ? [left, centerY]
        : annotation.leaderAnchor === 'right' ? [left + boxWidth, centerY]
        : [centerX, top + boxHeight]
      : null;
    points.forEach(([pointX, pointY], index) => {
      if (pointX < 0 || pointX > width || pointY < 0 || pointY > height) return;
      const dx = pointX - centerX;
      const dy = pointY - centerY;
      const horizontal = Math.abs(dx / boxWidth) > Math.abs(dy / boxHeight);
      const x1 = fanAnchor ? fanAnchor[0] : horizontal ? centerX + (dx > 0 ? boxWidth / 2 : -boxWidth / 2) : centerX;
      const y1 = fanAnchor ? fanAnchor[1] : horizontal ? centerY : centerY + (dy > 0 ? boxHeight / 2 : -boxHeight / 2);
      group.appendChild(svgElement('line', {x1, y1, x2: pointX, y2: pointY, class: annotation.fan ? 'detector-explorer__callout-line detector-explorer__callout-line--fan' : 'detector-explorer__callout-line'}));
      if (annotation.hidden?.pointIndex !== index) {
        group.appendChild(svgElement('circle', {cx: pointX, cy: pointY, r: width * 0.0035, class: annotation.fan ? 'detector-explorer__callout-point detector-explorer__callout-point--fan' : 'detector-explorer__callout-point'}));
      }
    });
    group.appendChild(svgElement('rect', {x: left, y: top, width: boxWidth, height: boxHeight, rx: font * 0.17, class: 'detector-explorer__callout-box'}));
    const firstBaseline = centerY - (annotation.label.length - 1) * leading / 2;
    const text = svgElement('text', {x: centerX, y: firstBaseline, 'font-size': font, 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'detector-explorer__callout-label'});
    // Keep Quarto's global SVG typography from overriding the calibrated label
    // size. The original detector explorer used this inline declaration too.
    text.style.fontSize = `${font}px`;
    text.dataset.fontFraction = String(LABEL_FONT_FRACTION);
    annotation.label.forEach((line, index) => {
      const span = svgElement('tspan', {x: centerX, y: firstBaseline + index * leading});
      span.textContent = line;
      text.appendChild(span);
    });
    group.appendChild(text);
    parent.appendChild(group);
  }

  function drawHotspots() {
    overlay.replaceChildren();
    if (!cleanSize || labelled) return;
    const [width, height] = cleanSize;
    overlay.setAttribute('viewBox', `0 0 ${width} ${height}`);
    overlay.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    COMPONENT_GEOMETRY_ENTRIES().forEach(([key, component]) => {
      const group = svgElement('g', {class: 'detector-explorer__hotspot', 'data-detector-hotspot': key, role: 'button', tabindex: '0', 'aria-label': `Focus on ${cardTitle(cards.get(key))}`, 'aria-pressed': String(selection === key)});
      component.annotations.flatMap(annotation => annotation.points).forEach(point => {
        const [x, y] = projected(point);
        if (x >= 0 && x <= 1 && y >= 0 && y <= 1) group.appendChild(svgElement('ellipse', {cx: x * width, cy: y * height, rx: width * 0.027, ry: height * 0.042, class: 'hit-area'}));
      });
      group.addEventListener('click', () => select(key));
      group.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          select(key);
        }
      });
      overlay.appendChild(group);
    });
    if (selection) {
      const labels = svgElement('g', {class: 'detector-explorer__selected-labels'});
      overlay.appendChild(labels);
      COMPONENT_GEOMETRY[selection].annotations.forEach(annotation => {
        addAnnotation(labels, annotation, width, height);
        if (annotation.hidden) {
          const [x, y] = projected(annotation.hidden.center);
          labels.appendChild(svgElement('circle', {cx: x * width, cy: y * height, r: annotation.hidden.radius * width, class: 'detector-explorer__hidden-region', 'aria-hidden': 'true'}));
        }
      });
    }
  }

  function COMPONENT_GEOMETRY_ENTRIES() {
    return Object.entries(COMPONENT_GEOMETRY).filter(([key]) => cards.has(key));
  }

  function render() {
    cards.forEach((card, key) => { card.hidden = labelled || selection !== key; });
    emptyState.hidden = Boolean(selection) && !labelled;
    selector.querySelectorAll('[data-detector-select]').forEach(button => {
      const active = !labelled && button.dataset.detectorSelect === selection;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    labelledButton.setAttribute('aria-pressed', String(labelled));
    overlay.setAttribute('aria-hidden', String(labelled));
    if (labelled || !selection) {
      stage.style.transform = 'translate(0%, 0%) scale(1)';
      status.textContent = labelled ? 'Official labelled overview' : 'Full-detector view';
    } else {
      const {focus: [x, y], zoom} = COMPONENT_GEOMETRY[selection];
      stage.style.transform = `translate(${(0.5 - zoom * x) * 100}%, ${(0.5 - zoom * y) * 100}%) scale(${zoom})`;
      status.textContent = `${zoom.toFixed(1)}× focus: ${cardTitle(cards.get(selection))}`;
    }
    drawHotspots();
  }

  function reset() {
    selection = null;
    labelled = false;
    image.src = cleanSrc;
    image.alt = cleanAlt;
    render();
  }

  function select(key) {
    if (!cards.has(key)) return;
    if (!labelled && selection === key) return reset();
    labelled = false;
    selection = key;
    image.src = cleanSrc;
    image.alt = cleanAlt;
    render();
  }

  selector.querySelectorAll('[data-detector-select]').forEach(button => {
    button.addEventListener('click', () => {
      select(button.dataset.detectorSelect);
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      root.scrollIntoView({behavior: reduced ? 'auto' : 'smooth', block: 'start'});
    });
  });
  toolbar.querySelector('[data-detector-reset]').addEventListener('click', reset);
  labelledButton.addEventListener('click', () => {
    labelled = !labelled;
    selection = null;
    image.src = labelled ? labelledSrc : cleanSrc;
    image.alt = labelled ? 'Official labelled 2022 ATLAS detector cutaway with people for scale and subsystem callouts.' : cleanAlt;
    render();
  });
  image.addEventListener('load', () => {
    if (!labelled) cleanSize = [image.naturalWidth, image.naturalHeight];
    drawHotspots();
  });
  image.addEventListener('error', () => {
    status.textContent = labelled ? 'Labelled image unavailable.' : 'Detector image unavailable.';
  });
  root.classList.add('is-enhanced');
  root.querySelector('.detector-explorer')?.classList.add('is-enhanced');
  render();
}

export function initializeDetectorExplorers(scope = document) {
  scope.querySelectorAll('[data-detector]').forEach(initializeDetector);
}
