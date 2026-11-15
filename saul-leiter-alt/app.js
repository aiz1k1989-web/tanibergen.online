(() => {
  "use strict";

  const allWorks = Array.isArray(window.TANIBERGEN_WORKS)
    ? window.TANIBERGEN_WORKS
    : [];
  const featuredFile = "4/1.webp";
  const portraitFile = "1/1.webp";
  const works = allWorks.filter(work => work.file !== featuredFile && work.file !== portraitFile);
  const allViewerWorks = allWorks.slice();

  const grid = document.getElementById("workGrid");
  const viewer = document.getElementById("viewer");
  const viewerImage = document.getElementById("viewerImage");
  const viewerCount = document.getElementById("viewerCount");
  let activeIndex = 0;

  const pad = number => String(number).padStart(2, "0");

  function openViewer(index) {
    if (!allViewerWorks.length) return;
    activeIndex = (index + allViewerWorks.length) % allViewerWorks.length;
    viewerImage.src = "../" + allViewerWorks[activeIndex].file;
    viewerImage.alt = "";
    viewerCount.textContent = pad(activeIndex + 1) + " / " + pad(allViewerWorks.length);
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

  function viewerIndexFor(file) {
    return allViewerWorks.findIndex(work => work.file === file);
  }

  document.querySelector(".hero-trigger").addEventListener("click", () => {
    const index = viewerIndexFor(featuredFile);
    if (index >= 0) openViewer(index);
  });
  document.querySelector(".about-trigger").addEventListener("click", () => {
    const index = viewerIndexFor(portraitFile);
    if (index >= 0) openViewer(index);
  });

  works.forEach(work => {
    const index = viewerIndexFor(work.file);
    const button = document.createElement("button");
    button.className = "image-button work-item";
    button.type = "button";
    button.setAttribute("aria-label", "Open photograph");

    const image = document.createElement("img");
    image.src = "../" + work.file;
    image.alt = "";
    image.loading = "lazy";
    image.decoding = "async";
    image.addEventListener("error", () => button.remove(), { once: true });

    button.appendChild(image);
    button.addEventListener("click", () => openViewer(index));
    grid.appendChild(button);
  });

  document.getElementById("viewerClose").addEventListener("click", closeViewer);
  document.getElementById("viewerPrev").addEventListener("click", () => openViewer(activeIndex - 1));
  document.getElementById("viewerNext").addEventListener("click", () => openViewer(activeIndex + 1));
  viewer.addEventListener("click", event => {
    if (event.target === viewer) closeViewer();
  });
  document.addEventListener("keydown", event => {
    if (!viewer.classList.contains("open")) return;
    if (event.key === "Escape") closeViewer();
    if (event.key === "ArrowLeft") openViewer(activeIndex - 1);
    if (event.key === "ArrowRight") openViewer(activeIndex + 1);
  });

  // Site notes are saved locally as drafts, then submitted through GitHub Issues.
  // This static site does not expose a GitHub token in the browser.
  const noteKey = "tanibergen-site-note-draft-v1";
  const launcher = document.getElementById("noteLauncher");
  const panel = document.getElementById("notePanel");
  const noteInput = document.getElementById("noteInput");
  const noteStatus = document.getElementById("noteStatus");
  const noteSend = document.getElementById("noteSend");

  try {
    noteInput.value = localStorage.getItem(noteKey) || "";
    noteStatus.textContent = noteInput.value ? "Draft restored from this device." : "Draft saved on this device.";
  } catch (_) {
    noteStatus.textContent = "Draft storage unavailable in this browser.";
  }

  launcher.addEventListener("click", () => {
    panel.hidden = !panel.hidden;
    if (!panel.hidden) noteInput.focus();
  });
  document.getElementById("noteClose").addEventListener("click", () => {
    panel.hidden = true;
  });

  noteInput.addEventListener("input", () => {
    try {
      localStorage.setItem(noteKey, noteInput.value);
      noteStatus.textContent = "Draft saved on this device.";
    } catch (_) {
      noteStatus.textContent = "Could not save a local draft.";
    }
  });

  noteSend.addEventListener("click", () => {
    const raw = noteInput.value.trim();
    const match = raw.match(/^\/upd#(\d+)\s+([\s\S]+)$/i);
    if (!match) {
      noteStatus.textContent = "Use /upd#1 followed by your note.";
      noteInput.focus();
      return;
    }

    const commandNumber = match[1];
    const description = match[2].trim();
    if (!description) {
      noteStatus.textContent = "Add a description after the command.";
      return;
    }

    const activeSection = document.querySelector("[data-section]:target");
    const section = activeSection
      ? activeSection.dataset.section
      : (location.hash ? location.hash.slice(1) : "Home");
    const pageUrl = location.href;
    const title = "[SITE NOTE #" + commandNumber + "] " + section;
    const body = [
      "**Page:** " + pageUrl,
      "**Section:** " + section,
      "",
      "**Requested change:**",
      description,
      "",
      "---",
      "Submitted from the site note panel."
    ].join("\n");

    const issueUrl = new URL("https://github.com/aiz1k1989-web/tanibergen.online/issues/new");
    issueUrl.searchParams.set("title", title);
    issueUrl.searchParams.set("body", body);
    window.open(issueUrl.toString(), "_blank", "noopener,noreferrer");
    noteStatus.textContent = "GitHub opened. Press Submit new issue there to save this report.";
  });
})();