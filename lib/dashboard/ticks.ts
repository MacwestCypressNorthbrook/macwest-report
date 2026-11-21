/** Evenly spaced axis ticks on a 1 / 2 / 5 × 10ⁿ step that always include zero. */
export function niceTicks(values: number[], target = 5): { ticks: number[]; domain: [number, number] } {
  const min = Math.min(0, ...values);
  const max = Math.max(0, ...values);
  const span = max - min || 1;
  const raw = span / target;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = ([1, 2, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? 10 * mag);
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let t = lo; t <= hi + step / 2; t += step) ticks.push(Math.round(t / step) * step);
  return { ticks, domain: [lo, hi] };
}
