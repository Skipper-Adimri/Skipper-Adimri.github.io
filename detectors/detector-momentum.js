/* ATLAS V56: synchronize the momentum slider, both tracks, all hits and readouts. */
(() => {
  'use strict';
  const demo = document.querySelector('[data-momentum-demo]');
  if (!demo) return;
  const input = demo.querySelector('[data-momentum-range]');
  const output = demo.querySelector('[data-momentum-value]');
  const radiusLabel = demo.querySelector('[data-momentum-radius]');
  const outerRadiusM = 1.082, outerPx = 192, cx = 252, cy = 256, fieldT = 2.0;
  const pxPerM = outerPx / outerRadiusM;
  const pixel = [0.0332, 0.0505, 0.0885, 0.1225];
  const sct = [0.299, 0.371, 0.443, 0.514];
  const trt = [0.64, 0.82, 0.99, 1.082];
  const hitRadiiM = [...pixel, ...sct, ...trt];
  const charges = [['positive', 1], ['negative', -1]];
  const paths = Object.fromEntries(charges.map(([charge]) => [charge, demo.querySelector(`[data-momentum-path="${charge}"]`)]));
  if (!input || !output || !radiusLabel || !paths.positive || !paths.negative) return;
  const render = () => {
    const pt = Number(input.value);
    const radiusM = pt / (0.299792458 * fieldT);
    const radiusPx = radiusM * pxPerM;
    const maxTheta = 2 * Math.asin(outerPx / (2 * radiusPx));
    for (const [charge, sign] of charges) {
      const point = theta => [cx - sign * radiusPx * (1 - Math.cos(theta)), cy - radiusPx * Math.sin(theta)];
      const coords = Array.from({length: 91}, (_, i) => point(maxTheta * i / 90));
      paths[charge].setAttribute('d', coords.map(([x, y], i) => `${i ? 'L' : 'M'} ${x.toFixed(2)},${y.toFixed(2)}`).join(' '));
      hitRadiiM.forEach((r, i) => {
        const theta = 2 * Math.asin((r * pxPerM) / (2 * radiusPx));
        const [x, y] = point(theta);
        const hit = demo.querySelector(`[data-momentum-hit="${charge}-${i}"]`);
        if (!hit) { console.warn(`ATLAS tracking: missing hit marker ${charge}-${i}`); return; }
        hit.setAttribute('cx', x.toFixed(2));
        hit.setAttribute('cy', y.toFixed(2));
      });
    }
    output.textContent = `${pt.toFixed(1)} GeV/c`;
    radiusLabel.textContent = `${radiusM.toFixed(2)} m`;
  };
  input.addEventListener('input', render);
  input.addEventListener('change', render);
  render();
})();
