/* Zap Gallery — skill score attack + boss finale */
(() => {
  const STORAGE_KEY = "zap-gallery-best";
  const COMBO_START = 5;
  const GAME_MS = 120000;
  const BOSS_AT = 100000;
  const BOSS_HP = 48;
  const BOSS_HIT_PTS = 2;
  const BOSS_CLEAR_BONUS = 150;

  const PHASES = [
    { id: "balloons", until: 22000, label: "Balloons" },
    { id: "targets", until: 44000, label: "Targets" },
    { id: "cans", until: 64000, label: "Cans" },
    { id: "fruit", until: 86000, label: "Fruit" },
    { id: "saucers", until: BOSS_AT, label: "Saucers" },
    { id: "boss", until: GAME_MS, label: "Boss" },
  ];

  // Wii Play–style caps: sparse, readable, skill-first
  const CAPS = {
    balloon: 5,
    target: 6,
    can: 2,
    fruit: 3,
    saucer: 2,
    meteor: 1,
  };

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
    meteorAcc: 0,
    targets: [],
    fx: [],
    floats: [],
    shake: 0,
    boss: null,
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
    const { score, best, combo, wave, bossWrap, bossFill } = state.els;
    if (score) score.textContent = String(state.score);
    if (best) best.textContent = `Best ${state.best}`;

    const phase = phaseAt(state.elapsed);
    if (wave) wave.textContent = phase.label;

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
    if (title) title.textContent = opts.title ?? "Zap Gallery";
    if (hint)
      hint.textContent =
        opts.hint ??
        "Skill run: limited targets, rising combos, then a teleporting boss.";
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
    state.meteorAcc = 0;
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
    spawnForPhase();
    updateHud();
  }

  /* —— spawners —— */
  function spawnBalloon() {
    if (countType("balloon") >= CAPS.balloon) return;
    const colors = ["#e44747", "#2eb0e0", "#efc233"];
    const color = pick(colors);
    const r = 24 * difficulty().size * rand(0.95, 1.1);
    const margin = r + 10;
    state.targets.push({
      type: "balloon",
      x: rand(margin, state.w - margin),
      y: state.h - margin - rand(10, 80),
      r,
      color,
      vy: -rand(1.05, 1.55) * difficulty().speed,
      vx: rand(-0.55, 0.55),
      wobble: rand(0, Math.PI * 2),
      life: rand(8000, 12000),
      points: 1,
      hitR: r * 0.88,
    });
  }

  function spawnBullseye() {
    if (countType("target") >= CAPS.target) return;
    const gold = Math.random() < 0.14;
    const penalty = !gold && Math.random() < 0.1;
    const r = (gold ? 36 : 32) * difficulty().size * rand(0.9, 1.05);
    const life = rand(2400, 3600) / difficulty().speed;
    state.targets.push({
      type: "target",
      x: rand(r + 36, state.w - r - 36),
      y: rand(r + 90, state.h - r - 50),
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

  function spawnCan() {
    if (countType("can") >= CAPS.can) return;
    const fromLeft = Math.random() < 0.5;
    const r = 20 * difficulty().size;
    state.targets.push({
      type: "can",
      x: fromLeft ? rand(50, state.w * 0.35) : rand(state.w * 0.65, state.w - 50),
      y: state.h - 40,
      r,
      vx: (fromLeft ? 1 : -1) * rand(0.6, 1.3) * difficulty().speed,
      vy: -rand(6.5, 8.8) * difficulty().speed,
      g: 0.2,
      rot: rand(-0.2, 0.2),
      spin: rand(-0.08, 0.08),
      hp: 2,
      maxHp: 2,
      points: 4,
      hitR: r * 1.15,
      label: pick(["SODA", "POP", "ZAP"]),
      tint: pick(["#c45c3e", "#3d7ea6", "#d4a017"]),
    });
  }

  function spawnFruit() {
    if (countType("fruit") >= CAPS.fruit) return;
    const kinds = [
      { name: "apple", color: "#e23b3b", accent: "#8f1f1f", leaf: "#3f8f3a", points: 2 },
      { name: "orange", color: "#f08a24", accent: "#c45e10", leaf: null, points: 2 },
      { name: "banana", color: "#f5d447", accent: "#c9a61a", leaf: null, points: 3 },
      { name: "watermelon", color: "#2f9e57", accent: "#d64545", leaf: null, points: 3 },
    ];
    const kind = pick(kinds);
    const fromLeft = Math.random() < 0.5;
    const r = 32 * difficulty().size * rand(0.95, 1.12);
    state.targets.push({
      type: "fruit",
      fruit: kind.name,
      color: kind.color,
      accent: kind.accent,
      leaf: kind.leaf,
      x: fromLeft ? rand(60, 140) : rand(state.w - 140, state.w - 60),
      y: state.h + 10,
      r,
      vx: (fromLeft ? 1 : -1) * rand(1.4, 2.4) * difficulty().speed,
      vy: -rand(8.2, 10.2) * difficulty().speed,
      g: 0.2,
      rot: rand(0, Math.PI * 2),
      spin: rand(-0.08, 0.08),
      points: kind.points,
      hitR: r * 1.08,
    });
  }

  function spawnSaucer() {
    if (countType("saucer") >= CAPS.saucer) return;
    const r = 30 * difficulty().size;
    const fromTop = Math.random() < 0.55;
    const gold = Math.random() < 0.18;
    state.targets.push({
      type: "saucer",
      x: rand(r + 50, state.w - r - 50),
      y: fromTop ? -r - 10 : rand(state.h * 0.2, state.h * 0.45),
      r,
      vx: rand(-1.1, 1.1) * difficulty().speed,
      vy: fromTop ? rand(0.7, 1.2) * difficulty().speed : rand(-0.35, 0.55),
      wobble: rand(0, Math.PI * 2),
      beam: Math.random() < 0.45,
      life: rand(7000, 10000),
      gold,
      points: gold ? 5 : 3,
      hitR: r * 0.92,
    });
  }

  function spawnMeteor() {
    if (countType("meteor") >= CAPS.meteor) return;
    const fromLeft = Math.random() < 0.5;
    const r = 18;
    state.targets.push({
      type: "meteor",
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

  function spawnBoss() {
    if (state.boss) return;
    const r = Math.min(78, state.w * 0.11);
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
      nextTeleport: 900,
      flash: 0,
      angle: 0,
    };
    state.boss = boss;
    state.targets = [boss];
    addFloat(state.w * 0.5, state.h * 0.18, "BOSS!", "#f0c14a");
    updateHud();
  }

  function teleportBoss(boss) {
    const m = boss.r + 30;
    boss.x = rand(m, state.w - m);
    boss.y = rand(m + 40, state.h * 0.55);
    boss.teleportIn = 1;
    boss.nextTeleport = rand(700, 1400);
    addFx(boss.x, boss.y, "hit", "#b388ff");
  }

  function spawnForPhase() {
    const phase = phaseAt(state.elapsed).id;
    if (phase === "boss") return;
    if (phase === "balloons") spawnBalloon();
    else if (phase === "targets") spawnBullseye();
    else if (phase === "cans") {
      // sparse: often skip a spawn tick
      if (Math.random() < 0.45) spawnCan();
    } else if (phase === "fruit") spawnFruit();
    else if (phase === "saucers") {
      if (Math.random() < 0.55) spawnSaucer();
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
        teleportBoss(t);
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
        const color =
          t.type === "meteor"
            ? "#ff7a3d"
            : t.gold
              ? "#f0c14a"
              : t.color || t.tint || "#3cc0ec";
        scoreHit(pts, x, y, color, t.gold || t.type === "meteor");
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
      t.vx = Math.abs(t.vx) + 0.12;
    } else if (t.x > state.w - m) {
      t.x = state.w - m;
      t.vx = -Math.abs(t.vx) - 0.12;
    }
    if (t.y < m + 56) {
      t.y = m + 56;
      t.vy = Math.abs(t.vy) * 0.5 + 0.3;
      t.vx += rand(-0.35, 0.35);
    } else if (t.y > state.h - m) {
      t.y = state.h - m;
      t.vy = -Math.abs(t.vy);
    }
  }

  function updateTargets(dt) {
    const dead = [];
    for (let i = 0; i < state.targets.length; i++) {
      const t = state.targets[i];
      if (t.flash > 0) t.flash = Math.max(0, t.flash - dt * 0.008);

      if (t.type === "balloon") {
        t.life -= dt;
        t.wobble += dt * 0.004;
        t.x += (t.vx + Math.sin(t.wobble) * 0.4) * (dt / 16.67);
        t.y += t.vy * (dt / 16.67);
        t.vy += 0.012 * (dt / 16.67);
        bounceBalloon(t);
        if (t.life <= 0) dead.push(i);
      } else if (t.type === "target") {
        t.appear = Math.min(1, t.appear + dt / 180);
        t.life -= dt;
        const p = clamp(t.life / t.maxLife, 0, 1);
        t.r = t.maxR * (0.4 + 0.6 * p);
        if (t.life <= 0) dead.push(i);
      } else if (t.type === "can") {
        t.vy += t.g * (dt / 16.67);
        t.x += t.vx * (dt / 16.67);
        t.y += t.vy * (dt / 16.67);
        t.rot += t.spin;
        if (t.y > state.h + 60 || t.x < -80 || t.x > state.w + 80) dead.push(i);
      } else if (t.type === "fruit") {
        t.vy += t.g * (dt / 16.67);
        t.x += t.vx * (dt / 16.67);
        t.y += t.vy * (dt / 16.67);
        t.rot += t.spin;
        if (t.y > state.h + 60 || t.x < -60 || t.x > state.w + 60) dead.push(i);
      } else if (t.type === "saucer") {
        t.life -= dt;
        t.wobble += dt * 0.003;
        t.x += (t.vx + Math.sin(t.wobble) * 0.5) * (dt / 16.67);
        t.y += t.vy * (dt / 16.67);
        const m = t.r + 8;
        if (t.x < m) {
          t.x = m;
          t.vx = Math.abs(t.vx);
        }
        if (t.x > state.w - m) {
          t.x = state.w - m;
          t.vx = -Math.abs(t.vx);
        }
        if (t.y < m + 50) {
          t.y = m + 50;
          t.vy = Math.abs(t.vy) * 0.5;
        }
        if (t.y > state.h * 0.72) {
          t.y = state.h * 0.72;
          t.vy = -Math.abs(t.vy);
        }
        if (t.life <= 0) dead.push(i);
      } else if (t.type === "meteor") {
        t.trail.push({ x: t.x, y: t.y, life: 1 });
        if (t.trail.length > 10) t.trail.shift();
        for (const p of t.trail) p.life -= dt * 0.004;
        t.trail = t.trail.filter((p) => p.life > 0);
        t.x += t.vx * (dt / 16.67);
        t.y += t.vy * (dt / 16.67);
        t.rot += t.spin;
        if (t.x < -80 || t.x > state.w + 80 || t.y > state.h + 80) dead.push(i);
      } else if (t.type === "boss") {
        t.angle += dt * 0.002;
        if (t.teleportIn > 0) t.teleportIn = Math.max(0, t.teleportIn - dt * 0.004);
        t.nextTeleport -= dt;
        if (t.nextTeleport <= 0) teleportBoss(t);
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
        const interval =
          phase === "cans" ? diff.spawn * 1.8 : phase === "saucers" ? diff.spawn * 1.45 : diff.spawn;
        state.spawnAcc += dt;
        while (state.spawnAcc >= interval) {
          state.spawnAcc -= interval;
          spawnForPhase();
        }
        state.meteorAcc += dt;
        if (state.meteorAcc >= 16000) {
          state.meteorAcc = 0;
          spawnMeteor();
        }
      }

      updateTargets(dt);
      updateHud();
    } else if (state.mode === "idle") {
      if (countType("balloon") < 3 && Math.random() < 0.02) spawnBalloon();
      updateTargets(dt * 0.7);
    }

    updateFx(dt);
  }

  /* —— draw —— */
  function drawBackground(ctx) {
    const g = ctx.createLinearGradient(0, 0, 0, state.h);
    g.addColorStop(0, "#6aa9d4");
    g.addColorStop(0.42, "#a9d0e6");
    g.addColorStop(0.7, "#cfe3b5");
    g.addColorStop(1, "#b5c98a");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, state.w, state.h);

    ctx.fillStyle = "#8fb56e";
    ctx.beginPath();
    ctx.moveTo(0, state.h * 0.74);
    ctx.quadraticCurveTo(state.w * 0.28, state.h * 0.64, state.w * 0.52, state.h * 0.72);
    ctx.quadraticCurveTo(state.w * 0.78, state.h * 0.8, state.w, state.h * 0.68);
    ctx.lineTo(state.w, state.h);
    ctx.lineTo(0, state.h);
    ctx.fill();

    ctx.fillStyle = "#7a9f5c";
    ctx.beginPath();
    ctx.moveTo(0, state.h * 0.84);
    ctx.quadraticCurveTo(state.w * 0.33, state.h * 0.76, state.w * 0.58, state.h * 0.86);
    ctx.quadraticCurveTo(state.w * 0.82, state.h * 0.92, state.w, state.h * 0.82);
    ctx.lineTo(state.w, state.h);
    ctx.lineTo(0, state.h);
    ctx.fill();

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
    if (t.penalty) {
      ctx.fillStyle = "#f4f4f4";
      ctx.beginPath();
      ctx.arc(0, 0, R, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#222";
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = "#222";
      ctx.beginPath();
      ctx.arc(-R * 0.28, -R * 0.12, R * 0.1, 0, Math.PI * 2);
      ctx.arc(R * 0.28, -R * 0.12, R * 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, R * 0.28, R * 0.28, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();
      ctx.fillStyle = "#e44747";
      ctx.font = `bold ${Math.floor(R * 0.34)}px SpaceGrotesk, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("-3", 0, R * 0.82);
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
    ctx.beginPath();
    ctx.arc(3, 5, t.r * 0.95, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.14)";
    ctx.fill();

    if (t.fruit === "banana") {
      ctx.lineCap = "round";
      ctx.strokeStyle = t.accent;
      ctx.lineWidth = t.r * 0.72;
      ctx.beginPath();
      ctx.arc(0, 0, t.r * 0.7, 0.15 * Math.PI, 1.15 * Math.PI);
      ctx.stroke();
      ctx.strokeStyle = t.color;
      ctx.lineWidth = t.r * 0.55;
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,0.45)";
      ctx.lineWidth = t.r * 0.12;
      ctx.stroke();
    } else if (t.fruit === "watermelon") {
      const g = ctx.createRadialGradient(-t.r * 0.2, -t.r * 0.2, 4, 0, 0, t.r);
      g.addColorStop(0, "#6fd18a");
      g.addColorStop(0.55, t.color);
      g.addColorStop(1, "#1f6b38");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, t.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.lineWidth = 3;
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.arc(0, 0, t.r * 0.75, -0.4 + i * 0.15, 0.4 + i * 0.15);
        ctx.stroke();
      }
      ctx.fillStyle = t.accent;
      ctx.beginPath();
      ctx.moveTo(-t.r, 0);
      ctx.arc(0, 0, t.r, Math.PI * 0.15, Math.PI * 0.85);
      ctx.closePath();
      ctx.globalAlpha = 0.85;
      ctx.fill();
      ctx.globalAlpha = 1;
    } else {
      const g = ctx.createRadialGradient(-t.r * 0.35, -t.r * 0.35, 3, 0, 0, t.r);
      g.addColorStop(0, "#fff8");
      g.addColorStop(0.25, t.color);
      g.addColorStop(1, t.accent);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, t.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.12)";
      ctx.lineWidth = 2;
      ctx.stroke();
      if (t.leaf) {
        ctx.fillStyle = t.leaf;
        ctx.beginPath();
        ctx.ellipse(t.r * 0.1, -t.r * 0.9, t.r * 0.38, t.r * 0.18, -0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#2d5c28";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -t.r * 0.75);
        ctx.lineTo(0, -t.r * 1.05);
        ctx.stroke();
      }
      if (t.fruit === "orange") {
        ctx.strokeStyle = "rgba(255,255,255,0.25)";
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(a) * t.r * 0.85, Math.sin(a) * t.r * 0.85);
          ctx.stroke();
        }
      }
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
      const bg = ctx.createLinearGradient(0, 0, 0, R * (boss ? 5.5 : 3.8));
      bg.addColorStop(0, boss ? "rgba(180,120,255,0.4)" : "rgba(100,230,170,0.35)");
      bg.addColorStop(1, "rgba(100,230,170,0)");
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.moveTo(-R * 0.35, R * 0.25);
      ctx.lineTo(R * 0.35, R * 0.25);
      ctx.lineTo(R * (boss ? 1.7 : 1.15), R * (boss ? 5.5 : 3.8));
      ctx.lineTo(-R * (boss ? 1.7 : 1.15), R * (boss ? 5.5 : 3.8));
      ctx.fill();
    }

    // shadow
    ctx.fillStyle = "rgba(0,0,0,0.16)";
    ctx.beginPath();
    ctx.ellipse(0, R * 0.55, R * 0.85, R * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();

    // dome
    const dome = ctx.createRadialGradient(-R * 0.2, -R * 0.45, 2, 0, -R * 0.1, R * 0.55);
    dome.addColorStop(0, "#fff");
    dome.addColorStop(0.35, boss ? "#d7b8ff" : t.gold ? "#fff0b0" : "#bfe9ff");
    dome.addColorStop(1, boss ? "#6b3fa0" : t.gold ? "#c9a016" : "#4f7f9a");
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
      body.addColorStop(0, "#5a6b78");
      body.addColorStop(0.5, "#e2e8ee");
      body.addColorStop(1, "#5a6b78");
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
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(Math.sin(a) * R * 0.72, R * 0.22 + Math.cos(a) * 2, boss ? 5 : 3.6, 0, Math.PI * 2);
      ctx.fill();
    });

    if (boss) {
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, R * 0.12, R * 0.7, R * 0.18, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.font = `bold ${Math.floor(R * 0.22)}px SpaceGrotesk, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("MOTHERSHIP", 0, R * 0.18);
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

  function drawTarget(ctx, t) {
    if (t.type === "balloon") drawBalloon(ctx, t);
    else if (t.type === "target") drawBullseye(ctx, t);
    else if (t.type === "can") drawCan(ctx, t);
    else if (t.type === "fruit") drawFruit(ctx, t);
    else if (t.type === "saucer") drawSaucer(ctx, t, false);
    else if (t.type === "boss") drawSaucer(ctx, t, true);
    else if (t.type === "meteor") drawMeteor(ctx, t);
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
      hint: "Skill run: sparse targets, combo multipliers, then a teleporting boss.",
      cta: "Play",
    });
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
      title: "Zap Gallery",
      hint: "Skill run: sparse targets, combo multipliers, then a teleporting boss.",
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
      wave: document.querySelector("[data-zap-wave]"),
      bossWrap: document.querySelector("[data-zap-boss]"),
      bossFill: document.querySelector("[data-zap-boss-fill]"),
      overlay: document.querySelector("[data-zap-overlay]"),
      kicker: document.querySelector("[data-zap-kicker]"),
      title: document.querySelector("[data-zap-title]"),
      hint: document.querySelector("[data-zap-hint]"),
      start: document.querySelector("[data-zap-start]"),
    };

    state.best = loadBest();
    updateHud();
    setOverlay(true);

    state.els.start?.addEventListener("click", (e) => {
      e.stopPropagation();
      startGame();
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
