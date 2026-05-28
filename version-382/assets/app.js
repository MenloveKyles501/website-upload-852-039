
(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var menuButton = document.querySelector('[data-menu-button]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('.js-hero');

    if (hero) {
        var slides = selectAll('.hero-slide', hero);
        var dots = selectAll('[data-hero-dot]', hero);
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5600);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startTimer();
            });
        });

        showSlide(0);
        startTimer();
    }

    var searchInput = document.querySelector('.card-search');
    var yearFilter = document.querySelector('.card-year-filter');
    var typeFilter = document.querySelector('.card-type-filter');
    var resultNote = document.querySelector('[data-result-note]');
    var cards = selectAll('.searchable-grid .movie-card');

    function queryValue(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name) || '';
    }

    if (searchInput && queryValue('q')) {
        searchInput.value = queryValue('q');
    }

    function applyCardFilter() {
        if (!cards.length) {
            return;
        }

        var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
        var year = yearFilter ? yearFilter.value : '';
        var type = typeFilter ? typeFilter.value : '';
        var visible = 0;

        cards.forEach(function (card) {
            var text = (card.getAttribute('data-search') || '').toLowerCase();
            var cardYear = card.getAttribute('data-year') || '';
            var cardType = card.getAttribute('data-type') || '';
            var matched = true;

            if (keyword && text.indexOf(keyword) === -1) {
                matched = false;
            }

            if (year && cardYear !== year) {
                matched = false;
            }

            if (type && cardType !== type) {
                matched = false;
            }

            card.style.display = matched ? '' : 'none';

            if (matched) {
                visible += 1;
            }
        });

        if (resultNote) {
            resultNote.textContent = '当前显示 ' + visible + ' 部影片';
        }
    }

    [searchInput, yearFilter, typeFilter].forEach(function (item) {
        if (item) {
            item.addEventListener('input', applyCardFilter);
            item.addEventListener('change', applyCardFilter);
        }
    });

    applyCardFilter();
}());
