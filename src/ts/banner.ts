// Speziellen Infobanner in die Navbar verschieben

declare global {
  interface Window {
    bannerType: {
      [key: string]: string;
    };
  }
}

function manageBanners(bannerWrapper: HTMLElement | null, path: string): void {
  if (!bannerWrapper) {
    return;
  }

  const allBanners = bannerWrapper.querySelectorAll<HTMLElement>(
    "[banner-type]:not(:has(.w-dyn-empty))"
  );
  if (!allBanners.length) {
    return;
  }

  let hasExpectedBanner = false;
  const hasSpecialBannerPath = Object.values(window.bannerType).some(
    (bannerPath) => path.includes(bannerPath)
  );

  // Is it a special path that has the banner expected by the path?
  allBanners.forEach((banner) => {
    const existingBanner = banner.getAttribute("banner-type");
    if (existingBanner && path.includes(window.bannerType[existingBanner])) {
      hasExpectedBanner = true;
    }
  });

  allBanners.forEach((banner) => {
    const currentBannerType: string = banner.getAttribute("banner-type") || "";
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

function setBannerSpeed(track: HTMLElement): number {
  const marqueeTrack = track.querySelector<HTMLElement>(".marquee_track");
  if (!marqueeTrack) {
    return 0;
  }

  const distance = marqueeTrack.offsetWidth;
  const pixelsPerSecond = 100; // Adjust this value to change the speed
  const duration = distance / pixelsPerSecond;
  marqueeTrack.style.animationDuration = `${duration}s`;
  return duration;
}

function setAllSpeeds(main: HTMLElement): void {
  const allMarquees = main.querySelectorAll<HTMLElement>(".marquee_component");
  allMarquees.forEach((marquee) => setBannerSpeed(marquee));
}

window.addEventListener("DOMContentLoaded", () => {
  const main = document.querySelector<HTMLElement>("main");
  const nav: HTMLElement | null = document.querySelector(
    '[pp-type="nav-wrapper"]'
  );
  const bannerWrapper: HTMLElement | null = nav?.querySelector(
    '[pp-type="infobanner-component"]'
  );
  const path = window.location.pathname;

  manageBanners(bannerWrapper, path);
  setAllSpeeds(main);
});
