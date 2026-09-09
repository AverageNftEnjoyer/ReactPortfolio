/* Zap Gallery — timed score attack + boss finale */
(() => {
  const STORAGE_KEY = "zap-gallery-best";
  const MUTE_KEY = "zap-gallery-muted";
  const AUDIO_SRC = "assets/clickergame.mp3";
  const COMBO_START = 5;
  const GAME_MS = 120000;
  const BOSS_AT = 100000;
  const BOSS_HP = 48;
  const BOSS_HIT_PTS = 2;
  const BOSS_CLEAR_BONUS = 150;

  const PHASES = [
    { id: "balloons", until: 22000, label: "Balloons" },
    { id: "targets", until: 44000, label: "Targets" },
    { id: "disks", until: 66000, label: "Disks" },
    { id: "fruit", until: 88000, label: "Fruit" },
    { id: "saucers", until: BOSS_AT, label: "Saucers" },
    { id: "boss", until: GAME_MS, label: "Boss" },
  ];

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
    duckAcc: 0,
    targets: [],
    fx: [],
    floats: [],
    shake: 0,
    boss: null,
    muted: true,
    audio: null,
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

  function phaseAt(t) {
    return PHASES.find((p) => t < p.until) || PHASES[PHASES.length - 1];
  }

  function difficulty() {
    const t = state.elapsed / 1000;
    return {
      speed: 1 + Math.min(1.6, t * 0.014),
      spawn: Math.max(260, 920 - t * 9),
      size: Math.max(0.68, 1 - t * 0.0035),
      count: 1 + Math.min(3, (t / 40) | 0),
    };
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

  function loadMuted() {
    try {
      const v = localStorage.getItem(MUTE_KEY);
      if (v === null) return true;
      return v === "1";
    } catch {
      return true;
    }
  }

  function saveMuted(muted) {
    try {
      localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
    } catch {
      /* ignore */
    }
  }

  function ensureAudio() {
    if (state.audio) return state.audio;
    const a = new Audio(AUDIO_SRC);
    a.loop = true;
    a.preload = "auto";
    a.volume = 0.45;
    state.audio = a;
    return a;
  }

  function syncAudio() {
    const a = ensureAudio();
    if (!state.active || state.muted || state.mode !== "playing") {
      a.pause();
      return;
    }
    a.play().catch(() => {});
  }

  function updateMuteBtn() {
    const btn = state.els.mute;
    if (!btn) return;
    btn.setAttribute("aria-pressed", state.muted ? "true" : "false");
    btn.setAttribute("aria-label", state.muted ? "Unmute music" : "Mute music");
    btn.classList.toggle("is-muted", state.muted);
    const label = btn.querySelector("[data-zap-mute-label]");
    if (label) label.textContent = state.muted ? "Muted" : "Music";
  }

  function setMuted(muted) {
    state.muted = muted;
    saveMuted(muted);
    updateMuteBtn();
    syncAudio();
  }

  function updateHud() {
    const { score, best, combo, wave, time, bar, bossWrap, bossFill } = state.els;
    if (score) score.textContent = String(state.score);
    if (best) best.textContent = `Best ${state.best}`;

    const phase = phaseAt(state.elapsed);
    if (wave) wave.textContent = phase.label;

    const left = Math.max(0, GAME_MS - state.elapsed);
    const secs = Math.ceil(left / 1000);
    if (time) {
      const m = Math.floor(secs / 60);
      const s = secs % 60;
      time.textContent = `${m}:${String(s).padStart(2, "0")}`;
    }
    if (bar) {
      const p = clamp(state.elapsed / GAME_MS, 0, 1);
      bar.style.transform = `scaleX(${p})`;
    }

    if (combo) {
      const show = state.mode === "playing" && state.combo >= COMBO_START;
      combo.hidden = !show;
      if (show) combo.textContent = `${state.combo} hit combo`;
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
    if (title) title.textContent = opts.title ?? "Zap Gallery";
    if (hint)
      hint.textContent =
        opts.hint ??
        "2-minute score attack. Zap everything, then take down the boss.";
    if (start) start.textContent = opts.cta ?? "Play";
  }

  function addFloat(x, y, text, color) {
    state.floats.push({ x, y, text, color, life: 1, vy: -0.9 });
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
    for (let i = 0; i < (kind === "hit" ? 10 : 5); i++) {
      const a = rand(0, Math.PI * 2);
      const sp = rand(1.2, kind === "hit" ? 5.5 : 3.2);
      state.fx.push({
        x,
        y,
        kind: "spark",
        color: kind === "hit" ? color || "#fff" : "rgba(30,40,50,0.55)",
        life: rand(0.45, 0.9),
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        r: rand(1.5, 3.2),
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
    syncAudio();
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
    if (boss && boss.hp > 0) {
      const dealt = boss.maxHp - boss.hp;
      extra = ` Boss damaged ${dealt}/${boss.maxHp}.`;
    } else if (boss && boss.hp <= 0) {
      extra = " Boss cleared!";
    }
    finishRun({
      kicker: "Time's Up",
      title: `Score ${state.score}`,
      hint:
        (state.score >= state.best && state.score > 0 ? "New best!" : "Run complete.") +
        extra,
    });
  }

  function resetRun() {
    state.score = 0;
    state.combo = 0;
    state.elapsed = 0;
    state.spawnAcc = 0;
    state.duckAcc = 0;
    state.targets = [];
    state.fx = [];
    state.floats = [];
    state.shake = 0;
    state.boss = null;
    state._lastBalloonColor = null;
    updateHud();
  }

  function startGame() {
    resetRun();
    state.mode = "playing";
    setOverlay(false);
    for (let i = 0; i < 3; i++) spawnForPhase();
    syncAudio();
    updateHud();
  }

  function spawnBalloon() {
    const colors = ["#e85d5d", "#3cc0ec", "#f0c14a", "#6fbf73", "#c47adf"];
    const color = pick(colors);
    const r = 22 * difficulty().size * rand(0.9, 1.15);
    const margin = r + 8;
    state.targets.push({
      type: "balloon",
      x: rand(margin, state.w - margin),
      y: state.h - margin - rand(20, 120),
      r,
      color,
      vy: -rand(1.0, 1.7) * difficulty().speed,
      vx: rand(-0.7, 0.7),
      wobble: rand(0, Math.PI * 2),
      life: rand(7000, 11000),
      points: 1,
      hitR: r * 0.85,
    });
  }

  function spawnBullseye() {
    const gold = Math.random() < 0.12;
    const penalty = !gold && Math.random() < 0.1;
    const r = (gold ? 34 : 30) * difficulty().size * rand(0.85, 1.1);
    const life = rand(2200, 3400) / difficulty().speed;
    state.targets.push({
      type: "target",
      x: rand(r + 30, state.w - r - 30),
      y: rand(r + 80, state.h - r - 40),
      r,
      maxR: r,
      life,
      maxLife: life,
      gold,
      penalty,
      points: gold ? 10 : penalty ? -3 : 1,
      hitR: r,
      appear: 0,
    });
  }

  function spawnDisk() {
    const fromLeft = Math.random() < 0.5;
    const r = 16 * difficulty().size;
    const y = rand(state.h * 0.28, state.h * 0.68);
    state.targets.push({
      type: "disk",
      x: fromLeft ? -r - 10 : state.w + r + 10,
      y,
      r,
      vx: (fromLeft ? 1 : -1) * rand(3.2, 5.2) * difficulty().speed,
      vy: -rand(2.2, 4.2) * difficulty().speed,
      g: 0.085 * difficulty().speed,
      rot: rand(0, Math.PI * 2),
      spin: rand(-0.25, 0.25),
      points: 2,
      hitR: r * 1.1,
      color: pick(["#c4a484", "#d2b48c", "#b8956c"]),
    });
  }

  function spawnFruit() {
    const kinds = [
      { name: "apple", color: "#d64545", leaf: "#4f8a3a", points: 2 },
      { name: "orange", color: "#e8913a", leaf: null, points: 2 },
      { name: "banana", color: "#f0d24a", leaf: null, points: 3 },
      { name: "grape", color: "#7b5ea7", leaf: "#4f8a3a", points: 2 },
    ];
    const kind = pick(kinds);
    const fromLeft = Math.random() < 0.5;
    const r = 18 * difficulty().size;
    state.targets.push({
      type: "fruit",
      fruit: kind.name,
      color: kind.color,
      leaf: kind.leaf,
      x: fromLeft ? rand(40, 120) : rand(state.w - 120, state.w - 40),
      y: state.h - 30,
      r,
      vx: (fromLeft ? 1 : -1) * rand(1.8, 3.4) * difficulty().speed,
      vy: -rand(7.5, 10.5) * difficulty().speed,
      g: 0.18,
      rot: rand(0, Math.PI * 2),
      spin: rand(-0.12, 0.12),
      points: kind.points,
      hitR: r * 1.05,
    });
  }

  function spawnSaucer() {
    const r = 28 * difficulty().size * rand(0.9, 1.15);
    state.targets.push({
      type: "saucer",
      x: rand(r + 40, state.w - r - 40),
      y: r + rand(40, 120),
      r,
      vx: rand(-1.4, 1.4) * difficulty().speed,
      vy: rand(-0.4, 0.9) * difficulty().speed,
      wobble: rand(0, Math.PI * 2),
      beam: Math.random() < 0.35,
      life: rand(8000, 12000),
      points: 3,
      hitR: r * 0.9,
    });
  }

  function spawnDuck() {
    const fromLeft = Math.random() < 0.5;
    state.targets.push({
      type: "duck",
      x: fromLeft ? -40 : state.w + 40,
      y: rand(90, state.h * 0.42),
      r: 20,
      vx: (fromLeft ? 1 : -1) * rand(3.5, 5) * difficulty().speed,
      bob: rand(0, Math.PI * 2),
      points: 15,
      hitR: 22,
      facing: fromLeft ? 1 : -1,
    });
  }

  function spawnBoss() {
    if (state.boss) return;
    const r = Math.min(70, state.w * 0.1);
    const boss = {
      type: "boss",
      x: state.w * 0.5,
      y: state.h * 0.32,
      r,
      vx: 1.6,
      wobble: 0,
      hp: BOSS_HP,
      maxHp: BOSS_HP,
      hitR: r * 1.15,
      points: BOSS_HIT_PTS,
    };
    state.boss = boss;
    state.targets.push(boss);
    state.targets = state.targets.filter((t) => t.type === "boss" || t.type === "duck");
    addFloat(state.w * 0.5, state.h * 0.2, "BOSS!", "#f0c14a");
    updateHud();
  }

  function spawnForPhase() {
    const phase = phaseAt(state.elapsed).id;
    if (phase === "boss") return;
    const n = difficulty().count;
    for (let i = 0; i < n; i++) {
      if (phase === "balloons") spawnBalloon();
      else if (phase === "targets") spawnBullseye();
      else if (phase === "disks") spawnDisk();
      else if (phase === "fruit") spawnFruit();
      else spawnSaucer();
    }
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
    let bonus = 0;
    if (state.combo >= COMBO_START) bonus = 1;
    state.score += pts + bonus;
    addFx(x, y, "hit", color);
    addFloat(
      x,
      y - 12,
      bonus ? `+${pts + bonus}` : `+${pts}`,
      big ? "#f0c14a" : "#fff"
    );
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
        scoreHit(BOSS_HIT_PTS, x, y, "#7b5ea7", true);
        t.flash = 1;
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
                ? "New best — perfect run energy."
                : "Mothership down. Play again?",
          });
        }
        return;
      }

      state.targets.splice(i, 1);

      let pts = t.points;
      if (t.type === "balloon" && state._lastBalloonColor === t.color) pts = 2;
      if (t.type === "balloon") state._lastBalloonColor = t.color;

      if (pts < 0) {
        state.combo = 0;
        state.score = Math.max(0, state.score + pts);
        addFx(x, y, "miss", "#e85d5d");
        addFloat(x, y - 10, String(pts), "#e85d5d");
        state.shake = 8;
        updateHud();
      } else {
        const color =
          t.type === "duck" ? "#f0c14a" : t.gold ? "#f0c14a" : t.color || "#3cc0ec";
        scoreHit(pts, x, y, color, t.gold || t.type === "duck");
      }
      return;
    }

    state.combo = 0;
    state._lastBalloonColor = null;
    addFx(x, y, "miss", "rgba(20,30,40,0.5)");
    addFloat(x, y - 8, "miss", "rgba(255,255,255,0.7)");
    updateHud();
  }

  function bounceBalloon(t) {
    const m = t.r + 4;
    if (t.x < m) {
      t.x = m;
      t.vx = Math.abs(t.vx) + 0.15;
    } else if (t.x > state.w - m) {
      t.x = state.w - m;
      t.vx = -Math.abs(t.vx) - 0.15;
    }
    if (t.y < m + 50) {
      t.y = m + 50;
      t.vy = Math.abs(t.vy) * 0.55 + 0.35;
      t.vx += rand(-0.4, 0.4);
    } else if (t.y > state.h - m) {
      t.y = state.h - m;
      t.vy = -Math.abs(t.vy);
    }
  }

  function updateTargets(dt) {
    const dead = [];
    for (let i = 0; i < state.targets.length; i++) {
      const t = state.targets[i];
      if (t.type === "balloon") {
        t.life -= dt;
        t.wobble += dt * 0.004;
        t.x += (t.vx + Math.sin(t.wobble) * 0.45) * (dt / 16.67);
        t.y += t.vy * (dt / 16.67);
        // soft gravity drift so they don't pin to the ceiling
        t.vy += 0.01 * (dt / 16.67);
        bounceBalloon(t);
        if (t.life <= 0) dead.push(i);
      } else if (t.type === "target") {
        t.appear = Math.min(1, t.appear + dt / 180);
        t.life -= dt;
        const p = clamp(t.life / t.maxLife, 0, 1);
        t.r = t.maxR * (0.35 + 0.65 * p);
        if (t.life <= 0) dead.push(i);
      } else if (t.type === "disk") {
        t.vy += t.g * (dt / 16.67);
        t.x += t.vx * (dt / 16.67);
        t.y += t.vy * (dt / 16.67);
        t.rot += t.spin;
        if (t.y > state.h + 40 || t.x < -60 || t.x > state.w + 60) dead.push(i);
      } else if (t.type === "fruit") {
        t.vy += t.g * (dt / 16.67);
        t.x += t.vx * (dt / 16.67);
        t.y += t.vy * (dt / 16.67);
        t.rot += t.spin;
        if (t.y > state.h + 50 || t.x < -50 || t.x > state.w + 50) dead.push(i);
      } else if (t.type === "saucer") {
        t.life -= dt;
        t.wobble += dt * 0.003;
        t.x += (t.vx + Math.sin(t.wobble) * 0.6) * (dt / 16.67);
        t.y += t.vy * (dt / 16.67);
        const m = t.r + 6;
        if (t.x < m) {
          t.x = m;
          t.vx = Math.abs(t.vx);
        }
        if (t.x > state.w - m) {
          t.x = state.w - m;
          t.vx = -Math.abs(t.vx);
        }
        if (t.y < m + 40) {
          t.y = m + 40;
          t.vy = Math.abs(t.vy) * 0.6;
        }
        if (t.y > state.h - m - 10) {
          t.y = state.h - m - 10;
          t.vy = -Math.abs(t.vy);
        }
        if (t.life <= 0) dead.push(i);
      } else if (t.type === "duck") {
        t.bob += dt * 0.008;
        t.x += t.vx * (dt / 16.67);
        t.y += Math.sin(t.bob) * 0.55;
        if (t.x < -60 || t.x > state.w + 60) dead.push(i);
      } else if (t.type === "boss") {
        t.wobble += dt * 0.003;
        t.x += t.vx * (dt / 16.67);
        t.y = state.h * 0.32 + Math.sin(t.wobble) * 28;
        const m = t.r + 20;
        if (t.x < m) {
          t.x = m;
          t.vx = Math.abs(t.vx);
        }
        if (t.x > state.w - m) {
          t.x = state.w - m;
          t.vx = -Math.abs(t.vx);
        }
        if (t.flash > 0) t.flash = Math.max(0, t.flash - dt * 0.008);
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
    if (state.mode === "playing") {
      const prevPhase = phaseAt(state.elapsed).id;
      state.elapsed = Math.min(GAME_MS, state.elapsed + dt);
      const phase = phaseAt(state.elapsed).id;

      if (state.elapsed >= GAME_MS) {
        endByTimer();
        updateFx(dt);
        return;
      }

      if (phase === "boss") {
        if (prevPhase !== "boss") spawnBoss();
      } else {
        const diff = difficulty();
        state.spawnAcc += dt;
        while (state.spawnAcc >= diff.spawn) {
          state.spawnAcc -= diff.spawn;
          spawnForPhase();
        }
        state.duckAcc += dt;
        if (state.duckAcc >= 14000) {
          state.duckAcc = 0;
          spawnDuck();
        }
      }

      updateTargets(dt);
      updateHud();
    } else if (state.mode === "idle") {
      if (state.targets.length < 5 && Math.random() < 0.03) spawnBalloon();
      updateTargets(dt * 0.7);
    }

    updateFx(dt);
  }

  /* —— draw —— */
  function drawBackground(ctx) {
    const g = ctx.createLinearGradient(0, 0, 0, state.h);
    g.addColorStop(0, "#7eb6d9");
    g.addColorStop(0.45, "#b7d8ea");
    g.addColorStop(0.72, "#d9e8c8");
    g.addColorStop(1, "#c3d4a8");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, state.w, state.h);

    ctx.fillStyle = "#9bb87e";
    ctx.beginPath();
    ctx.moveTo(0, state.h * 0.72);
    ctx.quadraticCurveTo(state.w * 0.25, state.h * 0.62, state.w * 0.5, state.h * 0.7);
    ctx.quadraticCurveTo(state.w * 0.75, state.h * 0.78, state.w, state.h * 0.66);
    ctx.lineTo(state.w, state.h);
    ctx.lineTo(0, state.h);
    ctx.fill();

    ctx.fillStyle = "#8aab6c";
    ctx.beginPath();
    ctx.moveTo(0, state.h * 0.82);
    ctx.quadraticCurveTo(state.w * 0.3, state.h * 0.74, state.w * 0.55, state.h * 0.84);
    ctx.quadraticCurveTo(state.w * 0.8, state.h * 0.9, state.w, state.h * 0.8);
    ctx.lineTo(state.w, state.h);
    ctx.lineTo(0, state.h);
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.45)";
    const drift = (state.elapsed * 0.01) % (state.w + 200);
    [
      [120, 70, 40],
      [360, 100, 32],
      [620, 55, 48],
      [880, 90, 28],
    ].forEach(([cx, cy, r], i) => {
      const x = ((cx - drift * (0.3 + i * 0.05)) % (state.w + 160)) - 80;
      ctx.beginPath();
      ctx.arc(x, cy, r, 0, Math.PI * 2);
      ctx.arc(x + r * 0.75, cy + 4, r * 0.7, 0, Math.PI * 2);
      ctx.arc(x - r * 0.6, cy + 6, r * 0.6, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawBalloon(ctx, t) {
    ctx.save();
    ctx.translate(t.x, t.y);
    ctx.strokeStyle = "rgba(30,40,50,0.35)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, t.r * 0.9);
    ctx.quadraticCurveTo(4, t.r + 18, 0, t.r + 34);
    ctx.stroke();
    const g = ctx.createRadialGradient(-t.r * 0.3, -t.r * 0.35, 2, 0, 0, t.r);
    g.addColorStop(0, "#fff");
    g.addColorStop(0.2, t.color);
    g.addColorStop(1, t.color);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(0, 0, t.r * 0.85, t.r, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = t.color;
    ctx.beginPath();
    ctx.moveTo(-4, t.r * 0.85);
    ctx.lineTo(4, t.r * 0.85);
    ctx.lineTo(0, t.r * 0.85 + 8);
    ctx.fill();
    ctx.restore();
  }

  function drawBullseye(ctx, t) {
    const s = clamp(t.appear, 0, 1);
    ctx.save();
    ctx.translate(t.x, t.y);
    ctx.scale(s * (t.r / t.maxR), s * (t.r / t.maxR));
    const R = t.maxR;
    if (t.penalty) {
      ctx.fillStyle = "#f0f0f0";
      ctx.beginPath();
      ctx.arc(0, 0, R, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#2c2c2c";
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = "#2c2c2c";
      ctx.beginPath();
      ctx.arc(-R * 0.28, -R * 0.15, R * 0.1, 0, Math.PI * 2);
      ctx.arc(R * 0.28, -R * 0.15, R * 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, R * 0.25, R * 0.28, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
      ctx.fillStyle = "#e85d5d";
      ctx.font = `bold ${Math.floor(R * 0.35)}px SpaceGrotesk, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("-3", 0, R * 0.85);
    } else if (t.gold) {
      ["#f0c14a", "#fff6d6", "#e8a03a", "#fff", "#d4920f"].forEach((c, i) => {
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(0, 0, R * (1 - i * 0.18), 0, Math.PI * 2);
        ctx.fill();
      });
    } else {
      ["#2c2c2c", "#f5f5f5", "#2c2c2c", "#f5f5f5", "#e85d5d"].forEach((c, i) => {
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(0, 0, R * (1 - i * 0.18), 0, Math.PI * 2);
        ctx.fill();
      });
    }
    ctx.restore();
  }

  function drawDisk(ctx, t) {
    ctx.save();
    ctx.translate(t.x, t.y);
    ctx.rotate(t.rot);
    ctx.scale(1, 0.35);
    ctx.fillStyle = t.color;
    ctx.beginPath();
    ctx.arc(0, 0, t.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(80,50,20,0.35)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  function drawFruit(ctx, t) {
    ctx.save();
    ctx.translate(t.x, t.y);
    ctx.rotate(t.rot);
    if (t.fruit === "banana") {
      ctx.strokeStyle = t.color;
      ctx.lineWidth = t.r * 0.55;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(0, 0, t.r * 0.7, 0.2 * Math.PI, 1.1 * Math.PI);
      ctx.stroke();
    } else if (t.fruit === "grape") {
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        ctx.fillStyle = t.color;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * t.r * 0.45, Math.sin(a) * t.r * 0.45, t.r * 0.38, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = t.color;
      ctx.beginPath();
      ctx.arc(0, 0, t.r * 0.35, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const g = ctx.createRadialGradient(-t.r * 0.3, -t.r * 0.3, 2, 0, 0, t.r);
      g.addColorStop(0, "#fff8");
      g.addColorStop(0.35, t.color);
      g.addColorStop(1, t.color);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, t.r, 0, Math.PI * 2);
      ctx.fill();
      if (t.leaf) {
        ctx.fillStyle = t.leaf;
        ctx.beginPath();
        ctx.ellipse(t.r * 0.15, -t.r * 0.85, t.r * 0.35, t.r * 0.18, -0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  function drawSaucer(ctx, t, boss) {
    ctx.save();
    ctx.translate(t.x, t.y);
    const R = t.r;
    if (t.beam || boss) {
      const bg = ctx.createLinearGradient(0, 0, 0, R * (boss ? 5 : 4));
      bg.addColorStop(0, "rgba(120,220,160,0.35)");
      bg.addColorStop(1, "rgba(120,220,160,0)");
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.moveTo(-R * 0.4, R * 0.2);
      ctx.lineTo(R * 0.4, R * 0.2);
      ctx.lineTo(R * (boss ? 1.6 : 1.2), R * (boss ? 5 : 4));
      ctx.lineTo(-R * (boss ? 1.6 : 1.2), R * (boss ? 5 : 4));
      ctx.fill();
    }
    if (t.flash > 0) {
      ctx.fillStyle = `rgba(255,255,255,${0.35 * t.flash})`;
      ctx.beginPath();
      ctx.ellipse(0, R * 0.1, R * 1.1, R * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "rgba(180, 230, 255, 0.85)";
    ctx.beginPath();
    ctx.ellipse(0, -R * 0.15, R * 0.45, R * 0.4, 0, Math.PI, 0);
    ctx.fill();
    const g = ctx.createLinearGradient(-R, 0, R, 0);
    g.addColorStop(0, boss ? "#5a3d7a" : "#6a7d8c");
    g.addColorStop(0.5, boss ? "#d7c2ef" : "#d5dde4");
    g.addColorStop(1, boss ? "#5a3d7a" : "#6a7d8c");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(0, R * 0.1, R, R * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    ["#e85d5d", "#f0c14a", "#3cc0ec"].forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(-R * 0.45 + i * R * 0.45, R * 0.18, boss ? 5 : 3.5, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  function drawDuck(ctx, t) {
    ctx.save();
    ctx.translate(t.x, t.y);
    ctx.scale(t.facing, 1);
    ctx.fillStyle = "#e8a03a";
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(12, -8, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#2c2c2c";
    ctx.beginPath();
    ctx.arc(15, -10, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#e85d5d";
    ctx.beginPath();
    ctx.moveTo(18, -8);
    ctx.lineTo(28, -6);
    ctx.lineTo(18, -3);
    ctx.fill();
    ctx.fillStyle = "#d4920f";
    ctx.beginPath();
    ctx.ellipse(-6, -2, 8, 5, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawTarget(ctx, t) {
    if (t.type === "balloon") drawBalloon(ctx, t);
    else if (t.type === "target") drawBullseye(ctx, t);
    else if (t.type === "disk") drawDisk(ctx, t);
    else if (t.type === "fruit") drawFruit(ctx, t);
    else if (t.type === "saucer") drawSaucer(ctx, t, false);
    else if (t.type === "boss") drawSaucer(ctx, t, true);
    else if (t.type === "duck") drawDuck(ctx, t);
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
        ctx.strokeStyle = "rgba(255,255,255,0.7)";
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

  function resize() {
    const canvas = state.canvas;
    if (!canvas) return;
    const shell = canvas.parentElement;
    const w = Math.max(320, shell?.clientWidth || window.innerWidth);
    const h = Math.max(280, shell?.clientHeight || window.innerHeight);
    state.w = w;
    state.h = h;
    state.dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.floor(w * state.dpr);
    canvas.height = Math.floor(h * state.dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
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
    const overUi = e?.target?.closest?.(
      "[data-zap-start], [data-zap-mute], .zap-overlay:not([hidden])"
    );
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
    if (e.target.closest?.("[data-zap-start], [data-zap-mute]")) return;
    if (state.mode === "idle" || state.mode === "dead") {
      startGame();
      return;
    }
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
    resetRun();
    state.targets = [];
    setOverlay(true, {
      kicker: "Arcade",
      title: "Zap Gallery",
      hint: "2-minute score attack. Progressive waves, then a boss click fight.",
      cta: "Play",
    });
    updateMuteBtn();
    updateHud();
    resize();
    requestAnimationFrame(() => {
      if (state.active) resize();
    });
    cancelAnimationFrame(state.raf);
    state.last = 0;
    state.raf = requestAnimationFrame(loop);
    document.body.classList.add("zap-active");
    setAiming(false);
    syncAudio();
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
    if (state.audio) {
      state.audio.pause();
      state.audio.currentTime = 0;
    }
    setOverlay(true, {
      kicker: "Arcade",
      title: "Zap Gallery",
      hint: "2-minute score attack. Progressive waves, then a boss click fight.",
      cta: "Play",
    });
  }

  function init() {
    const canvas = document.getElementById("zap-canvas");
    const shell = document.querySelector(".zap-shell");
    if (!canvas || !shell) return;

    state.canvas = canvas;
    state.ctx = canvas.getContext("2d");
    state.muted = loadMuted();
    state.els = {
      score: document.querySelector("[data-zap-score]"),
      best: document.querySelector("[data-zap-best]"),
      combo: document.querySelector("[data-zap-combo]"),
      wave: document.querySelector("[data-zap-wave]"),
      time: document.querySelector("[data-zap-time]"),
      bar: document.querySelector("[data-zap-bar]"),
      bossWrap: document.querySelector("[data-zap-boss]"),
      bossFill: document.querySelector("[data-zap-boss-fill]"),
      overlay: document.querySelector("[data-zap-overlay]"),
      kicker: document.querySelector("[data-zap-kicker]"),
      title: document.querySelector("[data-zap-title]"),
      hint: document.querySelector("[data-zap-hint]"),
      start: document.querySelector("[data-zap-start]"),
      mute: document.querySelector("[data-zap-mute]"),
    };

    state.best = loadBest();
    updateMuteBtn();
    updateHud();
    setOverlay(true);

    state.els.start?.addEventListener("click", (e) => {
      e.stopPropagation();
      startGame();
    });

    state.els.mute?.addEventListener("click", (e) => {
      e.stopPropagation();
      setMuted(!state.muted);
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

    window.ZapGallery = { activate, deactivate, isActive: () => state.active };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
