(() => {
  // src/js/sanavita-video.js
  var VIDEO_COMPONENT_SELECTOR = "[data-player-component]";
  var VIDEO_SELECTOR = "[data-player-video]";
  var CONTROLS_SELECTOR = '[data-player-element="controls"]';
  var PLAY_BUTTON_SELECTOR = '[data-player-button="play"]';
  var MUTE_BUTTON_SELECTOR = '[data-player-button="mute"]';
  document.addEventListener("DOMContentLoaded", () => {
    const component = document.querySelector(VIDEO_COMPONENT_SELECTOR);
    const videoElement = component.querySelector(VIDEO_SELECTOR);
    const controls = component.querySelector(CONTROLS_SELECTOR);
    const playButton = component.querySelector(PLAY_BUTTON_SELECTOR);
    const muteButton = component.querySelector(MUTE_BUTTON_SELECTOR);
    const isAutoplay = JSON.parse(videoElement.dataset.playerAutoplay);
    const isMuted = JSON.parse(videoElement.dataset.playerMuted);
    videoElement.autoplay = false;
    videoElement.removeAttribute("autoplay");
    videoElement.loop = true;
    videoElement.muted = isMuted;
    if (isAutoplay) {
      videoElement.play();
    }
    function showControls() {
      controls ? controls.style.opacity = 1 : null;
    }
    function hideControls() {
      controls ? controls.style.opacity = 0 : null;
    }
    function togglePlay() {
      const pauseState = playButton.querySelector('[data-player-button-state="pause"]');
      const playState = playButton.querySelector('[data-player-button-state="play"]');
      if (videoElement.paused) {
        videoElement.play();
        playState.classList.add("hide");
        pauseState.classList.remove("hide");
      } else {
        videoElement.pause();
        playState.classList.remove("hide");
        pauseState.classList.add("hide");
        showControls();
      }
    }
    function toggleMute() {
      console.log("MUTE BUTTON PRESSED");
      const muteState = muteButton.querySelector('[data-player-button-state="unmuted"]');
      const unmuteState = muteButton.querySelector('[data-player-button-state="muted"]');
      if (videoElement.muted) {
        videoElement.muted = false;
        muteState.classList.remove("hide");
        unmuteState.classList.add("hide");
      } else {
        videoElement.muted = true;
        muteState.classList.add("hide");
        unmuteState.classList.remove("hide");
      }
    }
    showControls();
    videoElement.addEventListener("pause", showControls);
    component.addEventListener("mouseenter", showControls);
    component.addEventListener("mouseleave", () => {
      if (!videoElement.paused) {
        hideControls();
      }
    });
    playButton.addEventListener("click", togglePlay);
    muteButton?.addEventListener("click", toggleMute);
  });
})();
