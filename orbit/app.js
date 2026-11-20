(function(){
"use strict";
var works=Array.isArray(window.TANIBERGEN_WORKS)?window.TANIBERGEN_WORKS:[];
var ringRoot=document.getElementById("orbit-rings"),feedRoot=document.getElementById("ribbon-feed");
var viewer=document.getElementById("viewer"),viewerImage=document.getElementById("viewer-image");
var viewerCaption=document.getElementById("viewer-caption"),viewerCount=document.getElementById("viewer-count");
var active=0,lastFocus=null,scrollTick=false,orbitCards=[],feedCards=[],baseRects=[],morphStarted=false;
var ringWeights=[8,14,20,26,31],ringRadii=[13,21,29,37,45],durations=[74,91,108,126,145];
function previewPath(file){return "../previews/"+file;}
function originalPath(file){return "../"+file;}
function setRatio(img,card){
 function apply(){if(img.naturalWidth&&img.naturalHeight){card.style.setProperty("--ratio",(img.naturalWidth/img.naturalHeight).toFixed(4));}}
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
   card.addEventListener("click",(function(n){return function(){openAt(n);};})(index));track.appendChild(card);orbitCards[index]=card;
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
  card.addEventListener("click",function(){openAt(index);});fragment.appendChild(card);feedCards[index]=card;
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
function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
function updateScroll(){
 scrollTick=false;
 var section=document.getElementById("orbit-section"),stage=document.getElementById("orbit-stage");
 var rect=section.getBoundingClientRect(),vh=window.innerHeight;
 var span=Math.max(1,rect.height-vh*.48);
 var progress=clamp((vh*.42-rect.top)/span,0,1);
 var morph=clamp((progress-.10)/.78,0,1);
 document.documentElement.style.setProperty("--morph",morph.toFixed(4));
 document.documentElement.style.setProperty("--feed-progress",clamp((progress-.78)/.20,0,1).toFixed(4));
 document.documentElement.style.setProperty("--controls-opacity",clamp(1-progress*2.1,0,1).toFixed(4));
 document.documentElement.style.setProperty("--cue-opacity",clamp(1-progress*2.4,0,1).toFixed(4));
 document.body.classList.toggle("is-morphing",progress>.10);
 if(progress>.10){
  if(!morphStarted){
   baseRects=orbitCards.map(function(card){return card?card.getBoundingClientRect():null;});
   morphStarted=true;
  }
  for(var i=0;i<orbitCards.length;i++){
   var source=orbitCards[i],target=feedCards[i],a=baseRects[i];if(!source||!target||!a)continue;
   var b=target.getBoundingClientRect();
   var dx=(b.left+b.width/2)-(a.left+a.width/2);
   var dy=(b.top+b.height/2)-(a.top+a.height/2);
   var scale=Math.max(.01,b.width/Math.max(1,a.width));
   source.style.setProperty("--tx",(dx*morph).toFixed(2)+"px");
   source.style.setProperty("--ty",(dy*morph).toFixed(2)+"px");
   source.style.setProperty("--scale",(1+(scale-1)*morph).toFixed(4));
  }
 }else{
  morphStarted=false;baseRects=[];
  orbitCards.forEach(function(card){if(card){card.style.setProperty("--tx","0px");card.style.setProperty("--ty","0px");card.style.setProperty("--scale","1");}});
 }
}
function requestScrollUpdate(){if(!scrollTick){scrollTick=true;window.requestAnimationFrame(updateScroll);}}
window.addEventListener("scroll",requestScrollUpdate,{passive:true});window.addEventListener("resize",requestScrollUpdate);
makeRings();makeFeed();updateScroll();
})();