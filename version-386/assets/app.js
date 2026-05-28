(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupMenu() {
        var toggle = qs("[data-menu-toggle]");
        var nav = qs("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var carousel = qs("[data-hero-carousel]");
        if (!carousel) {
            return;
        }
        var slides = qsa(".hero-slide", carousel);
        var dots = qsa("[data-hero-dot]", carousel);
        var prev = qs("[data-hero-prev]", carousel);
        var next = qs("[data-hero-next]", carousel);
        var index = 0;
        var timer;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 6200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }

        restart();
    }

    function setupGlobalSearch() {
        var inputs = qsa("[data-global-search]");
        if (!inputs.length || !window.SEARCH_INDEX) {
            return;
        }

        inputs.forEach(function (input) {
            var holder = input.parentElement;
            var panel = holder ? qs("[data-search-panel]", holder) : null;
            if (!panel) {
                return;
            }

            function closePanel() {
                panel.classList.remove("is-open");
                panel.innerHTML = "";
            }

            input.addEventListener("input", function () {
                var query = normalize(input.value);
                if (query.length < 1) {
                    closePanel();
                    return;
                }
                var results = window.SEARCH_INDEX.filter(function (item) {
                    return normalize(item.title + " " + item.region + " " + item.year + " " + item.genre + " " + item.tags).indexOf(query) !== -1;
                }).slice(0, 10);
                panel.textContent = "";
                if (!results.length) {
                    var empty = document.createElement("div");
                    empty.className = "no-card-match";
                    empty.textContent = "没有匹配内容";
                    panel.appendChild(empty);
                    panel.classList.add("is-open");
                    return;
                }
                results.forEach(function (item) {
                    var link = document.createElement("a");
                    link.href = "./" + item.url;
                    var image = document.createElement("img");
                    image.src = item.cover;
                    image.alt = item.title;
                    var wrap = document.createElement("span");
                    var title = document.createElement("strong");
                    title.textContent = item.title;
                    var meta = document.createElement("span");
                    meta.textContent = item.region + " · " + item.year + " · " + item.genre;
                    wrap.appendChild(title);
                    wrap.appendChild(meta);
                    link.appendChild(image);
                    link.appendChild(wrap);
                    panel.appendChild(link);
                });
                panel.classList.add("is-open");
            });

            document.addEventListener("click", function (event) {
                if (!holder.contains(event.target)) {
                    closePanel();
                }
            });
        });
    }

    function setupCardFilters() {
        var forms = qsa("[data-local-search-form]");
        var activeFilters = {};

        function applyFilters(root) {
            var container = qs("[data-card-container]", root) || document;
            var cards = qsa(".movie-card", container);
            var input = qs("[data-card-search]", root) || qs("[data-card-search]");
            var query = normalize(input ? input.value : "");
            var visible = 0;
            var oldEmpty = qs(".no-card-match", container);
            if (oldEmpty) {
                oldEmpty.remove();
            }

            cards.forEach(function (card) {
                var text = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-genre")
                ].join(" "));
                var matchesQuery = !query || text.indexOf(query) !== -1;
                var matchesFilters = Object.keys(activeFilters).every(function (key) {
                    var value = activeFilters[key];
                    return !value || value === "all" || normalize(card.getAttribute("data-" + key)) === normalize(value);
                });
                var show = matchesQuery && matchesFilters;
                card.style.display = show ? "" : "none";
                if (show) {
                    visible += 1;
                }
            });

            if (!visible && container !== document) {
                var empty = document.createElement("div");
                empty.className = "no-card-match";
                empty.textContent = "没有匹配内容";
                container.appendChild(empty);
            }
        }

        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                applyFilters(document);
            });
            var input = qs("[data-card-search]", form);
            if (input) {
                input.addEventListener("input", function () {
                    applyFilters(document);
                });
            }
        });

        qsa("[data-filter-row]").forEach(function (row) {
            row.addEventListener("click", function (event) {
                var button = event.target.closest("[data-filter-key]");
                if (!button) {
                    return;
                }
                var key = button.getAttribute("data-filter-key");
                var value = button.getAttribute("data-filter-value");
                if (key === "all") {
                    activeFilters = {};
                    qsa(".filter-chip", row).forEach(function (chip) {
                        chip.classList.toggle("is-active", chip === button);
                    });
                } else {
                    activeFilters[key] = value;
                    qsa(".filter-chip", row).forEach(function (chip) {
                        var sameKey = chip.getAttribute("data-filter-key") === key;
                        if (sameKey || chip.getAttribute("data-filter-key") === "all") {
                            chip.classList.remove("is-active");
                        }
                    });
                    button.classList.add("is-active");
                }
                applyFilters(document);
            });
        });
    }

    window.initMoviePlayer = function (source) {
        var video = qs(".movie-video");
        var overlay = qs(".player-overlay");
        if (!video || !source) {
            return;
        }
        var hls;
        var attached = false;

        function attach() {
            if (attached) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
            attached = true;
        }

        function start() {
            attach();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            video.controls = true;
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    if (overlay) {
                        overlay.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (overlay) {
            overlay.addEventListener("click", start);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });

        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });

        window.addEventListener("beforeunload", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    };

    document.addEventListener("DOMContentLoaded", function () {
        setupMenu();
        setupHero();
        setupGlobalSearch();
        setupCardFilters();
    });
})();
