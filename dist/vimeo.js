(() => {
  // js-library/vimeo.js
  $(document).ready(function() {
    var close_btn = $(".iphone_close-button");
    close_btn.click(function() {
      var sibling_video = $(this).siblings(".iphone_video").find("iframe")[0];
      var sibling_src = $(sibling_video).attr("src");
      if (sibling_video && sibling_src.includes("vimeo.com")) {
        var sibling_player = new Vimeo.Player(sibling_video);
        sibling_player.pause();
      }
      var video_play_sibling = $(this).siblings(".iphone_video-play").find("iframe[src*='https://player.vimeo.com/video/']")[0];
      if (video_play_sibling) {
        var video_play_player = new Vimeo.Player(video_play_sibling);
        video_play_player.pause();
      }
      $("iframe[src*='?background=1']").each(function() {
        var background_src = $(this).attr("src");
        if (background_src.includes("vimeo.com")) {
          var background_player = new Vimeo.Player(this);
          background_player.play();
        }
      });
    });
  });
})();
