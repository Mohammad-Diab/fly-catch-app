export type Ease = (x: number) => number;

// Same curve as CSS cubic-bezier(), so canvas animations keep the timing the CSS ones had
export function cubicBezier(x1: number, y1: number, x2: number, y2: number): Ease {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const X = (t: number) => ((ax * t + bx) * t + cx) * t;
  return x => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const e = X(t) - x, d = (3 * ax * t + 2 * bx) * t + cx;
      if (Math.abs(e) < 1e-5 || Math.abs(d) < 1e-6) break;
      t -= e / d;
    }
    if (!(Math.abs(X(t) - x) < 1e-4)) {
      let lo = 0, hi = 1;
      for (let i = 0; i < 30; i++) { t = (lo + hi) / 2; if (X(t) < x) lo = t; else hi = t; }
    }
    return ((ay * t + by) * t + cy) * t;
  };
}

export const linear: Ease = x => x;
export const easeIn = cubicBezier(.42, 0, 1, 1);
export const easeOut = cubicBezier(0, 0, .58, 1);

// CSS-style keyframes: rows of [offset, ...values], each segment eased on its own like a CSS animation
export type Keyframes = readonly (readonly number[])[];
export function keyframes(frames: Keyframes, u: number, e: Ease = linear): number[] {
  const first = frames[0], lastRow = frames[frames.length - 1];
  if (u <= first[0]) return first.slice(1);
  for (let i = 1; i < frames.length; i++) {
    const b = frames[i];
    if (u <= b[0]) {
      const a = frames[i - 1], k = e((u - a[0]) / (b[0] - a[0] || 1));
      return a.slice(1).map((v, j) => v + (b[j + 1] - v) * k);
    }
  }
  return lastRow.slice(1);
}
