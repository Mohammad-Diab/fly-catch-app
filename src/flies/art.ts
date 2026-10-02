// The fly, the bee and the bee's flower, shared by the canvas pictures and the menu icons

export const FLY_SVG = `
<svg viewBox="0 0 100 100" aria-hidden="true">
<g stroke="#2A2A30" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" fill="none">
  <path d="M44 41 L31 33 L25 37"/><path d="M56 41 L69 33 L75 37"/>
  <path d="M43 47 L27 49 L20 55"/><path d="M57 47 L73 49 L80 55"/>
  <path d="M44 53 L33 63 L29 73"/><path d="M56 53 L67 63 L71 73"/>
</g>
<ellipse cx="50" cy="64" rx="12.5" ry="17" fill="#34343D"/>
<path d="M38.8 59 Q50 62.5 61.2 59" stroke="#4E4E5A" stroke-width="3" fill="none"/>
<path d="M39.6 67 Q50 70.5 60.4 67" stroke="#4E4E5A" stroke-width="3" fill="none"/>
<ellipse cx="50" cy="44" rx="11.5" ry="11" fill="#2B2B33"/>
<path d="M46 36 L46 51 M54 36 L54 51" stroke="#3F3F4A" stroke-width="2" stroke-linecap="round"/>
<circle cx="50" cy="28" r="9.5" fill="#2B2B33"/>
<ellipse cx="42.6" cy="26" rx="6.6" ry="7.6" fill="#9B2F2A"/>
<ellipse cx="57.4" cy="26" rx="6.6" ry="7.6" fill="#9B2F2A"/>
<circle cx="40.6" cy="23.2" r="1.9" fill="#fff" opacity=".85"/>
<circle cx="55.4" cy="23.2" r="1.9" fill="#fff" opacity=".85"/>
<g class="wing wl">
  <ellipse cx="37" cy="61" rx="11" ry="24" transform="rotate(26 37 61)"
           fill="rgba(214,236,255,.58)" stroke="rgba(110,140,170,.75)" stroke-width="1"/>
  <path d="M47 46 Q38 58 30 78 M44 52 Q36 60 28 66" stroke="rgba(110,140,170,.5)" stroke-width=".9" fill="none"/>
</g>
<g class="wing wr">
  <ellipse cx="63" cy="61" rx="11" ry="24" transform="rotate(-26 63 61)"
           fill="rgba(214,236,255,.58)" stroke="rgba(110,140,170,.75)" stroke-width="1"/>
  <path d="M53 46 Q62 58 70 78 M56 52 Q64 60 72 66" stroke="rgba(110,140,170,.5)" stroke-width=".9" fill="none"/>
</g>
</svg>`;

export const BEE_SVG = `
<svg viewBox="0 0 100 100" aria-hidden="true">
<g stroke="#2B2B33" stroke-width="2.2" stroke-linecap="round" fill="none">
  <path d="M44 42 L34 38"/><path d="M56 42 L66 38"/>
  <path d="M43 48 L32 51"/><path d="M57 48 L68 51"/>
  <path d="M44 53 L36 60"/><path d="M56 53 L64 60"/>
</g>
<ellipse cx="50" cy="62" rx="15" ry="20" fill="#FFC93C"/>
<path d="M35.8 55 Q50 58.5 64.2 55 L64.4 59 Q50 62.5 35.6 59 Z" fill="#2B2B33"/>
<path d="M35.4 65 Q50 68.5 64.6 65 L64 69 Q50 72.5 36 69 Z" fill="#2B2B33"/>
<path d="M38.5 74 Q50 77 61.5 74 L59.5 77.5 Q50 80.5 40.5 77.5 Z" fill="#2B2B33"/>
<path d="M47.5 81 L50 86.5 L52.5 81 Z" fill="#2B2B33"/>
<circle cx="50" cy="41" r="11" fill="#5A4030"/>
<circle cx="50" cy="41" r="11" fill="none" stroke="#FFC93C" stroke-width="1.6" stroke-dasharray="2 3" opacity=".7"/>
<circle cx="50" cy="27" r="9" fill="#2B2B33"/>
<circle cx="45.2" cy="24.6" r="2.3" fill="#fff" opacity=".9"/>
<circle cx="54.8" cy="24.6" r="2.3" fill="#fff" opacity=".9"/>
<path d="M46 19.5 Q42.5 12 37.5 10.5" stroke="#2B2B33" stroke-width="2" fill="none" stroke-linecap="round"/>
<path d="M54 19.5 Q57.5 12 62.5 10.5" stroke="#2B2B33" stroke-width="2" fill="none" stroke-linecap="round"/>
<circle cx="37" cy="10.5" r="2.3" fill="#2B2B33"/><circle cx="63" cy="10.5" r="2.3" fill="#2B2B33"/>
<g class="wing wl">
  <ellipse cx="33" cy="44" rx="16" ry="9.5" transform="rotate(-24 33 44)"
           fill="rgba(236,246,255,.78)" stroke="rgba(110,140,170,.7)" stroke-width="1"/>
</g>
<g class="wing wr">
  <ellipse cx="67" cy="44" rx="16" ry="9.5" transform="rotate(24 67 44)"
           fill="rgba(236,246,255,.78)" stroke="rgba(110,140,170,.7)" stroke-width="1"/>
</g>
</svg>`;

export const PETALS = ["#FF7AA8", "#B98CF0", "#FF9E5E", "#FF6B8A"];
export const flowerSVG = (c: string) => `<svg viewBox="0 0 100 120" aria-hidden="true">
  <path d="M50 58 Q47 88 50 118" stroke="#3F9B53" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M50 92 Q66 78 78 84 Q67 99 50 97 Z" fill="#5FBF5A"/>
  ${[0, 60, 120, 180, 240, 300].map(a => `<ellipse cx="50" cy="26" rx="11" ry="16" fill="${c}" transform="rotate(${a} 50 45)"/>`).join("")}
  <circle cx="50" cy="45" r="12" fill="#FFC93C"/>
  <circle cx="46" cy="41" r="3.2" fill="#fff" opacity=".55"/>
</svg>`;
