(() => {
  // src/js/marquee.js
  var isFirstClick = true;
  var marquees = document.querySelectorAll('[pp-type="image-marquee"]');
  function handleMarqueeEvents(allMarquees) {
    allMarquees.forEach((component) => {
      let btn = component.querySelector(".marquee_pause");
      let track = component.querySelector(".marquee_track");
      if (!btn | !track) {
        return;
      }
      btn.addEventListener("click", () => {
        track.classList.toggle("marquee_paused");
        if (isFirstClick) {
          btn.innerText = "play";
          isFirstClick = false;
        } else {
          btn.innerText = "pause";
          isFirstClick = true;
        }
      });
    });
  }
  handleMarqueeEvents(marquees);
})();
