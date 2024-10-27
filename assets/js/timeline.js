function updateTimelineProgress() {
  // Get all elements that represent a timeline component
  const timelineComponents = document.querySelectorAll('[data-timeline-element="component"]');

  // Get the current screen width
  const screenWidth = window.innerWidth;

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

    let progressPercentage = 0;

    // If the current date is before the start date, set progress to 0%
    if (today < fromDate) {
      progressPercentage = 0;
      dotElement.classList.remove('is-active');  // Ensure dot is not active before the start date
    }
    // If the current date is after the end date, set progress to 100%
    else if (today >= toDate) {
      progressPercentage = 100;
      dotElement.classList.add('is-active');  // Ensure dot is active after the end date
    }
    // If the current date is between the start and end dates, calculate progress percentage
    else {
      const totalDuration = toDate - fromDate;
      const elapsedDuration = today - fromDate;
      progressPercentage = (elapsedDuration / totalDuration) * 100;

      // Add the 'is-active' class to the dot element on or after the start date
      if (today >= fromDate) {
        dotElement.classList.add('is-active');
      }
    }

    // Determine whether to animate width or height based on screen width
    if (screenWidth > 991) {
      // Larger screens: animate the width
      progressElement.style.width = `${progressPercentage}%`;
      progressElement.style.height = 'auto';  // Reset height to auto for larger screens
    } else {
      // Smaller screens: animate the height
      progressElement.style.height = `${progressPercentage}%`;
      progressElement.style.width = 'auto';  // Reset width to auto for smaller screens
    }
  });
}

// Run the function to update the timeline progress
updateTimelineProgress();

// Optionally, set an interval to continuously update the timeline (e.g., daily)
setInterval(updateTimelineProgress, 24 * 60 * 60 * 1000);  // Update once every day

// Add a resize event listener to re-check the screen width on window resize
window.addEventListener('resize', updateTimelineProgress);
