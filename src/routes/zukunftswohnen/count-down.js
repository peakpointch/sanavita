// Function to calculate the number of days between two dates
function calculateDaysUntil(dateString) {
  // Split the European formatted date (dd.mm.yyyy) into day, month, year
  const [day, month, year] = dateString.split(".");

  // Create a Date object for the target date
  const targetDate = new Date(`${year}-${month}-${day}`);

  // Get today's date and clear the time portion
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate the time difference in milliseconds
  const timeDiff = targetDate - today;

  // Convert milliseconds to days
  const daysUntil = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  return daysUntil;
}

export function initCountDown() {
  // Get all div elements with the attribute 'data-count-down'
  const countDownElements = document.querySelectorAll("[data-count-down]");

  // Iterate over each div and calculate the days until the target date
  countDownElements.forEach((div) => {
    const dateString = div.getAttribute("data-count-down");
    const daysUntil = calculateDaysUntil(dateString);

    // Insert the number of days into the div's innerText
    div.innerText = `${daysUntil}`;
  });
}

