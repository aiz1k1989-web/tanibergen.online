
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
        colorGroups: [],
        colorBusy: false,
        colorGeneration: 0,
        colorComposition: 0,
        records: [],
        lastFocused: null
      };

      var rotationTimer = null;
      var rotationDuration = 8200;
      var imageCache = Object.create(null);
      var ownerBuffer = "";
      var ownerPhrase = "bluehourindex";
      var colorCacheMemory = null;

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
        colorView: document.getElementById("color-view"),
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
      var mediaObserver = null;
      var galleryLoadObserver = null;

      function padNumber(n) {
        return n < 10 ? "0" + n : String(n);
      }

      function safeUrl(path) {
        return encodeURI(String(path || ""));
      }

      function observeMediaImage(img) {
        if (!("IntersectionObserver" in window)) {
          img.src = img.dataset.src || "";
          img.removeAttribute("data-src");
          return;
        }
        if (!mediaObserver) {
          mediaObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
              if (!entry.isIntersecting) return;
              var target = entry.target;
              mediaObserver.unobserve(target);
              var source = target.dataset.src;
              if (!source) return;
              target.removeAttribute("data-src");
              target.loading = "eager";
              target.src = source;
            });
          }, { rootMargin: "500px 0px", threshold: 0 });
        }
        mediaObserver.observe(img);
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

      function createArchiveRecords() {
        return shuffleCopy(works).slice(0, 6).map(function (_, index) {
          var pool = shuffleCopy(works);
          var amount = Math.min(pool.length, 13 + Math.floor(Math.random() * 18));
          return {
            id: String(1000 + Math.floor(Math.random() * 9000)),
            term: "Collection " + String(index + 1).padStart(2, "0"),
            items: pool.slice(0, amount)
          };
        });
      }

      function renderSeriesFilters() {
        if (!state.records.length) state.records = createArchiveRecords();
        dom.desktopSeries.innerHTML = "";
        dom.mobileSeries.innerHTML = "";
        state.records.forEach(function (record) {
          var active = state.series === record.id;
          var li = document.createElement("li");
          var button = document.createElement("button");
          button.type = "button";
          button.className = "series-btn record-btn" + (active ? " is-active" : "");
          button.setAttribute("aria-pressed", String(active));
          var code = document.createElement("span");
          code.className = "record-code";
          code.textContent = "REC. " + record.id;
          var term = document.createElement("span");
          term.className = "record-term";
          term.textContent = record.term;
          button.appendChild(code);
          button.appendChild(term);
          button.addEventListener("click", function () { selectSeries(record.id); });
          li.appendChild(button);
          dom.desktopSeries.appendChild(li);

          var mobile = document.createElement("button");
          mobile.type = "button";
          mobile.className = "mobile-series-btn" + (active ? " is-active" : "");
          mobile.setAttribute("aria-pressed", String(active));
          var mobileCode = document.createElement("span");
          mobileCode.className = "mobile-series-code";
          mobileCode.textContent = "REC. " + record.id;
          var mobileTerm = document.createElement("span");
          mobileTerm.className = "mobile-series-term";
          mobileTerm.textContent = record.term;
          mobile.appendChild(mobileCode);
          mobile.appendChild(mobileTerm);
          mobile.addEventListener("click", function () { selectSeries(record.id); });
          dom.mobileSeries.appendChild(mobile);
        });
      }

      function selectSeries(recordId) {
        state.colorGeneration++;
        state.colorGroups = [];
        state.series = recordId;
        if (recordId === "All") {
          state.filtered = works.slice();
        } else {
          var record = state.records.find(function (item) { return item.id === recordId; });
          state.filtered = record ? record.items.slice() : works.slice();
        }
        state.activeIndex = 0;
        renderSeriesFilters();
        renderActiveView();
        updateCounter(0);
        window.scrollTo({ top: 0, behavior: "auto" });
      }

      function createPlaceholderLayer(work, compact) {
        var box = document.createElement("div");
        box.className = "plate-placeholder" + (compact ? " is-compact" : "");
        box.setAttribute("aria-hidden", "true");
        return box;
      }

      function buildMediaFrame(work, index, isPriority, compact) {
        var frame = document.createElement("div");
        frame.className = "plate-frame";
        frame.style.aspectRatio = getAspectRatio(work);
        frame.appendChild(createPlaceholderLayer(work, compact));

        var img = document.createElement("img");
        img.className = "plate-img";
        img.alt = work.title ? work.title : "Photograph " + work._plate;
        img.decoding = "async";
        img.draggable = false;
        img.loading = isPriority ? "eager" : "lazy";
        if (isPriority) {
          img.setAttribute("fetchpriority", "high");
          img.src = safeUrl(compact && work.thumb ? work.thumb : work.file);
        } else {
          img.dataset.src = safeUrl(compact && work.thumb ? work.thumb : work.file);
          observeMediaImage(img);
        }

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

      function stopRotation() {
        if (rotationTimer) {
          window.clearTimeout(rotationTimer);
          rotationTimer = null;
        }
      }

      function preloadFeatured(index) {
        var work = state.filtered[index];
        if (!work || imageCache[index]) return;
        var img = new Image();
        img.decoding = "async";
        img.fetchPriority = "low";
        img.src = safeUrl(work.file);
        imageCache[index] = img;
      }

      function randomNextIndex(current) {
        var total = state.filtered.length;
        if (total < 2) return current;
        var next = current;
        while (next === current) next = Math.floor(Math.random() * total);
        return next;
      }

      function scheduleRotation() {
        stopRotation();
        if (document.hidden || state.view !== "sequence" || state.lightboxOpen || state.infoOpen || state.filtered.length < 2) return;
        var progress = dom.sequenceView.querySelector(".featured-progress-fill");
        if (progress) {
          progress.style.animation = "none";
          void progress.offsetWidth;
          progress.style.animation = "featured-progress " + rotationDuration + "ms linear forwards";
        }
        rotationTimer = window.setTimeout(advanceFeatured, rotationDuration);
      }

      function advanceFeatured() {
        if (state.view !== "sequence" || state.lightboxOpen || state.infoOpen || document.hidden) return;
        var nextIndex = randomNextIndex(state.activeIndex);
        var work = state.filtered[nextIndex];
        var shell = dom.sequenceView.querySelector(".featured-shell");
        var media = dom.sequenceView.querySelector(".featured-media");
        var oldImage = media && media.querySelector(".featured-image.is-current");
        if (!work || !media || !oldImage) return;

        var nextImage = new Image();
        nextImage.className = "featured-image is-entering";
        nextImage.alt = work.title || "Photograph " + work._plate;
        nextImage.decoding = "async";
        nextImage.src = safeUrl(work.file);
        nextImage.addEventListener("load", function () {
          if (state.view !== "sequence" || !media.isConnected) return;
          if (nextImage.naturalWidth && nextImage.naturalHeight) {
            shell.style.aspectRatio = nextImage.naturalWidth + " / " + nextImage.naturalHeight;
          }
          media.appendChild(nextImage);
          requestAnimationFrame(function () {
            nextImage.classList.add("is-current");
            nextImage.classList.remove("is-entering");
            oldImage.classList.add("is-leaving");
          });
          window.setTimeout(function () {
            if (oldImage.parentNode) oldImage.parentNode.removeChild(oldImage);
            nextImage.classList.remove("is-current");
            nextImage.classList.add("is-current");
          }, 1150);
          state.activeIndex = nextIndex;
          updateCounter(nextIndex);
          var caption = dom.sequenceView.querySelector(".featured-caption");
          if (caption) caption.textContent = "PL. " + work._plate + " / " + (work.series || "Archive");
          preloadFeatured(randomNextIndex(nextIndex));
          scheduleRotation();
        }, { once: true });
        nextImage.addEventListener("error", function () {
          scheduleRotation();
        }, { once: true });
      }

      function renderSequenceView() {
        stopRotation();
        if (plateObserver) { plateObserver.disconnect(); plateObserver = null; }
        if (galleryLoadObserver) { galleryLoadObserver.disconnect(); galleryLoadObserver = null; }
        dom.sequenceView.innerHTML = "";
        state.filtered = works.slice();

        var intro = document.createElement("section");
        intro.className = "diary-intro";
        var kicker = document.createElement("div");
        kicker.className = "diary-kicker";
        kicker.textContent = "A PERSONAL COLOUR ARCHIVE";
        var title = document.createElement("h1");
        title.className = "diary-title";
        title.textContent = "Chroma Diary";
        intro.appendChild(kicker);
        intro.appendChild(title);

        var palettes = [
          ["#D94D43","#E98B62","#F0C77D","#78947A","#315C62"],
          ["#E9C9B9","#C98279","#8C5B68","#574B68","#292D43"],
          ["#E8D9B9","#B7A77D","#7E8A70","#536D70","#354B50"],
          ["#E5A85B","#D66A45","#A9473E","#663F50","#342F45"],
          ["#D8D4C8","#A6B6B0","#6E9293","#55717F","#354A5A"],
          ["#E8B7C3","#D78C9D","#A96E89","#735B7E","#45465F"],
          ["#E3D8A5","#AEBB78","#668B70","#3F6E69","#294E55"],
          ["#F0D9B5","#D99C70","#B66F58","#80545A","#4C414F"]
        ];
        var paletteIndex = Math.floor(Math.random() * palettes.length);
        var palette = palettes[paletteIndex];
        var study = document.createElement("section");
        study.className = "palette-study";
        study.setAttribute("aria-label", "Random pre-designed colour study");
        var studyTop = document.createElement("div");
        studyTop.className = "palette-study-top";
        var studyLabel = document.createElement("span");
        studyLabel.textContent = "COLOUR STUDY";
        var studyNumber = document.createElement("span");
        studyNumber.textContent = String(paletteIndex + 1).padStart(2, "0") + " / 08";
        studyTop.appendChild(studyLabel);
        studyTop.appendChild(studyNumber);
        var swatches = document.createElement("div");
        swatches.className = "palette-swatches";
        palette.forEach(function(color) {
          var swatch = document.createElement("div");
          swatch.className = "palette-swatch";
          swatch.style.backgroundColor = color;
          swatch.setAttribute("aria-label", color);
          swatches.appendChild(swatch);
        });
        var gradients = document.createElement("div");
        gradients.className = "palette-gradients";
        for (var p = 0; p < palette.length - 1; p++) {
          var strip = document.createElement("div");
          strip.className = "palette-gradient";
          strip.style.background = "linear-gradient(90deg," + palette[p] + "," + palette[p + 1] + ")";
          gradients.appendChild(strip);
        }
        study.appendChild(studyTop);
        study.appendChild(swatches);
        study.appendChild(gradients);
        dom.sequenceView.appendChild(intro);
        dom.sequenceView.appendChild(study);

        var grid = document.createElement("div");
        grid.className = "all-card-grid";
        dom.sequenceView.appendChild(grid);
        var fragment = document.createDocumentFragment();
        state.filtered.forEach(function(work, index) {
          var card = document.createElement("button");
          card.type = "button";
          card.className = "all-photo-card";
          card.setAttribute("aria-label", "Open photograph " + work._plate);
          card.dataset.index = String(index);
          var frame = buildMediaFrame(work, index, index < 4, true);
          frame.classList.add("all-photo-frame");
          card.appendChild(frame);
          card.addEventListener("click", function(selectedWork) {
            return function() { openLightbox(state.filtered.indexOf(selectedWork)); };
          }(work));
          fragment.appendChild(card);
        });
        grid.appendChild(fragment);
        state.activeIndex = 0;
        updateCounter(0);
        setupPlateObserver();
      }

      function renderContactView() {
        stopRotation();
        if (plateObserver) { plateObserver.disconnect(); plateObserver = null; }
        if (galleryLoadObserver) { galleryLoadObserver.disconnect(); galleryLoadObserver = null; }
        dom.contactView.innerHTML = "";

        var intro = document.createElement("div");
        intro.className = "contact-intro";
        var eyebrow = document.createElement("div");
        eyebrow.className = "contact-eyebrow";
        eyebrow.textContent = "DIRECT LINES / OPEN CORRESPONDENCE";
        var title = document.createElement("h2");
        title.className = "contact-title";
        title.textContent = "Contact";
        var note = document.createElement("p");
        note.className = "contact-note";
        note.textContent = "For projects, conversations and other transmissions.";
        intro.appendChild(eyebrow);
        intro.appendChild(title);
        intro.appendChild(note);

        var list = document.createElement("div");
        list.className = "contact-details";
        var contacts = [
          { label: "EMAIL", value: "aiz1k1989@gmail.com", href: "mailto:aiz1k1989@gmail.com" },
          { label: "INSTAGRAM", value: "Isaac_4u", href: "https://instagram.com/Isaac_4u" },
          { label: "WHATSAPP", value: "87004453544", href: "https://wa.me/87004453544" }
        ];
        contacts.forEach(function (item, index) {
          var row = document.createElement("a");
          row.className = "contact-detail";
          row.href = item.href;
          if (item.label !== "EMAIL") { row.target = "_blank"; row.rel = "noopener noreferrer"; }
          var number = document.createElement("span");
          number.className = "contact-detail-index";
          number.textContent = "0" + (index + 1);
          var label = document.createElement("span");
          label.className = "contact-detail-label";
          label.textContent = item.label;
          var value = document.createElement("span");
          value.className = "contact-detail-value";
          value.textContent = item.value;
          var arrow = document.createElement("span");
          arrow.className = "contact-detail-arrow";
          arrow.textContent = "↗";
          row.appendChild(number); row.appendChild(label); row.appendChild(value); row.appendChild(arrow);
          list.appendChild(row);
        });
        dom.contactView.appendChild(intro);
        dom.contactView.appendChild(list);
      }

      function setupPlateObserver() {
        if (plateObserver) { plateObserver.disconnect(); plateObserver = null; }
        if (!("IntersectionObserver" in window)) return;
        var items = dom.sequenceView.querySelectorAll(".all-photo-card");
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
        dom.modeButtons.forEach(function(btn) {
          var active = btn.dataset.view === viewName;
          btn.classList.toggle("is-active", active);
          btn.setAttribute("aria-pressed", String(active));
        });
        stopRotation();
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
        scheduleRotation();
      }

      function openLightbox(index) {
        if (!state.filtered.length) return;
        state.lastFocused = document.activeElement;
        state.lightboxOpen = true;
        state.lightboxIndex = Math.max(0, Math.min(Number(index) || 0, state.filtered.length - 1));
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
        scheduleRotation();
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
        img.draggable = false;

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
        dom.lbCaption.textContent = "PL. " + work._plate + " - " + (work.title || "Photograph") + (sub ? " · " + sub : "");

      }

      function openOwnerReport() {
        stopRotation();
        var panel = document.getElementById("owner-report");
        if (panel) {
          panel.hidden = false;
          document.body.classList.add("is-locked");
          var field = document.getElementById("owner-report-text");
          if (field) field.focus();
        }
      }

      function closeOwnerReport() {
        var panel = document.getElementById("owner-report");
        if (panel) panel.hidden = true;
        if (!state.lightboxOpen && !state.infoOpen) document.body.classList.remove("is-locked");
        scheduleRotation();
      }

      function bindEvents() {
        document.addEventListener("contextmenu", function(e) {
          if (e.target && e.target.closest && e.target.closest("img, .all-photo-card, .color-tile, .lb-media-wrap, .about-photo")) e.preventDefault();
        });
        document.addEventListener("dragstart", function(e) {
          if (e.target && e.target.closest && e.target.closest("img")) e.preventDefault();
        });
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

        var reportClose = document.getElementById("owner-report-close");
        var reportSend = document.getElementById("owner-report-send");
        if (reportClose) reportClose.addEventListener("click", closeOwnerReport);
        if (reportSend) reportSend.addEventListener("click", function () {
          var field = document.getElementById("owner-report-text");
          var note = field ? field.value.trim() : "";
          if (!note) return;
          var title = "Website report - " + new Date().toISOString().slice(0, 10);
          var url = "https://github.com/aiz1k1989-web/tanibergen.online/issues/new?title=" +
            encodeURIComponent(title) + "&body=" + encodeURIComponent(note);
          window.open(url, "_blank", "noopener");
          closeOwnerReport();
        });

        document.addEventListener("keydown", function (e) {
          if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
          ownerBuffer = (ownerBuffer + String(e.key || "").toLowerCase()).slice(-ownerPhrase.length);
          if (ownerBuffer === ownerPhrase) {
            ownerBuffer = "";
            openOwnerReport();
          }
        });

        document.addEventListener("visibilitychange", function () {
          if (document.hidden) stopRotation();
          else scheduleRotation();
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
          var reportPanel = document.getElementById("owner-report");
          if (reportPanel && !reportPanel.hidden && e.key === "Escape") { closeOwnerReport(); return; }
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
      renderActiveView();
      updateCounter(0);
      bindEvents();
    })();
  