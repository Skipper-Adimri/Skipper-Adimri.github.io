import assert from 'node:assert/strict';
import {access, readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(testDirectory, '../../..');
const outputDirectory = path.join(projectRoot, '_site/detectors/atlas-detector');
const html = await readFile(path.join(outputDirectory, 'index.html'), 'utf8');
const css = await readFile(path.join(outputDirectory, 'detector.css'), 'utf8');

assert.match(html, /<main class="content" id="quarto-document-content">/);
assert.match(html, /<math[^>]+xmlns="http:\/\/www\.w3\.org\/1998\/Math\/MathML"/);
assert.doesNotMatch(html, /MathJax|mathjax/);
assert.match(html, /<script type="module" src="_scripts\/detector-page\.js\?v=1"><\/script>/);
assert.equal((html.match(/<section[^>]+data-detector-card=/g) || []).length, 7);
assert.equal((html.match(/<section[^>]+data-particle-card=/g) || []).length, 7);
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
  'cutaway.png',
  'cutaway_labelled_ATLAS.png',
  'slice-clean.png',
  'slice-annotations.svg',
  'Atlas_Simulation.gif',
  'calorimeter-run3-labelled.png',
  'tracking-principle.svg',
  'tracking-detector-details.png',
  'sagitta-geometry.svg',
  'fcal-longitudinal-layout.svg'
]) {
  await access(path.join(projectRoot, '_site/detectors/images/atlas', image));
}

console.log('rendered page tests: PASS');
