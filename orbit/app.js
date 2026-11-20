(function(){
"use strict";
var works=Array.isArray(window.TANIBERGEN_WORKS)?window.TANIBERGEN_WORKS:[];
var ringRoot=document.getElementById("orbit-rings"),feedRoot=document.getElementById("ribbon-feed");
var viewer=document.getElementById("viewer"),viewerImage=document.getElementById("viewer-image");
var viewerCaption=document.getElementById("viewer-caption"),viewerCount=document.getElementById("viewer-count");
var motionLayer=document.getElementById("motion-layer");
var active=0,lastFocus=null,rafPending=false,orbitCards=[],feedCards=[],flightCards=[],flightRects=[];
var morphStarted=false,lastWidth=window.innerWidth,imageMeta={},savedScrollY=0,bodyLock=null,viewerTouch=null;
var ringWeights=[8,14,20,26,31],ringRadii=[13,21,29,37,45],durations=[74,91,108,126,145];
var MAX_FLIGHTS=window.matchMedia&&window.matchMedia("(max-width:760px)").matches?12:20;
var reduceMotion=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function previewPath(file){return "../previews/"+file;}
function originalPath(file){return "../"+file;}
function setRatio(img,card,file){
 var meta=imageMeta[file];
 if(meta&&meta.width&&meta.height){card.style.setProperty("--ratio",(meta.width/meta.height).toFixed(4));img.width=meta.width;img.height=meta.height;return;}
 function apply(){if(img.naturalWidth&&img.naturalHeight)card.style.setProperty("--ratio",(img.naturalWidth/img.naturalHeight).toFixed(4));}
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
  var track=document.createElement("div");
  track.className="orbit-track";
  track.style.setProperty("--duration",durations[ringIndex]+"s");
  track.style.setProperty("--inset",(100-ringRadii[ringIndex]*2)+"%");
  for(var i=0;i<count;i++){
   var index=cursor++,work=works[index];
   var angle=360/count*i+(ringIndex%2?360/count/2:0),rad=angle*Math.PI/180;
   var card=document.createElement("button");
   card.type="button";card.className="orbit-card";
   card.style.left=(50+Math.sin(rad)*ringRadii[ringIndex])+"%";
   card.style.top=(50-Math.cos(rad)*ringRadii[ringIndex])+"%";
   card.setAttribute("aria-label","Open photograph "+String(index+1).padStart(3,"0"));
   var photo=document.createElement("span");photo.className="photo";
   var img=document.createElement("img");img.alt="";img.loading="lazy";img.decoding="async";img.draggable=false;img.src=previewPath(work.file);
   setRatio(img,card,work.file);photo.appendChild(img);card.appendChild(photo);
   card.addEventListener("click",(function(n){return function(){openAt(n);};})(index));
   track.appendChild(card);orbitCards[index]=card;
  }
  ringRoot.appendChild(track);
 });
}
function makeFeed(){
 var fragment=document.createDocumentFragment();
 works.forEach(function(work,index){
  var card=document.createElement("button");card.type="button";card.className="ribbon-item";
  card.setAttribute("aria-label","Open photograph "+String(index+1).padStart(3,"0"));
  var img=document.createElement("img");img.alt="";img.loading=index<8?"eager":"lazy";img.decoding="async";img.draggable=false;
  img.src=previewPath(work.file);setRatio(img,card,work.file);card.appendChild(img);
  card.addEventListener("click",function(){openAt(index);});
  fragment.appendChild(card);feedCards[index]=card;
 });
 feedRoot.appendChild(fragment);
}
function lockPage(){
 savedScrollY=window.scrollY||window.pageYOffset||0;
 bodyLock={position:document.body.style.position,top:document.body.style.top,left:document.body.style.left,right:document.body.style.right,width:document.body.style.width,overflow:document.body.style.overflow};
 document.body.style.position="fixed";document.body.style.top="-"+savedScrollY+"px";
 document.body.style.left="0";document.body.style.right="0";document.body.style.width="100%";document.body.style.overflow="hidden";
}
function unlockPage(){
 if(!bodyLock)return;
 document.body.style.position=bodyLock.position;document.body.style.top=bodyLock.top;
 document.body.style.left=bodyLock.left;document.body.style.right=bodyLock.right;
 document.body.style.width=bodyLock.width;document.body.style.overflow=bodyLock.overflow;
 bodyLock=null;window.scrollTo(0,savedScrollY);
}
function openAt(index){
 if(!works.length)return;
 active=(index+works.length)%works.length;
 var work=works[active];lastFocus=document.activeElement;
 if(viewer.hidden)lockPage();viewer.hidden=false;
 viewerImage.removeAttribute("src");viewerImage.alt="Photograph by Aizat Tanibergen";viewerImage.src=originalPath(work.file);
 viewerCaption.textContent="AIZAT TANIBERGEN / "+String(active+1).padStart(3,"0");
 viewerCount.textContent=String(active+1).padStart(3,"0")+" / "+String(works.length).padStart(3,"0");
 document.getElementById("viewer-close").focus({preventScroll:true});
}
function closeViewer(){
 if(viewer.hidden)return;
 viewer.hidden=true;viewerImage.removeAttribute("src");unlockPage();
 if(lastFocus&&lastFocus.focus)lastFocus.focus({preventScroll:true});
}
function move(delta){openAt(active+delta);}
var toggle=document.getElementById("motion-toggle");
toggle.addEventListener("click",function(){
 var paused=document.body.classList.toggle("is-paused");
 toggle.textContent=paused?"RESUME MOTION":"PAUSE MOTION";
 toggle.setAttribute("aria-pressed",String(paused));
});
document.getElementById("viewer-close").addEventListener("click",closeViewer);
document.getElementById("viewer-prev").addEventListener("click",function(){move(-1);});
document.getElementById("viewer-next").addEventListener("click",function(){move(1);});
viewer.addEventListener("click",function(e){if(e.target===viewer)closeViewer();});
viewer.addEventListener("touchstart",function(e){
 if(!e.touches||e.touches.length!==1)return;
 viewerTouch={x:e.touches[0].clientX,y:e.touches[0].clientY};
},{passive:true});
viewer.addEventListener("touchend",function(e){
 if(!viewerTouch||!e.changedTouches||!e.changedTouches.length)return;
 var dx=e.changedTouches[0].clientX-viewerTouch.x,dy=e.changedTouches[0].clientY-viewerTouch.y;
 if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.25)move(dx<0?1:-1);
 viewerTouch=null;
},{passive:true});
document.addEventListener("keydown",function(e){
 if(viewer.hidden)return;
 if(e.key==="Escape")closeViewer();
 if(e.key==="ArrowLeft")move(-1);
 if(e.key==="ArrowRight")move(1);
});
function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
function clearFlight(){
 motionLayer.replaceChildren();flightCards=[];flightRects=[];
 orbitCards.forEach(function(card){if(card)card.style.visibility="";});
 morphStarted=false;document.body.classList.remove("is-morphing");
 motionLayer.style.opacity="1";
 document.documentElement.style.setProperty("--orbit-opacity","1");
}
function beginFlight(){
 if(morphStarted)return;
 morphStarted=true;document.body.classList.add("is-morphing");
 var loaded=[];
 orbitCards.forEach(function(card,index){
  if(!card)return;
  var img=card.querySelector("img");
  if(img&&img.complete&&img.naturalWidth>0)loaded.push({card:card,img:img,index:index});
 });
 if(!loaded.length)return;
 var stride=Math.max(1,Math.ceil(loaded.length/MAX_FLIGHTS));
 var chosen=loaded.filter(function(item,index){return index%stride===0;}).slice(0,MAX_FLIGHTS);
 chosen.forEach(function(item){
  var rect=item.card.getBoundingClientRect();
  var ghost=document.createElement("div");ghost.className="flight-frame";
  var clone=document.createElement("img");clone.alt="";clone.draggable=false;
  clone.src=item.img.currentSrc||item.img.src;ghost.appendChild(clone);
  ghost.style.left=rect.left+"px";ghost.style.top=rect.top+"px";
  ghost.style.width=rect.width+"px";ghost.style.height=rect.height+"px";
  motionLayer.appendChild(ghost);
  flightCards.push(ghost);flightRects.push({left:rect.left,top:rect.top,width:rect.width,height:rect.height,index:item.index});
 });
}
function sectionProgress(){
 var section=document.getElementById("orbit-section");
 var top=section.getBoundingClientRect().top+(window.scrollY||window.pageYOffset||0);
 var height=section.offsetHeight||1;
 var start=top+height*.16,end=top+height*.78;
 return clamp(((window.scrollY||window.pageYOffset||0)-start)/Math.max(1,end-start),0,1);
}
function updateScroll(){
 rafPending=false;
 var progress=sectionProgress();
 var morph=clamp((progress-.04)/.92,0,1);
 if(morph>0&&!morphStarted&&!reduceMotion)beginFlight();
 if(morphStarted){
  var eased=morph*morph*(3-2*morph);
  for(var i=0;i<flightCards.length;i++){
   var ghost=flightCards[i],start=flightRects[i],target=feedCards[start.index];
   if(!ghost||!start||!target)continue;
   var end=target.getBoundingClientRect();
   var dx=end.left-start.left,dy=end.top-start.top;
   var sx=end.width/Math.max(1,start.width),sy=end.height/Math.max(1,start.height);
   ghost.style.transform="translate("+ (dx*eased).toFixed(1)+"px,"+(dy*eased).toFixed(1)+"px) scale("+(1+(sx-1)*eased).toFixed(4)+","+(1+(sy-1)*eased).toFixed(4)+")";
   ghost.style.opacity=String(1-clamp((morph-.82)/.18,0,1));
  }
 }
 document.documentElement.style.setProperty("--orbit-opacity",String(1-morph));
 document.documentElement.style.setProperty("--feed-progress",String(clamp((morph-.68)/.32,0,1)));
 document.documentElement.style.setProperty("--controls-opacity",String(clamp(1-progress*2.1,0,1)));
 document.documentElement.style.setProperty("--cue-opacity",String(clamp(1-progress*2.2,0,1)));
 if(progress===0&&morphStarted)clearFlight();
}
function requestUpdate(){if(!rafPending){rafPending=true;window.requestAnimationFrame(updateScroll);}}
window.addEventListener("scroll",requestUpdate,{passive:true});
window.addEventListener("resize",function(){
 if(Math.abs(window.innerWidth-lastWidth)>2){lastWidth=window.innerWidth;clearFlight();}
 requestUpdate();
},{passive:true});
function init(){
 if(ringRoot.childElementCount)return;
 makeRings();makeFeed();updateScroll();
}
fetch("../previews/metadata.json?v=photos-root-01",{cache:"force-cache"})
 .then(function(response){if(!response.ok)throw new Error("metadata unavailable");return response.json();})
 .then(function(meta){imageMeta=meta||{};init();})
 .catch(init);
})();