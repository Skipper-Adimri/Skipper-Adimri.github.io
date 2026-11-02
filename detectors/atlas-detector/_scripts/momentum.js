const SVG_NS = 'http://www.w3.org/2000/svg';

export const MOMENTUM_CONFIG = Object.freeze({
  fieldTesla: 2.0,
  chargeMagnitude: 1,
  momentumMinGeV: 0.5,
  momentumMaxGeV: 10,
  momentumStepGeV: 0.5,
  momentumInitialGeV: 1.0,
  conversionGeVPerTeslaMeter: 0.299792458,
  center: Object.freeze({x: 252, y: 256}),
  outerRadiusM: 1.082,
  outerRadiusPx: 192,
  pixelRadiiM: Object.freeze([0.0332, 0.0505, 0.0885, 0.1225]),
  sctRadiiM: Object.freeze([0.299, 0.371, 0.443, 0.514]),
  trtHitRadiiM: Object.freeze([0.64, 0.82, 0.99, 1.082]),
  trtGuideRadiiM: Object.freeze([0.554, 0.64, 0.73, 0.82, 0.91, 0.99, 1.082])
});

export function radiusMeters(momentumGeV, config = MOMENTUM_CONFIG) {
  return momentumGeV / (config.conversionGeVPerTeslaMeter * config.chargeMagnitude * config.fieldTesla);
}

export function hitRadii(config = MOMENTUM_CONFIG) {
  return [...config.pixelRadiiM, ...config.sctRadiiM, ...config.trtHitRadiiM];
}

function pixelsPerMeter(config = MOMENTUM_CONFIG) {
  return config.outerRadiusPx / config.outerRadiusM;
}

export function trackPointAtRadius(momentumGeV, chargeSign, detectorRadiusM, config = MOMENTUM_CONFIG) {
  const scale = pixelsPerMeter(config);
  const curvatureRadiusPx = radiusMeters(momentumGeV, config) * scale;
  const detectorRadiusPx = detectorRadiusM * scale;
  const theta = 2 * Math.asin(detectorRadiusPx / (2 * curvatureRadiusPx));
  return {
    x: config.center.x - chargeSign * curvatureRadiusPx * (1 - Math.cos(theta)),
    y: config.center.y - curvatureRadiusPx * Math.sin(theta)
  };
}

export function trackPoints(momentumGeV, chargeSign, count = 91, config = MOMENTUM_CONFIG) {
  const scale = pixelsPerMeter(config);
  const curvatureRadiusPx = radiusMeters(momentumGeV, config) * scale;
  const maximumTheta = 2 * Math.asin(config.outerRadiusPx / (2 * curvatureRadiusPx));
  return Array.from({length: count}, (_, index) => {
    const theta = maximumTheta * index / (count - 1);
    return {
      x: config.center.x - chargeSign * curvatureRadiusPx * (1 - Math.cos(theta)),
      y: config.center.y - curvatureRadiusPx * Math.sin(theta)
    };
  });
}

export function hitPositions(momentumGeV, chargeSign, config = MOMENTUM_CONFIG) {
  return hitRadii(config).map(radius => trackPointAtRadius(momentumGeV, chargeSign, radius, config));
}

function svgElement(tag, attributes = {}) {
  const element = document.createElementNS(SVG_NS, tag);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));
  return element;
}

function appendText(parent, text, attributes = {}) {
  const element = svgElement('text', attributes);
  element.textContent = text;
  parent.appendChild(element);
  return element;
}

function detectorCircle(parent, radiusM, attributes) {
  const radius = radiusM * pixelsPerMeter();
  parent.appendChild(svgElement('circle', {cx: MOMENTUM_CONFIG.center.x, cy: MOMENTUM_CONFIG.center.y, r: radius.toFixed(2), fill: 'none', ...attributes}));
}

