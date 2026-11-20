(function(){
"use strict";
var works=Array.isArray(window.TANIBERGEN_WORKS)?window.TANIBERGEN_WORKS:[];
var ringRoot=document.getElementById("orbit-rings"),feedRoot=document.getElementById("ribbon-feed");
var viewer=document.getElementById("viewer"),viewerImage=document.getElementById("viewer-image");
var viewerCaption=document.getElementById("viewer-caption"),viewerCount=document.getElementById("viewer-count");
var motionLayer=document.getElementById("motion-layer");
var active=0,lastFocus=null,rafPending=false,orbitCards=[],feedCards=[],flightCards=[],flightRects=[],morphStarted=false,lastWidth=window.innerWidth,imageMeta={};
var ringWeights=[8,14,20,26,31],ringRadii=[13,21,29,37,45],durations=[74,91,108,126,145];
function previewPath(file){return "../previews/"+file;}
function originalPath(file){return "../"+file;}
function setRatio(img,card,file){var meta=imageMeta[file];if(meta&&meta.width&&meta.height){card.style.setProperty("--ratio",(meta.width/meta.height).toFixed(4));img.width=meta.width;img.height=meta.height;return;}function apply(){if(img.naturalWidth&&img.naturalHeight)card.style.setProperty("--ratio",(img.naturalWidth/img.naturalHeight).toFixed(4));}if(img.complete)apply();else img.addEventListener("load",apply,{once:true});}
function makeRings(){
 if(!works.length)return;
 var total=works.length;document.getElementById("core-count").textContent=String(total).padStart(3,"0")+" FRAMES";document.getElementById("ribbon-count").textContent=String(total).padStart(3,"0")+" FRAMES";
 var sum=ringWeights.reduce(function(a,b){return a+b;},0),counts=ringWeights.map(function(w){return Math.floor(total*w/sum);}),remainder=total-counts.reduce(function(a,b){return a+b;},0);
 for(var r=0;r<remainder;r++)counts[counts.length-1-r%counts.length]++;
 var cursor=0;
 counts.forEach(function(count,ringIndex){
  var track=document.createElement("div");track.className="orbit-track";track.style.setProperty("--duration",durations[ringIndex]+"s");track.style.setProperty("--inset",(100-ringRadii[ringIndex]*2)+"%");
  for(var i=0;i<count;i++){
   var work=works[cursor],index=cursor++,angle=360/count*i+(ringIndex%2?360/count/2:0),rad=angle*Math.PI/180;
   var card=document.createElement("button");card.type="button";card.className="orbit-card";card.style.left=(50+Math.sin(rad)*ringRadii[ringIndex])+"%";card.style.top=(50-Math.cos(rad)*ringRadii[ringIndex])+"%";card.setAttribute("aria-label","Open photograph "+String(index+1).padStart(3,"0"));
   var photo=document.createElement("span");photo.className="photo";var img=document.createElement("img");img.alt="";img.loading="lazy";img.decoding="async";img.draggable=false;img.src=previewPath(work.file);setRatio(img,card,work.file);photo.appendChild(img);card.appendChild(photo);
   card.addEventListener("click",(function(n){return function(){openAt(n);};})(index));track.appendChild(card);orbitCards[index]=card;
  }
  ringRoot.appendChild(track);
 });
}
function makeFeed(){
 var fragment=document.createDocumentFragment();
 works.forEach(function(work,index){
  var card=document.createElement("button");card.type="button";card.className="ribbon-item";card.setAttribute("aria-label","Open photograph "+String(index+1).padStart(3,"0"));
  var img=document.createElement("img");img.alt="";img.loading=index<12?"eager":"lazy";img.decoding="async";img.draggable=false;img.src=previewPath(work.file);setRatio(img,card,work.file);card.appendChild(img);card.addEventListener("click",function(){openAt(index);});fragment.appendChild(card);feedCards[index]=card;
 });
 feedRoot.appendChild(fragment);
}
function openAt(index){
 if(!works.length)return;active=(index+works.length)%works.length;var work=works[active];lastFocus=document.activeElement;
 viewer.hidden=false;document.body.style.overflow="hidden";viewerImage.removeAttribute("src");viewerImage.alt="Photograph by Aizat Tanibergen";viewerImage.src=originalPath(work.file);
 viewerCaption.textContent="AIZAT TANIBERGEN / "+String(active+1).padStart(3,"0");viewerCount.textContent=String(active+1).padStart(3,"0")+" / "+String(works.length).padStart(3,"0");document.getElementById("viewer-close").focus();
}
function closeViewer(){viewer.hidden=true;viewerImage.removeAttribute("src");document.body.style.overflow="";if(lastFocus&&lastFocus.focus)lastFocus.focus();}
function move(delta){openAt(active+delta);}
var toggle=document.getElementById("motion-toggle");
toggle.addEventListener("click",function(){var paused=document.body.classList.toggle("is-paused");toggle.textContent=paused?"RESUME MOTION":"PAUSE MOTION";toggle.setAttribute("aria-pressed",String(paused));});
document.getElementById("viewer-close").addEventListener("click",closeViewer);document.getElementById("viewer-prev").addEventListener("click",function(){move(-1);});document.getElementById("viewer-next").addEventListener("click",function(){move(1);});
viewer.addEventListener("click",function(e){if(e.target===viewer)closeViewer();});
document.addEventListener("keydown",function(e){if(viewer.hidden)return;if(e.key==="Escape")closeViewer();if(e.key==="ArrowLeft")move(-1);if(e.key==="ArrowRight")move(1);});
function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
function clearFlight(){motionLayer.replaceChildren();flightCards=[];flightRects=[];orbitCards.forEach(function(card){if(card)card.style.visibility="";});morphStarted=false;document.body.classList.remove("is-morphing","is-landed");}
function beginFlight(){
 if(morphStarted)return;
 morphStarted=true;document.body.classList.add("is-morphing");
 orbitCards.forEach(function(card,index){
  if(!card)return;var rect=card.getBoundingClientRect(),img=card.querySelector("img");if(!img)return;
  var ghost=document.createElement("div");ghost.className="flight-frame";
  var clone=img.cloneNode(false);clone.removeAttribute("loading");clone.style.width="100%";clone.style.height="100%";clone.style.display="block";clone.style.objectFit="cover";ghost.appendChild(clone);
  ghost.style.left=rect.left+"px";ghost.style.top=rect.top+"px";ghost.style.width=rect.width+"px";ghost.style.height=rect.height+"px";
  motionLayer.appendChild(ghost);flightCards[index]=ghost;flightRects[index]={left:rect.left,top:rect.top,width:rect.width,height:rect.height};card.style.visibility="hidden";
 });
}
function updateScroll(){
 rafPending=false;
 var section=document.getElementById("orbit-section"),rect=section.getBoundingClientRect(),vh=window.innerHeight;
 var span=Math.max(1,rect.height-vh*.35),progress=clamp((vh*.38-rect.top)/span,0,1);
 var morph=clamp((progress-.12)/.78,0,1);
 if(morph>0&&!morphStarted)beginFlight();
 if(morphStarted){
  for(var i=0;i<flightCards.length;i++){
   var ghost=flightCards[i],start=flightRects[i],target=feedCards[i];if(!ghost||!start||!target)continue;
   var end=target.getBoundingClientRect(),dx=end.left-start.left,dy=end.top-start.top,sx=end.width/Math.max(1,start.width),sy=end.height/Math.max(1,start.height);
   var eased=morph*morph*(3-2*morph);
   ghost.style.transform="translate3d("+(dx*eased).toFixed(2)+"px,"+(dy*eased).toFixed(2)+"px,0) scale("+(1+(sx-1)*eased).toFixed(4)+","+(1+(sy-1)*eased).toFixed(4)+")";
   ghost.style.opacity=String(1-clamp((morph-.88)/.12,0,1));
  }
 }
 document.documentElement.style.setProperty("--feed-progress",clamp((progress-.72)/.25,0,1).toFixed(4));
 document.documentElement.style.setProperty("--controls-opacity",clamp(1-progress*2.0,0,1).toFixed(4));
 document.documentElement.style.setProperty("--cue-opacity",clamp(1-progress*2.2,0,1).toFixed(4));
 if(morph>=.995){document.body.classList.add("is-landed");motionLayer.style.opacity="0";}
 else{document.body.classList.remove("is-landed");motionLayer.style.opacity="1";}
 if(progress===0&&morphStarted)clearFlight();
}
function requestUpdate(){if(!rafPending){rafPending=true;window.requestAnimationFrame(updateScroll);}}
window.addEventListener("scroll",requestUpdate,{passive:true});
window.addEventListener("resize",function(){if(Math.abs(window.innerWidth-lastWidth)>2){lastWidth=window.innerWidth;clearFlight();}requestUpdate();});
function init(){makeRings();makeFeed();updateScroll();}
fetch("../previews/metadata.json",{cache:"force-cache"}).then(function(response){if(!response.ok)throw new Error("metadata unavailable");return response.json();}).then(function(meta){imageMeta=meta||{};init();}).catch(init);
})();