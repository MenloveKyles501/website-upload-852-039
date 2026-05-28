(function () {
    var navToggle = document.querySelector("[data-nav-toggle]");
    var navMenu = document.querySelector("[data-nav-menu]");

    if (navToggle && navMenu) {
        navToggle.addEventListener("click", function () {
            navMenu.classList.toggle("is-open");
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var next = hero.querySelector("[data-hero-next]");
        var prev = hero.querySelector("[data-hero-prev]");
        var current = 0;
        var timer = null;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
                restart();
            });
        });

        if (next) {
            next.addEventListener("click", function () {
                showSlide(current + 1);
                restart();
            });
        }

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(current - 1);
                restart();
            });
        }

        restart();
    }

    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
        var keywordInput = scope.querySelector("[data-card-filter]");
        var yearSelect = scope.querySelector("[data-year-filter]");
        var regionSelect = scope.querySelector("[data-region-filter]");
        var genreSelect = scope.querySelector("[data-genre-filter]");
        var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
        var empty = scope.querySelector("[data-empty-state]");

        function matches(card, keyword, year, region, genre) {
            var haystack = [
                card.dataset.title,
                card.dataset.region,
                card.dataset.year,
                card.dataset.type,
                card.dataset.genre,
                card.dataset.tags
            ].join(" ").toLowerCase();

            if (keyword && haystack.indexOf(keyword) === -1) {
                return false;
            }

            if (year && card.dataset.year !== year) {
                return false;
            }

            if (region && card.dataset.region !== region) {
                return false;
            }

            if (genre && (card.dataset.genre || "").indexOf(genre) === -1) {
                return false;
            }

            return true;
        }

        function applyFilter() {
            var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : "";
            var year = yearSelect ? yearSelect.value : "";
            var region = regionSelect ? regionSelect.value : "";
            var genre = genreSelect ? genreSelect.value : "";
            var visible = 0;

            cards.forEach(function (card) {
                var ok = matches(card, keyword, year, region, genre);
                card.style.display = ok ? "" : "none";
                if (ok) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        [keywordInput, yearSelect, regionSelect, genreSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilter);
                control.addEventListener("change", applyFilter);
            }
        });
    });

    var searchInput = document.getElementById("searchPageInput");
    var searchResults = document.getElementById("searchResults");
    var searchEmpty = document.getElementById("searchEmpty");

    if (searchInput && searchResults && Array.isArray(window.MOVIE_SEARCH_DATA)) {
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q") || "";
        searchInput.value = initialQuery;

        function renderCard(movie) {
            return [
                '<a class="movie-card" href="' + movie.url + '">',
                '<span class="poster-wrap">',
                '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
                '<span class="poster-shade"></span>',
                '<span class="type-badge">' + escapeHtml(movie.type) + '</span>',
                '<span class="year-badge">' + escapeHtml(movie.year) + '</span>',
                '</span>',
                '<span class="card-body">',
                '<strong>' + escapeHtml(movie.title) + '</strong>',
                '<span class="card-desc">' + escapeHtml(movie.oneLine) + '</span>',
                '<span class="card-meta"><em>' + escapeHtml(movie.genre) + '</em><span>' + escapeHtml(movie.region) + '</span></span>',
                '<span class="card-tags">' + escapeHtml(movie.tags) + '</span>',
                '</span>',
                '</a>'
            ].join("");
        }

        function escapeHtml(value) {
            return String(value || "")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#39;");
        }

        function runSearch() {
            var query = searchInput.value.trim().toLowerCase();
            var results = [];

            if (query) {
                results = window.MOVIE_SEARCH_DATA.filter(function (movie) {
                    return movie.searchText.indexOf(query) !== -1;
                }).slice(0, 120);
            }

            searchResults.innerHTML = results.map(renderCard).join("");
            if (searchEmpty) {
                if (!query) {
                    searchEmpty.textContent = "输入关键词后显示匹配内容";
                } else {
                    searchEmpty.textContent = "没有找到匹配的内容";
                }
                searchEmpty.classList.toggle("is-visible", results.length === 0);
            }
        }

        searchInput.addEventListener("input", runSearch);
        runSearch();
    }
})();
