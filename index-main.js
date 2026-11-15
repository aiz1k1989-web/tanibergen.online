
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

      works = shuffleCopy(works);

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

      function shuffleCopy(items) {
        var copy = items.slice();
        for (var i = copy.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var temp = copy[i]; copy[i] = copy[j]; copy[j] = temp;
        }
        return copy;
      }

      function createArchiveRecords() {
        var terms = [
          "chromatic residue", "blind exposure", "unverified memory",
          "light leak report", "negative space", "afterimage trace",
          "weather in the frame", "misfiled evidence", "quiet interference",
          "signal from nowhere", "nocturnal index", "false recollection"
        ];
        var shuffledTerms = shuffleCopy(terms);
        return shuffledTerms.slice(0, 6).map(function (term) {
          var pool = shuffleCopy(works);
          var amount = Math.min(pool.length, 13 + Math.floor(Math.random() * 18));
          return {
            id: String(1000 + Math.floor(Math.random() * 9000)),
            term: term,
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
          mobile.textContent = record.id + " / " + record.term;
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
        dom.sequenceView.innerHTML = "";
        if (!state.filtered.length) {
          var empty = document.createElement("p");
          empty.className = "empty-state";
          empty.textContent = "No photographs in this archive.";
          dom.sequenceView.appendChild(empty);
          return;
        }
        var grid = document.createElement("div");
        grid.className = "all-card-grid";
        state.filtered.forEach(function(work, index) {
          var card = document.createElement("button");
          card.type = "button";
          card.className = "all-photo-card card-shape-" + (index % 8);
          card.setAttribute("aria-label", "Open photograph " + work._plate);
          card.dataset.index = String(index);
          var frame = buildMediaFrame(work, index, index < 2, true);
          frame.classList.add("all-photo-frame");
          card.appendChild(frame);
          card.addEventListener("click", function() { openLightbox(state.filtered.indexOf(work)); });
          grid.appendChild(card);
        });
        dom.sequenceView.appendChild(grid);
        state.activeIndex = 0;
        setupPlateObserver();
        updateCounter(0);
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
        var workers = Array.from({ length: Math.min(3, total) }, async function () {
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
          img.loading = index < 6 ? "eager" : "lazy";
          img.decoding = "async";
          img.addEventListener("load", function() {
            if (img.naturalWidth && img.naturalHeight) frame.style.aspectRatio = img.naturalWidth + " / " + img.naturalHeight;
          }, { once: true });
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
          dom.sequenceView.hidden = false;
          renderSequenceView();
        } else if (state.view === "contact") {
          dom.sequenceView.hidden = true;
          dom.contactView.hidden = false;
          dom.colorView.hidden = true;
          renderContactView();
        } else {
          dom.sequenceView.hidden = true;
          dom.contactView.hidden = true;
          dom.colorView.hidden = false;
          renderColorView();
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

        preloadNeighbor(state.lightboxIndex + 1);
        preloadNeighbor(state.lightboxIndex - 1);
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
      renderSeriesFilters();
      renderActiveView();
      updateCounter(0);
      bindEvents();
    })();
  