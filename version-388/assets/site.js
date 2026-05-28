(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMobileMenu() {
    var button = qs('[data-mobile-menu-button]');
    var menu = qs('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupBackToTop() {
    var button = qs('[data-back-to-top]');
    if (!button) {
      return;
    }

    function update() {
      if (window.scrollY > 420) {
        button.classList.add('is-visible');
      } else {
        button.classList.remove('is-visible');
      }
    }

    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  function setupHeroCarousel() {
    var carousel = qs('[data-hero-carousel]');
    if (!carousel) {
      return;
    }

    var slides = qsa('[data-hero-slide]', carousel);
    var dots = qsa('[data-hero-dot]', carousel);
    var prev = qs('[data-hero-prev]', carousel);
    var next = qs('[data-hero-next]', carousel);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function uniqueSorted(cards, field) {
    var values = cards.map(function (card) {
      return card.getAttribute('data-' + field) || '';
    }).filter(Boolean);

    return values.filter(function (value, index) {
      return values.indexOf(value) === index;
    }).sort(function (a, b) {
      return String(b).localeCompare(String(a), 'zh-CN');
    });
  }

  function setupFilters() {
    var searchInput = qs('[data-search-input]');
    var filterSelects = qsa('[data-filter-field]');
    var cards = qsa('[data-movie-card]');
    var countNode = qs('[data-filter-count]');

    if (!cards.length) {
      return;
    }

    filterSelects.forEach(function (select) {
      var field = select.getAttribute('data-filter-field');
      uniqueSorted(cards, field).forEach(function (value) {
        var option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    });

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilter() {
      var keyword = normalize(searchInput ? searchInput.value : '');
      var activeFilters = {};

      filterSelects.forEach(function (select) {
        var field = select.getAttribute('data-filter-field');
        activeFilters[field] = select.value;
      });

      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-keywords') || card.textContent);
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchFilters = Object.keys(activeFilters).every(function (field) {
          return !activeFilters[field] || card.getAttribute('data-' + field) === activeFilters[field];
        });
        var matched = matchKeyword && matchFilters;
        card.classList.toggle('hidden-by-filter', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (countNode) {
        countNode.textContent = '当前显示 ' + visible + ' 部影片';
      }
    }

    if (searchInput) {
      searchInput.addEventListener('input', applyFilter);
    }

    filterSelects.forEach(function (select) {
      select.addEventListener('change', applyFilter);
    });

    applyFilter();
  }

  function setupHlsPlayers() {
    qsa('[data-video-player]').forEach(function (wrap) {
      var video = qs('video', wrap);
      var trigger = qs('[data-play-trigger]', wrap);
      var src = video ? video.getAttribute('data-src') : '';
      var hlsInstance = null;
      var initialized = false;

      if (!video || !src) {
        return;
      }

      function init() {
        if (initialized) {
          return;
        }
        initialized = true;

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(src);
          hlsInstance.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
        } else {
          video.src = src;
        }
      }

      function playVideo() {
        init();
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            video.controls = true;
          });
        }
      }

      if (trigger) {
        trigger.addEventListener('click', function () {
          trigger.classList.add('is-hidden');
          playVideo();
        });
      }

      video.addEventListener('play', function () {
        if (trigger) {
          trigger.classList.add('is-hidden');
        }
      });

      video.addEventListener('pause', function () {
        if (trigger && video.currentTime === 0) {
          trigger.classList.remove('is-hidden');
        }
      });

      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        } else {
          video.pause();
        }
      });

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });

      init();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupBackToTop();
    setupHeroCarousel();
    setupFilters();
    setupHlsPlayers();
  });
})();
