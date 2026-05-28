(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function toggleMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-site-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function heroCarousel() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function readQuery() {
    var params = new URLSearchParams(window.location.search);
    return (params.get("q") || "").trim();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function (panel) {
      var targetId = panel.getAttribute("data-target");
      var target = targetId ? document.getElementById(targetId) : null;
      if (!target) {
        return;
      }
      var cards = Array.prototype.slice.call(target.querySelectorAll("[data-movie-card]"));
      var input = panel.querySelector("[data-filter-input]");
      var selects = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-select]"));
      var clear = panel.querySelector("[data-filter-clear]");
      var initialQuery = readQuery();
      if (input && initialQuery) {
        input.value = initialQuery;
      }
      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var filters = {};
        selects.forEach(function (select) {
          var key = select.getAttribute("data-filter-select");
          filters[key] = select.value;
        });
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-text") || "").toLowerCase();
          var title = (card.getAttribute("data-title") || "").toLowerCase();
          var matchedKeyword = !keyword || text.indexOf(keyword) !== -1 || title.indexOf(keyword) !== -1;
          var matchedSelects = Object.keys(filters).every(function (key) {
            var value = filters[key];
            if (!value) {
              return true;
            }
            return (card.getAttribute("data-" + key) || "") === value;
          });
          card.classList.toggle("is-hidden", !(matchedKeyword && matchedSelects));
        });
      }
      if (input) {
        input.addEventListener("input", apply);
      }
      selects.forEach(function (select) {
        select.addEventListener("change", apply);
      });
      if (clear) {
        clear.addEventListener("click", function () {
          if (input) {
            input.value = "";
          }
          selects.forEach(function (select) {
            select.value = "";
          });
          apply();
        });
      }
      apply();
    });
  }

  function backTop() {
    var button = document.querySelector("[data-back-top]");
    if (!button) {
      return;
    }
    function update() {
      button.classList.toggle("is-visible", window.scrollY > 420);
    }
    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  ready(function () {
    toggleMenu();
    heroCarousel();
    setupFilters();
    backTop();
  });
})();

function initMoviePlayer(src) {
  var video = document.getElementById("moviePlayer");
  var startButton = document.getElementById("playerStart");
  if (!video || !startButton || !src) {
    return;
  }
  var attached = false;
  var hlsInstance = null;

  function attach() {
    if (attached) {
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      attached = true;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hlsInstance.loadSource(src);
      hlsInstance.attachMedia(video);
      attached = true;
      return;
    }
    video.src = src;
    attached = true;
  }

  function play() {
    attach();
    startButton.classList.add("is-hidden");
    video.controls = true;
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  }

  startButton.addEventListener("click", play);
  video.addEventListener("click", function () {
    if (video.paused) {
      play();
    } else {
      video.pause();
    }
  });
  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
