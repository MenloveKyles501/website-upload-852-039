(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var yearNodes = document.querySelectorAll('[data-year]');
  yearNodes.forEach(function (node) {
    node.textContent = new Date().getFullYear();
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === activeSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === activeSlide);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  showSlide(0);

  var filterGroups = Array.prototype.slice.call(document.querySelectorAll('[data-filter-group]'));

  filterGroups.forEach(function (group) {
    var search = group.querySelector('[data-filter-search]');
    var region = group.querySelector('[data-filter-region]');
    var year = group.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(group.querySelectorAll('.movie-card'));
    var empty = group.querySelector('[data-empty-state]');

    function applyFilters() {
      var keyword = search ? search.value.trim().toLowerCase() : '';
      var selectedRegion = region ? region.value : '';
      var selectedYear = year ? year.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchesRegion = !selectedRegion || card.getAttribute('data-region') === selectedRegion;
        var matchesYear = !selectedYear || card.getAttribute('data-year') === selectedYear;
        var show = matchesKeyword && matchesRegion && matchesYear;
        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    }

    [search, region, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });
  });
}());

function initVideoPlayer(videoId, overlayId, buttonId, streamUrl) {
  var video = document.getElementById(videoId);
  var overlay = document.getElementById(overlayId);
  var button = document.getElementById(buttonId);
  var ready = false;
  var hlsInstance = null;

  function attachStream() {
    if (!video || ready) {
      return;
    }

    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = streamUrl;
  }

  function startPlayer(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (!video) {
      return;
    }

    attachStream();

    if (overlay) {
      overlay.classList.add('hidden');
    }

    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener('click', startPlayer);
  }

  if (overlay) {
    overlay.addEventListener('click', startPlayer);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayer();
      }
    });
    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
}
