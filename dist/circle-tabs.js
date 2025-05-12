(() => {
  // src/js/circle-tabs.js
  if (window.matchMedia("(min-width: 768px)").matches) {
    const allTabComponents = document.querySelectorAll('[pp-tabs="tabs-component"]');
    allTabComponents.forEach((component) => {
      const tabPaneList = component.querySelector('[pp-tabs="all-tab-panes"]');
      const tabpanes = component.querySelectorAll('[pp-tabs="tabpane"]');
      const tablist = component.querySelector('[pp-tabs="tablist"]');
      const tablinks = tablist.querySelectorAll('[pp-tabs="tab"]');
      function deactivateTabs() {
        tablinks.forEach((tab) => {
          tab.classList.remove("active");
          tab.setAttribute("aria-selected", "false");
          tab.setAttribute("tabindex", "-1");
        });
        tabpanes.forEach((pane) => {
          pane.classList.remove("active");
          pane.setAttribute("pp-hidden", "true");
        });
      }
      function activateTab(tab) {
        const targetPaneId = tab.getAttribute("aria-controls");
        const targetPane = component.querySelector(`#${targetPaneId}`);
        tab.classList.add("active");
        tab.setAttribute("aria-selected", "true");
        tab.setAttribute("tabindex", "0");
        if (targetPane) {
          targetPane.classList.add("active");
          targetPane.removeAttribute("pp-hidden");
        }
      }
      function rotateTabToTop(clickedTab) {
        const index = Array.from(tablinks).indexOf(clickedTab);
        const initialRotation = index * 45 + 90;
        const rotationOffset = -initialRotation;
        tablinks.forEach((tab, idx) => {
          const tabRotation = idx * (360 / 8) + rotationOffset;
          tab.style.transform = `rotate(${tabRotation}deg) translate(calc(var(--circle--circle-size) / 2)) rotate(${-tabRotation}deg)`;
        });
      }
      tablinks.forEach((tab, index) => {
        tab.setAttribute("role", "tab");
        tab.setAttribute("aria-selected", "false");
        tab.setAttribute("tabindex", "-1");
        tab.setAttribute("aria-controls", `tabpane-${index}`);
        tabpanes[index].setAttribute("id", `tabpane-${index}`);
        tabpanes[index].setAttribute("role", "tabpanel");
        tabpanes[index].setAttribute("pp-hidden", "true");
        index++;
      });
      tabpanes.forEach((tabpane, index) => {
        tabpane.setAttribute("id", `tabpane-${index}`);
        index++;
      });
      tablinks.forEach((tab) => {
        tab.addEventListener("click", () => {
          deactivateTabs();
          activateTab(tab);
          rotateTabToTop(tab);
        });
        tab.addEventListener("keydown", (e) => {
          if (e.key === "ArrowRight") {
            const nextTab = tab.nextElementSibling || tablist.firstElementChild;
            nextTab.focus();
            nextTab.click();
          } else if (e.key === "ArrowLeft") {
            const prevTab = tab.previousElementSibling || tablist.lastElementChild;
            prevTab.focus();
            prevTab.click();
          }
        });
      });
      if (tablinks.length > 0) {
        activateTab(tablinks[0]);
      }
    });
  }
})();
//# sourceMappingURL=circle-tabs.js.map
