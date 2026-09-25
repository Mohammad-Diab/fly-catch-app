(() => {
  // Bump on every release and keep in sync with VERSION in sw.js, or installed apps stay on the old one
  const VERSION = "1.14.2";
  window.GAME_VERSION = VERSION;
  console.info("Fly Catcher v" + VERSION);
  document.querySelectorAll(".ver").forEach(e => { e.textContent = "v" + VERSION; });

  // ================= Graphics =================
  const FLY_SVG = `
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

  const BEE_SVG = `
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

  const NET_SVG = `
<svg viewBox="0 0 200 200" aria-hidden="true">
  <line x1="124" y1="124" x2="190" y2="190" stroke="#8A5A3B" stroke-width="11" stroke-linecap="round"/>
  <line x1="164" y1="164" x2="190" y2="190" stroke="#5F3B24" stroke-width="13" stroke-linecap="round"/>
  <circle cx="80" cy="80" r="62" fill="rgba(255,255,255,.14)"/>
  <rect x="0" y="0" width="160" height="160" fill="url(#mesh)" clip-path="url(#hoop)"/>
  <circle cx="80" cy="80" r="62" fill="none" stroke="#FF7A3D" stroke-width="8"/>
  <circle cx="80" cy="80" r="62" fill="none" stroke="#FFB07A" stroke-width="2.5" stroke-dasharray="6 10" opacity=".85"/>
</svg>`;

  const STAR_SVG = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z"/></svg>`;

  const ICON_SPK = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/>
    <g class="waves"><path d="M16.5 8.5a5 5 0 010 7"/><path d="M19 6a8.5 8.5 0 010 12"/></g>
    <g class="cross"><path d="M17 9l5 6"/><path d="M22 9l-5 6"/></g></svg>`;

  // ================= Levels =================
  const LEVELS = [
    { flies: 1, goal:  5, speed:  90, rest: .55 },
    { flies: 2, goal:  8, speed: 125, rest: .45 },
    { flies: 3, goal: 12, speed: 160, rest: .38 },
    { flies: 4, goal: 16, speed: 195, rest: .30 },
    { flies: 5, goal: 20, speed: 230, rest: .24 },
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
  const FLY_LIFE = [25, 25];   // safety cap; flies normally leave after 2-3 rests
  const PETALS = ["#FF7AA8", "#B98CF0", "#FF9E5E", "#FF6B8A"];
  const flowerSVG = c => `<svg viewBox="0 0 100 120" aria-hidden="true">
    <path d="M50 58 Q47 88 50 118" stroke="#3F9B53" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path d="M50 92 Q66 78 78 84 Q67 99 50 97 Z" fill="#5FBF5A"/>
    ${[0, 60, 120, 180, 240, 300].map(a => `<ellipse cx="50" cy="26" rx="11" ry="16" fill="${c}" transform="rotate(${a} 50 45)"/>`).join("")}
    <circle cx="50" cy="45" r="12" fill="#FFC93C"/>
    <circle cx="46" cy="41" r="3.2" fill="#fff" opacity=".55"/>
  </svg>`;
  const sizePts = sc => clamp(1 / sc, .85, 1.45);   // smaller fly is harder, so more points
  let MODE = "kids";
  const isCh = () => MODE === "challenge";
  const num = n => Math.round(n).toLocaleString("en-US");   // same Western digits in both languages

  // ================= Elements =================
  const $ = id => document.getElementById(id);
  const glass = $("glass"), layer = $("layer"), fx = $("fx"), hud = $("hud");
  const starsEl = $("stars"), lvNum = $("lvNum"), banner = $("banner");
  const startScreen = $("startScreen"), endScreen = $("endScreen");
  const muteBtn = $("mute");
  $("heroFly").innerHTML = FLY_SVG;

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
    S = clamp(MIN * 0.15, 58, 100);
    NET_R = clamp(MIN * 0.12, 50, 86);
    if (isCh()) NET_R = Math.max(40, NET_R * CH.net);
    TOP_PAD = hud.offsetHeight + 12;
    glass.style.setProperty("--fly", S + "px");
    sizeNet(cursorNet);
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
      // Stereo buzz per insect: thin rasp for flies, deeper softer hum for bees
      voice(kind) {
        if (!ctx) return null;
        const nodes = [], out = ctx.createGain(); out.gain.value = 0;
        const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        const osc = (type, f) => { const o = ctx.createOscillator(); o.type = type; o.frequency.value = f; nodes.push(o); return o; };
        const trem = ctx.createGain(); trem.gain.value = 1;
        if (kind === "bee") {
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
          set(level, p) {
            const t = ctx.currentTime;
            out.gain.setTargetAtTime(level, t, .08);
            if (pan) pan.pan.setTargetAtTime(p, t, .05);
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

  // ================= "No!" voice on a bee hit =================
  // Embedded recording: no TTS and works offline
  const LAA_MP3 = "data:audio/mpeg;base64,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";
  // Skips while the previous clip is still playing, to avoid overlap
  const miss = (() => {
    let buf = null, loading = null, last = -Infinity, lastAny = -Infinity, src = null;
    const gap = () => (buf ? buf.duration * 1000 : 1080) + 150;
    function load() {
      if (buf || loading || !sfx.ctx()) return loading;
      const bin = atob(LAA_MP3.split(",")[1]);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      loading = new Promise(res => {
        sfx.ctx().decodeAudioData(bytes.buffer, b => { buf = b; res(b); }, () => res(null));
      });
      return loading;
    }
    return {
      load,
      say() {
        if (muted) return;
        const now = performance.now();
        if (now - lastAny < gap()) return;
        last = lastAny = now;
        if (!buf) { load(); sfx.aww(); return; }
        src = sfx.play(buf, .95);
      },
      sayNow() {
        if (muted) return;
        const now = performance.now();
        if (now - lastAny < gap()) return;
        last = lastAny = now;
        if (LANG !== "ar") { sfx.aww(); return; }   // recording is Arabic only; plays a tone in English
        if (!buf) { load(); sfx.aww(); return; }
        src = sfx.play(buf, .95);
      },
      stop()  { try { if (src) src.stop(); } catch (e) {} src = null; },
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
    if (last && fliesNow >= LEVELS[level].goal - caughtInLevel) return Math.random() < BEE.chance[level] ? "bee" : null;
    // No two bees in a row while no flies are on screen
    if (lastKind === "bee" && fliesNow === 0) return "fly";
    return Math.random() < BEE.chance[level] ? "bee" : "fly";
  }
  const baseSpeed = () => LEVELS[level].speed * clamp(MIN / 700, .62, 1.15) * (isCh() ? CH.speed : 1);
  const restChance = () => LEVELS[level].rest * (isCh() ? CH.rest : 1);

  // ================= Flies =================
  function spawnFly(kind = "fly") {
    const el = document.createElement("div");
    el.className = "fly flying" + (kind === "bee" ? " bee" : "");
    el.innerHTML = `<div class="body">${kind === "bee" ? BEE_SVG : FLY_SVG}</div><div class="dizzy"><i></i><i></i><i></i></div>`;
    const pool = SIZES[MODE];
    const sc = pool[Math.floor(Math.random() * pool.length)];
    const Z = S * sc;
    el.style.setProperty("--fly", Z + "px");
    layer.appendChild(el);

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
      el, body: el.firstElementChild, x, y, heading, target: heading,
      spdK: k, speed: baseSpeed() * k, turn: rand(.6, 1.2),
      state: "fly", rest: 0, tw: 0, rotTarget: 0, entered: false,
      rot: heading * 180 / Math.PI + 90, t: 0, wob: rand(0, 6.28),
      vy: 0, slideT: 0, xOff: 0, dead: false, born: null, sc, z: Z,
      kind, life: kind === "bee" ? BEE.life : rand(FLY_LIFE[0], FLY_LIFE[1]), exitK: 2, bump: 0,
      phase: kind === "bee" ? "go" : null, sip: false, flower,
      voice: sfx.voice(kind), vl: -1, vp: 9,
      restsLeft: Math.random() < .5 ? 2 : 3,
    });
  }

  function step(dt) {
    for (const f of flies) {
      const Z = S * f.sc, b = bounds(Z * .5);
      if (f.z !== Z) { f.z = Z; f.el.style.setProperty("--fly", Z + "px"); }
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
            f.state = "rest"; f.rest = (rand(1.2, 2.2) - level * .15) * (isCh() ? CH.restDur : 1); f.tw = 0; f.rotTarget = f.rot;
            f.el.classList.remove("flying");
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
            f.landed = true; f.el.classList.remove("flying");   // landed: fold wings
          }
        }
        if (f.tw <= 0) { f.tw = rand(.35, .8); f.rotTarget = f.rot + rand(-14, 14); }
        f.rot = lerpDeg(f.rot, f.rotTarget, clamp(dt * 12, 0, 1));
        if (f.rest <= 0) {
          if (f.sip) beeDone(f);
          else if (MODE === "bees" && !isBee(f) && --f.restsLeft <= 0) {
            f.leftNat = true; leave(f, 1.3);   // rested 2-3 times: leave
          } else {
            f.state = "fly"; f.el.classList.add("flying");
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

      f.el.style.transform = `translate3d(${f.x + f.xOff - Z / 2}px,${f.y - Z / 2}px,0)`;
      f.body.style.transform = `rotate(${f.rot}deg)`;
    }
    collide();
    if (flies.some(f => f.dead)) {
      const refill = flies.some(f => f.dead && (isBee(f) || f.leftNat));
      flies = flies.filter(f => { if (f.dead) { f.el.remove(); if (f.voice) f.voice.stop(); } return !f.dead; });
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
    if (f.state === "rest") { f.state = "fly"; f.el.classList.add("flying"); }   // a resting one takes off
  }

  // Bee flowers
  const flora = $("flora");
  function plantFlower() {
    const F = S * 1.45;
    let x, base, tries = 0;
    do {
      x = rand(W * .12, W * .88);
      base = rand(H * .86, H * .98);   // root in the green ground strip
    } while (++tries < 12 && flies.some(f => f.flower && Math.abs(f.flower.x - x) < F * 1.1));
    const y = base - F * .75;   // flower center
    const el = document.createElement("div");
    el.className = "bflower";
    el.innerHTML = flowerSVG(PETALS[Math.floor(Math.random() * PETALS.length)]);
    el.style.width = F + "px"; el.style.height = F * 1.2 + "px";
    el.style.left = (x - F / 2) + "px"; el.style.top = (base - F * 1.2) + "px";
    flora.appendChild(el);
    sfx.bloom();
    return { x, y, el };
  }
  function wiltFlower(fl) {
    if (!fl) return;
    fl.el.classList.add("wilt");
    setTimeout(() => fl.el.remove(), 650);
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
    f.state = "exit"; f.exitK = k; f.el.classList.add("flying");
  }
  // Visual alert for hitting a bee
  const ALERT_SVG = `<svg viewBox="0 0 100 100" aria-hidden="true">
    <circle cx="50" cy="50" r="44" fill="#FF5A5A" stroke="#fff" stroke-width="7"/>
    <path d="M34 34 L66 66 M66 34 L34 66" stroke="#fff" stroke-width="11" stroke-linecap="round"/></svg>`;
  let warnT = null;
  function beeAlert(x, y) {
    fx.querySelectorAll(".bee-alert").forEach(n => n.remove());   // only one at a time
    const el = document.createElement("div");
    el.className = "bee-alert";
    el.innerHTML = ALERT_SVG + "<span>" + T("thatsBee") + "</span>";
    el.style.left = clamp(x, 80, W - 80) + "px";
    el.style.top  = clamp(y, TOP_PAD + 70, H - 70) + "px";
    fx.appendChild(el);
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
    f.state = "exit"; f.exitK = 3.2; f.el.classList.add("flying", "dodge");
  }

  // ================= Net =================
  function sizeNet(el) {
    const k = NET_R / 64;
    el.style.width = el.style.height = (200 * k) + "px";
  }
  function placeNet(el, x, y) {
    const k = NET_R / 64;
    el.style.left = (x - 80 * k) + "px";
    el.style.top  = (y - 80 * k) + "px";
  }
  const cursorNet = document.createElement("div");
  cursorNet.className = "net cursor-net away";
  cursorNet.innerHTML = NET_SVG;
  fx.appendChild(cursorNet);

  // Net follows the mouse; the system cursor hides only while it's shown
  let mouseIn = false, overUI = false, swooping = false, lastMouse = null, usingMouse = false;
  function syncCursor() {
    const aim = running && !paused && usingMouse && mouseIn && !overUI;
    glass.classList.toggle("aiming", aim);
    cursorNet.classList.toggle("away", !aim || swooping);
  }
  function netToMouse() {
    if (!lastMouse) return;
    const r = glass.getBoundingClientRect();
    placeNet(cursorNet, lastMouse.x - r.left, lastMouse.y - r.top);
  }

  function swoop(x, y, hit, quick) {
    const el = document.createElement("div");
    el.className = "net";
    el.innerHTML = NET_SVG;
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
    f.el.classList.remove("flying");
    f.el.classList.add("caught");
    f.el.style.zIndex = 3;
    burst(f.x, f.y, S * f.sc);
    const g = gen;
    setTimeout(() => {
      if (g !== gen) return;
      f.state = "slide"; f.vy = 18; f.slideT = 0;
      f.el.classList.remove("caught");
      f.el.classList.add("dizzy-on");
      sfx.squeak();
    }, 480);
  }

  function registerCatch() {
    if (gameOver) return;
    caughtInLevel++;
    renderStars(true);
    if (caughtInLevel >= LEVELS[level].goal) {
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
    if (gameOver) return;
    let want = LEVELS[level].flies;
    if (MODE !== "bees" && level === LEVELS.length - 1) want = Math.min(want, LEVELS[level].goal - caughtInLevel);
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
    const goal = LEVELS[level].goal;
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
    const minis = Array.from({ length: LEVELS[level].flies },
      () => `<span class="mini">${FLY_SVG}</span>`).join("");
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
    syncCursor();
    for (const f of flies) {
      if (!isAlive(f)) continue;
      const dl = f.x, dr = W - f.x, dt = f.y, db = H - f.y, m = Math.min(dl, dr, dt, db);
      f.heading = m === dl ? Math.PI : m === dr ? 0 : m === dt ? -Math.PI / 2 : Math.PI / 2;
      f.heading += rand(-.3, .3);
      f.state = "exit"; f.el.classList.add("flying");
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
    $("chEnd").classList.add("show");
    if (isNew) { sfx.newBest(); confetti($("chEnd")); }
  }

  function showEnd() {
    endScreen.classList.add("show");
    confetti(endScreen);
    const ab = $("againBtn");
    ab.classList.remove("auto"); void ab.offsetWidth; ab.classList.add("auto");
    clearTimeout(endTimer);
    endTimer = setTimeout(() => startGame(MODE), 10000);
  }

  function startGame(mode) {
    if (typeof mode === "string") MODE = mode;
    document.body.classList.toggle("challenge", isCh());
    sfx.init();
    miss.load();
    clearTimeout(endTimer);
    gen++;
    flies.forEach(f => { f.el.remove(); if (f.voice) f.voice.stop(); });
    flies = []; pending = 0;
    flora.innerHTML = "";
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
    fill();
  }

  // ================= Input =================
  glass.addEventListener("pointerdown", e => {
    usingMouse = e.pointerType === "mouse";
    sfx.init();
    if (!running) return;
    if (e.target.closest("button, .overlay.show")) return;
    const r = glass.getBoundingClientRect();
    const px = e.clientX - r.left, py = e.clientY - r.top;
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

  $("startBtn").addEventListener("click", () => startGame("kids"));
  $("challengeBtn").addEventListener("click", () => startGame("challenge"));
  $("againBtn").addEventListener("click", () => startGame(MODE));
  $("beesBtn").addEventListener("click", () => startGame("bees"));
  $("chAgain").addEventListener("click", () => startGame("challenge"));
  // ================= Install as app =================
  const installBtn = $("installBtn"), iosHint = $("iosHint");
  const installed = () => matchMedia("(display-mode: standalone)").matches ||
    matchMedia("(display-mode: fullscreen)").matches || navigator.standalone === true;
  let installEvt = null;
  addEventListener("beforeinstallprompt", e => {   // Android and desktop Chrome/Edge
    e.preventDefault(); installEvt = e;
    if (!installed()) installBtn.hidden = false;
  });
  installBtn.addEventListener("click", async () => {
    if (!installEvt) return;
    installEvt.prompt();
    try { await installEvt.userChoice; } catch (e) {}
    installEvt = null; installBtn.hidden = true;
  });
  addEventListener("appinstalled", () => { installBtn.hidden = true; iosHint.hidden = true; });
  // iOS mutes web audio in silent mode and pages can't detect it, so show a hint
  const isAppleTouch = /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (isAppleTouch) $("silentHint").hidden = false;
  if ("serviceWorker" in navigator &&
      (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1")) {
    navigator.serviceWorker.register("sw.js").then(() => {
      // iOS has no install prompt, so show instructions once the site is installable
      if (isAppleTouch && !installed()) iosHint.hidden = false;
    }).catch(() => {});
  }

  // ================= Pause =================
  function pauseGame() {
    if (!running || paused) return;
    paused = true;
    glass.classList.add("paused");
    $("pauseScreen").classList.add("show");
    miss.stop(); syncCursor();
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
    flies.forEach(f => { f.el.remove(); if (f.voice) f.voice.stop(); });
    flies = []; flora.innerHTML = "";
    running = false; gameOver = true;
    document.body.classList.remove("playing");
    syncCursor(); goStart();
  }
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
    MODE = "kids"; document.body.classList.remove("challenge");
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
    const next = nextLang();
    $("langBtn").hidden = !next || next === LANG;
    if (next) { $("langBtn").textContent = STR[next].langName; $("langBtn").setAttribute("lang", next); }
    lvNum.textContent = ar(level + 1);
    renderMute(); renderStats(); measure();
  }
  $("langBtn").addEventListener("click", () => {
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
      miss.stop();
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
  const DIM_MAX = .22;   // max scenery dimming (~20%)
  function tuneClouds() {
    cloudEls.forEach((c, i) => {
      const w = c.offsetWidth;   // travel = screen width + 1.2x cloud width
      c.style.animationDuration = ((innerWidth + w * 1.2) / CLOUD_PX_S[i]).toFixed(1) + "s";
    });
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
  let dimNow = -1;
  function sunCover() {   // fraction of the sun disc covered (0 to 1)
    const sr = sunEl.getBoundingClientRect(), R = sr.width / 2, cx = sr.left + R, cy = sr.top + R;
    const sh = cloudEls.flatMap(c => cloudShapes(c.getBoundingClientRect()));
    let tot = 0, hit = 0; const N = 10;
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      const px = cx - R + (i + .5) * 2 * R / N, py = cy - R + (j + .5) * 2 * R / N;
      if ((px - cx) ** 2 + (py - cy) ** 2 > R * R) continue;
      tot++; if (sh.some(s => inShape(px, py, s))) hit++;
    }
    return tot ? hit / tot : 0;
  }
  function updateLight() {
    const root = document.documentElement;
    const night = root.dataset.theme === "dark" ||
      (root.dataset.theme !== "light" && matchMedia("(prefers-color-scheme: dark)").matches);
    const k = clamp(sunCover() / .75, 0, 1) * (night ? .6 : 1);   // 75% cover = max dimming
    if (Math.abs(k - dimNow) < .015) return;
    dimNow = k;
    shadeEl.style.opacity = (k * DIM_MAX).toFixed(3);
    haloEl.style.opacity = (1 - k * .8).toFixed(3);
    streaksEl.style.opacity = (1 - k * .5).toFixed(3);
    glass.style.setProperty("--sha", (.28 - k * .13).toFixed(3));
  }
  tuneClouds();
  addEventListener("resize", tuneClouds);

  // ================= Main loop =================
  let last = 0, lastLight = 0;
  const FLY_BUZZ = .024;   // single fly volume
  const BEE_BUZZ = .0113;   // tuned 25% clearer than one fly
  const PAN_MAX  = .7;   // never fully in one ear, to protect kids' ears on headphones
  function frame(t) {
    const dt = Math.min(.05, (t - last) / 1000 || 0);
    last = t;
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
    if (t - lastLight > 100) { lastLight = t; updateLight(); }   // 10 times a second is enough
    // Per insect: pan follows position, bigger ones slightly louder
    for (const f of flies) {
      if (!f.voice) continue;
      const moving = f.state === "fly" || f.state === "exit";
      let lv = paused ? 0 : isBee(f) ? (moving ? BEE_BUZZ : f.sip ? BEE_BUZZ * .4 : 0) : (moving ? FLY_BUZZ : 0);
      lv *= Math.sqrt(f.sc);
      const p = clamp((f.x / W) * 2 - 1, -1, 1) * PAN_MAX;
      if (Math.abs(lv - f.vl) > .0005 || Math.abs(p - f.vp) > .02) { f.vl = lv; f.vp = p; f.voice.set(lv, p); }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { pauseGame(); sfx.suspend(); miss.stop(); } else sfx.resume();
  });
  addEventListener("resize", () => {
    measure();
    flies.forEach(f => {
      const b = bounds(S * f.sc * .5);
      if (isAlive(f) && f.entered) { f.x = clamp(f.x, b.minX, b.maxX); f.y = clamp(f.y, b.minY, b.maxY); }
    });
  });

  measure();
  renderStars(false);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
})();
