
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
        state.colorGeneration++;
        state.colorGroups = [];
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
        dom.sequenceView.innerHTML = "";

        if (!state.filtered.length) {
          var empty = document.createElement("p");
          empty.className = "empty-state";
          empty.textContent = "No photographs in this series yet.";
          dom.sequenceView.appendChild(empty);
          return;
        }

        var index = Math.min(state.activeIndex, state.filtered.length - 1);
        var work = state.filtered[index];
        var figure = document.createElement("article");
        figure.className = "featured-plate";

        var trigger = document.createElement("button");
        trigger.type = "button";
        trigger.className = "featured-trigger";
        trigger.setAttribute("aria-label", "Open photograph " + work._plate);
        trigger.addEventListener("click", function () { openLightbox(state.activeIndex); });

        var shell = document.createElement("div");
        shell.className = "featured-shell";
        shell.style.aspectRatio = getAspectRatio(work);
        var media = document.createElement("div");
        media.className = "featured-media";
        var img = new Image();
        img.className = "featured-image is-current";
        img.alt = work.title || "Photograph " + work._plate;
        img.decoding = "async";
        img.fetchPriority = "high";
        img.src = safeUrl(work.file);
        img.addEventListener("load", function () {
          if (img.naturalWidth && img.naturalHeight) shell.style.aspectRatio = img.naturalWidth + " / " + img.naturalHeight;
          shell.classList.add("is-ready");
          scheduleRotation();
        }, { once: true });
        media.appendChild(img);
        shell.appendChild(media);
        trigger.appendChild(shell);

        var meta = document.createElement("div");
        meta.className = "featured-meta";
        var caption = document.createElement("span");
        caption.className = "featured-caption";
        caption.textContent = "PL. " + work._plate + " / " + (work.series || "Archive");
        var count = document.createElement("span");
        count.className = "featured-total";
        count.textContent = padNumber(index + 1) + " / " + padNumber(state.filtered.length);
        meta.appendChild(caption);
        meta.appendChild(count);

        var progress = document.createElement("div");
        progress.className = "featured-progress";
        progress.setAttribute("aria-hidden", "true");
        var fill = document.createElement("span");
        fill.className = "featured-progress-fill";
        progress.appendChild(fill);

        figure.appendChild(trigger);
        figure.appendChild(meta);
        figure.appendChild(progress);
        dom.sequenceView.appendChild(figure);

        state.activeIndex = index;
        updateCounter(index);
        preloadFeatured(randomNextIndex(index));
        preloadFeatured(randomNextIndex(randomNextIndex(index)));
      }


      function colorDistance(a, b) {
        var rMean = (a.r + b.r) / 2;
        var dr = a.r - b.r, dg = a.g - b.g, db = a.b - b.b;
        return Math.sqrt((2 + rMean / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rMean) / 256) * db * db);
      }

      function extractDominantColor(image) {
        var canvas = document.createElement("canvas");
        canvas.width = 28;
        canvas.height = 28;
        var ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) throw new Error("Canvas unavailable");
        ctx.drawImage(image, 0, 0, 28, 28);
        var pixels = ctx.getImageData(0, 0, 28, 28).data;
        var bins = Object.create(null);
        for (var i = 0; i < pixels.length; i += 16) {
          var alpha = pixels[i + 3];
          if (alpha < 160) continue;
          var r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
          var key = (r >> 5) + "-" + (g >> 5) + "-" + (b >> 5);
          if (!bins[key]) bins[key] = { count: 0, r: 0, g: 0, b: 0 };
          bins[key].count++;
          bins[key].r += r; bins[key].g += g; bins[key].b += b;
        }
        var best = Object.keys(bins).reduce(function (a, key) {
          return !a || bins[key].count > bins[a].count ? key : a;
        }, null);
        if (!best) return { r: 128, g: 128, b: 128 };
        var bucket = bins[best], n = bucket.count;
        return { r: Math.round(bucket.r / n), g: Math.round(bucket.g / n), b: Math.round(bucket.b / n) };
      }

      function colorLabel(color) {
        var max = Math.max(color.r, color.g, color.b), min = Math.min(color.r, color.g, color.b);
        var delta = max - min, hue = 0;
        if (delta) {
          if (max === color.r) hue = 60 * (((color.g - color.b) / delta) % 6);
          else if (max === color.g) hue = 60 * ((color.b - color.r) / delta + 2);
          else hue = 60 * ((color.r - color.g) / delta + 4);
        }
        if (delta < 24) return max < 75 ? "Deep neutrals" : max > 190 ? "Soft neutrals" : "Neutral tones";
        if (hue < 18 || hue >= 345) return "Reds & rust";
        if (hue < 45) return "Warm earth";
        if (hue < 70) return "Yellow tones";
        if (hue < 165) return "Greens";
        if (hue < 205) return "Teal tones";
        if (hue < 255) return "Blues";
        if (hue < 290) return "Violet tones";
        return "Pink tones";
      }

      function getCachedColor(work) {
        try {
          if (!colorCacheMemory) colorCacheMemory = JSON.parse(localStorage.getItem("tanibergen-color-v1") || "{}");
          return colorCacheMemory[work.file] || null;
        } catch (e) { colorCacheMemory = {}; return null; }
      }

      function saveColorCache(cache) {
        try {
          if (!colorCacheMemory) colorCacheMemory = JSON.parse(localStorage.getItem("tanibergen-color-v1") || "{}");
          Object.keys(cache).forEach(function (key) { colorCacheMemory[key] = cache[key]; });
          localStorage.setItem("tanibergen-color-v1", JSON.stringify(colorCacheMemory));
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
            catch (e) { resolve({ r: 128, g: 128, b: 128 }); }
          };
          img.onerror = function () { resolve({ r: 128, g: 128, b: 128 }); };
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
        if (!items.length) return [];
        var k = Math.min(6, Math.max(1, Math.round(Math.sqrt(items.length / 2))));
        var centers = [items[0].color];
        while (centers.length < k) {
          var candidate = items.reduce(function (best, item) {
            var nearest = Math.min.apply(null, centers.map(function (center) { return colorDistance(item.color, center); }));
            return !best || nearest > best.distance ? { item: item, distance: nearest } : best;
          }, null);
          centers.push(candidate.item.color);
        }
        for (var round = 0; round < 7; round++) {
          var buckets = centers.map(function () { return []; });
          items.forEach(function (item) {
            var nearest = 0, distance = Infinity;
            centers.forEach(function (center, index) {
              var d = colorDistance(item.color, center);
              if (d < distance) { distance = d; nearest = index; }
            });
            buckets[nearest].push(item);
          });
          centers = buckets.map(function (bucket, index) {
            if (!bucket.length) return centers[index];
            var sum = bucket.reduce(function (s, item) {
              s.r += item.color.r; s.g += item.color.g; s.b += item.color.b; return s;
            }, { r: 0, g: 0, b: 0 });
            return { r: sum.r / bucket.length, g: sum.g / bucket.length, b: sum.b / bucket.length };
          });
        }
        var groups = centers.map(function (center, index) {
          return {
            color: center,
            label: colorLabel(center),
            items: items.filter(function (item) {
              var nearest = centers.reduce(function (best, c, i) {
                var d = colorDistance(item.color, c);
                return d < best.distance ? { index: i, distance: d } : best;
              }, { index: 0, distance: Infinity });
              return nearest.index === index;
            })
          };
        }).filter(function (group) { return group.items.length; });
        return groups.sort(function (a, b) {
          return b.items.length - a.items.length;
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
        title.textContent = "Colour studies";
        var description = document.createElement("p");
        description.className = "color-description";
        description.textContent = "Photographs arranged by their dominant tones.";
        copy.appendChild(eyebrow); copy.appendChild(title); copy.appendChild(description);
        var recompose = document.createElement("button");
        recompose.type = "button";
        recompose.className = "recompose-btn";
        recompose.textContent = "RECOMPOSE ↗";
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
        var groups = state.colorGroups.slice();
        if (!groups.length) {
          container.textContent = "No photographs to arrange.";
          return;
        }
        var offset = state.colorComposition;
        groups.forEach(function (group, groupIndex) {
          var items = group.items.slice();
          if (items.length > 1) {
            var shift = (offset * (groupIndex + 2)) % items.length;
            items = items.slice(shift).concat(items.slice(0, shift));
            if ((offset + groupIndex) % 2) items.reverse();
          }
          var section = document.createElement("section");
          section.className = "color-cluster";
          var heading = document.createElement("div");
          heading.className = "color-cluster-heading";
          var left = document.createElement("div");
          left.className = "color-cluster-name";
          var swatch = document.createElement("span");
          swatch.className = "color-swatch";
          swatch.style.backgroundColor = "rgb(" + Math.round(group.color.r) + "," + Math.round(group.color.g) + "," + Math.round(group.color.b) + ")";
          var name = document.createElement("h3");
          name.textContent = group.label;
          left.appendChild(swatch); left.appendChild(name);
          var count = document.createElement("span");
          count.className = "color-cluster-count";
          count.textContent = String(items.length).padStart(2, "0") + " PHOTOGRAPHS";
          heading.appendChild(left); heading.appendChild(count);
          var grid = document.createElement("div");
          grid.className = "color-mosaic";
          items.forEach(function (entry, index) {
            var work = entry.work;
            var tile = document.createElement("button");
            tile.type = "button";
            tile.className = "color-tile tile-shape-" + ((index + offset + groupIndex) % 5);
            tile.setAttribute("aria-label", "Open photograph " + work._plate);
            var frame = document.createElement("div");
            frame.className = "color-tile-frame";
            frame.style.aspectRatio = getAspectRatio(work);
            var img = document.createElement("img");
            img.src = safeUrl(work.file);
            img.alt = work.title || "Photograph " + work._plate;
            img.loading = "lazy";
            img.decoding = "async";
            img.addEventListener("load", function () {
              if (img.naturalWidth && img.naturalHeight) frame.style.aspectRatio = img.naturalWidth + " / " + img.naturalHeight;
            }, { once: true });
            frame.appendChild(img);
            tile.appendChild(frame);
            tile.addEventListener("click", function () {
              var indexInFilter = state.filtered.indexOf(work);
              openLightbox(Math.max(0, indexInFilter));
            });
            grid.appendChild(tile);
          });
          section.appendChild(heading); section.appendChild(grid);
          container.appendChild(section);
        });
      }

      function renderContactView() {
        stopRotation();
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
  