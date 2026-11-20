(function(){
"use strict";
var works=Array.isArray(window.TANIBERGEN_WORKS)?window.TANIBERGEN_WORKS:[];
var ringRoot=document.getElementById("orbit-rings");
var viewer=document.getElementById("viewer");
var viewerImage=document.getElementById("viewer-image");
var viewerCaption=document.getElementById("viewer-caption");
var viewerCount=document.getElementById("viewer-count");
var active=0,lastFocus=null;
var ringWeights=[8,14,20,26,31];
var ringRadii=[13,21,29,37,45];
var durations=[74,91,108,126,145];
function previewPath(file){return "../previews/"+file;}
function originalPath(file){return "../"+file;}
function makeRings(){
 if(!works.length)return;
 document.getElementById("core-count").textContent=String(works.length).padStart(3,"0")+" FRAMES";
 var weights=ringWeights.slice(),sum=weights.reduce(function(a,b){return a+b;},0);
 var counts=weights.map(function(w){return Math.floor(works.length*w/sum);});
 var remainder=works.length-counts.reduce(function(a,b){return a+b;},0);
 for(var r=0;r<remainder;r++)counts[counts.length-1-r%counts.length]++;
 var cursor=0;
 counts.forEach(function(count,ringIndex){
  var track=document.createElement("div");track.className="orbit-track";
  track.style.setProperty("--duration",durations[ringIndex]+"s");
  track.style.setProperty("--inset",(100-ringRadii[ringIndex]*2)+"%");
  for(var i=0;i<count;i++){
   var work=works[cursor],index=cursor;cursor++;
   var angle=(360/count)*i+(ringIndex%2?360/count/2:0);
   var card=document.createElement("button");card.type="button";card.className="orbit-card";
   var radians=angle*Math.PI/180;
   card.style.left=(50+Math.sin(radians)*ringRadii[ringIndex])+"%";
   card.style.top=(50-Math.cos(radians)*ringRadii[ringIndex])+"%";
   card.setAttribute("aria-label","Open photograph "+String(index+1).padStart(3,"0"));
   var photo=document.createElement("span");photo.className="photo";
   var img=document.createElement("img");img.alt="";img.loading="lazy";img.decoding="async";img.draggable=false;img.src=previewPath(work.file);
   img.addEventListener("error",(function(path){return function(){if(!this.dataset.fallback){this.dataset.fallback="1";this.src=path;}};})(originalPath(work.file)));
   photo.appendChild(img);card.appendChild(photo);
   card.addEventListener("click",(function(n){return function(){openAt(n);};})(index));
   track.appendChild(card);
  }
  ringRoot.appendChild(track);
 });
}
function openAt(index){
 if(!works.length)return;
 active=(index+works.length)%works.length;
 var work=works[active];lastFocus=document.activeElement;
 viewer.hidden=false;document.body.style.overflow="hidden";
 viewerImage.removeAttribute("src");viewerImage.alt="Photograph by Aizat Tanibergen";viewerImage.src=originalPath(work.file);
 viewerCaption.textContent="AIZAT TANIBERGEN / "+String(active+1).padStart(3,"0");
 viewerCount.textContent=String(active+1).padStart(3,"0")+" / "+String(works.length).padStart(3,"0");
 document.getElementById("viewer-close").focus();
}
function closeViewer(){viewer.hidden=true;viewerImage.removeAttribute("src");document.body.style.overflow="";if(lastFocus&&lastFocus.focus)lastFocus.focus();}
function move(delta){openAt(active+delta);}
var toggle=document.getElementById("motion-toggle");
toggle.addEventListener("click",function(){var paused=document.body.classList.toggle("is-paused");toggle.textContent=paused?"RESUME MOTION":"PAUSE MOTION";toggle.setAttribute("aria-pressed",String(paused));});
document.getElementById("viewer-close").addEventListener("click",closeViewer);
document.getElementById("viewer-prev").addEventListener("click",function(){move(-1);});
document.getElementById("viewer-next").addEventListener("click",function(){move(1);});
viewer.addEventListener("click",function(e){if(e.target===viewer)closeViewer();});
document.addEventListener("keydown",function(e){if(viewer.hidden)return;if(e.key==="Escape")closeViewer();if(e.key==="ArrowLeft")move(-1);if(e.key==="ArrowRight")move(1);});
makeRings();
})();