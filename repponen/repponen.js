(function(){
  "use strict";

  var rawWorks = Array.isArray(window.TANIBERGEN_WORKS) ? window.TANIBERGEN_WORKS : [];
  var works = [];
  var seen = new Set();

  rawWorks.forEach(function(item){
    if (!item || !item.file) return;
    var file = String(item.file).replace(/^\/+/, "");
    if (seen.has(file)) return;
    seen.add(file);
    works.push({file:file});
  });

  var portraitIndex = works.findIndex(function(item){ return item.file === "1/1.webp"; });
  if (portraitIndex > 0) works.unshift(works.splice(portraitIndex,1)[0]);

  var grid = document.getElementById("work-grid");
  var heroPhoto = document.getElementById("hero-photo");
  var heroButton = document.querySelector(".hero-image");
  var viewer = document.getElementById("viewer");
  var viewerImage = document.getElementById("viewer-image");
  var viewerClose = document.getElementById("viewer-close");
  var viewerPrev = document.getElementById("viewer-prev");
  var viewerNext = document.getElementById("viewer-next");
  var viewerFigure = document.getElementById("viewer-figure");
  var currentIndex = 0;
  var returnFocus = null;
  var savedScrollY = 0;
  var touchStartX = 0;
  var touchStartY = 0;
  var metadata = {};
  var originalLoaded = false;

  function previewUrl(file){
    return "../cut-previews/" + file;
  }

  function originalUrl(file){
    return "../" + file;
  }

  function setImageDimensions(img,file){
    var data = metadata[file];
    if (!data) return;
    img.width = data.width;
    img.height = data.height;
    img.style.aspectRatio = data.width + " / " + data.height;
  }

  function makeCard(item,index){
    var button = document.createElement("button");
    var img = document.createElement("img");
    var desktopSpans = [7,5,4,4,6,6,3,9,5,7,4,8,6,6,4,4,8,4];
    var span = desktopSpans[(index - 1) % desktopSpans.length];
    var mobileSpan = (index % 7 === 0 || index % 11 === 0) ? 2 : 1;

    button.type = "button";
    button.className = "work-card";
    button.style.setProperty("--desktop-span", String(span));
    button.style.setProperty("--mobile-span", String(mobileSpan));
    button.dataset.imageIndex = String(index);
    button.setAttribute("aria-label","Open photograph " + (index + 1));

    img.src = previewUrl(item.file);
    img.alt = "Photograph from Aizat Tanibergen's archive";
    img.loading = "lazy";
    img.decoding = "async";
    setImageDimensions(img,item.file);
    img.addEventListener("error",function(){
      if (img.dataset.fallback) return;
      img.dataset.fallback = "1";
      img.src = "../previews/" + item.file;
    });

    button.appendChild(img);
    return button;
  }

  function buildArchive(){
    if (!works.length) return;
    var heroItem = works[0];
    if (heroItem.file !== "1/1.webp") {
      heroPhoto.src = previewUrl(heroItem.file);
      setImageDimensions(heroPhoto,heroItem.file);
    } else {
      setImageDimensions(heroPhoto,heroItem.file);
    }
    heroPhoto.addEventListener("error",function(){
      if (heroPhoto.dataset.fallback) return;
      heroPhoto.dataset.fallback = "1";
      heroPhoto.src = "../previews/" + heroItem.file;
    });

    var fragment = document.createDocumentFragment();
    works.slice(1).forEach(function(item,offset){
      fragment.appendChild(makeCard(item,offset + 1));
    });
    grid.appendChild(fragment);

    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    document.body.classList.add("motion-ready");
    var observer = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },{rootMargin:"120px 0px",threshold:.01});
    grid.querySelectorAll(".work-card").forEach(function(card){ observer.observe(card); });
  }

  function loadViewerImage(){
    var item = works[currentIndex];
    if (!item) return;
    originalLoaded = false;
    viewerImage.classList.remove("is-loaded");
    viewerImage.alt = "Photograph " + (currentIndex + 1) + " from Aizat Tanibergen's archive";
    viewerImage.dataset.fallback = "";
    viewerImage.onload = function(){
      originalLoaded = true;
      viewerImage.classList.add("is-loaded");
    };
    viewerImage.onerror = function(){
      if (viewerImage.dataset.fallback) return;
      viewerImage.dataset.fallback = "1";
      viewerImage.src = previewUrl(item.file);
    };
    viewerImage.src = originalUrl(item.file);
  }

  function openViewer(index,trigger){
    if (!works.length) return;
    currentIndex = Math.max(0,Math.min(index,works.length - 1));
    returnFocus = trigger || document.activeElement;
    savedScrollY = window.scrollY || window.pageYOffset || 0;
    document.body.style.position = "fixed";
    document.body.style.top = "-" + savedScrollY + "px";
    document.body.style.width = "100%";
    document.body.classList.add("viewer-locked");
    viewer.hidden = false;
    requestAnimationFrame(function(){
      viewer.classList.add("is-open");
      loadViewerImage();
      viewerClose.focus({preventScroll:true});
    });
  }

  function closeViewer(){
    if (viewer.hidden) return;
    viewer.classList.remove("is-open");
    viewer.hidden = true;
    document.body.classList.remove("viewer-locked");
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    window.scrollTo(0,savedScrollY);
    if (returnFocus && typeof returnFocus.focus === "function") {
      returnFocus.focus({preventScroll:true});
    }
  }

  function stepViewer(direction){
    if (!works.length) return;
    currentIndex = (currentIndex + direction + works.length) % works.length;
    loadViewerImage();
  }

  function focusableViewer(){
    return [viewerClose,viewerPrev,viewerNext].filter(function(el){ return el && !el.disabled; });
  }

  document.addEventListener("click",function(event){
    var trigger = event.target.closest("[data-image-index]");
    if (!trigger) return;
    var index = Number(trigger.dataset.imageIndex);
    if (!Number.isFinite(index)) return;
    openViewer(index,trigger);
  });

  viewerClose.addEventListener("click",closeViewer);
  viewerPrev.addEventListener("click",function(){ stepViewer(-1); });
  viewerNext.addEventListener("click",function(){ stepViewer(1); });
  viewer.addEventListener("click",function(event){
    if (event.target === viewer || event.target === viewerFigure) closeViewer();
  });

  document.addEventListener("keydown",function(event){
    if (viewer.hidden) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeViewer();
      return;
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      stepViewer(1);
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      stepViewer(-1);
      return;
    }
    if (event.key === "Tab") {
      var controls = focusableViewer();
      var first = controls[0];
      var last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  viewer.addEventListener("touchstart",function(event){
    if (!event.touches || !event.touches.length) return;
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
  },{passive:true});

  viewer.addEventListener("touchend",function(event){
    if (viewer.hidden || !event.changedTouches || !event.changedTouches.length) return;
    var dx = event.changedTouches[0].clientX - touchStartX;
    var dy = event.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > 46 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      stepViewer(dx < 0 ? 1 : -1);
    } else if (dy > 100 && dy > Math.abs(dx) * 1.3) {
      closeViewer();
    }
  },{passive:true});

  function init(){
    fetch("../previews/metadata.json",{cache:"force-cache"})
      .then(function(response){ if (!response.ok) throw new Error("Metadata unavailable"); return response.json(); })
      .then(function(data){ metadata = data || {}; })
      .catch(function(){ metadata = {}; })
      .then(buildArchive);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded",init,{once:true});
  } else {
    init();
  }
})();