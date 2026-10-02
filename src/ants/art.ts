// The ant, its hill, the peeking ant and the foods, shared by the canvas pictures and the page

export const ANT_SVG = `<svg viewBox="0 0 120 80" aria-hidden="true">
<g stroke="#8A3A22" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity=".65">
  <path class="tb" style="transform-origin:73px 47px" d="M73 47L88 39L100 69"/>
  <path class="ta" style="transform-origin:68px 48px" d="M68 48L76 39L81 70"/>
  <path class="tb" style="transform-origin:64px 47px" d="M64 47L56 37L50 69"/></g>
<g stroke="#5A2414" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" fill="none">
  <path class="ta" style="transform-origin:71px 48px" d="M71 48L83 37L92 71"/>
  <path class="tb" style="transform-origin:67px 49px" d="M67 49L70 38L73 72"/>
  <path class="ta" style="transform-origin:63px 48px" d="M63 48L50 35L39 70"/></g>
<ellipse cx="32" cy="44" rx="23" ry="18" fill="#C9542F" stroke="#7A2C18" stroke-width="2.5"/>
<ellipse cx="25" cy="37" rx="9" ry="5" fill="#fff" opacity=".28"/>
<circle cx="56" cy="45" r="6" fill="#B84A29" stroke="#7A2C18" stroke-width="2.2"/>
<ellipse cx="67" cy="43" rx="11" ry="9" fill="#C9542F" stroke="#7A2C18" stroke-width="2.5"/>
<g class="head">
  <g class="antn" style="transform-origin:89px 22px"><path d="M86 22Q82 8 72 5M93 21Q100 7 111 8" stroke="#5A2414" stroke-width="3" fill="none" stroke-linecap="round"/>
  <circle cx="72" cy="5" r="3.4" fill="#5A2414"/><circle cx="111" cy="8" r="3.4" fill="#5A2414"/></g>
  <circle cx="90" cy="35" r="17" fill="#D45E35" stroke="#7A2C18" stroke-width="2.5"/>
  <circle cx="96" cy="31" r="6.5" fill="#fff"/><circle cx="98" cy="31.5" r="3.6" fill="#2B1A14"/><circle cx="99.3" cy="30" r="1.3" fill="#fff"/>
  <circle cx="99" cy="42" r="3.6" fill="#FF8FA3" opacity=".6"/>
  <path d="M91 43Q96 47 101 44" stroke="#5A2414" stroke-width="2.2" fill="none" stroke-linecap="round"/></g>
</svg>`;

export const PEEK_SVG = `<svg viewBox="0 0 100 130" aria-hidden="true">
<ellipse cx="50" cy="112" rx="19" ry="16" fill="#C9542F" stroke="#7A2C18" stroke-width="2.5"/>
<g class="antn" style="transform-origin:50px 40px"><path d="M40 34Q32 14 20 10M60 34Q68 14 80 10" stroke="#5A2414" stroke-width="3.2" fill="none" stroke-linecap="round"/>
  <circle cx="20" cy="10" r="4" fill="#5A2414"/><circle cx="80" cy="10" r="4" fill="#5A2414"/></g>
<circle cx="50" cy="62" r="30" fill="#D45E35" stroke="#7A2C18" stroke-width="2.5"/>
<circle cx="39" cy="56" r="9" fill="#fff"/><circle cx="61" cy="56" r="9" fill="#fff"/>
<g class="eyes"><circle cx="39" cy="57" r="4.6" fill="#2B1A14"/><circle cx="61" cy="57" r="4.6" fill="#2B1A14"/>
  <circle cx="40.6" cy="55.2" r="1.6" fill="#fff"/><circle cx="62.6" cy="55.2" r="1.6" fill="#fff"/></g>
<circle cx="31" cy="70" r="4.5" fill="#FF8FA3" opacity=".6"/><circle cx="69" cy="70" r="4.5" fill="#FF8FA3" opacity=".6"/>
<path d="M42 74Q50 80 58 74" stroke="#5A2414" stroke-width="2.6" fill="none" stroke-linecap="round"/>
</svg>`;

