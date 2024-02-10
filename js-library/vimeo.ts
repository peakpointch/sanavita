// <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
// <script src="https://player.vimeo.com/api/player.js"></script>

$(document).ready(function () {
    $('[iphone="close-button"]').click(function () {
        let video = $(this).siblings('[vimeo-id]').find("iframe")[0];
        let video_src = $(video).attr("src");

        if (video && video_src.includes("vimeo.com")) {
            new Vimeo.Player(video).pause();
        }

        $(this).siblings('[iphone="video-play"]').find("iframe[src*='https://player.vimeo.com/video/']").each(function() {
            new Vimeo.Player(this).pause();
        });

        $("iframe[src*='?background=1'][src*='vimeo.com']").each(function () {
            new Vimeo.Player(this).play();
        });
    });
});

/*

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
        // console.log(componentId);

        video.empty();
        const id = video.attr('vimeo-id');
        const iframeBg = vimeoIframe.clone().attr('src', `https://player.vimeo.com/video/${id}?background=1&autoplay=1&loop=1&muted=1`);
        const iframePlayer = vimeoIframe.clone().attr('src', `https://player.vimeo.com/video/${id}`);

        video.append(iframeBg);

        const play = $(component).find('[iphone="video-play"]');
        if (!play.length) return;
        play.append(iframePlayer);
    }

    function createVideos() {
        $('[component="iphone"]').each(function () {
            createVideo(this);
        });
    }

    createVideos();

    $('[iphone="close-button"]').click(function () {
        const video = $(this).siblings('[vimeo-id]').find("iframe")[0];
        const video_src = $(video).attr("src");

        if (video && video_src.includes("vimeo.com")) {
            new Vimeo.Player(video).pause();
        }

        $(this).siblings('[iphone="video-play"]').find("iframe[src*='https://player.vimeo.com/video/']").each(function() {
            new Vimeo.Player(this).pause();
        });

        $("iframe[src*='?background=1'][src*='vimeo.com']").each(function () {
            new Vimeo.Player(this).play();
        });
    });

});








$(document).ready(function () {
    let close_btn = $('[iphone="close-button"]');

    close_btn.click(function () {
        let video = $(this).siblings('[vimeo-id]').find("iframe")[0];
        let video_src = $(video).attr("src");

        if (video && video_src.includes("vimeo.com")) {
            let player = new Vimeo.Player(video);
            player.pause();
        }

        let sibling_video = $(this).siblings('[iphone="video-play"]').find("iframe[src*='https://player.vimeo.com/video/']")[0];
        if (sibling_video) {
            let sibling_player = new Vimeo.Player(sibling_video);
            sibling_player.pause();
        }

        $("iframe[src*='?background=1']").each(function () {
            let background_src = $(this).attr("src");

            if (background_src.includes("vimeo.com")) {
                let background_player = new Vimeo.Player(this);
                background_player.play();
            }
        });
    });
});
*/