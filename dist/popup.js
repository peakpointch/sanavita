(() => {
  // js-library/popup.js
  function handlePopup() {
    const popupElement = document.querySelector(".popup_cms-item");
    const popupButtons = document.querySelectorAll("[popup]");
    const popupEmptyState = document.querySelectorAll('[popup="empty-state"]');
    const popupDelay = 5e3;
    let isPopupClosed = false;
    if (popupEmptyState.length > 0) {
      return;
    }
    function openPopup() {
      popupElement.style.display = "flex";
      setTimeout(() => popupElement.classList.add("show"), 200);
      addButtonListeners();
    }
    function closePopup() {
      if (!isPopupClosed) {
        popupElement.classList.remove("show");
        setTimeout(() => popupElement.style.display = "none", 200);
        isPopupClosed = true;
      }
    }
    function handleButtonClick(event) {
      const buttonAttributeValue = event.target.closest("[popup]").getAttribute("popup");
      if (buttonAttributeValue && ["action", "close"].includes(buttonAttributeValue)) {
        closePopup();
      }
    }
    function addButtonListeners() {
      popupButtons.forEach(function(button) {
        button.addEventListener("click", handleButtonClick);
      });
    }
    function removeButtonListeners() {
      popupButtons.forEach(function(button) {
        button.removeEventListener("click", handleButtonClick);
      });
    }
    setTimeout(openPopup, popupDelay);
  }
  function checkToRun() {
    if (window.FsCC.preferences.store.consents.personalization) {
      return;
    }
    handlePopup();
  }
  fsCookieScript.addEventListener("load", checkToRun);
})();
