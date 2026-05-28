import { H as Hls } from "./hls.js";

function initPlayer(player) {
    var video = player.querySelector("video");
    var button = player.querySelector(".player-play");
    var message = player.querySelector(".player-message");
    var url = player.getAttribute("data-video") || (video ? video.getAttribute("data-video") : "");
    var hls = null;

    function showMessage(text) {
        if (!message) {
            return;
        }
        message.textContent = text;
        message.classList.add("show");
    }

    if (!video || !url) {
        showMessage("视频加载失败");
        return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
    } else if (Hls && Hls.isSupported()) {
        hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
                showMessage("视频加载失败");
            }
        });
    } else {
        showMessage("视频暂时无法播放");
    }

    function playVideo() {
        var promise = video.play();
        if (promise && typeof promise.then === "function") {
            promise.then(function () {
                player.classList.add("playing");
            }).catch(function () {
                showMessage("请再次点击播放");
            });
        } else {
            player.classList.add("playing");
        }
    }

    function toggleVideo() {
        if (video.paused) {
            playVideo();
        } else {
            video.pause();
        }
    }

    if (button) {
        button.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            playVideo();
        });
    }

    player.addEventListener("click", function (event) {
        if (event.target === video || event.target === player) {
            toggleVideo();
        }
    });

    video.addEventListener("play", function () {
        player.classList.add("playing");
    });

    video.addEventListener("pause", function () {
        player.classList.remove("playing");
    });

    window.addEventListener("beforeunload", function () {
        if (hls) {
            hls.destroy();
        }
    });
}

document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".movie-player").forEach(initPlayer);
});
