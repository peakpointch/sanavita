const LINKBUILDER_SELECTOR: string = `a[data-linkbuilder-component]`;

function initLinkBuilders(): void {
  // Select all matching anchor elements
  const allLinks: NodeListOf<HTMLAnchorElement> = document.querySelectorAll(LINKBUILDER_SELECTOR);

  // Iterate through the list of links
  for (let link of allLinks) {
    const path = link.dataset.path; // Corresponds to "data-path"
    const paramWohnung = link.dataset.paramWohnung; // Corresponds to "data-param-wohnung"

    // Ensure the required data attributes exist before updating href
    if (path && paramWohnung) {
      // Encode paramWohnung to make it URL-safe
      const encodedParamWohnung = encodeURIComponent(paramWohnung);
      link.href = `${path}?wohnung=${encodedParamWohnung}`;
    } else {
      console.warn('Missing data attributes for link:', link);
    }
  }
}

// Initialize after DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {
  initLinkBuilders();
});
