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

  // Remove all empty slides
  document.querySelectorAll('.w-slide:empty').forEach(e => e.remove());

  // Unpack all selected CMS lists
  const allCmsListsToUnpack = document.querySelectorAll('.w-dyn-list[data-cms-unpack="true"]');
  allCmsListsToUnpack.forEach(cmsList => {
    const target = cmsList.dataset.cmsUnpackTarget;
    unpackCmsList(cmsList, target);
    cmsList.dataset.cmsUnpack = 'initialized';
  });

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
    const slidesPerView = parseFloat(swiperElement.dataset.swiperSlidesPerView || 1);
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
      speed: 400,
      spaceBetween: 8,
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