function buildMomentumSvg() {
  const svg = svgElement('svg', {viewBox: '0 0 940 510', role: 'img', 'aria-labelledby': 'atlas-momentum-title atlas-momentum-desc'});
  const title = svgElement('title', {id: 'atlas-momentum-title'});
  title.textContent = 'ATLAS barrel tracking and transverse momentum';
  const description = svgElement('desc', {id: 'atlas-momentum-desc'});
  description.textContent = 'A scaled transverse detector cross-section with Pixel, SCT, and TRT radii. Positive and negative tracks change curvature with the transverse-momentum slider.';
  svg.append(title, description, svgElement('rect', {x: 1, y: 1, width: 938, height: 508, rx: 8, fill: '#fcfdfa', stroke: '#d7dfd1'}));

  const detector = svgElement('g', {'aria-hidden': 'true'});
  detector.appendChild(svgElement('circle', {cx: 252, cy: 256, r: MOMENTUM_CONFIG.outerRadiusPx, fill: '#f7eddb', opacity: 0.5}));
  MOMENTUM_CONFIG.trtGuideRadiiM.forEach(radius => detectorCircle(detector, radius, {stroke: '#c2a66b', 'stroke-width': 1.7, opacity: 0.65, 'stroke-dasharray': '3 6'}));
  MOMENTUM_CONFIG.sctRadiiM.forEach(radius => detectorCircle(detector, radius, {stroke: '#7869b5', 'stroke-width': 3.7, opacity: 0.84}));
  MOMENTUM_CONFIG.pixelRadiiM.forEach(radius => detectorCircle(detector, radius, {stroke: '#4f9fc8', 'stroke-width': 2.3, opacity: 0.98}));
  detector.appendChild(svgElement('circle', {cx: 252, cy: 256, r: 2.7, fill: '#4d6754'}));

  [['positive', 1, '#316d94'], ['negative', -1, '#c35545']].forEach(([name, sign, color]) => {
    detector.appendChild(svgElement('path', {'data-momentum-path': name, stroke: color, 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round'}));
    hitRadii().forEach((_, index) => {
      const markerRadius = index < 4 ? 3 : index < 8 ? 3.8 : 4.5;
      detector.appendChild(svgElement('circle', {'data-momentum-hit': `${name}-${index}`, r: markerRadius, fill: color, stroke: '#fff', 'stroke-width': 1.5}));
    });
  });
  appendText(detector, 'Barrel radii shown to scale', {x: 252, y: 484, 'text-anchor': 'middle', 'font-family': 'Times New Roman,serif', 'font-size': 17, fill: '#536553'});
  svg.appendChild(detector);

  const explanation = svgElement('g', {'font-family': 'Times New Roman,Times,serif'});
  appendText(explanation, 'Momentum from track curvature', {x: 492, y: 53, 'font-size': 26, 'font-weight': 700, fill: '#30572e'});
  appendText(explanation, 'Solenoid: B ≈ 2 T · into the page', {x: 492, y: 87, 'font-size': 20, fill: '#405e3a'});
  explanation.appendChild(svgElement('circle', {cx: 775, cy: 80, r: 11, fill: 'none', stroke: '#405e3a', 'stroke-width': 1.7}));
  explanation.appendChild(svgElement('path', {d: 'M 769 74 L 781 86 M 781 74 L 769 86', stroke: '#405e3a', 'stroke-width': 1.7, 'stroke-linecap': 'round'}));
  explanation.appendChild(svgElement('line', {x1: 493, y1: 124, x2: 524, y2: 124, stroke: '#316d94', 'stroke-width': 5, 'stroke-linecap': 'round'}));
  appendText(explanation, 'Positive charge — bends left', {x: 536, y: 131, 'font-size': 20, fill: '#316d94'});
  explanation.appendChild(svgElement('line', {x1: 493, y1: 164, x2: 524, y2: 164, stroke: '#c35545', 'stroke-width': 5, 'stroke-linecap': 'round'}));
  appendText(explanation, 'Negative charge — bends right', {x: 536, y: 171, 'font-size': 20, fill: '#b14c3e'});
  appendText(explanation, 'Fitted curvature radius, R', {x: 492, y: 224, 'font-size': 19, fill: '#536553'});
  appendText(explanation, '', {x: 492, y: 262, 'font-size': 31, 'font-weight': 700, fill: '#30572e', 'data-momentum-radius': ''});
  appendText(explanation, 'Higher pT → larger R → less bending', {x: 492, y: 302, 'font-size': 20, fill: '#405e3a'});

  const inset = svgElement('g', {transform: 'translate(500,332)'});
  inset.appendChild(svgElement('circle', {cx: 47, cy: 55, r: 52, fill: '#edf6fa', stroke: '#b4d2dd', 'stroke-width': 1.2}));
  MOMENTUM_CONFIG.pixelRadiiM.forEach(radius => inset.appendChild(svgElement('circle', {cx: 47, cy: 55, r: (radius / MOMENTUM_CONFIG.pixelRadiiM.at(-1) * 47).toFixed(1), fill: 'none', stroke: '#4f9fc8', 'stroke-width': 2})));
  inset.appendChild(svgElement('circle', {cx: 47, cy: 55, r: 3, fill: '#466057'}));
  appendText(inset, 'Pixel detail inset*', {x: 111, y: 42, 'font-size': 18, 'font-weight': 700, fill: '#30572e'});
  appendText(inset, 'IBL + 3 Pixel layers', {x: 111, y: 67, 'font-size': 17, fill: '#52634c'});
  appendText(inset, '* Enlarged for visibility', {x: 111, y: 90, 'font-size': 16, fill: '#52634c'});
  explanation.appendChild(inset);

  const legend = svgElement('g', {'font-size': 17, fill: '#456344'});
  [[507, '#4f9fc8', 'Pixel × 4'], [645, '#7869b5', 'SCT × 4'], [766, '#c2a66b', 'TRT straws']].forEach(([x, color, label]) => {
    legend.appendChild(svgElement('circle', {cx: x, cy: 481, r: 6, fill: color}));
    appendText(legend, label, {x: x + 13, y: 486});
  });
  explanation.appendChild(legend);
  svg.appendChild(explanation);
  return svg;
}

function buildSlider() {
  const group = document.createElement('div');
  group.className = 'atlas-momentum__slider-group';
  const label = document.createElement('label');
  label.htmlFor = 'atlas-momentum-range';
  label.append('Transverse momentum: ');
  const output = document.createElement('output');
  output.id = 'atlas-momentum-output';
  output.htmlFor = 'atlas-momentum-range';
  output.dataset.momentumValue = '';
  label.appendChild(output);
  const input = document.createElement('input');
  input.id = 'atlas-momentum-range';
  input.dataset.momentumRange = '';
  input.type = 'range';
  input.min = String(MOMENTUM_CONFIG.momentumMinGeV);
  input.max = String(MOMENTUM_CONFIG.momentumMaxGeV);
  input.step = String(MOMENTUM_CONFIG.momentumStepGeV);
  input.value = String(MOMENTUM_CONFIG.momentumInitialGeV);
  input.setAttribute('aria-label', 'Transverse momentum in GeV per c');
  const limits = document.createElement('div');
  limits.className = 'atlas-momentum__range-labels';
  limits.setAttribute('aria-hidden', 'true');
  limits.innerHTML = `<span>${MOMENTUM_CONFIG.momentumMinGeV} GeV/c · more bending</span><span>${MOMENTUM_CONFIG.momentumMaxGeV} GeV/c · nearly straight</span>`;
  group.append(label, input, limits);
  return group;
}

function pathData(points) {
  return points.map((point, index) => `${index ? 'L' : 'M'} ${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(' ');
}

function initializeMomentum(root) {
  const host = root.querySelector('[data-momentum-interactive]');
  if (!host) return;
  const figure = document.createElement('div');
  figure.className = 'atlas-momentum__figure';
  figure.appendChild(buildMomentumSvg());
  const slider = buildSlider();
  host.replaceChildren(figure, slider);
  const input = slider.querySelector('[data-momentum-range]');
  const output = slider.querySelector('[data-momentum-value]');
  const radiusLabel = figure.querySelector('[data-momentum-radius]');

  function render() {
    const momentum = Number(input.value);
    [['positive', 1], ['negative', -1]].forEach(([name, sign]) => {
      figure.querySelector(`[data-momentum-path="${name}"]`).setAttribute('d', pathData(trackPoints(momentum, sign)));
      hitPositions(momentum, sign).forEach((position, index) => {
        const marker = figure.querySelector(`[data-momentum-hit="${name}-${index}"]`);
        marker.setAttribute('cx', position.x.toFixed(2));
        marker.setAttribute('cy', position.y.toFixed(2));
      });
    });
    output.textContent = `${momentum.toFixed(1)} GeV/c`;
    radiusLabel.textContent = `${radiusMeters(momentum).toFixed(2)} m`;
  }

  input.addEventListener('input', render);
  input.addEventListener('change', render);
  root.classList.add('is-enhanced');
  render();
}

export function initializeMomentumDemos(scope = document) {
  scope.querySelectorAll('section.atlas-momentum').forEach(initializeMomentum);
}
