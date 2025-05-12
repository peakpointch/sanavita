(() => {
  // src/ts/banner.ts
  function manageBanners(bannerWrapper, path) {
    if (!bannerWrapper) {
      return;
    }
    const allBanners = bannerWrapper.querySelectorAll(
      "[banner-type]:not(:has(.w-dyn-empty))"
    );
    if (!allBanners.length) {
      return;
    }
    let hasExpectedBanner = false;
    const hasSpecialBannerPath = Object.values(window.bannerType).some(
      (bannerPath) => path.includes(bannerPath)
    );
    allBanners.forEach((banner) => {
      const existingBanner = banner.getAttribute("banner-type");
      if (existingBanner && path.includes(window.bannerType[existingBanner])) {
        hasExpectedBanner = true;
      }
    });
    allBanners.forEach((banner) => {
      const currentBannerType = banner.getAttribute("banner-type") || "";
      if (!currentBannerType) {
        return;
      }
      if (currentBannerType === "default") {
        if (!hasSpecialBannerPath || !hasExpectedBanner) {
          banner.classList.add("show");
          setBannerSpeed(banner);
        } else {
          banner.classList.add("hide");
        }
      } else if (path.includes(window.bannerType[currentBannerType])) {
        banner.classList.add("show");
        setBannerSpeed(banner);
      } else {
        banner.classList.add("hide");
      }
    });
  }
  function setBannerSpeed(track) {
    const marqueeTrack = track.querySelector(".marquee_track");
    if (!marqueeTrack) {
      return 0;
    }
    const distance = marqueeTrack.offsetWidth;
    const pixelsPerSecond = 100;
    const duration = distance / pixelsPerSecond;
    marqueeTrack.style.animationDuration = `${duration}s`;
    return duration;
  }
  function setAllSpeeds(main) {
    const allMarquees = main.querySelectorAll(".marquee_component");
    allMarquees.forEach((marquee) => setBannerSpeed(marquee));
  }
  window.addEventListener("DOMContentLoaded", () => {
    const main = document.querySelector("main");
    const nav = document.querySelector(
      '[pp-type="nav-wrapper"]'
    );
    const bannerWrapper = nav?.querySelector(
      '[pp-type="infobanner-component"]'
    );
    const path = window.location.pathname;
    manageBanners(bannerWrapper, path);
    setAllSpeeds(main);
  });
})();
//# sourceMappingURL=banner.js.map
