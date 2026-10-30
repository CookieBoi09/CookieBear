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
export function stages() {
  const state = initialState(), result = [];
  for (let layer = 0; layer < LAYERS; layer++) {
    for (let kind = 0; kind < 3; kind++) {
      const before = localStates(state);
      if (kind === 0) for (let q = 0; q < QUBITS; q++) rx(state, q, RX_ANGLE);
      else for (let q = kind - 1; q < QUBITS - 1; q += 2) rzz(state, q, q + 1, ZZ_ANGLE);
      result.push({ layer, kind, before, after: localStates(state) });
    }
  }
  return result;
}
// Trace the full perimeter before leaving a gate; paired wires meet at ZZ gates.
export function gatePath(layer, kind, q) {
  const base = 100 + layer * 278, y = 150 + q * 78;
  const previousX = kind === 0 ? (layer ? base - 108 : 24) : base + (kind === 1 ? 34 : 90);
  if (kind === 0) return `M${previousX} ${y} H${base} V${y - 17} H${base + 34} V${y + 17} H${base} V${y} V${y - 17} H${base + 34} V${y}`;
  const parity = kind - 1, paired = q % 2 === parity ? q : q - 1;
  const x = base + (kind === 1 ? 90 : 170);
  if (paired < 0 || paired >= QUBITS - 1) return `M${previousX} ${y} H${x}`;
  const centerY = 150 + paired * 78 + 39;
  const entryY = q === paired ? centerY - 10 : centerY + 10;
  const otherY = q === paired ? centerY + 10 : centerY - 10;
  return `M${previousX} ${y} H${x} V${entryY} H${x + 10} V${otherY} H${x - 10} V${entryY} H${x} V${y}`;
}
