// Butterflies and their garden flowers: the colours and the SVG pictures, for the page and the canvas

export type Pattern = "eyes" | "border" | "stripes" | "band" | "veins";
export interface BfColor { id: string; c: string; d: string; pat: Pattern }

// Colour matching for toddlers: bold colours a two-year-old tells apart at a glance, each wearing a real butterfly's
// markings so colour-blind kids can match by shape. Red, blue and yellow come first; purple only joins in the later
// levels. No green (it vanishes against the grass), no orange or pink (too close to red and yellow)
export const BF_COLORS: BfColor[] = [
  { id: "red",    c: "#F0282D", d: "#A3121A", pat: "eyes" },
  { id: "blue",   c: "#1F6FFF", d: "#0E43B0", pat: "border" },
  { id: "yellow", c: "#FFD60A", d: "#A88600", pat: "stripes" },
  { id: "purple", c: "#8B2FE0", d: "#5A1596", pat: "band" },
];

export const INK = "#2B2B33";
export const tint = (hex: string, a: number) => "#" + [1, 3, 5].map(i => Math.round(parseInt(hex.slice(i, i + 2), 16) * (1 - a) + 255 * a).toString(16).padStart(2, "0")).join("");

export const WING_UP = "M50 46C39 18 15 7 7 21 1 35 13 52 49 52Z";
export const WING_LOW = "M49 53C30 54 14 66 20 82 25 94 42 86 49 62Z";
// Markings drawn on the left wings (mirrored for the right) and simplified on each petal
const MOTIF: Record<Pattern, (k: BfColor) => { up: string; low: string; petal: string }> = {
  eyes: k => ({   // peacock butterfly
    up: `<circle cx="22" cy="27" r="11" fill="#FFE39A"/><circle cx="22" cy="27" r="7.5" fill="${INK}"/><circle cx="22" cy="27" r="4.2" fill="#6FA8FF"/><circle cx="20.4" cy="25" r="1.6" fill="#fff"/>`,
    low: `<circle cx="31" cy="74" r="6" fill="${INK}"/><circle cx="31" cy="74" r="2.6" fill="#fff"/>`,
    petal: `<circle cx="60" cy="17" r="7.5" fill="${INK}"/><circle cx="60" cy="17" r="3.8" fill="#6FA8FF"/>`,
  }),
  border: k => ({   // morpho
    up: `<path d="${WING_UP}" fill="none" stroke="${INK}" stroke-width="12"/><g fill="#fff"><circle cx="10" cy="24" r="2.2"/><circle cx="14" cy="15" r="2"/><circle cx="23" cy="11" r="1.8"/><circle cx="9" cy="34" r="2"/></g>`,
    low: `<path d="${WING_LOW}" fill="none" stroke="${INK}" stroke-width="10"/><g fill="#fff"><circle cx="22" cy="80" r="2"/><circle cx="29" cy="87" r="1.8"/></g>`,
    petal: `<ellipse cx="60" cy="24" rx="15" ry="22" fill="none" stroke="${INK}" stroke-width="8"/><circle cx="60" cy="6.5" r="2.2" fill="#fff"/>`,
  }),
  stripes: k => ({   // swallowtail
    up: `<g stroke="${INK}" stroke-width="4.5" stroke-linecap="round"><path d="M44 16L30 50"/><path d="M33 10L19 47"/><path d="M22 8L8 40"/></g><path d="${WING_UP}" fill="none" stroke="${INK}" stroke-width="7"/>`,
    low: `<path d="M44 58L30 86" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/><path d="${WING_LOW}" fill="none" stroke="${INK}" stroke-width="7"/><circle cx="35" cy="83" r="2.8" fill="#5B8CFF"/>`,
    petal: `<g stroke="${INK}" stroke-width="3.6"><path d="M44 14H76"/><path d="M44 28H76"/></g>`,
  }),
  band: k => ({   // purple emperor
    up: `<path d="${WING_UP}" fill="none" stroke="${k.d}" stroke-width="9"/><path d="M42 22Q26 30 14 42" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round"/>`,
    low: `<path d="M46 58Q36 70 28 82" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/><circle cx="26" cy="70" r="4.2" fill="#FF9E3D"/><circle cx="26" cy="70" r="2" fill="${INK}"/>`,
    petal: `<path d="M44 24H76" stroke="#fff" stroke-width="5.5"/>`,
  }),
  veins: k => ({   // birdwing
    up: `<g fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"><path d="M49 48L12 20"/><path d="M49 48L20 12"/><path d="M49 48L7 32"/><path d="M49 48L32 10"/><path d="M49 48L12 44"/></g><path d="${WING_UP}" fill="none" stroke="${INK}" stroke-width="6"/>`,
    low: `<g fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"><path d="M49 56L22 68"/><path d="M49 56L22 82"/><path d="M49 56L36 88"/></g><path d="${WING_LOW}" fill="none" stroke="${INK}" stroke-width="6"/>`,
    petal: `<g stroke="${INK}" stroke-width="2.2" fill="none" stroke-linecap="round"><path d="M60 46V6"/><path d="M60 30L50 15"/><path d="M60 30L70 15"/></g>`,
  }),
};


