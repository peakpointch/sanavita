// Speziellen Infobanner in die Navbar verschieben

const bannerType = {
    lounge: "/limmathof-lounge",
    thaiGarden: "/thai-garden"
};

const nav = document.querySelector('[pp-type="nav-wrapper"]');
const bannerWrapper = nav.querySelector('[pp-type="infobanner-wrapper"]');
const allBanners = bannerWrapper.querySelectorAll('[banner-type]');
const path = window.location.pathname;

function manageBanners() {
    if (!Object.values(bannerType).includes(path)) return;

    allBanners.forEach(banner => {
        let currentBannerType = banner.getAttribute('banner-type');
        if (path === bannerType[currentBannerType]) {
            banner.classList.toggle('show');
        } else {
            banner.classList.toggle('hide');
        }
    });
}

window.addEventListener('DOMContentLoaded', manageBanners);