(() => {
  // src/ts/banner.ts
  function manageBanners(bannerList) {
    if (!bannerList || !bannerList.length) {
      throw new Error(`Banner list cannot be empty. Check your banner selector.`);
    }
    let hasExpectedBanner = false;
    const path = window.location.pathname;
    const hasSpecialBannerPath = Object.values(window.bannerType).some(
      (bannerPath) => path.includes(bannerPath)
    );
    bannerList.forEach((banner) => {
      const currentBannerId = banner.getAttribute("data-banner-id") || "";
      if (!currentBannerId) {
        throw new Error(`Invalid or missing banner id.`);
      }
      if (path.includes(window.bannerType[currentBannerId])) {
        hasExpectedBanner = true;
      }
    });
    bannerList.forEach((banner) => {
      const currentBannerId = banner.getAttribute("data-banner-id") || "";
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
  function createBannerManager(component) {
    try {
      const banners = component.querySelectorAll("[data-banner-id]");
      const bannerList = Array.from(banners);
      manageBanners(bannerList);
    } catch (e) {
      console.error(`Banner manager: ${e.message}`);
    }
  }
  document.addEventListener("DOMContentLoaded", () => {
    const main = document.querySelector("main");
    const bannerWrapper = document.body.querySelector('[data-banner-element="component"]');
    createBannerManager(bannerWrapper);
  });
})();
//# sourceMappingURL=banner.js.map
