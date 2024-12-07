// <!-- Popup Display Personalization v3.0 -->
// <script type="fs-cc" fs-cc-categories="personalization">
// FULL VERSION (requires cookie consent)
function initializePopup() {
  const popupEmptyState = document.querySelectorAll('[popup="empty-state"]');
  if (popupEmptyState.length > 0) {
    return;
  }

  var cookies = document.cookie.split(';')
    .map(cookie => cookie.split('=').map(part => part.trim()))
    .reduce((accumulator, [key, value]) => ({ ...accumulator, [key]: decodeURIComponent(value) }), {});
  const popupElement = document.querySelector('.popup_cms-item');
  const popupButtons = document.querySelectorAll('[popup]');
  const popupDelay = 5000;
  let isPopupClosed = false;
  let openPopupTimeout;

  function openPopup() {
    popupElement.style.display = 'flex';
    setTimeout(() => popupElement.classList.add('show'), 200);
    isPopupClosed = false;
  }

  function closePopup() {
    popupElement.classList.remove('show');
    setTimeout(() => popupElement.style.display = 'none', 200);
    removeButtonListeners();
    isPopupClosed = true;
    clearTimeout(openPopupTimeout);
  }

  function isExpired() {
    if (!cookies['popupClosed']) {
      addButtonListeners();
      openPopupTimeout = setTimeout(openPopup, popupDelay);
      return true;
    } else {
      return false;
    }
  }

  function setPopupCookie(action) {
    if (cookies['popupClosed']) {
      return;
    }

    let expirationDate = new Date();

    if (action === 'action') {
      expirationDate.setDate(expirationDate.getDate() + 7);
    } else {
      expirationDate.setDate(expirationDate.getDate() + 2);
    }

    const popupClosedValue = { value: true, expires: expirationDate };
    document.cookie = `popupClosed=${encodeURIComponent(JSON.stringify(popupClosedValue))}; expires=${expirationDate.toUTCString()}; path=/`;
  }

  function handleButtonClick(event) {
    const buttonAttributeValue = event.target.closest('[popup]').getAttribute('popup');
    if (buttonAttributeValue && ['action', 'close'].includes(buttonAttributeValue)) {
      setPopupCookie(buttonAttributeValue);
      closePopup();
    }
  }

  function addButtonListeners() {
    popupButtons.forEach(function (button) {
      button.addEventListener('click', handleButtonClick);
    });
  }

  function removeButtonListeners() {
    popupButtons.forEach(function (button) {
      button.removeEventListener('click', handleButtonClick);
    });
  }

  isExpired();
}

fsCookieScript.addEventListener('load', initializePopup);
// </script>
// <!-- END Popup Display Personalization v3.0 -->