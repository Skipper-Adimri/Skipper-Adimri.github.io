import assert from 'node:assert/strict';
import {MOMENTUM_CONFIG, hitPositions, radiusMeters, trackPoints} from '../_scripts/momentum.js';

const expectedRadii = new Map([
  [0.5, 0.834],
  [1, 1.668],
  [2, 3.336],
  [5, 8.339],
  [10, 16.678]
]);

for (const [momentum, expected] of expectedRadii) {
  assert.ok(Math.abs(radiusMeters(momentum) - expected) < 0.0015, `radius at ${momentum} GeV/c`);
  const positive = trackPoints(momentum, 1);
  const negative = trackPoints(momentum, -1);
  assert.equal(positive.length, 91);
  assert.equal(negative.length, 91);
  assert.equal(hitPositions(momentum, 1).length, 12);
  assert.equal(hitPositions(momentum, -1).length, 12);
  positive.forEach((point, index) => {
    assert.ok(Math.abs((point.x + negative[index].x) - 2 * MOMENTUM_CONFIG.center.x) < 1e-9, 'charge paths mirror in x');
    assert.ok(Math.abs(point.y - negative[index].y) < 1e-9, 'charge paths share y');
  });
}

assert.equal(MOMENTUM_CONFIG.momentumMinGeV, 0.5);
assert.equal(MOMENTUM_CONFIG.momentumMaxGeV, 10);
assert.equal(MOMENTUM_CONFIG.momentumStepGeV, 0.5);
assert.equal(MOMENTUM_CONFIG.momentumInitialGeV, 1.0);

console.log('momentum tests: PASS');
