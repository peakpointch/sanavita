// Helper function to format the date as "DD. <span class='monthclass'>Month</span> YYYY"
function formatDate(date) {
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();
  return `${day}. <span class="monthclass">${month}</span> ${year}`;
}

// Function to get today's date
function getTodaysDate() {
  const today = new Date();
  return formatDate(today);
}

// Function to get the current week
function getCurrentWeek() {
  const now = new Date();
  const currentDayOfWeek = now.getDay();

  // Calculate the start date (previous Monday) and end date (upcoming Sunday) of the current week
  const startDate = new Date(now);
  const endDate = new Date(now);

  startDate.setDate(now.getDate() - (currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1));
  endDate.setDate(startDate.getDate() + 6);

  // Return the formatted start and end dates
  return `${formatDate(startDate)} – ${formatDate(endDate)}`;
}

const today = getTodaysDate();
const currentWeek = getCurrentWeek();
const dateElements = document.querySelectorAll('[data-date]');
dateElements.forEach(e => {
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