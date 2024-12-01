// Speziellen Infobanner in die Navbar verschieben

interface Window {
  bannerType: {
    [key: string]: string;
  };
}

function manageBanners(bannerWrapper: HTMLElement | null, path: string): void {
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
        setBannerSpeed(banner as HTMLElement);
      } else {
        banner.classList.add("hide");
      }
    } else if (path.includes(window.bannerType[currentBannerType])) {
      banner.classList.add("show");
      setBannerSpeed(banner as HTMLElement);
    } else {
      banner.classList.add("hide");
    }
  });
}

function setBannerSpeed(track: HTMLElement): number {
  const marqueeTrack = track.querySelector(".marquee_track") as HTMLElement;
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
  const allMarquees = main.querySelectorAll(".marquee_component");
  allMarquees.forEach((marquee) => setBannerSpeed(marquee as HTMLElement));
}

window.addEventListener("DOMContentLoaded", () => {
  const main = document.querySelector("main") as HTMLElement;
  const nav = document.querySelector(
    '[pp-type="nav-wrapper"]'
  ) as HTMLElement | null;
  const bannerWrapper = nav?.querySelector(
    '[pp-type="infobanner-component"]'
  ) as HTMLElement | null;
  const path = window.location.pathname;

  manageBanners(bannerWrapper, path);
  setAllSpeeds(main);
});
