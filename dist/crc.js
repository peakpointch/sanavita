(() => {
  // js-library/crc.js
  var consentButtons = document.querySelectorAll("[fs-cc=allow], [fs-cc=deny], [fs-cc=submit]");
  function areObjectsEqual(obj1, obj2) {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }
  function handleCRC() {
    const fsDefault = {
      analytics: false,
      essential: true,
      marketing: false,
      personalization: false,
      uncategorized: false
    };
    let fsConsents = window.FsCC.preferences.store.consents;
    if (fsConsents.marketing && fsConsents.analytics) {
      fbq("consent", "grant");
      window.localStorage.setItem("fbGrantConsent", "true");
    } else {
      document.cookie = "_fbp=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      window.localStorage.setItem("fbGrantConsent", "false");
    }
    if (areObjectsEqual(fsConsents, fsDefault)) {
      const restrictedComponents2 = document.querySelectorAll("[cookie-restricted]");
      restrictedComponents2.forEach((restrictedComponent) => {
        restrictedComponent.style.display = "block";
      });
      return;
    }
    const restrictedComponents = document.querySelectorAll("[cookie-restricted]");
    restrictedComponents.forEach((restrictedComponent) => {
      const attributeValues = restrictedComponent.getAttribute("cookie-restricted").split(",").map((attribute) => attribute.trim());
      const isRestrictingCookieDisabled = attributeValues.some((attribute) => {
        return attribute === "marketing" && !fsConsents.marketing || attribute === "personalization" && !fsConsents.personalization || attribute === "analytics" && !fsConsents.analytics || attribute === "essential" && !fsConsents.essential || !["marketing", "personalization", "analytics", "essential"].includes(attribute) && !fsConsents.uncategorized;
      });
      restrictedComponent.style.display = isRestrictingCookieDisabled ? "block" : "none";
    });
  }
  function handleButtonClick(event) {
    const buttonAttributeValue = event.target.closest("[fs-cc]").getAttribute("fs-cc");
    if (buttonAttributeValue && ["allow", "deny", "submit"].includes(buttonAttributeValue)) {
      setTimeout(handleCRC, 0);
    }
  }
  function addButtonListeners() {
    consentButtons.forEach(function(button) {
      button.addEventListener("click", handleButtonClick);
    });
  }
  document.addEventListener("DOMContentLoaded", function() {
    let fbPixel = window.localStorage.getItem("fbGrantConsent") === "true";
    if (fbPixel) {
      fbq("consent", "grant");
    }
    addButtonListeners();
    fsCookieScript.addEventListener("load", handleCRC);
  });
})();
