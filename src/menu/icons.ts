import { antPoseSVG } from "../ants/look";
import { type BfColor, butterflySVG, standalone } from "../butterflies/art";
import { type Kind, wingsAt } from "../flies/look";
import { easeInOut, keyframes, linear } from "../render/ease";
import { type Pic, PicCache, ctx2d, pixelRatio, svgImage, toPic, withShadow } from "../render/sprites";

// The menu's moving pictures are drawn on small canvases, each only when its picture changes, with the same pictures and
// timings as the CSS animations they replace. Their drop shadow is baked in (a CSS filter would blur again every frame);
// hover and entrance stay in the CSS

// Which picture to show at time t (seconds): a key for it, and its SVG
type Look = (t: number) => { key: string; svg: () => string };

// Wings flap 6° to 56° and back ten times a second (CSS: .05s, alternate)
export const flierLook = (kind: Kind): Look => t => {
  const u = (t / .1) % 1, i = Math.round((u < .5 ? u * 2 : 2 - u * 2) * 4);
  return { key: kind + i, svg: () => wingsAt(kind, i / 4) };
};

// Wings fold to a fifth of their width and open again every .7s, eased
export const butterflyLook = (k: BfColor): Look => t => {
  const ph = (t / .7) % 1, s = ph < .5 ? 1 - .8 * easeInOut(ph * 2) : .2 + .8 * easeInOut(ph * 2 - 1);
  const i = Math.round((s - .2) / .8 * 6);
  return { key: "bf" + k.id + i, svg: () => standalone(butterflySVG(k, false, .2 + .8 * i / 6), k) };
};

// A few steps and a twitch of the antennae, then standing still for the rest of the 4.8s cycle (nothing to redraw)
const MENU_STEP = [[0, 0], [.034, -13], [.1, 13], [.167, -13], [.234, 13], [.27, 0], [1, 0]];
const MENU_FEEL = [[0, 0], [.09, -7], [.19, 6], [.27, 0], [1, 0]];
export const antLook: Look = t => {
  const u = (t / 4.8) % 1;
  const leg = Math.round(keyframes(MENU_STEP, u, linear)[0] / 3.25) * 3.25, feel = Math.round(keyframes(MENU_FEEL, u, easeInOut)[0]);
  return { key: `ant${leg}|${feel}`, svg: () => antPoseSVG({ a: [leg, 0], b: [-leg, 0], feeler: feel, head: 0 }) };
};

const PAD = .2;   // room around the box, as the SVG's wings and legs could reach past it
// A drop shadow in CSS pixels, as the CSS drop-shadow(0 dy blur color) it replaces
export interface Shadow { dy: number; blur: number; color: string }
interface Icon { el: HTMLElement; c: HTMLCanvasElement; look: Look; shadow: Shadow; key: string; w: number; h: number; k: number }
const icons: Icon[] = [];
const pics = new PicCache<Pic>();

// Replaces the icon's SVG with a canvas showing the same picture
export function addIcon(el: HTMLElement, look: Look, shadow: Shadow) {
  const c = document.createElement("canvas");
  c.className = "pic";
  c.setAttribute("aria-hidden", "true");
  el.replaceChildren(c);
  el.classList.add("drawn");
  icons.push({ el, c, look, shadow, key: "", w: 0, h: 0, k: 1 });
}

// After any layout change; pictures are made again only for new sizes
export function sizeIcons() {
  const k = pixelRatio(), keep = new Set<string>();
  for (const i of icons) {
    i.w = Math.round(i.el.offsetWidth * k); i.h = Math.round(i.el.offsetHeight * k); i.k = k;
    const cw = Math.round(i.w * (1 + PAD * 2)), ch = Math.round(i.h * (1 + PAD * 2));
    if (i.c.width !== cw || i.c.height !== ch) { i.c.width = cw; i.c.height = ch; i.key = ""; }
    keep.add(`${i.w}x${i.h}`);
  }
  pics.keepOnly(key => keep.has(key.slice(key.lastIndexOf("|") + 1)));
}

export function drawIcons(t: number) {
  for (const i of icons) {
    if (!i.w || !i.h) continue;
    const p = i.look(t);
    if (p.key === i.key) continue;
    const key = `${p.key}|${i.w}x${i.h}`, w = i.w, h = i.h, sh = i.shadow, k = i.k;
    const pic = pics.peek(key);
    if (!pic) {   // keeps showing the last picture meanwhile
      pics.get(key, () => svgImage(p.svg(), w, h).then(img => toPic(withShadow(drawn(img, w, h), 0, sh.dy * k, sh.blur * k, sh.color))));
      continue;
    }
    const x = ctx2d(i.c);
    x.clearRect(0, 0, i.c.width, i.c.height);
    x.drawImage(pic, 0, 0);
    i.key = p.key;
  }
}

function drawn(img: HTMLImageElement, w: number, h: number) {
  const c = document.createElement("canvas"), pw = Math.round(w * PAD), ph = Math.round(h * PAD);
  c.width = w + pw * 2; c.height = h + ph * 2;
  ctx2d(c).drawImage(img, pw, ph, w, h);
  return c;
}
