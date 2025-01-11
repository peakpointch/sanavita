(() => {
  // src/js/translate-dates.js
  function translateDates() {
    const allMonths = document.querySelectorAll(".monthclass");
    const allDays = document.querySelectorAll(".dayclass");
    if (allMonths.length === 0 && allDays.length === 0) {
      console.error("No elements found for translation.");
      return;
    }
    const data = {
      months: {
        en: [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December"
        ],
        local: []
      },
      days: {
        en: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday"
        ],
        local: []
      }
    };
    data.months.local = [
      "Januar",
      "Februar",
      "M\xE4rz",
      "April",
      "Mai",
      "Juni",
      "Juli",
      "August",
      "September",
      "Oktober",
      "November",
      "Dezember"
    ];
    data.days.local = [
      "Montag",
      "Dienstag",
      "Mittwoch",
      "Donnerstag",
      "Freitag",
      "Samstag",
      "Sonntag"
    ];
    if (data.months.local.length !== 12) {
      console.error("Months are incorrect! Check your script.");
    }
    if (data.days.local.length !== 7) {
      console.error("Days are incorrect! Check your script.");
    }
    const shortenDaysMonths = (daymonth) => daymonth.substring(0, 3);
    const convertToLocal = (elements) => {
      elements.forEach((element) => {
        let text = element.textContent;
        for (let type in data) {
          if (data.hasOwnProperty(type)) {
            for (let i = 0; i < data[type].en.length; i++) {
              text = text.replace(data[type].en[i], data[type].local[i]);
              text = text.replace(shortenDaysMonths(data[type].en[i]), shortenDaysMonths(data[type].local[i]));
            }
          }
        }
        element.textContent = text;
      });
    };
    convertToLocal([...allMonths, ...allDays]);
  }
  translateDates();
})();
