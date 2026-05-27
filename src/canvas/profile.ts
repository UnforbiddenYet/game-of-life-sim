const enabled =
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).has('profile');

const samples = new Map<string, number[]>();
let lastFlush = 0;
const FLUSH_INTERVAL_MS = 1000;

export function profile<T>(label: string, fn: () => T): T {
  if (!enabled) return fn();
  const start = performance.now();
  const result = fn();
  const dt = performance.now() - start;
  let arr = samples.get(label);
  if (!arr) {
    arr = [];
    samples.set(label, arr);
  }
  arr.push(dt);
  const now = performance.now();
  if (now - lastFlush > FLUSH_INTERVAL_MS) {
    flush();
    lastFlush = now;
  }
  return result;
}

function flush(): void {
  for (const [label, arr] of samples) {
    if (arr.length === 0) continue;
    const sorted = arr.slice().sort((a, b) => a - b);
    const avg = sorted.reduce((s, x) => s + x, 0) / sorted.length;
    const p95 = sorted[Math.floor(sorted.length * 0.95)] ?? 0;
    const max = sorted[sorted.length - 1] ?? 0;

    console.log(
      `[profile] ${label} n=${sorted.length} avg=${avg.toFixed(2)}ms p95=${p95.toFixed(2)}ms max=${max.toFixed(2)}ms`,
    );
    arr.length = 0;
  }
}
