(function(){
  "use strict";
  var works=Array.isArray(window.TANIBERGEN_WORKS)?window.TANIBERGEN_WORKS:[];
  var grid=document.getElementById("work-grid");
  var hero=document.getElementById("hero-image");
  var viewer=document.getElementById("viewer");
  var viewerImage=document.getElementById("viewer-image");
  var viewerCaption=document.getElementById("viewer-caption");
  var viewerCount=document.getElementById("viewer-count");
  var active=0;
  var lastFocus=null;
  var dimensions={};
  var previewPath=function(file){return "../previews/"+file;};
  var originalPath=function(file){return "../"+file;};
  function makePreview(img,work){
    img.loading="lazy";img.decoding="async";
    img.src=previewPath(work.file);
    img.addEventListener("error",function(){
      if(img.dataset.fallbackDone)return;
      img.dataset.fallbackDone="1";img.src=originalPath(work.file);
    },{once:true});
  }
  function openAt(index){
    if(!works.length)return;
    active=(index+works.length)%works.length;
    var work=works[active];
    lastFocus=document.activeElement;
    viewer.hidden=false;
    document.body.style.overflow="hidden";
    viewerImage.alt="Photograph "+String(active+1).padStart(3,"0")+" by Aizat Tanibergen";
    viewerImage.removeAttribute("src");
    viewerImage.src=originalPath(work.file);
    viewerCaption.textContent="AIZAT TANIBERGEN";
    viewerCount.textContent=String(active+1).padStart(3,"0")+" / "+String(works.length).padStart(3,"0");
    document.getElementById("viewer-close").focus();
  }
  function closeViewer(){
    viewer.hidden=true;viewerImage.removeAttribute("src");document.body.style.overflow="";
    if(lastFocus&&lastFocus.focus)lastFocus.focus();
  }
  function move(delta){openAt(active+delta);}
  function renderArchive(){
    if(!works.length)return;
    var first=works[0];
    hero.src=previewPath(first.file);
    hero.addEventListener("error",function(){hero.src=originalPath(first.file);},{once:true});
    works.forEach(function(work,index){
      var fig=document.createElement("figure");fig.className="work-item";fig.tabIndex=0;fig.setAttribute("role","button");fig.setAttribute("aria-label","Open photograph "+String(index+1).padStart(3,"0"));
      var media=document.createElement("div");media.className="work-media";
      var size=dimensions[work.file];
      if(size&&size.width&&size.height)media.style.aspectRatio=size.width+" / "+size.height;
      var img=document.createElement("img");img.alt="Photograph "+String(index+1).padStart(3,"0")+" by Aizat Tanibergen";makePreview(img,work);media.appendChild(img);
      var cap=document.createElement("figcaption");
      var no=document.createElement("span");no.textContent="FRAME "+String(index+1).padStart(3,"0");
      var series=document.createElement("span");series.textContent="AT / "+String(work.series||"").replace("Series ","S");
      cap.appendChild(no);cap.appendChild(series);fig.appendChild(media);fig.appendChild(cap);
      fig.addEventListener("click",function(){openAt(index);});
      fig.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();openAt(index);}});
      grid.appendChild(fig);
    });
    document.getElementById("total-count").textContent=String(works.length).padStart(3,"0")+" FRAMES";
  }
  fetch("../previews/metadata.json").then(function(response){if(!response.ok)throw new Error("Image metadata unavailable");return response.json();}).then(function(data){dimensions=data||{};}).catch(function(){dimensions={};}).then(renderArchive);
  document.getElementById("viewer-close").addEventListener("click",closeViewer);
  document.getElementById("viewer-prev").addEventListener("click",function(){move(-1);});
  document.getElementById("viewer-next").addEventListener("click",function(){move(1);});
  viewer.addEventListener("click",function(e){if(e.target===viewer)closeViewer();});
  document.addEventListener("keydown",function(e){
    if(viewer.hidden)return;
    if(e.key==="Escape")closeViewer();
    if(e.key==="ArrowLeft")move(-1);
    if(e.key==="ArrowRight")move(1);
  });
})();
