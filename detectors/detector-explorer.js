/* Shared, dependency-free enhancement for detector pages.
   Text/image remain available without JavaScript. Hotspots need visual calibration. */
(() => {
  'use strict';

  const SVG_NS = 'http://www.w3.org/2000/svg';
  // Single font-size control for the detector annotations.
  // All custom detector callout labels share this user-approved value.
  const ATLAS_LABEL_FONT_FRACTION = 0.030;
  const svgElement = (tag, attributes = {}) => {
    const element = document.createElementNS(SVG_NS, tag);
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));
    return element;
  };

  // Fractional image coordinates for the approved 2022 ATLAS cutaway.
  // Label positions use viewport coordinates so they do not cover the zoom target.
  // The labelled official image is a separate full-detector reference, not a hotspot map.
  const detectors = {
    atlas: {
      components: {
        inner: {
          name: 'Inner Tracking Detector', focus: [0.590, 0.448], zoom: 1.85,
          annotations: [
            { label: ['Inner detectors'], box: [0.78, 0.21], points: [[0.590, 0.449]] }
          ],
          lead: 'The first clues are the paths charged particles leave behind.',
          measures: 'Positions of charged particles moving through a magnetic field.',
          why: 'The curved tracks help reveal particle momenta and where the particles came from.'
        },
        em: {
          name: 'Electromagnetic Calorimeter', focus: [0.590, 0.451], zoom: 1.77,
          annotations: [
            { label: ['Barrel electromagnetic calorimeter'], box: [0.230, 0.155],
              points: [[0.593, 0.398], [0.593, 0.506]] },
            // One label for both end-cap calorimeter assemblies. The left one
            // is partly obscured, so its endpoint uses a translucent circle.
            { label: ['End-cap calorimeters'], box: [0.660, 0.810], leaderAnchor: 'top', fan: true,
              points: [[0.505, 0.470], [0.649, 0.446]],
              hidden: {center: [0.505, 0.470], radius: 0.020, pointIndex: 0} }
          ],
          lead: 'The barrel forms a cylindrical layer. The end-cap calorimeter assemblies also contain electromagnetic sections.',
          measures: 'Energy deposited by electromagnetic showers from electrons and photons.',
          why: 'Together with tracking information, the deposited energy helps identify electrons and photons. The end-cap assemblies also contain hadronic calorimetry.'
        },
        hadronic: {
          name: 'Hadronic Calorimeter', focus: [0.575, 0.467], zoom: 1.48,
          annotations: [
            // Mark the middle of the visible green barrel sections, not the blue rim.
            // Keep the barrel callout above and the end-cap callout below.
            { label: ['Barrel hadronic', 'calorimeter'], box: [0.410, 0.120],
              points: [[0.575, 0.381], [0.576, 0.538]] },
            { label: ['End-cap hadronic', 'calorimeters'], box: [0.470, 0.825],
              leaderAnchor: 'top', fan: true,
              points: [[0.505, 0.470], [0.649, 0.446]],
              hidden: {center: [0.505, 0.470], radius: 0.020, pointIndex: 0} }
          ],
          lead: 'Outside the electromagnetic calorimeter sits a much thicker layer built to measure hadronic showers.',
          measures: 'Energy deposited by hadrons, including protons, neutrons, and particles produced in jets.',
          why: 'Its measurements complement the electromagnetic calorimeter and help reconstruct jets and the total energy balance of a collision.'
        },
        solenoid: {
          name: 'Solenoid Magnet', focus: [0.572, 0.463], zoom: 1.73,
          annotations: [
            // The thin solenoid coil surrounds the inner tracker. Both markers
            // identify the corresponding upper/lower tracking-side coil boundaries;
            // the lower marker must not sit on the barrel EM calorimeter.
            { label: ['Solenoid magnet'], box: [0.765, 0.175],
              leaderAnchor: 'bottom', fan: true,
              points: [[0.575, 0.430], [0.575, 0.487]] }
          ],
          lead: 'A thin superconducting coil encircles the inner tracking detector.',
          measures: 'The solenoid does not directly detect particles; it produces a magnetic field that bends charged tracks.',
          why: 'The bending direction reveals electric charge, while the curvature helps determine momentum.'
        },
        barrelToroid: {
          name: 'Barrel Toroid Magnet', focus: [0.630, 0.295], zoom: 1.23,
          annotations: [
            { label: ['Barrel toroid', 'magnet'], box: [0.785, 0.115],
              leaderAnchor: 'bottom', fan: true,
              points: [[0.690, 0.215], [0.688, 0.788]] }
          ],
          lead: 'Huge superconducting coils wrap around the central ATLAS detector.',
          measures: 'The barrel toroid provides a magnetic field for the surrounding muon spectrometer.',
          why: 'It bends muon trajectories so the outer chambers can measure muon momenta independently of the inner tracker.'
        },
        endcapToroid: {
          name: 'End-cap Toroid Magnet', focus: [0.440, 0.520], zoom: 1.33,
          annotations: [
            { label: ['End-cap toroid', 'magnet'], box: [0.765, 0.155],
              points: [[0.440, 0.540]] }
          ],
          lead: 'Toroid magnets at both ends of ATLAS extend the magnetic field into the forward regions.',
          measures: 'Like the barrel toroid, these magnets bend charged muons rather than directly recording their energy.',
          why: 'They enable momentum measurements for muons that leave the detector closer to the beam direction.'
        },
        muon: {
          name: 'Muon Chambers', focus: [0.500, 0.460], zoom: 1.06,
          annotations: [
            // The fan endpoints correspond to those in the official labelled
            // 2022 illustration; annotation boxes sit away from the hardware.
            { label: ['Barrel muon chambers'], box: [0.480, 0.080],
              leaderAnchor: 'bottom', fan: true,
              points: [[0.536, 0.150], [0.513, 0.239], [0.505, 0.324]] },
            { label: ['New Small Wheel', '(NSW) chambers'], box: [0.855, 0.825],
              leaderAnchor: 'top', fan: true,
              points: [[0.485, 0.467], [0.708, 0.378]] },
            { label: ['End-cap muon', 'chambers'], box: [0.190, 0.770],
              leaderAnchor: 'top', fan: true,
              points: [[0.164, 0.211], [0.294, 0.212], [0.364, 0.251]] }
          ],
          lead: 'Muons can reach detectors far beyond the calorimeters.',
          measures: 'Muon trajectories in barrel and end-cap chambers, including the New Small Wheel system.',
          why: 'Together with the magnetic field, these measurements help identify muons and determine their momenta.'
        }
      }
    }
  };

  function initializeDetector(root) {
    const config = detectors[root.dataset.detector];
    if (!config) return;
    root.dataset.labelFontFraction = String(ATLAS_LABEL_FONT_FRACTION); // Visible in browser console for verification.

    const one = selector => root.querySelector(selector);
    const many = selector => [...root.querySelectorAll(selector)];
    const stage = one('[data-detector-stage]');
    const image = one('[data-detector-image]');
    const overlay = one('[data-detector-overlay]');
    const status = one('[data-detector-zoom]');
    const labelledButton = one('[data-detector-labelled]');
    const emptyState = one('[data-detector-empty-state]');
    const detailsEntry = one('[data-detector-details-entry]');
    const detailsTitle = one('[data-detector-details-title]');
    const detailsLead = one('[data-detector-details-lead]');
    const detailsMeasuresLabel = one('[data-detector-details-measures-label]');
    const detailsMeasures = one('[data-detector-details-measures]');
    const detailsWhy = one('[data-detector-details-why]');
    const cleanSrc = image.getAttribute('src');
    const labelledSrc = image.dataset.labelledSrc;
    const cleanAlt = image.alt;
    const labelledAlt = 'Official labelled 2022 ATLAS detector cutaway with people for scale and subsystem callouts.';
    let selection = null;
    let labelled = false;
    let cleanSize = null;

    function updateButtons() {
      many('[data-detector-select]').forEach(button => {
        const active = !labelled && button.dataset.detectorSelect === selection;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      labelledButton.setAttribute('aria-pressed', String(labelled));
      labelledButton.setAttribute('aria-label', labelled
        ? 'Show full unlabelled detector illustration' : 'Show official labelled detector illustration');
      overlay.setAttribute('aria-hidden', String(labelled));
      overlay.classList.toggle('is-labelled', labelled);
      updateDetails();
    }

    function updateDetails() {
      if (!emptyState || !detailsEntry) return;
      const component = !labelled && selection ? config.components[selection] : null;
      emptyState.hidden = Boolean(component);
      detailsEntry.hidden = !component;
      if (!component) return;
      detailsTitle.textContent = component.name;
      detailsLead.textContent = component.lead;
      detailsMeasuresLabel.textContent = /solenoid|toroid/i.test(selection) ? 'What it does:' : 'What it measures:';
      detailsMeasures.textContent = component.measures;
      detailsWhy.textContent = component.why;
    }

    function moveFocus() {
      if (labelled || !selection) {
        stage.style.transform = 'translate(0%, 0%) scale(1)';
        status.textContent = labelled ? 'Official labelled overview' : 'Full-detector view';
        return;
      }
      const component = config.components[selection];
      const [x, y] = component.focus;
      const z = component.zoom;
      stage.style.transform = `translate(${(0.5 - z * x) * 100}%, ${(0.5 - z * y) * 100}%) scale(${z})`;
      status.textContent = `${z.toFixed(1)}× focus: ${component.name}`;
    }

    function setImage(showLabelled) {
      labelled = showLabelled;
      const expected = labelled ? labelledSrc : cleanSrc;
      image.alt = labelled ? labelledAlt : cleanAlt;
      if (image.getAttribute('src') !== expected) image.setAttribute('src', expected);
    }

    function reset() {
      selection = null;
      setImage(false);
      moveFocus();
      drawHotspots();
      updateButtons();
    }

    function select(key) {
      const component = config.components[key];
      if (!component) return;
      // Click the active subsystem a second time to deselect it and restore the overview.
      if (!labelled && selection === key) {
        reset();
        return;
      }
      // Selecting any component always returns to the interactive unlabelled art.
      setImage(false);
      selection = key;
      moveFocus();
      drawHotspots();
      updateButtons();
    }

    function toggleLabelled() {
      if (!labelledSrc) return;
      // Labelled is a standalone 1.0x overview; it never preserves old focus.
      selection = null;
      setImage(!labelled);
      moveFocus();
      drawHotspots();
      updateButtons();
    }

    function projected([x, y]) {
      if (!selection) return [x, y];
      const {focus, zoom} = config.components[selection];
      return [0.5 + zoom * (x - focus[0]), 0.5 + zoom * (y - focus[1])];
    }

    function addAnnotation(parent, annotation, w, h) {
      const font = ATLAS_LABEL_FONT_FRACTION * w;
      const leading = font * 1.20;
      const lines = annotation.label;
      // Measure the text in the same typeface used by the SVG. Character-count
      // estimates made V10 labels dramatically wider than their actual words.
      const measure = document.createElement('canvas').getContext('2d');
      if (measure) measure.font = `700 ${font}px "Times New Roman", Times, serif`;
      const textWidth = Math.max(...lines.map(line => measure
        ? measure.measureText(line).width : line.length * font * 0.5));
      const padX = font * 0.28;
      const padY = font * 0.16;
      const bw = textWidth + 2 * padX;
      const bh = font * 1.08 + (lines.length - 1) * leading + 2 * padY;
      const margin = 0.014 * w;
      const centerX = Math.max(bw / 2 + margin, Math.min(w - bw / 2 - margin, annotation.box[0] * w));
      const centerY = Math.max(bh / 2 + margin, Math.min(h - bh / 2 - margin, annotation.box[1] * h));
      const left = centerX - bw / 2;
      const top = centerY - bh / 2;
      const points = annotation.points.map(projected).map(([x, y]) => [x * w, y * h]);
      const group = svgElement('g', {'class': 'detector-explorer__callout', 'aria-hidden': 'true'});

      // Every muon leader begins from one shared junction at the box edge.
      // Compute the junction FROM the actual box after sizing its font;
      // no stale absolute fanOrigin can drift into or across the label.
      const fanAnchor = annotation.fan && annotation.leaderAnchor
        ? annotation.leaderAnchor === 'top' ? [centerX, top]
          : annotation.leaderAnchor === 'left' ? [left, centerY]
          : annotation.leaderAnchor === 'right' ? [left + bw, centerY]
          : [centerX, top + bh]
        : null;
      points.forEach(([px, py], index) => {
        if (px < 0 || px > w || py < 0 || py > h) return;
        const dx = px - centerX, dy = py - centerY;
        const horizontal = Math.abs(dx / bw) > Math.abs(dy / bh);
        const x1 = fanAnchor ? fanAnchor[0] : (horizontal ? centerX + (dx > 0 ? bw / 2 : -bw / 2) : centerX);
        const y1 = fanAnchor ? fanAnchor[1] : (horizontal ? centerY : centerY + (dy > 0 ? bh / 2 : -bh / 2));
        const dashed = annotation.dashedPoints?.includes(index);
        const suffix = annotation.fan ? ' detector-explorer__callout-line--fan' : '';
        const dotSuffix = annotation.fan ? ' detector-explorer__callout-point--fan' : '';
        const line = svgElement('line', {
          x1, y1, x2: px, y2: py, 'class': `detector-explorer__callout-line${suffix}`
        });
        if (dashed) {
          line.style.strokeDasharray = '7 6';
          line.style.stroke = '#5b7857';
          line.style.opacity = '0.7';
        }
        group.appendChild(line);
        // The partly obscured end-cap uses a translucent white disk instead.
        if (annotation.hidden?.pointIndex !== index) {
          group.appendChild(svgElement('circle', {
            cx: px, cy: py, r: w * 0.0035,
            'class': `detector-explorer__callout-point${dotSuffix}`
          }));
        }
      });

      group.appendChild(svgElement('rect', {
        x: left, y: top, width: bw, height: bh, rx: font * 0.17,
        'class': 'detector-explorer__callout-box'
      }));
      const firstBaseline = centerY - (lines.length - 1) * leading / 2;
      const text = svgElement('text', {
        x: centerX, y: firstBaseline, 'font-size': font,
        'text-anchor': 'middle', 'dominant-baseline': 'central',
        'class': 'detector-explorer__callout-label'
      });
      // An inline font size prevents accidental theme styles from overriding SVG presentation attributes.
      text.style.fontSize = `${font}px`;
      text.dataset.fontFraction = String(ATLAS_LABEL_FONT_FRACTION);
      lines.forEach((line, i) => {
        const tspan = svgElement('tspan', {x: centerX, y: firstBaseline + i * leading});
        tspan.textContent = line;
        text.appendChild(tspan);
      });
      group.appendChild(text);
      parent.appendChild(group);
    }

    function drawHotspots() {
      if (!cleanSize || labelled) {
        overlay.replaceChildren();
        return;
      }
      const [w, h] = cleanSize;
      overlay.setAttribute('viewBox', `0 0 ${w} ${h}`);
      overlay.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      overlay.replaceChildren();
      // Hotspot hit areas stay registered with the visible hardware after zoom.
      Object.entries(config.components).forEach(([key, component]) => {
        const g = svgElement('g', {
          'data-detector-hotspot': key, 'role': 'button', 'tabindex': '0',
          'aria-label': `Focus on ${component.name}`,
          'aria-pressed': String(selection === key),
          'class': 'detector-explorer__hotspot'
        });
        const uniquePoints = component.annotations.flatMap(a => a.points);
        uniquePoints.forEach(point => {
          const [x, y] = projected(point);
          if (x < 0 || x > 1 || y < 0 || y > 1) return;
          g.appendChild(svgElement('ellipse', {
            cx: x * w, cy: y * h, rx: w * 0.027, ry: h * 0.042,
            'class': 'hit-area'
          }));
        });
        g.addEventListener('click', () => select(key));
        g.addEventListener('keydown', event => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            select(key);
          }
        });
        overlay.appendChild(g);
      });
      if (selection) {
        const labels = svgElement('g', {'class': 'detector-explorer__selected-labels'});
        overlay.appendChild(labels);
        config.components[selection].annotations.forEach(annotation => {
          addAnnotation(labels, annotation, w, h);
          if (annotation.hidden) {
            const [x, y] = projected(annotation.hidden.center);
            const disk = svgElement('circle', {
              cx: x * w, cy: y * h, r: annotation.hidden.radius * w,
              'class': 'detector-explorer__hidden-region', 'aria-hidden': 'true'
            });
            // Overlay the leader endpoint: no opaque dot obscures the disk.
            labels.appendChild(disk);
          }
        });
      }
    }

    many('[data-detector-select]').forEach(button => {
      button.addEventListener('click', () => {
        select(button.dataset.detectorSelect);
        // Keep both the selector and top of the image visible after selection.
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        root.scrollIntoView({behavior: reducedMotion ? 'instant' : 'smooth', block: 'start'});
      });
    });
    one('[data-detector-reset]').addEventListener('click', reset);
    labelledButton.addEventListener('click', toggleLabelled);
    image.addEventListener('load', () => {
      if (!labelled) cleanSize = [image.naturalWidth, image.naturalHeight];
      drawHotspots();
    });
    image.addEventListener('error', () => {
      if (labelled) {
        selection = null;
        setImage(false);
        moveFocus();
        updateButtons();
        status.textContent = 'Labelled image unavailable; showing unlabelled detector.';
      } else {
        status.textContent = `Image unavailable: check ${image.getAttribute('src')}`;
      }
    });
    if (image.complete && image.naturalWidth > 0) cleanSize = [image.naturalWidth, image.naturalHeight];
    moveFocus();
    drawHotspots();
    updateButtons();
  }


  // V32: physics-guided, piecewise trajectories in the actual schematic coordinate system.
  // x points RIGHT, y points DOWN, all paths begin at the BEAMPIPE_CENTER.
  // For B into the paper, q<0 bends right and q>0 bends left.
  // Simplified solenoid occupies r < 195 SVG units. Calorimeters have no
  // applied magnetic field in this educational model. The separate, much weaker
  // effective outer curvature applies only to a muon in the toroidal region.
  const VIEWBOX = Object.freeze({width: 1672, height: 941});
  const BEAMPIPE_CENTER = Object.freeze({x: 835.5, y: 872.5});
  const FIELD = Object.freeze({solenoidRadius: 195, toroidInnerRadius: 645, toroidOuterRadius: 770});

  const particleDescriptions = {
    atlas: {
      electron: {
        name: 'Electron (e⁻)', color: '#1768D0', chargeSign: -1, kind: 'em-charged',
        beta: 14, radius: 425, depositRadius: 310,
        body: 'An electron curves rightward in the solenoidal field, then deposits its energy in an electromagnetic shower in the liquid-argon calorimeter.',
        signature: 'A right-curving inner-detector track matched to an electromagnetic calorimeter cluster.',
        legend: 'Blue solid line: electron track · Branches: electromagnetic shower'
      },
      positron: {
        name: 'Positron (e⁺)', color: '#EA7B20', chargeSign: 1, kind: 'em-charged',
        beta: -18, radius: 425, depositRadius: 310,
        body: 'A positron bends leftward, opposite to an electron, before producing an electromagnetic shower in the liquid-argon calorimeter.',
        signature: 'A left-curving inner-detector track matched to an electromagnetic calorimeter cluster.',
        legend: 'Orange solid line: positron track · Branches: electromagnetic shower'
      },
      photon: {
        name: 'Photon (γ)', color: '#B58A00', chargeSign: 0, kind: 'photon',
        beta: 1, depositRadius: 305,
        body: 'A photon has no electric charge, so its flight is straight. It leaves no primary charged track and starts an electromagnetic shower in the liquid-argon calorimeter.',
        signature: 'An electromagnetic shower with no matching primary charged-particle track.',
        legend: 'Gold dashed straight line: neutral flight · Branches: electromagnetic shower'
      },
      'charged-hadron-plus': {
        name: 'Charged Hadron (h⁺)', color: '#0B8E8A', chargeSign: 1, kind: 'had-charged',
        beta: -8, radius: 725, depositRadius: 515,
        body: 'A positively charged hadron curves gently left in the solenoid and then mainly deposits its energy in a hadronic calorimeter shower.',
        signature: 'A mildly left-curving charged track associated with a hadronic shower.',
        legend: 'Teal solid line: positive-hadron track · Branches: hadronic shower'
      },
      'charged-hadron-minus': {
        name: 'Charged Hadron (h⁻)', color: '#D4472F', chargeSign: -1, kind: 'had-charged',
        beta: 6, radius: 775, depositRadius: 510,
        body: 'A negatively charged hadron bends gently rightward in the solenoid and develops most of its shower in the hadronic calorimeter.',
        signature: 'A mildly right-curving charged track associated with a hadronic shower.',
        legend: 'Red-orange solid line: negative-hadron track · Branches: hadronic shower'
      },
      'neutral-hadron': {
        name: 'Neutral Hadron (h⁰)', color: '#198C54', chargeSign: 0, kind: 'neutral-hadron',
        beta: -7, depositRadius: 510,
        body: 'A neutral hadron travels in a straight line without a primary tracking signal and interacts mainly in the hadronic calorimeter.',
        signature: 'A hadronic calorimeter shower without an associated primary charged track.',
        legend: 'Green dashed straight line: neutral flight · Branches: hadronic shower'
      },
      muon: {
        name: 'Muon (μ⁻)', color: '#7138C9', chargeSign: -1, kind: 'muon',
        beta: 17, radius: 1500, depositRadius: 846,
        body: 'A high-energy negative muon bends gently rightward in the solenoid, passes through both calorimeters with little energy loss, undergoes a modest additional deflection in the muon system, and exits the detector.',
        signature: 'A continuing inner-detector trajectory through the outer muon chambers, with no large calorimeter shower.',
        legend: 'Purple solid line: continuing μ⁻ · Arrow: muon exits the spectrometer'
      }
    }
  };

  const round = value => Math.round(value * 10) / 10;
  const point = (x, y) => ({x: round(x), y: round(y)});
  const degToRad = degrees => degrees * Math.PI / 180;
  const pointToString = p => `${round(p.x)} ${round(p.y)}`;
  const pathFromPoints = points => points.map((p, index) => `${index === 0 ? 'M' : 'L'} ${pointToString(p)}`).join(' ');
  const distance = p => Math.hypot(p.x - BEAMPIPE_CENTER.x, p.y - BEAMPIPE_CENTER.y);

  function normalizeVector(vx, vy) {
    const norm = Math.hypot(vx, vy) || 1;
    return {x: vx / norm, y: vy / norm};
  }
  function leftNormal(unitVector) { return {x: -unitVector.y, y: unitVector.x}; }

  // Integrate dx/ds = sin(beta), dy/ds = -cos(beta), d(beta)/ds = -q/R.
  // Separate field regions ensure C1-continuous trajectories at boundaries.
  function propagateParticle(profile) {
    const origin = BEAMPIPE_CENTER;
    let x = origin.x, y = origin.y, beta = degToRad(profile.beta);
    const steps = [point(x, y)];
    for (let i = 0; i < 650; i += 1) {
      const radius = Math.hypot(x - origin.x, y - origin.y);
      if (profile.depositRadius - radius < 0.1) break;
      const ds = Math.min(2, profile.depositRadius - radius);
      let curvature = 0;
      if (profile.chargeSign && radius < FIELD.solenoidRadius) curvature = -profile.chargeSign / profile.radius;
      // The muon toroid field is represented by a small, separate deflection.
      if (profile.kind === 'muon' && radius >= FIELD.toroidInnerRadius && radius < FIELD.toroidOuterRadius) curvature = -1 / 3500;
      const midAngle = beta + curvature * ds / 2;
      x += ds * Math.sin(midAngle);
      y -= ds * Math.cos(midAngle);
      beta += curvature * ds;
      steps.push(point(x, y));
      if (x < 25 || x > VIEWBOX.width - 25 || y < 25 || y > VIEWBOX.height - 25) break;
    }
    return steps;
  }

  // Neutral flight lines are strictly straight and start at the common origin.
  function neutralFlight(profile) {
    const beta = degToRad(profile.beta);
    return [point(BEAMPIPE_CENTER.x, BEAMPIPE_CENTER.y), point(
      BEAMPIPE_CENTER.x + profile.depositRadius * Math.sin(beta),
      BEAMPIPE_CENTER.y - profile.depositRadius * Math.cos(beta)
    )];
  }

  // Shower confinement in two schematic annuli (ECAL: 255-360, HCAL: 385-650).
  // Limiting every generation prevents branches from spilling into another system.
  function showerPoint(raw, type) {
    const r = distance(raw);
    const inner = type === 'em' ? 258 : 392;
    const outer = type === 'em' ? 357 : 648;
    const bounded = Math.max(inner, Math.min(outer, r));
    const azimuth = Math.atan2(raw.x - BEAMPIPE_CENTER.x, BEAMPIPE_CENTER.y - raw.y);
    const angle = Math.max(-0.66, Math.min(0.66, azimuth));
    return point(BEAMPIPE_CENTER.x + bounded * Math.sin(angle), BEAMPIPE_CENTER.y - bounded * Math.cos(angle));
  }

  // Multi-generation branched cascade, deterministically sized to stay in the
  // appropriate layer: main rays, secondary splits, tertiary twigs and beads.
  function buildShower(deposit, type, color) {
    const axis = normalizeVector(deposit.x - BEAMPIPE_CENTER.x, deposit.y - BEAMPIPE_CENTER.y);
    const normal = leftNormal(axis);
    const isHad = type === 'had';
    const root = showerPoint(deposit, type);
    const branches = [];
    const primary = isHad
      ? [[43,-8],[48,5],[39,-23],[41,22],[29,-33],[28,35],[53,0],[34,-14],[35,14]]
      : [[21,-5],[25,3],[19,-14],[20,14],[16,-20],[16,19],[27,0],[22,-10],[22,10]];
    const emit = (start, forward, sideways, kind) => {
      const raw = point(start.x + axis.x*forward + normal.x*sideways, start.y + axis.y*forward + normal.y*sideways);
      const end = showerPoint(raw, type);
      if (Math.hypot(end.x-start.x,end.y-start.y) > 1.8) branches.push({kind, points:[start,end]});
      return end;
    };
    const p1 = primary.map(([a,b]) => emit(root,a,b,'shower'));
    const sLen = isHad ? 19 : 12;
    const tLen = isHad ? 11 : 8;
    const p2 = [];
    [0,1,2,3,4,5,6,7,8].forEach((idx,j)=> {
      const outward = j%3===0 ? sLen*1.05:sLen*0.8;
      const spread = (j%2 ? 1:-1)*(isHad ? 9:6);
      p2.push(emit(p1[idx],outward,spread,'shower-secondary'));
      if (j%3===1) p2.push(emit(p1[idx],outward*0.7,-spread*0.8,'shower-secondary'));
    });
    p2.forEach((start,j)=> {
      const spread = (j%2 ? 1:-1)*(isHad ? 5:3.5);
      const tip = emit(start, tLen*(j%3===0?1:0.8),spread,'shower-tertiary');
      if (j%2===0) branches.push({kind:'spark',x:tip.x,y:tip.y,r:isHad?3:2.8});
    });
    branches.push({kind:'deposit',x:root.x,y:root.y,r:isHad?10.2:8.5});
    return branches;
  }

  function buildArrowHead(tail, head, size = 18) {
    const dir = normalizeVector(head.x - tail.x, head.y - tail.y);
    const normal = leftNormal(dir);
    const base = point(head.x - dir.x * size, head.y - dir.y * size);
    const wing = size * 0.46;
    return [point(head.x, head.y),point(base.x + normal.x*wing,base.y + normal.y*wing),point(base.x - normal.x*wing,base.y - normal.y*wing)];
  }

  function buildParticleGeometry(profile) {
    const track = profile.chargeSign ? propagateParticle(profile) : neutralFlight(profile);
    const deposit = track[track.length-1];
    const segments = [{kind: profile.chargeSign ? 'track' : 'flight',points:track}];
    if (profile.kind === 'muon') {
      segments.push({kind:'arrow',points:buildArrowHead(track[track.length-11],deposit,24)});
    } else {
      segments.push(...buildShower(deposit, profile.kind==='em-charged'||profile.kind==='photon'?'em':'had',profile.color));
    }
    return {segments,track,deposit};
  }

  function initializeParticles(root) {
    const profiles = particleDescriptions[root.dataset.particleExplorer];
    if (!profiles) return;
    const one = selector => root.querySelector(selector);
    const many = selector => [...root.querySelectorAll(selector)];
    const overlay = one('[data-particle-overlay]');
    const labelledButton = one('[data-particle-labelled]');
    const resetButton = one('[data-particle-reset]');
    const labels = one('[data-particle-labels]');
    const status = one('[data-particle-label-status]');
    const emptyState = one('[data-particle-empty-state]');
    const detailsList = one('[data-particle-details-list]');
    if (!overlay || !labelledButton || !resetButton || !labels || !status || !emptyState || !detailsList) return;

    const order = Object.keys(profiles);
    const selected = new Set();
    let labelled = false;

    const textColorForBackground = color => {
      const hex = color.replace('#', '');
      const value = hex.length === 3 ? hex.split('').map(ch => ch + ch).join('') : hex;
      const r = parseInt(value.slice(0, 2), 16);
      const g = parseInt(value.slice(2, 4), 16);
      const b = parseInt(value.slice(4, 6), 16);
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance > 0.62 ? '#17301a' : '#ffffff';
    };

    many('[data-particle-select]').forEach(button => {
      const profile = profiles[button.dataset.particleSelect];
      if (!profile) return;
      button.style.setProperty('--particle-button-color', profile.color);
      button.style.setProperty('--particle-button-text', textColorForBackground(profile.color));
    });

    function selectedKeys() { return order.filter(key => selected.has(key)); }
    function selectedNames() { return selectedKeys().map(key => profiles[key].name); }

    function renderDetails() {
      const keys = selectedKeys();
      emptyState.hidden = keys.length > 0;
      detailsList.replaceChildren();
      keys.forEach(key => {
        const profile = profiles[key];
        const card = document.createElement('article');
        card.className = 'particle-explorer__details-entry';
        const title = document.createElement('h3');
        title.textContent = profile.name;
        const body = document.createElement('p');
        body.textContent = profile.body;
        const sig = document.createElement('p');
        sig.innerHTML = `<strong>Typical signature:</strong> ${profile.signature}`;
        const legend = document.createElement('p');
        legend.className = 'particle-explorer__legend';
        legend.textContent = profile.legend;
        card.append(title, body, sig, legend);
        detailsList.appendChild(card);
      });
    }

    function viewStatusText() {
      const count = selected.size;
      if (!count && !labelled) return 'Full detector view';
      if (!count && labelled) return 'Labelled detector slice';
      const names = selectedNames();
      const labelSuffix = labelled ? ' + labels' : '';
      if (count <= 2) return `${names.join(' + ')} overlay${count > 1 ? 's' : ''}${labelSuffix}`;
      return `${count} particle overlays${labelSuffix}`;
    }

    function overlayAriaLabel() {
      const names = selectedNames();
      if (!names.length) return labelled ? 'Labelled ATLAS detector slice' : 'ATLAS detector slice';
      return `Conceptual detector response for ${names.join(', ')}`;
    }

    function updateView() {
      labels.hidden = !labelled;
      labelledButton.setAttribute('aria-pressed', String(labelled));
      many('[data-particle-select]').forEach(button => {
        const key = button.dataset.particleSelect;
        const active = selected.has(key);
        const profile = profiles[key];
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
        if (profile) {
          button.style.borderColor = active ? profile.color : '';
          button.style.background = active ? profile.color : '';
          button.style.color = active ? textColorForBackground(profile.color) : '';
        }
      });
      many('[data-particle-trace]').forEach(group => {
        const visible = selected.has(group.dataset.particleTrace);
        group.classList.toggle('is-active', visible);
        group.setAttribute('aria-hidden', String(!visible));
      });
      renderDetails();
      status.textContent = viewStatusText();
      overlay.setAttribute('aria-label', overlayAriaLabel());
    }

    function createPath(kind, points) {
      return svgElement('path', {d: pathFromPoints(points), 'class': `particle-explorer__path particle-explorer__path--${kind}`});
    }

    function drawTracks() {
      overlay.setAttribute('viewBox', `0 0 ${VIEWBOX.width} ${VIEWBOX.height}`);
      overlay.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      overlay.replaceChildren();
      Object.entries(profiles).forEach(([key, profile]) => {
        const group = svgElement('g', {'class': 'particle-explorer__trajectory', 'data-particle-trace': key, 'aria-hidden': 'true'});
        group.style.setProperty('--particle-color', profile.color);
        const geometry = buildParticleGeometry(profile);
        geometry.segments.forEach(segment => {
          if (segment.kind === 'spark') {
            group.appendChild(svgElement('circle', {cx: segment.x, cy: segment.y, r: segment.r, 'class': 'particle-explorer__spark'}));
          } else if (segment.kind === 'deposit') {
            group.appendChild(svgElement('circle', {cx: segment.x, cy: segment.y, r: segment.r, 'class': 'particle-explorer__deposit'}));
          } else if (segment.kind === 'arrow') {
            group.appendChild(svgElement('polygon', {
              points: segment.points.map(p => `${round(p.x)},${round(p.y)}`).join(' '),
              fill: profile.color, stroke: '#fff', 'stroke-width': 2.2, 'stroke-linejoin': 'round'
            }));
          } else if (segment.points) {
            group.appendChild(createPath(segment.kind, segment.points));
          }
        });
        overlay.appendChild(group);
      });
    }

    resetButton.addEventListener('click', () => {
      selected.clear();
      labelled = false;
      updateView();
    });

    labelledButton.addEventListener('click', () => {
      labelled = !labelled;
      updateView();
    });

    many('[data-particle-select]').forEach(button => {
      button.addEventListener('click', () => {
        const key = button.dataset.particleSelect;
        if (!profiles[key]) return;
        if (selected.has(key)) selected.delete(key);
        else selected.add(key);
        updateView();
      });
    });

    // Official animation is deliberately loaded on demand to avoid downloading
    // the GIF on every page view. Closing the dialog does not modify overlays.
    const animationOpen = one('[data-particle-animation-open]');
    const animationDialog = one('[data-particle-animation-dialog]');
    const animationImage = one('[data-particle-animation-image]');
    const animationError = one('[data-particle-animation-error]');
    if (animationOpen && animationDialog && animationImage) {
      animationOpen.addEventListener('click', () => {
        if (typeof animationDialog.showModal !== 'function') return;
        if (animationError) animationError.hidden = true;
        animationImage.src = animationImage.dataset.src;
        animationDialog.showModal();
      });
      animationImage.addEventListener('error', () => {
        if (animationError) animationError.hidden = false;
      });
      animationImage.addEventListener('load', () => {
        if (animationError) animationError.hidden = true;
      });
      animationDialog.addEventListener('click', event => {
        if (event.target === animationDialog) animationDialog.close();
      });
      animationDialog.addEventListener('close', () => {
        animationImage.removeAttribute('src');
        animationOpen.focus();
      });
    }

    drawTracks();
    updateView();
  }

  document.querySelectorAll('[data-detector]').forEach(initializeDetector);
  document.querySelectorAll('[data-particle-explorer]').forEach(initializeParticles);
})();
