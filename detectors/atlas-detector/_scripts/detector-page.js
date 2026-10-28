import {initializeViewSwitches} from './view-switch.js?v=1';
import {initializeDetectorExplorers} from './detector-explorer.js?v=1';
import {initializeParticleExplorers} from './particle-explorer.js?v=1';
import {initializeMomentumDemos} from './momentum.js?v=1';

function initializeDetectorPage() {
  initializeViewSwitches();
  initializeDetectorExplorers();
  initializeParticleExplorers();
  initializeMomentumDemos();
  document.documentElement.classList.add('atlas-detector-enhanced');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeDetectorPage, {once: true});
} else {
  initializeDetectorPage();
}
