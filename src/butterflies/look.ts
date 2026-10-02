import { cubicBezier, ease, easeIn, easeInOut, keyframes } from "../render/ease";
import { calm } from "../render/motion";
import { type Pic, PicCache, padded, silhouette, svgImage, toPic, withShadow } from "../render/sprites";
import { type BfColor, butterflySVG, gardenFlowerSVG, standalone } from "./art";

// How butterflies, their garden flowers and the dashed "put me here" spots are drawn on the stage canvas.
// Timings copy the CSS animations they replace

const RAD = Math.PI / 180;

// ---------- Butterflies ----------
// What drawing needs from a butterfly; times are on its own clock (t), so everything freezes on pause
export interface BugLook {
  k: BfColor;
  x: number; y: number; deg: number; t: number;
  size: number;   // size it is heading to; shown size eases there like the CSS width transition did
  sz0: number; szAt: number; szDur: number;
  ph: number;   // wing beat, 0 to 1
  flee: boolean; rest: boolean; carried: boolean;
  hint: boolean; hintAt: number;
}

export function bugSize(b: BugLook, s: number) {
  b.sz0 = shownSize(b);
  b.size = s;
  b.szAt = b.t;
  b.szDur = b.carried ? .15 : .8;   // shrinks into the net at once
}
export const shownSize = (b: BugLook) => b.sz0 + (b.size - b.sz0) * ease(Math.min(1, (b.t - b.szAt) / b.szDur));

// Wings fold toward the body: slow while resting, fast while fleeing
export function flap(b: BugLook, dt: number) {
  b.ph = calm.matches ? 0 : (b.ph + dt / (b.flee ? .14 : b.rest ? 2.4 : .34)) % 1;
}
const WING_STEPS = 7;   // wing widths from 20% to 100%
function wingScale(ph: number) {
  return ph < .5 ? 1 - .8 * easeInOut(ph * 2) : .2 + .8 * easeInOut(ph * 2 - 1);
}

interface BugFrame { img: Pic; sh: Pic; glow?: HTMLCanvasElement }
interface BugSet { px: number; dpr: number; frames: BugFrame[] }
const bugSets = new PicCache<BugSet>();

async function makeBugs(k: BfColor, px: number, dpr: number): Promise<BugSet> {
  const pad = Math.ceil(24 * dpr);
  const frames = await Promise.all(Array.from({ length: WING_STEPS }, async (_, i) => {
    const s = .2 + .8 * i / (WING_STEPS - 1);
    const img = padded(await svgImage(standalone(butterflySVG(k, false, s), k), px, px), px, px, pad);
    return { img: await toPic(img), sh: await toPic(silhouette(img, 5 * dpr)) };
  }));
  return { px, dpr, frames };
}
const bugKey = (k: BfColor, px: number) => k.id + "|" + Math.round(px);

let bugPx = 0, bugDpr = 1;
// px: the picture's size in device pixels (the biggest butterfly); smaller ones are drawn scaled
export function wantBugs(ks: readonly BfColor[], px: number, dpr: number) {
  bugPx = Math.round(px); bugDpr = dpr;
  const keys = new Set(ks.map(k => bugKey(k, bugPx)));
  bugSets.keepOnly(key => keys.has(key));
  ks.forEach(k => bugSets.get(bugKey(k, bugPx), () => makeBugs(k, bugPx, dpr), k.id));
}

// The hint glow, white then the butterfly's own colour, made the first time it's needed
function glowOf(f: BugFrame, k: BfColor, dpr: number) {
  if (!f.glow) f.glow = withShadow(withShadow(f.img, 0, 0, 5 * dpr, "#fff"), 0, 0, 14 * dpr, k.c);
  return f.glow;
}

const HINT = [[0, 1], [.5, 1.22], [1, 1]];
export function drawBug(x: CanvasRenderingContext2D, b: BugLook, sha: number) {
  const set = bugSets.get(bugKey(b.k, bugPx), () => makeBugs(b.k, bugPx, bugDpr), b.k.id);
  if (!set) return;
  const s = wingScale(b.ph), fr = set.frames[Math.round((s - .2) / .8 * (WING_STEPS - 1))];
  const q = shownSize(b) / set.px, D = fr.img.width * q, o = -D / 2;
  x.save();
  x.translate(b.x, b.y);
  x.rotate(b.deg * RAD);
  if (b.hint) {   // the right ones glow and pulse; the glow takes the shadow's place
    const p = calm.matches ? 1 : keyframes(HINT, ((b.t - b.hintAt) / .8) % 1, easeInOut)[0];
    x.scale(p, p);
    x.drawImage(glowOf(fr, b.k, set.dpr), o, o, D, D);
  } else {
    if (sha > 0) {
      x.globalAlpha = sha;
      x.drawImage(fr.sh, o, o + 6, D, D);
      x.globalAlpha = 1;
    }
    x.drawImage(fr.img, o, o, D, D);
  }
  x.restore();
}

// ---------- Garden flowers ----------
export interface GardenLook {
  k: BfColor;
  t: number;
  at: { x: number; base: number; F: number } | null;   // centre x, root y and width, set by the layout
  current: boolean;
  nudgeAt: number; doneAt: number; wiltAt: number;   // -1 until it happens
}

const GLOWS = 6;   // glow strengths drawn ahead between the pulse's 8% and 38%
interface FlowerSet { px: number; pad: number; pics: (Pic | undefined)[] }
const flowerSets = new PicCache<FlowerSet>();
let flowerPx = 0, flowerDpr = 1;

