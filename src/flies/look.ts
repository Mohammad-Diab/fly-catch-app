import { cubicBezier, easeIn, easeOut, keyframes } from "../render/ease";
import { type Pic, padded, silhouette, svgImage, toPic, withShadow } from "../render/sprites";
import { BEE_SVG, FLY_SVG, flowerSVG } from "./art";

// How flies, bees and the bees' flowers are drawn on the stage canvas. Timings copy the CSS animations they replace

export type Kind = "fly" | "bee";

// What drawing needs from a fly or bee; times are on its own clock (t), so everything freezes on pause
export interface FlierLook {
  kind: Kind;
  x: number; y: number; xOff: number;
  rot: number;   // degrees
  t: number; wob: number;
  flying: boolean;
  caughtAt: number; dodgeAt: number; dizzyAt: number;   // -1 until it happens
}

export interface BeeFlower {
  x: number; y: number;   // centre, where the bee sips
  base: number;   // root on the ground
  F: number; c: string;
  t: number; wiltAt: number;
}

const RAD = Math.PI / 180;
const PAD = .3;   // room around the art for swinging wings and the shadow
const PHASES = 5;   // wing positions over half a beat
const key = (...a: (string | number)[]) => a.join("|");

// ---------- Flies and bees ----------
interface Frame { img: Pic; sh: Pic }
interface FrameSet { px: number; still: Frame; flap: Frame[] }

const flierSets = new Map<string, FrameSet>(), making = new Set<string>(), latest = new Map<Kind, FrameSet>();
let wantedFliers = new Set<string>();

// Wings swing 6° to 56° from the body and fade to half, like the CSS flap; null keeps them folded
function wingsAt(kind: Kind, ph: number | null) {
  const g = (side: number) => ph === null ? "<g>"
    : `<g transform="rotate(${(side * (6 + 50 * ph)).toFixed(2)} 50 44)" opacity="${(.95 - .45 * ph).toFixed(3)}">`;
  return (kind === "bee" ? BEE_SVG : FLY_SVG).replace('<g class="wing wl">', g(-1)).replace('<g class="wing wr">', g(1));
}

async function makeFliers(kind: Kind, px: number): Promise<FrameSet> {
  const pad = Math.ceil(px * PAD);
  const frame = async (ph: number | null): Promise<Frame> => {
    const img = padded(await svgImage(wingsAt(kind, ph), px, px), px, px, pad);
    return { img: await toPic(img), sh: await toPic(silhouette(img, px * .06)) };
  };
  const [still, ...flap] = await Promise.all([frame(null), ...Array.from({ length: PHASES }, (_, i) => frame(i / (PHASES - 1)))]);
  return { px, still, flap };
}

function startFliers(kind: Kind, px: number) {
  const k = key(kind, px);
  if (flierSets.has(k) || making.has(k)) return;
  making.add(k);
  makeFliers(kind, px).then(s => {
    making.delete(k);
    if (!wantedFliers.has(k)) return;
    flierSets.set(k, s);
    latest.set(kind, s);
  }, () => making.delete(k));
}

// Pictures for these sizes (in device pixels) are made ahead; any others are dropped
export function wantFliers(list: [Kind, number][]) {
  wantedFliers = new Set(list.map(([kind, px]) => key(kind, Math.round(px))));
  for (const k of [...flierSets.keys()]) if (!wantedFliers.has(k)) flierSets.delete(k);
  list.forEach(([kind, px]) => startFliers(kind, Math.round(px)));
}

function fliersFor(kind: Kind, px: number) {
  const s = flierSets.get(key(kind, Math.round(px)));
  if (s) return s;
  wantedFliers.add(key(kind, Math.round(px)));
  startFliers(kind, Math.round(px));
  return latest.get(kind);   // a near size, scaled, until the right one is ready
}

// [offset, scaleX, scaleY, degrees]
const SQUASH = [[0, 1, 1, 0], [.3, 1.22, .78, 0], [.55, .9, 1.12, -6], [.75, 1.04, .97, 4], [1, 1, 1, 0]];
const DODGE = [[0, 1, 1, 0], [.2, 1.25, 1.25, -14], [.45, .92, .92, 10], [.7, 1, 1, -6], [1, 1, 1, 0]];
const squashEase = cubicBezier(.3, 1.7, .5, 1);
function pose(f: FlierLook) {
  if (f.caughtAt >= 0 && f.t - f.caughtAt < .46) return keyframes(SQUASH, (f.t - f.caughtAt) / .46, squashEase);
  if (f.dodgeAt >= 0 && f.t - f.dodgeAt < .4) return keyframes(DODGE, (f.t - f.dodgeAt) / .4, easeOut);
  return null;
}

// Three stars circle above a caught fly as it slides down; they don't turn with it
const ORBIT = [[0, 0, -.16, 1], [.25, .3, 0, .72], [.5, 0, .16, .5], [.75, -.3, 0, .72], [1, 0, -.16, 1]];
const STAR = (() => {
  const p = new Path2D(), pts = [50, 0, 61, 35, 98, 35, 68, 57, 79, 91, 50, 70, 21, 91, 32, 57, 2, 35, 39, 35];
  for (let i = 0; i < pts.length; i += 2) p[i ? "lineTo" : "moveTo"](pts[i] / 100 - .5, pts[i + 1] / 100 - .5);
  p.closePath();
  return p;
})();
const starColor = getComputedStyle(document.documentElement).getPropertyValue("--star").trim() || "#FFC93C";

