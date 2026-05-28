(function () {
    window.MoviePlayer = {
        mount: function (options) {
            var video = document.querySelector(options.videoSelector);
            var cover = document.querySelector(options.coverSelector);
            var button = document.querySelector(options.buttonSelector);
            var attached = false;
            var hls = null;

            if (!video || !cover || !button || !options.src) {
                return;
            }

            function attachMedia() {
                if (attached) {
                    return;
                }

                attached = true;

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = options.src;
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hls.loadSource(options.src);
                    hls.attachMedia(video);
                    return;
                }

                video.src = options.src;
            }

            function start(event) {
                if (event) {
                    event.preventDefault();
                }

                attachMedia();
                cover.classList.add("is-hidden");
                video.controls = true;

                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {});
                }
            }

            button.addEventListener("click", start);
            cover.addEventListener("click", start);
            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                }
            });

            window.addEventListener("beforeunload", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        }
    };
})();
