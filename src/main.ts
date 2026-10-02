// @ts-nocheck   (legacy code, typed piece by piece as it moves into its own modules)
import { BEE_SVG, FLY_SVG, PETALS, flowerSVG } from "./flies/art";
import { drawBeeFlower, drawFlier, flowerGone, wantFliers, wantFlowers } from "./flies/look";
import { BF_COLORS, addPageDefs, butterflySVG, gardenFlowerSVG } from "./butterflies/art";
import { ANT_SVG, FOODS, HILL_SVG, PEEK_SVG } from "./ants/art";
import { drawAnt, drawFood, wantAnts, wantFoods } from "./ants/look";
import { bugSize, drawBug, drawGarden, drawSlot, flap, gardenGone, wantBugs, wantGarden, wantSlots } from "./butterflies/look";
import { bakeScenery, watchColours } from "./render/scenery";
import { Stage } from "./render/stage";
import { lowerQuality } from "./render/sprites";
import { addIcon, antLook, butterflyLook, drawIcons, flierLook, sizeIcons } from "./menu/icons";
import { moveMenu, resetMenu } from "./menu/motion";
(() => {
  // Bump on every release and keep in sync with VERSION in sw.js, or installed apps stay on the old one
  const VERSION = "2.0.0-beta.1";
  window.GAME_VERSION = VERSION;
  console.info("Fly Catcher v" + VERSION);
  // Development only: bump BUILD here and --build in style.css on every change, so a stale file shows its old number
  const BUILD = 44;
  const css = getComputedStyle(document.documentElement).getPropertyValue("--build").trim();
  const dev = location.protocol === "file:" || /^(localhost|127\.\d+\.\d+\.\d+|\[::1\]|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)$/.test(location.hostname);   // this computer or the home network
  document.querySelectorAll(".ver").forEach(e => { e.textContent = "v" + VERSION + (dev ? ` · js ${BUILD} · css ${css || "?"}` : ""); });

  // ================= Graphics =================


  const NET_SVG = `
<svg viewBox="0 0 200 200" aria-hidden="true">
  <line x1="124" y1="124" x2="190" y2="190" stroke="#8A5A3B" stroke-width="11" stroke-linecap="round"/>
  <line x1="164" y1="164" x2="190" y2="190" stroke="#5F3B24" stroke-width="13" stroke-linecap="round"/>
  <circle cx="80" cy="80" r="62" fill="rgba(255,255,255,.14)"/>
  <rect x="0" y="0" width="160" height="160" fill="url(#mesh)" clip-path="url(#hoop)"/>
  <circle cx="80" cy="80" r="62" fill="none" stroke="#FF7A3D" stroke-width="8"/>
  <circle cx="80" cy="80" r="62" fill="none" stroke="#FFB07A" stroke-width="2.5" stroke-dasharray="6 10" opacity=".85"/>
</svg>`;

  // Butterfly mode uses a real butterfly net: thin hoop and a soft cloth bag, so it never reads as a fly swatter
  const BFNET_SVG = `
<svg viewBox="0 0 200 200" aria-hidden="true">
  <line x1="111" y1="51" x2="188" y2="146" stroke="#C98A4B" stroke-width="7" stroke-linecap="round"/>
  <line x1="162" y1="114" x2="188" y2="146" stroke="#9C6536" stroke-width="10" stroke-linecap="round"/>
  <path d="M28.9 68.7C24 120 44 166 62 168 82 170 106 128 111.1 51.3A42 15 -12 0 1 28.9 68.7Z"
        fill="rgba(255,255,255,.6)" stroke="rgba(255,255,255,.95)" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M44 77Q46 128 60 162M92 63Q88 124 66 164" fill="none" stroke="rgba(150,180,210,.5)" stroke-width="2" stroke-linecap="round"/>
  <ellipse cx="70" cy="60" rx="42" ry="15" transform="rotate(-12 70 60)" fill="rgba(255,255,255,.22)" stroke="#5FA6DF" stroke-width="4.5"/>
  <circle cx="111.1" cy="51.3" r="4.5" fill="#4F8FC4"/>
</svg>`;

  const HAND_SVG = `<svg viewBox="0 0 200 200" aria-hidden="true"><text x="100" y="118" font-size="100" text-anchor="middle">\u{1FAF3}</text></svg>`;
  const HAND_OK = (() => {
    try {
      const c = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
      c.canvas.width = c.canvas.height = 20; c.font = "16px sans-serif"; c.textBaseline = "top"; c.fillText("\u{1FAF3}", 0, 0);
      const d = c.getImageData(0, 0, 20, 20).data;
      for (let i = 0; i < d.length; i += 4) if (d[i + 3] && Math.max(d[i], d[i + 1], d[i + 2]) - Math.min(d[i], d[i + 1], d[i + 2]) > 40) return true;
    } catch {}
    return false;
  })();

  const DOWNLOAD_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.5v11"/><path d="M7 10l5 5 5-5"/><path d="M4.5 20h15"/></svg>`;

  const REFRESH_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19.5 12a7.5 7.5 0 1 1-2.4-5.5"/><path d="M19.5 4v5h-5"/></svg>`;
  const TROPHY_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 4h8v5a4 4 0 0 1-8 0z" fill="currentColor" fill-opacity=".25"/><path d="M8 6H5.5a2.5 2.5 0 0 0 2.8 3.9M16 6h2.5a2.5 2.5 0 0 1-2.8 3.9"/><path d="M12 13v4M9 20.5h6M10 17h4"/></svg>`;

  const GIFT_SVG = `<svg viewBox="0 0 64 64" aria-hidden="true">
  <g class="lid"><path d="M32 17C27 6 15 7 17 14C19 20 28 19 32 17Z" fill="#FF6B8A" stroke="#C93C5E" stroke-width="2" stroke-linejoin="round"/>
    <path d="M32 17C37 6 49 7 47 14C45 20 36 19 32 17Z" fill="#FF6B8A" stroke="#C93C5E" stroke-width="2" stroke-linejoin="round"/>
    <rect x="7" y="17" width="50" height="12" rx="3" fill="#FFC93C" stroke="#D9921B" stroke-width="2"/><rect x="28" y="17" width="8" height="12" fill="#FF6B8A"/></g>
  <rect x="11" y="29" width="42" height="28" rx="3" fill="#FFD54A" stroke="#D9921B" stroke-width="2"/><rect x="28" y="29" width="8" height="28" fill="#FF6B8A"/>
</svg>`;

  const STAR_SVG = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z"/></svg>`;

  const ICON_SPK = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/>
    <g class="waves"><path d="M16.5 8.5a5 5 0 010 7"/><path d="M19 6a8.5 8.5 0 010 12"/></g>
    <g class="cross"><path d="M17 9l5 6"/><path d="M22 9l-5 6"/></g></svg>`;

  // ================= Levels =================
  // Kids and bees modes, each level one even step harder; speed in px/s, rest = rests per second, restDur = rest length range (s)
  const LEVELS = [
    { flies: 1, goal:  5, speed:  90, rest: .55, restDur: [1.2, 2.2] },
    { flies: 2, goal:  8, speed: 110, rest: .49, restDur: [1.15, 2.05] },
    { flies: 3, goal: 11, speed: 130, rest: .43, restDur: [1.1, 1.9] },
    { flies: 4, goal: 14, speed: 150, rest: .37, restDur: [1.05, 1.75] },
    { flies: 5, goal: 17, speed: 170, rest: .31, restDur: [1, 1.6] },
  ];
  // Challenge keeps its own tuned curve, scaled further by CH below
  const CH_LEVELS = [
    { flies: 1, goal:  5, speed:  90, rest: .55, restDur: [1.2, 2.2] },
    { flies: 2, goal:  8, speed: 125, rest: .45, restDur: [1.05, 2.05] },
    { flies: 3, goal: 12, speed: 160, rest: .38, restDur: [.9, 1.9] },
    { flies: 4, goal: 16, speed: 195, rest: .30, restDur: [.75, 1.75] },
    { flies: 5, goal: 20, speed: 230, rest: .24, restDur: [.6, 1.6] },
  ];
  // ================= Languages =================
  // To add a language: create lang/<code>.json, then list the code here and in sw.js
  const LANGUAGES = ["ar", "en"];
  const DEFAULT_LANG = LANGUAGES[0];
  const STR = {};
  // Saved choice, then first supported browser language, then the default
  let LANG = (() => {
    try { const saved = localStorage.getItem("flyCatch.lang"); if (LANGUAGES.includes(saved)) return saved; } catch (e) {}
    for (const l of (navigator.languages || [navigator.language || ""])) {
      const c = String(l).toLowerCase().slice(0, 2);
      if (LANGUAGES.includes(c)) return c;
    }
    return DEFAULT_LANG;
  })();
  const langReady = Promise.all(LANGUAGES.map(c =>
    fetch(`lang/${c}.json`).then(r => r.json()).then(s => { STR[c] = s; }).catch(() => {})));
  // Missing keys fall back to the default language; {name} placeholders are filled from vars
  const T = (k, vars) => {
    const s = (STR[LANG] || {})[k] ?? (STR[DEFAULT_LANG] || {})[k] ?? "";
    return typeof s === "string" && vars ? s.replace(/\{(\w+)\}/g, (m, v) => vars[v] ?? m) : s;
  };
  const loadedLangs = () => LANGUAGES.filter(c => STR[c]);
  const nextLang = () => { const l = loadedLangs(); return l[(l.indexOf(LANG) + 1) % l.length]; };

  // ================= Challenge mode =================
  // Tuned by simulating pro, average and beginner players on laptop and phone
  const CH = { speed: 1.5, rest: .4, restDur: .6, net: .72, reach: .15 };
  const ALLOT = [20, 10, 10, 11, 13];   // seconds added per level; leftover carries over
  const TIME_PTS = 200;   // points per remaining second at finish
  const MULTI = { 1: 1, 2: 1.5, 3: 2, 4: 3, 5: 4 };
  // Fly size multipliers per mode
  const SIZES = { kids: [1, 1.2, 1.4], bees: [1, 1.2, 1.4], challenge: [.7, .85, 1, 1.2] };
  const BEE = {
    chance: [.45, .45, .3, .3, .3],   // more frequent in levels 1 and 2
    life: 30,   // safety cap if it never reaches the flower
    speed: .85,
    sip: [5.5, 6.5],   // about 6 seconds on the flower
  };
  const FLY_LIFE = [25, 25];   // safety cap; flies normally leave after 3-4 rests
  const sizePts = sc => clamp(1 / sc, .85, 1.45);   // smaller fly is harder, so more points
  let MODE = "kids", bfPick = false;
  const isCh = () => MODE === "challenge";
  const LV = () => (isCh() ? CH_LEVELS : MODE === "butterflies" ? (bfPick ? BF_LEVELS : BF_EASY) : MODE === "ants" ? ANT_LEVELS : LEVELS)[level];
  const num = n => Math.round(n).toLocaleString("en-US");   // same Western digits in both languages

  // ================= Elements =================
  const $ = id => document.getElementById(id);
  const glass = $("glass"), layer = $("layer"), fx = $("fx"), hud = $("hud");
  const starsEl = $("stars"), lvNum = $("lvNum"), banner = $("banner");
  const startScreen = $("startScreen"), endScreen = $("endScreen");
  const muteBtn = $("mute");
  const stage = new Stage($("stage"));
  $("heroFly").innerHTML = FLY_SVG;
  const ICONS = { fly: FLY_SVG, bee: BEE_SVG, download: DOWNLOAD_SVG, refresh: REFRESH_SVG, trophy: TROPHY_SVG, gift: GIFT_SVG };
  document.querySelectorAll("[data-ico]").forEach(e => { if (ICONS[e.dataset.ico]) e.innerHTML = ICONS[e.dataset.ico]; });

  const rand  = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ar    = n => String(n);   // legacy name; Western digits in both languages
  const angDiff = (a, b) => ((a - b + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
  const lerpDeg = (a, b, t) => a + (((b - a + 540) % 360) - 180) * t;

  // ================= Measurements =================
  let W = 0, H = 0, MIN = 0, S = 70, NET_R = 60, TOP_PAD = 80;
  function measure() {
    const r = glass.getBoundingClientRect();
    W = r.width; H = r.height; MIN = Math.min(W, H);
    S = clamp(MIN * 0.15, 58, Math.max(100, MIN * 0.09));   // caps only grow on very large screens
    NET_R = clamp(MIN * 0.12, 50, Math.max(86, MIN * 0.078));
    if (isCh()) NET_R = Math.max(40, NET_R * CH.net);
    TOP_PAD = hud.getBoundingClientRect().height + 12;   // includes CSS zoom on large screens
    glass.style.setProperty("--fly", S + "px");
    stage.resize(W, H);
    bfMeasure(); antMeasure(); prepareArt(); bfLayout();
    sizeNet(cursorNet);
    fitCards(); sizeIcons();
  }
  // Pictures for this mode's flies, bees and flowers, made ahead at the size they'll be drawn
  function prepareArt() {
    const d = stage.dpr, pool = SIZES[MODE] || [];
    wantFliers([...pool.map(sc => ["fly", S * sc * d]), ...(MODE === "bees" ? pool.map(sc => ["bee", S * sc * d]) : [])]);
    if (MODE === "bees") wantFlowers(PETALS, S * 1.45 * d, d);
    if (MODE === "butterflies") {
      const ks = BF_COLORS.slice(0, LV().pool);
      wantBugs(ks, B * 1.12 * d, d); wantGarden(ks, F * d, d); wantSlots(ks, B * .9 * d);
    }
    if (MODE === "ants") { wantAnts(A * d, d); wantFoods(A * .5 * d, d, LV().foods); }
  }
  function bounds(h = S * 0.5) {
    return { minX: h + 6, maxX: W - h - 6, minY: TOP_PAD + h * 0.4, maxY: H - h - 6 };
  }

  // ================= Sound =================
  let muted = false;
  const sfx = (() => {
    let ctx = null, master = null, noiseBuf = null;

    function init() {
      if (ctx) { if (ctx.state === "suspended") ctx.resume(); return; }
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = muted ? 0 : 1;
      master.connect(ctx.destination);

      noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }

    function tone(f, dur, type, vol, when, to) {
      if (!ctx) return;
      const t = ctx.currentTime + (when || 0);
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type; o.frequency.setValueAtTime(f, t);
      if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
      g.gain.setValueAtTime(.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + .012);
      g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + .03);
    }
    function noise(dur, f1, f2, vol, when) {
      if (!ctx) return;
      const t = ctx.currentTime + (when || 0);
      const s = ctx.createBufferSource(); s.buffer = noiseBuf;
      const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = 1.4;
      bp.frequency.setValueAtTime(f1, t); bp.frequency.exponentialRampToValueAtTime(f2, t + dur);
      const g = ctx.createGain();
      g.gain.setValueAtTime(.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + dur * .25);
      g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      s.connect(bp); bp.connect(g); g.connect(master); s.start(t); s.stop(t + dur + .03);
    }
    function boing() {
      if (!ctx) return;
      const t = ctx.currentTime;
      const o = ctx.createOscillator(), g = ctx.createGain();
      const l = ctx.createOscillator(), lg = ctx.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(330, t); o.frequency.exponentialRampToValueAtTime(160, t + .34);
      l.frequency.value = 22;
      lg.gain.setValueAtTime(42, t); lg.gain.exponentialRampToValueAtTime(1, t + .34);
      l.connect(lg); lg.connect(o.frequency);
      g.gain.setValueAtTime(.0001, t);
      g.gain.exponentialRampToValueAtTime(.2, t + .01);
      g.gain.exponentialRampToValueAtTime(.0001, t + .36);
      o.connect(g); g.connect(master);
      o.start(t); l.start(t); o.stop(t + .38); l.stop(t + .38);
    }

    return {
      init,
      ctx() { return ctx; },
      play(b, vol) {
        if (!ctx) return null;
        const s = ctx.createBufferSource(); s.buffer = b;
        const g = ctx.createGain(); g.gain.value = vol;
        s.connect(g); g.connect(master); s.start();
        return s;
      },
      setMuted(m) { if (master) master.gain.setTargetAtTime(m ? 0 : 1, ctx.currentTime, .03); },
      // Stereo sound per insect: thin rasp for flies, deeper softer hum for bees, a soft airy wing flutter for butterflies
      voice(kind) {
        if (!ctx) return null;
        const nodes = [], out = ctx.createGain(); out.gain.value = 0;
        const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        const osc = (type, f) => { const o = ctx.createOscillator(); o.type = type; o.frequency.value = f; nodes.push(o); return o; };
        const trem = ctx.createGain(); trem.gain.value = 1;
        let beat = null;
        if (kind === "butterfly") {   // a soft puff of air with each wing beat, mostly in the range laptop and phone speakers can play
          const n = ctx.createBufferSource(); n.buffer = noiseBuf; n.loop = true; n.loopStart = Math.random() * .5; nodes.push(n);
          const filter = (type, f, q) => { const b = ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; return b; };
          const layer = (g, ...chain) => { const v = ctx.createGain(); v.gain.value = g; chain.reduce((a, b) => (a.connect(b), b), n).connect(v); v.connect(trem); };
          layer(1, filter("bandpass", 1000 + Math.random() * 120, .9));   // the main puff
          layer(.35, filter("bandpass", 2400, 1.4));   // a little air on top
          layer(.3, filter("bandpass", 300 + Math.random() * 80, 1.3), filter("lowpass", 520, .5));   // body, for headphones
          trem.gain.value = .5;
          beat = osc("sine", 2.9); const bg = ctx.createGain(); bg.gain.value = .5;   // wings flap about 3 times a second
          beat.connect(bg); bg.connect(trem.gain);
        } else if (kind === "bee") {
          const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 850; lp.Q.value = .8;
          const pk = ctx.createBiquadFilter(); pk.type = "peaking"; pk.frequency.value = 300; pk.gain.value = 6;
          const d = 1 + (Math.random() - .5) * .06;   // slight pitch variation per bee
          const o1 = osc("square", 142 * d), o2 = osc("triangle", 284.5 * d);
          const o2g = ctx.createGain(); o2g.gain.value = .5;
          o1.connect(lp); o2.connect(o2g); o2g.connect(lp);
          const w = osc("sine", 1.3), wg = ctx.createGain(); wg.gain.value = 7;
          w.connect(wg); wg.connect(o1.frequency); wg.connect(o2.frequency);
          const l = osc("sine", 5.5), lg = ctx.createGain(); lg.gain.value = .18;
          l.connect(lg); lg.connect(trem.gain);
          lp.connect(pk); pk.connect(trem);
        } else {
          const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 520; bp.Q.value = 1.1;
          const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1500;
          const d = 1 + (Math.random() - .5) * .14;   // slight pitch variation per fly
          const a = osc("sawtooth", 187 * d), b = osc("sawtooth", 193.5 * d);
          a.connect(bp); b.connect(bp);
          const l = osc("sine", 11 * d), lg = ctx.createGain(); lg.gain.value = .35;
          l.connect(lg); lg.connect(trem.gain);
          const w = osc("sine", 2.3), wg = ctx.createGain(); wg.gain.value = 9;
          w.connect(wg); wg.connect(a.frequency); wg.connect(b.frequency);
          bp.connect(lp); lp.connect(trem);
        }
        trem.connect(out);
        if (pan) { out.connect(pan); pan.connect(master); } else out.connect(master);
        nodes.forEach(o => o.start());
        return {
          set(level, p, rate) {
            const t = ctx.currentTime;
            out.gain.setTargetAtTime(level, t, .08);
            if (pan) pan.pan.setTargetAtTime(p, t, .05);
            if (beat && rate) beat.frequency.setTargetAtTime(rate, t, .1);
          },
          stop() {
            const t = ctx.currentTime;
            out.gain.setTargetAtTime(0, t, .04);
            nodes.forEach(o => { try { o.stop(t + .3); } catch (e) {} });
            setTimeout(() => { try { out.disconnect(); if (pan) pan.disconnect(); } catch (e) {} }, 600);
          },
        };
      },
      suspend() { if (ctx && ctx.state === "running") ctx.suspend(); },
      resume()  { if (ctx && ctx.state === "suspended") ctx.resume(); },
      swoosh()  { noise(.2, 2600, 480, .22); },
      caught()  {
        noise(.04, 3200, 1600, .22);
        boing();
        tone(880, .14, "triangle", .2, .03);
        tone(1318.5, .22, "triangle", .18, .11);
      },
      squeak()  { tone(1450, .5, "sine", .07, 0, 720); },
      combo(n)  {
        const notes = [659.25, 783.99, 987.77, 1174.66, 1318.5, 1567.98, 1975.5];
        const k = Math.min(3 + n, notes.length);
        for (let i = 0; i < k; i++) tone(notes[i], .17, "triangle", .17, .14 + i * .06);
        tone(2637, .35, "sine", .07, .14 + k * .06);
        tone(3136, .4, "sine", .05, .2 + k * .06);
      },
      bfCatch() { tone(784, .18, "triangle", .15); tone(1175, .26, "triangle", .13, .08); },
      bfLand()  { tone(1568, .35, "sine", .06); tone(2093, .4, "sine", .04, .08); },
      bfWrong() { tone(392, .3, "sine", .07, 0, 330); },
      no()      {   // a friendly "nuh-uh": a short high note, then a lower one that sags
        tone(523, .13, "triangle", .2, 0, 466); tone(523, .13, "square", .045, 0, 466);
        tone(392, .28, "triangle", .2, .17, 330); tone(392, .28, "square", .045, .17, 330);
      },
      bfBloom() { tone(523, .22, "sine", .08, 0, 784); tone(784, .26, "sine", .06, .1, 1046); },
      antDrop() { tone(620, .1, "sine", .07, 0, 360); noise(.06, 900, 500, .05); },
      antMunch() { noise(.09, 2400, 1300, .09); tone(330, .06, "triangle", .05, .02); },
      antHome() { tone(880, .12, "triangle", .12); tone(1175, .2, "triangle", .1, .09); },
      antPeek() { tone(990, .09, "sine", .05, 0, 1320); },
      antRumble() { tone(240, .45, "triangle", .08, 0, 160); tone(200, .4, "triangle", .07, .4, 140); },
      bfDone()  { [659, 784, 988, 1319].forEach((f, i) => tone(f, .22, "triangle", .15, i * .09)); },
      bloom()   { tone(660, .2, "sine", .07, 0, 990); tone(990, .24, "sine", .05, .09, 1320); },
      uiOn()    { tone(660, .08, "triangle", .12, .06); tone(990, .12, "triangle", .12, .13); },
      uiOff()   { tone(760, .08, "triangle", .11); tone(470, .12, "triangle", .11, .07); },
      tick()    { tone(1760, .06, "square", .05); },
      timeUp()  { tone(392, .3, "sawtooth", .1, 0, 262); tone(262, .65, "sawtooth", .1, .28, 170); },
      newBest() { [783.99, 987.77, 1174.66, 1567.98].forEach((f, i) => tone(f, .32, "triangle", .18, .35 + i * .11)); },
      aww()     { tone(392, .26, "triangle", .15, 0, 330); tone(330, .4, "triangle", .15, .24, 247); },
      levelUp() { [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, .24, "triangle", .2, i * .1)); },
      win()     {
        [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5, 1318.5].forEach((f, i) =>
          tone(f, i > 4 ? .5 : .22, "triangle", .2, i * .12));
        [261.63, 329.63, 392].forEach((f, i) => tone(f, .9, "sine", .1, .6 + i * .02));
      },
    };
  })();

  // ================= "No!" on a bee hit =================
  // A short synthesized "nuh-uh" in every language; skips while the last one is still sounding, to avoid overlap
  const miss = (() => {
    let last = -Infinity;
    return {
      sayNow() {
        if (muted) return;
        const now = performance.now();
        if (now - last < 600) return;
        last = now;
        sfx.no();
      },
      reset() { last = -Infinity; },
    };
  })();

  // ================= State =================
  let flies = [], level = 0, caughtInLevel = 0, running = false, gameOver = false;
  let pending = 0, gen = 0, endTimer = null;
  let clock = 0, timeLeft = 0, shownTime = -1, lowTick = -1;
  let paused = false, resumeQueue = [];
  let score = 0, streak = 0, bestStreak = 0, swings = 0, goodSwings = 0;

  const isAlive = f => f.state === "fly" || f.state === "rest";
  const isBee = f => f.kind === "bee";
  const leaving = f => f.state === "exit" && running;   // flying off screen while the game is still running
  const aliveCount = () => flies.filter(f => isBee(f) ? !f.dead : (isAlive(f) || (f.leftNat && f.state === "exit"))).length + pending;
  let lastKind = "fly";
  function chooseKind() {
    if (MODE !== "bees") return "fly";
    const fliesNow = flies.filter(f => !isBee(f) && isAlive(f)).length;
    const last = level === LEVELS.length - 1;
    // Last level: never spawn more flies than needed to win
    if (last && fliesNow >= LV().goal - caughtInLevel) return Math.random() < BEE.chance[level] ? "bee" : null;
    // No two bees in a row while no flies are on screen
    if (lastKind === "bee" && fliesNow === 0) return "fly";
    return Math.random() < BEE.chance[level] ? "bee" : "fly";
  }
  const baseSpeed = () => LV().speed * clamp(MIN / 700, .62, 1.15) * (isCh() ? CH.speed : 1);
  const restChance = () => LV().rest * (isCh() ? CH.rest : 1);

  // ================= Flies =================
  function spawnFly(kind = "fly") {
    const pool = SIZES[MODE];
    const sc = pool[Math.floor(Math.random() * pool.length)];
    const Z = S * sc;

    const flower = kind === "bee" ? plantFlower() : null;
    let edge = Math.floor(Math.random() * 4);
    if (flower) edge = flower.x < W / 2 ? 1 : 0;   // enter from the far side for a longer trip to the flower
    let x, y;
    if (edge === 0)      { x = -Z;    y = rand(TOP_PAD, H - Z); }
    else if (edge === 1) { x = W + Z; y = rand(TOP_PAD, H - Z); }
    else if (edge === 2) { x = rand(Z, W - Z); y = -Z; }
    else                 { x = rand(Z, W - Z); y = H + Z; }
    let tx = rand(W * .25, W * .75), ty = rand(Math.max(TOP_PAD + Z, H * .3), H * .72);
    if (flower) {   // start above the flower and head down to it
      y = clamp(flower.y - rand(40, 150), TOP_PAD + Z * .5, H - Z);
      tx = flower.x; ty = flower.y;
    }
    const heading = Math.atan2(ty - y, tx - x);
    const k = rand(.85, 1.15);

    flies.push({
      x, y, heading, target: heading, flying: true, top: false, caughtAt: -1, dodgeAt: -1, dizzyAt: -1,
      spdK: k, speed: baseSpeed() * k, turn: rand(.6, 1.2),
      state: "fly", rest: 0, tw: 0, rotTarget: 0, entered: false,
      rot: heading * 180 / Math.PI + 90, t: 0, wob: rand(0, 6.28),
      vy: 0, slideT: 0, xOff: 0, dead: false, born: null, sc, z: Z,
      kind, life: kind === "bee" ? BEE.life : rand(FLY_LIFE[0], FLY_LIFE[1]), exitK: 2, bump: 0,
      phase: kind === "bee" ? "go" : null, sip: false, flower,
      voice: sfx.voice(kind), vl: -1, vp: 9,
      restsLeft: Math.random() < .5 ? 3 : 4,
    });
  }

  function step(dt) {
    for (const f of flies) {
      const Z = S * f.sc, b = bounds(Z * .5);
      f.t += dt;
      if (f.bump > 0) f.bump -= dt;
      if (f.entered && isAlive(f)) {
        f.life -= dt;
        if (isBee(f)) { if (f.life <= 0) beeDone(f); }   // safety cap
        else if (MODE === "bees" && f.life <= 0) { f.leftNat = true; leave(f, 1.3); }
      }

      if (f.state === "fly") {
        // Ease existing flies toward the new level's speed
        f.speed += (baseSpeed() * f.spdK * (isBee(f) ? BEE.speed : 1) - f.speed) * Math.min(1, dt * 1.2);
        // Bee heads to its flower
        let near = 1;
        if (isBee(f) && f.phase === "go" && f.flower) {
          const fd = Math.hypot(f.flower.x - f.x, f.flower.y - f.y);
          f.target = Math.atan2(f.flower.y - f.y, f.flower.x - f.x);
          f.turn = 1;
          near = 2.2 * clamp(fd / (Z * 2.2), .25, 1);   // fast toward the flower, slowing when close
          if (f.entered && fd < Z * .35) {
            f.phase = "sip"; f.sip = true; f.landed = false; f.state = "rest";
            f.rest = rand(BEE.sip[0], BEE.sip[1]); f.tw = 0; f.rotTarget = f.rot;
          }
        }
        f.turn -= dt;
        if (f.turn <= 0) {
          const tx = rand(b.minX + 30, b.maxX - 30), ty = rand(b.minY + 20, b.maxY - 20);
          f.target = Math.atan2(ty - f.y, tx - f.x) + rand(-.5, .5);
          f.turn = rand(.45, 1.3);
        }
        f.heading += clamp(angDiff(f.target, f.heading), -3.2 * dt, 3.2 * dt);
        const hd = f.heading + Math.sin(f.t * 9 + f.wob) * (isBee(f) ? .16 : .32);
        const sp = f.speed * near * (1 + Math.sin(f.t * 3.1 + f.wob) * .18);
        f.x += Math.cos(hd) * sp * dt;
        f.y += Math.sin(hd) * sp * dt;

        if (!f.entered) {
          if (f.x > b.minX && f.x < b.maxX && f.y > b.minY && f.y < b.maxY) { f.entered = true; f.born = clock; }
        } else {
          if (f.x < b.minX) { f.x = b.minX; f.heading = Math.PI - f.heading; f.target = f.heading; }
          if (f.x > b.maxX) { f.x = b.maxX; f.heading = Math.PI - f.heading; f.target = f.heading; }
          if (f.y < b.minY) { f.y = b.minY; f.heading = -f.heading; f.target = f.heading; }
          if (f.y > b.maxY) { f.y = b.maxY; f.heading = -f.heading; f.target = f.heading; }
          if (!isBee(f) && Math.random() < dt * restChance()) {   // bees only rest on flowers
            f.state = "rest"; f.rest = rand(...LV().restDur) * (isCh() ? CH.restDur : 1); f.tw = 0; f.rotTarget = f.rot;
            f.flying = false;
          }
        }
        f.rot = lerpDeg(f.rot, hd * 180 / Math.PI + 90, clamp(dt * 10, 0, 1));

      } else if (f.state === "rest") {
        f.rest -= dt; f.tw -= dt;
        if (f.sip && f.flower) {   // sipping on the flower
          const tx = f.flower.x + Math.sin(f.t * 2.2) * 2;
          const ty = f.flower.y - Z * .08 + Math.sin(f.t * 5) * 1.8;
          const k = Math.min(1, dt * 4.5);   // smooth landing, no jump
          f.x += (tx - f.x) * k;
          f.y += (ty - f.y) * k;
          if (!f.landed && Math.hypot(tx - f.x, ty - f.y) < 4) {
            f.landed = true; f.flying = false;   // landed: fold wings
          }
        }
        if (f.tw <= 0) { f.tw = rand(.35, .8); f.rotTarget = f.rot + rand(-14, 14); }
        f.rot = lerpDeg(f.rot, f.rotTarget, clamp(dt * 12, 0, 1));
        if (f.rest <= 0) {
          if (f.sip) beeDone(f);
          else if (MODE === "bees" && !isBee(f) && --f.restsLeft <= 0) {
            f.leftNat = true; leave(f, 1.3);   // rested 3-4 times: leave
          } else {
            f.state = "fly"; f.flying = true;
            f.heading = f.target = rand(0, Math.PI * 2); f.turn = rand(.3, .8);
          }
        }

      } else if (f.state === "slide") {
        // Slide down the glass: slow at first, then accelerating
        f.slideT += dt;
        f.vy += 540 * dt;
        f.y += f.vy * dt;
        f.xOff = Math.sin(f.slideT * 8) * 5 * Math.max(0, 1 - f.slideT * .7);
        f.rot = lerpDeg(f.rot, 180, clamp(dt * 2.4, 0, 1));
        if (f.y > H + Z) f.dead = true;

      } else if (f.state === "exit") {
        f.x += Math.cos(f.heading) * f.speed * f.exitK * dt;
        f.y += Math.sin(f.heading) * f.speed * f.exitK * dt;
        f.rot = lerpDeg(f.rot, f.heading * 180 / Math.PI + 90, clamp(dt * 10, 0, 1));
        if (f.x < -Z * 2 || f.x > W + Z * 2 || f.y < -Z * 2 || f.y > H + Z * 2) f.dead = true;
      }

    }
    collide();
    if (flies.some(f => f.dead)) {
      const refill = flies.some(f => f.dead && (isBee(f) || f.leftNat));
      flies = flies.filter(f => { if (f.dead && f.voice) f.voice.stop(); return !f.dead; });
      if (refill && running) fill();   // freed slot for a new fly or bee
    }
  }

  // Soft collisions: no overlap, each bounces away
  function collide() {
    const act = flies.filter(f => isAlive(f) || f.state === "exit");   // includes entering and fleeing ones
    for (let i = 0; i < act.length; i++) for (let j = i + 1; j < act.length; j++) {
      const a = act[i], c = act[j];
      const dx = c.x - a.x, dy = c.y - a.y, d = Math.hypot(dx, dy) || .001;
      const min = (a.sc + c.sc) * S * .42;
      if (d >= min) continue;
      const aFix = a.sip, cFix = c.sip;   // a sipping bee is never pushed
      if (aFix && cFix) continue;
      const nx = dx / d, ny = dy / d, push = min - d;
      const wa = aFix ? 0 : cFix ? 1 : .5, wc = cFix ? 0 : aFix ? 1 : .5;
      a.x -= nx * push * wa; a.y -= ny * push * wa;
      c.x += nx * push * wc; c.y += ny * push * wc;
      if (!aFix && !(a.bump > 0)) bounce(a, Math.atan2(-ny, -nx));
      if (!cFix && !(c.bump > 0)) bounce(c, Math.atan2(ny, nx));
    }
  }
  function bounce(f, away) {
    f.heading = f.target = away + rand(-.45, .45);
    f.turn = rand(.5, .9); f.bump = .45;
    if (f.state === "rest") { f.state = "fly"; f.flying = true; }   // a resting one takes off
  }

  // Bee flowers
  const flora = $("flora");
  let beeFlowers = [];
  function plantFlower() {
    const F = S * 1.45;
    let x, base, tries = 0;
    do {
      x = rand(W * .12, W * .88);
      base = rand(H * .86, H * .98);   // root in the green ground strip
    } while (++tries < 12 && flies.some(f => f.flower && Math.abs(f.flower.x - x) < F * 1.1));
    const fl = { x, y: base - F * .75, base, F, c: PETALS[Math.floor(Math.random() * PETALS.length)], t: 0, wiltAt: -1 };
    beeFlowers.push(fl);
    sfx.bloom();
    return fl;
  }
  function wiltFlower(fl) {
    if (fl && fl.wiltAt < 0) fl.wiltAt = fl.t;
  }
  function beeDone(f) {
    f.sip = false; f.phase = "done";
    wiltFlower(f.flower); f.flower = null;
    leave(f, 1.3);
  }

  // Fly off toward the nearest edge
  function leave(f, k) {
    const Z = S * f.sc;
    const dl = f.x, dr = W - f.x, dtp = f.y, db = H - f.y, m = Math.min(dl, dr, dtp, db);
    f.heading = (m === dl ? Math.PI : m === dr ? 0 : m === dtp ? -Math.PI / 2 : Math.PI / 2) + rand(-.3, .3);
    f.state = "exit"; f.exitK = k; f.flying = true;
  }
  // Visual alert for hitting a bee
  const ALERT_SVG = `<svg viewBox="0 0 100 100" aria-hidden="true">
    <circle cx="50" cy="50" r="44" fill="#FF5A5A" stroke="#fff" stroke-width="7"/>
    <path d="M34 34 L66 66 M66 34 L34 66" stroke="#fff" stroke-width="11" stroke-linecap="round"/></svg>`;
  let warnT = null;
  function beeAlert(x, y, key = "thatsBee") {
    fx.querySelectorAll(".bee-alert").forEach(n => n.remove());   // only one at a time
    const el = document.createElement("div");
    el.className = "bee-alert";
    el.innerHTML = ALERT_SVG + "<span>" + T(key) + "</span>";
    fx.appendChild(el);
    const half = Math.min(W / 2, el.offsetWidth / 2 + 8);   // keeps the whole badge on screen
    el.style.left = clamp(x, half, W - half) + "px";
    el.style.top  = clamp(y, TOP_PAD + 70, H - 70) + "px";
    setTimeout(() => el.remove(), 1400);
    glass.classList.add("warn");
    clearTimeout(warnT);
    warnT = setTimeout(() => glass.classList.remove("warn"), 260);
  }

  // A hit bee panics and flees away from the net
  function dodge(f, px, py) {
    f.dodged = true;
    f.sip = false; f.phase = "done";
    wiltFlower(f.flower); f.flower = null;
    f.heading = Math.atan2(f.y - py, f.x - px) + rand(-.25, .25);
    f.state = "exit"; f.exitK = 3.2; f.flying = true; f.dodgeAt = f.t;
  }

  // ================= Butterfly garden =================
  // Colours and pictures: src/butterflies/art.ts
  addPageDefs();
  document.querySelectorAll('[data-ico="butterfly"]').forEach(e => { e.innerHTML = butterflySVG(BF_COLORS[1]); });
  document.querySelectorAll('[data-ico="flower"]').forEach(e => { e.innerHTML = gardenFlowerSVG(BF_COLORS[0]); });
  // Colours a young child still mixes up: never a flower of one with butterflies of the other on screen
  const BF_CLOSE = [["blue", "purple"]];
  const bfClose = (a, b) => BF_CLOSE.some(([x, y]) => (a.id === x && b.id === y) || (a.id === y && b.id === x));
  // pool: how many of BF_COLORS the level may use; colors: butterfly colours in each part of the level;
  // flowers: flowers on screen at once, each wanting one of those colours
  // (the rest have no flower); flies: most butterflies in the air at once, counting ones still flying away; speed px/s; per: butterflies per flower;
  // goal: flowers per level, a multiple of flowers
  const BF_EASY = [
    { pool: 3, colors: 1, flowers: 1, flies: 2, speed: 44, per: 2, goal: 3 },
    { pool: 3, colors: 2, flowers: 2, flies: 3, speed: 48, per: 2, goal: 6 },
    { pool: 3, colors: 1, flowers: 1, flies: 3, speed: 54, per: 3, goal: 4 },
    { pool: 4, colors: 2, flowers: 2, flies: 3, speed: 58, per: 3, goal: 6 },
    { pool: 4, colors: 2, flowers: 2, flies: 4, speed: 64, per: 3, goal: 6 },
  ];
  const BF_LEVELS = [
    { pool: 3, colors: 1, flowers: 1, flies: 2, speed: 48, per: 2, goal: 3 },   // warm-up: every butterfly is right
    { pool: 3, colors: 2, flowers: 2, flies: 3, speed: 52, per: 2, goal: 6 },   // still every butterfly is right, each to its own flower
    { pool: 3, colors: 2, flowers: 1, flies: 3, speed: 56, per: 2, goal: 3 },   // first real choice: only one colour fits
    { pool: 4, colors: 3, flowers: 2, flies: 4, speed: 62, per: 2, goal: 6 },   // one colour has no flower
    { pool: 4, colors: 4, flowers: 2, flies: 4, speed: 68, per: 2, goal: 6 },   // two colours have no flower
  ];
  const BF_HINT_AFTER = 4;   // seconds without a match before the right butterflies glow
  const BF_AFTER_CATCH = 2;   // seconds after a catch before the next butterfly flies in
  const pick = a => a[Math.floor(Math.random() * a.length)];

  let garden = [];   // every garden flower on screen, wilting ones too (bfFlowers holds only the ones still in play)
  let bugs = [], bfCarries = [], bfOnClear = null, bfSpawnT = 0, bfFlowers = [], bfPartN = 1, bfSet = null, bfSeen = [], bfHintT = 0, B = 80, F = 140;
  // Every part of a stage picks random colours from its level's pool: the flowers' colours, then the ones with no flower.
  // Close colours never meet as "right" and "wrong"; among the choices left, flower colours not shown yet come first
  // and the last part's are avoided, so every colour gets its turn
  const bfSubsets = (a, k) => k === 0 ? [[]] : a.flatMap((x, i) => bfSubsets(a.slice(i + 1), k - 1).map(r => [x, ...r]));
  function bfPickSet() {
    const L = LV(), prev = bfSet ? bfSet.flowers : [], pool = BF_COLORS.slice(0, L.pool);
    if (pool.every(k => bfSeen.includes(k))) bfSeen = [];
    const rank = k => prev.includes(k) ? 2 : bfSeen.includes(k) ? 1 : 0;
    let best = [], low = Infinity;
    for (const all of bfSubsets(pool, Math.max(L.colors, L.flowers))) for (const flowers of bfSubsets(all, L.flowers)) {
      const rest = all.filter(k => !flowers.includes(k));
      const clash = flowers.some((a, i) => flowers.slice(i + 1).concat(rest).some(b => bfClose(a, b)));
      const score = (clash ? 100 : 0) + flowers.reduce((t, k) => t + rank(k), 0);
      if (score < low) { low = score; best = []; }
      if (score === low) best.push({ flowers, rest });
    }
    const c = pick(best), flowers = c.flowers.slice();
    if (Math.random() < .5) flowers.reverse();
    bfSeen.push(...flowers.filter(k => !bfSeen.includes(k)));
    return { flowers, all: flowers.concat(c.rest), fresh: true };
  }
  function bfMeasure() {
    B = S * 1.15;
    F = clamp(MIN * .26, 96, Math.max(190, MIN * .16));
    if (MODE === "butterflies" && LV().flowers > 1) F = Math.min(F, (W / 2 - B * .42 - 24) / 1.24);   // two flowers and their counters fit side by side
  }
  const bfBand = () => ({ minX: B * .6, maxX: W - B * .6, minY: TOP_PAD + B * .5, maxY: Math.max(TOP_PAD + B * 1.5, H - F * 1.25 - B * .2) });
  // One or two flowers, always in the same spots in the middle of the ground, so the child's eyes stay in one place
  const bfHead = fl => ({ x: bfPartN > 1 ? W / 2 + (fl.i ? 1 : -1) * F * .68 : W / 2, y: H - F * (140 / 120) * .98 + F * (50 / 120) });
  function bfSlot(fl, j) {
    const h = bfHead(fl), spots = [[0, -.3], [-.3, -.12], [.3, -.12]];
    return { x: h.x + spots[j][0] * F, y: h.y + spots[j][1] * F };
  }
  const bfNeed = fl => fl.per - fl.bugs.length;
  const bfOpen = () => bfFlowers.filter(fl => bfNeed(fl) > 0);
  function bfLayout() {
    const fh = F * 140 / 120, rtl = document.documentElement.dir === "rtl", two = bfPartN > 1;
    for (const fl of bfFlowers) {
      const h = bfHead(fl);
      fl.at = { x: h.x, base: H - fh * .98 + fh, F };
      fl.bugs.forEach((b, j) => { if (b.state === "rest") { const p = bfSlot(fl, j); b.x = p.x; b.y = p.y; } });
      fl.slotAt = fl.slotOn ? bfSlot(fl, fl.bugs.length) : null;
      // The counter sits beside its flower: on the reading-end side for one flower, on the outer side for two
      const side = two ? (fl.i ? 1 : -1) : (rtl ? -1 : 1), x = h.x + side * F * .56;
      fl.count.style.setProperty("--m", B * .42 + "px");
      fl.count.style.transform = `translate(${x}px,${h.y}px) translate(${side < 0 ? "-100%" : "0"},-50%)`;
    }
  }

  // A new part of the stage: its flowers grow on an empty screen, then their butterflies fly in
  function bfNewPart() {
    if (gameOver) return;
    if (!bfSet || !bfSet.fresh) bfSet = bfPickSet();
    bfSet.fresh = false;
    const ks = bfSet.flowers.slice();
    if (Math.random() < .5) ks.reverse();   // the two flowers swap sides now and then
    bfPartN = ks.length;
    bfFlowers = ks.map((k, i) => {
      const count = document.createElement("div");
      count.className = "bcount";
      count.style.setProperty("--k", k.d);
      count.innerHTML = `<b class="n" dir="ltr">0/${LV().per}</b>` +
        Array.from({ length: LV().per }, () => `<i>${butterflySVG(k, true)}</i>`).join("");
      flora.append(count);
      return { k, i, count, bugs: [], per: LV().per, t: 0, at: null, current: true, nudgeAt: -1, doneAt: -1, wiltAt: -1,
        slotOn: true, slotAt: null };
    });
    garden.push(...bfFlowers);
    bfMeasure(); prepareArt(); bfLayout(); bfHintT = 0;
    bfSpawnT = .7;   // the first butterfly comes once the flower has grown
    sfx.bfBloom();
    bfRefill();
  }
  const BF_SIZES = [.9, 1, 1.12];
  function bfSpawn(k) {
    const size = B * pick(BF_SIZES);
    const band = bfBand(), left = Math.random() < .5;
    const b = { k, size, sz0: size, szAt: -99, szDur: .8, ph: Math.random(), flee: false, rest: false, carried: false,
      hint: false, hintAt: 0, x: left ? -B * .3 : W + B * .3, y: rand(band.minY, band.maxY),
      heading: left ? rand(-.4, .4) : Math.PI + rand(-.4, .4), turn: 0, t: rand(0, 9), wob: rand(0, 6.3),
      state: "fly", entered: false, fleeT: 0, deg: 0, tw: null, spdK: rand(.85, 1.15), bump: 0,
      voice: sfx.voice("butterfly"), vl: -1, vp: 9, vr: 0 };
    b.target = b.heading;
    bugs.push(b);
  }
  const bfFree = () => bugs.filter(b => (b.state === "fly" || b.state === "flee") && !b.leaving);
  function bfLeave(b) {
    b.state = "flee"; b.fleeT = 99; b.leaving = true; b.entered = false;
    b.heading = b.target = b.x < W / 2 ? Math.PI : 0; b.rest = false; b.hint = false; b.flee = true;
  }
  // Every flower that still needs butterflies gets at least one of its colour in the air, never more than it still needs;
  // the rest are colours with no flower (a full flower's colour stops coming, so it never turns "wrong").
  // bfRefill only sends extras away; new ones fly in one at a time from bfStep
  function bfRefill() {
    if (gameOver || !running || !bfFlowers.length) return;
    const want = LV().flies, others = bfSet.all.filter(c => !bfSet.flowers.includes(c));
    for (const k of bfSet.flowers) {   // no more of a colour in the air than its flower still needs (none once it has gone)
      const fl = bfFlowers.find(x => x.k === k);
      bfFree().filter(b => b.k === k).slice(fl ? bfNeed(fl) : 0).forEach(bfLeave);
    }
    for (const fl of bfOpen()) {   // make room for a missing colour
      const free = bfFree();
      if (!free.some(b => b.k === fl.k) && free.length >= want) { const x = free.find(b => others.includes(b.k)); if (x) bfLeave(x); }
    }
  }
  // Colour of the next butterfly to fly in, or null when none is needed
  function bfNextKind() {
    const free = bfFree(), open = bfOpen(), others = bfSet.all.filter(c => !bfSet.flowers.includes(c));
    const seen = c => free.filter(b => b.k === c).length;
    const short = open.filter(fl => seen(fl.k) < bfNeed(fl)), missing = short.filter(fl => !seen(fl.k));
    const wrongInAir = free.some(b => others.includes(b.k));
    if (missing.length && others.length && !wrongInAir && Math.random() < .5) return pick(others);   // so there is a choice to make, even for a quick child
    if (missing.length) return pick(missing).k;
    if (others.length && (!short.length || Math.random() >= .35)) { const few = Math.min(...others.map(seen)); return pick(others.filter(c => seen(c) === few)); }
    return short.length ? pick(short).k : null;
  }
  // Butterflies arrive one by one, never all at once, and the sky never holds more than the level allows
  function bfSpawnStep(dt) {
    if (gameOver || !running || !bfFlowers.length || (bfSpawnT -= dt) > 0) return;
    const inAir = bugs.filter(b => b.state === "fly" || b.state === "flee").length;
    const k = inAir < LV().flies ? bfNextKind() : null;
    if (k) { bfSpawn(k); bfSpawnT = rand(1, 1.8); } else bfSpawnT = .25;
  }
  function bfStep(dt) {
    const band = bfBand(), sk = clamp(MIN / 700, .7, 1.2), speed = LV().speed;
    bfSpawnStep(dt);
    bfCarries.slice().forEach(c => bfCarryStep(c, dt));
    for (const b of bugs) {
      b.t += dt; flap(b, dt);
      if (b.state === "fly" || b.state === "flee") {
        if (b.state === "flee" && (b.fleeT -= dt) <= 0) { b.state = "fly"; b.flee = false; }
        if (b.state === "fly" && (b.turn -= dt) <= 0) {
          b.target = Math.atan2(rand(band.minY, band.maxY) - b.y, rand(band.minX, band.maxX) - b.x);
          b.turn = rand(1.2, 2.6);
        }
        b.heading += clamp(angDiff(b.target, b.heading), -1.8 * dt, 1.8 * dt);
        const sp = b.leaving ? Math.max(speed * sk * 5, MIN * .6)   // leaving ones clear the screen quickly
          : speed * sk * b.spdK * (b.state === "flee" ? 3.4 : 1);
        b.x += Math.cos(b.heading) * sp * dt;
        b.y += Math.sin(b.heading) * sp * dt + Math.cos(b.t * 4.2 + b.wob) * B * .55 * dt;   // gentle up-and-down flutter
        if (!b.entered) { if (!b.leaving && b.x > band.minX && b.x < band.maxX) b.entered = true; }
        else {
          if (b.x < band.minX || b.x > band.maxX) { b.x = clamp(b.x, band.minX, band.maxX); b.heading = Math.PI - b.heading; b.target = b.heading; }
          if (b.y < band.minY || b.y > band.maxY) { b.y = clamp(b.y, band.minY, band.maxY); b.heading = -b.heading; b.target = b.heading; }
        }
        const lean = clamp(angDiff(b.heading, -Math.PI / 2), -.6, .6) * 180 / Math.PI;
        b.deg += (lean - b.deg) * Math.min(1, dt * 3);
        if (b.leaving && (b.x < -B || b.x > W + B || b.y < -B)) b.gone = true;
      } else if (b.state === "toFlower") {
        b.deg += -b.deg * Math.min(1, dt * 4);   // moved by its carry, below
      } else if (b.state === "rest") {
        b.deg = Math.sin(b.t * 1.3 + b.wob) * 4;
      }
    }
    bfCollide(dt);
    if (bugs.some(b => b.gone)) bugs = bugs.filter(b => { if (b.gone && b.voice) b.voice.stop(); return !b.gone; });
    if (bfOnClear && !bugs.length) { const fn = bfOnClear; bfOnClear = null; fn(); }
    if (bfFlowers.length && running) {
      bfHintT += dt;
      if (bfHintT > BF_HINT_AFTER) {
        const ks = bfOpen().map(fl => fl.k);
        bfFree().forEach(b => { const on = ks.includes(b.k); if (on && !b.hint) b.hintAt = b.t; b.hint = on; });
      }
    }
  }
  // Soft collisions between flying butterflies: no overlap, each turns away (carried and resting ones are left alone)
  function bfCollide(dt) {
    const act = bugs.filter(b => b.state === "fly" || b.state === "flee");
    act.forEach(b => { if (b.bump > 0) b.bump -= dt; });
    for (let i = 0; i < act.length; i++) for (let j = i + 1; j < act.length; j++) {
      const a = act[i], c = act[j], dx = c.x - a.x, dy = c.y - a.y, d = Math.hypot(dx, dy) || .001;
      const min = (a.size + c.size) * .5;   // wings fill nearly the whole box, so keep the boxes apart
      if (d >= min) continue;
      const nx = dx / d, ny = dy / d, push = (min - d) / 2;
      a.x -= nx * push; a.y -= ny * push; c.x += nx * push; c.y += ny * push;
      for (const [b, away] of [[a, Math.atan2(-ny, -nx)], [c, Math.atan2(ny, nx)]]) {
        if (b.bump > 0 || b.leaving) continue;
        b.heading = b.target = away + rand(-.4, .4); b.turn = rand(.8, 1.4); b.bump = .5;
      }
    }
  }
  // One swing can scoop several butterflies: the net sweeps up through them in one quick move, carries them in its bag
  // and tips them out onto the flower
  const SWING = .16, CARRY = .6, RELEASE = .5;
  const BAG_SPOTS = [[0, 0], [-.3, -.14], [.3, -.14], [0, -.32]];   // where each one sits in the bag, in hoop radii
  function bfCatch(list, fl) {
    const art = NET_ART.butterfly, k = NET_R / art.r;
    const net = document.createElement("div");
    net.className = "net carry"; net.innerHTML = art.svg;
    net.style.transformOrigin = `${art.hx / 2}% ${art.hy / 2}%`;
    net.style.opacity = 0;
    sizeNet(net); fx.appendChild(net);
    const cx = list.reduce((a, b) => a + b.x, 0) / list.length, cy = list.reduce((a, b) => a + b.y, 0) / list.length;
    const bag = { x: -4 * k, y: 52 * k };   // middle of the cloth bag, below the hoop
    const end = { x: cx - bag.x, y: cy - bag.y };   // hoop where the bag holds them
    const c = { fl, net, bag, t: 0, out: false, members: [],
      start: { x: end.x + NET_R * .35, y: cy + NET_R * 1.25 }, end };   // comes up from below and sweeps through
    const small = B * (list.length > 1 ? .5 : .6);   // small enough to sit inside the bag
    list.forEach((b, i) => {
      const j = fl.bugs.length;
      fl.bugs.push(b);
      b.state = "toFlower"; b.hint = false; b.flee = true; b.carried = true;   // flutters hard while caught
      bugSize(b, small);
      b.tw = c;
      c.members.push({ b, j, x0: b.x, y0: b.y, off: BAG_SPOTS[i % BAG_SPOTS.length] });
    });
    bfCarries.push(c);
    bfCarryStep(c, 0);
    bfSpawnT = Math.max(bfSpawnT, BF_AFTER_CATCH);   // a calm moment: the next one only comes once this one is on its way
    sfx.bfCatch();
    bugs.forEach(x => { x.hint = false; }); bfHintT = 0;
    if (fl.bugs.length >= fl.per) { fl.slotOn = false; fl.slotAt = null; }
    else bfLayout();
    bfRefill();
  }
  function bfCarryStep(c, dt) {
    c.t += dt;
    const t = c.t, top = bfSlot(c.fl, 0), above = { x: top.x + B * .15, y: top.y - B * 1.1 };
    let h, rot = 0;
    if (t < SWING) {   // quick upward scoop; the butterflies drop into the bag as the hoop passes
      const u = t / SWING;
      h = { x: c.start.x + (c.end.x - c.start.x) * u, y: c.start.y + (c.end.y - c.start.y) * u };
      rot = 30 - 36 * u;
      c.net.style.opacity = Math.min(1, u * 3);
    } else if (t < SWING + CARRY) {   // keeps its upward momentum, then arcs over to the flower and slows down
      const u = (t - SWING) / CARRY, e = Math.sin(u * Math.PI / 2), p = c.end;
      const q = { x: p.x + (above.x - p.x) * .35, y: Math.min(p.y, above.y) - NET_R * 1.2 };
      h = { x: (1 - e) ** 2 * p.x + 2 * (1 - e) * e * q.x + e * e * above.x,
            y: (1 - e) ** 2 * p.y + 2 * (1 - e) * e * q.y + e * e * above.y };
      rot = -6 * (1 - e);
      c.net.style.opacity = 1;
    } else {
      h = above;
      if (!c.out) {
        c.out = true;
        c.net.animate([{ rotate: "0deg", opacity: 1 }, { rotate: "30deg", opacity: 0 }], { duration: RELEASE * 1000, easing: "ease-in", fill: "forwards" });
        c.members.forEach(m => { m.b.flee = false; bugSize(m.b, B * .9); });
      }
    }
    if (!c.out) c.net.style.rotate = rot + "deg";
    placeNet(c.net, h.x, h.y);
    const u = c.out ? Math.min(1, (t - SWING - CARRY) / RELEASE) : 0, e = 1 - Math.pow(1 - u, 3);
    for (const m of c.members) {
      const b = m.b, g = { x: h.x + c.bag.x + m.off[0] * NET_R, y: h.y + c.bag.y + m.off[1] * NET_R };
      if (t < SWING) {
        const w = clamp((t / SWING - .25) / .75, 0, 1), s = w * w * (3 - 2 * w);
        b.x = m.x0 + (g.x - m.x0) * s; b.y = m.y0 + (g.y - m.y0) * s;
      } else if (!c.out) {
        b.x = g.x + Math.sin(t * 22 + m.j) * 2; b.y = g.y;
      } else {
        const slot = bfSlot(c.fl, m.j);
        b.x = g.x + (slot.x - g.x) * e; b.y = g.y + (slot.y - g.y) * e - Math.sin(Math.PI * u) * B * .35;
      }
    }
    if (u >= 1) {
      c.net.remove();
      bfCarries = bfCarries.filter(x => x !== c);
      c.members.forEach(m => bfLand(m.b, m.j));
    }
  }
  function bfLand(b, j) {
    b.state = "rest"; b.carried = false; b.rest = true;
    const fl = b.tw.fl, mini = fl.count.querySelectorAll("i")[j], n = fl.count.querySelector(".n");
    if (mini) { mini.innerHTML = butterflySVG(fl.k); mini.classList.add("on"); }
    n.textContent = `${fl.bugs.filter(x => x.state === "rest").length}/${fl.per}`;
    n.classList.remove("pop"); void n.offsetWidth; n.classList.add("pop");
    sfx.bfLand();
    if (bfFlowers.includes(fl) && !fl.done && !bfNeed(fl) && fl.bugs.every(x => x.state === "rest")) bfFlowerFull(fl);
  }
  // Runs once every butterfly has left the screen
  function bfWhenClear(fn) { if (bugs.length) bfOnClear = fn; else fn(); }
  // Waits, holding through a pause, and gives up if the game was left or restarted meanwhile
  function bfLater(fn, ms) {
    const g = gen;
    setTimeout(function go() {
      if (g !== gen || gameOver) return;
      if (paused) { resumeQueue.push(go); return; }
      fn();
    }, ms);
  }
  // Wilts a flower away while its own butterflies fly off upward
  function bfWilt(fl, then) {
    fl.wiltAt = fl.t; fl.count.classList.add("gone");
    fl.bugs.forEach(b => {
      b.state = "flee"; b.fleeT = 99; b.leaving = true; b.entered = false;
      b.heading = b.target = -Math.PI / 2 + rand(-.9, .9); b.rest = false; b.flee = true;
    });
    bfLater(() => { garden = garden.filter(x => x !== fl); fl.count.remove(); if (then) then(); }, 650);
  }
  // A full flower cheers and earns its HUD star. With two flowers, a full one wilts away on its own so the child's eyes
  // move to the one still waiting; the part ends when every flower is full
  function bfFlowerFull(fl) {
    fl.done = true;
    fl.current = false; fl.doneAt = fl.t;
    const h = bfHead(fl); burst(h.x, h.y, F * .6);
    sfx.bfDone();
    caughtInLevel++;
    renderStars(true);
    if (bfFlowers.every(x => x.done)) { bfPartDone(); return; }
    bfFlowers = bfFlowers.filter(x => x !== fl);
    bfRefill();
    bfLater(() => bfWilt(fl), 900);
  }
  // The other butterflies leave, then the flowers wilt away with their own.
  // The next flowers only grow once the screen is empty, so each part of a stage starts fresh
  function bfPartDone() {
    const done = bfFlowers;
    bfFlowers = [];
    bfFlyAway();
    bfLater(() => {
      done.forEach((fl, i) => bfWilt(fl, i ? null : () => {
        const up = caughtInLevel >= LV().goal;
        if (up && level >= (bfPick ? BF_LEVELS : BF_EASY).length - 1) { finish(); return; }
        const g = gen;
        bfWhenClear(() => {
          if (g !== gen || gameOver) return;
          if (!up) { bfLater(bfNewPart, 350); return; }
          level++; caughtInLevel = 0;
          bfSet = bfPickSet();   // before the banner, so its mini butterflies show the first part's colours
          levelUp();
          bfLater(bfNewPart, 2100);
        });
      }));
    }, 900);
  }
  // Scares a butterfly a little way off from the net
  function bfShoo(b, px, py) {
    b.state = "flee"; b.fleeT = .7; b.flee = true;
    b.heading = b.target = Math.atan2(b.y - py, b.x - px) + rand(-.3, .3);
  }
  // A colour with no flower gets the same clear "No!" as a bee: badge, red edge glow and the "nuh-uh" sound
  function bfWrong(b, px, py) {
    bfShoo(b, px, py);
    bfFlowers.forEach(fl => { fl.nudgeAt = fl.t; });
    beeAlert(b.x, b.y, "wrongBf");
    miss.sayNow();
  }
  function bfTap(px, py) {
    const dist = b => Math.hypot(b.x - px, b.y - py);
    const near = bfFree().filter(b => dist(b) < NET_R + B * .35).sort((a, b) => dist(a) - dist(b));
    if (!near.length) return false;
    const home = b => bfFlowers.find(fl => fl.k === b.k && bfNeed(fl) > 0);
    const first = near.find(home);
    if (first) {   // every butterfly under the net that belongs to the nearest one's flower is caught; the others just flutter off
      const fl = home(first), good = near.filter(b => b.k === fl.k).slice(0, bfNeed(fl));
      near.filter(b => !good.includes(b)).forEach(b => bfShoo(b, px, py));
      bfCatch(good, fl);
      if (good.length > 1) combo(px, py, good.length);
      return true;
    }
    const wrong = near.find(b => !bfSet.flowers.includes(b.k));
    if (wrong) bfWrong(wrong, px, py);
    near.filter(b => b !== wrong).forEach(b => bfShoo(b, px, py));   // a full flower's colour just flutters off, no "No!"
    return false;
  }
  function bfFlyAway() { bugs.filter(b => b.state === "fly" || b.state === "flee").forEach(bfLeave); }
  function bfClear() {
    bugs.forEach(b => { if (b.voice) b.voice.stop(); if (b.tw && b.tw.net) b.tw.net.remove(); });
    bugs = []; bfCarries = []; bfOnClear = null; bfFlowers = []; garden = []; bfSet = null; bfSeen = [];
  }

  // ================= Feed the ants =================
  const ANT_LEVELS = [
    { speed: 140, goal: 3, foods: 1, flies: 2 },
    { speed: 150, goal: 4, foods: 2, flies: 2 },
    { speed: 160, goal: 5, foods: 3, flies: 2 },
    { speed: 170, goal: 6, foods: 4, flies: 2 },
    { speed: 180, goal: 6, foods: 5, flies: 2 },
  ];
  const ANT_MAX_FOOD = 2, ANT_PEEK_AFTER = 6, ANT_HUNGRY_AFTER = 12;
  document.querySelectorAll('[data-ico="ant"]').forEach(e => { e.innerHTML = ANT_SVG; });
  // The menu's moving pictures: drawn on canvases (src/menu/icons.ts)
  const heroShadow = { dy: 12, blur: 10, color: "rgba(0,0,0,.16)" }, icoShadow = { dy: 3, blur: 2, color: "rgba(0,0,0,.2)" };
  addIcon($("heroFly"), flierLook("fly"), heroShadow);
  addIcon($("startBtn").querySelector(".ico"), flierLook("fly"), icoShadow);
  addIcon($("beesBtn").querySelector(".ico"), flierLook("bee"), icoShadow);
  addIcon($("bfBtn").querySelector(".ico"), butterflyLook(BF_COLORS[1]), icoShadow);
  addIcon($("antBtn").querySelector(".ico"), antLook, icoShadow);

  let ants = [], foods = [], A = 90, antHill = { x: 0, y: 0 }, antG = { top: 0, bot: 0 }, antHillEl = null, antGroundEl = null;
  let antIdle = 0, antPeeked = false, antPeekEls = null, antQueue = [], antClock = 0, antNextOut = 0;
  const antScale = y => .82 + .28 * clamp((y - antG.top) / Math.max(1, antG.bot - antG.top), 0, 1);
  function antMeasure() {
    A = S * 1.3;
    glass.style.setProperty("--a", A + "px");
    antG = { top: Math.max(TOP_PAD + A, H * .56), bot: H - A * .3 };
    const grow = 1 + (MODE === "ants" ? level : 0) * .08, hw = A * 2.1 * grow, hh = A * .95 * grow, base = antG.top + hh * .8;
    const rtl = document.documentElement.dir === "rtl", x = rtl ? W - hw / 2 - A * .2 : hw / 2 + A * .2;
    antHill = { x, y: base - hh * .62, w: hw, h: hh };
    if (antHillEl) {
      antHillEl.style.width = hw + "px"; antHillEl.style.height = hh + "px";
      antHillEl.style.transform = `translate(${x - hw / 2}px,${base - hh}px)`;
    }
    if (antGroundEl) antGroundEl.style.top = antG.top - A * .55 + "px";
    if (antPeekEls) antPlacePeek();
  }
  function antStart() {
    antGroundEl = document.createElement("div"); antGroundEl.className = "antground";
    antHillEl = document.createElement("div"); antHillEl.className = "anthill"; antHillEl.innerHTML = `<div class="in">${HILL_SVG}</div>`;
    flora.append(antGroundEl, antHillEl);
    antIdle = 0; antPeeked = false;
    antMeasure();
    const gTop = antG.top - A * .55, gH = H * 1.04 - gTop;
    for (let n = 0, tries = 0; n < 14 && tries < 200; tries++) {
      const x = rand(W * .04, W * .96), y = rand(antG.top - A * .15, H - A * .15);
      if (Math.abs(x - antHill.x) < antHill.w * .62 && y < antHill.y + antHill.h * .7) continue;
      const t = document.createElement("i");
      t.className = n % 5 === 4 ? "tuft bloom" : "tuft";
      t.style.left = (x + W * .1) / (W * 1.2) * 100 + "%"; t.style.top = (y - gTop) / gH * 100 + "%";
      t.style.setProperty("--k", rand(.75, 1.3).toFixed(2));
      antGroundEl.appendChild(t); n++;
    }
  }
  function antClear() {
    antHidePeek();
    ants = []; foods = []; antQueue = []; antClock = antNextOut = 0; antHillEl = antGroundEl = null; antIdle = 0; antPeeked = false;
  }
  function antTap(px, py) {
    let max = ANT_MAX_FOOD;
    if (level === ANT_LEVELS.length - 1) max = Math.min(max, LV().goal - caughtInLevel);
    if (foods.length >= max) { burst(px, py, S * .35); return null; }
    antIdle = 0; antPeeked = false; antHidePeek();
    let x = clamp(px, A * .5, W - A * .5);
    const y = clamp(py + A * 1.2, antG.top, antG.bot), dx = x - antHill.x, dy = (y - antHill.y) / .55;
    if (Math.hypot(dx, dy) < antHill.w * .45) x = antHill.x + (dx < 0 ? -1 : 1) * antHill.w * .55;
    const k = antScale(y), fall = Math.max(0, (y - py) / k - A * .25);
    const f = { x, y, kind: Math.floor(Math.random() * LV().foods), t: 0, ant: null, carried: false,
      fall: { dx: (px - x) / k, dy: -fall, dur: (240 + fall * .5) / 1000 },   // from the hand, after a moment; lands in antStep
      landedAt: -1, bitten: false, bob: false, bobT: 0 };
    foods.push(f);
    return { x: px, y: y - k * (fall + A * .25) };
  }
  function antSend(f) {
    if (gameOver || !running) return;
    antQueue.push(f);
  }
  function antEmerge(f) {
    const a = { x: antHill.x, y: antHill.y, food: f, state: "out", t: 0, s: 0, tilt: 0, pose: null, pt: 0,
      face: f.x < antHill.x ? -1 : 1 };
    f.ant = a; ants.push(a);
  }
  const ANT_SNIFF = .7, ANT_CHEW = .7, ANT_GAP = 2;
  const antSetPose = (a, pose) => {
    if (a.pose !== pose) { a.pose = pose; a.pt = 0; }
    a.food.bob = !!a.food.carried && pose === "walk";
  };
  function antStep(dt) {
    const sp = LV().speed * clamp(MIN / 700, .7, 1.2);
    antClock += dt;
    const holeBusy = () => ants.some(a => a.state === "out" || a.state === "in");
    if (antQueue.length && running && !holeBusy() && antClock >= antNextOut) { antEmerge(antQueue.shift()); antNextOut = antClock + ANT_GAP; }
    for (const f of foods) {
      f.t += dt; f.bobT += dt;
      if (f.fall && f.t >= .2 + f.fall.dur) { f.fall = null; f.landedAt = f.t; sfx.antDrop(); antSend(f); }
    }
    for (const a of ants.slice()) {
      a.t += dt; a.pt += dt;
      if (a.ghost > 0) a.ghost -= dt;
      const f = a.food;
      if (a.state === "out") {
        a.s = Math.min(1, a.t / .35);
        if (a.s >= 1) { a.state = "walk"; antSetPose(a, "walk"); }
      } else if (a.state === "walk" || a.state === "home" || a.state === "wait") {
        if (a.state === "wait") {
          if (!holeBusy()) { a.state = "home"; antSetPose(a, "walk"); }
        } else {
          const tx = a.state === "walk" ? f.x - a.face * A * .36 : antHill.x, ty = a.state === "walk" ? f.y : antHill.y;
          const dx = tx - a.x, dy = ty - a.y, d = Math.hypot(dx, dy), step = sp * antScale(a.y) * dt;
          if (a.goal !== a.state) { a.goal = a.state; a.best = d; a.stuck = 0; }
          if (d < a.best - 2) { a.best = d; a.stuck = 0; }
          else if ((a.stuck += dt) > 1.2) { a.ghost = 1.5; a.stuck = 0; a.best = d; }
          if (a.state === "home" && d < A * .9 && holeBusy()) { a.state = "wait"; a.tilt = 0; antSetPose(a, "sniff"); }
          else if (d <= step) {
            a.x = tx; a.y = ty; a.tilt = 0; a.t = 0;
            if (a.state === "walk") { a.state = "sniff"; antSetPose(a, "sniff"); }
            else { a.state = "in"; antSetPose(a, null); }
          } else {
            a.x += dx / d * step; a.y += dy / d * step;
            a.tilt += (clamp(dy / d, -.8, .8) * 18 * a.face - a.tilt) * Math.min(1, dt * 8);
          }
        }
      } else if (a.state === "sniff" && a.t >= ANT_SNIFF) {
        a.state = "bite"; a.t = 0; antSetPose(a, "bite"); sfx.antMunch();
      } else if (a.state === "bite" && a.t >= .3) {
        f.bitten = true;
        a.state = "chew"; a.t = 0; antSetPose(a, null);
      } else if (a.state === "chew" && a.t >= ANT_CHEW) {
        f.carried = true;
        a.state = "home"; a.t = 0; antSetPose(a, "walk");
        a.face = antHill.x < a.x ? -1 : 1;
      } else if (a.state === "in") {
        a.s = Math.max(0, 1 - a.t / .3); f.s = a.s;
        if (a.s <= 0) { antDelivered(a); continue; }
      }
      if (f.carried) { f.x = a.x - a.face * A * .1; f.y = a.y - A * .43; }
    }
    antCollide();
    if (!running || paused) return;
    if (foods.length || ants.length) { antIdle = 0; antPeeked = false; return; }
    if (antPeekEls) return;
    antIdle += dt;
    if (antIdle >= ANT_HUNGRY_AFTER) { antIdle = 2; antPeeked = false; antShowPeek(true); }
    else if (antIdle >= ANT_PEEK_AFTER && !antPeeked) { antPeeked = true; antShowPeek(false); }
  }
  function antCollide() {
    const onGround = ants.filter(a => a.state !== "out" && a.state !== "in");
    const moves = a => a.state === "walk" || a.state === "home" || a.state === "wait";
    for (let i = 0; i < onGround.length; i++) for (let j = i + 1; j < onGround.length; j++) {
      const a = onGround[i], b = onGround[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || .001, min = A * .7;
      if (d >= min || a.ghost > 0 || b.ghost > 0) continue;
      const wa = moves(a) ? (moves(b) ? .5 : 1) : 0, wb = moves(b) ? (moves(a) ? .5 : 1) : 0, push = min - d;
      const nx = dx / d, ny = dy / d, side = a.y <= b.y ? 1 : -1, slip = push * .9;
      a.x -= nx * push * wa - ny * slip * wa * side; a.y -= ny * push * wa + nx * slip * wa * side;
      b.x += nx * push * wb - ny * slip * wb * side; b.y += ny * push * wb + nx * slip * wb * side;
      [a, b].forEach(c => { c.x = clamp(c.x, A * .4, W - A * .4); c.y = clamp(c.y, antG.top - A * .3, antG.bot); if (c.food.carried) { c.food.x = c.x - c.face * A * .1; c.food.y = c.y - A * .43; } });
    }
  }
  function antDelivered(a) {
    ants = ants.filter(x => x !== a); foods = foods.filter(x => x !== a.food);
    if (gameOver) return;
    sfx.antHome(); burst(antHill.x, antHill.y, S * .5);
    if (antHillEl) { const i = antHillEl.firstElementChild; i.classList.remove("pop"); void i.offsetWidth; i.classList.add("pop"); }
    caughtInLevel++;
    renderStars(true);
    if (caughtInLevel < LV().goal) return;
    if (level >= ANT_LEVELS.length - 1) { finish(); return; }
    level++; caughtInLevel = 0;
    levelUp(); antMeasure();
  }
  function antShowPeek(hungry) {
    const box = document.createElement("div");
    box.className = "antpeek" + (hungry ? " hungry" : "");
    box.innerHTML = `<div class="peekhead">${PEEK_SVG}</div>`;
    const bubble = hungry ? document.createElement("div") : null;
    if (bubble) { bubble.className = "antbubble"; bubble.innerHTML = `<i class="d2"></i><i class="d1"></i><div class="thought">${FOODS[LV().foods - 1]}</div>`; }
    layer.append(box, ...(bubble ? [bubble] : []));
    antPeekEls = { box, bubble };
    antPlacePeek();
    if (hungry) sfx.antRumble(); else sfx.antPeek();
    box.firstElementChild.addEventListener("animationend", e => { if (e.target === box.firstElementChild && e.animationName !== "antWiggle") antHidePeek(); });
  }
  function antPlacePeek() {
    const { box, bubble } = antPeekEls, w = A * 1.1, h = A * .9;
    box.style.width = w + "px"; box.style.height = h + "px";
    box.style.transform = `translate(${antHill.x - w / 2}px,${antHill.y - h}px)`; box.style.zIndex = Math.round(antHill.y);
    const side = antHill.x < W / 2 ? 1 : -1;
    if (bubble) {
      bubble.style.transform = `translate(${antHill.x + side * A * .3 - (side < 0 ? A * .8 : 0)}px,${antHill.y - A * 1.5}px)`;
      bubble.classList.toggle("left", side < 0);
    }
  }
  function antHidePeek() {
    if (!antPeekEls) return;
    antPeekEls.box.remove(); if (antPeekEls.bubble) antPeekEls.bubble.remove();
    antPeekEls = null;
  }

  // ================= Net =================
  // hx, hy: hoop centre in the 200-unit art; r: hoop radius, so the visible hoop matches NET_R
  const NET_ART = {
    fly: { svg: NET_SVG, hx: 80, hy: 80, r: 64 },
    butterfly: { svg: BFNET_SVG, hx: 70, hy: 60, r: 48 },
    hand: { svg: HAND_SVG, hx: 100, hy: 64, k: () => A * .5 / 46 },   // hotspot in the middle of the hand, where the food starts
  };
  const netArt = () => NET_ART[MODE === "butterflies" ? "butterfly" : MODE === "ants" ? "hand" : "fly"];
  const netK = a => a.k ? a.k() : NET_R / a.r;
  function sizeNet(el) {
    const k = netK(netArt());
    el.style.width = el.style.height = (200 * k) + "px";
  }
  // Moved with the translate property, which the compositor applies without a layout; their swing animations use transform
  function placeNet(el, x, y) {
    const a = netArt(), k = netK(a);
    el.style.translate = `${x - a.hx * k}px ${y - a.hy * k}px`;
  }
  const cursorNet = document.createElement("div");
  cursorNet.className = "net cursor-net away";
  fx.appendChild(cursorNet);
  function syncNetArt() {
    const a = netArt();
    cursorNet.innerHTML = a.svg;
    cursorNet.classList.toggle("hand", MODE === "ants");
    cursorNet.style.transformOrigin = `${a.hx / 2}% ${a.hy / 2}%`;
    sizeNet(cursorNet); netToMouse();
  }

  // Net follows the mouse; the system cursor hides only while it's shown
  let mouseIn = false, overUI = false, swooping = false, lastMouse = null, usingMouse = false;
  function syncCursor() {
    const aim = running && !paused && usingMouse && mouseIn && !overUI && (MODE !== "ants" || HAND_OK);
    glass.classList.toggle("aiming", aim);
    cursorNet.classList.toggle("away", !aim || swooping);
  }
  function netToMouse() {
    if (!lastMouse) return;
    const r = glass.getBoundingClientRect();
    placeNet(cursorNet, lastMouse.x - r.left, lastMouse.y - r.top);
  }

  function swoop(x, y, hit, quick) {
    const el = document.createElement("div"), a = netArt();
    el.className = "net";
    el.innerHTML = a.svg;
    el.style.transformOrigin = `${a.hx / 2}% ${a.hy / 2}%`;
    sizeNet(el); placeNet(el, x, y);
    fx.appendChild(el);
    el.animate([
      { transform: "translate(35%,-45%) rotate(-38deg) scale(1.2)", opacity: 0 },
      { transform: "translate(0,0) rotate(4deg) scale(1)", opacity: 1, offset: .7 },
      { transform: "translate(0,0) rotate(0) scale(.95)", opacity: 1 },
    ], { duration: quick ? 110 : 190, easing: "cubic-bezier(.2,.9,.3,1)", fill: "forwards" });
    setTimeout(() => {
      const out = el.animate([
        { transform: "translate(0,0) rotate(0) scale(.95)", opacity: 1 },
        { transform: "translate(-12%,-35%) rotate(14deg) scale(1.12)", opacity: 0 },
      ], { duration: 260, easing: "cubic-bezier(.5,0,.8,.6)", fill: "forwards" });
      out.onfinish = () => el.remove();
    }, quick ? 150 : 190 + (hit ? 470 : 120));
  }

  function handDrop({ x, y }, fromCursor) {
    const el = document.createElement("div"), a = NET_ART.hand, k = a.k();
    el.className = "net hand"; el.innerHTML = HAND_SVG;
    el.style.width = el.style.height = 200 * k + "px";
    el.style.left = x - a.hx * k + "px"; el.style.top = y - a.hy * k + "px";
    fx.appendChild(el);
    setTimeout(() => el.classList.add("open"), 200);
    el.animate([
      fromCursor ? { transform: "none", opacity: 1 } : { transform: "translateY(-25%)", opacity: 0, easing: "ease-out" },
      { transform: "none", opacity: 1, offset: .2 },
      { transform: "none", opacity: 1, offset: .3, easing: "ease-in-out" },
      { transform: "translateY(3%)", opacity: 1, offset: .4, easing: "ease-in-out" },
      { transform: "none", opacity: 1, offset: .55, easing: "ease-in" },
      { transform: "translateY(-30%)", opacity: 1, offset: .85 },
      { transform: "translateY(-38%)", opacity: 0 },
    ], { duration: 650, fill: "forwards" }).onfinish = () => el.remove();
  }

  // Challenge with a mouse: the cursor net swats in place with no delay
  function swat() {
    cursorNet.animate([
      { transform: "rotate(-18deg) scale(1.1)" },
      { transform: "rotate(5deg) scale(.9)", offset: .45 },
      { transform: "rotate(0) scale(1)" },
    ], { duration: 150, easing: "cubic-bezier(.2,.9,.3,1)" });
  }

  // ================= Catching =================
  const SPARK = ["#FFC93C", "#FF6B8A", "#FFFFFF", "#7CD4FF", "#9BE36D"];
  function burst(x, y, Z = S) {
    const ring = document.createElement("span");
    ring.className = "ring"; ring.style.left = x + "px"; ring.style.top = y + "px";
    ring.style.setProperty("--fly", Z + "px");
    fx.appendChild(ring); setTimeout(() => ring.remove(), 560);
    for (let i = 0; i < 8; i++) {
      const s = document.createElement("span");
      const a = (i / 8) * Math.PI * 2 + rand(-.2, .2), d = Z * rand(.75, 1.15);
      s.className = "spark";
      s.style.left = x + "px"; s.style.top = y + "px";
      s.style.setProperty("--fly", Z + "px");
      s.style.setProperty("--c", SPARK[i % SPARK.length]);
      s.style.setProperty("--dx", Math.cos(a) * d + "px");
      s.style.setProperty("--dy", Math.sin(a) * d + "px");
      fx.appendChild(s); setTimeout(() => s.remove(), 740);
    }
  }

  function renderTime() {
    const s = Math.max(0, Math.ceil(timeLeft));
    if (s === shownTime) return;
    shownTime = s;
    $("cTimeV").textContent = num(s);
    $("cTime").classList.toggle("low", running && s <= 5);
  }
  function renderStats() {
    $("cScoreV").textContent = num(score);
    const m = Math.min(3, 1 + .1 * streak);
    $("cStreakV").textContent = "×" + ar(m.toFixed(1));
    $("cStreak").classList.toggle("hot", streak >= 5);
    shownTime = -1; renderTime();
  }
  function floatPoints(x, y, pts, below) {
    const el = document.createElement("div");
    el.className = "pts";
    el.textContent = "+" + num(pts);
    el.style.left = clamp(x, 60, W - 60) + "px";
    el.style.top  = clamp(below ? y + NET_R + 34 : y - NET_R - 14, TOP_PAD + 30, H - 40) + "px";
    fx.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  }


  function combo(x, y, n) {
    const el = document.createElement("div");
    el.className = "combo";
    el.innerHTML = `<b>${ar(n)}×</b><span>${T("combo")[Math.min(n, 5)]}</span>`;
    el.style.left = clamp(x, 130, W - 130) + "px";
    el.style.top  = clamp(y - S * 1.1, TOP_PAD + 50, H - 70) + "px";
    fx.appendChild(el);
    setTimeout(() => el.remove(), 1500);
    // Bigger star ring around the hit
    for (let i = 0; i < 14; i++) {
      const s = document.createElement("span");
      const a = (i / 14) * Math.PI * 2, d = S * rand(1.5, 2.1);
      s.className = "spark big";
      s.style.left = x + "px"; s.style.top = y + "px";
      s.style.setProperty("--c", SPARK[i % SPARK.length]);
      s.style.setProperty("--dx", Math.cos(a) * d + "px");
      s.style.setProperty("--dy", Math.sin(a) * d + "px");
      fx.appendChild(s); setTimeout(() => s.remove(), 900);
    }
    sfx.combo(n);
  }

  function catchFly(f) {
    f.state = "caught";
    f.flying = false; f.caughtAt = f.t; f.top = true;
    burst(f.x, f.y, S * f.sc);
    const g = gen;
    setTimeout(() => {
      if (g !== gen) return;
      f.state = "slide"; f.vy = 18; f.slideT = 0;
      f.dizzyAt = f.t;
      sfx.squeak();
    }, 480);
  }

  function registerCatch() {
    if (gameOver) return;
    caughtInLevel++;
    renderStars(true);
    if (caughtInLevel >= LV().goal) {
      if (level < LEVELS.length - 1) {
        level++; caughtInLevel = 0;
        levelUp();
      } else {
        finish(); return;
      }
    }
    fill();
  }

  function fill() {
    if (gameOver || MODE === "butterflies" || MODE === "ants") return;
    let want = LV().flies;
    if (MODE !== "bees" && level === LEVELS.length - 1) want = Math.min(want, LV().goal - caughtInLevel);
    const need = want - aliveCount();
    for (let i = 0; i < need; i++) {
      pending++;
      const g = gen;
      setTimeout(function go() {
        if (g !== gen) return;
        if (paused) { resumeQueue.push(go); return; }   // wait for resume
        pending--;
        if (gameOver) return;
        const kind = chooseKind();
        if (kind) { lastKind = kind; spawnFly(kind); }
      }, 550 + i * 450 + Math.random() * 300);
    }
  }

  // ================= UI =================
  function renderStars(pop) {
    const goal = LV().goal;
    starsEl.classList.toggle("many", goal > 10);
    if (!pop || starsEl.children.length !== goal) {
      starsEl.innerHTML = "";
      for (let i = 0; i < goal; i++) {
        const s = document.createElement("span");
        s.className = "star"; s.innerHTML = STAR_SVG;
        starsEl.appendChild(s);
      }
    }
    [...starsEl.children].forEach((s, i) => {
      if (i < caughtInLevel && !s.classList.contains("on")) {
        s.classList.add("on");
        if (pop) s.classList.add("pop");
      }
    });
  }

  function levelUp() {
    lvNum.textContent = ar(level + 1);
    if (isCh()) { timeLeft += ALLOT[level]; shownTime = -1; renderTime(); }
    const minis = Array.from({ length: LV().flies }, (_, i) =>
      `<span class="mini">${MODE === "butterflies" ? butterflySVG((bfSet ? bfSet.all : BF_COLORS)[i % LV().colors]) : MODE === "ants" ? ANT_SVG : FLY_SVG}</span>`).join("");
    banner.innerHTML = `<div class="inner">
        <div class="b-title">${T("cheers")[level] || T("cheers")[1]}</div>
        <div class="b-flies">${minis}</div>
        <div class="b-sub">${T("levelN", { n: ar(level + 1) })}</div>
        ${isCh() ? `<div class="b-time">${T("plusSec", { n: ar(ALLOT[level]) })}</div>` : ""}
      </div>`;
    banner.classList.remove("show");
    void banner.offsetWidth;
    banner.classList.add("show");
    renderStars(false);
    sfx.levelUp();
  }

  function finish(done = true) {
    if (gameOver) return;
    gameOver = true; running = false;
    document.body.classList.remove("playing");
    flies.forEach(f => { f.sip = false; wiltFlower(f.flower); f.flower = null; });
    bfFlyAway();
    syncCursor();
    for (const f of flies) {
      if (!isAlive(f)) continue;
      const dl = f.x, dr = W - f.x, dt = f.y, db = H - f.y, m = Math.min(dl, dr, dt, db);
      f.heading = m === dl ? Math.PI : m === dr ? 0 : m === dt ? -Math.PI / 2 : Math.PI / 2;
      f.heading += rand(-.3, .3);
      f.state = "exit"; f.flying = true;
    }
    if (isCh()) {
      const bonus = done ? Math.round(timeLeft) * TIME_PTS : 0;
      score += bonus;
      renderStats();
      done ? sfx.win() : sfx.timeUp();
      setTimeout(() => showChEnd(done, bonus), 1000);
    } else {
      sfx.win();
      setTimeout(showEnd, 1000);
    }
  }

  function confetti(box) {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cols = ["#FFC93C", "#FF6B8A", "#45C46B", "#7CD4FF", "#B98CF0", "#FF7A3D"];
    for (let i = 0; i < 70; i++) {
      const c = document.createElement("span");
      c.className = "confetti";
      c.style.left = rand(0, 100) + "%";
      c.style.setProperty("--c", cols[i % cols.length]);
      c.style.setProperty("--x", rand(-80, 80) + "px");
      c.style.setProperty("--r", rand(-720, 720) + "deg");
      c.style.setProperty("--d", rand(2.2, 4.2) + "s");
      c.style.animationDelay = rand(0, .8) + "s";
      box.appendChild(c);
      setTimeout(() => c.remove(), 5200);
    }
  }

  function showChEnd(done, bonus) {
    let best = 0;
    try { best = +localStorage.getItem("flyCatch.best") || 0; } catch (e) {}
    const isNew = score > best;
    if (isNew) { try { localStorage.setItem("flyCatch.best", String(score)); } catch (e) {} }
    $("chTitle").textContent = done ? T("chDone") : T("timeUp");
    $("chScore").textContent = num(score);
    const bestEl = $("chBest");
    bestEl.textContent = isNew ? (best ? T("newRecord") : T("firstRecord")) : T("best", { n: num(best) });
    bestEl.classList.toggle("new", isNew);
    $("chAcc").textContent = T("pct", { n: num(swings ? goodSwings / swings * 100 : 0) });
    $("chStreak").textContent = num(bestStreak);
    $("chLevel").textContent = num(level + 1);
    $("chBonus").textContent = num(bonus);
    fitCards(); $("chEnd").classList.add("show");
    if (isNew) { sfx.newBest(); confetti($("chEnd")); }
  }

  function showEnd() {
    const msg = endScreen.querySelector("[data-i18n='allCaught'], [data-i18n='allBf'], [data-i18n='allAnts']");
    msg.dataset.i18n = MODE === "butterflies" ? "allBf" : MODE === "ants" ? "allAnts" : "allCaught"; msg.textContent = T(msg.dataset.i18n);
    fitCards(); endScreen.classList.add("show");
    confetti(endScreen);
    const ab = $("againBtn");
    ab.classList.remove("auto"); void ab.offsetWidth; ab.classList.add("auto");
    clearTimeout(endTimer);
    endTimer = setTimeout(() => startGame(MODE), 10000);
  }

  function startGame(mode) {
    if (typeof mode === "string") MODE = mode;
    document.body.classList.toggle("challenge", isCh());
    document.body.dataset.mode = MODE;
    syncNetArt();
    sfx.init();
    clearTimeout(endTimer);
    gen++;
    flies.forEach(f => { if (f.voice) f.voice.stop(); });
    flies = []; pending = 0; beeFlowers = [];
    flora.innerHTML = ""; bfClear(); antClear();
    level = 0; caughtInLevel = 0;
    gameOver = false; running = true; paused = false; resumeQueue = [];
    glass.classList.remove("paused"); $("pauseScreen").classList.remove("show");
    document.body.classList.add("playing");
    lvNum.textContent = ar(1);
    miss.reset();
    renderStars(false);
    startScreen.classList.remove("show");
    endScreen.classList.remove("show");
    $("chEnd").classList.remove("show");
    $("againBtn").classList.remove("auto");
    clock = 0; timeLeft = ALLOT[0]; lowTick = -1; lastKind = "fly";
    score = 0; streak = 0; bestStreak = 0; swings = 0; goodSwings = 0;
    renderStats();
    measure();
    overUI = false; netToMouse(); syncCursor();   // show the net at the mouse right away
    if (MODE === "butterflies") bfNewPart(); else if (MODE === "ants") antStart(); else fill();
  }

  // ================= Input =================
  glass.addEventListener("pointerdown", e => {
    usingMouse = e.pointerType === "mouse";
    sfx.init();
    if (!running) return;
    if (e.target.closest("button, .overlay.show")) return;
    const r = glass.getBoundingClientRect();
    const px = e.clientX - r.left, py = e.clientY - r.top;
    if (MODE === "ants") {
      const at = antTap(px, py);
      if (at) {
        if (HAND_OK) handDrop(at, e.pointerType === "mouse");
        if (e.pointerType === "mouse") {
          swooping = true; syncCursor();
          setTimeout(() => { swooping = false; netToMouse(); syncCursor(); }, 620);
        }
      }
      return;
    }
    if (MODE === "butterflies") {
      const hit = bfTap(px, py);
      if (!hit) swoop(px, py, false, false);
      if (e.pointerType === "mouse") {
        swooping = true; syncCursor();
        setTimeout(() => { swooping = false; netToMouse(); syncCursor(); }, hit ? 1300 : 420);
      }
      sfx.swoosh();
      return;
    }
    const k = isCh() ? CH.reach : .35;
    const inReach = f => Math.hypot(f.x - px, f.y - py) <= NET_R + S * f.sc * k;
    const hits = flies.filter(f => !isBee(f) && (isAlive(f) || leaving(f)) && inReach(f));
    const beeHits = flies.filter(f => isBee(f) && (isAlive(f) || (leaving(f) && !f.dodged)) && inReach(f));

    if (isCh() && e.pointerType === "mouse") {
      swat();   // instant, as fast as touch
    } else {
      swoop(px, py, hits.length > 0, isCh());   // quick in challenge, lingers otherwise
      if (e.pointerType === "mouse") {
        swooping = true; syncCursor();
        setTimeout(() => { swooping = false; netToMouse(); syncCursor(); }, hits.length ? 900 : 420);
      }
    }
    sfx.swoosh();
    if (isCh()) {
      swings++;
      if (hits.length) {
        // Speed bonus: ×2 within 1s of appearing, down to ×1 at 4s
        const base = hits.reduce((a, f) =>
          a + 100 * sizePts(f.sc) * (1 + clamp((4 - (clock - (f.born ?? clock))) / 3, 0, 1)), 0);
        const pts = Math.round(base * MULTI[Math.min(5, hits.length)] * Math.min(3, 1 + .1 * streak) / 10) * 10;
        score += pts; streak++; goodSwings++;
        bestStreak = Math.max(bestStreak, streak);
        floatPoints(px, py, pts, hits.length >= 2);
      } else {
        streak = 0;
      }
      renderStats();
    }
    if (hits.length) {
      sfx.caught();
      if (hits.length >= 2) combo(px, py, hits.length);
      hits.forEach(f => { catchFly(f); registerCatch(); });
    }
    // "No!" is for bees only; an empty swing just plays the net sound
    if (beeHits.length) {
      beeAlert(beeHits[0].x, beeHits[0].y);
      beeHits.forEach(f => dodge(f, px, py));
      miss.sayNow();
    }
  });

  glass.addEventListener("pointermove", e => {
    usingMouse = e.pointerType === "mouse";
    if (!usingMouse) { syncCursor(); return; }
    lastMouse = { x: e.clientX, y: e.clientY };
    mouseIn = true;
    overUI = !!e.target.closest("button, .overlay.show");
    netToMouse();
    syncCursor();
  });
  glass.addEventListener("pointerleave", () => { mouseIn = false; syncCursor(); });
  glass.addEventListener("contextmenu", e => e.preventDefault());

  // Grown-up controls need a press-and-hold so toddlers can't set them off; a quick tap nudges and shows a hint
  const HOLD_MS = 700;
  let hintT = null;
  function showHint(btn) {
    const hint = $("holdHint"), card = btn.closest(".card");
    hint.classList.add("show");
    const w = hint.offsetWidth, h = hint.offsetHeight;
    const below = btn.offsetTop + btn.offsetHeight + 8 + h <= card.scrollHeight - 4;   // above only when there's no room below
    hint.style.left = clamp(btn.offsetLeft + btn.offsetWidth / 2 - w / 2, 8, card.clientWidth - w - 8) + "px";
    hint.style.top = (below ? btn.offsetTop + btn.offsetHeight + 8 : btn.offsetTop - h - 8) + "px";
    clearTimeout(hintT); hintT = setTimeout(() => hint.classList.remove("show"), 2200);
  }
  function holdButton(btn, action) {
    let timer = null, ready = false;
    btn.style.setProperty("--hold", HOLD_MS + "ms");
    const reset = () => { clearTimeout(timer); ready = false; btn.classList.remove("holding", "ready"); };
    btn.addEventListener("pointerdown", e => {
      if (e.button > 0) return;
      reset(); btn.classList.add("holding");
      timer = setTimeout(() => { ready = true; btn.classList.add("ready"); }, HOLD_MS);
    });
    btn.addEventListener("pointerup", () => {
      const go = ready;
      reset();
      if (go) { sfx.init(); sfx.uiOn(); action(); return; }
      btn.classList.remove("nudge"); void btn.offsetWidth; btn.classList.add("nudge");
      btn.addEventListener("animationend", () => btn.classList.remove("nudge"), { once: true });
      showHint(btn);
    });
    btn.addEventListener("pointerleave", reset);
    btn.addEventListener("pointercancel", reset);
    btn.addEventListener("click", e => { if (e.detail === 0) action(); });   // keyboard activates right away
  }

  $("startBtn").addEventListener("click", () => startGame("kids"));
  holdButton($("challengeBtn"), () => startGame("challenge"));
  // Tapping the menu fly catches it and starts the kids game, the most natural thing a toddler will try
  $("heroFly").addEventListener("click", () => {
    const hero = $("heroFly");
    if (hero.classList.contains("tapped")) return;
    sfx.init(); sfx.caught();
    hero.classList.add("tapped");
    setTimeout(() => { hero.classList.remove("tapped"); startGame("kids"); }, 420);
  });
  $("againBtn").addEventListener("click", () => startGame(MODE));
  $("beesBtn").addEventListener("click", () => startGame("bees"));
  $("bfBtn").addEventListener("click", () => { bfPick = false; startGame("butterflies"); });
  $("bfPickBtn").addEventListener("click", () => { bfPick = true; startGame("butterflies"); });
  $("antBtn").addEventListener("click", () => startGame("ants"));
  $("chAgain").addEventListener("click", () => startGame("challenge"));
  // ================= What's new =================
  // One picture per version that changed something a child can see, newest first, so a 3-year-old can follow it.
  // Each art item is [markup, centre x %, centre y %, width % of the stage, animation]; play starts that mode.
  // "2.0.0-beta.3" comes before "2.0.0"
  const parts = v => { const [core, pre] = v.split("-"), n = core.split(".").map(Number);
    return [n[0] || 0, n[1] || 0, n[2] || 0, pre ? Number(pre.split(".")[1]) || 0 : Infinity]; };
  const newer = (a, b) => { const x = parts(a), y = parts(b);
    for (let i = 0; i < 4; i++) if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) > (y[i] || 0);
    return false; };
  const art = {
    ant: `<div class="ant walk"><div class="flip">${ANT_SVG}</div></div>`,
    fly: `<div class="flying">${FLY_SVG}</div>`,
    bee: `<div class="flying">${BEE_SVG}</div>`,
    bf: i => butterflySVG(BF_COLORS[i]),
    gflower: i => gardenFlowerSVG(BF_COLORS[i]),
    sun: `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" fill="#FFE27A" opacity=".55"/><circle cx="50" cy="50" r="34" fill="#FFD54A"/></svg>`,
    cloud: `<svg viewBox="0 0 120 60" aria-hidden="true"><path d="M22 54C8 54 4 38 16 33C14 18 34 12 42 22C48 6 76 6 80 24C96 18 112 30 104 44C114 52 104 56 98 54Z" fill="#fff"/></svg>`,
    pause: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#fff"/><rect x="7.6" y="6.5" width="3" height="11" rx="1.2" fill="#5A4636"/><rect x="13.4" y="6.5" width="3" height="11" rx="1.2" fill="#5A4636"/></svg>`,
    yes: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#4CBB5E"/><path d="M6.5 12.5l3.6 3.6 7.4-8" stroke="#fff" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    no: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#F0525E"/><path d="M8 8l8 8M16 8l-8 8" stroke="#fff" stroke-width="2.8" stroke-linecap="round"/></svg>`,
    trophy: `<div class="ntrophy">${TROPHY_SVG}</div>`,
    star: `<div class="nspark">${STAR_SVG}</div>`,
    bubble: t => `<span class="nbub">${t}</span>`,
    btn: (ico, cls) => `<span class="nbtn ${cls}">${ico}</span>`,
  };
  const NEWS = [
    { v: "1.18.0", k: "news1180", bg: "soil", play: "ants", snd: () => { sfx.antMunch(); setTimeout(sfx.antHome, 380); },
      art: [[HILL_SVG, 20, 60, 36], [art.ant, 46, 54, 22, "walk"], [FOODS[0], 68, 60, 11, "bob"]] },
    { v: "1.17.0", k: "news1170", bg: "garden", play: "bfPick", snd: () => sfx.bfCatch(),
      art: [[art.gflower(0), 36, 62, 22], [art.bf(0), 36, 24, 17, "hover"], [art.bf(1), 78, 34, 14, "away"]] },
    { v: "1.16.0", k: "news1160", bg: "garden", snd: () => sfx.bfLand(),
      art: [[art.gflower(2), 30, 62, 20], [art.gflower(3), 70, 62, 20], [art.bf(2), 30, 22, 14, "hover"], [art.bf(3), 70, 24, 14, "hover2"]] },
    { v: "1.15.0", k: "news1150", bg: "garden", play: "butterflies", snd: () => sfx.bfBloom(),
      art: [[art.gflower(1), 50, 62, 24], [art.bf(1), 50, 26, 17, "land"]] },
    { v: "1.14.5", k: "news1145", bg: "meadow", snd: () => sfx.uiOn(),
      art: [[art.btn(FLY_SVG, "green"), 40, 46, 50, "press"], [art.btn(BEE_SVG, "yellow round"), 82, 46, 18, "press2"]] },
    { v: "1.13.0", k: "news1130", bg: "meadow", snd: () => sfx.uiOff(),
      art: [[art.pause, 40, 46, 22, "pulse"], [FLY_SVG, 72, 54, 14]] },
    { v: "1.12.0", k: "news1120", bg: "sky", snd: () => sfx.aww(),
      art: [[art.sun, 50, 44, 26], [art.cloud, 50, 46, 34, "cloud"], ["", 50, 50, 100, "shade"]] },
    { v: "1.11.0", k: "news1110", bg: "meadow", snd: () => sfx.uiOn(),
      art: [[art.bubble("ع"), 34, 42, 20, "bob"], [art.bubble("A"), 66, 42, 20, "bob2"]] },
    { v: "1.9.0", k: "news1090", bg: "meadow", snd: () => sfx.bloom(),
      art: [[flowerSVG(PETALS[0]), 40, 66, 14], [flowerSVG(PETALS[1]), 70, 70, 11], [art.bee, 40, 30, 13, "visit"]] },
    { v: "1.6.0", k: "news1060", bg: "meadow", play: "bees", snd: () => sfx.squeak(),
      art: [[art.fly, 32, 32, 15, "buzz"], [art.yes, 32, 62, 9], [art.bee, 66, 32, 15, "buzz2"], [art.no, 66, 62, 9]] },
    { v: "1.4.0", k: "news1040", bg: "meadow", snd: () => sfx.newBest(),
      art: [[art.trophy, 50, 46, 22, "pulse"], [art.star, 26, 34, 9, "twinkle"], [art.star, 74, 30, 7, "twinkle2"]] },
    { v: "1.3.0", k: "news1030", bg: "meadow", snd: () => sfx.combo(3),
      art: [[NET_SVG, 50, 52, 34], [FLY_SVG, 43, 40, 9, "buzz"], [FLY_SVG, 54, 44, 9, "buzz2"], [art.star, 76, 30, 7, "twinkle"]] },
    { v: "1.0.0", k: "news1000", bg: "meadow", play: "kids", snd: () => sfx.caught(),
      art: [[art.fly, 38, 44, 15, "buzz"], [NET_SVG, 66, 50, 30, "swoop"]] },
  ];
  // true: versions not seen yet (or the newest) big on top, older ones folded under one button; false: every version in one grid
  const NEWS_HERO = true;
  const newsScreen = $("newsScreen"), newsList = $("newsList"), newsBtn = $("newsBtn");
  let newsSeen = null;
  try { newsSeen = localStorage.getItem("flyCatch.seen"); } catch (e) {}
  const freshNews = n => newsSeen ? newer(n.v, newsSeen) : n === NEWS[0];
  newsBtn.classList.toggle("fresh", !newsSeen || newer(NEWS[0].v, newsSeen));
  const STACK = [[FLY_SVG, "#BFE6FA", "-8deg"], [butterflySVG(BF_COLORS[1]), "#E9D4FA", "4deg"], [ANT_SVG, "#E8C9A0", "-3deg"]];
  function renderNews() {
    const fresh = NEWS.filter(freshNews), hero = NEWS_HERO ? (fresh.length ? fresh : NEWS.slice(0, 1)) : [], old = NEWS.filter(n => !hero.includes(n));
    newsList.innerHTML = (hero.length ? `<div class="nhero">${hero.map(newsTile).join("")}</div>
      <button class="narch" type="button" aria-expanded="false" aria-controls="newsOld">
        <span class="nstack" aria-hidden="true">${STACK.map(([s, c, r]) => `<i style="--c:${c};--r:${r}">${s}</i>`).join("")}</span>
        <span>${T("newsOlder")} <small dir="ltr">${old.length}</small></span><span class="nchev" aria-hidden="true"></span>
      </button>` : "") + `<div class="nold" id="newsOld"${hero.length ? " hidden" : ""}>${old.map(newsTile).join("")}</div>`;
  }
  function newsTile(n) {
    const i = NEWS.indexOf(n);
    return `<article class="nitem${freshNews(n) ? " fresh" : ""}">
      <div class="nstage ${n.bg}" role="button" tabindex="0" data-i="${i}" aria-label="${n.v} ${T(n.k)}">
        ${n.art.map(([h, x, y, w, a]) => `<i class="ni${a ? " a-" + a : ""}" style="left:${x}%;top:${y}%;width:${w}%">${h}</i>`).join("")}
        <span class="nver">${freshNews(n) ? STAR_SVG : ""}<b dir="ltr">${n.v.replace(/\.0$/, "")}</b></span>
        <div class="nbar"><p class="ncap">${T(n.k)}</p>${n.play ? `<button class="nplay" type="button" data-play="${n.play}" aria-label="${T("play")}"></button>` : ""}</div>
      </div>
    </article>`;
  }
  function openNews() {
    renderNews();
    startScreen.classList.remove("show"); newsScreen.classList.add("show");
    newsSeen = NEWS[0].v; newsBtn.classList.remove("fresh");
    try { localStorage.setItem("flyCatch.seen", newsSeen); } catch (e) {}
    measure();
  }
  function closeNews() { newsScreen.classList.remove("show"); startScreen.classList.add("show"); measure(); }
  holdButton(newsBtn, openNews);
  $("newsBack").addEventListener("click", closeNews);
  function newsTap(stage) {
    sfx.init(); NEWS[stage.dataset.i].snd();
    stage.classList.remove("go"); void stage.offsetWidth; stage.classList.add("go");
  }
  newsList.addEventListener("click", e => {
    const arch = e.target.closest(".narch");
    if (arch) {
      const open = arch.getAttribute("aria-expanded") !== "true", old = $("newsOld"), card = arch.closest(".card");
      const glide = top => card.scrollTo({ top, behavior: calm.matches ? "auto" : "smooth" });   // only the card; scrollIntoView would also shift the clipped game screen
      const bar = card.nextElementSibling && card.nextElementSibling.classList.contains("kscroll") ? card.nextElementSibling : null;
      arch.setAttribute("aria-expanded", String(open));
      sfx.init(); if (open) sfx.uiOn(); else sfx.uiOff();
      (old.folding || []).forEach(a => a.cancel()); old.folding = null; card.style.alignContent = "";
      if (open) {
        old.hidden = false; measure();
        glide(card.scrollTop + arch.getBoundingClientRect().top - card.getBoundingClientRect().top - 12);
        return;
      }
      if (calm.matches) { old.hidden = true; card.scrollTop = 0; measure(); return; }
      // Closing: the pictures fade first (with the scrollbar, unless the smaller card still needs it), then the card shrinks to its new size
      old.hidden = true; const stillScrolls = overflows(card); old.hidden = false;
      if (stillScrolls) glide(0);   // a scrollbar that's fading away stays put
      const fade = { duration: 260, easing: "ease-in", fill: "forwards" };
      const cards = old.animate([{ opacity: 1, translate: "0 0", scale: 1 }, { opacity: 0, translate: "0 26px", scale: .86 }], fade);
      old.folding = [cards, ...(bar && !stillScrolls ? [bar.animate([{ opacity: 1 }, { opacity: 0 }], fade)] : [])];
      cards.onfinish = () => {
        const from = card.offsetHeight;
        old.hidden = true; card.scrollTop = 0; measure();
        const to = card.offsetHeight;
        cards.cancel();
        card.style.alignContent = "start";
        const shrink = card.animate([{ height: from + "px" }, { height: to + "px" }], { duration: 340, easing: "cubic-bezier(.3,0,.2,1)" });
        old.folding.push(shrink);
        shrink.onfinish = () => { (old.folding || []).forEach(a => a.cancel()); old.folding = null; card.style.alignContent = ""; };
      };
      return;
    }
    const play = e.target.closest(".nplay");
    if (play) {
      newsScreen.classList.remove("show");
      const m = play.dataset.play;
      if (m === "bfPick" || m === "butterflies") bfPick = m === "bfPick";
      startGame(m === "bfPick" ? "butterflies" : m);
      return;
    }
    const stage = e.target.closest(".nstage");
    if (stage) newsTap(stage);
  });
  newsList.addEventListener("keydown", e => {
    const stage = e.target.closest(".nstage");
    if (stage && e.target === stage && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); newsTap(stage); }
  });

  // ================= Install as app =================
  const installBtn = $("installBtn"), iosHint = $("iosHint");
  const installed = () => matchMedia("(display-mode: standalone)").matches ||
    matchMedia("(display-mode: fullscreen)").matches || navigator.standalone === true;
  let installEvt = null;
  addEventListener("beforeinstallprompt", e => {   // Android and desktop Chrome/Edge
    e.preventDefault(); installEvt = e;
    if (!installed() && $("updateBtn").hidden) { installBtn.hidden = false; fitCards(); }   // an update waiting comes first
  });
  holdButton(installBtn, async () => {
    if (!installEvt) return;
    installEvt.prompt();
    try { await installEvt.userChoice; } catch (e) {}
    installEvt = null; installBtn.hidden = true; fitCards();
  });
  addEventListener("appinstalled", () => { installBtn.hidden = true; iosHint.hidden = true; fitCards(); });
  // iOS mutes web audio in silent mode and pages can't detect it, so show a hint
  const isAppleTouch = /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (isAppleTouch) $("silentHint").hidden = false;
  // No offline cache while developing on this computer, so every reload shows the latest files
  const local = location.hostname === "localhost" || location.hostname === "127.0.0.1";
  if ("serviceWorker" in navigator && local) {
    navigator.serviceWorker.getRegistrations().then(regs => Promise.all(regs.map(r => r.unregister()))).catch(() => {});
    if (window.caches) caches.keys().then(keys => keys.forEach(k => caches.delete(k))).catch(() => {});
  }
  if ("serviceWorker" in navigator && location.protocol === "https:") {
    navigator.serviceWorker.register("sw.js").then(reg => {
      // iOS has no install prompt, so show instructions once the site is installable
      if (isAppleTouch && !installed()) { iosHint.hidden = false; fitCards(); }
      // An installed app can stay open for days, so it also checks for a new version each time it comes back on screen
      document.addEventListener("visibilitychange", () => { if (!document.hidden) reg.update().catch(() => {}); });
    }).catch(() => {});
    // Offer a grown-up "Update" pill only when the service worker holds a newer version than this page is running.
    // A worker taking over is not enough: the page has often already loaded the new files, or it's the very first install
    navigator.serviceWorker.addEventListener("message", e => {
      if (!e.data || typeof e.data.version !== "string" || !newer(e.data.version, VERSION)) return;
      $("updateBtn").hidden = false; installBtn.hidden = true; fitCards();   // one grown-up pill at a time; Install returns after the reload
    });
    const askVersion = () => { const w = navigator.serviceWorker.controller; if (w) w.postMessage("version"); };
    navigator.serviceWorker.addEventListener("controllerchange", askVersion);
    askVersion();
  }
  holdButton($("updateBtn"), () => location.reload());

  // ================= Pause =================
  function pauseGame() {
    if (!running || paused) return;
    paused = true;
    glass.classList.add("paused");
    fitCards(); $("pauseScreen").classList.add("show");
    syncCursor();
    setTimeout(() => $("resumeBtn").focus({ preventScroll: true }), 50);
  }
  function resumeGame() {
    if (!paused) return;
    paused = false;
    glass.classList.remove("paused");
    $("pauseScreen").classList.remove("show");
    flies.forEach(f => { f.vl = -1; });   // restore buzzing
    resumeQueue.splice(0).forEach((fn, i) => setTimeout(fn, 300 + i * 350));
    syncCursor();
  }
  function quitGame() {   // back to start mid-game
    paused = false; resumeQueue = [];
    glass.classList.remove("paused");
    $("pauseScreen").classList.remove("show");
    gen++; pending = 0;
    flies.forEach(f => { if (f.voice) f.voice.stop(); });
    flies = []; beeFlowers = []; flora.innerHTML = ""; bfClear(); antClear();
    running = false; gameOver = true;
    document.body.classList.remove("playing");
    syncCursor(); goStart();
  }
  // While a card is open only its own buttons can be reached: the HUD behind it and the closed cards are inert (no Tab, no Space)
  const overlays = [...document.querySelectorAll(".overlay")];
  function syncInert() {
    hud.inert = overlays.some(o => o.classList.contains("show"));
    overlays.forEach(o => { o.inert = !o.classList.contains("show"); });
  }
  const inertWatch = new MutationObserver(syncInert);
  overlays.forEach(o => inertWatch.observe(o, { attributes: true, attributeFilter: ["class"] }));
  syncInert();
  $("pauseBtn").addEventListener("click", () => {
    $("pauseBtn").classList.remove("pop"); void $("pauseBtn").offsetWidth; $("pauseBtn").classList.add("pop");
    pauseGame();
  });
  $("resumeBtn").addEventListener("click", resumeGame);
  $("quitBtn").addEventListener("click", quitGame);
  addEventListener("keydown", e => {
    if (e.key !== "Escape" && e.key !== "p" && e.key !== "P") return;
    if (paused) resumeGame(); else pauseGame();
  });

  // Back to start from any end screen; cancels auto-restart
  function goStart() {
    clearTimeout(endTimer);
    endScreen.classList.remove("show");
    $("chEnd").classList.remove("show");
    $("againBtn").classList.remove("auto");
    MODE = "kids"; document.body.classList.remove("challenge"); document.body.dataset.mode = MODE; syncNetArt();
    level = 0; caughtInLevel = 0; lvNum.textContent = ar(1); renderStars(false);
    startScreen.classList.add("show");
    measure();
  }
  $("chMenu").addEventListener("click", goStart);
  $("kidsMenu").addEventListener("click", goStart);

  function applyLang() {
    const html = document.documentElement;
    html.lang = LANG; html.dir = T("dir") || "ltr";
    document.title = T("title");
    document.querySelector('meta[name="apple-mobile-web-app-title"]').content = T("title");
    document.querySelectorAll("[data-i18n]").forEach(e => { e.textContent = T(e.dataset.i18n); });
    document.querySelectorAll("[data-i18n-aria]").forEach(e => e.setAttribute("aria-label", T(e.dataset.i18nAria)));
    document.querySelectorAll("[data-i18n-title]").forEach(e => { e.title = T(e.dataset.i18nTitle); });
    const next = nextLang();
    $("langBtn").hidden = !next || next === LANG;
    if (next) { $("langBtn").textContent = STR[next].langName; $("langBtn").setAttribute("lang", next); }
    lvNum.textContent = ar(level + 1);
    renderMute(); renderStats(); measure();
  }
  holdButton($("langBtn"), () => {
    LANG = nextLang();
    try { localStorage.setItem("flyCatch.lang", LANG); } catch (e) {}
    applyLang();
  });

  muteBtn.innerHTML = ICON_SPK;
  function renderMute() {
    muteBtn.classList.toggle("off", muted);
    muteBtn.setAttribute("aria-pressed", String(muted));
    muteBtn.setAttribute("aria-label", muted ? T("unmute") : T("mute"));
  }
  muteBtn.addEventListener("click", () => {
    sfx.init();
    muted = !muted;
    renderMute();
    muteBtn.classList.remove("pop"); void muteBtn.offsetWidth; muteBtn.classList.add("pop");
    if (muted) {
      sfx.uiOff();   // play the tone before muting so it's heard
      setTimeout(() => { if (muted) sfx.setMuted(true); }, 180);
    } else {
      sfx.setMuted(false);
      sfx.uiOn();
    }
  });
  renderMute();
  langReady.then(() => {
    if (!STR[LANG]) LANG = loadedLangs()[0] || DEFAULT_LANG;
    applyLang();
  });

  // ================= Clouds and lighting =================
  const sunEl = document.querySelector(".sun"), cloudEls = [...document.querySelectorAll(".cloud")];
  const haloEl = $("halo"), shadeEl = $("shade"), streaksEl = document.querySelector(".streaks");
  const CLOUD_PX_S = [28, 20];   // fixed px/s; the first crosses the sun, the second is slower for depth
  const CLOUD_START = [20, 70];   // seconds already drifted when the page opens, so they start apart
  const DIM_MAX = .22;   // max scenery dimming (~20%)
  let cloudW = [], cloudX = [0, 0], cloudT = 0, sunBox = null, cloudBoxes = [];
  function tuneClouds() {
    cloudW = cloudEls.map(c => c.offsetWidth);
    sunBox = sunEl.getBoundingClientRect(); cloudBoxes = cloudEls.map(c => c.getBoundingClientRect());   // only change on resize
    const sr = sunEl.getBoundingClientRect(), gr = glass.getBoundingClientRect(), d = sr.width * 3.2;
    haloEl.style.width = haloEl.style.height = d + "px";
    haloEl.style.transform = `translate(${sr.left - gr.left + sr.width / 2 - d / 2}px,${sr.top - gr.top + sr.height / 2 - d / 2}px)`;
  }
  // Actual cloud shape: capsule plus two circles
  function cloudShapes(r) {
    const w = r.width, h = r.height, d1 = .48 * w, d2 = .36 * w;
    return [
      { t: 0, x: r.left, y: r.top, w, h },
      { t: 1, cx: r.left + .14 * w + d1 / 2, cy: r.top + h * .7 - d1 / 2, r: d1 / 2 },
      { t: 1, cx: r.left + w * .84 - d2 / 2, cy: r.top + h * .76 - d2 / 2, r: d2 / 2 },
    ];
  }
  function inShape(px, py, s) {
    if (s.t) return (px - s.cx) ** 2 + (py - s.cy) ** 2 <= s.r * s.r;
    const rr = s.h / 2, qx = clamp(px, s.x + rr, s.x + s.w - rr);
    return (px - qx) ** 2 + (py - (s.y + rr)) ** 2 <= rr * rr;
  }
  let dimNow = -1, sha = .28;
  function sunCover() {   // fraction of the sun disc covered (0 to 1)
    const sr = sunBox, R = sr.width / 2, cx = sr.left + R, cy = sr.top + R;
    const sh = cloudBoxes.flatMap((r, i) => cloudShapes({ left: r.left + cloudX[i], top: r.top, width: r.width, height: r.height }));
    let tot = 0, hit = 0; const N = 10;
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      const px = cx - R + (i + .5) * 2 * R / N, py = cy - R + (j + .5) * 2 * R / N;
      if ((px - cx) ** 2 + (py - cy) ** 2 > R * R) continue;
      tot++; if (sh.some(s => inShape(px, py, s))) hit++;
    }
    return tot ? hit / tot : 0;
  }
  // Moved from the main loop, not a CSS animation, which Chrome ran on the main thread with a style pass every frame.
  // Only each cloud's picture moves; its box stays put and keeps the size from the CSS.
  // Each crosses from just off the left edge to just off the right one (window width + 1.2x its width), then comes round
  function moveClouds(dt) {
    if (!calm.matches) cloudT += dt;
    cloudEls.forEach((c, i) => {
      const w = cloudW[i], pic = c.firstElementChild;
      cloudX[i] = -1.1 * w + ((cloudT + CLOUD_START[i]) * CLOUD_PX_S[i]) % (innerWidth + w * 1.2);
      if (pic) pic.style.transform = `translate3d(${cloudX[i].toFixed(2)}px,0,0)`;
    });
  }
  function updateLight() {
    const root = document.documentElement;
    const night = root.dataset.theme === "dark" ||
      (root.dataset.theme !== "light" && matchMedia("(prefers-color-scheme: dark)").matches);
    const k = MODE === "butterflies" ? 0 : clamp(sunCover() / .75, 0, 1) * (night ? .6 : 1);   // 75% cover = max dimming; clear sky has no clouds
    if (Math.abs(k - dimNow) < .015) return;
    dimNow = k;
    shadeEl.style.opacity = (k * DIM_MAX).toFixed(3);
    haloEl.style.opacity = (1 - k * .8).toFixed(3);
    streaksEl.style.opacity = (1 - k * .5).toFixed(3);
    sha = .28 - k * .13;
    glass.style.setProperty("--sha", sha.toFixed(3));
  }
  tuneClouds();
  addEventListener("resize", tuneClouds);
  // A new mode or theme fades the hills' colours over 1.2s (the body transition), so the scenery is redrawn every frame while it does
  let bakeUntil = 0, baking = false;
  const bake = (ms = 0) => {
    bakeUntil = Math.max(bakeUntil, performance.now() + ms);
    if (baking) return;
    baking = true;
    requestAnimationFrame(function go() {
      bakeScenery(glass);
      if (performance.now() < bakeUntil) requestAnimationFrame(go); else baking = false;
    });
  };
  bake();
  addEventListener("resize", () => bake());
  watchColours(() => bake(1300));

  // ================= Main loop =================
  // Food on the ground lies under every ant; an ant and the food it carries are drawn nearer the front the lower they walk
  function drawAnts(x) {
    const z = A * .5;
    for (const f of foods) if (!f.carried) drawFood(x, f, z, antScale(f.y) * (f.s ?? 1));
    const near = [...ants.map(a => [Math.round(a.y), a]), ...foods.filter(f => f.carried).map(f => [Math.round(f.ant.y) + 2, f])];
    near.sort((p, q) => p[0] - q[0]);
    for (const [, o] of near) {
      if (o.food) drawAnt(x, o, A, antScale(o.y));
      else drawFood(x, o, z, antScale(o.ant.y) * .85 * (o.s ?? 1));
    }
  }
  function drawStage() {
    if (!stage.begin(flies.length > 0 || beeFlowers.length > 0 || bugs.length > 0 || garden.length > 0 || ants.length > 0 || foods.length > 0)) return;
    const x = stage.x, d = stage.dpr;
    for (const fl of beeFlowers) drawBeeFlower(x, fl);
    for (const fl of garden) if (!gardenGone(fl)) drawGarden(x, fl);
    for (const fl of garden) if (fl.slotAt) drawSlot(x, fl.k, fl.slotAt.x, fl.slotAt.y, B * .9, fl.t);
    for (const b of bugs) drawBug(x, b, sha);
    if (ants.length || foods.length) drawAnts(x);
    for (const f of flies) if (!f.top) drawFlier(x, f, S * f.sc, sha, d);
    for (const f of flies) if (f.top) drawFlier(x, f, S * f.sc, sha, d);   // a caught fly stays in front
  }
  if (dev) window.__fc = { flies: () => flies, bugs: () => bugs, ants: () => ants, glass, stage };
  let last = 0, lastLight = 0;
  const FLY_BUZZ = .024;   // single fly volume
  const BEE_BUZZ = .0113;   // tuned 25% clearer than one fly
  const BF_FLUTTER = .03;   // about a third of one fly on a laptop speaker
  const PAN_MAX  = .7;   // never fully in one ear, to protect kids' ears on headphones
  // A device that stays under 40 frames a second for 3 seconds of play draws its canvases at fewer pixels
  let slow = 0;
  function watchSpeed(gap) {
    if (!(gap > 0) || gap > .5) return;   // the first frame, or back from a pause
    slow = gap > 1 / 40 ? slow + gap : Math.max(0, slow - gap);
    if (slow > 3) { slow = 0; if (lowerQuality()) { measure(); bake(); } }
  }
  // The start menu runs at about 30 frames a second: its slow sways and flaps look the same, at half the work or less
  let menuAt = -1, menuLast = 0, cloudDt = 0;
  // At most 60 frames a second: a 90, 120 or 144 Hz screen skips frames, so the slow flies and butterflies cost half the work there
  const STEP = 1000 / 60;
  let due = 0;
  function frame(t) {
    if (t < due - 2) { requestAnimationFrame(frame); return; }
    due = t - due > STEP ? t + STEP - 2 : due + STEP;
    const gap = (t - last) / 1000, dt = Math.min(.05, gap || 0);
    last = t;
    const menu = !document.hidden && startScreen.classList.contains("show");
    if (menu && menuAt < 0) menuAt = t;
    if (!menu && menuAt >= 0) { menuAt = -1; resetMenu(); }
    const menuTick = menu && t - menuLast >= 1000 / 30 - 4;   // a bit early, so a 60 Hz screen still gets every other frame
    if (running && !paused && !document.hidden) watchSpeed(gap);
    if (running && !paused && !document.hidden) {
      clock += dt;
      if (isCh()) {
        timeLeft -= dt;
        const sec = Math.ceil(timeLeft);
        if (sec <= 5 && sec > 0 && sec !== lowTick) { lowTick = sec; sfx.tick(); }
        renderTime();
        if (timeLeft <= 0) { timeLeft = 0; renderTime(); finish(false); }
      }
    }
    if (!paused && !document.hidden && flies.length) step(dt);
    if (!paused && !document.hidden && (bugs.length || bfFlowers.length)) bfStep(dt);
    if (!paused && !document.hidden && MODE === "ants" && (running || ants.length)) antStep(dt);
    if (!paused && !document.hidden) {
      cloudDt += dt;
      if (!menu || menuTick) { moveClouds(cloudDt); cloudDt = 0; }
      for (const fl of beeFlowers) fl.t += dt;
      for (const fl of garden) fl.t += dt;
    }
    if (beeFlowers.some(flowerGone)) beeFlowers = beeFlowers.filter(fl => !flowerGone(fl));
    if (t - lastLight > 100) { lastLight = t; updateLight(); }   // 10 times a second is enough
    if (!document.hidden && (!paused || stage.dirty)) drawStage();
    if (menuTick) { menuLast = t; drawIcons(t / 1000); moveMenu((t - menuAt) / 1000); }
    // Per insect: pan follows position, bigger ones slightly louder
    for (const f of flies) {
      if (!f.voice) continue;
      const moving = f.state === "fly" || f.state === "exit";
      let lv = paused ? 0 : isBee(f) ? (moving ? BEE_BUZZ : f.sip ? BEE_BUZZ * .4 : 0) : (moving ? FLY_BUZZ : 0);
      lv *= Math.sqrt(f.sc);
      const p = clamp((f.x / W) * 2 - 1, -1, 1) * PAN_MAX;
      if (Math.abs(lv - f.vl) > .0005 || Math.abs(p - f.vp) > .02) { f.vl = lv; f.vp = p; f.voice.set(lv, p); }
    }
    // Butterflies flutter softly while flying, faster when scared or carried, and go quiet on their flower
    for (const b of bugs) {
      if (!b.voice) continue;
      const fast = b.flee, still = b.state === "rest";
      const lv = paused || still ? 0 : BF_FLUTTER * Math.sqrt(b.size / B) * (b.state === "toFlower" ? .7 : 1);
      const p = clamp((b.x / W) * 2 - 1, -1, 1) * PAN_MAX, r = fast ? 7 : 2.9;
      if (Math.abs(lv - b.vl) > .0005 || Math.abs(p - b.vp) > .02 || r !== b.vr) { b.vl = lv; b.vp = p; b.vr = r; b.voice.set(lv, p, r); }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { pauseGame(); sfx.suspend(); } else sfx.resume();
  });
  // ================= Cards that fit =================
  // A card squeezes a step at a time until it fits the screen; only if it still can't does it scroll, with a big, friendly scrollbar
  const FIT_STEPS = 4;
  const contentBottom = card => {   // from layout sizes, so entrance animations (transforms) don't count as overflow
    let b = 0;
    for (const el of card.children) if (!el.classList.contains("hold-hint")) b = Math.max(b, el.offsetTop + el.offsetHeight);
    return b + parseFloat(getComputedStyle(card).paddingBottom);
  };
  const overflows = card => contentBottom(card) > card.clientHeight + 1;
  function kidScrollbar(card) {
    const bar = document.createElement("div");
    bar.className = "kscroll"; bar.setAttribute("aria-hidden", "true");   // touch, wheel and keys still scroll the card itself
    bar.innerHTML = '<i class="ks-btn ks-up"></i><div class="ks-track"><i class="ks-thumb"></i></div><i class="ks-btn ks-down"></i>';
    card.after(bar);
    const [up, track, down] = bar.children, thumb = track.firstChild;
    const geo = () => {
      const max = Math.max(1, card.scrollHeight - card.clientHeight), room = track.clientHeight;
      const h = Math.max(40, room * card.clientHeight / card.scrollHeight);
      return { max, h, free: Math.max(1, room - h) };
    };
    const sync = () => {
      if (!bar.classList.contains("on")) return;
      const g = geo(), t = card.scrollTop;
      thumb.style.height = g.h + "px";
      thumb.style.translate = `0 ${g.free * t / g.max}px`;
      up.classList.toggle("off", t <= 1);
      down.classList.toggle("off", t >= g.max - 1);
    };
    const place = () => {
      const rtl = getComputedStyle(card).direction === "rtl", edge = 10, inset = 14;
      bar.style.top = card.offsetTop + inset + "px";
      bar.style.height = card.offsetHeight - inset * 2 + "px";
      bar.style.left = card.offsetLeft + (rtl ? edge : card.offsetWidth - bar.offsetWidth - edge) + "px";
    };
    const nudge = dir => card.scrollBy({ top: dir * card.clientHeight * .45, behavior: calm.matches ? "auto" : "smooth" });
    up.addEventListener("click", () => nudge(-1));
    down.addEventListener("click", () => nudge(1));
    track.addEventListener("pointerdown", e => {   // tapping the track jumps a step toward the finger
      if (e.target === thumb) return;
      const r = thumb.getBoundingClientRect();
      nudge(e.clientY < r.top ? -1.6 : 1.6);
    });
    let drag = null;
    thumb.addEventListener("pointerdown", e => {
      thumb.setPointerCapture(e.pointerId);
      drag = { y: e.clientY, top: card.scrollTop, k: geo().max / geo().free };
      thumb.classList.add("grab");
    });
    thumb.addEventListener("pointermove", e => { if (drag) card.scrollTop = drag.top + (e.clientY - drag.y) * drag.k; });
    const drop = () => { drag = null; thumb.classList.remove("grab"); };
    thumb.addEventListener("pointerup", drop);
    thumb.addEventListener("pointercancel", drop);
    card.addEventListener("scroll", sync, { passive: true });
    return {
      show(on) { bar.classList.toggle("on", on); if (on) { place(); sync(); } },
    };
  }
  const fitters = [...document.querySelectorAll(".overlay > .card")].map(card => ({ card, bar: null }));
  function fitCards() {
    for (const f of fitters) {
      const card = f.card;
      card.classList.remove("scrolls", "fit1", "fit2", "fit3", "fit4");
      let n = 0;
      while (n < FIT_STEPS && overflows(card)) card.classList.add("fit" + ++n);
      const scroll = overflows(card);
      card.classList.toggle("scrolls", scroll);
      if (!scroll || !card.parentElement.classList.contains("show")) card.scrollTop = 0;   // hidden cards open at the top
      if (scroll && !f.bar) f.bar = kidScrollbar(card);
      if (f.bar) f.bar.show(scroll);
    }
  }

  // Layout modes are classes so each switch can run as a view transition that glides elements into place
  const LAYOUTS = [
    ["split-cards", "(orientation:landscape) and (max-height:820px)"],
    ["hud-stack", "(max-aspect-ratio:6/5),(max-width:540px)"],
  ];
  const calm = matchMedia("(prefers-reduced-motion: reduce)");
  LAYOUTS.forEach(([cls, query]) => {
    const mq = matchMedia(query);
    const apply = () => { document.documentElement.classList.toggle(cls, mq.matches); measure(); };
    apply();
    mq.addEventListener("change", () => {
      if (document.startViewTransition && !calm.matches && !document.hidden) document.startViewTransition(apply).ready.catch(() => {});   // a quick second switch skips the first, harmlessly
      else apply();
    });
  });

  addEventListener("resize", () => {
    measure();
    flies.forEach(f => {
      const b = bounds(S * f.sc * .5);
      if (isAlive(f) && f.entered) { f.x = clamp(f.x, b.minX, b.maxX); f.y = clamp(f.y, b.minY, b.maxY); }
    });
  });

  document.body.dataset.mode = MODE;
  syncNetArt();
  measure();
  renderStars(false);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
})();
