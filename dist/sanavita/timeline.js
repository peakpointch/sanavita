(() => {
  // src/sanavita/timeline.js
  function updateTimelineProgress() {
    const timelineComponents = document.querySelectorAll('[data-timeline-element="component"]');
    const screenWidth = window.innerWidth;
    timelineComponents.forEach((timeline) => {
      const timeFromString = timeline.getAttribute("data-timeline-time-from");
      const timeToString = timeline.getAttribute("data-timeline-time-to");
      const [fromDay, fromMonth, fromYear] = timeFromString.split(".");
      const [toDay, toMonth, toYear] = timeToString.split(".");
      const fromDate = /* @__PURE__ */ new Date(`${fromYear}-${fromMonth}-${fromDay}`);
      const toDate = /* @__PURE__ */ new Date(`${toYear}-${toMonth}-${toDay}`);
      const today = /* @__PURE__ */ new Date();
      today.setHours(0, 0, 0, 0);
      fromDate.setHours(0, 0, 0, 0);
      toDate.setHours(0, 0, 0, 0);
      const progressElement = timeline.querySelector('[data-timeline-element="progres"]');
      const dotElement = timeline.querySelector('[data-timeline-element="dot"]');
      let progressPercentage = 0;
      if (today < fromDate) {
        progressPercentage = 0;
        dotElement.classList.remove("is-active");
      } else if (today >= toDate) {
        progressPercentage = 100;
        dotElement.classList.add("is-active");
      } else {
        const totalDuration = toDate - fromDate;
        const elapsedDuration = today - fromDate;
        progressPercentage = elapsedDuration / totalDuration * 100;
        if (today >= fromDate) {
          dotElement.classList.add("is-active");
        }
      }
      if (screenWidth > 991) {
        progressElement.style.width = `${progressPercentage}%`;
        progressElement.style.height = "auto";
      } else {
        progressElement.style.height = `${progressPercentage}%`;
        progressElement.style.width = "auto";
      }
    });
  }
  updateTimelineProgress();
  setInterval(updateTimelineProgress, 24 * 60 * 60 * 1e3);
  window.addEventListener("resize", updateTimelineProgress);
})();
//# sourceMappingURL=timeline.js.map
