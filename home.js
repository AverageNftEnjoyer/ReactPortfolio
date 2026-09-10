document.addEventListener("DOMContentLoaded", () => {
  if ("paintWorklet" in CSS) {
    CSS.paintWorklet.addModule("squircle.js");
  }

  const container = document.querySelector(".card-grid");
  const desktopGrid = window.matchMedia("(min-width: 768px)");
  container?.addEventListener(
    "wheel",
    (e) => {
      if (!desktopGrid.matches || !e.deltaY) return;
      e.preventDefault();
      container.scrollLeft += e.deltaY * 0.4;
    },
    { passive: false }
  );

  initClickSound();
  initChannelPopup();
});

const CHANNEL_ORDER = ["about", "story", "certs", "arcade"];

const CHANNEL_META = {
  about: {
    kicker: "profile",
    title: "About Me",
    dock: "About Me",
  },
  story: {
    kicker: "journal",
    title: "My Career Path",
    dock: "My Career Path",
  },
  certs: {
    kicker: "credentials",
    title: "Certifications",
    dock: "Certifications",
  },
  arcade: {
    kicker: "play",
    title: "Zap Gallery",
    dock: "Zap Gallery",
  },
};

const HOME_DOCK_LABEL = "Jack Pastor";

function initClickSound() {
  let clickAudio = null;

  const ensureAudio = () => {
    if (clickAudio) return clickAudio;
    clickAudio = new Audio("assets/click.mp3");
    clickAudio.preload = "auto";
    clickAudio.volume = 0.55;
    clickAudio.loop = false;
    return clickAudio;
  };

  const playClick = () => {
    const base = ensureAudio();
    const sfx = base.cloneNode();
    sfx.volume = base.volume;
    sfx.loop = false;
    sfx.play().catch(() => {
    });
  };
  document.querySelectorAll(".card-grid .card").forEach((el) => {
    el.addEventListener("click", playClick);
  });
}

