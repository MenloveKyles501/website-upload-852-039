(function () {
    "use strict";

    function all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMobileMenu() {
        var button = document.querySelector("[data-mobile-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("open");
        });
    }

    function setupHero() {
        var slides = all("[data-hero-slide]");
        var dots = all("[data-hero-dot]");
        if (!slides.length || !dots.length) {
            return;
        }
        var active = 0;
        var timer = null;

        function show(index) {
            active = index;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }

        function start() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show((active + 1) % slides.length);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });
        show(0);
        start();
    }

    function setupFilters() {
        all("[data-filter-scope]").forEach(function (scope) {
            var input = scope.querySelector("[data-search-input]");
            var selects = all("[data-filter-select]", scope);
            var container = scope.nextElementSibling;
            while (container && !container.hasAttribute("data-card-container")) {
                container = container.nextElementSibling;
            }
            if (!container) {
                container = document;
            }
            var cards = all("[data-card]", container);

            function apply() {
                var keyword = input ? input.value.trim().toLowerCase() : "";
                var filters = {};
                selects.forEach(function (select) {
                    filters[select.getAttribute("data-filter-select")] = select.value.trim();
                });
                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-tags"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-year")
                    ].join(" ").toLowerCase();
                    var matched = !keyword || text.indexOf(keyword) !== -1;
                    Object.keys(filters).forEach(function (key) {
                        var value = filters[key];
                        if (value && card.getAttribute("data-" + key) !== value) {
                            matched = false;
                        }
                    });
                    card.classList.toggle("hidden-by-filter", !matched);
                });
            }

            if (input) {
                input.addEventListener("input", apply);
            }
            selects.forEach(function (select) {
                select.addEventListener("change", apply);
            });
        });
    }

    function initMoviePlayer(source) {
        var video = document.querySelector("[data-player-video]");
        var overlay = document.querySelector("[data-player-overlay]");
        var button = document.querySelector("[data-player-button]");
        if (!video || !source) {
            return;
        }
        var ready = false;

        function load() {
            if (ready) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                video.hlsController = hls;
            } else {
                video.src = source;
            }
            ready = true;
        }

        function play() {
            load();
            video.controls = true;
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var result = video.play();
            if (result && typeof result.catch === "function") {
                result.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();
                play();
            });
        }
        if (overlay) {
            overlay.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
    }

    window.initMoviePlayer = initMoviePlayer;

    document.addEventListener("DOMContentLoaded", function () {
        setupMobileMenu();
        setupHero();
        setupFilters();
    });
})();
