// Speziellen Infobanner in die Navbar verschieben

const languagePrefixes = ['/en'];
const bannerType = {
    lounge: "/limmathof-lounge",
    thaiGarden: "/thai-garden"
};

const nav = document.querySelector('[pp-type="nav-wrapper"]');
const bannerWrapper = nav.querySelector('[pp-type="infobanner-wrapper"]');
const allBanners = bannerWrapper.querySelectorAll('[banner-type]:not(:has(.w-dyn-empty))');
const path = window.location.pathname;

function manageBanners() {
    if (!allBanners.length) { return }

    allBanners.forEach(banner => {
        let currentBannerType = banner.getAttribute('banner-type');
        if (currentBannerType === 'default') {
            if (!Object.values(bannerType).some(bannerPath => path.includes(bannerPath))) {
                banner.classList.add('show');
                setBannerSpeed(banner);
            } else {
                banner.classList.add('hide');
            }
        } else if (path.includes(bannerType[currentBannerType])) {
            banner.classList.add('show');
            setBannerSpeed(banner);
        } else {
            banner.classList.add('hide');
        }
    });
}

function setBannerSpeed(track) {
    track = track.querySelector('.marquee_track');
    const distance = track.offsetWidth;
    const pixelsPerSecond = 100; // Adjust this value to change the speed
    const duration = distance / pixelsPerSecond;
    track.style.animationDuration = `${duration}s`;
    return duration
}

function setAllSpeeds() {
    const allMarquees = document.querySelector('main').querySelectorAll('.marquee_component');
    allMarquees.forEach(marquee => setBannerSpeed(marquee));
}

window.addEventListener('DOMContentLoaded', () => {
    manageBanners();
    setAllSpeeds();
});