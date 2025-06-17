interface Window {
  bannerType: {
    [key: string]: string;
  };
}

function manageBanners(bannerList: HTMLElement[]): void {
  if (!bannerList || !bannerList.length) {
    throw new Error(`Banner list cannot be empty. Check your banner selector.`);
  }

  let hasExpectedBanner = false;
  const path = window.location.pathname;
  const hasSpecialBannerPath = Object.values(window.bannerType).some(
    (bannerPath) => path.includes(bannerPath)
  );

  // Is it a special path that has the banner expected by the path?
  bannerList.forEach((banner) => {
    const currentBannerId = banner.getAttribute("data-banner-id") || '';
    if (!currentBannerId) {
      throw new Error(`Invalid or missing banner id.`);
    }

    if (path.includes(window.bannerType[currentBannerId])) {
      hasExpectedBanner = true;
    }
  });

  bannerList.forEach((banner) => {
    const currentBannerId = banner.getAttribute("data-banner-id") || '';
    if (!currentBannerId) {
      throw new Error(`Invalid or missing banner id.`);
    }

    if (currentBannerId === "default") {
      if (!hasSpecialBannerPath || !hasExpectedBanner) {
        banner.classList.add("show");
      } else {
        banner.classList.add("hide");
      }
    } else if (path.includes(window.bannerType[currentBannerId])) {
      banner.classList.add("show");
    } else {
      banner.classList.add("hide");
    }
  });
}

function createBannerManager(component: HTMLElement): void {
  try {
    const banners = component.querySelectorAll<HTMLElement>('[data-banner-id]');
    const bannerList = Array.from(banners);
    manageBanners(bannerList);
  } catch (e) {
    console.error(`Banner manager: ${e.message}`);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const main = document.querySelector<HTMLElement>("main");
  const bannerWrapper: HTMLElement | null = document.body.querySelector('[data-banner-element="component"]');

  createBannerManager(bannerWrapper);
});
