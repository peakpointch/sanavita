(() => {
  // COMPONENT
  const VIDEO_COMPONENT_SELECTOR = '[data-player-component]';

  // ELEMENTS
  const VIDEO_SELECTOR = '[data-player-video]';
  const PLAY_BUTTON_SELECTOR = '[data-player-button="play"]';
  const MUTE_BUTTON_SELECTOR = '[data-player-button="mute"]';

  document.addEventListener("DOMContentLoaded", () => {
    const component = document.querySelector(VIDEO_COMPONENT_SELECTOR);
    const videoElement = component.querySelector(VIDEO_SELECTOR);
    const playButton = component.querySelector(PLAY_BUTTON_SELECTOR);
    const muteButton = component.querySelector(MUTE_BUTTON_SELECTOR);

    // Mute the video by default and play automatically
    videoElement.loop = true;
    videoElement.muted = true;
    videoElement.autoplay = true;
    videoElement.play();

    function togglePlay() {
      const pauseState = playButton.querySelector('[data-player-button-state="pause"]');
      const playState = playButton.querySelector('[data-player-button-state="play"]');

      // Toggle video play/pause
      if (videoElement.paused) {
        videoElement.play();
        playState.classList.add('hide');  // Hide play button
        pauseState.classList.remove('hide');  // Show pause button
      } else {
        videoElement.pause();
        playState.classList.remove('hide');  // Show play button
        pauseState.classList.add('hide');  // Hide pause button
      }
    }

    function toggleMute() {
      console.log("MUTE BUTTON PRESSED");

      const muteState = muteButton.querySelector('[data-player-button-state="unmuted"]');
      const unmuteState = muteButton.querySelector('[data-player-button-state="muted"]');
      // Toggle video mute/unmute
      if (videoElement.muted) {
        videoElement.muted = false;
        muteState.classList.remove('hide');
        unmuteState.classList.add('hide');
      } else {
        videoElement.muted = true;
        muteState.classList.add('hide');
        unmuteState.classList.remove('hide');
      }
    }

    // Add event listeners
    playButton.addEventListener('click', togglePlay);
    muteButton.addEventListener('click', toggleMute);
  });
})();

window.addEventListener('LR_UPLOAD_FINISH', (e) => {
  console.log(e.detail);
  document.getElementById('uploadcare-uuid').value = e.detail.data[0].uuid;
  document.getElementById('uploadcare-file').value = e.detail.data[0].cdnUrl;
})
