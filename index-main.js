
    (function () {
      "use strict";

      var CHROMA_PALETTES = [
        { name: "oxide", colors: ["#241b1b","#642f2d","#b54c3d","#dc8a65","#ead2b6"], gradient: "linear-gradient(90deg,#241b1b 0%,#642f2d 24%,#b54c3d 49%,#dc8a65 74%,#ead2b6 100%)" },
        { name: "monochrome", colors: ["#080808","#303030","#777777","#c4c4c4","#f0eee9"], gradient: "linear-gradient(90deg,#080808 0%,#303030 25%,#777 50%,#c4c4c4 75%,#f0eee9 100%)" },
        { name: "afterimage", colors: ["#202b32","#536c70","#b1a48b","#c77c55","#652f31"], gradient: "linear-gradient(90deg,#202b32 0%,#536c70 25%,#b1a48b 50%,#c77c55 75%,#652f31 100%)" },
        { name: "electric", colors: ["#171b4a","#3c55a6","#6c9aab","#e3b64e","#db563d"], gradient: "linear-gradient(90deg,#171b4a 0%,#3c55a6 25%,#6c9aab 50%,#e3b64e 75%,#db563d 100%)" },
        { name: "soft focus", colors: ["#d9c9b7","#c89d89","#a5a58e","#718b88","#596b78"], gradient: "linear-gradient(90deg,#d9c9b7 0%,#c89d89 25%,#a5a58e 50%,#718b88 75%,#596b78 100%)" },
        { name: "night flowers", colors: ["#17151d","#4b334d","#9b5369","#d58b78","#e8c6a5"], gradient: "linear-gradient(90deg,#17151d 0%,#4b334d 25%,#9b5369 50%,#d58b78 75%,#e8c6a5 100%)" },
        { name: "acid green", colors: ["#171b16","#455b35","#9cae49","#d4c85b","#e5e0c2"], gradient: "linear-gradient(90deg,#171b16 0%,#455b35 25%,#9cae49 50%,#d4c85b 75%,#e5e0c2 100%)" },
        { name: "blue hour", colors: ["#101a2b","#263e62","#527a91","#a6a9a0","#e3c9a9"], gradient: "linear-gradient(90deg,#101a2b 0%,#263e62 25%,#527a91 50%,#a6a9a0 75%,#e3c9a9 100%)" }
      ];
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

      // Keep the photographic archive in its source order.

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
        blogLoaded: false,
        blogLoading: false,
        blogError: false,
        blogIssues: [],
        blogArticle: null,
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
        blogView: document.getElementById("blog-view"),
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

        setText("info-title", "tanibergen.online");
        setText("info-statement", config.statement || "");
        setText("info-note", "");
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

      function shuffleCopy(items) {
        var copy = items.slice();
        for (var i = copy.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var temp = copy[i]; copy[i] = copy[j]; copy[j] = temp;
        }
        return copy;
      }

      function createArchiveRecords() {
        return [{
          id: "All",
          term: "ALL PHOTOGRAPHS",
          items: works.slice()
        }];
      }

      async function buildPaletteRecords() {
        var results = new Array(works.length);
        var cursor = 0;
        var concurrency = window.matchMedia && window.matchMedia("(max-width: 900px)").matches ? 2 : 3;
        var workers = Array.from({ length: Math.min(concurrency, works.length) }, async function () {
          while (cursor < works.length) {
            var index = cursor++;
            var work = works[index];
            var color = await analyzeOne(work);
            results[index] = { work: work, color: color };
          }
        });
        await Promise.all(workers);
        var groups = clusterByColor(results.filter(Boolean));
        var minGroupSize = 2;
        state.records = [{
          id: "All",
          term: "ALL PHOTOGRAPHS",
          items: works.slice()
        }].concat(groups.filter(function (group) {
          return group.items.length >= minGroupSize;
        }).map(function (group) {
          return {
            id: "palette-" + group.label.toLowerCase().replace(/[^a-z]+/g, "-"),
            term: group.label.toUpperCase() + " / " + String(group.items.length).padStart(2, "0"),
            items: group.items.map(function (entry) { return entry.work; })
          };
        }));
        renderSeriesFilters();
        if (state.series !== "All") {
          var active = state.records.find(function (record) { return record.id === state.series; });
          if (active) state.filtered = active.items.slice();
          else selectSeries("All");
        }
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
          code.textContent = record.id;
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
          mobileCode.textContent = record.id;
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

        var originalSource = safeUrl(work.file);
        var useMobilePreview = compact && window.matchMedia && window.matchMedia("(max-width: 900px)").matches;
        var displaySource = useMobilePreview ? safeUrl(work.thumb || ("previews/" + work.file)) : originalSource;
        img.dataset.originalSrc = originalSource;

        if (isPriority) {
          img.setAttribute("fetchpriority", "high");
          img.src = displaySource;
        } else {
          img.dataset.src = displaySource;
          observeMediaImage(img);
        }

        img.addEventListener("load", function () {
          if (img.naturalWidth && img.naturalHeight) {
            frame.style.aspectRatio = img.naturalWidth + " / " + img.naturalHeight;
          }
          frame.classList.add("is-loaded");
        });

        img.addEventListener("error", function () {
          var fallbackSource = img.dataset.originalSrc;
          if (fallbackSource && img.getAttribute("src") !== fallbackSource) {
            img.removeAttribute("data-original-src");
            img.src = fallbackSource;
            return;
          }
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
        return;
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


      function randomArchiveNumber() {
        return String(Math.floor(1000 + Math.random() * 9000));
      }

      function renderSequenceView() {
        stopRotation();
        if (plateObserver) { plateObserver.disconnect(); plateObserver = null; }
        if (galleryLoadObserver) { galleryLoadObserver.disconnect(); galleryLoadObserver = null; }
        dom.sequenceView.innerHTML = "";
        if (!state.filtered.length) {
          var empty = document.createElement("p");
          empty.className = "empty-state";
          empty.textContent = "No photographs in this archive.";
          dom.sequenceView.appendChild(empty);
          return;
        }

        var diary = document.createElement("section");
        diary.className = "diary-intro";
        diary.setAttribute("aria-label", "Unsorted archive records");
        var diaryTitle = document.createElement("h1");
        diaryTitle.className = "diary-title";
        diaryTitle.textContent = "# " + randomArchiveNumber();
        var diaryMeta = document.createElement("div");
        diaryMeta.className = "diary-meta";
        diaryMeta.textContent = randomArchiveNumber() + " / " + randomArchiveNumber() + " / " + randomArchiveNumber();
        diary.appendChild(diaryTitle);
        diary.appendChild(diaryMeta);
        dom.sequenceView.appendChild(diary);

        var grid = document.createElement("div");
        grid.className = "all-card-grid";
        var grid = document.createElement("div");
        grid.className = "all-card-grid";
        var sentinel = document.createElement("div");
        sentinel.className = "gallery-sentinel";
        sentinel.setAttribute("aria-hidden", "true");
        grid.appendChild(sentinel);
        dom.sequenceView.appendChild(grid);

        var cursor = 0;
        var batchSize = window.matchMedia && window.matchMedia("(max-width: 900px)").matches ? 8 : 16;
        var appending = false;

        function appendBatch() {
          if (appending || cursor >= state.filtered.length) return;
          appending = true;
          var fragment = document.createDocumentFragment();
          var endIndex = Math.min(cursor + batchSize, state.filtered.length);
          for (var index = cursor; index < endIndex; index++) {
            var work = state.filtered[index];
            var card = document.createElement("button");
            card.type = "button";
            card.className = "all-photo-card";
            card.setAttribute("aria-label", "Open photograph " + work._plate);
            card.dataset.index = String(index);
            var frame = buildMediaFrame(work, index, index < 2, true);
            frame.classList.add("all-photo-frame");
            card.appendChild(frame);
            card.addEventListener("click", function(selectedWork) {
              return function() { openLightbox(state.filtered.indexOf(selectedWork)); };
            }(work));
            fragment.appendChild(card);
          }
          grid.insertBefore(fragment, sentinel);
          cursor = endIndex;
          appending = false;
          setupPlateObserver();

          if (cursor >= state.filtered.length) {
            sentinel.remove();
            if (galleryLoadObserver) { galleryLoadObserver.disconnect(); galleryLoadObserver = null; }
          } else if (galleryLoadObserver && sentinel.isConnected) {
            galleryLoadObserver.unobserve(sentinel);
            galleryLoadObserver.observe(sentinel);
          }
        }

        state.activeIndex = 0;
        updateCounter(0);
        appendBatch();

        if ("IntersectionObserver" in window && cursor < state.filtered.length) {
          galleryLoadObserver = new IntersectionObserver(function(entries) {
            if (entries.some(function(entry) { return entry.isIntersecting; })) appendBatch();
          }, { rootMargin: "720px 0px", threshold: 0 });
          galleryLoadObserver.observe(sentinel);
        } else {
          while (cursor < state.filtered.length) appendBatch();
        }
      }

      function extractDominantColor(image) {
        var canvas = document.createElement("canvas");
        canvas.width = 64; canvas.height = 64;
        var ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) throw new Error("Canvas unavailable");
        ctx.drawImage(image, 0, 0, 64, 64);
        var pixels = ctx.getImageData(0, 0, 64, 64).data;
        var labels = ["Red", "Orange", "Yellow", "Green", "Cyan", "Blue", "Violet", "Pink"];
        var bins = labels.map(function(label) { return { label: label, weight: 0, pixels: 0, r: 0, g: 0, b: 0 }; });
        var total = 0, chromaticPixels = 0, saturationTotal = 0;
        var gray = { r: 0, g: 0, b: 0, n: 0 };
        var redPixels = 0, redWeight = 0, allColorWeight = 0;
        for (var i = 0; i < pixels.length; i += 4) {
          if (pixels[i + 3] < 180) continue;
          var r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
          var max = Math.max(r, g, b), min = Math.min(r, g, b), delta = max - min;
          var saturation = max === 0 ? 0 : delta / max;
          var luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
          total++; saturationTotal += saturation;
          gray.r += r; gray.g += g; gray.b += b; gray.n++;
          if (saturation < 0.105 || max < 24 || luminance < 0.055) continue;
          chromaticPixels++;
          var hue = 0;
          if (delta > 0) {
            if (max === r) hue = 60 * (((g - b) / delta) % 6);
            else if (max === g) hue = 60 * ((b - r) / delta + 2);
            else hue = 60 * ((r - g) / delta + 4);
          }
          if (hue < 0) hue += 360;
          var index = hue < 16 || hue >= 344 ? 0 : hue < 43 ? 1 : hue < 68 ? 2 : hue < 165 ? 3 : hue < 195 ? 4 : hue < 255 ? 5 : hue < 292 ? 6 : 7;
          var visibility = 0.35 + 0.65 * Math.min(1, luminance * 1.35);
          var weight = Math.pow(saturation, 1.25) * visibility;
          var bin = bins[index]; bin.weight += weight; bin.pixels++;
          bin.r += r * weight; bin.g += g * weight; bin.b += b * weight;
          allColorWeight += weight;
          if (index === 0) { redPixels++; redWeight += weight; }
        }
        var pixelCount = Math.max(1, total);
        var chromaRatio = chromaticPixels / pixelCount;
        var meanSaturation = saturationTotal / pixelCount;
        var averageGray = { r: gray.r / Math.max(1, gray.n), g: gray.g / Math.max(1, gray.n), b: gray.b / Math.max(1, gray.n) };
        if (chromaRatio < 0.24 && meanSaturation < 0.19) return { category: "Black & white", color: averageGray };
        var dominant = bins.reduce(function(best, bin) { return bin.weight > best.weight ? bin : best; }, bins[0]);
        var dominantShare = dominant.weight / Math.max(0.001, allColorWeight);
        var redPixelShare = redPixels / Math.max(1, chromaticPixels);
        var redWeightShare = redWeight / Math.max(0.001, allColorWeight);
        var category = dominantShare < 0.23 ? "Mixed colour" : dominant.label;
        if (redPixelShare > 0.19 && redWeightShare > 0.20) category = "Red";
        var n = Math.max(0.001, dominant.weight);
        return { category: category, color: { r: dominant.r / n, g: dominant.g / n, b: dominant.b / n } };
      }
      function getCachedColor(work) {
        try {
          if (!colorCacheMemory) colorCacheMemory = JSON.parse(localStorage.getItem("tanibergen-color-v3") || "{}");
          return colorCacheMemory[work.file] || null;
        } catch (e) { colorCacheMemory = {}; return null; }
      }

      function saveColorCache(cache) {
        try {
          if (!colorCacheMemory) colorCacheMemory = JSON.parse(localStorage.getItem("tanibergen-color-v3") || "{}");
          Object.keys(cache).forEach(function (key) { colorCacheMemory[key] = cache[key]; });
          localStorage.setItem("tanibergen-color-v3", JSON.stringify(colorCacheMemory));
        } catch (e) {}
      }

      function analyzeOne(work) {
        return new Promise(function (resolve) {
          var cached = getCachedColor(work);
          if (cached) { resolve(cached); return; }
          var img = new Image();
          img.decoding = "async";
          img.fetchPriority = "low";
          img.onload = function () {
            try { resolve(extractDominantColor(img)); }
            catch (e) { resolve({ category: "Mixed colour", color: { r: 128, g: 128, b: 128 } }); }
          };
          img.onerror = function () { resolve({ category: "Mixed colour", color: { r: 128, g: 128, b: 128 } }); };
          img.src = safeUrl(work.file);
        });
      }

      async function analyzeColorArchive(generation) {
        state.colorBusy = true;
        var cache = {};
        var results = [];
        var total = state.filtered.length;
        var completed = 0;
        var progress = dom.colorView.querySelector(".color-progress-label");
        var fill = dom.colorView.querySelector(".color-progress-fill");
        var cursor = 0;
        var concurrency = window.matchMedia && window.matchMedia("(max-width: 900px)").matches ? 2 : 3;
        var workers = Array.from({ length: Math.min(concurrency, total) }, async function () {
          while (cursor < total) {
            var index = cursor++;
            var work = state.filtered[index];
            var color = await analyzeOne(work);
            if (generation !== state.colorGeneration) return;
            results[index] = { work: work, color: color };
            cache[work.file] = color;
            completed++;
            if (progress) progress.textContent = "READING COLOUR / " + completed + " OF " + total;
            if (fill) fill.style.width = (completed / Math.max(1, total) * 100) + "%";
          }
        });
        await Promise.all(workers);
        if (generation !== state.colorGeneration) return;
        saveColorCache(cache);
        state.colorBusy = false;
        state.colorGroups = clusterByColor(results.filter(Boolean));
        renderColorCollage();
      }

      function clusterByColor(items) {
        var order = ["Black & white", "Red", "Orange", "Yellow", "Green", "Cyan", "Blue", "Violet", "Pink", "Mixed colour"];
        var groups = Object.create(null);
        items.forEach(function (item) {
          var category = item.color.category || "Mixed colour";
          if (!groups[category]) groups[category] = { label: category, color: { r: 0, g: 0, b: 0 }, items: [], n: 0 };
          var group = groups[category];
          group.items.push(item);
          group.color.r += item.color.color.r;
          group.color.g += item.color.color.g;
          group.color.b += item.color.color.b;
          group.n++;
        });
        return order.filter(function (label) { return groups[label]; }).map(function (label) {
          var group = groups[label], n = Math.max(1, group.n);
          group.color.r /= n; group.color.g /= n; group.color.b /= n;
          return group;
        });
      }

      function renderColorView() {
        stopRotation();
        if (plateObserver) { plateObserver.disconnect(); plateObserver = null; }
        if (galleryLoadObserver) { galleryLoadObserver.disconnect(); galleryLoadObserver = null; }
        state.colorGeneration++;
        state.colorBusy = true;
        dom.colorView.innerHTML = "";
        var head = document.createElement("div");
        head.className = "color-heading";
        var copy = document.createElement("div");
        var eyebrow = document.createElement("div");
        eyebrow.className = "color-eyebrow";
        eyebrow.textContent = "ARCHIVE / CHROMATIC INDEX";
        var title = document.createElement("h2");
        title.className = "color-title";
        title.textContent = "Colour";
        var description = document.createElement("p");
        description.className = "color-description";
        description.textContent = "A continuous passage through colour.";
        copy.appendChild(eyebrow); copy.appendChild(title); copy.appendChild(description);
        var recompose = document.createElement("button");
        recompose.type = "button";
        recompose.className = "recompose-btn";
        recompose.textContent = "SHUFFLE ↗";
        recompose.addEventListener("click", function () {
          state.colorComposition++;
          renderColorCollage();
        });
        head.appendChild(copy); head.appendChild(recompose);
        var progress = document.createElement("div");
        progress.className = "color-progress";
        var fill = document.createElement("span");
        fill.className = "color-progress-fill";
        progress.appendChild(fill);
        var label = document.createElement("div");
        label.className = "color-progress-label";
        label.textContent = "READING COLOUR / 0 OF " + state.filtered.length;
        var content = document.createElement("div");
        content.className = "color-collage";
        dom.colorView.appendChild(head);
        dom.colorView.appendChild(progress);
        dom.colorView.appendChild(label);
        dom.colorView.appendChild(content);
        analyzeColorArchive(state.colorGeneration);
      }

      function renderColorCollage() {
        var container = dom.colorView.querySelector(".color-collage");
        if (!container) return;
        container.innerHTML = "";
        var entries = [];
        state.colorGroups.forEach(function(group) {
          group.items.forEach(function(entry) {
            var rgb = entry.color.color;
            var max = Math.max(rgb.r, rgb.g, rgb.b), min = Math.min(rgb.r, rgb.g, rgb.b);
            var delta = max - min, hue = 0;
            if (delta > 0) {
              if (max === rgb.r) hue = 60 * (((rgb.g - rgb.b) / delta) % 6);
              else if (max === rgb.g) hue = 60 * ((rgb.b - rgb.r) / delta + 2);
              else hue = 60 * ((rgb.r - rgb.g) / delta + 4);
            }
            if (hue < 0) hue += 360;
            var saturation = max === 0 ? 0 : delta / max;
            entries.push({ work: entry.work, hue: saturation < 0.12 ? 361 : hue });
          });
        });
        if (!entries.length) {
          container.textContent = "No photographs to arrange.";
          return;
        }
        entries.sort(function(a,b) { return a.hue - b.hue; });
        if (state.colorComposition % 2) entries.reverse();
        var gradient = document.createElement("div");
        gradient.className = "chromatic-gradient";
        gradient.setAttribute("aria-hidden", "true");
        var grid = document.createElement("div");
        grid.className = "color-mosaic gradient-mosaic";
        entries.forEach(function(entry, index) {
          var work = entry.work;
          var tile = document.createElement("button");
          tile.type = "button";
          tile.className = "color-tile tile-shape-" + (index % 8);
          tile.setAttribute("aria-label", "Open photograph " + work._plate);
          var frame = document.createElement("div");
          frame.className = "color-tile-frame";
          frame.style.aspectRatio = getAspectRatio(work);
          var img = document.createElement("img");
          img.src = safeUrl(work.file);
          img.alt = work.title || "Photograph " + work._plate;
          img.draggable = false;
          img.loading = index < 4 ? "eager" : "lazy";
          img.decoding = "async";
          img.addEventListener("load", function() {
            if (img.naturalWidth && img.naturalHeight) frame.style.aspectRatio = img.naturalWidth + " / " + img.naturalHeight;
          }, { once: true });
          img.addEventListener("error", function() { img.style.display = "none"; frame.classList.add("is-missing"); }, { once: true });
          frame.appendChild(img);
          tile.appendChild(frame);
          tile.addEventListener("click", function() {
            var indexInFilter = state.filtered.indexOf(work);
            openLightbox(Math.max(0, indexInFilter));
          });
          grid.appendChild(tile);
        });
        container.appendChild(gradient);
        container.appendChild(grid);
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
        if (viewName !== "color") { state.colorGeneration++; state.colorBusy = false; }
        state.view = viewName;
        document.body.classList.toggle("is-color-mode", viewName === "color");
        document.documentElement.classList.toggle("is-color-mode", viewName === "color");
        var themeMeta = document.querySelector('meta[name="theme-color"]');
        if (themeMeta) themeMeta.setAttribute("content", "#ffffff");
        dom.modeButtons.forEach(function (btn) {
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
          dom.colorView.hidden = true;
          dom.blogView.hidden = true;
          dom.sequenceView.hidden = false;
          renderSequenceView();
        } else if (state.view === "contact") {
          dom.sequenceView.hidden = true;
          dom.contactView.hidden = false;
          dom.colorView.hidden = true;
          dom.blogView.hidden = true;
          renderContactView();
        } else if (state.view === "blog") {
          dom.sequenceView.hidden = true;
          dom.contactView.hidden = true;
          dom.colorView.hidden = true;
          dom.blogView.hidden = false;
          renderBlogView();
        } else {
          dom.sequenceView.hidden = true;
          dom.contactView.hidden = true;
          dom.blogView.hidden = true;
          dom.colorView.hidden = false;
          renderColorView();
        }
      }


      var BLOG_API = "https://api.github.com/repos/aiz1k1989-web/tanibergen.online/issues?state=open&per_page=100&sort=created&direction=desc";
      var BLOG_NEW_POST = "https://github.com/aiz1k1989-web/tanibergen.online/issues/new?template=blog-post.yml";
      function blogImage(body) {
        var match = String(body || "").match(/!\[[^\]]*\]\((https?:\/\/[^)\s]+)(?:\s+[^)]*)?\)/i);
        return match ? match[1] : "";
      }
      function blogExcerpt(body) {
        var text = String(body || "").replace(/!\[[^\]]*\]\([^)]*\)/g, " ").replace(/^#+\s*/gm, "").replace(/[*_>#]/g, "").replace(/\s+/g, " ").trim();
        return text.length > 210 ? text.slice(0, 207).trim() + "..." : text;
      }
      function appendBlogMarkdown(container, source) {
        var lines = String(source || "").split(/\r?\n/), list = null;
        function closeList() { if (list) { container.appendChild(list); list = null; } }
        lines.forEach(function(line) {
          var value = line.trim();
          if (!value) { closeList(); return; }
          var imageMatch = value.match(/^!\[([^\]]*)\]\((https?:\/\/[^)\s]+)(?:\s+[^)]*)?\)$/i);
          if (imageMatch) {
            closeList();
            var image = document.createElement("img");
            image.src = imageMatch[2]; image.alt = imageMatch[1] || "Journal photograph";
            image.loading = "lazy"; image.decoding = "async"; container.appendChild(image); return;
          }
          var heading = value.match(/^(#{1,3})\s+(.+)$/);
          if (heading) {
            closeList();
            var h = document.createElement("h" + Math.min(4, heading[1].length + 1));
            h.textContent = heading[2]; container.appendChild(h); return;
          }
          if (/^[-*]\s+/.test(value)) {
            if (!list) list = document.createElement("ul");
            var li = document.createElement("li"); li.textContent = value.replace(/^[-*]\s+/, "");
            list.appendChild(li); return;
          }
          closeList();
          var p = document.createElement("p");
          p.textContent = value.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1");
          container.appendChild(p);
        });
        closeList();
      }
      function renderBlogView() {
        stopRotation(); dom.blogView.innerHTML = "";
        var heading = document.createElement("div"); heading.className = "blog-heading";
        var eyebrow = document.createElement("div"); eyebrow.className = "blog-eyebrow";
        eyebrow.textContent = "NOTES / EXPERIMENTS / OCCASIONAL UPDATES";
        var title = document.createElement("h2"); title.className = "blog-title";
        title.textContent = state.blogArticle ? "Journal entry" : "Journal";
        heading.appendChild(eyebrow); heading.appendChild(title);
        var actions = document.createElement("div"); actions.className = "blog-actions";
        if (state.blogArticle) {
          var back = document.createElement("button"); back.type = "button"; back.className = "blog-action";
          back.textContent = "← All entries";
          back.addEventListener("click", function(){ state.blogArticle = null; renderBlogView(); });
          actions.appendChild(back);
          var edit = document.createElement("a"); edit.className = "blog-action"; edit.href = state.blogIssues.find(function(item){ return item.number === state.blogArticle; }).html_url;
          edit.target = "_blank"; edit.rel = "noopener noreferrer"; edit.textContent = "Edit on GitHub ↗"; actions.appendChild(edit);
        } else {
          var write = document.createElement("a"); write.className = "blog-action"; write.href = BLOG_NEW_POST;
          write.target = "_blank"; write.rel = "noopener noreferrer"; write.textContent = "Write a post ↗";
          actions.appendChild(write);
          var reload = document.createElement("button"); reload.type = "button"; reload.className = "blog-action";
          reload.textContent = "Refresh";
          reload.addEventListener("click", function(){ state.blogLoaded = false; loadBlogPosts(); });
          actions.appendChild(reload);
        }
        heading.appendChild(actions); dom.blogView.appendChild(heading);
        if (state.blogArticle) {
          var article = state.blogIssues.find(function(item){ return item.number === state.blogArticle; });
          if (!article) { state.blogArticle = null; renderBlogView(); return; }
          var detail = document.createElement("article"); detail.className = "blog-article";
          var date = document.createElement("time"); date.className = "blog-date"; date.dateTime = article.created_at;
          date.textContent = new Date(article.created_at).toLocaleDateString("en-GB",{day:"2-digit",month:"long",year:"numeric"});
          var articleTitle = document.createElement("h3"); articleTitle.textContent = article.title.replace(/^\[BLOG\]\s*/i, "");
          var body = document.createElement("div"); body.className = "blog-body";
          appendBlogMarkdown(body, article.body || "");
          detail.appendChild(date); detail.appendChild(articleTitle); detail.appendChild(body); dom.blogView.appendChild(detail); return;
        }
        if (!state.blogLoaded) {
          var loading = document.createElement("p"); loading.className = "blog-status";
          loading.textContent = state.blogLoading ? "Loading entries..." : "The journal is waiting for its first entry.";
          dom.blogView.appendChild(loading); loadBlogPosts(); return;
        }
        if (state.blogError) {
          var errorNote = document.createElement("p"); errorNote.className = "blog-status";
          errorNote.textContent = "The journal could not be loaded. You can still open the posts on GitHub.";
          var errorLink = document.createElement("a"); errorLink.href = "https://github.com/aiz1k1989-web/tanibergen.online/issues";
          errorLink.textContent = "Open GitHub ↗"; errorLink.target = "_blank"; errorLink.rel = "noopener noreferrer";
          errorNote.appendChild(document.createTextNode(" ")); errorNote.appendChild(errorLink); dom.blogView.appendChild(errorNote); return;
        }
        if (!state.blogIssues.length) {
          var empty = document.createElement("p"); empty.className = "blog-status"; empty.textContent = "No entries yet.";
          dom.blogView.appendChild(empty); return;
        }
        var grid = document.createElement("div"); grid.className = "blog-grid";
        state.blogIssues.forEach(function(post) {
          var card = document.createElement("button"); card.type = "button"; card.className = "blog-card";
          var cover = blogImage(post.body);
          if (cover) { var image = document.createElement("img"); image.src = cover; image.alt = ""; image.loading = "lazy"; image.decoding = "async"; card.appendChild(image); }
          var meta = document.createElement("time"); meta.className = "blog-date"; meta.dateTime = post.created_at;
          meta.textContent = new Date(post.created_at).toLocaleDateString("en-GB",{day:"2-digit",month:"long",year:"numeric"});
          var cardTitle = document.createElement("h3"); cardTitle.textContent = post.title.replace(/^\[BLOG\]\s*/i, "");
          var excerpt = document.createElement("p"); excerpt.textContent = blogExcerpt(post.body || "");
          card.appendChild(meta); card.appendChild(cardTitle); card.appendChild(excerpt);
          card.addEventListener("click", function(){ state.blogArticle = post.number; renderBlogView(); window.scrollTo({top:0,behavior:"auto"}); });
          grid.appendChild(card);
        });
        dom.blogView.appendChild(grid);
      }
      function loadBlogPosts() {
        if (state.blogLoading) return;
        state.blogLoading = true;
        fetch(BLOG_API, { cache: "no-store", headers: { "Accept": "application/vnd.github+json" } })
          .then(function(response){ if (!response.ok) throw new Error("GitHub API " + response.status); return response.json(); })
          .then(function(items){
            state.blogIssues = items.filter(function(item){ return !item.pull_request && /^\[BLOG\]/i.test(item.title || ""); });
            state.blogLoaded = true; state.blogError = false;
          })
          .catch(function(){
            state.blogLoaded = true; state.blogError = true; state.blogIssues = [];
            var note = document.createElement("p"); note.className = "blog-status";
            note.textContent = "Entries could not be loaded right now. Open the journal on GitHub to check the latest posts.";
            var link = document.createElement("a"); link.href = "https://github.com/aiz1k1989-web/tanibergen.online/issues";
            link.textContent = "Open GitHub issues ↗"; link.target = "_blank"; link.rel = "noopener noreferrer";
            note.appendChild(document.createTextNode(" ")); note.appendChild(link); dom.blogView.appendChild(note);
          })
          .finally(function(){ state.blogLoading = false; if (state.view === "blog" && !state.blogArticle) renderBlogView(); });
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
            document.body.classList.remove("is-color-mode");
            document.documentElement.classList.remove("is-color-mode");
            var themeMeta = document.querySelector('meta[name="theme-color"]');
            if (themeMeta) themeMeta.setAttribute("content", "#ffffff");
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
      renderSeriesFilters();
      renderActiveView();
      updateCounter(0);
      bindEvents();
      if (works.length) {
        var startPaletteIndexing = function () { buildPaletteRecords().catch(function () {}); };
        if ("requestIdleCallback" in window) window.requestIdleCallback(startPaletteIndexing, { timeout: 3500 });
        else window.setTimeout(startPaletteIndexing, 1800);
      }
    })();
  