import { blurred, ctx2d, makeCanvas, pixelRatio } from "./sprites";

// The scenery is drawn once into still pictures, from the hidden page shapes that keep its sizes and colours in the CSS.
// Only the clouds move, each a ready picture slid by the compositor, so nothing behind the glass is redrawn while playing
const BLUR = 1.4;

function shapePath(x: CanvasRenderingContext2D, el: Element, ox: number, oy: number) {
  const r = el.getBoundingClientRect(), w = r.width, h = r.height, l = r.left - ox, t = r.top - oy;
  x.beginPath();
  if (el.classList.contains("trunk") && x.roundRect) x.roundRect(l, t, w, h, 4);
  else if (el.classList.contains("trunk")) x.rect(l, t, w, h);
  else x.ellipse(l + w / 2, t + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
}

function bakeGround(glass: HTMLElement, ground: HTMLCanvasElement, k: number) {
  const g = glass.getBoundingClientRect();
  ground.width = Math.round(g.width * k);
  ground.height = Math.round(g.height * k);
  const flat = makeCanvas(ground.width, ground.height), x = ctx2d(flat);
  x.scale(k, k);
  for (const el of glass.querySelectorAll(".outside .shape")) {
    x.fillStyle = getComputedStyle(el).backgroundColor;
    shapePath(x, el, g.left, g.top);
    x.fill();
  }
  const out = ctx2d(ground);
  out.clearRect(0, 0, ground.width, ground.height);
  out.drawImage(blurred(flat, BLUR * k), 0, 0);
}

// Capsule plus two puffs, each filled on its own like the CSS shapes were, so see-through night clouds look the same
function bakeCloud(cloud: HTMLElement, color: string, k: number) {
  const w = cloud.offsetWidth, h = cloud.offsetHeight, d1 = .48 * w, d2 = .36 * w;
  const top = Math.min(0, .7 * h - d1, .76 * h - d2), pad = Math.ceil(BLUR * 3);
  let c = cloud.querySelector("canvas");
  if (!c) { c = document.createElement("canvas"); cloud.appendChild(c); }
  const cw = w + pad * 2, ch = h - top + pad * 2;
  Object.assign(c.style, { left: -pad + "px", top: top - pad + "px", width: cw + "px", height: ch + "px" });
  const flat = makeCanvas(cw * k, ch * k), x = ctx2d(flat);
  x.scale(k, k);
  x.translate(pad, pad - top);
  x.fillStyle = color;
  const disc = (cx: number, cy: number, r: number) => { x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.fill(); };
  x.beginPath();
  if (x.roundRect) x.roundRect(0, 0, w, h, h / 2); else x.rect(0, 0, w, h);
  x.fill();
  disc(.14 * w + d1 / 2, .7 * h - d1 / 2, d1 / 2);
  disc(w * .84 - d2 / 2, .76 * h - d2 / 2, d2 / 2);
  c.width = flat.width; c.height = flat.height;
  ctx2d(c).drawImage(blurred(flat, BLUR * k), 0, 0);
}

export function bakeScenery(glass: HTMLElement) {
  const k = pixelRatio();
  const ground = glass.querySelector<HTMLCanvasElement>(".outside .ground");
  if (ground) bakeGround(glass, ground, k);
  const color = getComputedStyle(document.documentElement).getPropertyValue("--cloud").trim() || "#fff";
  glass.querySelectorAll<HTMLElement>(".outside .cloud").forEach(c => bakeCloud(c, color, k));
}

// Bakes again whenever the colours change: light or dark theme, or a mode with its own sky and hills
export function watchColours(redo: () => void) {
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", redo);
  new MutationObserver(redo).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  new MutationObserver(redo).observe(document.body, { attributes: true, attributeFilter: ["data-mode"] });
}