// White sticker edge keeps a butterfly readable on its own flower; outline draws the dashed "put me here" spot
export function butterflySVG(k: BfColor, outline = false, wingScale = 1) {
  let side: string;
  if (outline) {
    const w = (d: string) => `<path d="${d}" fill="${k.c}" fill-opacity=".25" stroke="${k.d}" stroke-width="2.6" stroke-dasharray="5 4" stroke-linejoin="round"/>`;
    side = w(WING_UP) + w(WING_LOW);
  } else {
    const m = MOTIF[k.pat](k);
    const w = (d: string, clip: string, deco: string) => `<path d="${d}" fill="none" stroke="#fff" stroke-width="7" stroke-linejoin="round"/>
      <path d="${d}" fill="url(#g-${k.id})"/><g clip-path="url(#${clip})">${deco}</g>
      <path d="${d}" fill="none" stroke="${k.d}" stroke-width="1.6" stroke-linejoin="round"/>`;
    side = w(WING_UP, "cu", m.up) + w(WING_LOW, "cl", m.low);
  }
  const body = outline
    ? `<ellipse cx="50" cy="55" rx="5" ry="24" fill="none" stroke="${k.d}" stroke-width="2.4" stroke-dasharray="4 4"/>`
    : `<path d="M47 28Q41 13 33 9M53 28Q59 13 67 9" stroke="${INK}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
       <circle cx="33" cy="9" r="2.8" fill="${INK}"/><circle cx="67" cy="9" r="2.8" fill="${INK}"/>
       <ellipse cx="50" cy="57" rx="4.6" ry="23" fill="#3A2E2A"/><circle cx="50" cy="31" r="6.4" fill="#3A2E2A"/>
       <circle cx="47.8" cy="29.6" r="1.5" fill="#fff"/><circle cx="52.2" cy="29.6" r="1.5" fill="#fff"/>`;
  const wings = wingScale === 1 ? `<g class="wings">` : `<g transform="translate(50 0) scale(${wingScale} 1) translate(-50 0)">`;
  return `<svg viewBox="0 0 100 100" aria-hidden="true">${wings}<g>${side}</g><g transform="matrix(-1 0 0 1 100 0)">${side}</g></g>${body}</svg>`;
}
export function gardenFlowerSVG(k: BfColor, glow?: number) {
  const m = MOTIF[k.pat](k);
  const petals = [0, 60, 120, 180, 240, 300].map(a =>
    `<g transform="rotate(${a} 60 50)"><ellipse cx="60" cy="24" rx="15" ry="22" fill="${tint(k.c, .12)}"/>
     <g clip-path="url(#cp)">${m.petal}</g>
     <ellipse cx="60" cy="24" rx="15" ry="22" fill="none" stroke="${k.d}" stroke-width="2.4"/></g>`).join("");   // dark edge keeps each strong-coloured petal distinct
  return `<svg viewBox="0 0 120 140" aria-hidden="true">
    <path d="M60 70Q56 105 60 138" stroke="#3F9B53" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M60 112Q80 96 95 103Q82 120 60 117Z" fill="#5FBF5A"/><path d="M60 100Q40 86 26 92Q38 108 60 106Z" fill="#5FBF5A"/>
    <circle class="glow" cx="60" cy="50" r="56" fill="${k.c}"${glow === undefined ? "" : ` style="opacity:${glow}"`}/>${petals}
    <circle cx="60" cy="50" r="14" fill="#FFF3C4" stroke="${k.d}" stroke-width="2"/></svg>`;
}

// Clips and gradients the pictures use: once in the page for the menu and HUD icons, and inside each canvas picture
const defsFor = (ks: readonly BfColor[]) => `
  <clipPath id="cu" clipPathUnits="userSpaceOnUse"><path d="${WING_UP}"/></clipPath>
  <clipPath id="cl" clipPathUnits="userSpaceOnUse"><path d="${WING_LOW}"/></clipPath>
  <clipPath id="cp" clipPathUnits="userSpaceOnUse"><ellipse cx="60" cy="24" rx="15" ry="22"/></clipPath>` +
  ks.map(k => `<radialGradient id="g-${k.id}" gradientUnits="userSpaceOnUse" cx="50" cy="50" r="48">
    <stop offset="0" stop-color="${tint(k.c, .12)}"/><stop offset="1" stop-color="${k.c}"/></radialGradient>`).join("");
export function addPageDefs() {
  document.querySelector("svg defs")!.insertAdjacentHTML("beforeend", defsFor(BF_COLORS));
}
export const standalone = (svg: string, k: BfColor) => svg.replace(/<svg([^>]*)>/, `<svg$1><defs>${defsFor([k])}</defs>`);
