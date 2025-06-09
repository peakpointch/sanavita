import { overrideWebflowScroll } from '@peakflow/utils/scroll';

document.addEventListener('DOMContentLoaded', () => {
  overrideWebflowScroll({
    defaultOffset: 99,
    defaultBehaviour: 'smooth'
  });
});
