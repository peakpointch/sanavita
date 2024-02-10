const vimeoIframe = document.createElement("iframe");
vimeoIframe.src = "";
vimeoIframe.allowFullscreen = true;
vimeoIframe.dataset.ready = "true";
vimeoIframe.style.cssText = "height: 100%; width: 100%; margin-top: 0%; border: none;";

function createVideo(component) {
    // Get Component
    const componentId = component?.getAttribute('iphone-id');
    const video = component?.querySelector('[vimeo-id]');
    if (!component || !video) return;

    // Create and insert Iframes
    video.innerHTML = '';
    const id = video.getAttribute('vimeo-id');
    const iframeBg = vimeoIframe.cloneNode(true) as HTMLIFrameElement;
    const iframePlayer = vimeoIframe.cloneNode(true) as HTMLIFrameElement;
    iframeBg.src = `https://player.vimeo.com/video/${id}?background=1&autoplay=1&loop=1&muted=1`;
    iframePlayer.src = `https://player.vimeo.com/video/${id}`;

    video.appendChild(iframeBg);

    const play = component.querySelector('[iphone="video-play"]');
    if (!play) return;
    play.appendChild(iframePlayer);
}


function createVideos() {
    const components = document.querySelectorAll('[component="iphone"]');
    components.forEach(component => {
        createVideo(component);
    });
}

createVideos();