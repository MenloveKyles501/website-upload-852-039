(function () {
  'use strict';

  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function initMobileMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');

    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener('click', function () {
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      panel.hidden = expanded;
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');

    if (!slider) {
      return;
    }

    var slides = selectAll('.hero-slide', slider);
    var dots = selectAll('.hero-dot', slider);
    var previous = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.dataset.slide || 0));
        restart();
      });
    });

    if (previous) {
      previous.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    restart();
  }

  function initSearchForms() {
    selectAll('.site-search-form').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');

        if (!input || !input.value.trim()) {
          event.preventDefault();
        }
      });
    });
  }

  function initInlineFilters() {
    selectAll('[data-filter-scope]').forEach(function (form) {
      var targetId = form.getAttribute('data-filter-scope');
      var input = form.querySelector('input');
      var grid = document.getElementById(targetId);

      if (!input || !grid) {
        return;
      }

      var cards = selectAll('.movie-card', grid);

      input.addEventListener('input', function () {
        var keyword = normalize(input.value);
        cards.forEach(function (card) {
          var haystack = normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year,
            card.dataset.genre,
            card.dataset.tags
          ].join(' '));
          card.hidden = Boolean(keyword) && haystack.indexOf(keyword) === -1;
        });
      });
    });
  }

  function initLibraryTools() {
    var form = document.querySelector('[data-library-tools]');
    var grid = document.querySelector('[data-library-grid]');

    if (!form || !grid) {
      return;
    }

    var cards = selectAll('.movie-card', grid);
    var originalOrder = cards.slice();

    function passesRegion(card, region) {
      var text = normalize(card.dataset.region + ' ' + card.dataset.tags + ' ' + card.dataset.genre);

      if (!region) {
        return true;
      }

      if (region === '华语') {
        return /中国|香港|台湾|大陆|内地|国产|华语/.test(text);
      }

      if (region === '日韩') {
        return /日本|韩国|日韩|日剧|韩剧/.test(text);
      }

      if (region === '欧美') {
        return /美国|英国|法国|德国|意大利|西班牙|加拿大|澳大利亚|欧美|欧洲|俄罗斯/.test(text);
      }

      return !passesRegion(card, '华语') && !passesRegion(card, '日韩') && !passesRegion(card, '欧美');
    }

    function apply() {
      var keyword = normalize(form.elements.keyword.value);
      var region = form.elements.region.value;
      var type = normalize(form.elements.type.value);
      var sort = form.elements.sort.value;
      var ordered = originalOrder.slice();

      if (sort === 'year-desc') {
        ordered.sort(function (a, b) {
          return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        });
      }

      if (sort === 'year-asc') {
        ordered.sort(function (a, b) {
          return Number(a.dataset.year || 0) - Number(b.dataset.year || 0);
        });
      }

      if (sort === 'title') {
        ordered.sort(function (a, b) {
          return String(a.dataset.title || '').localeCompare(String(b.dataset.title || ''), 'zh-Hans-CN');
        });
      }

      ordered.forEach(function (card) {
        grid.appendChild(card);
      });

      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.tags
        ].join(' '));
        var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
        var regionMatch = passesRegion(card, region);
        var typeMatch = !type || haystack.indexOf(type) !== -1;
        card.hidden = !(keywordMatch && regionMatch && typeMatch);
      });
    }

    form.addEventListener('input', apply);
    form.addEventListener('change', apply);
  }

  function movieCardTemplate(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<a class="movie-card" href="' + encodeURI(movie.url) + '">',
      '  <span class="poster-shell">',
      '    <img src="' + encodeURI(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" class="poster-image">',
      '    <span class="poster-shade"></span>',
      '    <span class="poster-year">' + escapeHtml(movie.year) + '</span>',
      '    <span class="poster-play">▶</span>',
      '  </span>',
      '  <span class="movie-card-body">',
      '    <strong>' + escapeHtml(movie.title) + '</strong>',
      '    <em>' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</em>',
      '    <span class="movie-card-line">' + escapeHtml(movie.oneLine || movie.summary || '') + '</span>',
      '    <span class="tag-row">' + tags + '</span>',
      '  </span>',
      '</a>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initSearchPage() {
    var form = document.querySelector('[data-search-page-form]');
    var results = document.querySelector('[data-search-results]');
    var status = document.querySelector('[data-search-status]');
    var movies = window.MOVIE_INDEX || [];

    if (!form || !results || !status || !movies.length) {
      return;
    }

    var input = form.querySelector('input[name="q"]');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';

    input.value = initial;

    function render(query) {
      var keyword = normalize(query);
      var matched = movies.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          (movie.tags || []).join(' '),
          movie.oneLine,
          movie.summary
        ].join(' '));
        return keyword && haystack.indexOf(keyword) !== -1;
      }).slice(0, 120);

      if (!keyword) {
        status.textContent = '请输入关键词开始搜索。';
        results.innerHTML = '';
        return;
      }

      status.textContent = matched.length ? '已展示匹配结果。' : '没有找到匹配结果。';
      results.innerHTML = matched.map(movieCardTemplate).join('');
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = input.value.trim();
      var url = new URL(window.location.href);
      url.searchParams.set('q', query);
      window.history.replaceState(null, '', url.toString());
      render(query);
    });

    input.addEventListener('input', function () {
      render(input.value);
    });

    render(initial);
  }

  function initPlayers() {
    selectAll('[data-player]').forEach(function (player) {
      var video = player.querySelector('.js-video-player');
      var trigger = player.querySelector('.js-player-trigger');
      var hlsInstance = null;

      if (!video) {
        return;
      }

      function attachSource() {
        var source = video.getAttribute('data-src');

        if (!source || video.dataset.bound === 'true') {
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else {
          video.src = source;
        }

        video.dataset.bound = 'true';
      }

      function play() {
        attachSource();
        player.classList.add('is-playing');
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            player.classList.remove('is-playing');
          });
        }
      }

      if (trigger) {
        trigger.addEventListener('click', play);
      }

      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });

      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });

      video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
          player.classList.remove('is-playing');
        }
      });

      video.addEventListener('ended', function () {
        player.classList.remove('is-playing');
      });

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHeroSlider();
    initSearchForms();
    initInlineFilters();
    initLibraryTools();
    initSearchPage();
    initPlayers();
  });
})();
