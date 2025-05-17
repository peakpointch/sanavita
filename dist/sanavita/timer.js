(() => {
  // src/sanavita/timer.js
  window.addEventListener("DOMContentLoaded", () => {
    const deadline = (/* @__PURE__ */ new Date("2025-05-01")).getTime();
    const interval = setInterval(() => {
      const now = (/* @__PURE__ */ new Date()).getTime();
      const distance = deadline - now;
      if (distance < 0) {
        clearInterval(interval);
        return;
      }
      const values = {
        days: {
          value: Math.floor(distance / (1e3 * 60 * 60 * 24)),
          singular: "tag",
          plural: "tagen"
        },
        hours: {
          value: Math.floor(distance % (1e3 * 60 * 60 * 24) / (1e3 * 60 * 60)),
          singular: "stunde",
          plural: "stunden"
        },
        minutes: {
          value: Math.floor(distance % (1e3 * 60 * 60) / (1e3 * 60)),
          singular: "minute",
          plural: "minuten"
        },
        seconds: {
          value: Math.floor(distance % (1e3 * 60) / 1e3),
          singular: "sekunde",
          plural: "sekunden"
        }
      };
      for (const prop in values) {
        const el = document.querySelector(`#js-timer-${prop}`);
        const entry = values[prop];
        el.innerText = entry.value;
        el.nextElementSibling.innerText = entry.value === 1 ? entry.singular : entry.plural;
      }
    }, 1e3);
  });
})();
//# sourceMappingURL=timer.js.map
