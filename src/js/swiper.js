import Swiper from "swiper/bundle";

function skipEmptySwiper(swiperElement) {
  const slides = swiperElement.querySelectorAll(".swiper-slide");
  if (!slides.length > 0) {
    console.log("Skip empty swiper: " + swiperElement);
    swiperElement.classList.add("hide");
    return;
  }
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

// Remove all empty slides
document.querySelectorAll(".w-slide:empty").forEach((e) => e.remove());

const webflowSwipers = document.querySelectorAll(
  '[swiper-component]:not([swiper-component="default"])'
);

webflowSwipers.forEach((swiperElement) => {
  skipEmptySwiper(swiperElement);
  swiperElement.classList.remove("initial-hide");

  const swiperId = swiperElement.getAttribute("swiper-component");
  const swiperMode = swiperElement.dataset.swiperMode;
  const navigationPrefix = setNavigationPrefix(swiperId, swiperMode);

  const dataNav = (swiperElement.dataset.swiperNav || ".swiper-button").toString();
  const prevEl = `${navigationPrefix}${dataNav}:not(.next)`;
  const nextEl = `${navigationPrefix}${dataNav}.next`;
  const autoHeight = JSON.parse(
    swiperElement.dataset.swiperAutoHeight || "false"
  );
  const slidesPerView = parseSlidesPerView(swiperElement.dataset.swiperSlidesPerView);
  const spaceBetween = parseFloat(swiperElement.dataset.swiperSpace || 8);
  const centeredSlides = JSON.parse(
    swiperElement.dataset.swiperCenteredSlides || "false"
  );
  const loop = JSON.parse(swiperElement.dataset.swiperLoop || "true");
  const allowTouchMove = JSON.parse(
    swiperElement.dataset.swiperTouchMove || "true"
  );
  const autoplayBoolean = JSON.parse(swiperElement.dataset.swiperAutoplay || "true");
  const autoplayDelay = parseFloat(swiperElement.dataset.swiperAutoplayDelay || 4000);
  const autoplayOptions = setupAutoplay(autoplayBoolean, autoplayDelay);
  const speed = parseFloat(swiperElement.dataset.swiperSpeed || 400);

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

defaultSwipers = document.querySelectorAll(`[default-swiper-component]`);

defaultSwipers.forEach((swiperElement) => {
  skipEmptySwiper(swiperElement);
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
