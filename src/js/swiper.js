import Swiper from "swiper/bundle";

function swiperEmpty(swiperElement) {
  const slides = swiperElement.querySelectorAll(".swiper-slide");
  if (!slides.length > 0) {
    console.warn(`Swiper "${swiperElement.getAttribute("swiper-component")}": Skip empty component.`);
    return true;
  }
  return false
}

function hideEmptySwiper(swiperElement) {
  const swiperId = swiperElement.getAttribute("swiper-component");
  const swiperMode = swiperElement.dataset.swiperMode;
  const navigationPrefix = setNavigationPrefix(swiperId, swiperMode);

  const dataNav = (swiperElement.dataset.swiperNav || ".swiper-button").toString();
  const prevEl = `${navigationPrefix}${dataNav}:not(.next)`;
  const nextEl = `${navigationPrefix}${dataNav}.next`;


  swiperElement.classList.add("hide");
}

function setNavigationPrefix(swiperId, swiperMode) {
  let navigationPrefix = "";
  if (swiperMode && swiperMode === "cms") {
    navigationPrefix = `[swiper-navigation-for="${swiperId}"] ` // This space is mandatory
  }
  return navigationPrefix;
}

function parseSlidesPerView(value) {
  return value === "auto" ? "auto" : parseFloat(value) || "auto";
}

function setupAutoplay(enabled, delay = 4000) {
  if (!enabled) {
    return false;
  }

  return {
    delay: delay,
    pauseOnMouseEnter: true,
    disableOnInteraction: true,
  }
}

function parseSwiperOptions(attributes) {
  const settings = {};
  attributes.forEach((attribute, index) => {
    const name = attribute;

  })
  return settings;
}

function initWebflowSwipers() {
  // Remove all empty slides
  document.querySelectorAll(".w-slide:empty").forEach((e) => e.remove());

  const webflowSwipers = document.querySelectorAll(
    '[swiper-component]:not([swiper-component="default"])'
  );

  webflowSwipers.forEach((swiperElement) => {
    //if (skipEmptySwiper(swiperElement)) {
    //  hideEmptySwiper(swiperElement)
    //  return;
    //}
    swiperElement.classList.remove("initial-hide");

    const attributes = [
      {
        name: "swiper-component",
        type: "component"
      },
      {
        name: "data-swiper-mode",
        type: "text"
      },
      {
        name: "data-swiper-nav",
        type: "text",
        default: ".swiper-button"
      },
      {
        name: "data-swiper-auto-height",
        type: "boolean",
        default: false
      },
      {
        name: "data-swiper-slides-per-view",
        type: "floatOrAuto",
      },
      {
        name: "data-swiper-space",
        type: "float",
        default: 8
      },
      {
        name: "data-swiper-centered-slides",
        type: "boolean",
        default: false
      },
      {
        name: "data-swiper-loop",
        type: "boolean",
        default: true
      },
      {
        name: "data-swiper-touch-move",
        type: "boolean",
        default: true
      },
      {
        name: "data-swiper-autoplay",
        type: "boolean",
        default: true
      },
      {
        name: "data-swiper-autoplay-delay",
        type: "float",
        default: 4000
      },
      {
        name: "data-swiper-speed",
        type: "float",
        default: 400
      },
    ]

    const swiperId = swiperElement.getAttribute("swiper-component");
    const swiperMode = swiperElement.dataset.swiperMode;
    const dataNav = (swiperElement.dataset.swiperNav || ".swiper-button").toString();
    const autoHeight = JSON.parse(swiperElement.dataset.swiperAutoHeight || "false");
    const slidesPerView = parseSlidesPerView(swiperElement.dataset.swiperSlidesPerView);
    const spaceBetween = parseFloat(swiperElement.dataset.swiperSpace || 8);
    const centeredSlides = JSON.parse(swiperElement.dataset.swiperCenteredSlides || "false");
    const loop = JSON.parse(swiperElement.dataset.swiperLoop || "true");
    const allowTouchMove = JSON.parse(swiperElement.dataset.swiperTouchMove || "true");
    const autoplay = JSON.parse(swiperElement.dataset.swiperAutoplay || "true");
    const autoplayDelay = parseFloat(swiperElement.dataset.swiperAutoplayDelay || 4000);
    const speed = parseFloat(swiperElement.dataset.swiperSpeed || 400);

    const navigationPrefix = setNavigationPrefix(swiperId, swiperMode);
    const prevEl = `${navigationPrefix}${dataNav}:not(.next)`;
    const nextEl = `${navigationPrefix}${dataNav}.next`;
    const autoplayOptions = setupAutoplay(autoplay, autoplayDelay);

    const swiper = new Swiper(swiperElement, {
      navigation: {
        prevEl: prevEl,
        nextEl: nextEl,
      },
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
      autoplay: autoplayOptions,
      allowTouchMove: allowTouchMove,
      centeredSlides: centeredSlides,
      effect: "slide",
      speed: speed,
      autoHeight: autoHeight,
      spaceBetween: spaceBetween,
      loop: loop,
      slidesPerView: slidesPerView,
      debugger: true,
    });

    swiper.autoplay.stop();

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          swiper.autoplay.start();
        } else {
          swiper.autoplay.stop();
        }
      })
    }, {
      threshold: 0.2
    });

    observer.observe(swiperElement);
  });
}

function initDefaultSwipers() {
  const defaultSwipers = document.querySelectorAll(`[default-swiper-component]`);

  defaultSwipers.forEach((swiperElement) => {
    if (swiperEmpty(swiperElement)) return;
    swiperElement.classList.remove("initial-hide");

    const swiperId = swiperElement.getAttribute("default-swiper-component");
    const swiperMode = swiperElement.dataset.swiperMode;
    const navigationPrefix = setNavigationPrefix(swiperId, swiperMode);

    const swiper = new Swiper(swiperElement, {
      navigation: {
        prevEl: `${navigationPrefix}.swiper-button-static:not(.next)`,
        nextEl: `${navigationPrefix}.swiper-button-static.next`,
      },
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
      allowTouchMove: true,
      spaceBetween: 24,
      speed: 400,
      loop: true,
      slidesPerView: "auto",
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initWebflowSwipers();
  initDefaultSwipers();
});
