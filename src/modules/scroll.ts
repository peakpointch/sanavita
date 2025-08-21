import { overrideWebflowScroll } from 'peakflow/scroll';

document.addEventListener('DOMContentLoaded', () => {
  overrideWebflowScroll({
    defaultOffset: 99,
    defaultBehaviour: 'smooth'
  });
});
