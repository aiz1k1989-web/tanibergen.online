(() => {
  "use strict";

  const photos = window.TANIBERGEN_ALT_WORKS || [];
  const featuredPath = "../2/2.webp";
  const pageName = document.body.dataset.page || "Work";
  const grid = document.getElementById("photoGrid");
  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightboxImage");
  const lightboxCount = document.getElementById("lightboxCount");
  const total = photos.length;
  let activeIndex = 0;
  let adjacentPreload = null;

  const pad = n => String(n).padStart(2, "0");
  const displayPhotos = photos.filter(photo => photo.file !== featuredPath);

  const preloadNext = index => {
    if (!total) return;
    const nextPhoto = photos[(index + 1) % total];
    if (adjacentPreload) adjacentPreload.onload = adjacentPreload.onerror = null;
    adjacentPreload = new Image();
    adjacentPreload.decoding = "async";
    adjacentPreload.fetchPriority = "low";
    adjacentPreload.src = nextPhoto.file;
  };

  const openLightbox = index => {
    if (!total || !lightboxImage) return;
    activeIndex = (index + total) % total;
    const photo = photos[activeIndex];
    lightboxImage.src = photo.file;
    lightboxCount.textContent = pad(activeIndex + 1) + " / " + pad(total);
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
    preloadNext(activeIndex);
  };

  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    lightboxImage.removeAttribute("src");
    document.body.classList.remove("lightbox-open");
  };

  document.querySelectorAll("[data-image]").forEach(button => {
    button.addEventListener("click", () => {
      const path = button.dataset.image;
      const found = photos.findIndex(photo => photo.file === path);
      openLightbox(found >= 0 ? found : 0);
    });
  });

  if (grid) {
    displayPhotos.forEach(photo => {
      const index = photos.indexOf(photo);
      const button = document.createElement("button");
      button.className = "photo-item";
      button.type = "button";
      button.setAttribute("aria-label", "Open photograph " + pad(index + 1));
      const image = document.createElement("img");
      image.src = photo.file;
      image.alt = "";
      image.loading = "lazy";
      image.decoding = "async";
      image.fetchPriority = "low";
      image.addEventListener("error", () => button.remove(), { once: true });
      button.appendChild(image);
      button.addEventListener("click", () => openLightbox(index));
      grid.appendChild(button);
    });
    const count = document.getElementById("photoCount");
    if (count) count.textContent = pad(total) + " photographs";
  }

  const prev = document.getElementById("lightboxPrev");
  const next = document.getElementById("lightboxNext");
  const close = document.getElementById("lightboxClose");
  if (prev) prev.addEventListener("click", () => openLightbox(activeIndex - 1));
  if (next) next.addEventListener("click", () => openLightbox(activeIndex + 1));
  if (close) close.addEventListener("click", closeLightbox);
  if (lightbox) lightbox.addEventListener("click", event => {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", event => {
    if (!lightbox || !lightbox.classList.contains("open")) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") openLightbox(activeIndex - 1);
    if (event.key === "ArrowRight") openLightbox(activeIndex + 1);
  });

  // Site notes are saved in this browser and can be submitted to GitHub Issues.
  const storageKey = "tanibergen-saul-leiter-alt-notes-v1";
  const notesMode = new URLSearchParams(location.search).get("notes") === "1";
  const notesOpen = document.getElementById("notesOpen");
  const notesPanel = document.getElementById("notesPanel");
  const noteForm = document.getElementById("noteForm");
  const noteInput = document.getElementById("noteInput");
  const noteStatus = document.getElementById("noteStatus");
  const notesList = document.getElementById("notesList");

  const loadNotes = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
      return Array.isArray(saved) ? saved : [];
    } catch (_) { return []; }
  };
  const saveNotes = notes => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(notes));
      return true;
    } catch (_) { return false; }
  };
  const pageUrl = () => location.origin + location.pathname;
  const issueUrl = (notes, single) => {
    const title = single
      ? "SITE NOTE: " + notes[0].command + " - " + notes[0].page
      : "SITE NOTES: " + notes.length + " website comments";
    const body = notes.map((note, index) => [
      "## Note " + (index + 1),
      "- Command: " + note.command,
      "- Page: " + note.page,
      "- URL: " + note.url,
      "",
      note.message,
      "",
      "<!-- TANIBERGEN-SITE-NOTE -->"
    ].join("\n")).join("\n\n---\n\n");
    return "https://github.com/aiz1k1989-web/tanibergen.online/issues/new?title="
      + encodeURIComponent(title) + "&body=" + encodeURIComponent(body);
  };

  const renderNotes = () => {
    if (!notesList) return;
    const notes = loadNotes();
    notesList.replaceChildren();
    if (!notes.length) {
      const empty = document.createElement("p");
      empty.className = "notes-empty";
      empty.textContent = "No saved notes yet.";
      notesList.appendChild(empty);
    }
    notes.forEach(note => {
      const item = document.createElement("article");
      item.className = "note-entry";
      const text = document.createElement("p");
      text.textContent = note.command + " / " + note.page + ": " + note.message;
      const actions = document.createElement("div");
      actions.className = "note-entry-actions";
      const open = document.createElement("a");
      open.textContent = "Open issue ↗";
      open.href = issueUrl([note], true);
      open.target = "_blank";
      open.rel = "noreferrer";
      const remove = document.createElement("button");
      remove.type = "button";
      remove.textContent = "Remove";
      remove.addEventListener("click", () => {
        saveNotes(loadNotes().filter(entry => entry.id !== note.id));
        renderNotes();
      });
      actions.append(open, remove);
      item.append(text, actions);
      notesList.appendChild(item);
    });
    const sendAll = document.getElementById("sendAllNotes");
    if (sendAll) sendAll.disabled = !notes.length;
  };

  if (notesMode) {
    document.querySelectorAll('a[href]').forEach(link => {
      try {
        const target = new URL(link.href, location.href);
        if (target.origin === location.origin && target.pathname.includes("/saul-leiter-alt/")) {
          target.searchParams.set("notes", "1");
          link.href = target.toString();
        }
      } catch (_) {}
    });
  }

  if (notesMode && notesOpen && notesPanel) {
    notesOpen.hidden = false;
    notesOpen.addEventListener("click", () => {
      notesPanel.hidden = false;
      renderNotes();
    });
    document.getElementById("notesClose").addEventListener("click", () => {
      notesPanel.hidden = true;
    });
    notesPanel.addEventListener("click", event => {
      if (event.target === notesPanel) notesPanel.hidden = true;
    });
    noteForm.addEventListener("submit", event => {
      event.preventDefault();
      const raw = noteInput.value.trim();
      const match = raw.match(/^(\/[a-z][a-z0-9_-]*(?:#[a-z0-9_-]+)?)(?:\s+|\r?\n)([\s\S]+)$/i);
      if (!match) {
        noteStatus.textContent = "Start with /upd#1, then add the change request.";
        return;
      }
      const notes = loadNotes();
      notes.push({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
        command: match[1],
        message: match[2].trim(),
        page: pageName,
        url: pageUrl(),
        created: new Date().toISOString()
      });
      if (!saveNotes(notes)) {
        noteStatus.textContent = "Could not save. Check browser storage settings.";
        return;
      }
      noteInput.value = "";
      noteStatus.textContent = "Saved on this device.";
      renderNotes();
    });
    document.getElementById("sendAllNotes").addEventListener("click", () => {
      const notes = loadNotes();
      if (!notes.length) return;
      window.open(issueUrl(notes, false), "_blank", "noopener,noreferrer");
    });
    renderNotes();
  }
})();