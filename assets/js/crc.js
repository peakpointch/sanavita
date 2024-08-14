var consentButtons = document.querySelectorAll('[fs-cc=allow], [fs-cc=deny], [fs-cc=submit]')

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
    let fsConsents = window.FsCC.preferences.store.consents; // Consented categories stored in global variable by fs-cc

    if (fsConsents.marketing && fsConsents.analytics) {
        fbq('consent', 'grant'); // Facebook Pixel
        window.localStorage.setItem('fbGrantConsent', 'true'); // Facebook Pixel
    } else {
        document.cookie = "_fbp=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.localStorage.setItem('fbGrantConsent', 'false');
    }

    if (areObjectsEqual(fsConsents, fsDefault)) {
        const restrictedComponents = document.querySelectorAll('[cookie-restricted]');
        restrictedComponents.forEach(restrictedComponent => {
            restrictedComponent.style.display = 'block'; // Show restrictedComponent, if fs-cc cookie is not set
        });
        return; // Skip the rest of this function, if fs-cc cookie is not set
    }

    // Get all restrictedComponents with Attribute 'cookie-restricted'
    const restrictedComponents = document.querySelectorAll('[cookie-restricted]');

    // Iterate all restrictedComponents and set style.display accordingly
    restrictedComponents.forEach(restrictedComponent => {
        const attributeValues = restrictedComponent.getAttribute('cookie-restricted').split(',').map(attribute => attribute.trim());

        // Check with attributeValues.some, if a required cookie category is disabled (for current Component)
        const isRestrictingCookieDisabled = attributeValues.some(attribute => {
            return (attribute === 'marketing' && !fsConsents.marketing) ||
                (attribute === 'personalization' && !fsConsents.personalization) ||
                (attribute === 'analytics' && !fsConsents.analytics) ||
                (attribute === 'essential' && !fsConsents.essential) ||
                (!['marketing', 'personalization', 'analytics', 'essential'].includes(attribute) && !fsConsents.uncategorized);
        });

        // Show restrictedComponent if a restricted cookie category is disabled.
        restrictedComponent.style.display = isRestrictingCookieDisabled ? 'block' : 'none';
    });
}

function handleButtonClick(event) {
    const buttonAttributeValue = event.target.closest('[fs-cc]').getAttribute('fs-cc');
    if (buttonAttributeValue && ['allow', 'deny', 'submit'].includes(buttonAttributeValue)) {
        setTimeout(handleCRC, 0); // Important!
    }
}

function addButtonListeners() {
    consentButtons.forEach(function (button) {
        button.addEventListener('click', handleButtonClick);
    });
}

function removeButtonListeners() {
    consentButtons.forEach(function (button) {
        button.removeEventListener('click', handleButtonClick);
    });
}

// Execute function, after the document has finished loading
document.addEventListener('DOMContentLoaded', function () {
    let fbPixel = window.localStorage.getItem('fbGrantConsent') === 'true';
    if (fbPixel) { // Pixel already loaded? If YES do following
        fbq('consent', 'grant');
    }

    addButtonListeners();
    fsCookieScript.addEventListener('load', handleCRC);
});