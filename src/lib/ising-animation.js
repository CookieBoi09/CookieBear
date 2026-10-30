// Six-qubit state-vector model for the decorative circuit animation.
// RX(theta) and RZZ(phi) implement one first-order Trotter step per layer.
// Dots trace the diagram; they are not literal particles or measurements.
export const QUBITS = 6;
export const LAYERS = 5;
export const RX_ANGLE = Math.PI / 3;
export const ZZ_ANGLE = Math.PI / 4;
export function initialState() {
  const state = Array.from({ length: 1 << QUBITS }, () => [0, 0]);
  state[0b010101] = [1, 0];
  return state;
}
export function rx(state, qubit, angle) {
  const c = Math.cos(angle / 2), s = Math.sin(angle / 2), mask = 1 << qubit;
  for (let i = 0; i < state.length; i++) {
    if (i & mask) continue;
    const j = i | mask, [ar, ai] = state[i], [br, bi] = state[j];
    state[i] = [c * ar + s * bi, c * ai - s * br];
    state[j] = [c * br + s * ai, c * bi - s * ar];
  }
}
export function rzz(state, a, b, angle) {
  for (let i = 0; i < state.length; i++) {
    const sign = ((i >> a) & 1) === ((i >> b) & 1) ? 1 : -1;
    const phase = -sign * angle / 2, c = Math.cos(phase), s = Math.sin(phase);
    const [re, im] = state[i];
    state[i] = [re * c - im * s, re * s + im * c];
  }
}
export function localStates(state) {
  return Array.from({ length: QUBITS }, (_, q) => {
    let p1 = 0, re = 0, im = 0;
    for (let i = 0; i < state.length; i++) {
      const [ar, ai] = state[i];
      if (i & (1 << q)) { p1 += ar * ar + ai * ai; continue; }
      const [br, bi] = state[i | (1 << q)];
      re += ar * br + ai * bi;
      im += ai * br - ar * bi;
    }
    // Reduced-state purity: less than one indicates entanglement with the rest.
    return { p1, purity: (1 - p1) ** 2 + p1 ** 2 + 2 * (re * re + im * im) };
  });
}
export function evolve(state, kind, fraction) {
  const result = state.map(value => [...value]);
  if (kind === 0) for (let q = 0; q < QUBITS; q++) rx(result, q, RX_ANGLE * fraction);
  else for (let q = kind - 1; q < QUBITS - 1; q += 2) rzz(result, q, q + 1, ZZ_ANGLE * fraction);
  return result;
}
export function stages() {
  let state = initialState();
  const result = [];
  for (let layer = 0; layer < LAYERS; layer++) {
    for (let kind = 0; kind < 3; kind++) {
      const input = state;
      state = evolve(input, kind, 1);
      result.push({ layer, kind, input, before: localStates(input), after: localStates(state) });
    }
  }
  return result;
}
// Equal-length branches share a left entry and a right exit. The two dots
// depict alternative basis amplitudes, not a particle splitting in space.
export function gatePaths(layer, kind, q) {
  const base = 100 + layer * 278, y = 150 + q * 78;
  const previousX = kind === 0 ? (layer ? base - 98 : 24) : base + (kind === 1 ? 34 : 100);
  const paired = q % 2 === kind - 1 ? q : q - 1;
  const bypass = kind === 2 && (paired < 0 || paired >= QUBITS - 1);
  const x = kind === 0 ? base + 17 : base + (kind === 1 ? 90 : 170);
  const cy = kind === 0 ? y : 150 + paired * 78 + 39;
  const half = kind === 0 ? 17 : 10;
  const left = x - half, right = x + half;
  if (bypass) return { approach: `M${previousX} ${y} H${x + 10}`, upper: `M${x + 10} ${y}`, lower: `M${x + 10} ${y}`, exit: `M${x + 10} ${y}`, bypass: true };
  const branch = direction => {
    const edge = cy + direction * half;
    const r = kind === 0 ? 4 : 2;
    return `M${left} ${cy} V${edge - direction * r} Q${left} ${edge} ${left + r} ${edge} H${right - r} Q${right} ${edge} ${right} ${edge - direction * r} V${cy}`;
  };
  return {
    approach: `M${previousX} ${y} H${left} V${cy}`,
    upper: branch(-1), lower: branch(1),
    exit: `M${right} ${cy} V${y}`,
    bypass: false,
  };
}
