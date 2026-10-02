import { cubicBezier, ease, easeInOut, keyframes } from "../render/ease";
import { calm } from "../render/motion";
import { type Pic, PicCache, ctx2d, padded, silhouette, svgImage, toPic, withShadow } from "../render/sprites";
import { ANT_SVG, FOODS } from "./art";

// How the ants and their food are drawn on the stage canvas. Timings copy the CSS animations they replace

const RAD = Math.PI / 180;

// ---------- Ants ----------
export type Pose = "walk" | "sniff" | "bite" | null;
// What drawing needs from an ant; pt is the time in its current pose, on the game's clock
export interface AntLook {
  x: number; y: number;   // feet, middle
  s: number;   // grows out of the hole and shrinks back in
  face: number; tilt: number;
  pose: Pose; pt: number;
}

const LEGS = 8, FEELERS = 5, HEADS = 4;   // drawn positions: leg steps, antenna angles, head turns
// Each leg swings back and forth and lifts a little; the two sets of legs are half a step apart
const STEP = [[0, -13, 0], [.55, 13, 0], [.78, 0, -4], [1, -13, 0]];
const legAt = (u: number) => keyframes(STEP, u);
const feelerAt = (i: number) => -6 + 11 * i / (FEELERS - 1);
const headAt = (i: number) => 14 * i / (HEADS - 1);

// The ant in one pose: each set of legs turned (degrees) and lifted, the antennae and the head turned
export interface AntPose { a: [number, number]; b: [number, number]; feeler: number; head: number }
export function antPoseSVG(p: AntPose) {
  const leg = (cls: string, x: string, y: string) => {
    const [r, ty] = cls === "ta" ? p.a : p.b;
    return r || ty ? `transform="translate(0 ${ty.toFixed(2)}) rotate(${r.toFixed(2)} ${x} ${y})"` : "";
  };
  return ANT_SVG
    .replace(/class="(ta|tb)" style="transform-origin:(\d+)px (\d+)px"/g, (_m, cls, x, y) => leg(cls, x, y))
    .replace('<g class="antn" style="transform-origin:89px 22px">', p.feeler ? `<g transform="rotate(${p.feeler.toFixed(2)} 89 22)">` : "<g>")
    .replace('<g class="head">', p.head ? `<g transform="rotate(${p.head.toFixed(2)} 78 40)">` : "<g>");
}
// li: leg step or -1 standing; fi: antenna angle or -1 straight; hi: head turn
function antSVG(li: number, fi: number, hi: number) {
  const step = (u: number) => li < 0 ? [0, 0] as [number, number] : legAt(u % 1) as [number, number];
  return antPoseSVG({ a: step(li / LEGS), b: step(li / LEGS + .5), feeler: fi < 0 ? 0 : feelerAt(fi), head: hi ? headAt(hi) : 0 });
}

interface Frame { img: Pic; sh: Pic; w: number }
const antPics = new PicCache<Frame>();
let antW = 0, antDpr = 1;
// w: the ant's width in device pixels; its picture is 120 by 80
export function wantAnts(w: number, dpr: number) {
  antW = Math.round(w); antDpr = dpr;
  antPics.keepOnly(k => k.startsWith(antW + "|"));
}
async function makeAnt(w: number, dpr: number, li: number, fi: number, hi: number): Promise<Frame> {
  const h = Math.round(w * 80 / 120), pad = Math.ceil(10 * dpr);
  const img = padded(await svgImage(antSVG(li, fi, hi), w, h), w, h, pad);
  return { img: await toPic(img), sh: await toPic(silhouette(img, 3 * dpr)), w };
}
function antFrame(li: number, fi: number, hi: number) {
  const w = antW, dpr = antDpr;
  return antPics.get(`${w}|${li}|${fi}|${hi}`, () => makeAnt(w, dpr, li, fi, hi), "ant");
}

// 0 to 1 and back, like a CSS animation that alternates; period is one way
const swing = (pt: number, period: number) => easeInOut(1 - Math.abs(((pt / period) % 2) - 1));

