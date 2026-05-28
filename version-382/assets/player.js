
(function () {
    var hlsLoader = null;

    function loadHlsScript(callback) {
        if (window.Hls) {
            callback();
            return;
        }

        if (!hlsLoader) {
            hlsLoader = document.createElement('script');
            hlsLoader.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
            hlsLoader.async = true;
            document.head.appendChild(hlsLoader);
        }

        hlsLoader.addEventListener('load', callback, { once: true });
        hlsLoader.addEventListener('error', callback, { once: true });
    }

    window.initMoviePlayer = function (playerId, playlist) {
        var box = document.getElementById(playerId);

        if (!box) {
            return;
        }

        var video = box.querySelector('video');
        var layer = box.querySelector('.play-layer');
        var started = false;
        var hlsInstance = null;

        function attachAndPlay() {
            if (started) {
                video.play();
                return;
            }

            started = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = playlist;
                video.addEventListener('loadedmetadata', function () {
                    video.play();
                }, { once: true });
                video.load();
            } else {
                loadHlsScript(function () {
                    if (window.Hls && window.Hls.isSupported()) {
                        hlsInstance = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: true,
                            backBufferLength: 90
                        });
                        hlsInstance.loadSource(playlist);
                        hlsInstance.attachMedia(video);
                        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                            video.play();
                        });
                    } else {
                        video.src = playlist;
                        video.load();
                        video.play();
                    }
                });
            }

            if (layer) {
                layer.classList.add('is-hidden');
            }
        }

        if (layer) {
            layer.addEventListener('click', attachAndPlay);
        }

        video.addEventListener('click', function () {
            if (!started) {
                attachAndPlay();
            }
        });

        video.addEventListener('play', function () {
            if (layer) {
                layer.classList.add('is-hidden');
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
}());
