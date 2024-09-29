(() => {
  function updateTimelineProgress() {
    // Get all elements that represent a timeline component
    const timelineComponents = document.querySelectorAll('[data-timeline-element="component"]');

    // Iterate over each timeline component
    timelineComponents.forEach(timeline => {
      const timeFromString = timeline.getAttribute('data-timeline-time-from');
      const timeToString = timeline.getAttribute('data-timeline-time-to');

      // Parse the 'from' and 'to' dates (format: dd.mm.yyyy)
      const [fromDay, fromMonth, fromYear] = timeFromString.split('.');
      const [toDay, toMonth, toYear] = timeToString.split('.');

      const fromDate = new Date(`${fromYear}-${fromMonth}-${fromDay}`);
      const toDate = new Date(`${toYear}-${toMonth}-${toDay}`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);  // Clear the time portion of today's date
      fromDate.setHours(0, 0, 0, 0);
      toDate.setHours(0, 0, 0, 0);


      // Get timeline sub-elements by attribute
      const progressElement = timeline.querySelector('[data-timeline-element="progres"]');
      const dotElement = timeline.querySelector('[data-timeline-element="dot"]');

      console.log("NEW ELEMENT:", timeline);

      console.log("today:", today);
      console.log("fromDate:", fromDate);
      console.log("toDate:", toDate);

      // If the current date is before the start date, set progress to 0%
      if (today < fromDate) {
        progressElement.style.width = '0%';
        dotElement.classList.remove('is-active');  // Ensure dot is not active before the start date
      }
      // If the current date is after the end date, set progress to 100%
      else if (today >= toDate) {
        progressElement.style.width = '100%';
        dotElement.classList.add('is-active');  // Ensure dot is active after the end date
      }
      // If the current date is between the start and end dates, calculate progress percentage
      else {
        const totalDuration = toDate - fromDate;
        const elapsedDuration = today - fromDate;
        const progressPercentage = (elapsedDuration / totalDuration) * 100;

        // Set the width of the progress element based on the percentage
        progressElement.style.width = `${progressPercentage}%`;

        // Add the 'is-active' class to the dot element on or after the start date
        if (today >= fromDate) {
          dotElement.classList.add('is-active');
        }
      }
    });
  }

  // Run the function to update the timeline progress
  updateTimelineProgress();

  // Optionally, set an interval to continuously update the timeline (e.g., daily)
  setInterval(updateTimelineProgress, 24 * 60 * 60 * 1000);  // Update once every day
})();