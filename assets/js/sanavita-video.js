// COMPONENT
const VIDEO_COMPONENT_SELECTOR = '[data-player-component]';

// ELEMENTS
const VIDEO_SELECTOR = '[data-player-video]';
const CONTROLS_SELECTOR = '[data-player-element="controls"]';
const PLAY_BUTTON_SELECTOR = '[data-player-button="play"]';
const MUTE_BUTTON_SELECTOR = '[data-player-button="mute"]';

document.addEventListener("DOMContentLoaded", () => {
  const component = document.querySelector(VIDEO_COMPONENT_SELECTOR);
  const videoElement = component.querySelector(VIDEO_SELECTOR);
  const controls = component.querySelector(CONTROLS_SELECTOR);
  const playButton = component.querySelector(PLAY_BUTTON_SELECTOR);
  const muteButton = component.querySelector(MUTE_BUTTON_SELECTOR);

  // Get autoplay and muted attributes from the video element
  const isAutoplay = JSON.parse(videoElement.dataset.playerAutoplay);
  const isMuted = JSON.parse(videoElement.dataset.playerMuted);

  // Set video properties based on attributes
  videoElement.autoplay = false;
  videoElement.removeAttribute('autoplay');
  videoElement.loop = true;
  videoElement.muted = isMuted;  // Initialize mute state based on data attribute
  if (isAutoplay) {
    videoElement.play();  // Only autoplay if the attribute is true
  }

  function showControls() {
    controls ? controls.style.opacity = 1 : null;
  }
  function hideControls() {
    controls ? controls.style.opacity = 0 : null;
  }

  // Function to toggle play/pause
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
      showControls();
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

  // Show controls initially when video is paused or hasn't started yet
  showControls();

  videoElement.addEventListener('pause', showControls);

  // Add event listener for mouse events to show/hide controls
  component.addEventListener('mouseenter', showControls);  // Show controls on hover
  component.addEventListener('mouseleave', () => {
    if (!videoElement.paused) {
      hideControls();  // Hide controls only if the video is playing
    }
  });

  // Add event listeners
  playButton.addEventListener('click', togglePlay);
  muteButton?.addEventListener('click', toggleMute);
});

window.addEventListener('LR_UPLOAD_FINISH', (e) => {
  console.log(e.detail);
  document.getElementById('uploadcare-uuid').value = e.detail.data[0].uuid;
  document.getElementById('uploadcare-file').value = e.detail.data[0].cdnUrl;
});

