(() => {
  function relocateCmsItems(component, itemSelector = null, targetSelector = null) {
    if (!component) {
      console.log('Already Relocated');
      return;
    } else if (!itemSelector && !targetSelector) {
      unpackCmsList(component.querySelector('.w-dyn-list'));
      return;
    }

    const items = component.querySelectorAll(itemSelector);
    const target = component.querySelector(targetSelector);

    if (items.length > 0) {
      items.forEach(item => {
        item.classList.remove('w-dyn-item');
        target.appendChild(item);
      });
    }

    // component.querySelector('.w-dyn-list').remove();
  };

  function unpackCmsList(cmsList, target = cmsList.parentNode) {
    if (!cmsList.classList.contains('w-dyn-list')) {
      console.error("The element given is not a CMS list: " + cmsList);
      return;
    }

    let targetEl;
    if (typeof target === 'string') {
      targetEl = document.querySelector(target);
    } else if (target instanceof Node) {
      targetEl = target;
    }

    const items = cmsList.querySelectorAll('.w-dyn-item');
    cmsList.remove();

    if (!items.length > 0) {
      console.error("The collection given doesn't contain any items: " + cmsList);
      return;
    }
    items.forEach(item => {
      item.classList.remove('w-dyn-item');
      targetEl.appendChild(item);
    });
  }


  // Unpack all selected CMS lists
  const allCmsListsToUnpack = document.querySelectorAll('.w-dyn-list[data-cms-unpack="true"]');
  allCmsListsToUnpack.forEach(cmsList => {
    const target = cmsList.dataset.cmsUnpackTarget;
    unpackCmsList(cmsList, target);
    cmsList.dataset.cmsUnpack = 'initialized';
  });

  // Remove all empty slides
  document.querySelectorAll('.w-slide:empty').forEach(e => e.remove());

  // Initialize all swipers
  const allSwipers = document.querySelectorAll('[swiper-component="true"]:not(.swiper-initialized)');
  allSwipers.forEach(swiperElement => {
    const slides = swiperElement.querySelectorAll('.swiper-slide');
    if (!slides.length > 0) {
      console.log('Skip empty swiper: ' + swiperElement);
      swiperElement.classList.add('hide');
      return;
    }
    swiperElement.classList.remove('initial-hide');

    const dataNav = (swiperElement.dataset.swiperNav || '.swiper-button').toString();
    const prevEl = `${dataNav}:not(.next)`;
    const nextEl = `${dataNav}.next`;
    const autoHeight = JSON.parse(swiperElement.dataset.swiperAutoHeight || 'false');
    const slidesPerView = swiperElement.dataset.swiperSlidesPerView === "auto"
      ? "auto"
      : parseFloat(swiperElement.dataset.swiperSlidesPerView || 1);
    const spaceBetween = parseFloat(swiperElement.dataset.swiperSpace || 1);
    const centeredSlides = JSON.parse(swiperElement.dataset.swiperCenteredSlides || 'false');
    const loop = JSON.parse(swiperElement.dataset.swiperLoop || 'true');
    const allowTouchMove = JSON.parse(swiperElement.dataset.swiperTouchMove || 'true');

    const swiper = new Swiper(swiperElement, {
      navigation: {
        prevEl: prevEl,
        nextEl: nextEl,
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      allowTouchMove: allowTouchMove,
      centeredSlides: centeredSlides,
      speed: 400,
      autoHeight: autoHeight,
      spaceBetween: spaceBetween,
      loop: loop,
      slidesPerView: slidesPerView,
      on: {
        init: () => {
          swiperElement.dataset.swiperComponent = 'initialized';
        },
      }
    });
  });
})();
