(() => {
  "use strict";

  const photos = Array.isArray(window.TANIBERGEN_WORKS) ? window.TANIBERGEN_WORKS : [];
  const pageName = document.body.dataset.page || "Work";
  const grid = document.getElementById("photoGrid");
  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightboxImage");
  const lightboxCount = document.getElementById("lightboxCount");
  let activeIndex = 0;

  const pad = value => String(value).padStart(2, "0");

  function openLightbox(index) {
    if (!photos.length || !lightboxImage) return;
    activeIndex = (index + photos.length) % photos.length;
    lightboxImage.src = "../" + photos[activeIndex].file;
    lightboxImage.alt = "";
    lightboxCount.textContent = pad(activeIndex + 1) + " / " + pad(photos.length);
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    lightboxImage.removeAttribute("src");
    document.body.classList.remove("lightbox-open");
  }

  document.querySelectorAll("[data-image]").forEach(button => {
    button.addEventListener("click", () => {
      const path = button.dataset.image.replace(/^\.\.\//, "");
      const index = photos.findIndex(photo => photo.file === path);
      if (index >= 0) openLightbox(index);
    });
  });

  if (grid) {
    photos.forEach((photo, index) => {
      if (photo.file === "photos/4/1.webp") return;
      const button = document.createElement("button");
      button.className = "photo-item";
      button.type = "button";
      button.setAttribute("aria-label", "Open photograph " + pad(index + 1));

      const image = document.createElement("img");
      image.src = "../" + photo.file;
      image.alt = "";
      image.loading = "lazy";
      image.decoding = "async";
      image.addEventListener("error", () => button.remove(), { once: true });

      button.appendChild(image);
      button.addEventListener("click", () => openLightbox(index));
      grid.appendChild(button);
    });
  }

  const previous = document.getElementById("lightboxPrev");
  const next = document.getElementById("lightboxNext");
  const close = document.getElementById("lightboxClose");
  if (previous) previous.addEventListener("click", () => openLightbox(activeIndex - 1));
  if (next) next.addEventListener("click", () => openLightbox(activeIndex + 1));
  if (close) close.addEventListener("click", closeLightbox);

  if (lightbox) {
    lightbox.addEventListener("click", event => {
      if (event.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener("keydown", event => {
    if (!lightbox || !lightbox.classList.contains("open")) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") openLightbox(activeIndex - 1);
    if (event.key === "ArrowRight") openLightbox(activeIndex + 1);
  });

  // Author notes stay in this browser until the author submits them to GitHub.
  const storageKey = "tanibergen-saul-leiter-notes-v2";
  const notesMode = new URLSearchParams(location.search).get("notes") === "1";
  const notesOpen = document.getElementById("notesOpen");
  const notesPanel = document.getElementById("notesPanel");
  const noteForm = document.getElementById("noteForm");
  const noteInput = document.getElementById("noteInput");
  const noteStatus = document.getElementById("noteStatus");
  const notesList = document.getElementById("notesList");

  function loadNotes() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
      return Array.isArray(saved) ? saved : [];
    } catch (_) {
      return [];
    }
  }

  function saveNotes(notes) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(notes));
      return true;
    } catch (_) {
      return false;
    }
  }

  function currentSection() {
    const target = document.querySelector("[data-section]:target");
    return target ? target.dataset.section : pageName;
  }

  function makeIssueUrl(notes) {
    const title = "[SITE NOTES] " + notes.length + " website comment" + (notes.length === 1 ? "" : "s");
    const body = notes.map((note, index) => [
      "## Note " + (index + 1),
      "- Command: " + note.command,
      "- Page: " + note.page,
      "- Section: " + note.section,
      "- URL: " + note.url,
      "- Saved: " + note.created,
      "",
      note.message,
      "",
      "<!-- TANIBERGEN-SITE-NOTE -->"
    ].join("\n")).join("\n\n---\n\n");

    const url = new URL("https://github.com/aiz1k1989-web/tanibergen.online/issues/new");
    url.searchParams.set("title", title);
    url.searchParams.set("body", body);
    return url.toString();
  }

  function renderNotes() {
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

      const copy = document.createElement("p");
      copy.textContent = note.command + " / " + note.page + " / " + note.section + ": " + note.message;

      const actions = document.createElement("div");
      actions.className = "note-entry-actions";

      const remove = document.createElement("button");
      remove.type = "button";
      remove.textContent = "Remove";
      remove.addEventListener("click", () => {
        saveNotes(loadNotes().filter(entry => entry.id !== note.id));
        renderNotes();
      });

      actions.appendChild(remove);
      item.append(copy, actions);
      notesList.appendChild(item);
    });

    const sendAll = document.getElementById("sendAllNotes");
    if (sendAll) sendAll.disabled = !notes.length;
  }

  if (notesMode && notesOpen && notesPanel) {
    notesOpen.hidden = false;

    document.querySelectorAll("a[href]").forEach(link => {
      try {
        const target = new URL(link.href, location.href);
        if (target.origin === location.origin && target.pathname.startsWith(location.pathname.replace(/[^/]*$/, ""))) {
          target.searchParams.set("notes", "1");
          link.href = target.toString();
        }
      } catch (_) {}
    });

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
      const match = raw.match(/^(\/upd#[a-z0-9_-]+)(?:[ \t]+|\r?\n)([\s\S]+)$/i);

      if (!match || !match[2].trim()) {
        noteStatus.textContent = "Start with /upd#1, then describe the change.";
        return;
      }

      const notes = loadNotes();
      notes.push({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
        command: match[1],
        message: match[2].trim(),
        page: pageName,
        section: currentSection(),
        url: location.href,
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
      window.open(makeIssueUrl(notes), "_blank", "noopener,noreferrer");
      noteStatus.textContent = "Submit the prefilled issue on GitHub to store the reports.";
    });

    renderNotes();
  }
})();