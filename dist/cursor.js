function throttle(func, delay) {
  let lastCall = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCall < delay) return;
    lastCall = now;
    return func(...args);
  };
}

document.addEventListener("DOMContentLoaded", () => {
  const trail = document.createElement("img");
  trail.src = "assets/cursor/trail.svg";
  trail.alt = "";
  trail.className = "trail-cursor";
  document.body.appendChild(trail);

  let animationFrameId = null;

  const handleMouseMove = throttle((e) => {
    if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
    trail.style.display = "block";
    animationFrameId = requestAnimationFrame(() => {
      trail.style.left = e.pageX + "px";
      trail.style.top = e.pageY + "px";
    });
  }, 0);

  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mousedown", () => trail.classList.add("clicked"));
  document.addEventListener("mouseup", () => trail.classList.remove("clicked"));
  document.addEventListener("mouseenter", () => (trail.style.display = "block"));
  document.addEventListener("mouseleave", () => (trail.style.display = "none"));
});
