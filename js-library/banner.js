// Speziellen Infobanner in die Navbar verschieben

const bannerType = {
    lounge: "/limmathof-lounge",
    thaiGarden: "/thai-garden"
};

const nav = document.querySelector('[pp-type="nav-wrapper]');
const bannerWrapper = nav.querySelector('[pp-type"infobanner-wrapper"]');
const originalBanner = bannerWrapper.querySelector('[pp-type="nav-banner-list"]');
// const elements = bannerWrapper.querySelectorAll('[pp-type="banner-list"]');

const allBanners = bannerWrapper.querySelectorAll('[banner-type]');

const path = window.location.pathname;

allBanners.forEach(banner => {
    let currentBannerType = banner.getAttribute('banner-type');
    if (path === bannerType[currentBannerType]) {
        banner.classList.toggle('show');
    } else {
        banner.classList.toggle('hide');
    }
});

/*
if (nav && elements.length > 0) {
    elements.forEach(el => {
        nav.insertBefore(el, nav.firstChild);
    });
    originalBanner.remove();
} else {
    console.error('Infobanner nicht gefunden');
}
*/