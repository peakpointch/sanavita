function scrollToSection(id, offset=0) {
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