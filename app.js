(() => {
  const works = window.TANIBERGEN_WORKS || [];
  const gallery = document.getElementById("gallery");
  const viewer = document.getElementById("viewer");
  const viewerImage = document.getElementById("viewerImage");
  const viewerIndex = document.getElementById("viewerIndex");
  const photoCount = String(works.length).padStart(3, "0");

  document.getElementById("photoCount").textContent = photoCount;
  document.getElementById("footerCount").textContent = photoCount + " PHOTOGRAPHS";

  let current = 0;
  const cards = [];

  function showImage(index) {
    if (!works.length) return;
    current = (index + works.length) % works.length;
    viewerImage.src = works[current].file;
    viewerImage.alt = "Photograph " + String(current + 1);
    viewerIndex.textContent = String(current + 1).padStart(3, "0") + " / " + photoCount;
    viewer.classList.add("open");
    viewer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeViewer() {
    viewer.classList.remove("open");
    viewer.setAttribute("aria-hidden", "true");
    viewerImage.removeAttribute("src");
    document.body.style.overflow = "";
  }

  works.forEach((work, index) => {
    const card = document.createElement("button");
    card.className = "photo";
    card.type = "button";
    card.setAttribute("aria-label", "Open photograph " + String(index + 1));

    const img = document.createElement("img");
    img.src = work.file;
    img.alt = "";
    img.loading = index < 2 ? "eager" : "lazy";
    img.decoding = "async";
    if (index === 0) img.fetchPriority = "high";

    img.addEventListener("error", () => card.remove(), { once: true });
    card.appendChild(img);
    card.addEventListener("click", () => showImage(index));
    gallery.appendChild(card);
    cards.push(card);
  });

  document.getElementById("closeViewer").addEventListener("click", closeViewer);
  document.getElementById("prevImage").addEventListener("click", () => showImage(current - 1));
  document.getElementById("nextImage").addEventListener("click", () => showImage(current + 1));
  viewer.addEventListener("click", event => {
    if (event.target === viewer) closeViewer();
  });

  document.addEventListener("keydown", event => {
    if (!viewer.classList.contains("open")) return;
    if (event.key === "Escape") closeViewer();
    if (event.key === "ArrowLeft") showImage(current - 1);
    if (event.key === "ArrowRight") showImage(current + 1);
  });
})();