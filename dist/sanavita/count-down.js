(() => {
  // src/sanavita/js/count-down.js
  function calculateDaysUntil(dateString) {
    const [day, month, year] = dateString.split(".");
    const targetDate = /* @__PURE__ */ new Date(`${year}-${month}-${day}`);
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const timeDiff = targetDate - today;
    const daysUntil = Math.ceil(timeDiff / (1e3 * 60 * 60 * 24));
    return daysUntil;
  }
  var countDownElements = document.querySelectorAll("[data-count-down]");
  countDownElements.forEach((div) => {
    const dateString = div.getAttribute("data-count-down");
    const daysUntil = calculateDaysUntil(dateString);
    div.innerText = `${daysUntil}`;
  });
})();
//# sourceMappingURL=count-down.js.map
