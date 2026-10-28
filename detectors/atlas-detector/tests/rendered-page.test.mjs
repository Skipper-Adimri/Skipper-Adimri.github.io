import assert from 'node:assert/strict';
import {access, readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(testDirectory, '../../..');
const outputDirectory = path.join(projectRoot, '_site/detectors/atlas-detector');
const html = await readFile(path.join(outputDirectory, 'index.html'), 'utf8');
const css = await readFile(path.join(outputDirectory, 'detector.css'), 'utf8');
const detectorExplorer = await readFile(path.join(outputDirectory, '_scripts/detector-explorer.js'), 'utf8');
const particleExplorer = await readFile(path.join(outputDirectory, '_scripts/particle-explorer.js'), 'utf8');
const viewSwitch = await readFile(path.join(outputDirectory, '_scripts/view-switch.js'), 'utf8');

assert.match(html, /<main class="content" id="quarto-document-content">/);
assert.match(html, /<math[^>]+xmlns="http:\/\/www\.w3\.org\/1998\/Math\/MathML"/);
assert.doesNotMatch(html, /MathJax|mathjax/);
assert.match(html, /<script type="module" src="_scripts\/detector-page\.js\?v=3"><\/script>/);
assert.equal((html.match(/<section[^>]+data-detector-card=/g) || []).length, 7);
assert.equal((html.match(/<section[^>]+data-particle-card=/g) || []).length, 7);
const detectorStageStart = html.indexOf('data-detector-stage');
const detectorStageEnd = html.indexOf('</div>', detectorStageStart);
const detectorOverlay = html.indexOf('<svg class="detector-explorer__overlay"');
assert.ok(detectorStageStart >= 0 && detectorStageEnd > detectorStageStart);
assert.ok(
  detectorOverlay > detectorStageEnd,
  'detector overlay must remain outside the zooming image stage'
);
assert.doesNotMatch(html, /id="toc-electron-e-"/);
assert.doesNotMatch(html, /<section[^>]+data-(?:detector|particle)-card=[^>]+hidden/);
assert.match(html, /<section[^>]+class="[^"]*atlas-momentum__explanation[^"]*"/);
assert.doesNotMatch(
  css,
  /\.atlas-view-switch\.is-enhanced\s+\.atlas-view-panel__title\s*\{/,
  'never collapse the panel section when visually hiding its Quarto heading'
);
assert.match(css, /\.atlas-view-switch\.is-enhanced\s+\.atlas-view-panel\s*>\s*h4:first-child/);
assert.match(css, /\.atlas-view-panel\s+figcaption\s*\{[^}]*padding:\s*\.65rem\s+1rem\s+0/s);
assert.match(
  detectorExplorer,
  /text\.style\.fontSize\s*=\s*`\$\{font\}px`/,
  'detector callout labels must retain their calibrated size inside Quarto'
);

for (const resource of [
  '_scripts/detector-page.js',
  '_scripts/view-switch.js',
  '_scripts/detector-explorer.js',
  '_scripts/particle-explorer.js',
  '_scripts/momentum.js',
  'detector.css'
]) {
  await access(path.join(outputDirectory, resource));
}

for (const image of [
  'cutaway-1600.webp',
  'cutaway-3200.webp',
  'cutaway-labelled-1600.webp',
  'cutaway-labelled-3200.webp',
  'slice-clean.webp',
  'slice-annotations.svg',
  'Atlas_Simulation.webp',
  'atlas-simulation-poster.webp',
  'calorimeter-run3-labelled.webp',
  'tracking-principle.svg',
  'tracking-detector-details.webp',
  'sagitta-geometry.svg',
  'fcal-longitudinal-layout.svg'
]) {
  await access(path.join(projectRoot, '_site/detectors/images/atlas', image));
}

assert.doesNotMatch(html, /Reuse permission for this image remains unresolved/);
assert.match(html, /ATLAS Experiment © CERN/);
assert.match(html, /detector paper, Figure 4\.2/);
assert.match(html, /alt="Cutaway of the ATLAS calorimeter with callouts identifying/);
assert.match(html, /alt="Concentric Pixel, SCT, and TRT tracking layers crossed/);
assert.doesNotMatch(html, /Atlas_Simulation\.gif|cutaway_labelled_ATLAS\.png/);
assert.match(html, /srcset="\.\.\/images\/atlas\/cutaway-1600\.webp 1600w, \.\.\/images\/atlas\/cutaway-3200\.webp 3200w"/);
assert.match(html, /data-particle-animation-toggle/);
assert.match(particleExplorer, /animationImage\.dataset\.poster/);
assert.match(viewSwitch, /panel\.scrollIntoView\(\{behavior:/);
assert.match(css, /\.atlas-view-switch__button\s*\{[^}]*min-height:\s*44px/s);

console.log('rendered page tests: PASS');