function initChannelPopup() {
  const homeMain = document.querySelector(".home-main");
  const popup = document.getElementById("channel-popup");
  const dock = document.querySelector("[data-dock]");
  if (!homeMain || !popup || !dock) return;

  const panel = popup.querySelector("[data-popup-panel]");
  const kicker = popup.querySelector("[data-popup-kicker]");
  const title = popup.querySelector("[data-popup-title]");
  const dockLabel = dock.querySelector("[data-dock-label]");
  const homeBtn = dock.querySelector("[data-dock-home]");
  const nextBtn = dock.querySelector("[data-dock-next]");
  const views = popup.querySelectorAll("[data-view]");
  const channelBtns = document.querySelectorAll("[data-channel]");

  let open = false;
  let animating = false;
  let originRect = null;
  let lastFocus = null;
  let activeChannel = null;
  let reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  window
    .matchMedia("(prefers-reduced-motion: reduce)")
    .addEventListener("change", (e) => {
      reduceMotion = e.matches;
    });

  const expandedMetrics = () => ({
    top: 0,
    left: 0,
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const placePanel = (rect) => {
    panel.style.top = `${rect.top}px`;
    panel.style.left = `${rect.left}px`;
    panel.style.width = `${rect.width}px`;
    panel.style.height = `${rect.height}px`;
  };

  const showView = (id) => {
    views.forEach((view) => {
      view.hidden = view.dataset.view !== id;
    });
  };

  const setMeta = (id) => {
    const meta = CHANNEL_META[id];
    if (!meta) return;
    activeChannel = id;
    kicker.textContent = meta.kicker;
    title.textContent = meta.title;
    if (dockLabel) dockLabel.textContent = meta.dock;
  };

  const syncArcade = (id) => {
    const game = window.ZapGallery;
    popup.classList.toggle("is-arcade", id === "arcade" && open);
    if (!game) return;
    if (id === "arcade") game.activate();
    else if (game.isActive()) game.deactivate();
  };

  const setDockChannelMode = (on) => {
    dock.classList.toggle("is-channel", on);
    if (!on && dockLabel) dockLabel.textContent = HOME_DOCK_LABEL;
  };

  const waitForTransition = () =>
    new Promise((resolve) => {
      const done = () => {
        panel.removeEventListener("transitionend", onEnd);
        resolve();
      };
      const onEnd = (e) => {
        if (e.target !== panel) return;
        if (e.propertyName !== "width" && e.propertyName !== "height") return;
        done();
      };
      panel.addEventListener("transitionend", onEnd);
      window.setTimeout(done, reduceMotion ? 40 : 700);
    });

  async function openChannel(btn) {
    if (open || animating) return;
    const id = btn.dataset.channel;
    if (!CHANNEL_META[id]) return;

    animating = true;
    lastFocus = document.activeElement;
    originRect = btn.getBoundingClientRect();
    setMeta(id);
    showView(id);
    setDockChannelMode(true);

    popup.hidden = false;
    popup.setAttribute("aria-hidden", "false");
    popup.classList.remove("is-closing", "is-ready");
    placePanel(originRect);
    panel.classList.remove("is-expanded");

    void panel.offsetWidth;
    popup.classList.add("is-open");
    homeMain.classList.add("is-channel-open");

    requestAnimationFrame(() => {
      const end = expandedMetrics();
      placePanel(end);
      panel.classList.add("is-expanded");
    });

    await waitForTransition();
    popup.classList.add("is-ready");
    open = true;
    animating = false;
    syncArcade(id);
    homeBtn?.focus();
  }

  const waitForPopupFadeOut = () =>
    new Promise((resolve) => {
      const done = () => {
        popup.removeEventListener("transitionend", onEnd);
        resolve();
      };
      const onEnd = (e) => {
        if (e.target !== popup || e.propertyName !== "opacity") return;
        done();
      };
      popup.addEventListener("transitionend", onEnd);
      window.setTimeout(done, reduceMotion ? 40 : 450);
    });

  async function closeChannel() {
    if (!open || animating) return;
    animating = true;

    window.ZapGallery?.deactivate();
    popup.classList.remove("is-arcade");
    popup.classList.remove("is-ready");
    popup.classList.add("is-closing");
    setDockChannelMode(false);

    const target =
      originRect ||
      ({
        top: window.innerHeight / 2 - 72,
        left: window.innerWidth / 2 - 128,
        width: 256,
        height: 144,
      });

    placePanel(target);
    panel.classList.remove("is-expanded");
    homeMain.classList.remove("is-channel-open");

    await waitForTransition();

    popup.classList.remove("is-open");
    await waitForPopupFadeOut();

    popup.classList.remove("is-closing");
    popup.setAttribute("aria-hidden", "true");
    popup.hidden = true;
    open = false;
    animating = false;
    activeChannel = null;
    lastFocus?.focus?.();
  }

  function goNextChannel() {
    if (!open || animating || !activeChannel) return;
    const idx = CHANNEL_ORDER.indexOf(activeChannel);
    const nextId = CHANNEL_ORDER[(idx + 1) % CHANNEL_ORDER.length];
    setMeta(nextId);
    showView(nextId);
    syncArcade(nextId);
  }

  channelBtns.forEach((btn) => {
    btn.addEventListener("click", () => openChannel(btn));
  });

  homeBtn?.addEventListener("click", () => {
    if (open) closeChannel();
  });

  nextBtn?.addEventListener("click", () => {
    if (open) {
      goNextChannel();
      return;
    }
    const first = document.querySelector(`[data-channel="${CHANNEL_ORDER[0]}"]`);
    if (first) openChannel(first);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && open) {
      e.preventDefault();
      closeChannel();
    }
  });

  window.addEventListener("resize", () => {
    if (!open || animating) return;
    placePanel(expandedMetrics());
  });
}
