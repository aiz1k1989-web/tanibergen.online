(() => {
  "use strict";

  const source = Array.isArray(window.TANIBERGEN_WORKS) ? window.TANIBERGEN_WORKS : [];
  const featuredFile = "4/1.webp";
  const featured = source.find(item => item.file === featuredFile);
  const orderedWorks = featured ? [featured, ...source.filter(item => item.file !== featuredFile)] : source.slice();

  const gallery = document.getElementById("work");
  const featuredTrigger = document.getElementById("featuredTrigger");
  const viewer = document.getElementById("viewer");
  const viewerImage = document.getElementById("viewerImage");
  const viewerCount = document.getElementById("viewerCount");
  const total = orderedWorks.length;
  let currentIndex = 0;
  let adjacentPreload = null;

  const format = value => String(value).padStart(2, "0");
  const totalLabel = format(total);

  document.getElementById("totalTop").textContent = totalLabel;
  document.getElementById("totalBottom").textContent = totalLabel + " PHOTOGRAPHS";

  function preloadNext(index) {
    if (!total) return;
    const next = orderedWorks[(index + 1) % total];
    if (!next) return;
    if (adjacentPreload) adjacentPreload.onload = adjacentPreload.onerror = null;
    adjacentPreload = new Image();
    adjacentPreload.decoding = "async";
    adjacentPreload.fetchPriority = "low";
    adjacentPreload.src = next.file;
  }

  function openViewer(index) {
    if (!total) return;
    currentIndex = (index + total) % total;
    const work = orderedWorks[currentIndex];
    viewerImage.src = work.file;
    viewerImage.alt = "";
    viewerCount.textContent = format(currentIndex + 1) + " / " + totalLabel;
    viewer.classList.add("open");
    viewer.setAttribute("aria-hidden", "false");
    document.body.classList.add("viewer-open");
    preloadNext(currentIndex);
  }

  function closeViewer() {
    viewer.classList.remove("open");
    viewer.setAttribute("aria-hidden", "true");
    viewerImage.removeAttribute("src");
    document.body.classList.remove("viewer-open");
  }

  if (featured) featuredTrigger.addEventListener("click", () => openViewer(0));

  orderedWorks.forEach((work, index) => {
    if (work.file === featuredFile) return;
    const button = document.createElement("button");
    button.className = "photo";
    button.type = "button";
    button.setAttribute("aria-label", "Open photograph " + format(index + 1));

    const image = document.createElement("img");
    image.src = work.file;
    image.alt = "";
    image.loading = "lazy";
    image.decoding = "async";
    image.fetchPriority = "low";
    image.addEventListener("error", () => button.remove(), { once: true });

    button.appendChild(image);
    button.addEventListener("click", () => openViewer(index));
    gallery.appendChild(button);
  });

  document.getElementById("viewerClose").addEventListener("click", closeViewer);
  document.getElementById("viewerPrev").addEventListener("click", () => openViewer(currentIndex - 1));
  document.getElementById("viewerNext").addEventListener("click", () => openViewer(currentIndex + 1));
  viewer.addEventListener("click", event => { if (event.target === viewer) closeViewer(); });

  document.addEventListener("keydown", event => {
    if (!viewer.classList.contains("open")) return;
    if (event.key === "Escape") closeViewer();
    if (event.key === "ArrowLeft") openViewer(currentIndex - 1);
    if (event.key === "ArrowRight") openViewer(currentIndex + 1);
  });
})();