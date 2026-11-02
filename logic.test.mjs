import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluate } from './utils.mjs';
test('expression precedence, percentages and unsafe input', () => {
  assert.equal(evaluate('1,000 × 15%'), 150);
  assert.equal(evaluate('-(2 + 3)^2'), -25);
  assert.equal(evaluate('2^3^2'), 512);
  assert.throws(() => evaluate('1 / 0'));
  assert.throws(() => evaluate('window.alert(1)'));
});
