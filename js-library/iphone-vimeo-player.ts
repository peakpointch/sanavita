import $ from "jquery";
// import Vimeo from "@vimeo/player";

$(document).ready(function () {
    const vimeoIframe = $('<iframe>');
    vimeoIframe.prop({
        src: '',
        allowFullscreen: true,
    }).attr({
        'data-ready': 'true',
        style: 'height: 100%; width: 100%; margin-top: 0%; border: none;',
    });

    function createVideo(component) {
        const componentId = component?.getAttribute('iphone-id');
        const video = $(component).find('[vimeo-id]');
        if (!component || !video.length) return;

        video.empty();
        const id = video.attr('vimeo-id');
        const iframeBg = vimeoIframe.clone().attr('src', `https://player.vimeo.com/video/${id}?background=1&autoplay=1&loop=1&muted=1`);

        video.append(iframeBg);

        const playButton = $(component).find('[iphone="play-button"]');
        if (!playButton.length) return;
        let firstClick = true;
        playButton.click(function () {
            if (firstClick) {
                const play = $(component).find('[iphone="video-play"]');
                const iframePlayer = vimeoIframe.clone().attr('src', `https://player.vimeo.com/video/${id}`);
                play.append(iframePlayer);
                firstClick = false;
            }

            $(component).find('[iphone="close-button"]').click(function () {
                $(this).siblings('[iphone="video-play"]').find("iframe[src*='https://player.vimeo.com/video/']").each(function () {
                    new Vimeo.Player(this).pause()
                });

                $("iframe[src*='?background=1'][src*='vimeo.com']").each(function () {
                    new Vimeo.Player(this).play()
                });
            });

        });
    }

    function createVideos() {
        $('[component="iphone"]').each(function () {
            createVideo(this);
        });
    }

    createVideos();

});