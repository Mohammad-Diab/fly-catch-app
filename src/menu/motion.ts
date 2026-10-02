import { easeInOut, keyframes } from "../render/ease";
import { calm } from "../render/motion";

// The start menu's decorations, moved from CSS animations to the game loop so the whole menu can run at 30 frames a
// second (a CSS animation always runs at the screen's rate: 60, 75 or 120 times a second). Same keyframes and timings.
// Each value is written only when it changes, so a decoration that is resting (the shine, the gift) costs nothing

const HOVER = [[0, -14, 0, -14], [.25, 0, -10, 6], [.5, 14, 0, 16], [.75, 0, 8, -4], [1, -14, 0, -14]];   // x, y px, degrees
const BREATHE = [[0, 1], [.5, 1.04], [1, 1]];
const GIFT = [[0, 0], [.6, 0], [.68, -14], [.76, 12], [.84, -8], [.92, 5], [1, 0]];
const SHINES: [string, number][] = [["startBtn", 1.8], ["beesBtn", 3.2], ["bfBtn", 4.4], ["bfPickBtn", 5.6], ["antBtn", 6.8]];   // id, delay

const last = new Map<string, string>();
function put(el: HTMLElement | null, prop: string, value: string) {
  if (!el) return;
  const k = el.id + prop;
  if (last.get(k) === value) return;
  last.set(k, value);
  el.style.setProperty(prop, value);
}

const $ = (id: string) => document.getElementById(id);

// age: seconds since the menu appeared, as the CSS animations started then
export function moveMenu(age: number) {
  if (calm.matches) return;   // the CSS kept these still for less motion
  if (age >= .9) {   // after the hero's entrance
    const [x, y, r] = keyframes(HOVER, ((age - .9) / 3.2) % 1, easeInOut);
    put($("heroFly"), "transform", `translate(${x.toFixed(2)}px,${y.toFixed(2)}px) rotate(${r.toFixed(2)}deg)`);
  }
  // the scale property, as the button's press uses transform (and eases it, which would start on every write)
  if (age >= 1.4) put($("startBtn"), "scale", keyframes(BREATHE, ((age - 1.4) / 2.6) % 1, easeInOut)[0].toFixed(4));
  for (const [id, delay] of SHINES) {   // sweeps across in the last 28% of every 5s, each button in turn
    if (age < delay) continue;
    const p = ((age - delay) / 5) % 1, x = p < .72 ? -130 : -130 + 260 * easeInOut((p - .72) / .28);
    put($(id), "--shine", x.toFixed(1) + "%");
  }
  const news = $("newsBtn");
  if (news && news.classList.contains("fresh")) {
    put(news.querySelector<HTMLElement>(".cico"), "rotate", keyframes(GIFT, (age / 2.4) % 1, easeInOut)[0].toFixed(2) + "deg");
    const u = easeInOut(1 - Math.abs(((age / 1.2) % 2) - 1));   // the dot twinkles back and forth
    put(news, "--tws", (.6 + .55 * u).toFixed(3)); put(news, "--twr", (-12 + 24 * u).toFixed(1) + "deg"); put(news, "--two", (.5 + .5 * u).toFixed(3));
  }
}

// Back to rest when the menu closes, so it opens the way the CSS did
export function resetMenu() {
  last.clear();
  $("heroFly")?.style.removeProperty("transform");
  $("startBtn")?.style.removeProperty("scale");
  for (const [id] of SHINES) $(id)?.style.removeProperty("--shine");
  const news = $("newsBtn");
  for (const v of ["--tws", "--twr", "--two"]) news?.style.removeProperty(v);
  news?.querySelector<HTMLElement>(".cico")?.style.removeProperty("rotate");
}
