import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState, rx, rzz, localStates, stages, gatePaths, evolve} from '../src/lib/ising-animation.js';
const near = (a,b) => assert.ok(Math.abs(a-b)<1e-10, `${a} != ${b}`);
test('RX(pi) flips a basis qubit and preserves normalization', () => {
  const state=initialState(); rx(state,0,Math.PI);
  near(localStates(state)[0].p1,0);
  near(state.reduce((n,[r,i])=>n+r*r+i*i,0),1);
});
test('RZZ changes phase without changing computational populations', () => {
  const state=initialState(); rx(state,0,Math.PI/2);rx(state,1,Math.PI/2);
  const before=localStates(state);rzz(state,0,1,Math.PI/2);const after=localStates(state);
  near(before[0].p1,after[0].p1);near(before[1].p1,after[1].p1);
  near(after[0].purity,.5);near(after[1].purity,.5);
});
test('all animation stages have physical local states and matching gate paths', () => {
  const sequence=stages();assert.equal(sequence.length,15);
  for(const stage of sequence)for(let q=0;q<6;q++){
    const {p1,purity}=stage.after[q];assert.ok(p1>=-1e-10&&p1<=1+1e-10);assert.ok(purity>=.5-1e-10&&purity<=1+1e-10);
    for (const part of ["approach", "upper", "lower", "exit"]) assert.match(gatePaths(stage.layer,stage.kind,q)[part],/^M/);
  }
  const paths = gatePaths(0,0,0);
  assert.ok(paths.upper.startsWith('M100 150'));
  assert.ok(paths.lower.startsWith('M100 150'));
  assert.ok(paths.upper.endsWith('V150'));
  assert.ok(paths.lower.endsWith('V150'));
  assert.ok(paths.upper.includes('133'));
  assert.ok(paths.lower.includes('167'));
});
test('partial gate evolution preserves normalization and reaches the next stage exactly', () => {
  const sequence = stages();
  sequence.forEach((stage, index) => {
    for (const fraction of [0, .2, .5, .8, 1]) {
      const state = evolve(stage.input, stage.kind, fraction);
      near(state.reduce((sum, [re, im]) => sum + re*re + im*im, 0), 1);
      if (stage.kind !== 0) localStates(state).forEach((value,q) => near(value.p1,stage.before[q].p1));
    }
    if(index < sequence.length-1) assert.deepEqual(evolve(stage.input,stage.kind,1),sequence[index+1].input);
  });
});
