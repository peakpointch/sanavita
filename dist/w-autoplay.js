(() => {
  // src/ts/w-autoplay.ts
  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
      document.body.querySelectorAll(`[data-autoplay="true"] video[autoplay]`).forEach((video) => video.play());
    }, 1e3);
  });
})();
//# sourceMappingURL=w-autoplay.js.map
