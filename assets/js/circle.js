(() => {
  function updateOffset() {
    const itemWrap = page.querySelector('.pgc-item_wrap');

    const baseDeg = 10;
    const minWidth = 1270;
    const minOffset = baseDeg;

    let vwOffset = -1 / 150 * window.innerWidth + 8
    vwOffset = Math.max(0, vwOffset);

    // Calculate newOffset with a minimum value
    let newOffset = Math.max(baseDeg, baseDeg + vwOffset);

    // console.log("window.innerWidth: " + window.innerWidth);
    // console.log("CALC Value: " + vwOffset);
    // console.log("newOffset Value: " + newOffset);

    if (itemWrap) {  // Ensure itemWrap is not null
      itemWrap.style.setProperty('--item-offset', `${newOffset}deg`);
    }
    // console.log("OFFSET RESIZE");
  }

  updateOffset();  // Call the function initially

  window.addEventListener('resize', updateOffset);  // Update on resize
})();

// (() => {
//   let isDragging = false;
//   let startY, startRotation;

//   const circle = document.querySelector('.pgc_beige');
//   const baseRotation = 0; // Starting rotation angle
//   const rotationOffset = -.1; // Degrees per unit of vertical movement (adjust as needed)

//   circle.style.transform = `rotate(${baseRotation}deg)`;

//   function onStart(e) {
//     isDragging = true;
//     startY = e.clientY || e.touches[0].clientY;
//     const transform = circle.style.transform;
//     startRotation = transform === 'none' ? baseRotation : parseFloat(transform.split('(')[1]);
//     circle.style.cursor = 'grabbing';
//   }

//   function onMove(e) {
//     if (!isDragging) return;
//     e.preventDefault();
//     const currentY = e.clientY || e.touches[0].clientY;
//     const dy = currentY - startY;
//     const angle = rotationOffset * dy;
//     circle.style.transform = `rotate(${startRotation + angle}deg)`;
//   }

//   function onEnd() {
//     isDragging = false;
//     circle.style.cursor = 'grab';
//   }

//   circle.addEventListener('mousedown', onStart);
//   circle.addEventListener('touchstart', onStart, { passive: false });
  
//   document.addEventListener('mousemove', onMove);
//   document.addEventListener('touchmove', onMove, { passive: false });
  
//   document.addEventListener('mouseup', onEnd);
//   document.addEventListener('touchend', onEnd);
// })();
