const animateSelector = (component) => {
  return `[data-animate="${component}"]`;
}
const initialStateSelector = (component, state) => {
  return `${animateSelector(component)}[data-initial-state="${state}"]`;
}

function triggerComponent(container) {
  const trigger = container.querySelector(animateSelector('trigger'));
  trigger.click();
}


document.addEventListener('DOMContentLoaded', () => {
  const accordions = document.querySelectorAll(initialStateSelector('accordion', 'toggle'));
  accordions.forEach((accordion, index) => {
    triggerComponent(accordion);
  })
});