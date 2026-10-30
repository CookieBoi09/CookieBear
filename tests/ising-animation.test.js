import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState, rx, rzz, localStates, stages, gatePath} from '../src/lib/ising-animation.js';
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
    assert.match(gatePath(stage.layer,stage.kind,q),/^M/);
  }
  assert.match(gatePath(0,0,0),/V133 H134 V167 H100/);
  assert.match(gatePath(0,1,0),/V179 H200 V199 H180/);
});
