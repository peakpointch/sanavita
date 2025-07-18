import Lenis from "lenis";

document.addEventListener("DOMContentLoaded", () => {
  const lenis = new Lenis({
    autoRaf: true,
  });

  const resizeObserver = new ResizeObserver(() => {
    lenis.resize();
  });

  resizeObserver.observe(document.body);
});
