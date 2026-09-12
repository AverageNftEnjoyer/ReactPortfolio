/* Zap Gallery — skill score attack + boss finale */
(() => {
  const STORAGE_KEY = "zap-gallery-best";
  const COMBO_START = 5;
  const GAME_MS = 155000;
  const BOSS_AT = 128000;
  const BOSS_HP = 48;
  const BOSS_HIT_PTS = 2;
  const BOSS_CLEAR_BONUS = 150;
  const SAUCER_WAVES = [5, 7, 10];
  const SKULL_TARGET_COUNT = 3;

  const PHASES = [
    { id: "balloons", until: 16000, label: "Balloons" },
    { id: "targets", until: 48000, label: "Targets" },
    { id: "cans", until: 62000, label: "Cans" },
    { id: "fruit", until: 78000, label: "Fruit" },
    { id: "saucers", until: BOSS_AT, label: "Saucers" },
    { id: "boss", until: GAME_MS, label: "Boss" },
  ];

  // Wii Play–style caps: sparse, readable, skill-first
  const CAPS = {
    balloon: 5,
    target: 8,
    can: 3,
    fruit: 2,
    flyby: 2,
    miniufo: 4,
  };

  // One is picked at random each time the arcade loads (activate()); stays fixed
  // for the whole session (retries included) so the scene doesn't jump mid-play.
  const BACKGROUND_THEMES = [
    {
      id: "meadow",
      label: "Meadow",
      shellColor: "#7eb6d9",
      sky: {
        day: [[106, 169, 212], [169, 208, 230], [207, 227, 181], [181, 201, 138]],
        night: [[12, 18, 42], [24, 36, 72], [34, 48, 70], [28, 42, 48]],
      },
      hillFar: { day: [143, 181, 110], night: [61, 90, 58] },
      hillNear: { day: [122, 159, 92], night: [47, 74, 46] },
      moon: "#f2f0de",
      particle: { type: "star", mode: "night-only", color: "#fff8e8" },
    },
    {
      id: "aurora",
      label: "Midnight Aurora",
      shellColor: "#183753",
      sky: {
        day: [[12, 26, 52], [24, 52, 78], [40, 82, 92], [18, 48, 62]],
        night: [[4, 8, 24], [10, 20, 44], [20, 46, 58], [10, 28, 38]],
      },
      hillFar: { day: [128, 140, 150], night: [30, 34, 58] },
      hillNear: { day: [104, 116, 128], night: [20, 22, 42] },
      moon: "#e7e6ff",
      particle: { type: "star", mode: "always", color: "#e9f8ff" },
    },
    {
      id: "retro",
      label: "Neon Grid",
      shellColor: "#e8688f",
      sky: {
        day: [[255, 145, 170], [255, 120, 150], [255, 150, 90], [120, 40, 120]],
        night: [[40, 10, 60], [70, 15, 90], [90, 20, 90], [20, 10, 40]],
      },
      ground: { day: [40, 20, 60], night: [10, 6, 26] },
      gridColorA: "#ff5fd6",
      gridColorB: "#3ff0ff",
      sunColor: { day: "#ffd35e", night: "#ff6fd8" },
      particle: { type: "glint", mode: "always", color: "#ffe9fb" },
    },
    {
      id: "autumn",
      label: "Harvest Valley",
      shellColor: "#a9713c",
      sky: {
        day: [[214, 150, 96], [230, 178, 120], [224, 176, 110], [168, 104, 58]],
        night: [[30, 20, 26], [52, 32, 34], [46, 32, 30], [30, 22, 20]],
      },
      hillFar: { day: [176, 110, 58], night: [64, 42, 34] },
      hillNear: { day: [140, 80, 42], night: [46, 30, 26] },
      moon: "#f2d9b8",
      particle: {
        type: "leaf",
        mode: "always",
        colors: ["#d9612b", "#e8963a", "#c94f2d", "#efb84a"],
      },
    },
    {
      id: "winter",
      label: "Snowbound Lodge",
      shellColor: "#879dad",
      sky: {
        day: [[126, 154, 178], [164, 186, 201], [208, 216, 218], [174, 187, 190]],
        night: [[8, 15, 29], [20, 32, 51], [38, 52, 65], [28, 40, 48]],
      },
      hillFar: { day: [206, 214, 222], night: [58, 70, 92] },
      hillNear: { day: [180, 192, 206], night: [40, 50, 70] },
      snowCap: true,
      moon: "#eef3fb",
      particle: { type: "snow", mode: "always", color: "#ffffff" },
    },
  ];

  const MAP_STORAGE_KEY = "zap-gallery-map";

  // Non-gold, non-boss saucers/mini-UFOs each roll one of these so the fleet
  // doesn't all look like the same steel-blue ship — hull, dome, and beam
  // tint travel together so each one reads as a coherent "species".
  const UFO_PALETTES = [
    { body: ["#5a6b78", "#e2e8ee", "#5a6b78"], domeMid: "#bfe9ff", domeEdge: "#4f7f9a", beam: ["rgba(95,238,177,0.42)", "rgba(105,225,190,0.2)"] },
    { body: ["#1f6b4a", "#b9f5d0", "#1f6b4a"], domeMid: "#baf5cf", domeEdge: "#1f6b4a", beam: ["rgba(120,255,150,0.42)", "rgba(120,255,150,0.2)"] },
    { body: ["#7a3f1f", "#ffcd9a", "#7a3f1f"], domeMid: "#ffd7ab", domeEdge: "#8a4a1f", beam: ["rgba(255,160,90,0.42)", "rgba(255,160,90,0.2)"] },
    { body: ["#3a2a6b", "#c9b8ff", "#3a2a6b"], domeMid: "#d9c9ff", domeEdge: "#4a2a8b", beam: ["rgba(190,140,255,0.42)", "rgba(190,140,255,0.2)"] },
    { body: ["#7a1f3a", "#ffb0c4", "#7a1f3a"], domeMid: "#ffc9d6", domeEdge: "#8a2f4a", beam: ["rgba(255,110,150,0.42)", "rgba(255,110,150,0.2)"] },
    { body: ["#0e6b7a", "#a6f0ff", "#0e6b7a"], domeMid: "#c9f7ff", domeEdge: "#0e6b7a", beam: ["rgba(110,220,255,0.42)", "rgba(110,220,255,0.2)"] },
  ];

  const HILL_FAR_PATH = { startY: 0.74, c1x: 0.28, c1y: 0.64, midX: 0.52, midY: 0.72, c2x: 0.78, c2y: 0.8, endY: 0.68 };
  const HILL_NEAR_PATH = { startY: 0.84, c1x: 0.33, c1y: 0.76, midX: 0.58, midY: 0.86, c2x: 0.82, c2y: 0.92, endY: 0.82 };

  const mixColor = (a, b, t) => [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
  const rgbStr = (c) => `rgb(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])})`;

  let lastThemeId = null;

  const state = {
    active: false,
    mode: "idle",
    raf: 0,
    last: 0,
    score: 0,
    best: 0,
    combo: 0,
    elapsed: 0,
    spawnAcc: 0,
    flybyAcc: 0,
    miniAcc: 0,
    skullTimes: [],
    skullsSpawned: 0,
    targets: [],
    fx: [],
    floats: [],
    shake: 0,
    boss: null,
    night: false,
    nightBlend: 0,
    bgTheme: null,
    mapChoice: "random",
    particles: [],
    cityFar: [],
    cityNear: [],
    cityBeacon: null,
    sunSpawned: false,
    forceBoss: false,
    demoAcc: 0,
    saucerWave: {
      index: 0,
      stage: "idle", // idle | active | exiting | gap | done
      timer: 0,
    },
    pointer: { x: 0, y: 0, in: false },
    canvas: null,
    ctx: null,
    dpr: 1,
    w: 800,
    h: 600,
    els: {},
    _lastBalloonColor: null,
  };

  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const randIn = (a, b, fallback) => (b > a ? rand(a, b) : fallback);
  const fieldX = () => clamp(state.w / 900, 0.62, 1.2);
  const fieldY = () => clamp(state.h / 640, 0.62, 1.2);
  // Keeps targets clear of the dock buttons (Home/Next/Play/Map) so players
  // never have to move their pointer into that zone unless they mean to click it.
  const footerBuffer = () => clamp(state.h * 0.16, 90, 170);

  function phaseAt(t) {
    if (state.forceBoss || state.boss) return PHASES[PHASES.length - 1];
    return PHASES.find((p) => t < p.until) || PHASES[PHASES.length - 1];
  }

  function difficulty() {
    const t = state.elapsed / 1000;
    return {
      speed: 1 + Math.min(1.35, t * 0.012),
      spawn: Math.max(420, 1100 - t * 6),
      size: Math.max(0.78, 1 - t * 0.0025),
    };
  }

  function comboBonus(combo) {
    if (combo >= 100) return 5;
    if (combo >= 50) return 4;
    if (combo >= 25) return 3;
    if (combo >= 10) return 2;
    if (combo >= COMBO_START) return 1;
    return 0;
  }

  function countType(type) {
    return state.targets.filter((t) => t.type === type).length;
  }

  function loadBest() {
    try {
      const n = Number(localStorage.getItem(STORAGE_KEY));
      return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
    } catch {
      return 0;
    }
  }

  function saveBest(n) {
    try {
      localStorage.setItem(STORAGE_KEY, String(n));
    } catch {
      /* ignore */
    }
  }

  function updateHud() {
    const { score, best, combo, time, bossWrap, bossFill } = state.els;
    if (score) score.textContent = String(state.score);
    if (best) best.textContent = `Best ${state.best}`;

    const left = Math.max(0, GAME_MS - state.elapsed);
    const secs = Math.ceil(left / 1000);
    if (time) {
      const m = Math.floor(secs / 60);
      const s = secs % 60;
      time.textContent = `${m}:${String(s).padStart(2, "0")}`;
    }

    if (combo) {
      const show = state.mode === "playing" && state.combo >= COMBO_START;
      combo.hidden = !show;
      if (show) {
        const b = comboBonus(state.combo);
        combo.textContent =
          b > 1
            ? `${state.combo} combo · +${b}/hit`
            : `${state.combo} hit combo`;
      }
    }

    if (bossWrap && bossFill) {
      const on = state.mode === "playing" && state.boss;
      bossWrap.hidden = !on;
      if (on) {
        bossFill.style.transform = `scaleX(${clamp(state.boss.hp / state.boss.maxHp, 0, 1)})`;
      }
    }
  }

  function setOverlay(visible, opts = {}) {
    const { overlay, kicker, title, hint, start } = state.els;
    if (!overlay) return;
    overlay.hidden = !visible;
    if (kicker) kicker.textContent = opts.kicker ?? "Arcade";
    if (title) title.textContent = opts.title ?? "Quick Break";
    if (hint)
      hint.textContent =
        opts.hint ??
        "Hit the targets, combo multipliers.";
    if (start) start.textContent = opts.cta ?? "Play";
  }

  function addFloat(x, y, text, color) {
    state.floats.push({ x, y, text, color, life: 1, vy: -0.95 });
  }

  function addFx(x, y, kind, color) {
    state.fx.push({
      x,
      y,
      kind,
      color: color || "#fff",
      life: 1,
      r: kind === "miss" ? 10 : 8,
    });
    const n = kind === "hit" ? 12 : 5;
    for (let i = 0; i < n; i++) {
      const a = rand(0, Math.PI * 2);
      const sp = rand(1.2, kind === "hit" ? 6 : 3);
      state.fx.push({
        x,
        y,
        kind: "spark",
        color: kind === "hit" ? color || "#fff" : "rgba(30,40,50,0.5)",
        life: rand(0.4, 0.85),
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        r: rand(1.4, 3.2),
      });
    }
  }

  function finishRun(opts) {
    if (state.mode !== "playing") return;
    state.mode = "dead";
    state.targets = state.targets.filter((t) => t.type === "boss");
    if (state.score > state.best) {
      state.best = state.score;
      saveBest(state.best);
    }
    updateHud();
    setOverlay(true, {
      kicker: opts.kicker,
      title: opts.title,
      hint: opts.hint,
      cta: "Play Again",
    });
  }

  function endByTimer() {
    const boss = state.boss;
    let extra = "";
    if (boss && boss.hp > 0) extra = ` Boss HP left ${boss.hp}.`;
    else if (boss && boss.hp <= 0) extra = " Boss cleared!";
    finishRun({
      kicker: "Run Complete",
      title: `Score ${state.score}`,
      hint:
        (state.score >= state.best && state.score > 0 ? "New best!" : "Nice run.") +
        extra,
    });
  }

  function resetRun() {
    state.score = 0;
    state.combo = 0;
    state.elapsed = 0;
    state.spawnAcc = 0;
    state.flybyAcc = 0;
    state.miniAcc = 0;
    state.skullTimes = [
      rand(18000, 42000),
      rand(50000, 80000),
      rand(86000, 118000),
    ].slice(0, SKULL_TARGET_COUNT);
    state.skullsSpawned = 0;
    state.targets = [];
    state.fx = [];
    state.floats = [];
    state.shake = 0;
    state.boss = null;
    state.night = false;
    state.nightBlend = 0;
    state.sunSpawned = false;
    state.forceBoss = false;
    state.demoAcc = 0;
    state.saucerWave = { index: 0, stage: "idle", timer: 0 };
    state._lastBalloonColor = null;
    buildParticles();
    updateHud();
  }

  function loadMapChoice() {
    try {
      const v = localStorage.getItem(MAP_STORAGE_KEY);
      return v && (v === "random" || BACKGROUND_THEMES.some((t) => t.id === v))
        ? v
        : BACKGROUND_THEMES[0].id;
    } catch {
      return BACKGROUND_THEMES[0].id;
    }
  }

  function saveMapChoice(id) {
    try {
      localStorage.setItem(MAP_STORAGE_KEY, id);
    } catch {
      /* ignore */
    }
  }

  function applyShellColor(theme) {
    document.documentElement.style.setProperty("--zap-shell-bg", theme.shellColor);
  }

  function updateMapLabel() {
    const el = state.els.mapLabel;
    if (!el) return;
    el.textContent = state.mapChoice === "random" ? "Map: Random" : `Map: ${state.bgTheme?.label ?? ""}`;
  }

  function cycleMap() {
    const order = [...BACKGROUND_THEMES.map((t) => t.id), "random"];
    const idx = order.indexOf(state.mapChoice);
    state.mapChoice = order[(idx + 1) % order.length];
    saveMapChoice(state.mapChoice);
    pickBackgroundTheme();
    buildParticles();
  }

  function pickBackgroundTheme() {
    let theme;
    if (state.mapChoice !== "random") {
      theme = BACKGROUND_THEMES.find((t) => t.id === state.mapChoice);
      if (!theme) {
        state.mapChoice = "random";
        saveMapChoice(state.mapChoice);
        theme = pick(BACKGROUND_THEMES);
      }
    } else {
      const choices =
        lastThemeId && BACKGROUND_THEMES.length > 1
          ? BACKGROUND_THEMES.filter((t) => t.id !== lastThemeId)
          : BACKGROUND_THEMES;
      theme = pick(choices);
    }
    state.bgTheme = theme;
    lastThemeId = theme.id;
    applyShellColor(theme);
    updateMapLabel();
  }

  function buildCityscape() {
    const layer = (count, minH, maxH, minW, maxW) => {
      const arr = [];
      let x = -0.02;
      for (let i = 0; i < count && x < 1.05; i++) {
        const w = rand(minW, maxW);
        const h = rand(minH, maxH);
        arr.push({ x, w, h, seed: Math.floor(rand(0, 9999)) });
        x += w + rand(0.004, 0.02);
      }
      return arr;
    };
    state.cityFar = layer(16, 0.16, 0.3, 0.045, 0.085);
    state.cityNear = layer(11, 0.22, 0.48, 0.065, 0.125);
    let tallest = state.cityNear[0];
    for (const b of state.cityNear) if (b.h > tallest.h) tallest = b;
    state.cityBeacon = tallest ? { x: tallest.x + tallest.w * 0.5, h: tallest.h } : null;
  }

  function buildParticles() {
    const theme = state.bgTheme || BACKGROUND_THEMES[0];
    const kind = theme.particle.type;
    const count =
      kind === "leaf" ? 22 : kind === "snow" ? 60 : kind === "rain" ? 85 : kind === "glint" ? 40 : 70;
    state.particles = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random() * (kind === "star" ? 0.72 : 1),
      r:
        kind === "leaf"
          ? rand(3, 6)
          : kind === "snow"
            ? rand(1.4, 3.2)
            : kind === "rain"
              ? rand(7, 16)
              : rand(0.6, 2.2),
      tw: rand(0, Math.PI * 2),
      sp: rand(0.002, 0.006),
      sway: rand(0.3, 1),
      rot: rand(0, Math.PI * 2),
      rotSp: rand(-0.0006, 0.0006),
      fall:
        kind === "snow"
          ? rand(0.00006, 0.00016)
          : kind === "leaf"
            ? rand(0.00008, 0.00018)
            : kind === "rain"
              ? rand(0.0007, 0.0014)
              : 0,
      color: theme.particle.colors ? pick(theme.particle.colors) : theme.particle.color,
    }));
  }

  function updateParticles(dt) {
    for (const p of state.particles) {
      if (!p.fall) continue;
      p.y += p.fall * dt;
      p.rot += p.rotSp * dt;
      if (p.y > 1.05) {
        p.y = -0.05;
        p.x = Math.random();
      }
    }
  }

  function startGame() {
    if (state.mode === "playing") return;
    resetRun();
    state.mode = "playing";
    setOverlay(false);
    spawnSun();
    spawnForPhase();
    updateHud();
  }

  /* —— spawners —— */
  function spawnBalloon() {
    if (countType("balloon") >= CAPS.balloon) return;
    const colors = ["#e44747", "#2eb0e0", "#efc233"];
    const color = pick(colors);
    const r = 24 * difficulty().size * rand(0.95, 1.1) * fieldY();
    const margin = r + 10;
    const xMin = margin;
    const xMax = state.w - margin;
    const floor = state.h - footerBuffer();
    state.targets.push({
      type: "balloon",
      x: randIn(xMin, xMax, state.w * 0.5),
      y: clamp(floor - rand(8, Math.min(70, state.h * 0.12)), margin, floor),
      r,
      color,
      vy: -rand(1.15, 1.7) * difficulty().speed * fieldY(),
      vx: rand(-0.45, 0.45) * fieldX(),
      wobble: rand(0, Math.PI * 2),
      points: 1,
      hitR: r * 0.88,
    });
  }

  function spawnBullseye(opts = {}) {
    const skull = opts.skull ?? false;
    if (!skull && countType("target") >= CAPS.target) return;
    const gold = skull ? false : opts.gold ?? Math.random() < 0.14;
    const penalty = skull ? false : opts.penalty ?? (!gold && Math.random() < 0.05);
    const r = (gold ? 36 : skull ? 38 : 32) * difficulty().size * rand(0.9, 1.05) * clamp(fieldY(), 0.75, 1.1);
    const life = (skull ? rand(3400, 4600) : rand(2400, 3600)) / difficulty().speed;
    const xMin = r + 28;
    const xMax = state.w - r - 28;
    const yMin = r + 72;
    const yMax = state.h - footerBuffer() - r;
    state.targets.push({
      type: "target",
      x: randIn(xMin, xMax, state.w * 0.5),
      y: randIn(yMin, yMax, state.h * 0.42),
      r,
      maxR: r,
      life,
      maxLife: life,
      gold,
      penalty,
      skull,
      points: gold ? 10 : penalty ? -5 : 1,
      hitR: r,
      appear: 0,
    });
  }

  function tossSpeed(peakFrac, base) {
    const peak = state.h * peakFrac;
    const need = Math.sqrt(Math.max(36, peak * 0.4));
    return base * clamp(need / 9.2, 0.68, 1.3) * difficulty().speed;
  }

  function spawnCan() {
    if (countType("can") >= CAPS.can) return;
    const fromLeft = Math.random() < 0.5;
    const r = 20 * difficulty().size * clamp(fieldY(), 0.75, 1.1);
    const hp = 1 + ((Math.random() * 5) | 0);
    const inset = Math.min(state.w * 0.22, 120);
    state.targets.push({
      type: "can",
      x: fromLeft
        ? randIn(36, inset + 20, state.w * 0.22)
        : randIn(state.w - inset - 20, state.w - 36, state.w * 0.78),
      y: state.h - 28,
      r,
      vx: (fromLeft ? 1 : -1) * rand(0.55, 1.15) * difficulty().speed * fieldX(),
      vy: -tossSpeed(0.46, rand(6.5, 8.8)),
      g: 0.2,
      rot: rand(-0.2, 0.2),
      spin: rand(-0.08, 0.08),
      hp,
      maxHp: hp,
      points: 2 + hp,
      hitR: r * 1.15,
      label: pick(["SODA", "POP", "ZAP"]),
      tint: pick(["#c45c3e", "#3d7ea6", "#d4a017"]),
    });
  }

  function spawnFruit() {
    if (countType("fruit") >= CAPS.fruit) return;
    const kinds = [
      { name: "apple", points: 2 },
      { name: "orange", points: 2 },
      { name: "strawberry", points: 3 },
      { name: "watermelon", points: 3 },
      { name: "peach", points: 2 },
      { name: "grape", points: 3 },
    ];
    const kind = pick(kinds);
    const entry = pick(["fall", "fall", "fall", "left", "right", "toss"]);
    const speedLevel = 1 + ((Math.random() * 10) | 0);
    const speedScale = 0.7 + speedLevel * 0.13;
    const r = 32 * difficulty().size * rand(0.95, 1.1) * clamp(fieldY(), 0.72, 1.08);
    const inset = Math.min(state.w * 0.2, 130);
    let x;
    let y;
    let vx;
    let vy;
    let g;

    if (entry === "fall") {
      x = randIn(r + 16, state.w - r - 16, state.w * 0.5);
      y = -r - 10;
      vx = rand(-0.65, 0.65) * fieldX();
      vy = rand(0.65, 1.15) * difficulty().speed * fieldY();
      g = 0.025;
    } else if (entry === "left" || entry === "right") {
      const fromLeft = entry === "left";
      x = fromLeft ? -r - 8 : state.w + r + 8;
      y = randIn(r + 82, state.h * 0.52, state.h * 0.32);
      vx = (fromLeft ? 1 : -1) * rand(0.75, 1.3) * difficulty().speed * fieldX();
      vy = rand(-0.35, 0.65) * fieldY();
      g = 0.04;
    } else {
      const fromLeft = Math.random() < 0.5;
      x = fromLeft
        ? randIn(40, inset + 24, state.w * 0.2)
        : randIn(state.w - inset - 24, state.w - 40, state.w * 0.8);
      y = state.h + 8;
      vx = (fromLeft ? 1 : -1) * rand(0.75, 1.3) * difficulty().speed * fieldX();
      vy = -tossSpeed(0.42, rand(6.2, 7.6));
      g = 0.17;
    }

    state.targets.push({
      type: "fruit",
      fruit: kind.name,
      x,
      y,
      r,
      vx,
      vy,
      g: g * (0.8 + speedScale * 0.2),
      speedLevel,
      rot: rand(0, Math.PI * 2),
      spin: rand(-0.08, 0.08) * speedScale,
      points: kind.points,
      hitR: r * 1.08,
    });
    const fruit = state.targets[state.targets.length - 1];
    fruit.vx *= speedScale;
    fruit.vy *= speedScale;
  }

  function spawnSaucerAt(x, y, opts = {}) {
    const r = 28 * difficulty().size * (opts.scale || 1) * clamp(fieldY(), 0.72, 1.08);
    const gold = opts.gold ?? Math.random() < 0.12;
    const horizontalSpeed = rand(1.7, 3.1) * difficulty().speed;
    state.targets.push({
      type: "saucer",
      x,
      y,
      r,
      vx: (Math.random() < 0.5 ? -1 : 1) * horizontalSpeed,
      vy: rand(-1.25, 1.25) * difficulty().speed,
      wobble: rand(0, Math.PI * 2),
      wobbleSpeed: rand(0.0035, 0.007),
      beam: Math.random() < 0.75,
      beamStyle: pick(["pulse", "sweep", "strobe"]),
      beamPhase: rand(0, Math.PI * 2),
      lightPhase: rand(0, Math.PI * 2),
      gold,
      palette: pick(UFO_PALETTES),
      points: gold ? 5 : 3,
      hitR: r * 0.92,
      wave: true,
      exiting: false,
    });
  }

  function spawnSaucerWave(count) {
    // clear leftovers
    state.targets = state.targets.filter((t) => t.type !== "saucer");
    const cols = Math.min(5, count);
    const rowGap = Math.min(70, state.h * 0.13);
    const y0 = clamp(state.h * 0.14, 52, 86);
    for (let i = 0; i < count; i++) {
      const col = (i % cols) + 1;
      const row = Math.floor(i / cols);
      const x = clamp((state.w / (cols + 1)) * col + rand(-10, 10), 36, state.w - 36);
      const y = clamp(y0 + row * rowGap + rand(-6, 6), 48, state.h * 0.58);
      spawnSaucerAt(x, y, { gold: count >= 10 && i === 0 });
    }
  }

  function beginSaucerWave() {
    const sw = state.saucerWave;
    if (sw.index >= SAUCER_WAVES.length) {
      sw.stage = "done";
      spawnBoss();
      return;
    }
    const n = SAUCER_WAVES[sw.index];
    spawnSaucerWave(n);
    sw.stage = "active";
    sw.timer = 11000 + n * 550;
    updateHud();
  }

  function exitSaucerWave() {
    for (const t of state.targets) {
      if (t.type !== "saucer") continue;
      t.exiting = true;
      t.vx = (t.x < state.w * 0.5 ? -1 : 1) * rand(3.4, 5.2);
      t.vy = -rand(2.2, 3.8);
    }
    state.saucerWave.stage = "exiting";
    state.saucerWave.timer = 3500;
  }

  function completeSaucerWave(gapMs) {
    const sw = state.saucerWave;
    state.targets = state.targets.filter((t) => t.type !== "saucer");
    sw.index += 1;
    if (sw.index >= SAUCER_WAVES.length) {
      sw.stage = "done";
      sw.timer = 0;
      spawnBoss();
      return;
    }
    sw.stage = "gap";
    sw.timer = gapMs;
  }

  function spawnTitleSaucer() {
    if (countType("saucer") >= 1) return;
    const fromLeft = Math.random() < 0.5;
    spawnSaucerAt(
      fromLeft ? -48 : state.w + 48,
      rand(state.h * 0.16, state.h * 0.4),
      { scale: 1.08, gold: false }
    );
    const t = state.targets[state.targets.length - 1];
    if (!t || t.type !== "saucer") return;
    t.vx = (fromLeft ? 1 : -1) * rand(1.4, 2.1);
    t.vy = rand(-0.08, 0.12);
    t.exiting = true;
    t.beam = true;
  }

  function seedTitleDemo() {
    state.targets = [];
    state.fx = [];
    state.floats = [];
    state.demoAcc = 0;
    if (state.w < 40) return;
    spawnBalloon();
    spawnBalloon();
    spawnBullseye({ gold: false, penalty: false });
    spawnTitleSaucer();
  }

  function tickTitleDemo(dt) {
    state.demoAcc += dt;
    if (countType("balloon") < 2 && Math.random() < 0.012) spawnBalloon();
    const regular = state.targets.filter((t) => t.type === "target" && !t.gold).length;
    const gold = state.targets.filter((t) => t.type === "target" && t.gold).length;
    if (regular < 1 && Math.random() < 0.007) {
      spawnBullseye({ gold: false, penalty: false });
    }
    if (gold < 1 && state.demoAcc > 2600 && Math.random() < 0.006) {
      spawnBullseye({ gold: true, penalty: false });
    }
    if (countType("saucer") < 1 && state.demoAcc > 1100 && Math.random() < 0.006) {
      spawnTitleSaucer();
    }
    updateTargets(dt * 0.55);
  }

  function spawnMeteor() {
    const fromLeft = Math.random() < 0.5;
    const r = 18;
    state.targets.push({
      type: "meteor",
      kind: "meteor",
      x: fromLeft ? -40 : state.w + 40,
      y: rand(60, state.h * 0.4),
      r,
      vx: (fromLeft ? 1 : -1) * rand(5.5, 7.5) * difficulty().speed,
      vy: rand(1.2, 2.8) * difficulty().speed,
      rot: rand(0, Math.PI * 2),
      spin: rand(0.1, 0.25) * (fromLeft ? 1 : -1),
      points: 20,
      hitR: 22,
      trail: [],
    });
  }

  function spawnBlimp() {
    const fromLeft = Math.random() < 0.5;
    state.targets.push({
      type: "flyby",
      kind: "blimp",
      x: fromLeft ? -80 : state.w + 80,
      y: rand(90, state.h * 0.32),
      r: 34,
      vx: (fromLeft ? 1 : -1) * rand(1.1, 1.7),
      vy: Math.sin(rand(0, 6)) * 0.2,
      facing: fromLeft ? 1 : -1,
      points: 15,
      hitR: 36,
      bob: rand(0, Math.PI * 2),
    });
  }

  function spawnRocket() {
    state.targets.push({
      type: "flyby",
      kind: "rocket",
      x: rand(state.w * 0.2, state.w * 0.8),
      y: state.h + 40,
      r: 16,
      vx: rand(-0.6, 0.6),
      vy: -rand(4.5, 6.5),
      rot: -Math.PI / 2,
      points: 18,
      hitR: 20,
      trail: [],
    });
  }

  function spawnKite() {
    const fromLeft = Math.random() < 0.5;
    state.targets.push({
      type: "flyby",
      kind: "kite",
      x: fromLeft ? -30 : state.w + 30,
      y: rand(120, state.h * 0.5),
      r: 18,
      vx: (fromLeft ? 1 : -1) * rand(1.8, 2.6),
      vy: rand(-0.4, 0.4),
      bob: rand(0, Math.PI * 2),
      color: pick(["#e44747", "#3cc0ec", "#f0c14a", "#c47adf"]),
      points: 10,
      hitR: 20,
    });
  }

  function spawnFlyby() {
    if (countType("flyby") + countType("meteor") >= CAPS.flyby) return;
    const roll = Math.random();
    if (roll < 0.34) spawnMeteor();
    else if (roll < 0.58) spawnBlimp();
    else if (roll < 0.8) spawnRocket();
    else spawnKite();
  }

  function spawnSun() {
    if (state.sunSpawned || state.night) return;
    state.sunSpawned = true;
    const r = 36;
    state.targets.push({
      type: "sun",
      x: state.w * 0.82,
      y: state.h * 0.16,
      r,
      hitR: r * 0.85,
      points: 25,
      pulse: 0,
    });
  }

  function triggerNight(x, y) {
    state.night = true;
    state.targets = state.targets.filter((t) => t.type !== "sun");
    addFx(x, y, "hit", "#ffd56a");
    addFloat(x, y - 20, "NIGHT!", "#ffd56a");
    state.shake = 10;
  }

  function spawnBoss() {
    if (state.boss) return;
    state.forceBoss = true;
    // clear saucers
    state.targets = state.targets.filter(
      (t) => t.type !== "saucer" && t.type !== "flyby" && t.type !== "meteor"
    );
    const r = Math.min(78, state.w * 0.11, state.h * 0.16);
    const boss = {
      type: "boss",
      x: state.w * 0.5,
      y: state.h * 0.3,
      r,
      hp: BOSS_HP,
      maxHp: BOSS_HP,
      hitR: r * 1.05,
      points: BOSS_HIT_PTS,
      teleportIn: 0,
      nextAction: 1400,
      flash: 0,
      angle: 0,
      behavior: "stay", // stay | teleport | fly
      vx: 0,
      vy: 0,
      offscreen: false,
    };
    state.boss = boss;
    state.targets.push(boss);
    if (!state.targets.some((t) => t.type === "sun") && !state.night) spawnSun();
    addFloat(state.w * 0.5, state.h * 0.18, "BOSS!", "#f0c14a");
    updateHud();
  }

  function pickBossBehavior(boss) {
    const roll = Math.random();
    if (roll < 0.34) {
      boss.behavior = "teleport";
      teleportBoss(boss);
    } else if (roll < 0.62) {
      boss.behavior = "fly";
      boss.offscreen = false;
      const side = Math.random() < 0.5 ? -1 : 1;
      boss.vx = side * rand(3.2, 4.8);
      boss.vy = rand(-1.2, 1.2);
      boss.nextAction = rand(1800, 2800);
    } else {
      boss.behavior = "stay";
      boss.vx = rand(-0.35, 0.35);
      boss.vy = rand(-0.25, 0.25);
      boss.nextAction = rand(1600, 2600);
    }
  }

  function teleportBoss(boss) {
    const m = boss.r + 24;
    boss.x = randIn(m, state.w - m, state.w * 0.5);
    boss.y = randIn(m + 36, state.h * 0.55, state.h * 0.32);
    boss.teleportIn = 1;
    boss.vx = 0;
    boss.vy = 0;
    boss.offscreen = false;
    boss.behavior = "stay";
    boss.nextAction = rand(900, 1800);
    addFx(boss.x, boss.y, "hit", "#b388ff");
  }

  function spawnMiniUfo() {
    if (!state.boss || countType("miniufo") >= CAPS.miniufo) return;
    const fromLeft = Math.random() < 0.5;
    const r = 14 * rand(0.9, 1.15);
    const gold = Math.random() < 0.15;
    state.targets.push({
      type: "miniufo",
      x: fromLeft ? -30 : state.w + 30,
      y: randIn(70, state.h * 0.52, state.h * 0.3),
      r,
      vx: (fromLeft ? 1 : -1) * rand(3, 4.8),
      vy: rand(-1.1, 1.1),
      wobble: rand(0, Math.PI * 2),
      wobbleSpeed: rand(0.004, 0.008),
      beam: Math.random() < 0.5,
      beamStyle: pick(["pulse", "sweep", "strobe"]),
      beamPhase: rand(0, Math.PI * 2),
      lightPhase: rand(0, Math.PI * 2),
      gold,
      palette: pick(UFO_PALETTES),
      points: gold ? 4 : 2,
      hitR: r * 1.05,
    });
  }

  function spawnForPhase() {
    const phase = phaseAt(state.elapsed).id;
    if (phase === "boss" || phase === "saucers") return;
    if (phase === "balloons") spawnBalloon();
    else if (phase === "targets") spawnBullseye();
    else if (phase === "cans") {
      if (Math.random() < 0.7) spawnCan();
    } else if (phase === "fruit") spawnFruit();
  }

  function topHitAt(x, y) {
    for (let i = state.targets.length - 1; i >= 0; i--) {
      const t = state.targets[i];
      const scale =
        t.type === "target" ? clamp(t.appear, 0, 1) * (t.r / t.maxR) : 1;
      const rr = (t.hitR || t.r) * (t.type === "target" ? scale : 1);
      const dx = x - t.x;
      const dy = y - t.y;
      if (dx * dx + dy * dy <= rr * rr) return { t, i };
    }
    return null;
  }

  function scoreHit(pts, x, y, color, big) {
    state.combo += 1;
    const bonus = comboBonus(state.combo);
    state.score += pts + bonus;
    addFx(x, y, "hit", color);
    const label = bonus ? `+${pts + bonus}` : `+${pts}`;
    addFloat(x, y - 12, label, big || bonus >= 2 ? "#f0c14a" : "#fff");
    state.shake = big ? 7 : 3;
    updateHud();
  }

  function onShoot(x, y) {
    if (!state.active || state.mode !== "playing") return;

    const hit = topHitAt(x, y);
    if (hit) {
      const { t, i } = hit;

      if (t.type === "boss") {
        t.hp -= 1;
        scoreHit(BOSS_HIT_PTS, x, y, "#c9a0ff", true);
        t.flash = 1;
        // sometimes react, sometimes stay put
        if (Math.random() < 0.55) pickBossBehavior(t);
        if (t.hp <= 0) {
          state.targets.splice(i, 1);
          state.boss = null;
          state.score += BOSS_CLEAR_BONUS;
          addFloat(x, y - 36, `+${BOSS_CLEAR_BONUS}`, "#f0c14a");
          addFx(x, y, "hit", "#f0c14a");
          state.shake = 14;
          updateHud();
          finishRun({
            kicker: "Boss Cleared",
            title: `Score ${state.score}`,
            hint:
              state.score >= state.best && state.score > 0
                ? "New best — mothership down."
                : "Mothership down. Play again?",
          });
        }
        return;
      }

      if (t.type === "sun") {
        state.targets.splice(i, 1);
        scoreHit(t.points, x, y, "#ffd56a", true);
        triggerNight(x, y);
        return;
      }

      if (t.type === "can") {
        t.hp -= 1;
        t.vy = -rand(7, 10);
        t.vx += rand(-1.2, 1.2);
        t.spin += rand(-0.15, 0.15);
        t.flash = 1;
        if (t.hp > 0) {
          state.combo += 1;
          const bonus = comboBonus(state.combo);
          state.score += 1 + bonus;
          addFx(x, y, "hit", t.tint);
          addFloat(x, y - 10, bonus ? `+${1 + bonus}` : "+1", "#fff");
          state.shake = 4;
          updateHud();
          return;
        }
        state.targets.splice(i, 1);
        scoreHit(t.points, x, y, t.tint, true);
        return;
      }

      state.targets.splice(i, 1);

      if (t.skull) {
        state.combo = 0;
        state.score = 0;
        state._lastBalloonColor = null;
        addFx(x, y, "miss", "#9f1d2d");
        addFloat(x, y - 12, "SCORE RESET", "#ff5a68");
        state.shake = 14;
        updateHud();
        return;
      }

      let pts = t.points;
      if (t.type === "balloon" && state._lastBalloonColor === t.color) pts = 2;
      if (t.type === "balloon") state._lastBalloonColor = t.color;
      if (t.type === "saucer" && t.gold) pts = 5;

      if (pts < 0) {
        state.combo = 0;
        state.score = Math.max(0, state.score + pts);
        addFx(x, y, "miss", "#e85d5d");
        addFloat(x, y - 10, String(pts), "#e85d5d");
        state.shake = 8;
        updateHud();
      } else {
        const fruitTint = {
          apple: "#e23b3b",
          orange: "#f08a24",
          strawberry: "#e0233a",
          watermelon: "#2f9e57",
          peach: "#ff9a6b",
          grape: "#7b5ea7",
        };
        const color =
          t.type === "meteor" || t.kind === "meteor"
            ? "#ff7a3d"
            : t.type === "flyby"
              ? t.kind === "kite"
                ? t.color
                : "#9ec9e8"
              : t.type === "fruit"
                ? fruitTint[t.fruit] || "#3cc0ec"
                : t.gold
                  ? "#f0c14a"
                  : t.color || t.tint || "#3cc0ec";
        scoreHit(
          pts,
          x,
          y,
          color,
          t.gold || t.type === "meteor" || t.type === "flyby" || t.type === "fruit"
        );
      }
      return;
    }

    state.combo = 0;
    state._lastBalloonColor = null;
    addFx(x, y, "miss", "rgba(20,30,40,0.5)");
    addFloat(x, y - 8, "miss", "rgba(255,255,255,0.7)");
    updateHud();
  }

  function updateTargets(dt) {
    const dead = [];
    for (let i = 0; i < state.targets.length; i++) {
      const t = state.targets[i];
      if (t.flash > 0) t.flash = Math.max(0, t.flash - dt * 0.008);

      if (t.type === "balloon") {
        t.wobble += dt * 0.004;
        // always rise — never reverse upward motion
        t.vy = -Math.abs(t.vy || 1.2);
        t.x += (t.vx + Math.sin(t.wobble) * 0.35) * (dt / 16.67);
        t.y += t.vy * (dt / 16.67);
        const m = t.r + 4;
        if (t.x < m) {
          t.x = m;
          t.vx = Math.abs(t.vx);
        } else if (t.x > state.w - m) {
          t.x = state.w - m;
          t.vx = -Math.abs(t.vx);
        }
        if (t.y + t.r < -20) dead.push(i);
      } else if (t.type === "target") {
        t.appear = Math.min(1, t.appear + dt / 180);
        t.life -= dt;
        const p = clamp(t.life / t.maxLife, 0, 1);
        t.r = t.maxR * (0.4 + 0.6 * p);
        if (t.life <= 0) dead.push(i);
      } else if (t.type === "can" || t.type === "fruit") {
        t.vy += t.g * (dt / 16.67);
        t.x += t.vx * (dt / 16.67);
        t.y += t.vy * (dt / 16.67);
        t.rot += t.spin;
        const m = t.r + 8;
        if (t.x < m) {
          t.x = m;
          t.vx = Math.abs(t.vx);
        } else if (t.x > state.w - m) {
          t.x = state.w - m;
          t.vx = -Math.abs(t.vx);
        }
        if (t.y > state.h + 70 || t.y < -90) dead.push(i);
      } else if (t.type === "saucer") {
        t.wobble += dt * (t.wobbleSpeed || 0.0035);
        t.beamPhase = (t.beamPhase || 0) + dt * 0.004;
        t.lightPhase = (t.lightPhase || 0) + dt * 0.007;
        if (t.exiting) {
          t.x += t.vx * (dt / 16.67);
          t.y += t.vy * (dt / 16.67);
          if (t.x < -80 || t.x > state.w + 80 || t.y < -80) dead.push(i);
        } else {
          t.x += (t.vx + Math.sin(t.wobble) * 0.7) * (dt / 16.67);
          t.y += (t.vy + Math.cos(t.wobble * 0.8) * 0.45) * (dt / 16.67);
          const m = t.r + 10;
          if (t.x < m) {
            t.x = m;
            t.vx = Math.abs(t.vx) + 0.2;
          }
          if (t.x > state.w - m) {
            t.x = state.w - m;
            t.vx = -Math.abs(t.vx) - 0.2;
          }
          if (t.y < m + 40) {
            t.y = m + 40;
            t.vy = Math.abs(t.vy) + 0.15;
          }
          if (t.y > state.h * 0.62) {
            t.y = state.h * 0.62;
            t.vy = -Math.abs(t.vy) - 0.15;
          }
          if (Math.random() < 0.004) {
            t.vx += rand(-0.8, 0.8);
            t.vy += rand(-0.6, 0.6);
          }
        }
      } else if (t.type === "miniufo") {
        t.wobble += dt * (t.wobbleSpeed || 0.005);
        t.beamPhase = (t.beamPhase || 0) + dt * 0.005;
        t.lightPhase = (t.lightPhase || 0) + dt * 0.009;
        t.x += (t.vx + Math.sin(t.wobble) * 0.5) * (dt / 16.67);
        t.y += (t.vy + Math.cos(t.wobble) * 0.35) * (dt / 16.67);
        if (t.x < -60 || t.x > state.w + 60 || t.y < -60 || t.y > state.h + 60)
          dead.push(i);
      } else if (t.type === "meteor") {
        t.trail.push({ x: t.x, y: t.y, life: 1 });
        if (t.trail.length > 10) t.trail.shift();
        for (const p of t.trail) p.life -= dt * 0.004;
        t.trail = t.trail.filter((p) => p.life > 0);
        t.x += t.vx * (dt / 16.67);
        t.y += t.vy * (dt / 16.67);
        t.rot += t.spin;
        if (t.x < -80 || t.x > state.w + 80 || t.y > state.h + 80) dead.push(i);
      } else if (t.type === "flyby") {
        if (t.kind === "blimp" || t.kind === "kite") {
          t.bob = (t.bob || 0) + dt * 0.004;
          t.y += Math.sin(t.bob) * 0.45;
        }
        if (t.kind === "rocket") {
          t.trail = t.trail || [];
          t.trail.push({ x: t.x, y: t.y, life: 1 });
          if (t.trail.length > 8) t.trail.shift();
          for (const p of t.trail) p.life -= dt * 0.005;
          t.trail = t.trail.filter((p) => p.life > 0);
        }
        t.x += t.vx * (dt / 16.67);
        t.y += (t.vy || 0) * (dt / 16.67);
        if (t.x < -100 || t.x > state.w + 100 || t.y < -100 || t.y > state.h + 100)
          dead.push(i);
      } else if (t.type === "sun") {
        t.pulse = (t.pulse || 0) + dt * 0.003;
    // keep sun parked upper-right, slight bob
        t.x = clamp(state.w * 0.82, t.r + 16, state.w - t.r - 16);
        t.y = clamp(state.h * 0.16, t.r + 16, state.h * 0.3) + Math.sin(t.pulse) * 4;
      } else if (t.type === "boss") {
        t.angle += dt * 0.002;
        if (t.teleportIn > 0) t.teleportIn = Math.max(0, t.teleportIn - dt * 0.004);
        t.nextAction -= dt;

        if (t.behavior === "fly") {
          t.x += t.vx * (dt / 16.67);
          t.y += t.vy * (dt / 16.67);
          if (!t.offscreen && (t.x < -t.r || t.x > state.w + t.r)) {
            t.offscreen = true;
            t.nextAction = Math.min(t.nextAction, 400);
          }
          if (t.offscreen && t.nextAction <= 0) {
            const fromLeft = Math.random() < 0.5;
            t.x = fromLeft ? -t.r - 10 : state.w + t.r + 10;
            t.y = rand(t.r + 50, state.h * 0.5);
            t.vx = (fromLeft ? 1 : -1) * rand(2.8, 4.2);
            t.vy = rand(-0.8, 0.8);
            t.offscreen = false;
            t.behavior = "stay";
            t.nextAction = rand(1200, 2200);
            addFloat(t.x, t.y - 30, "re-entry", "#c9a0ff");
          }
        } else if (t.behavior === "stay") {
          t.x += (t.vx || 0) * (dt / 16.67);
          t.y += (t.vy || 0) * (dt / 16.67) + Math.sin(t.angle * 3) * 0.25;
          const m = t.r + 24;
          t.x = clamp(t.x, m, state.w - m);
          t.y = clamp(t.y, m + 30, state.h * 0.6);
        }

        if (t.nextAction <= 0 && !t.offscreen) pickBossBehavior(t);
      }
    }
    for (let i = dead.length - 1; i >= 0; i--) state.targets.splice(dead[i], 1);
  }

  function updateFx(dt) {
    for (const f of state.fx) {
      f.life -= dt * (f.kind === "spark" ? 0.0022 : 0.0035);
      if (f.kind === "spark") {
        f.x += f.vx;
        f.y += f.vy;
        f.vy += 0.08;
      } else f.r += f.kind === "miss" ? 1.8 : 2.4;
    }
    state.fx = state.fx.filter((f) => f.life > 0);
    for (const f of state.floats) {
      f.life -= dt * 0.0018;
      f.y += f.vy * (dt / 16.67);
    }
    state.floats = state.floats.filter((f) => f.life > 0);
    if (state.shake > 0) state.shake = Math.max(0, state.shake - dt * 0.04);
  }

  function tick(dt) {
    updateParticles(dt);
    if (state.night && state.nightBlend < 1) {
      state.nightBlend = Math.min(1, state.nightBlend + dt * 0.0012);
    }

    if (state.mode === "playing") {
      const prevPhase = phaseAt(state.elapsed).id;
      state.elapsed = Math.min(GAME_MS, state.elapsed + dt);
      const phase = phaseAt(state.elapsed).id;

      while (
        state.skullsSpawned < state.skullTimes.length &&
        state.elapsed >= state.skullTimes[state.skullsSpawned]
      ) {
        spawnBullseye({ skull: true });
        state.skullsSpawned += 1;
      }

      if (state.elapsed >= GAME_MS) {
        endByTimer();
        updateFx(dt);
        return;
      }

      if (phase === "boss") {
        if (!state.boss) spawnBoss();
        state.miniAcc += dt;
        if (state.miniAcc >= 1600) {
          state.miniAcc = 0;
          spawnMiniUfo();
        }
      } else if (phase === "saucers") {
        const sw = state.saucerWave;
        if (prevPhase !== "saucers" && sw.stage === "idle") {
          beginSaucerWave();
        }
        sw.timer -= dt;
        if (sw.stage === "active") {
          if (countType("saucer") === 0) {
            completeSaucerWave(180);
          } else if (sw.timer <= 0) {
            exitSaucerWave();
          }
        } else if (sw.stage === "exiting") {
          if (countType("saucer") === 0 || sw.timer <= 0) {
            completeSaucerWave(240);
          }
        } else if (sw.stage === "gap" && sw.timer <= 0) {
          beginSaucerWave();
        }
      } else {
        const diff = difficulty();
        const interval =
          phase === "targets"
            ? diff.spawn * 0.62
            : phase === "cans"
              ? diff.spawn * 1.8
              : phase === "fruit"
                ? diff.spawn * 1.75
                : diff.spawn;
        state.spawnAcc += dt;
        while (state.spawnAcc >= interval) {
          state.spawnAcc -= interval;
          spawnForPhase();
        }
      }

      if (phase !== "boss") {
        state.flybyAcc += dt;
        if (state.flybyAcc >= 11000) {
          state.flybyAcc = 0;
          spawnFlyby();
        }
      }

      if (!state.night && !state.targets.some((t) => t.type === "sun")) {
        // sun can be re-offered mid-run if somehow missing before night
        if (!state.sunSpawned) spawnSun();
      }

      updateTargets(dt);
      updateHud();
    } else if (state.mode === "idle") {
      tickTitleDemo(dt);
    } else if (state.mode === "dead") {
      if (state.boss) updateTargets(dt * 0.6);
      else tickTitleDemo(dt);
    }

    updateFx(dt);
  }

  /* —— draw —— */
  function drawBuildingLayer(ctx, buildings, colorPair, night, litStrength, windowGap) {
    const color = rgbStr(mixColor(colorPair.day, colorPair.night, night));
    for (const b of buildings) {
      const x = b.x * state.w;
      const w = b.w * state.w;
      const hgt = b.h * state.h;
      const topY = state.h - hgt;
      ctx.fillStyle = color;
      ctx.fillRect(x, topY, w, hgt);

      const cols = Math.max(2, Math.floor(w / windowGap));
      const rows = Math.max(2, Math.floor(hgt / (windowGap * 1.3)));
      const padX = w / cols;
      const padY = hgt / rows;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const seed = (b.seed * 13 + r * 7 + c * 5) % 11;
          if (seed > 3) continue;
          const wx = x + c * padX + padX * 0.28;
          const wy = topY + r * padY + padY * 0.28;
          const ww = padX * 0.44;
          const wh = padY * 0.44;
          const tw = 0.75 + 0.25 * Math.sin(state.elapsed * 0.0006 + seed * 1.7 + b.seed);
          ctx.globalAlpha = litStrength * tw * (0.35 + night * 0.65);
          ctx.fillStyle = seed === 0 ? "#ffe9a8" : "#ffd27a";
          ctx.fillRect(wx, wy, ww, wh);
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawCitySkyline(ctx, theme, night) {
    drawBuildingLayer(ctx, state.cityFar, theme.farColor, night, 0.5, 14);
    drawBuildingLayer(ctx, state.cityNear, theme.nearColor, night, 0.85, 9);
    if (state.cityBeacon) {
      const bx = state.cityBeacon.x * state.w;
      const by = state.h - state.cityBeacon.h * state.h - 6;
      ctx.save();
      ctx.globalAlpha = Math.sin(state.elapsed * 0.004) > 0.3 ? 0.95 : 0.15;
      ctx.fillStyle = "#ff5a5a";
      ctx.beginPath();
      ctx.arc(bx, by, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Distinct rooftop architecture: water tower, spire, and mechanical units.
    const towerX = state.w * 0.18;
    const towerY = state.h * 0.35;
    const towerW = Math.min(62, state.w * 0.07);
    ctx.fillStyle = "rgba(16,21,34,0.92)";
    ctx.beginPath();
    ctx.ellipse(towerX, towerY, towerW * 0.5, towerW * 0.16, 0, Math.PI, 0);
    ctx.fillRect(towerX - towerW * 0.5, towerY, towerW, towerW * 0.45);
    ctx.beginPath();
    ctx.ellipse(
      towerX,
      towerY + towerW * 0.45,
      towerW * 0.5,
      towerW * 0.16,
      0,
      0,
      Math.PI
    );
    ctx.fill();
    ctx.strokeStyle = "rgba(9,13,24,0.94)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(towerX - towerW * 0.36, towerY + towerW * 0.46);
    ctx.lineTo(towerX - towerW * 0.46, towerY + towerW * 1.18);
    ctx.moveTo(towerX + towerW * 0.36, towerY + towerW * 0.46);
    ctx.lineTo(towerX + towerW * 0.46, towerY + towerW * 1.18);
    ctx.moveTo(towerX - towerW * 0.42, towerY + towerW * 0.78);
    ctx.lineTo(towerX + towerW * 0.42, towerY + towerW * 0.78);
    ctx.stroke();

    const spireX = state.w * 0.73;
    const spireBase = state.h * 0.64;
    const spireW = Math.min(92, state.w * 0.09);
    ctx.fillStyle = "rgba(13,18,34,0.94)";
    ctx.beginPath();
    ctx.moveTo(spireX - spireW * 0.5, spireBase);
    ctx.lineTo(spireX - spireW * 0.34, state.h * 0.34);
    ctx.lineTo(spireX, state.h * 0.23);
    ctx.lineTo(spireX + spireW * 0.34, state.h * 0.34);
    ctx.lineTo(spireX + spireW * 0.5, spireBase);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(88,172,205,0.28)";
    ctx.lineWidth = 1.5;
    for (let y = state.h * 0.38; y < spireBase; y += 17) {
      ctx.beginPath();
      ctx.moveTo(spireX - spireW * 0.28, y);
      ctx.lineTo(spireX + spireW * 0.28, y);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(9,13,24,0.95)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(spireX, state.h * 0.23);
    ctx.lineTo(spireX, state.h * 0.15);
    ctx.stroke();
    ctx.fillStyle = Math.sin(state.elapsed * 0.006) > 0 ? "#f05263" : "#66202c";
    ctx.beginPath();
    ctx.arc(spireX, state.h * 0.15, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(19,25,39,0.9)";
    [
      [0.46, 0.6, 0.075],
      [0.86, 0.57, 0.06],
    ].forEach(([fx, fy, fw], i) => {
      const x = state.w * fx;
      const y = state.h * fy;
      const w = state.w * fw;
      ctx.fillRect(x, y, w, 22 + i * 4);
      ctx.strokeStyle = "rgba(102,132,150,0.32)";
      ctx.lineWidth = 1;
      for (let stripe = 1; stripe < 4; stripe++) {
        ctx.beginPath();
        ctx.moveTo(x + (w * stripe) / 4, y + 4);
        ctx.lineTo(x + (w * stripe) / 4, y + 18 + i * 4);
        ctx.stroke();
      }
    });

    const haze = ctx.createLinearGradient(0, state.h * 0.5, 0, state.h * 0.72);
    haze.addColorStop(0, "rgba(86,117,141,0)");
    haze.addColorStop(1, "rgba(86,117,141,0.18)");
    ctx.fillStyle = haze;
    ctx.fillRect(0, state.h * 0.5, state.w, state.h * 0.22);

    // Wet elevated roadway and animated traffic trails.
    const roadTop = state.h * 0.79;
    const road = ctx.createLinearGradient(0, roadTop, 0, state.h);
    road.addColorStop(0, "rgba(12,14,26,0.88)");
    road.addColorStop(1, "rgba(4,6,14,0.98)");
    ctx.fillStyle = road;
    ctx.fillRect(0, roadTop, state.w, state.h - roadTop);

    ctx.strokeStyle = "rgba(115,190,225,0.2)";
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 5; i++) {
      const y = roadTop + 14 + i * ((state.h - roadTop) / 5);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(state.w, y + i * 2);
      ctx.stroke();
    }

    const trafficOffset = (state.elapsed * 0.16) % (state.w + 260);
    for (let i = 0; i < 7; i++) {
      const direction = i % 2 ? 1 : -1;
      const rawX = direction > 0 ? trafficOffset + i * 170 : state.w - trafficOffset + i * 170;
      const x = ((rawX % (state.w + 260)) + state.w + 260) % (state.w + 260) - 130;
      const y = roadTop + 22 + (i % 3) * 29;
      const color = i % 2 ? "#ff3f7f" : "#48dfff";
      const trail = ctx.createLinearGradient(x - direction * 90, y, x, y);
      trail.addColorStop(0, "rgba(0,0,0,0)");
      trail.addColorStop(1, color);
      ctx.strokeStyle = trail;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x - direction * 90, y);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Rooftop antenna silhouettes.
    ctx.strokeStyle = "rgba(6,8,18,0.9)";
    ctx.lineWidth = 3;
    [0.07, 0.39, 0.9].forEach((p, i) => {
      const x = state.w * p;
      const y = state.h * (0.48 - i * 0.045);
      ctx.beginPath();
      ctx.moveTo(x, y + 48);
      ctx.lineTo(x, y);
      ctx.moveTo(x - 12, y + 12);
      ctx.lineTo(x + 12, y + 12);
      ctx.stroke();
      ctx.fillStyle = Math.sin(state.elapsed * 0.006 + i) > 0 ? "#ff4e68" : "#621d32";
      ctx.beginPath();
      ctx.arc(x, y, 2.8, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawHillLayer(ctx, colorPair, night, path, snowCap) {
    ctx.fillStyle = rgbStr(mixColor(colorPair.day, colorPair.night, night));
    ctx.beginPath();
    ctx.moveTo(0, state.h * path.startY);
    ctx.quadraticCurveTo(state.w * path.c1x, state.h * path.c1y, state.w * path.midX, state.h * path.midY);
    ctx.quadraticCurveTo(state.w * path.c2x, state.h * path.c2y, state.w, state.h * path.endY);
    ctx.lineTo(state.w, state.h);
    ctx.lineTo(0, state.h);
    ctx.fill();
    if (snowCap) {
      ctx.save();
      ctx.strokeStyle = "rgba(255,255,255,0.8)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, state.h * path.startY);
      ctx.quadraticCurveTo(state.w * path.c1x, state.h * path.c1y, state.w * path.midX, state.h * path.midY);
      ctx.quadraticCurveTo(state.w * path.c2x, state.h * path.c2y, state.w, state.h * path.endY);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawClouds(ctx, night) {
    if (night >= 0.85) return;
    ctx.save();
    ctx.globalAlpha = 1 - night * 0.9;
    ctx.fillStyle = "rgba(255,255,255,0.42)";
    const drift = (state.elapsed * 0.008) % (state.w + 200);
    [
      [100, 64, 36],
      [340, 92, 28],
      [580, 50, 44],
      [820, 84, 26],
    ].forEach(([cx, cy, r], i) => {
      const x = ((cx - drift * (0.25 + i * 0.04)) % (state.w + 160)) - 80;
      ctx.beginPath();
      ctx.arc(x, cy, r, 0, Math.PI * 2);
      ctx.arc(x + r * 0.7, cy + 5, r * 0.65, 0, Math.PI * 2);
      ctx.arc(x - r * 0.55, cy + 6, r * 0.55, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  function drawMeadowLandscape(ctx, theme, night) {
    drawHillLayer(ctx, theme.hillFar, night, HILL_FAR_PATH, false);
    drawHillLayer(ctx, theme.hillNear, night, HILL_NEAR_PATH, false);

    const horizon = state.h * 0.72;
    const ground = ctx.createLinearGradient(0, horizon, 0, state.h);
    ground.addColorStop(0, rgbStr(mixColor([116, 166, 82], [40, 68, 46], night)));
    ground.addColorStop(1, rgbStr(mixColor([68, 128, 58], [22, 48, 34], night)));
    ctx.fillStyle = ground;
    ctx.fillRect(0, horizon, state.w, state.h - horizon);

    ctx.save();
    ctx.globalAlpha = 0.22 * (1 - night * 0.45);
    ctx.strokeStyle = "#f4e7a0";
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      const y = horizon + 14 + i * ((state.h - horizon) / 8);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.quadraticCurveTo(state.w * 0.45, y - 12, state.w, y + 4);
      ctx.stroke();
    }
    ctx.restore();

    // A winding creek adds depth without competing with targets.
    const water = ctx.createLinearGradient(0, horizon, 0, state.h);
    water.addColorStop(0, "rgba(188,225,231,0.7)");
    water.addColorStop(1, "rgba(73,145,170,0.82)");
    ctx.fillStyle = water;
    ctx.beginPath();
    ctx.moveTo(state.w * 0.58, horizon);
    ctx.bezierCurveTo(
      state.w * 0.7,
      state.h * 0.8,
      state.w * 0.38,
      state.h * 0.87,
      state.w * 0.48,
      state.h
    );
    ctx.lineTo(state.w * 0.72, state.h);
    ctx.bezierCurveTo(
      state.w * 0.58,
      state.h * 0.88,
      state.w * 0.78,
      state.h * 0.8,
      state.w * 0.63,
      horizon
    );
    ctx.closePath();
    ctx.fill();

    // Barn and silo.
    const bx = state.w * 0.78;
    const by = horizon - Math.min(42, state.h * 0.08);
    const bw = Math.min(82, state.w * 0.105);
    const bh = Math.min(48, state.h * 0.085);
    ctx.fillStyle = rgbStr(mixColor([169, 54, 45], [72, 42, 44], night));
    ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = rgbStr(mixColor([112, 35, 31], [40, 28, 32], night));
    ctx.beginPath();
    ctx.moveTo(bx - 8, by);
    ctx.lineTo(bx + bw * 0.5, by - bh * 0.65);
    ctx.lineTo(bx + bw + 8, by);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = night > 0.5 ? "#ffd978" : "#ede4cd";
    ctx.fillRect(bx + bw * 0.42, by + bh * 0.36, bw * 0.18, bh * 0.64);

    const siloX = bx + bw + 12;
    ctx.fillStyle = rgbStr(mixColor([176, 184, 178], [64, 72, 78], night));
    ctx.fillRect(siloX, by - 5, bw * 0.26, bh + 5);
    ctx.beginPath();
    ctx.arc(siloX + bw * 0.13, by - 5, bw * 0.13, Math.PI, 0);
    ctx.fill();

    // Animated windmill.
    const wx = state.w * 0.16;
    const wy = horizon - 10;
    const mastH = Math.min(92, state.h * 0.17);
    ctx.strokeStyle = rgbStr(mixColor([104, 94, 78], [50, 52, 55], night));
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(wx - 14, wy);
    ctx.lineTo(wx, wy - mastH);
    ctx.lineTo(wx + 14, wy);
    ctx.stroke();
    ctx.save();
    ctx.translate(wx, wy - mastH);
    ctx.rotate(state.elapsed * 0.00035);
    for (let i = 0; i < 4; i++) {
      ctx.rotate(Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -28);
      ctx.lineTo(7, -12);
      ctx.closePath();
      ctx.stroke();
    }
    ctx.restore();

    // Foreground fence and small flower clusters.
    const fenceY = state.h * 0.88;
    ctx.strokeStyle = rgbStr(mixColor([218, 201, 158], [86, 79, 72], night));
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(0, fenceY);
    ctx.lineTo(state.w * 0.34, fenceY - 12);
    ctx.moveTo(0, fenceY + 28);
    ctx.lineTo(state.w * 0.34, fenceY + 16);
    ctx.stroke();
    for (let i = 0; i < 5; i++) {
      const x = i * state.w * 0.08;
      ctx.fillStyle = rgbStr(mixColor([188, 166, 122], [70, 66, 62], night));
      ctx.fillRect(x, fenceY - 25 - i * 2, 7, 72);
    }
    const flowerColors = ["#f8dd68", "#f18a9b", "#e8e9ff", "#8fd6ef"];
    for (let i = 0; i < 26; i++) {
      const x = ((i * 83) % 997) / 997 * state.w;
      const y = horizon + 16 + (((i * 47) % 101) / 101) * (state.h - horizon - 18);
      ctx.globalAlpha = (0.35 + (i % 4) * 0.12) * (1 - night * 0.65);
      ctx.fillStyle = flowerColors[i % flowerColors.length];
      ctx.beginPath();
      ctx.arc(x, y, 1.5 + (i % 3) * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawAuroraLandscape(ctx, night) {
    const horizon = state.h * 0.63;

    // Jagged arctic mountains with separate snow faces.
    const peaks = [
      [0, 0.64], [0.1, 0.42], [0.2, 0.6], [0.34, 0.32], [0.46, 0.61],
      [0.59, 0.4], [0.69, 0.58], [0.82, 0.29], [0.93, 0.55], [1, 0.45],
    ];
    ctx.fillStyle = rgbStr(mixColor([29, 57, 76], [14, 24, 44], night));
    ctx.beginPath();
    ctx.moveTo(0, horizon);
    for (const [x, y] of peaks) ctx.lineTo(state.w * x, state.h * y);
    ctx.lineTo(state.w, horizon);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = `rgba(205,232,240,${0.58 - night * 0.18})`;
    for (let i = 1; i < peaks.length - 1; i += 2) {
      const [x, y] = peaks[i];
      const px = state.w * x;
      const py = state.h * y;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px - state.w * 0.045, py + state.h * 0.09);
      ctx.lineTo(px - state.w * 0.012, py + state.h * 0.07);
      ctx.lineTo(px + state.w * 0.024, py + state.h * 0.11);
      ctx.closePath();
      ctx.fill();
    }

    // Frozen lake with moving aurora reflections.
    const ice = ctx.createLinearGradient(0, horizon, 0, state.h);
    ice.addColorStop(0, "rgba(38,79,94,0.96)");
    ice.addColorStop(0.45, "rgba(58,104,116,0.96)");
    ice.addColorStop(1, "rgba(152,190,194,0.96)");
    ctx.fillStyle = ice;
    ctx.fillRect(0, horizon, state.w, state.h - horizon);
    ctx.save();
    ctx.globalAlpha = 0.18 + night * 0.14;
    for (let i = 0; i < 7; i++) {
      const x = state.w * (0.08 + i * 0.145) + Math.sin(state.elapsed * 0.0004 + i) * 18;
      const reflection = ctx.createLinearGradient(x, horizon, x, state.h);
      reflection.addColorStop(0, i % 2 ? "#70f3c0" : "#ad8cff");
      reflection.addColorStop(1, "rgba(80,210,190,0)");
      ctx.fillStyle = reflection;
      ctx.beginPath();
      ctx.moveTo(x - 14, horizon);
      ctx.lineTo(x + 14, horizon);
      ctx.lineTo(x + 50, state.h);
      ctx.lineTo(x - 50, state.h);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    ctx.strokeStyle = "rgba(220,245,248,0.28)";
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 9; i++) {
      const x = ((i * 137) % 941) / 941 * state.w;
      const y = horizon + 22 + (i % 4) * 34;
      ctx.beginPath();
      ctx.moveTo(x - 44, y);
      ctx.lineTo(x, y + 8);
      ctx.lineTo(x + 24, y - 5);
      ctx.lineTo(x + 60, y + 4);
      ctx.stroke();
    }
  }

  function drawPine(ctx, x, baseY, size, color, snow) {
    ctx.fillStyle = color;
    ctx.fillRect(x - size * 0.05, baseY - size * 0.4, size * 0.1, size * 0.4);
    for (let i = 0; i < 3; i++) {
      const y = baseY - size * (0.32 + i * 0.22);
      const half = size * (0.28 - i * 0.045);
      ctx.beginPath();
      ctx.moveTo(x, y - size * 0.38);
      ctx.lineTo(x - half, y);
      ctx.lineTo(x + half, y);
      ctx.closePath();
      ctx.fill();
      if (snow) {
        ctx.strokeStyle = "rgba(240,247,250,0.78)";
        ctx.lineWidth = Math.max(1.5, size * 0.025);
        ctx.beginPath();
        ctx.moveTo(x - half * 0.8, y - 2);
        ctx.quadraticCurveTo(x, y + 4, x + half * 0.8, y - 2);
        ctx.stroke();
      }
    }
  }

  function drawWinterLandscape(ctx, night) {
    const horizon = state.h * 0.68;

    // Distant mountains and layered snowbanks.
    ctx.fillStyle = rgbStr(mixColor([137, 157, 173], [40, 53, 70], night));
    ctx.beginPath();
    ctx.moveTo(0, horizon);
    ctx.lineTo(state.w * 0.13, state.h * 0.48);
    ctx.lineTo(state.w * 0.25, state.h * 0.62);
    ctx.lineTo(state.w * 0.4, state.h * 0.39);
    ctx.lineTo(state.w * 0.55, state.h * 0.64);
    ctx.lineTo(state.w * 0.74, state.h * 0.43);
    ctx.lineTo(state.w, horizon);
    ctx.closePath();
    ctx.fill();

    const snow = ctx.createLinearGradient(0, horizon, 0, state.h);
    snow.addColorStop(0, rgbStr(mixColor([225, 234, 238], [84, 98, 112], night)));
    snow.addColorStop(1, rgbStr(mixColor([180, 204, 216], [45, 60, 75], night)));
    ctx.fillStyle = snow;
    ctx.beginPath();
    ctx.moveTo(0, horizon);
    ctx.quadraticCurveTo(state.w * 0.22, horizon - 22, state.w * 0.48, horizon + 10);
    ctx.quadraticCurveTo(state.w * 0.72, horizon + 38, state.w, horizon - 6);
    ctx.lineTo(state.w, state.h);
    ctx.lineTo(0, state.h);
    ctx.closePath();
    ctx.fill();

    // Pine forest silhouettes create parallax depth.
    const farPines = [0.04, 0.11, 0.18, 0.27, 0.36, 0.46, 0.56, 0.67, 0.76, 0.87, 0.95];
    farPines.forEach((p, i) =>
      drawPine(
        ctx,
        state.w * p,
        horizon + 18 + (i % 3) * 8,
        54 + (i % 4) * 9,
        rgbStr(mixColor([67, 91, 92], [24, 38, 48], night)),
        true
      )
    );

    // Warm lodge with chimney smoke.
    const cw = Math.min(125, state.w * 0.16);
    const ch = Math.min(64, state.h * 0.11);
    const cx = state.w * 0.7;
    const cy = horizon + 34;
    ctx.fillStyle = rgbStr(mixColor([111, 69, 46], [49, 39, 38], night));
    ctx.fillRect(cx, cy, cw, ch);
    ctx.fillStyle = rgbStr(mixColor([63, 52, 48], [26, 28, 34], night));
    ctx.beginPath();
    ctx.moveTo(cx - 12, cy);
    ctx.lineTo(cx + cw * 0.5, cy - ch * 0.58);
    ctx.lineTo(cx + cw + 12, cy);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ffd078";
    ctx.globalAlpha = 0.72 + night * 0.28;
    ctx.fillRect(cx + cw * 0.18, cy + ch * 0.25, cw * 0.18, ch * 0.24);
    ctx.fillRect(cx + cw * 0.64, cy + ch * 0.25, cw * 0.18, ch * 0.24);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#463b37";
    ctx.fillRect(cx + cw * 0.73, cy - ch * 0.62, cw * 0.1, ch * 0.35);
    for (let i = 0; i < 4; i++) {
      const smokeY = cy - ch * 0.78 - i * 15;
      const smokeX = cx + cw * 0.78 + Math.sin(state.elapsed * 0.0007 + i) * (5 + i * 2);
      ctx.fillStyle = `rgba(225,232,236,${0.22 - i * 0.035})`;
      ctx.beginPath();
      ctx.arc(smokeX, smokeY, 7 + i * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    const nearPines = [0.02, 0.22, 0.51, 0.93];
    nearPines.forEach((p, i) =>
      drawPine(
        ctx,
        state.w * p,
        state.h + 12,
        105 + (i % 2) * 24,
        rgbStr(mixColor([31, 65, 62], [12, 28, 35], night)),
        true
      )
    );

    // Wind streaks sell the active snowstorm.
    ctx.strokeStyle = "rgba(245,250,252,0.24)";
    ctx.lineWidth = 1.5;
    const drift = (state.elapsed * 0.08) % (state.w + 180);
    for (let i = 0; i < 12; i++) {
      const x = ((i * 103 + drift) % (state.w + 180)) - 90;
      const y = 45 + ((i * 71) % Math.max(80, state.h - 110));
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 24, y + 7);
      ctx.stroke();
    }
  }

  function drawSkyBirds(ctx, night) {
    if (night >= 0.85) return;
    ctx.save();
    ctx.globalAlpha = (1 - night * 0.9) * 0.55;
    ctx.strokeStyle = "rgba(30,30,40,0.6)";
    ctx.lineWidth = 2;
    const drift = (state.elapsed * 0.01) % (state.w + 200);
    [
      [0.12, 0.14, 1],
      [0.2, 0.1, 0.7],
      [0.62, 0.2, 1.15],
      [0.7, 0.16, 0.8],
    ].forEach(([fx, fy, scale], i) => {
      const x = ((fx * state.w + drift * (0.3 + i * 0.05)) % (state.w + 120)) - 60;
      const y = state.h * fy + Math.sin(state.elapsed * 0.001 + i) * 6;
      const s = 7 * scale;
      ctx.beginPath();
      ctx.moveTo(x - s, y);
      ctx.quadraticCurveTo(x - s * 0.4, y - s * 0.6, x, y);
      ctx.quadraticCurveTo(x + s * 0.4, y - s * 0.6, x + s, y);
      ctx.stroke();
    });
    ctx.restore();
  }

  function drawAuroraRibbons(ctx, night) {
    ctx.save();
    ctx.globalAlpha = 0.62 + night * 0.38;
    const bands = [
      { color: "rgba(120,255,180,0.32)", amp: 26, freq: 0.012, yBase: 0.14, speed: 0.00018 },
      { color: "rgba(160,120,255,0.26)", amp: 34, freq: 0.009, yBase: 0.2, speed: -0.00014 },
      { color: "rgba(120,200,255,0.2)", amp: 20, freq: 0.015, yBase: 0.1, speed: 0.00022 },
    ];
    for (const b of bands) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      for (let x = 0; x <= state.w; x += 24) {
        const y = state.h * b.yBase + Math.sin(x * b.freq + state.elapsed * b.speed) * b.amp;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(state.w, 0);
      ctx.closePath();
      ctx.fillStyle = b.color;
      ctx.fill();
    }
    ctx.restore();
  }

  function shadeColor(hex, percent) {
    const num = parseInt(hex.slice(1), 16);
    const clamp255 = (v) => Math.max(0, Math.min(255, v));
    const r = clamp255((num >> 16) + percent);
    const g = clamp255(((num >> 8) & 0xff) + percent);
    const b = clamp255((num & 0xff) + percent);
    return `rgb(${r},${g},${b})`;
  }

  function drawMoon(ctx, theme, night) {
    const mx = state.w * 0.18;
    const my = state.h * 0.16;
    const r = 26;
    ctx.save();
    ctx.globalAlpha = night;

    const body = ctx.createRadialGradient(mx - r * 0.35, my - r * 0.35, r * 0.15, mx, my, r);
    body.addColorStop(0, "#fffdf4");
    body.addColorStop(0.55, theme.moon);
    body.addColorStop(1, shadeColor(theme.moon, -26));
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.arc(mx, my, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.clip();
    ctx.globalAlpha = night * 0.16;
    ctx.fillStyle = shadeColor(theme.moon, -40);
    [
      [-0.32, -0.12, 0.24],
      [0.18, 0.28, 0.17],
      [0.34, -0.24, 0.13],
    ].forEach(([ox, oy, rr]) => {
      ctx.beginPath();
      ctx.arc(mx + ox * r, my + oy * r, rr * r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    ctx.restore();
  }

  function drawRetroSunDisc(ctx, theme, night) {
    const cx = state.w * 0.5;
    const cy = state.h * 0.56;
    const r = Math.min(state.w, state.h) * 0.24;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = night > 0.5 ? theme.sunColor.night : theme.sunColor.day;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.fillStyle = "rgba(40,10,50,0.35)";
    for (let i = 0; i < 6; i++) {
      const y = cy - r + r * 0.32 + i * (r * 0.32);
      ctx.fillRect(cx - r, y, r * 2, r * 0.08);
    }
    ctx.restore();
  }

  function drawRetroGrid(ctx, theme, night) {
    const groundTop = state.h * 0.6;
    const g = ctx.createLinearGradient(0, groundTop, 0, state.h);
    g.addColorStop(0, rgbStr(mixColor(theme.ground.day, theme.ground.night, night)));
    g.addColorStop(1, "#05030a");
    ctx.fillStyle = g;
    ctx.fillRect(0, groundTop, state.w, state.h - groundTop);

    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.strokeStyle = theme.gridColorA;
    ctx.lineWidth = 1.5;
    const vanishX = state.w * 0.5;
    const cols = 10;
    for (let i = 0; i <= cols; i++) {
      const t = i / cols;
      const x = vanishX + (t - 0.5) * state.w * 1.6;
      ctx.beginPath();
      ctx.moveTo(vanishX, groundTop);
      ctx.lineTo(x, state.h);
      ctx.stroke();
    }
    ctx.strokeStyle = theme.gridColorB;
    const rows = 6;
    for (let i = 1; i <= rows; i++) {
      const t = i / rows;
      const y = groundTop + (state.h - groundTop) * (t * t);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(state.w, y);
      ctx.stroke();
    }
    ctx.globalAlpha = 0.85;
    ctx.lineWidth = 3;
    ctx.strokeStyle = theme.gridColorA;
    ctx.beginPath();
    ctx.moveTo(0, groundTop);
    ctx.lineTo(state.w, groundTop);
    ctx.stroke();
    ctx.restore();
  }

  function drawRetroArcadeDecor(ctx, theme) {
    const horizon = state.h * 0.6;
    ctx.save();

    // Wireframe mountain range around the striped sun.
    ctx.strokeStyle = "rgba(63,240,255,0.58)";
    ctx.lineWidth = 2;
    ctx.shadowBlur = 9;
    ctx.shadowColor = "#3ff0ff";
    ctx.beginPath();
    ctx.moveTo(0, horizon);
    ctx.lineTo(state.w * 0.11, state.h * 0.43);
    ctx.lineTo(state.w * 0.2, horizon);
    ctx.lineTo(state.w * 0.31, state.h * 0.48);
    ctx.lineTo(state.w * 0.41, horizon);
    ctx.moveTo(state.w * 0.61, horizon);
    ctx.lineTo(state.w * 0.72, state.h * 0.45);
    ctx.lineTo(state.w * 0.81, horizon);
    ctx.lineTo(state.w * 0.91, state.h * 0.4);
    ctx.lineTo(state.w, horizon);
    ctx.stroke();

    // Orbiting neon diamonds and pixel stars.
    const orbit = state.elapsed * 0.00035;
    const ornaments = [
      [0.11, 0.2, 16, "#ff5fd6"],
      [0.84, 0.24, 20, "#3ff0ff"],
      [0.73, 0.11, 10, "#ffd35e"],
    ];
    ornaments.forEach(([fx, fy, size, color], i) => {
      const x = state.w * fx + Math.sin(orbit + i * 2) * 18;
      const y = state.h * fy + Math.cos(orbit * 1.3 + i) * 12;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(orbit * (i % 2 ? -1 : 1));
      ctx.strokeStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 12;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(-size * 0.5, -size * 0.5, size, size);
      ctx.restore();
    });

    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(255,255,255,0.72)";
    for (let i = 0; i < 22; i++) {
      const x = ((i * 149 + state.elapsed * (i % 3 === 0 ? 0.015 : 0)) % (state.w + 40)) - 20;
      const y = 24 + ((i * 67) % Math.max(70, horizon - 50));
      const blink = 0.25 + Math.abs(Math.sin(state.elapsed * 0.002 + i * 1.9)) * 0.75;
      ctx.globalAlpha = blink;
      ctx.fillRect(x, y, i % 4 === 0 ? 3 : 1.5, i % 4 === 0 ? 3 : 1.5);
    }

    // Cabinet-style status rails make the scene feel like a complete level.
    ctx.globalAlpha = 0.65;
    ctx.font = `bold ${Math.max(9, state.h * 0.016)}px SpaceGrotesk, sans-serif`;
    ctx.letterSpacing = "0.12em";
    ctx.fillStyle = theme.gridColorB;
    ctx.textAlign = "left";
    ctx.fillText("SECTOR 06", 24, horizon - 18);
    ctx.textAlign = "right";
    ctx.fillStyle = theme.gridColorA;
    ctx.fillText("INSERT SKILL", state.w - 24, horizon - 18);

    ctx.globalAlpha = 0.12;
    ctx.fillStyle = "#fff";
    for (let y = 0; y < state.h; y += 6) ctx.fillRect(0, y, state.w, 1);
    ctx.restore();
  }

  function drawAutumnLandscape(ctx, theme, night) {
    drawHillLayer(ctx, theme.hillFar, night, HILL_FAR_PATH, false);
    drawHillLayer(ctx, theme.hillNear, night, HILL_NEAR_PATH, false);

    const horizon = state.h * 0.7;
    const valley = ctx.createLinearGradient(0, horizon, 0, state.h);
    valley.addColorStop(0, rgbStr(mixColor([168, 101, 45], [65, 47, 39], night)));
    valley.addColorStop(1, rgbStr(mixColor([102, 62, 35], [37, 31, 31], night)));
    ctx.fillStyle = valley;
    ctx.fillRect(0, horizon, state.w, state.h - horizon);

    // River and covered bridge.
    ctx.fillStyle = night > 0.55 ? "rgba(55,75,84,0.88)" : "rgba(90,145,154,0.78)";
    ctx.beginPath();
    ctx.moveTo(state.w * 0.38, horizon);
    ctx.bezierCurveTo(
      state.w * 0.48,
      state.h * 0.79,
      state.w * 0.67,
      state.h * 0.87,
      state.w * 0.62,
      state.h
    );
    ctx.lineTo(state.w * 0.82, state.h);
    ctx.bezierCurveTo(
      state.w * 0.8,
      state.h * 0.87,
      state.w * 0.54,
      state.h * 0.79,
      state.w * 0.44,
      horizon
    );
    ctx.closePath();
    ctx.fill();

    const bridgeX = state.w * 0.43;
    const bridgeY = state.h * 0.72;
    const bridgeW = Math.min(130, state.w * 0.17);
    const bridgeH = Math.min(54, state.h * 0.09);
    ctx.fillStyle = rgbStr(mixColor([142, 45, 34], [63, 35, 36], night));
    ctx.fillRect(bridgeX, bridgeY, bridgeW, bridgeH);
    ctx.fillStyle = rgbStr(mixColor([92, 35, 29], [35, 27, 31], night));
    ctx.beginPath();
    ctx.moveTo(bridgeX - 8, bridgeY);
    ctx.lineTo(bridgeX + bridgeW * 0.5, bridgeY - bridgeH * 0.42);
    ctx.lineTo(bridgeX + bridgeW + 8, bridgeY);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(24,25,28,0.75)";
    ctx.beginPath();
    ctx.arc(bridgeX + bridgeW * 0.5, bridgeY + bridgeH, bridgeH * 0.46, Math.PI, 0);
    ctx.lineTo(bridgeX + bridgeW * 0.96, bridgeY + bridgeH);
    ctx.closePath();
    ctx.fill();

    // Orchard rows with warm, layered canopies.
    const treeColors = [
      [193, 76, 38],
      [221, 126, 43],
      [167, 55, 35],
      [232, 165, 53],
    ];
    for (let i = 0; i < 13; i++) {
      const row = i % 2;
      const x = ((i * 0.087 + row * 0.03) % 1) * state.w;
      const baseY = horizon + 24 + row * 46;
      const size = 18 + row * 7 + (i % 3) * 2;
      ctx.fillStyle = rgbStr(mixColor([86, 55, 35], [38, 31, 30], night));
      ctx.fillRect(x - 3, baseY - size * 0.3, 6, size * 1.2);
      for (let j = 0; j < 4; j++) {
        const color = treeColors[(i + j) % treeColors.length];
        ctx.fillStyle = rgbStr(mixColor(color, [56, 39, 38], night));
        ctx.beginPath();
        ctx.arc(
          x + Math.cos(j * Math.PI * 0.5) * size * 0.38,
          baseY - size * 0.72 + Math.sin(j * Math.PI * 0.5) * size * 0.22,
          size * 0.55,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }

    // Pumpkin patch in the foreground.
    for (let i = 0; i < 9; i++) {
      const x = state.w * (0.05 + i * 0.105);
      const y = state.h * (0.91 + (i % 2) * 0.035);
      const r = 8 + (i % 3) * 2;
      ctx.fillStyle = rgbStr(mixColor([224, 105, 27], [91, 54, 39], night));
      ctx.beginPath();
      ctx.ellipse(x, y, r, r * 0.72, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(92,50,27,0.48)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y - r * 0.65);
      ctx.lineTo(x, y + r * 0.65);
      ctx.stroke();
      ctx.fillStyle = "#536b32";
      ctx.fillRect(x - 1.5, y - r - 4, 3, 6);
    }

    // Migrating geese silhouettes.
    ctx.strokeStyle = `rgba(45,34,31,${0.55 - night * 0.2})`;
    ctx.lineWidth = 2;
    const flockX = (state.elapsed * 0.012) % (state.w + 180) - 90;
    for (let i = 0; i < 7; i++) {
      const x = flockX - Math.abs(i - 3) * 18;
      const y = 76 + Math.abs(i - 3) * 11;
      ctx.beginPath();
      ctx.moveTo(x - 7, y);
      ctx.quadraticCurveTo(x - 3, y - 5, x, y);
      ctx.quadraticCurveTo(x + 3, y - 5, x + 7, y);
      ctx.stroke();
    }
  }

  function drawParticles(ctx, theme, night) {
    const kind = theme.particle.type;
    const alwaysOn = theme.particle.mode === "always";
    if (!alwaysOn && night <= 0.05) return;
    const baseAlpha = alwaysOn ? 1 : night;
    ctx.save();
    for (const p of state.particles) {
      const sway = kind === "snow" || kind === "leaf" ? Math.sin(state.elapsed * 0.0015 * p.sway + p.tw) * 14 : 0;
      const px = p.x * state.w + sway;
      const py = p.y * state.h;
      if (kind === "star" || kind === "glint") {
        const tw = 0.4 + 0.6 * Math.abs(Math.sin(state.elapsed * p.sp + p.tw));
        ctx.globalAlpha = baseAlpha * tw * (kind === "glint" ? 0.5 : 1);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(px, py, p.r, 0, Math.PI * 2);
        ctx.fill();
      } else if (kind === "snow") {
        ctx.globalAlpha = baseAlpha * 0.85;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(px, py, p.r, 0, Math.PI * 2);
        ctx.fill();
      } else if (kind === "rain") {
        ctx.globalAlpha = baseAlpha * 0.34;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px - p.r * 0.35, py + p.r);
        ctx.stroke();
      } else if (kind === "leaf") {
        ctx.globalAlpha = baseAlpha * 0.9;
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.r, p.r * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
    ctx.restore();
  }

  function drawBackground(ctx) {
    const theme = state.bgTheme || BACKGROUND_THEMES[0];
    const night = state.nightBlend;
    const [dTop, dMid, dLow, dBot] = theme.sky.day;
    const [nTop, nMid, nLow, nBot] = theme.sky.night;

    const g = ctx.createLinearGradient(0, 0, 0, state.h);
    g.addColorStop(0, rgbStr(mixColor(dTop, nTop, night)));
    g.addColorStop(0.42, rgbStr(mixColor(dMid, nMid, night)));
    g.addColorStop(0.7, rgbStr(mixColor(dLow, nLow, night)));
    g.addColorStop(1, rgbStr(mixColor(dBot, nBot, night)));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, state.w, state.h);

    if (theme.id === "aurora") drawAuroraRibbons(ctx, night);
    if (theme.id === "retro") drawRetroSunDisc(ctx, theme, night);

    if (night > 0.05 && theme.id !== "retro") drawMoon(ctx, theme, night);

    if (theme.id === "retro") {
      drawRetroGrid(ctx, theme, night);
      drawRetroArcadeDecor(ctx, theme);
    } else if (theme.id === "meadow") {
      drawMeadowLandscape(ctx, theme, night);
    } else if (theme.id === "aurora") {
      drawAuroraLandscape(ctx, night);
    } else if (theme.id === "winter") {
      drawWinterLandscape(ctx, night);
    } else if (theme.id === "autumn") {
      drawAutumnLandscape(ctx, theme, night);
    } else {
      drawHillLayer(ctx, theme.hillFar, night, HILL_FAR_PATH, theme.snowCap);
      drawHillLayer(ctx, theme.hillNear, night, HILL_NEAR_PATH, theme.snowCap);
    }

    drawParticles(ctx, theme, night);

    if (theme.id === "meadow") drawClouds(ctx, night);
  }

  function drawBalloon(ctx, t) {
    ctx.save();
    ctx.translate(t.x, t.y);
    ctx.strokeStyle = "rgba(30,40,50,0.4)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(0, t.r * 0.92);
    ctx.quadraticCurveTo(6, t.r + 16, 1, t.r + 36);
    ctx.stroke();
    const g = ctx.createRadialGradient(-t.r * 0.35, -t.r * 0.4, 2, 0, 0, t.r);
    g.addColorStop(0, "#ffffff");
    g.addColorStop(0.18, t.color);
    g.addColorStop(1, t.color);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(0, 0, t.r * 0.82, t.r, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.12)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.beginPath();
    ctx.ellipse(-t.r * 0.28, -t.r * 0.35, t.r * 0.18, t.r * 0.28, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = t.color;
    ctx.beginPath();
    ctx.moveTo(-5, t.r * 0.88);
    ctx.lineTo(5, t.r * 0.88);
    ctx.lineTo(0, t.r * 0.88 + 9);
    ctx.fill();
    ctx.restore();
  }

  function drawBullseye(ctx, t) {
    const s = clamp(t.appear, 0, 1);
    ctx.save();
    ctx.translate(t.x, t.y);
    ctx.scale(s * (t.r / t.maxR), s * (t.r / t.maxR));
    const R = t.maxR;
    ctx.beginPath();
    ctx.arc(0, 4, R * 1.02, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.12)";
    ctx.fill();
    if (t.skull) {
      const rings = ["#1a1a1d", "#d7263d", "#f4f4f4", "#821525"];
      rings.forEach((c, i) => {
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(0, 0, R * (1 - i * 0.2), 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.fillStyle = "#151518";
      ctx.beginPath();
      ctx.arc(0, -R * 0.08, R * 0.38, Math.PI, 0);
      ctx.lineTo(R * 0.32, R * 0.2);
      ctx.lineTo(R * 0.2, R * 0.42);
      ctx.lineTo(-R * 0.2, R * 0.42);
      ctx.lineTo(-R * 0.32, R * 0.2);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#f4f4f4";
      ctx.beginPath();
      ctx.arc(-R * 0.15, 0, R * 0.095, 0, Math.PI * 2);
      ctx.arc(R * 0.15, 0, R * 0.095, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0, R * 0.08);
      ctx.lineTo(-R * 0.07, R * 0.2);
      ctx.lineTo(R * 0.07, R * 0.2);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#f4f4f4";
      ctx.lineWidth = Math.max(2, R * 0.06);
      for (let x = -0.14; x <= 0.14; x += 0.14) {
        ctx.beginPath();
        ctx.moveTo(R * x, R * 0.25);
        ctx.lineTo(R * x, R * 0.42);
        ctx.stroke();
      }
    } else if (t.penalty) {
      const rings = ["#8f1725", "#f4f4f4", "#d7263d", "#f4f4f4", "#b51f31"];
      rings.forEach((c, i) => {
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(0, 0, R * (1 - i * 0.17), 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.strokeStyle = "#161619";
      ctx.lineWidth = Math.max(5, R * 0.16);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-R * 0.34, -R * 0.34);
      ctx.lineTo(R * 0.34, R * 0.34);
      ctx.moveTo(R * 0.34, -R * 0.34);
      ctx.lineTo(-R * 0.34, R * 0.34);
      ctx.stroke();

      ctx.fillStyle = "#8f1725";
      ctx.font = `bold ${Math.floor(R * 0.3)}px SpaceGrotesk, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("-5", 0, R * 0.86);
    } else {
      const rings = t.gold
        ? ["#f0c14a", "#fff4c2", "#e09a14", "#fff", "#c9840a"]
        : ["#1f1f1f", "#f2f2f2", "#1f1f1f", "#f2f2f2", "#e44747"];
      rings.forEach((c, i) => {
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(0, 0, R * (1 - i * 0.17), 0, Math.PI * 2);
        ctx.fill();
      });
    }
    ctx.restore();
  }

  function drawCan(ctx, t) {
    ctx.save();
    ctx.translate(t.x, t.y);
    ctx.rotate(t.rot);
    const w = t.r * 1.15;
    const h = t.r * 1.7;
    ctx.fillStyle = "rgba(0,0,0,0.15)";
    ctx.beginPath();
    ctx.ellipse(2, h * 0.45, w * 0.9, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    const body = ctx.createLinearGradient(-w, 0, w, 0);
    body.addColorStop(0, "#8a8f94");
    body.addColorStop(0.2, "#d7dbe0");
    body.addColorStop(0.5, "#f4f6f8");
    body.addColorStop(0.8, "#c5cad0");
    body.addColorStop(1, "#7e848a");
    ctx.fillStyle = body;
    ctx.fillRect(-w * 0.7, -h * 0.55, w * 1.4, h);
    ctx.fillStyle = t.tint;
    ctx.fillRect(-w * 0.7, -h * 0.18, w * 1.4, h * 0.4);
    ctx.fillStyle = "#fff";
    ctx.font = `bold ${Math.max(9, t.r * 0.45)}px SpaceGrotesk, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(t.label, 0, h * 0.02);
    ctx.strokeStyle = "rgba(40,45,50,0.35)";
    ctx.lineWidth = 2;
    ctx.strokeRect(-w * 0.7, -h * 0.55, w * 1.4, h);
    ctx.fillStyle = "#eceff2";
    ctx.beginPath();
    ctx.ellipse(0, -h * 0.55, w * 0.7, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    if (t.hp < t.maxHp) {
      ctx.fillStyle = "rgba(255,255,255,0.28)";
      ctx.fillRect(-w * 0.7, -h * 0.55, w * 1.4, h);
    }
    if (t.flash > 0) {
      ctx.fillStyle = `rgba(255,255,255,${0.4 * t.flash})`;
      ctx.fillRect(-w * 0.7, -h * 0.55, w * 1.4, h);
    }
    ctx.restore();
  }

  function drawFruit(ctx, t) {
    ctx.save();
    ctx.translate(t.x, t.y);
    ctx.rotate(t.rot);
    const R = t.r;
    // ground shadow
    ctx.fillStyle = "rgba(0,0,0,0.16)";
    ctx.beginPath();
    ctx.ellipse(3, R * 0.75, R * 0.72, R * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();

    if (t.fruit === "apple") {
      const g = ctx.createRadialGradient(-R * 0.35, -R * 0.4, 2, 0, 0, R);
      g.addColorStop(0, "#ff8a7a");
      g.addColorStop(0.35, "#e23b3b");
      g.addColorStop(0.75, "#b01d1d");
      g.addColorStop(1, "#6e1010");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(-R * 0.12, 0, R * 0.78, R * 0.92, -0.08, 0, Math.PI * 2);
      ctx.ellipse(R * 0.18, 0, R * 0.72, R * 0.9, 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.beginPath();
      ctx.ellipse(-R * 0.28, -R * 0.28, R * 0.18, R * 0.28, -0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#4a2a12";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, -R * 0.72);
      ctx.quadraticCurveTo(R * 0.08, -R * 0.95, R * 0.02, -R * 1.08);
      ctx.stroke();
      ctx.fillStyle = "#3f8f3a";
      ctx.beginPath();
      ctx.ellipse(R * 0.22, -R * 0.88, R * 0.32, R * 0.14, -0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#2d5c28";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(R * 0.05, -R * 0.85);
      ctx.quadraticCurveTo(R * 0.22, -R * 0.88, R * 0.4, -R * 0.82);
      ctx.stroke();
    } else if (t.fruit === "orange") {
      const g = ctx.createRadialGradient(-R * 0.3, -R * 0.35, 3, 0, 0, R);
      g.addColorStop(0, "#ffd089");
      g.addColorStop(0.4, "#f08a24");
      g.addColorStop(1, "#b8550a");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, R, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(160,70,10,0.25)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 18; i++) {
        const a = (i / 18) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(
          Math.cos(a) * R * 0.35,
          Math.sin(a) * R * 0.35,
          R * 0.08,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(255,255,255,0.28)";
      ctx.beginPath();
      ctx.ellipse(-R * 0.28, -R * 0.3, R * 0.16, R * 0.22, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#2f6b28";
      ctx.beginPath();
      ctx.arc(0, -R * 0.92, R * 0.1, 0, Math.PI * 2);
      ctx.fill();
    } else if (t.fruit === "strawberry") {
      const g = ctx.createRadialGradient(-R * 0.2, -R * 0.15, 2, 0, R * 0.1, R);
      g.addColorStop(0, "#ff6b6b");
      g.addColorStop(0.45, "#e0233a");
      g.addColorStop(1, "#8f1020");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(0, -R * 0.55);
      ctx.bezierCurveTo(R * 0.95, -R * 0.35, R * 0.85, R * 0.55, 0, R);
      ctx.bezierCurveTo(-R * 0.85, R * 0.55, -R * 0.95, -R * 0.35, 0, -R * 0.55);
      ctx.fill();
      ctx.fillStyle = "#f0c14a";
      for (let i = 0; i < 12; i++) {
        const px = Math.sin(i * 1.7) * R * 0.45;
        const py = -R * 0.15 + (i % 4) * R * 0.28;
        ctx.beginPath();
        ctx.ellipse(px, py, R * 0.06, R * 0.09, 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "#3f8f3a";
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.ellipse(i * R * 0.16, -R * 0.72, R * 0.16, R * 0.22, i * 0.25, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (t.fruit === "watermelon") {
      const g = ctx.createRadialGradient(-R * 0.25, -R * 0.25, 4, 0, 0, R);
      g.addColorStop(0, "#7fd99a");
      g.addColorStop(0.45, "#2f9e57");
      g.addColorStop(1, "#145c2e");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, R, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.22)";
      ctx.lineWidth = 3;
      for (let i = -3; i <= 3; i++) {
        ctx.beginPath();
        ctx.arc(0, 0, R * 0.82, -0.55 + i * 0.12, 0.55 + i * 0.12);
        ctx.stroke();
      }
      ctx.fillStyle = "#d64545";
      ctx.beginPath();
      ctx.moveTo(-R * 0.15, -R);
      ctx.arc(0, 0, R, -Math.PI * 0.55, Math.PI * 0.55);
      ctx.closePath();
      ctx.globalAlpha = 0.9;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#fff5f5";
      ctx.beginPath();
      ctx.moveTo(-R * 0.05, -R * 0.85);
      ctx.arc(0, 0, R * 0.78, -Math.PI * 0.5, Math.PI * 0.5);
      ctx.closePath();
      ctx.globalAlpha = 0.35;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#1a1a1a";
      for (let i = 0; i < 7; i++) {
        const a = -0.4 + i * 0.14;
        ctx.beginPath();
        ctx.ellipse(Math.cos(a) * R * 0.45, Math.sin(a) * R * 0.45, 2.2, 3.5, a, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (t.fruit === "peach") {
      const g = ctx.createRadialGradient(-R * 0.3, -R * 0.35, 3, R * 0.1, R * 0.1, R);
      g.addColorStop(0, "#ffe0b8");
      g.addColorStop(0.4, "#ff9a6b");
      g.addColorStop(0.75, "#f06a4a");
      g.addColorStop(1, "#c4452e");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(-R * 0.08, 0, R * 0.82, R * 0.9, -0.1, 0, Math.PI * 2);
      ctx.ellipse(R * 0.2, 0, R * 0.7, R * 0.86, 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(140,50,30,0.35)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -R * 0.75);
      ctx.quadraticCurveTo(R * 0.05, 0, 0, R * 0.78);
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.beginPath();
      ctx.ellipse(-R * 0.3, -R * 0.28, R * 0.16, R * 0.24, -0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#4f8a3a";
      ctx.beginPath();
      ctx.ellipse(R * 0.1, -R * 0.9, R * 0.28, R * 0.12, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#5a3a1a";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -R * 0.7);
      ctx.lineTo(0, -R * 0.95);
      ctx.stroke();
    } else if (t.fruit === "grape") {
      const berries = [
        [0, 0],
        [-0.45, 0.15],
        [0.45, 0.15],
        [-0.25, 0.55],
        [0.25, 0.55],
        [0, 0.85],
        [-0.55, -0.25],
        [0.55, -0.25],
        [-0.2, -0.45],
        [0.2, -0.4],
      ];
      for (const [bx, by] of berries) {
        const cx = bx * R * 0.7;
        const cy = by * R * 0.55 - R * 0.15;
        const g = ctx.createRadialGradient(cx - 3, cy - 3, 1, cx, cy, R * 0.32);
        g.addColorStop(0, "#c9a0ff");
        g.addColorStop(0.45, "#7b5ea7");
        g.addColorStop(1, "#3d2a5c");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, R * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.beginPath();
        ctx.arc(cx - R * 0.1, cy - R * 0.1, R * 0.08, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.strokeStyle = "#3f8f3a";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -R * 0.7);
      ctx.lineTo(0, -R * 1.05);
      ctx.stroke();
      ctx.fillStyle = "#4f8a3a";
      ctx.beginPath();
      ctx.ellipse(R * 0.15, -R * 0.95, R * 0.28, R * 0.12, -0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawSaucer(ctx, t, boss) {
    ctx.save();
    const scale = boss && t.teleportIn > 0 ? 0.65 + (1 - t.teleportIn) * 0.35 : 1;
    ctx.translate(t.x, t.y);
    ctx.scale(scale, scale);
    const R = t.r;

    if (t.beam || boss) {
      const beamLength = boss ? 5.5 : 3.8;
      const beamPhase = t.beamPhase || (t.angle || 0) * 2;
      const beamStyle = t.beamStyle || (boss ? "pulse" : "sweep");
      const pulse = 0.62 + Math.sin(beamPhase * 1.8) * 0.28;
      const beamAlpha =
        beamStyle === "strobe"
          ? Math.sin(beamPhase * 5) > -0.15
            ? 0.9
            : 0.2
          : beamStyle === "pulse"
            ? pulse
            : 0.72;
      const sweep = beamStyle === "sweep" ? Math.sin(beamPhase) * R * 0.46 : 0;

      ctx.save();
      ctx.translate(sweep, 0);
      ctx.globalAlpha = beamAlpha;
      const beamPalette = t.palette || UFO_PALETTES[0];
      const bg = ctx.createLinearGradient(0, 0, 0, R * beamLength);
      bg.addColorStop(0, boss ? "rgba(180,120,255,0.46)" : beamPalette.beam[0]);
      bg.addColorStop(0.55, boss ? "rgba(175,115,255,0.22)" : beamPalette.beam[1]);
      bg.addColorStop(1, "rgba(100,230,170,0)");
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.moveTo(-R * 0.35, R * 0.25);
      ctx.lineTo(R * 0.35, R * 0.25);
      ctx.lineTo(R * (boss ? 1.7 : 1.15), R * beamLength);
      ctx.lineTo(-R * (boss ? 1.7 : 1.15), R * beamLength);
      ctx.fill();

      ctx.clip();
      ctx.fillStyle = boss ? "rgba(228,205,255,0.28)" : "rgba(225,255,245,0.34)";
      for (let i = 0; i < 4; i++) {
        const travel = (beamPhase * 0.18 + i / 4) % 1;
        const bandY = R * (0.45 + travel * (beamLength - 0.35));
        ctx.fillRect(-R * 1.8, bandY, R * 3.6, Math.max(2, R * 0.08));
      }
      ctx.restore();
    }

    // shadow
    ctx.fillStyle = "rgba(0,0,0,0.16)";
    ctx.beginPath();
    ctx.ellipse(0, R * 0.55, R * 0.85, R * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();

    // dome
    const domePalette = t.palette || UFO_PALETTES[0];
    const dome = ctx.createRadialGradient(-R * 0.2, -R * 0.45, 2, 0, -R * 0.1, R * 0.55);
    dome.addColorStop(0, "#fff");
    dome.addColorStop(0.35, boss ? "#d7b8ff" : t.gold ? "#fff0b0" : domePalette.domeMid);
    dome.addColorStop(1, boss ? "#6b3fa0" : t.gold ? "#c9a016" : domePalette.domeEdge);
    ctx.fillStyle = dome;
    ctx.beginPath();
    ctx.ellipse(0, -R * 0.12, R * 0.48, R * 0.42, 0, Math.PI, 0);
    ctx.fill();

    // rim / body
    const body = ctx.createLinearGradient(-R, 0, R, 0);
    if (boss) {
      body.addColorStop(0, "#3a2458");
      body.addColorStop(0.35, "#cbb0ef");
      body.addColorStop(0.5, "#f3e9ff");
      body.addColorStop(0.65, "#cbb0ef");
      body.addColorStop(1, "#3a2458");
    } else if (t.gold) {
      body.addColorStop(0, "#8a6a10");
      body.addColorStop(0.5, "#ffe08a");
      body.addColorStop(1, "#8a6a10");
    } else {
      const bodyPalette = t.palette || UFO_PALETTES[0];
      body.addColorStop(0, bodyPalette.body[0]);
      body.addColorStop(0.5, bodyPalette.body[1]);
      body.addColorStop(1, bodyPalette.body[2]);
    }
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.ellipse(0, R * 0.12, R * 1.05, R * 0.34, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.18)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // cabin window
    ctx.fillStyle = boss ? "rgba(255,200,120,0.9)" : "rgba(255,255,255,0.55)";
    ctx.beginPath();
    ctx.ellipse(0, -R * 0.22, R * 0.18, R * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();

    const lights = boss
      ? ["#ff5b5b", "#ffd15a", "#6ee4ff", "#c084fc", "#ff5b5b"]
      : ["#ff5b5b", "#ffd15a", "#5ec8ff"];
    lights.forEach((c, i) => {
      const a = -0.9 + (i / (lights.length - 1)) * 1.8;
      const lightPhase = (t.lightPhase || t.angle || 0) + i * 1.7;
      const lightPulse = 0.42 + (Math.sin(lightPhase) + 1) * 0.29;
      ctx.globalAlpha = lightPulse;
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(
        Math.sin(a) * R * 0.72,
        R * 0.22 + Math.cos(a) * 2,
        (boss ? 5 : 3.6) * (0.82 + lightPulse * 0.3),
        0,
        Math.PI * 2
      );
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    if (boss) {
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, R * 0.12, R * 0.7, R * 0.18, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (t.flash > 0) {
      ctx.fillStyle = `rgba(255,255,255,${0.45 * t.flash})`;
      ctx.beginPath();
      ctx.ellipse(0, R * 0.1, R * 1.1, R * 0.42, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawMeteor(ctx, t) {
    ctx.save();
    for (const p of t.trail) {
      ctx.globalAlpha = p.life * 0.55;
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, t.r * 1.4);
      g.addColorStop(0, "#ffe29a");
      g.addColorStop(0.4, "#ff7a3d");
      g.addColorStop(1, "rgba(255,80,20,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, t.r * (0.5 + p.life * 0.6), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.translate(t.x, t.y);
    ctx.rotate(t.rot);
    const rock = ctx.createRadialGradient(-4, -4, 1, 0, 0, t.r);
    rock.addColorStop(0, "#f0d2a0");
    rock.addColorStop(0.45, "#b56a3a");
    rock.addColorStop(1, "#4a2a18");
    ctx.fillStyle = rock;
    ctx.beginPath();
    ctx.moveTo(-t.r, 0);
    ctx.lineTo(-t.r * 0.3, -t.r * 0.85);
    ctx.lineTo(t.r * 0.55, -t.r * 0.55);
    ctx.lineTo(t.r, t.r * 0.15);
    ctx.lineTo(t.r * 0.2, t.r * 0.85);
    ctx.lineTo(-t.r * 0.55, t.r * 0.45);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.beginPath();
    ctx.arc(-t.r * 0.2, 0, t.r * 0.22, 0, Math.PI * 2);
    ctx.arc(t.r * 0.25, t.r * 0.15, t.r * 0.16, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawSun(ctx, t) {
    ctx.save();
    ctx.translate(t.x, t.y);
    const pulse = 1 + Math.sin(t.pulse || 0) * 0.04;
    ctx.scale(pulse, pulse);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      ctx.strokeStyle = "rgba(255, 210, 90, 0.55)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * (t.r + 4), Math.sin(a) * (t.r + 4));
      ctx.lineTo(Math.cos(a) * (t.r + 16), Math.sin(a) * (t.r + 16));
      ctx.stroke();
    }
    const g = ctx.createRadialGradient(-8, -8, 4, 0, 0, t.r);
    g.addColorStop(0, "#fff6c8");
    g.addColorStop(0.45, "#ffd056");
    g.addColorStop(1, "#f08a1a");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, t.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.beginPath();
    ctx.arc(-t.r * 0.28, -t.r * 0.28, t.r * 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawFlyby(ctx, t) {
    ctx.save();
    ctx.translate(t.x, t.y);
    if (t.kind === "blimp") {
      ctx.scale(t.facing || 1, 1);
      const g = ctx.createLinearGradient(0, -18, 0, 18);
      g.addColorStop(0, "#f7f2e8");
      g.addColorStop(1, "#c9b896");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(0, 0, 36, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#e44747";
      ctx.fillRect(-10, -6, 20, 12);
      ctx.fillStyle = "#5a5044";
      ctx.fillRect(-8, 14, 16, 8);
      ctx.strokeStyle = "rgba(40,40,40,0.35)";
      ctx.beginPath();
      ctx.moveTo(-8, 14);
      ctx.lineTo(-18, 4);
      ctx.moveTo(8, 14);
      ctx.lineTo(18, 4);
      ctx.stroke();
    } else if (t.kind === "rocket") {
      for (const p of t.trail || []) {
        ctx.globalAlpha = p.life * 0.5;
        ctx.fillStyle = "#ff9a4a";
        ctx.beginPath();
        ctx.arc(p.x - t.x, p.y - t.y, 5 * p.life, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = "#e8eef4";
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.lineTo(10, 10);
      ctx.lineTo(-10, 10);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#e44747";
      ctx.beginPath();
      ctx.moveTo(-10, 10);
      ctx.lineTo(-16, 18);
      ctx.lineTo(-4, 10);
      ctx.moveTo(10, 10);
      ctx.lineTo(16, 18);
      ctx.lineTo(4, 10);
      ctx.fill();
      ctx.fillStyle = "#ffd056";
      ctx.beginPath();
      ctx.moveTo(-5, 10);
      ctx.lineTo(0, 22);
      ctx.lineTo(5, 10);
      ctx.fill();
    } else if (t.kind === "kite") {
      ctx.fillStyle = t.color || "#e44747";
      ctx.beginPath();
      ctx.moveTo(0, -16);
      ctx.lineTo(14, 0);
      ctx.lineTo(0, 16);
      ctx.lineTo(-14, 0);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.5)";
      ctx.beginPath();
      ctx.moveTo(0, -16);
      ctx.lineTo(0, 16);
      ctx.moveTo(-14, 0);
      ctx.lineTo(14, 0);
      ctx.stroke();
      ctx.strokeStyle = "rgba(40,40,40,0.35)";
      ctx.beginPath();
      ctx.moveTo(0, 16);
      ctx.quadraticCurveTo(10, 34, 4, 48);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawTarget(ctx, t) {
    if (t.type === "balloon") drawBalloon(ctx, t);
    else if (t.type === "target") drawBullseye(ctx, t);
    else if (t.type === "can") drawCan(ctx, t);
    else if (t.type === "fruit") drawFruit(ctx, t);
    else if (t.type === "saucer" || t.type === "miniufo") drawSaucer(ctx, t, false);
    else if (t.type === "boss") drawSaucer(ctx, t, true);
    else if (t.type === "meteor") drawMeteor(ctx, t);
    else if (t.type === "flyby") drawFlyby(ctx, t);
    else if (t.type === "sun") drawSun(ctx, t);
  }

  function drawFx(ctx) {
    for (const f of state.fx) {
      ctx.globalAlpha = clamp(f.life, 0, 1);
      if (f.kind === "spark") {
        ctx.fillStyle = f.color;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
      } else if (f.kind === "hit") {
        ctx.strokeStyle = f.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = "rgba(255,255,255,0.75)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r * 0.55, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.strokeStyle = "rgba(20,30,40,0.45)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.stroke();
        const s = 7;
        ctx.beginPath();
        ctx.moveTo(f.x - s, f.y - s);
        ctx.lineTo(f.x + s, f.y + s);
        ctx.moveTo(f.x + s, f.y - s);
        ctx.lineTo(f.x - s, f.y + s);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    for (const f of state.floats) {
      ctx.globalAlpha = clamp(f.life, 0, 1);
      ctx.fillStyle = f.color;
      ctx.font = `bold 18px SpaceGrotesk, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(f.text, f.x, f.y);
      ctx.globalAlpha = 1;
    }
  }

  function drawCrosshair(ctx) {
    if (!state.pointer.in || state.mode !== "playing") return;
    const { x, y } = state.pointer;
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.95)";
    ctx.fillStyle = "rgba(232,93,93,0.95)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 14, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - 22, y);
    ctx.lineTo(x - 8, y);
    ctx.moveTo(x + 8, y);
    ctx.lineTo(x + 22, y);
    ctx.moveTo(x, y - 22);
    ctx.lineTo(x, y - 8);
    ctx.moveTo(x, y + 8);
    ctx.lineTo(x, y + 22);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function draw() {
    const ctx = state.ctx;
    if (!ctx) return;
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    const sx = state.shake ? rand(-state.shake, state.shake) : 0;
    const sy = state.shake ? rand(-state.shake, state.shake) : 0;
    ctx.save();
    ctx.translate(sx, sy);
    drawBackground(ctx);
    for (const t of state.targets) drawTarget(ctx, t);
    drawFx(ctx);
    ctx.restore();
    drawCrosshair(ctx);
  }

  function loop(now) {
    if (!state.active) return;
    const last = state.last || now;
    const dt = Math.min(40, now - last);
    state.last = now;
    tick(dt);
    draw();
    state.raf = requestAnimationFrame(loop);
  }

  function keepInField(t) {
    const pad = (t.r || 16) + 8;
    const roam =
      t.type === "meteor" ||
      t.type === "flyby" ||
      t.type === "miniufo" ||
      (t.type === "saucer" && t.exiting);
    if (roam) {
      t.x = clamp(t.x, -90, state.w + 90);
      t.y = clamp(t.y, -90, state.h + 90);
      return;
    }
    t.x = clamp(t.x, pad, state.w - pad);
    if (t.type === "fruit" || t.type === "can") {
      t.y = clamp(t.y, -40, state.h + 20);
      return;
    }
    const top = pad + (t.type === "target" || t.type === "saucer" || t.type === "boss" ? 32 : 0);
    const bottom =
      t.type === "boss" || t.type === "saucer"
        ? state.h * 0.62
        : t.type === "sun"
          ? state.h * 0.3
          : state.h - footerBuffer() - pad;
    t.y = clamp(t.y, top, Math.max(top + 10, bottom));
  }

  function resize() {
    const canvas = state.canvas;
    if (!canvas) return;
    const shell = canvas.parentElement;
    const prevW = state.w;
    const prevH = state.h;
    const w = Math.max(280, shell?.clientWidth || window.innerWidth);
    const h = Math.max(240, shell?.clientHeight || window.innerHeight);
    state.w = w;
    state.h = h;
    state.dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.floor(w * state.dpr);
    canvas.height = Math.floor(h * state.dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    if (prevW > 40 && prevH > 40 && (prevW !== w || prevH !== h)) {
      const sx = w / prevW;
      const sy = h / prevH;
      for (const t of state.targets) {
        const oldR = t.r || 16;
        t.x *= sx;
        t.y *= sy;
        if (t.r) t.r = Math.min(t.r * Math.min(sx, sy), Math.min(w, h) * 0.22);
        if (t.maxR) t.maxR = t.r;
        if (t.hitR) t.hitR *= (t.r || oldR) / oldR;
        keepInField(t);
      }
    }
    draw();
  }

  function eventToLocal(e) {
    const rect = state.canvas.getBoundingClientRect();
    const src = e.touches?.[0] || e.changedTouches?.[0] || e;
    return {
      x: ((src.clientX - rect.left) / rect.width) * state.w,
      y: ((src.clientY - rect.top) / rect.height) * state.h,
    };
  }

  function setAiming(on) {
    document.body.classList.toggle("zap-aiming", !!on);
  }

  function syncAimFromEvent(e) {
    if (!state.active || !state.pointer.in) {
      setAiming(false);
      return;
    }
    const overUi = e?.target?.closest?.("[data-zap-start], .zap-overlay:not([hidden])");
    setAiming(state.mode === "playing" && !overUi);
  }

  function onPointerMove(e) {
    if (!state.active) return;
    const p = eventToLocal(e);
    state.pointer.x = p.x;
    state.pointer.y = p.y;
    state.pointer.in = true;
    syncAimFromEvent(e);
  }

  function onPointerDown(e) {
    if (!state.active) return;
    if (e.target.closest?.("[data-zap-start]")) return;
    if (state.mode !== "playing") return;
    e.preventDefault();
    const p = eventToLocal(e);
    state.pointer.x = p.x;
    state.pointer.y = p.y;
    onShoot(p.x, p.y);
  }

  function activate() {
    if (!state.canvas) return;
    state.active = true;
    state.mode = "idle";
    state.best = loadBest();
    state.mapChoice = loadMapChoice();
    pickBackgroundTheme();
    resetRun();
    setOverlay(true, {
      kicker: "Arcade",
      title: "Quick Break",
      hint: "Hit the targets, combo multipliers.",
      cta: "Play",
    });
    updateHud();
    resize();
    seedTitleDemo();
    requestAnimationFrame(() => {
      if (state.active) {
        resize();
        if (state.mode === "idle" && state.targets.length === 0) seedTitleDemo();
      }
    });
    cancelAnimationFrame(state.raf);
    state.last = 0;
    state.raf = requestAnimationFrame(loop);
    document.body.classList.add("zap-active");
    setAiming(false);
  }

  function deactivate() {
    state.active = false;
    state.mode = "idle";
    cancelAnimationFrame(state.raf);
    state.raf = 0;
    state.targets = [];
    state.fx = [];
    state.floats = [];
    state.boss = null;
    document.body.classList.remove("zap-active");
    setAiming(false);
    setOverlay(true, {
      kicker: "Arcade",
      title: "Quick Break",
      hint: "Hit the targets, combo multipliers.",
      cta: "Play",
    });
  }

  function init() {
    const canvas = document.getElementById("zap-canvas");
    const shell = document.querySelector(".zap-shell");
    if (!canvas || !shell) return;

    state.canvas = canvas;
    state.ctx = canvas.getContext("2d");
    state.els = {
      score: document.querySelector("[data-zap-score]"),
      best: document.querySelector("[data-zap-best]"),
      combo: document.querySelector("[data-zap-combo]"),
      time: document.querySelector("[data-zap-time]"),
      bossWrap: document.querySelector("[data-zap-boss]"),
      bossFill: document.querySelector("[data-zap-boss-fill]"),
      overlay: document.querySelector("[data-zap-overlay]"),
      kicker: document.querySelector("[data-zap-kicker]"),
      title: document.querySelector("[data-zap-title]"),
      hint: document.querySelector("[data-zap-hint]"),
      start: document.querySelector("[data-zap-start]"),
      mapBtn: document.querySelector("[data-zap-map]"),
      mapLabel: document.querySelector("[data-zap-map-label]"),
    };

    state.best = loadBest();
    updateHud();
    setOverlay(true);

    state.els.start?.addEventListener("click", (e) => {
      e.stopPropagation();
      startGame();
    });
    state.els.mapBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      cycleMap();
    });

    canvas.addEventListener("pointerdown", onPointerDown);
    shell.addEventListener("pointermove", onPointerMove);
    shell.addEventListener("pointerenter", (e) => {
      state.pointer.in = true;
      syncAimFromEvent(e);
    });
    shell.addEventListener("pointerleave", () => {
      state.pointer.in = false;
      setAiming(false);
    });
    window.addEventListener("resize", () => {
      if (state.active) resize();
    });
    if (window.ResizeObserver) {
      new ResizeObserver(() => {
        if (state.active) resize();
      }).observe(shell);
    }

    window.ZapGallery = { activate, deactivate, isActive: () => state.active };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