function drawDizzy(x: CanvasRenderingContext2D, f: FlierLook, Z: number) {
  const age = f.t - f.dizzyAt, cx = f.x + f.xOff, cy = f.y - Z * .32, s = Z * .24;
  x.save();
  x.globalAlpha = Math.min(1, age / .2);
  x.fillStyle = starColor;
  for (let i = 0; i < 3; i++) {
    const [dx, dy, k] = keyframes(ORBIT, ((age + .3 * i) / .9) % 1);
    x.save();
    x.translate(cx + dx * Z, cy + dy * Z);
    x.scale(k * s, k * s);
    x.fill(STAR);
    x.restore();
  }
  x.restore();
}

// Z: size in CSS pixels; sha: shadow strength, lighter while a cloud covers the sun
export function drawFlier(x: CanvasRenderingContext2D, f: FlierLook, Z: number, sha: number, dpr: number) {
  const set = fliersFor(f.kind, Z * dpr);
  if (!set) return;
  let fr = set.still;
  if (f.flying) {
    const u = ((f.t / .1 + f.wob) % 1 + 1) % 1, tri = u < .5 ? u * 2 : 2 - u * 2;
    fr = set.flap[Math.round(tri * (PHASES - 1))];
  }
  const D = fr.img.width * Z / set.px, o = -D / 2, p = pose(f);
  x.save();
  x.translate(f.x + f.xOff, f.y);
  x.rotate(f.rot * RAD);
  if (sha > 0) {   // offset in the body's own direction, as the CSS drop-shadow turned with it
    x.save();
    x.translate(0, Z * .09);
    if (p) { x.scale(p[0], p[1]); x.rotate(p[2] * RAD); }
    x.globalAlpha = sha;
    x.drawImage(fr.sh, o, o, D, D);
    x.restore();
  }
  if (p) { x.scale(p[0], p[1]); x.rotate(p[2] * RAD); }
  x.drawImage(fr.img, o, o, D, D);
  x.restore();
  if (f.dizzyAt >= 0) drawDizzy(x, f, Z);
}

// ---------- The bee's flower ----------
const flowerPics = new Map<string, { img: Pic; pad: number; px: number }>(), flowerMaking = new Set<string>();
let wantedFlowerPx = 0, devRatio = 1;

function startFlower(c: string, px: number) {
  const k = key(c, px);
  if (flowerPics.has(k) || flowerMaking.has(k)) return;
  flowerMaking.add(k);
  const pad = Math.ceil(14 * devRatio);
  svgImage(flowerSVG(c), px, Math.round(px * 1.2))
    .then(img => toPic(withShadow(padded(img, px, Math.round(px * 1.2), pad), 0, 6 * devRatio, 5 * devRatio, "rgba(0,0,0,.18)")))
    .then(pic => {
      flowerMaking.delete(k);
      if (px === wantedFlowerPx) flowerPics.set(k, { img: pic, pad, px });
    }, () => flowerMaking.delete(k));
}
// px: flower width in device pixels; the shadow is a fixed 6px down, 5px soft, like the CSS one
export function wantFlowers(colors: readonly string[], px: number, dpr: number) {
  devRatio = dpr;
  wantedFlowerPx = Math.round(px);
  for (const [k, v] of [...flowerPics]) if (v.px !== wantedFlowerPx) flowerPics.delete(k);
  colors.forEach(c => startFlower(c, wantedFlowerPx));
}

const BLOOM = [[0, 0, -12, .2], [1, 1, 0, 1]], WILT = [[0, 1, 0, 1], [1, 0, 10, 0]];
const bloomEase = cubicBezier(.2, 1.5, .4, 1);
export const flowerGone = (fl: BeeFlower) => fl.wiltAt >= 0 && fl.t - fl.wiltAt >= .6;

export function drawBeeFlower(x: CanvasRenderingContext2D, fl: BeeFlower) {
  const pic = flowerPics.get(key(fl.c, wantedFlowerPx));
  if (!pic) { if (!flowerMaking.has(key(fl.c, wantedFlowerPx))) startFlower(fl.c, wantedFlowerPx); return; }
  let p = [1, 0, 1];
  if (fl.wiltAt >= 0) p = keyframes(WILT, (fl.t - fl.wiltAt) / .6, easeIn);
  else if (fl.t < .7) p = keyframes(BLOOM, fl.t / .7, bloomEase);
  if (p[0] <= 0 || p[2] <= 0) return;
  const s = fl.F / pic.px;
  x.save();
  x.translate(fl.x, fl.base);   // grows from its root, like transform-origin 50% 100%
  x.rotate(p[1] * RAD);
  x.scale(p[0], p[0]);
  x.globalAlpha = Math.min(1, p[2]);
  x.drawImage(pic.img, -fl.F / 2 - pic.pad * s, -fl.F * 1.2 - pic.pad * s, pic.img.width * s, pic.img.height * s);
  x.restore();
}
