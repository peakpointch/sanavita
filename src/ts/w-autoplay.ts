document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    document.body.querySelectorAll<HTMLVideoElement>(`[data-autoplay="true"] video[autoplay]`)
      .forEach(video => video.play());
  }, 1000);
});
