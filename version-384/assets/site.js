(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector(".menu-toggle");
        var nav = document.querySelector(".mobile-nav");
        if (toggle && nav) {
            toggle.addEventListener("click", function () {
                var open = nav.classList.toggle("open");
                toggle.setAttribute("aria-expanded", String(open));
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var prev = document.querySelector(".hero-prev");
        var next = document.querySelector(".hero-next");
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === current);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            if (slides.length > 1) {
                timer = window.setInterval(function () {
                    showSlide(current + 1);
                }, 5200);
            }
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                showSlide(i);
                restart();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(current - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                showSlide(current + 1);
                restart();
            });
        }
        showSlide(0);
        restart();

        var searchRoot = document.querySelector("[data-search-page]");
        if (searchRoot) {
            var input = searchRoot.querySelector(".search-box");
            var cards = Array.prototype.slice.call(searchRoot.querySelectorAll(".movie-card"));
            var buttons = Array.prototype.slice.call(searchRoot.querySelectorAll(".filter-btn"));
            var status = searchRoot.querySelector(".search-status");
            var activeCat = "all";

            function applySearch() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var count = 0;
                cards.forEach(function (card) {
                    var haystack = (card.getAttribute("data-search") || "").toLowerCase();
                    var cardCat = card.getAttribute("data-cat") || "";
                    var matchedText = !query || haystack.indexOf(query) !== -1;
                    var matchedCat = activeCat === "all" || cardCat === activeCat;
                    var visible = matchedText && matchedCat;
                    card.classList.toggle("hidden-by-search", !visible);
                    if (visible) {
                        count += 1;
                    }
                });
                if (status) {
                    status.textContent = "已匹配 " + count + " 部作品";
                }
            }

            if (input) {
                input.addEventListener("input", applySearch);
            }
            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    buttons.forEach(function (btn) {
                        btn.classList.remove("active");
                    });
                    button.classList.add("active");
                    activeCat = button.getAttribute("data-filter") || "all";
                    applySearch();
                });
            });
            applySearch();
        }
    });
})();
