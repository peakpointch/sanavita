(() => {
  // src/js/circle.js
  function updateOffset() {
    const itemWrap = page.querySelector(".pgc-item_wrap");
    const baseDeg = 10;
    const minWidth = 1270;
    const minOffset = baseDeg;
    let vwOffset = -1 / 150 * window.innerWidth + 8;
    vwOffset = Math.max(0, vwOffset);
    let newOffset = Math.max(baseDeg, baseDeg + vwOffset);
    if (itemWrap) {
      itemWrap.style.setProperty("--item-offset", `${newOffset}deg`);
    }
  }
  updateOffset();
  window.addEventListener("resize", updateOffset);
})();