export const HILL_SVG = `<svg viewBox="0 0 200 100" preserveAspectRatio="none" aria-hidden="true">
<g fill="#5FA84A"><path d="M14 66Q12 48 6 40Q16 50 18 64Z"/><path d="M20 66Q22 46 30 36Q24 50 25 66Z"/><path d="M26 68Q32 54 40 50Q32 58 31 68Z"/>
  <path d="M186 64Q190 48 196 42Q186 52 182 64Z"/><path d="M178 66Q176 48 168 40Q174 52 173 66Z"/></g>
<path d="M34 44Q40 26 70 24Q86 16 104 22Q126 16 142 26Q166 28 168 44Q170 60 140 64Q118 70 98 66Q76 70 58 64Q32 60 34 44Z" fill="#C08049"/>
<path d="M46 44Q52 32 76 31Q100 26 124 31Q150 34 154 44Q150 54 124 57Q100 61 76 57Q50 54 46 44Z" fill="#A86C3B"/>
<ellipse cx="100" cy="40" rx="34" ry="13" fill="#6B4224"/>
<ellipse cx="100" cy="38" rx="26" ry="9" fill="#2A180C"/>
<g fill="#D9A56E"><circle cx="44" cy="34" r="2.4"/><circle cx="60" cy="22" r="2"/><circle cx="150" cy="24" r="2.2"/><circle cx="164" cy="36" r="2"/><circle cx="52" cy="58" r="2.2"/><circle cx="148" cy="58" r="2.4"/><circle cx="96" cy="64" r="2"/><circle cx="122" cy="20" r="1.8"/></g>
<g fill="#8E5A30"><circle cx="70" cy="30" r="1.8"/><circle cx="132" cy="32" r="2"/><circle cx="66" cy="52" r="1.8"/><circle cx="136" cy="52" r="1.8"/><circle cx="84" cy="24" r="1.6"/><circle cx="116" cy="60" r="1.6"/></g>
<ellipse cx="160" cy="70" rx="13" ry="8" fill="#A9A39A"/><ellipse cx="157" cy="67" rx="5" ry="2.5" fill="#fff" opacity=".35"/>
</svg>`;

export const FOODS = [
  `<svg viewBox="0 0 60 60" aria-hidden="true"><g stroke="#AEB8C4" stroke-width="2" stroke-linejoin="round"><path d="M30 13L51 23L30 33L9 23Z" fill="#fff"/><path d="M9 23L30 33L30 53L9 43Z" fill="#EEF2F6"/><path d="M51 23L30 33L30 53L51 43Z" fill="#DCE3EB"/></g><g fill="#C9D3DE"><circle cx="24" cy="21" r="1.3"/><circle cx="34" cy="25" r="1.3"/><circle cx="30" cy="18" r="1.1"/><circle cx="16" cy="34" r="1.2"/><circle cx="21" cy="42" r="1.2"/><circle cx="39" cy="38" r="1.2"/><circle cx="44" cy="31" r="1.2"/></g></svg>`,
  `<svg viewBox="0 0 60 60" aria-hidden="true"><path d="M12 51V27C5 25 5 12 16 10C22 3 38 3 44 10C55 12 55 25 48 27V51Z" fill="#C98A4B" stroke="#9C6331" stroke-width="2" stroke-linejoin="round"/><path d="M16 47V24C11 22 11 15 18 14C23 8 37 8 42 14C49 15 49 22 44 24V47Z" fill="#FFF4DC"/><g fill="#EBD9B0"><ellipse cx="24" cy="24" rx="2" ry="1.4"/><ellipse cx="35" cy="20" rx="1.8" ry="1.2"/><ellipse cx="30" cy="32" rx="2" ry="1.4"/><ellipse cx="22" cy="39" rx="1.6" ry="1.1"/><ellipse cx="38" cy="38" rx="1.8" ry="1.2"/></g></svg>`,
  `<svg viewBox="0 0 60 60" aria-hidden="true"><path d="M30 54Q10 40 12 25Q14 15 30 17Q46 15 48 25Q50 40 30 54Z" fill="#F0384A" stroke="#B3162A" stroke-width="2.5"/><g fill="#FFE08A"><circle cx="22" cy="28" r="1.6"/><circle cx="32" cy="26" r="1.6"/><circle cx="40" cy="31" r="1.6"/><circle cx="26" cy="38" r="1.6"/><circle cx="35" cy="40" r="1.6"/></g><path d="M18 19L30 10L42 19L34 18L30 14L26 18Z" fill="#3FAE4A"/></svg>`,
  `<svg viewBox="0 0 60 60" aria-hidden="true" style="--bx:90%;--by:50%;--br:22%"><path d="M7 30A23 23 0 0 0 53 30Z" fill="#FFF3CF" stroke="#E3383A" stroke-width="4" stroke-linejoin="round"/><g fill="#5A3418"><ellipse cx="25" cy="38" rx="2" ry="3"/><ellipse cx="35" cy="38" rx="2" ry="3"/></g></svg>`,
  `<svg viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="32" r="20" fill="#D9A15B" stroke="#A86F2E" stroke-width="2.5"/><g fill="#5A3418"><circle cx="22" cy="26" r="3"/><circle cx="36" cy="24" r="2.6"/><circle cx="38" cy="38" r="3"/><circle cx="24" cy="40" r="2.6"/></g></svg>`,
];
