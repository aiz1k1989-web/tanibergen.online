(function(){
"use strict";
var works=Array.isArray(window.TANIBERGEN_WORKS)?window.TANIBERGEN_WORKS:[];
var ringRoot=document.getElementById("orbit-rings"),feedRoot=document.getElementById("ribbon-feed");
var viewer=document.getElementById("viewer"),viewerImage=document.getElementById("viewer-image");
var viewerCaption=document.getElementById("viewer-caption"),viewerCount=document.getElementById("viewer-count");
var active=0,lastFocus=null,scrollTick=false;
var ringWeights=[8,14,20,26,31],ringRadii=[13,21,29,37,45],durations=[74,91,108,126,145];
function previewPath(file){return "../previews/"+file;}
function originalPath(file){return "../"+file;}
function setRatio(img,card){
 function apply(){if(img.naturalWidth&&img.naturalHeight){var ratio=img.naturalWidth/img.naturalHeight;card.style.setProperty("--ratio",ratio.toFixed(4));}}
 if(img.complete)apply();else img.addEventListener("load",apply,{once:true});
}
function makeRings(){
 if(!works.length)return;
 var total=works.length;
 document.getElementById("core-count").textContent=String(total).padStart(3,"0")+" FRAMES";
 document.getElementById("ribbon-count").textContent=String(total).padStart(3,"0")+" FRAMES";
 var sum=ringWeights.reduce(function(a,b){return a+b;},0);
 var counts=ringWeights.map(function(w){return Math.floor(total*w/sum);});
 var remainder=total-counts.reduce(function(a,b){return a+b;},0);
 for(var r=0;r<remainder;r++)counts[counts.length-1-r%counts.length]++;
 var cursor=0;
 counts.forEach(function(count,ringIndex){
  var track=document.createElement("div");track.className="orbit-track";track.style.setProperty("--duration",durations[ringIndex]+"s");
  track.style.setProperty("--inset",(100-ringRadii[ringIndex]*2)+"%");
  for(var i=0;i<count;i++){
   var work=works[cursor],index=cursor++;var angle=360/count*i+(ringIndex%2?360/count/2:0),rad=angle*Math.PI/180;
   var card=document.createElement("button");card.type="button";card.className="orbit-card";
   card.style.left=(50+Math.sin(rad)*ringRadii[ringIndex])+"%";card.style.top=(50-Math.cos(rad)*ringRadii[ringIndex])+"%";
   card.setAttribute("aria-label","Open photograph "+String(index+1).padStart(3,"0"));
   var photo=document.createElement("span");photo.className="photo";
   var img=document.createElement("img");img.alt="";img.loading="lazy";img.decoding="async";img.draggable=false;img.src=previewPath(work.file);
   setRatio(img,card);photo.appendChild(img);card.appendChild(photo);
   card.addEventListener("click",(function(n){return function(){openAt(n);};})(index));track.appendChild(card);
  }
  ringRoot.appendChild(track);
 });
}
function makeFeed(){
 var fragment=document.createDocumentFragment();
 works.forEach(function(work,index){
  var card=document.createElement("button");card.type="button";card.className="ribbon-item";
  card.setAttribute("aria-label","Open photograph "+String(index+1).padStart(3,"0"));
  var img=document.createElement("img");img.alt="";img.loading="lazy";img.decoding="async";img.draggable=false;img.src=previewPath(work.file);
  setRatio(img,card);card.appendChild(img);
  card.addEventListener("click",function(){openAt(index);});fragment.appendChild(card);
 });
 feedRoot.appendChild(fragment);
}
function openAt(index){
 if(!works.length)return;
 active=(index+works.length)%works.length;var work=works[active];lastFocus=document.activeElement;
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
function updateScroll(){
 scrollTick=false;var section=document.getElementById("orbit-section"),rect=section.getBoundingClientRect(),vh=window.innerHeight;
 var span=Math.max(1,rect.height-vh*.48),progress=Math.max(0,Math.min(1,(vh*.42-rect.top)/span));
 var feed=Math.max(0,Math.min(1,(progress-.38)/.62));
 document.documentElement.style.setProperty("--morph",progress.toFixed(4));
 document.documentElement.style.setProperty("--morph-scale",(1-progress*.38).toFixed(4));
 document.documentElement.style.setProperty("--morph-opacity",(1-progress*.92).toFixed(4));
 document.documentElement.style.setProperty("--morph-blur",(progress*5).toFixed(2)+"px");
 document.documentElement.style.setProperty("--controls-opacity",Math.max(0,1-progress*1.5).toFixed(4));
 document.documentElement.style.setProperty("--cue-opacity",Math.max(0,1-progress*2).toFixed(4));
 document.documentElement.style.setProperty("--stage-events",progress>.96?"none":"auto");
 document.documentElement.style.setProperty("--feed-progress",feed.toFixed(4));
 document.documentElement.style.setProperty("--feed-translate",((1-feed)*34).toFixed(2)+"px");
}
function requestScrollUpdate(){if(!scrollTick){scrollTick=true;window.requestAnimationFrame(updateScroll);}}
window.addEventListener("scroll",requestScrollUpdate,{passive:true});window.addEventListener("resize",requestScrollUpdate);
makeRings();makeFeed();updateScroll();
})();