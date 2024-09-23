function scrollToSection(id, offset = 0) {
  console.log("SCROLLING");

  setTimeout(() => {
    const section = document.getElementById(id);
    if (section) {
      const elementPosition = section.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    } else {
      console.error(`Section with id '${id}' not found.`);
    }
  }, 10);
}

document.addEventListener("DOMContentLoaded", () => {
  const cmsScrollLinks = document.querySelectorAll('a[data-href-scroll]');
  cmsScrollLinks.forEach(link => { link.href = `${link.dataset.hrefPrefix + '#' + link.dataset.hrefScroll}` });

  if (location.pathname != '/') {
    const globalScrollLinks = document.querySelectorAll('a[data-global-scroll="true"]');
    let globalFiltered = Array.from(globalScrollLinks).filter(link => link.href.includes(location.pathname));
    globalFiltered.forEach(link => {
      const url = new URL(link.href); // Create a URL object from the link's href
      link.href = url.hash; // Set the href to only the hash (e.g., "#section")
    });
  }

  const allScrollLinks = document.querySelectorAll('a[href^="#"], [scroll-to]');
  allScrollLinks.forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      // var scrollId = link.getAttribute('scroll-to');
      const scrollId = link.getAttribute('href').slice(1) || link.getAttribute('scroll-to');
      console.log(scrollId);

      const offset = link.getAttribute('scroll-offset') || 88;
      scrollToSection(scrollId, offset);
    });
  });
});