
    (function () {
      "use strict";

      var config = window.TANIBERGEN_CONFIG || {};
      var rawWorks = Array.isArray(window.TANIBERGEN_WORKS) ? window.TANIBERGEN_WORKS : [];

      var works = rawWorks
        .map(function (item, idx) {
          return Object.assign({}, item, {
            _order: typeof item.order === "number" ? item.order : idx + 1,
            _plate: padNumber(idx + 1)
          });
        })
        .sort(function (a, b) {
          return a._order - b._order;
        })
        .map(function (item, idx) {
          item._plate = padNumber(idx + 1);
          return item;
        });

      var state = {
        view: "sequence",
        series: "All",
        filtered: works.slice(),
        activeIndex: 0,
        lightboxOpen: false,
        lightboxIndex: 0,
        infoOpen: false,
        hudHidden: false,
        lastFocused: null
      };

      var dom = {
        brandReset: document.getElementById("brand-reset"),
        modeButtons: document.querySelectorAll(".mode-btn[data-view]"),
        infoToggle: document.getElementById("info-toggle"),
        infoDrawer: document.getElementById("info-drawer"),
        infoClose: document.getElementById("info-close"),
        desktopSeries: document.getElementById("desktop-series-list"),
        mobileSeries: document.getElementById("mobile-series-list"),
        railCounter: document.getElementById("rail-counter"),
        mobileCounter: document.getElementById("mobile-counter"),
        railProgress: document.getElementById("rail-progress-fill"),
        sequenceView: document.getElementById("sequence-view"),
        contactView: document.getElementById("contact-view"),
        lightbox: document.getElementById("lightbox"),
        lbStage: document.getElementById("lb-stage"),
        lbMediaWrap: document.getElementById("lb-media-wrap"),
        lbCaption: document.getElementById("lb-caption"),
        lbCounter: document.getElementById("lb-counter"),
        lbClose: document.getElementById("lb-close"),
        lbPrev: document.getElementById("lb-prev"),
        lbNext: document.getElementById("lb-next"),
        lbMobilePrev: document.getElementById("lb-m-prev"),
        lbMobileNext: document.getElementById("lb-m-next")
      };

      var plateObserver = null;

      function padNumber(n) {
        return n < 10 ? "0" + n : String(n);
      }

      function safeUrl(path) {
        return encodeURI(String(path || ""));
      }

      function getNumericRatio(work) {
        if (work.width && work.height) return work.width / work.height;
        if (work.ratio) {
          var parts = String(work.ratio).split(/[:/]/);
          if (parts.length === 2) {
            var w = parseFloat(parts[0]);
            var h = parseFloat(parts[1]);
            if (w > 0 && h > 0) return w / h;
          }
        }
        return 4 / 3;
      }

      function getAspectRatio(work) {
        if (work.width && work.height) return work.width + " / " + work.height;
        if (work.ratio) return String(work.ratio).replace(":", " / ");
        return "4 / 3";
      }

      function getFormatLabel(work) {
        if (work.width && work.height) {
          var r = work.width / work.height;
          if (r >= 2.0) return "PANORAMIC";
          if (r > 1.05) return "HORIZONTAL";
          if (r < 0.95) return "VERTICAL";
          return "SQUARE";
        }
        return "ORIGINAL RATIO";
      }

      function populateMeta() {
        var setText = function (id, value) {
          var el = document.getElementById(id);
          if (el && value) el.textContent = value;
        };

        setText("info-title", config.title || "TANIBERGEN");
        setText("info-statement", config.statement || "");
        setText("info-note", config.note || "");
        setText("info-domain", config.domain || "tanibergen.online");
        setText("rail-domain", config.domain || "tanibergen.online");

        var igHandle = config.instagramHandle || "@isaac_4u";
        var igUrl = config.instagramUrl || "https://instagram.com/isaac_4u";

        ["rail-instagram", "info-instagram"].forEach(function (id) {
          var link = document.getElementById(id);
          if (link) {
            link.textContent = igHandle;
            link.href = igUrl;
          }
        });

        var emailLink = document.getElementById("info-email");
        if (emailLink && config.email) {
          emailLink.textContent = config.email;
          emailLink.href = "mailto:" + config.email;
        }
      }

      function getSeriesSummary() {
        var counts = { All: works.length };
        var order = ["All"];
        works.forEach(function (w) {
          var name = (w.series || "Archive").trim();
          if (!Object.prototype.hasOwnProperty.call(counts, name)) {
            counts[name] = 0;
            order.push(name);
          }
          counts[name] += 1;
        });
        return order.map(function (name) {
          return { name: name, count: counts[name] };
        });
      }

      function renderSeriesFilters() {
        var items = getSeriesSummary();
        dom.desktopSeries.innerHTML = "";
        dom.mobileSeries.innerHTML = "";

        items.forEach(function (item) {
          var isActive = state.series === item.name;

          var li = document.createElement("li");
          var dBtn = document.createElement("button");
          dBtn.type = "button";
          dBtn.className = "series-btn" + (isActive ? " is-active" : "");
          dBtn.setAttribute("aria-pressed", String(isActive));

          var dName = document.createElement("span");
          dName.textContent = item.name;
          var dCount = document.createElement("span");
          dCount.className = "series-count";
          dCount.textContent = padNumber(item.count);
          dBtn.appendChild(dName);
          dBtn.appendChild(dCount);
          dBtn.addEventListener("click", function () { selectSeries(item.name); });
          li.appendChild(dBtn);
          dom.desktopSeries.appendChild(li);

          var mBtn = document.createElement("button");
          mBtn.type = "button";
          mBtn.className = "mobile-series-btn" + (isActive ? " is-active" : "");
          mBtn.setAttribute("aria-pressed", String(isActive));
          mBtn.textContent = item.name + " (" + item.count + ")";
          mBtn.addEventListener("click", function () { selectSeries(item.name); });
          dom.mobileSeries.appendChild(mBtn);
        });
      }

      function selectSeries(seriesName) {
        state.series = seriesName;
        state.filtered = seriesName === "All"
          ? works.slice()
          : works.filter(function (w) { return (w.series || "Archive").trim() === seriesName; });
        state.activeIndex = 0;
        renderSeriesFilters();
        renderActiveView();
        updateCounter(0);
        window.scrollTo({ top: 0, behavior: "auto" });
      }

      function createPlaceholderLayer(work, compact) {
        var box = document.createElement("div");
        box.className = "plate-placeholder" + (compact ? " is-compact" : "");

        var top = document.createElement("div");
        top.className = "ph-row";
        var num = document.createElement("span");
        num.textContent = "PL. " + work._plate;
        var fmt = document.createElement("span");
        fmt.textContent = getFormatLabel(work);
        top.appendChild(num);
        top.appendChild(fmt);

        var mid = document.createElement("div");
        mid.className = "ph-center";
        var fileNote = document.createElement("span");
        fileNote.className = "ph-file";
        fileNote.textContent = "TANIBERGEN / PL. " + work._plate;
        var hint = document.createElement("span");
        hint.className = "ph-hint";
        hint.textContent = "Loading image";
        mid.appendChild(fileNote);
        if (!compact) mid.appendChild(hint);

        box.appendChild(top);
        box.appendChild(mid);
        return box;
      }

      function buildMediaFrame(work, index, isPriority, compact) {
        var frame = document.createElement("div");
        frame.className = "plate-frame";
        frame.style.aspectRatio = getAspectRatio(work);
        frame.appendChild(createPlaceholderLayer(work, compact));

        var img = document.createElement("img");
        img.className = "plate-img";
        img.src = safeUrl(compact && work.thumb ? work.thumb : work.file);
        img.alt = work.title ? work.title : "Photograph " + work._plate;
        img.decoding = "async";
        img.loading = isPriority ? "eager" : "lazy";
        if (isPriority) img.setAttribute("fetchpriority", "high");

        img.addEventListener("load", function () {
          if (img.naturalWidth && img.naturalHeight) {
            frame.style.aspectRatio = img.naturalWidth + " / " + img.naturalHeight;
          }
          frame.classList.add("is-loaded");
        });

        img.addEventListener("error", function () {
          frame.classList.add("is-missing");
        });

        frame.appendChild(img);
        return frame;
      }

      function formatCaptionMeta(work) {
        var parts = [];
        if (work.series) parts.push(work.series);
        if (work.location) parts.push(work.location);
        if (work.year) parts.push(work.year);
        return parts.join(" · ");
      }

      function renderSequenceView() {
        if (plateObserver) { plateObserver.disconnect(); plateObserver = null; }
        dom.sequenceView.innerHTML = "";

        if (!state.filtered.length) {
          var empty = document.createElement("p");
          empty.className = "empty-state";
          empty.textContent = "No photographs in this series yet.";
          dom.sequenceView.appendChild(empty);
          return;
        }

        state.filtered.forEach(function (work, idx) {
          var article = document.createElement("article");
          article.className = "plate-item scale-" + (work.scale || "medium") + " align-" + (work.align || "left");
          article.dataset.index = String(idx);

          var trigger = document.createElement("button");
          trigger.type = "button";
          trigger.className = "plate-trigger";
          trigger.setAttribute("aria-label", "Open photograph " + work._plate + (work.title ? ": " + work.title : ""));
          trigger.addEventListener("click", function () { openLightbox(idx); });
          trigger.appendChild(buildMediaFrame(work, idx, idx < 2, false));

          var meta = document.createElement("footer");
          meta.className = "plate-meta";

          var metaLeft = document.createElement("div");
          metaLeft.className = "plate-meta-left";
          var code = document.createElement("span");
          code.className = "plate-code";
          code.textContent = "PL. " + work._plate;
          var title = document.createElement("span");
          title.className = "plate-title";
          title.textContent = work.title || "Untitled";
          metaLeft.appendChild(code);
          metaLeft.appendChild(title);

          var metaRight = document.createElement("span");
          metaRight.className = "plate-sub";
          metaRight.textContent = formatCaptionMeta(work);

          meta.appendChild(metaLeft);
          meta.appendChild(metaRight);
          article.appendChild(trigger);
          article.appendChild(meta);
          dom.sequenceView.appendChild(article);
        });

        setupPlateObserver();
      }

      function renderContactView() {
        if (plateObserver) { plateObserver.disconnect(); plateObserver = null; }
        dom.contactView.innerHTML = "";

        if (!state.filtered.length) {
          var empty = document.createElement("p");
          empty.className = "empty-state";
          empty.textContent = "No photographs in this series yet.";
          dom.contactView.appendChild(empty);
          return;
        }

        var grid = document.createElement("div");
        grid.className = "contact-grid";

        state.filtered.forEach(function (work, idx) {
          var cell = document.createElement("button");
          cell.type = "button";
          cell.className = "contact-cell";
          cell.setAttribute("aria-label", "Inspect plate " + work._plate + (work.title ? ": " + work.title : ""));
          cell.appendChild(buildMediaFrame(work, idx, idx < 4, true));

          var label = document.createElement("div");
          label.className = "contact-label";
          var num = document.createElement("span");
          num.className = "contact-num";
          num.textContent = work._plate;
          var name = document.createElement("span");
          name.className = "contact-name";
          name.textContent = work.title || work.series || "Untitled";
          label.appendChild(num);
          label.appendChild(name);
          cell.appendChild(label);
          cell.addEventListener("click", function () { openLightbox(idx); });
          grid.appendChild(cell);
        });

        dom.contactView.appendChild(grid);
      }

      function setupPlateObserver() {
        if (!("IntersectionObserver" in window)) return;
        var items = dom.sequenceView.querySelectorAll(".plate-item");
        if (!items.length) return;

        plateObserver = new IntersectionObserver(function (entries) {
          var visible = entries.filter(function (e) { return e.isIntersecting; })
            .sort(function (a, b) { return b.intersectionRatio - a.intersectionRatio; });
          if (visible.length) updateCounter(Number(visible[0].target.dataset.index || 0));
        }, { rootMargin: "-15% 0px -35% 0px", threshold: [0.1, 0.35, 0.6] });

        items.forEach(function (item) { plateObserver.observe(item); });
      }

      function updateCounter(index) {
        var total = state.filtered.length;
        if (!total) {
          dom.railCounter.textContent = "00 / 00";
          dom.mobileCounter.textContent = "00 / 00";
          dom.railProgress.style.width = "0%";
          return;
        }
        var safeIndex = Math.max(0, Math.min(index, total - 1));
        state.activeIndex = safeIndex;
        var label = padNumber(safeIndex + 1) + " / " + padNumber(total);
        dom.railCounter.textContent = label;
        dom.mobileCounter.textContent = label;
        dom.railProgress.style.width = ((safeIndex + 1) / total) * 100 + "%";
      }

      function switchView(viewName) {
        if (state.view === viewName) return;
        state.view = viewName;
        dom.modeButtons.forEach(function (btn) {
          var active = btn.dataset.view === viewName;
          btn.classList.toggle("is-active", active);
          btn.setAttribute("aria-pressed", String(active));
        });
        renderActiveView();
        window.scrollTo({ top: 0, behavior: "auto" });
      }

      function renderActiveView() {
        if (state.view === "sequence") {
          dom.contactView.hidden = true;
          dom.sequenceView.hidden = false;
          renderSequenceView();
        } else {
          dom.sequenceView.hidden = true;
          dom.contactView.hidden = false;
          renderContactView();
        }
      }

      function openInfo() {
        state.lastFocused = document.activeElement;
        state.infoOpen = true;
        dom.infoDrawer.hidden = false;
        dom.infoToggle.setAttribute("aria-expanded", "true");
        document.body.classList.add("is-locked");
        dom.infoClose.focus();
      }

      function closeInfo() {
        if (!state.infoOpen) return;
        state.infoOpen = false;
        dom.infoDrawer.hidden = true;
        dom.infoToggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("is-locked");
        if (state.lastFocused && typeof state.lastFocused.focus === "function") state.lastFocused.focus();
      }

      function openLightbox(index) {
        if (!state.filtered.length) return;
        state.lastFocused = document.activeElement;
        state.lightboxOpen = true;
        state.lightboxIndex = index;
        state.hudHidden = false;
        dom.lightbox.classList.remove("hud-hidden");
        dom.lightbox.hidden = false;
        document.body.classList.add("is-locked");
        renderLightboxFrame();
        dom.lbClose.focus();
      }

      function closeLightbox() {
        if (!state.lightboxOpen) return;
        state.lightboxOpen = false;
        dom.lightbox.hidden = true;
        dom.lbMediaWrap.innerHTML = "";
        document.body.classList.remove("is-locked");
        if (state.lastFocused && typeof state.lastFocused.focus === "function") state.lastFocused.focus();
      }

      function stepLightbox(delta) {
        var total = state.filtered.length;
        if (!total) return;
        state.lightboxIndex = (state.lightboxIndex + delta + total) % total;
        renderLightboxFrame();
      }

      function preloadNeighbor(index) {
        var total = state.filtered.length;
        if (total < 2) return;
        var work = state.filtered[(index + total) % total];
        if (!work || !work.file) return;
        var img = new Image();
        img.decoding = "async";
        img.fetchPriority = "low";
        img.src = safeUrl(work.file);
      }

      function renderLightboxFrame() {
        var total = state.filtered.length;
        var work = state.filtered[state.lightboxIndex];
        if (!work) return;

        dom.lbCounter.textContent = padNumber(state.lightboxIndex + 1) + " / " + padNumber(total);
        dom.lbMediaWrap.innerHTML = "";
        dom.lbMediaWrap.style.setProperty("--lb-ar", String(getNumericRatio(work)));

        var frame = document.createElement("div");
        frame.className = "lb-frame";
        frame.style.aspectRatio = getAspectRatio(work);
        frame.appendChild(createPlaceholderLayer(work, false));

        var img = document.createElement("img");
        img.className = "lb-img";
        img.src = safeUrl(work.file);
        img.alt = work.title ? work.title : "Photograph " + work._plate;
        img.decoding = "async";

        img.addEventListener("load", function () {
          if (img.naturalWidth && img.naturalHeight) {
            frame.style.aspectRatio = img.naturalWidth + " / " + img.naturalHeight;
            dom.lbMediaWrap.style.setProperty("--lb-ar", String(img.naturalWidth / img.naturalHeight));
          }
          frame.classList.add("is-loaded");
        });

        img.addEventListener("error", function () {
          frame.classList.add("is-missing");
        });

        frame.appendChild(img);
        dom.lbMediaWrap.appendChild(frame);

        var sub = formatCaptionMeta(work);
        dom.lbCaption.textContent = "PL. " + work._plate + " - " + (work.title || "Untitled") + (sub ? " · " + sub : "");

        preloadNeighbor(state.lightboxIndex + 1);
        preloadNeighbor(state.lightboxIndex - 1);
      }

      function bindEvents() {
        dom.brandReset.addEventListener("click", function () {
          if (state.view !== "sequence") {
            state.view = "sequence";
            dom.modeButtons.forEach(function (btn) {
              var active = btn.dataset.view === "sequence";
              btn.classList.toggle("is-active", active);
              btn.setAttribute("aria-pressed", String(active));
            });
          }
          selectSeries("All");
        });

        dom.modeButtons.forEach(function (btn) {
          btn.addEventListener("click", function () { switchView(btn.dataset.view); });
        });

        dom.infoToggle.addEventListener("click", function () {
          if (state.infoOpen) closeInfo(); else openInfo();
        });

        dom.infoClose.addEventListener("click", closeInfo);
        dom.infoDrawer.querySelectorAll("[data-close-info]").forEach(function (el) {
          el.addEventListener("click", closeInfo);
        });

        dom.lbClose.addEventListener("click", closeLightbox);
        dom.lbPrev.addEventListener("click", function () { stepLightbox(-1); });
        dom.lbNext.addEventListener("click", function () { stepLightbox(1); });
        dom.lbMobilePrev.addEventListener("click", function () { stepLightbox(-1); });
        dom.lbMobileNext.addEventListener("click", function () { stepLightbox(1); });

        dom.lbMediaWrap.addEventListener("click", function () {
          state.hudHidden = !state.hudHidden;
          dom.lightbox.classList.toggle("hud-hidden", state.hudHidden);
        });

        document.addEventListener("keydown", function (e) {
          if (state.lightboxOpen) {
            if (e.key === "Escape") closeLightbox();
            if (e.key === "ArrowRight") stepLightbox(1);
            if (e.key === "ArrowLeft") stepLightbox(-1);
            return;
          }
          if (state.infoOpen && e.key === "Escape") closeInfo();
        });

        var touchStartX = 0;
        var touchStartY = 0;

        dom.lbStage.addEventListener("touchstart", function (e) {
          if (!e.touches.length) return;
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
        }, { passive: true });

        dom.lbStage.addEventListener("touchend", function (e) {
          if (!state.lightboxOpen || !e.changedTouches.length) return;
          var dx = e.changedTouches[0].clientX - touchStartX;
          var dy = e.changedTouches[0].clientY - touchStartY;
          if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.25) {
            stepLightbox(dx < 0 ? 1 : -1);
          }
        }, { passive: true });
      }

      populateMeta();
      renderSeriesFilters();
      renderActiveView();
      updateCounter(0);
      bindEvents();
    })();
  