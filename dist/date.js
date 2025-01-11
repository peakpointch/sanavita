(() => {
  // src/js/date.js
  function formatDate(date, option = "d-mmmm-yyyy") {
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();
    if (option === "d-mmmm") {
      return `${day}. <span class="monthclass">${month}</span>`;
    } else {
      return `${day}. <span class="monthclass">${month}</span> ${year}`;
    }
  }
  function getTodaysDate() {
    const today2 = /* @__PURE__ */ new Date();
    return formatDate(today2);
  }
  function getCurrentWeek() {
    const now = /* @__PURE__ */ new Date();
    const currentDayOfWeek = now.getDay();
    const startDate = new Date(now);
    const endDate = new Date(now);
    startDate.setDate(now.getDate() - (currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1));
    endDate.setDate(startDate.getDate() + 6);
    return `${formatDate(startDate, "d-mmmm")} \u2013 ${formatDate(endDate)}`;
  }
  var today = getTodaysDate();
  var currentWeek = getCurrentWeek();
  var dateElements = document.querySelectorAll("[data-date]");
  dateElements.forEach((e) => {
    if (e.dataset.date === "current-week") {
      e.innerHTML = currentWeek;
      e.dataset.date = "initialized";
    } else if (e.dataset.date === "today") {
      e.innerHTML = today;
      e.dataset.date = "initialized";
    } else {
      e.dataset.date = "failed";
    }
  });
})();
