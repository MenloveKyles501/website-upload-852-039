(function () {
    var ready = function (callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    };

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");
        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var current = 0;
            var showSlide = function (index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === current);
                });
            };
            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                });
            });
            if (slides.length > 1) {
                setInterval(function () {
                    showSlide(current + 1);
                }, 5600);
            }
        }

        var forms = Array.prototype.slice.call(document.querySelectorAll("[data-search-form]"));
        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q'], input[type='search']");
                if (!input) {
                    return;
                }
                var value = input.value.trim();
                if (!value) {
                    event.preventDefault();
                    input.focus();
                    return;
                }
                if (!/search\.html$/i.test(location.pathname)) {
                    event.preventDefault();
                    location.href = "./search.html?q=" + encodeURIComponent(value);
                }
            });
        });

        var filters = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-text]"));
        var empty = document.querySelector("[data-empty-state]");
        var runFilter = function (value) {
            var query = String(value || "").trim().toLowerCase();
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = card.getAttribute("data-search-text") || "";
                var matched = !query || haystack.indexOf(query) !== -1;
                card.style.display = matched ? "" : "none";
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0 && cards.length > 0);
            }
        };
        if (filters.length && cards.length) {
            var params = new URLSearchParams(location.search);
            var initial = params.get("q") || "";
            filters.forEach(function (input) {
                if (initial && !input.value) {
                    input.value = initial;
                }
                input.addEventListener("input", function () {
                    runFilter(input.value);
                });
            });
            runFilter(initial);
        }

        var jump = document.querySelector("[data-category-jump]");
        if (jump) {
            jump.addEventListener("change", function () {
                if (jump.value) {
                    location.href = jump.value;
                }
            });
        }

        var playerBox = document.querySelector("[data-player]");
        if (playerBox) {
            var video = playerBox.querySelector("video");
            var streamUrl = playerBox.getAttribute("data-url");
            var hlsPlayer = null;
            var start = function () {
                if (!video || !streamUrl) {
                    return;
                }
                playerBox.classList.add("is-playing");
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    if (!video.getAttribute("src")) {
                        video.setAttribute("src", streamUrl);
                    }
                    video.play().catch(function () {});
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    if (!hlsPlayer) {
                        hlsPlayer = new window.Hls({ enableWorker: true });
                        hlsPlayer.loadSource(streamUrl);
                        hlsPlayer.attachMedia(video);
                        hlsPlayer.on(window.Hls.Events.MANIFEST_PARSED, function () {
                            video.play().catch(function () {});
                        });
                    } else {
                        video.play().catch(function () {});
                    }
                    return;
                }
                if (!video.getAttribute("src")) {
                    video.setAttribute("src", streamUrl);
                }
                video.play().catch(function () {});
            };
            Array.prototype.slice.call(playerBox.querySelectorAll("[data-play]")).forEach(function (button) {
                button.addEventListener("click", start);
                button.addEventListener("keydown", function (event) {
                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        start();
                    }
                });
            });
            video.addEventListener("click", function () {
                if (!video.getAttribute("src")) {
                    start();
                }
            });
            var detailPlay = document.querySelector("[data-detail-play]");
            if (detailPlay) {
                detailPlay.addEventListener("click", function () {
                    start();
                    playerBox.scrollIntoView({ behavior: "smooth", block: "center" });
                });
            }
        }
    });
})();