async function makeFlower(k: BfColor, px: number, dpr: number, glow: number) {
  const h = Math.round(px * 140 / 120), pad = Math.ceil(20 * dpr);
  const img = await svgImage(standalone(gardenFlowerSVG(k, glow), k), px, h);
  return toPic(withShadow(padded(img, px, h, pad), 0, 8 * dpr, 6 * dpr, "rgba(0,0,0,.16)"));
}
// Index 0 has no glow; 1..GLOWS step through the pulse
const glowLevel = (i: number) => i ? .08 + .3 * (i - 1) / (GLOWS - 1) : 0;
async function makeFlowers(k: BfColor, px: number, dpr: number): Promise<FlowerSet> {
  const pics = await Promise.all(Array.from({ length: GLOWS + 1 }, (_, i) => makeFlower(k, px, dpr, glowLevel(i))));
  return { px, pad: Math.ceil(20 * dpr), pics };
}
const flowerKey = (k: BfColor, px: number) => k.id + "|" + Math.round(px);

export function wantGarden(ks: readonly BfColor[], px: number, dpr: number) {
  flowerPx = Math.round(px); flowerDpr = dpr;
  const keys = new Set(ks.map(k => flowerKey(k, px)));
  flowerSets.keepOnly(key => keys.has(key));
  ks.forEach(k => flowerSets.get(flowerKey(k, px), () => makeFlowers(k, flowerPx, dpr), k.id));
}

const GROW = [[0, 0, -10], [1, 1, 0]], WILT = [[0, 1, 0, 1], [1, 0, 12, 0]];
const NUDGE = [[0, 1, 0], [.25, 1.06, -7], [.5, 1.08, 6], [.75, 1, -3], [1, 1, 0]];
const CHEER = [[0, 1], [.4, 1.15], [1, 1]], GLOW = [[0, .08], [.5, .38], [1, .08]];
const growEase = cubicBezier(.2, 1.5, .4, 1), cheerEase = cubicBezier(.2, 1.6, .4, 1);
export const gardenGone = (fl: GardenLook) => fl.wiltAt >= 0 && fl.t - fl.wiltAt >= .6;

export function drawGarden(x: CanvasRenderingContext2D, fl: GardenLook) {
  if (!fl.at) return;
  const set = flowerSets.get(flowerKey(fl.k, flowerPx), () => makeFlowers(fl.k, flowerPx, flowerDpr), fl.k.id);
  if (!set) return;
  let s = 1, r = 0, a = 1;
  if (fl.wiltAt >= 0) [s, r, a] = keyframes(WILT, (fl.t - fl.wiltAt) / .6, easeIn);
  else if (fl.t < .9) [s, r] = keyframes(GROW, fl.t / .9, growEase);   // grows in its own spot
  if (s <= 0 || a <= 0) return;
  let s2 = 1, r2 = 0;   // the inner wiggle on a wrong colour, or a cheer when full
  if (fl.nudgeAt >= 0 && fl.t - fl.nudgeAt < .5) [s2, r2] = keyframes(NUDGE, (fl.t - fl.nudgeAt) / .5, ease);
  if (fl.doneAt >= 0 && fl.t - fl.doneAt < .7) [s2] = keyframes(CHEER, (fl.t - fl.doneAt) / .7, cheerEase);
  let gi = 0;
  if (fl.current && !calm.matches) {
    const g = keyframes(GLOW, (fl.t % 1.5) / 1.5, easeInOut)[0];
    gi = 1 + Math.round((g - .08) / .3 * (GLOWS - 1));
  }
  const pic = set.pics[gi];
  if (!pic) return;
  const { F, base } = fl.at, q = F / set.px;
  x.save();
  x.translate(fl.at.x, base);   // turns and grows from its root, like transform-origin 50% 100%
  x.scale(s, s); x.rotate(r * RAD);
  x.scale(s2, s2); x.rotate(r2 * RAD);
  x.globalAlpha = a;
  x.drawImage(pic, -F / 2 - set.pad * q, -pic.height * q + set.pad * q, pic.width * q, pic.height * q);
  x.restore();
}

// ---------- "Put me here" spot ----------
const slots = new PicCache<Pic>();
let slotPx = 0;
const slotPic = (k: BfColor) => slots.get(k.id + "|" + slotPx, () => svgImage(butterflySVG(k, true), slotPx, slotPx).then(i => toPic(padded(i, slotPx, slotPx, 0))), k.id);
export function wantSlots(ks: readonly BfColor[], px: number) {
  slotPx = Math.round(px);
  slots.keepOnly(key => key.endsWith("|" + slotPx));
  ks.forEach(slotPic);
}

const SLOT_IN = [[0, 0, .4], [1, .55, .94]], SLOT_PULSE = [[0, .55, .94], [.5, 1, 1.04], [1, .55, .94]];
// age: seconds since its flower appeared; it fades in once the flower has grown, then breathes
export function drawSlot(x: CanvasRenderingContext2D, k: BfColor, cx: number, cy: number, size: number, age: number) {
  const pic = slotPic(k);
  if (!pic || (age < .6 && !calm.matches)) return;
  const [a, s] = calm.matches ? [1, 1] : age < 1 ? keyframes(SLOT_IN, (age - .6) / .4, ease) : keyframes(SLOT_PULSE, ((age - 1) / 1.3) % 1, easeInOut);
  const d = size * s;
  x.save();
  x.globalAlpha = a;
  x.drawImage(pic, cx - d / 2, cy - d / 2, d, d);
  x.restore();
}