// A: the ant's width in CSS pixels; depth: smaller further up the ground
export function drawAnt(x: CanvasRenderingContext2D, a: AntLook, A: number, depth: number) {
  const k = depth * a.s;
  if (k <= 0) return;
  let li = -1, fi = -1, hi = 0, lift = 0;
  if (!calm.matches) {
    if (a.pose === "walk") {
      li = Math.floor(((a.pt / .32) % 1) * LEGS);
      fi = Math.round(swing(a.pt, .64) * (FEELERS - 1));
      lift = swing(a.pt, .16);
    } else if (a.pose === "sniff") fi = Math.round(swing(a.pt, .25) * (FEELERS - 1));
    else if (a.pose === "bite" && a.pt < .3) hi = Math.round(easeInOut(1 - Math.abs((a.pt / .15) - 1)) * (HEADS - 1));   // there and back, once
  }
  const fr = antFrame(li, fi, hi);
  if (!fr) return;
  const h = A * 80 / 120, q = A / fr.w, D = fr.img.width * q, E = fr.img.height * q;
  x.save();
  x.translate(a.x, a.y);   // feet; grows and shrinks from here, like transform-origin 50% 100%
  x.scale(k, k);
  x.translate(0, -h / 2);
  x.scale(a.face, 1);
  x.rotate(a.tilt * RAD);
  x.translate(0, -lift * h * .02);   // a little bounce in each step
  x.globalAlpha = .25;
  x.drawImage(fr.sh, -D / 2, -E / 2 + 4, D, E);
  x.globalAlpha = 1;
  x.drawImage(fr.img, -D / 2, -E / 2, D, E);
  x.restore();
}

// ---------- Food ----------
export interface FoodLook {
  x: number; y: number;   // bottom, middle
  kind: number; t: number;
  fall: { dx: number; dy: number; dur: number } | null;   // dropped from the hand: offset at the start, in the food's own pixels
  landedAt: number; bitten: boolean; bob: boolean; bobT: number;
}

// The bite: a circle cut from the picture, shadow and all, like the CSS mask (stop at a share of the farthest corner)
function biteOf(i: number) {
  const m = FOODS[i].match(/--bx:(\d+)%;--by:(\d+)%;--br:(\d+)%/);
  const bx = m ? +m[1] / 100 : .84, by = m ? +m[2] / 100 : .18, br = m ? +m[3] / 100 : .26;
  const far = Math.hypot(Math.max(bx, 1 - bx), Math.max(by, 1 - by));
  return { bx, by, r: br * far };
}

interface FoodPic { img: Pic; bit: Pic; px: number; pad: number }
const foodPics = new PicCache<FoodPic>();
let foodPx = 0, foodDpr = 1;
export function wantFoods(px: number, dpr: number, kinds: number) {
  foodPx = Math.round(px); foodDpr = dpr;
  foodPics.keepOnly(k => k.startsWith(foodPx + "|"));
  for (let i = 0; i < kinds; i++) foodPic(i);
}
function foodPic(i: number) {
  const px = foodPx, dpr = foodDpr;
  return foodPics.get(`${px}|${i}`, async () => {
    const pad = Math.ceil(10 * dpr);
    const img = withShadow(padded(await svgImage(FOODS[i], px, px), px, px, pad), 0, 4 * dpr, 3 * dpr, "rgba(0,0,0,.22)");
    const bit = padded(img, img.width, img.height, 0), b = biteOf(i), c = ctx2d(bit);
    c.globalCompositeOperation = "destination-out";
    c.beginPath();
    c.arc(pad + b.bx * px, pad + b.by * px, b.r * px, 0, Math.PI * 2);
    c.fill();
    return { img: await toPic(img), bit: await toPic(bit), px, pad };
  }, "food" + i);
}

const fallEase = cubicBezier(.5, 0, .85, .55);
const LAND = [[0, 1, 1], [.4, 1.18, .82], [1, 1, 1]];
// z: the food's size in CSS pixels; k: its depth scale (smaller further up, smaller still while carried)
export function drawFood(x: CanvasRenderingContext2D, f: FoodLook, z: number, k: number) {
  const pic = foodPic(f.kind);
  if (!pic || k <= 0) return;
  x.save();
  x.translate(f.x, f.y);   // bottom, middle
  x.scale(k, k);
  if (f.fall) {   // waits a moment in the hand, then drops with a slight drift
    const e = fallEase(Math.min(1, Math.max(0, (f.t - .2) / f.fall.dur)));
    x.translate(f.fall.dx * (1 - e), f.fall.dy * (1 - e));
  } else if (f.landedAt >= 0 && f.t - f.landedAt < .3) {
    const [sx, sy] = keyframes(LAND, (f.t - f.landedAt) / .3, ease);
    x.scale(sx, sy);
  }
  if (f.bob && !calm.matches) {
    const u = swing(f.bobT, .16);
    x.translate(0, -.09 * z * u);
    x.rotate((-4 + 8 * u) * RAD);
  }
  const q = z / pic.px, img = f.bitten ? pic.bit : pic.img;
  x.drawImage(img, -z / 2 - pic.pad * q, -z - pic.pad * q, img.width * q, img.height * q);
  x.restore();
}
