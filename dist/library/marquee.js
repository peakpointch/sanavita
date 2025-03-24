// library/marquee.ts
function setBannerSpeed(track) {
  if (!track)
    return;
  const distance = track.offsetWidth;
  const pixelsPerSecond = 100;
  const duration = distance / pixelsPerSecond;
  track.style.animationDuration = `${duration}s`;
  return duration;
}
function setAllSpeeds(main) {
  const allMarquees = main.querySelectorAll(`[data-marquee-element="component"]`);
  allMarquees.forEach((marquee) => {
    const track = marquee.querySelector(`[data-marquee-element="track"]`);
    const slides = Array.from(track.children);
    if (slides.length === 1) {
      const cloned = slides[0].cloneNode(true);
      track.appendChild(cloned);
    } else if (slides.length < 1 || !slides.length) {
      throw new Error(`Marquee: The track has no slides. skipping initialization.`);
    } else {
      return;
    }
    setBannerSpeed(track);
  });
}
document.addEventListener("DOMContentLoaded", () => {
  const main = document.querySelector("main");
  setAllSpeeds(main);
  console.log("HELLO MARQUEE");
});
