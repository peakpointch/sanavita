// Speziellen Infobanner in die Navbar verschieben

const target = document.querySelector('[pp-type="infobanner"]');
const elements = document.querySelectorAll('[pp-type="banner-element"]');

if (target && elements.length > 0) {
    elements.forEach(el => {
        target.insertAdjacentElement('afterend', el);
    });
    target.remove();
} else {
    console.error('Infobanner nicht gefunden');
}