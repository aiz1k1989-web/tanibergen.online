(function(){
"use strict";
var works=Array.isArray(window.TANIBERGEN_WORKS)?window.TANIBERGEN_WORKS:[];
var opening=document.getElementById("opening-grid"),archive=document.getElementById("archive-grid");
var viewer=document.getElementById("viewer"),viewerImage=document.getElementById("viewer-image");
var caption=document.getElementById("viewer-caption"),count=document.getElementById("viewer-count");
var active=0,lastFocus=null,savedY=0,bodyStyles=null,touchStart=null,raf=false;
var metadata={};
function preview(file){return "../previews/"+file;}
function original(file){return "../"+file;}
function applyDimensions(img,card,file){
 var m=metadata[file];
 if(m&&m.width&&m.height){img.width=m.width;img.height=m.height;return;}
 img.addEventListener("load",function(){if(img.naturalWidth&&img.naturalHeight){img.width=img.naturalWidth;img.height=img.naturalHeight;}},{once:true});
}
function cardFor(work,index){
 var card=document.createElement("button");card.type="button";card.className="photo-card";
 card.setAttribute("aria-label","Open photograph "+String(index+1).padStart(3,"0"));
 var img=document.createElement("img");img.alt="";img.decoding="async";img.loading=index<12?"eager":"lazy";img.draggable=false;
 img.src=preview(work.file);applyDimensions(img,card,work.file);card.appendChild(img);
 card.addEventListener("click",function(){open(index);});
 return card;
}
function render(){
 if(!works.length)return;
 var featured=works.slice(0,12),remaining=works.slice(12);
 var first=document.createDocumentFragment(),rest=document.createDocumentFragment();
 featured.forEach(function(work,index){first.appendChild(cardFor(work,index));});
 remaining.forEach(function(work,index){rest.appendChild(cardFor(work,index+12));});
 opening.appendChild(first);archive.appendChild(rest);
 document.getElementById("archive-total").textContent=String(remaining.length).padStart(3,"0")+" FRAMES";
}
function lock(){
 savedY=window.scrollY||window.pageYOffset||0;
 bodyStyles={position:document.body.style.position,top:document.body.style.top,left:document.body.style.left,right:document.body.style.right,width:document.body.style.width,overflow:document.body.style.overflow};
 document.body.style.position="fixed";document.body.style.top="-"+savedY+"px";document.body.style.left="0";document.body.style.right="0";document.body.style.width="100%";document.body.style.overflow="hidden";
}
function unlock(){
 if(!bodyStyles)return;
 document.body.style.position=bodyStyles.position;document.body.style.top=bodyStyles.top;document.body.style.left=bodyStyles.left;document.body.style.right=bodyStyles.right;document.body.style.width=bodyStyles.width;document.body.style.overflow=bodyStyles.overflow;
 bodyStyles=null;window.scrollTo(0,savedY);
}
function open(index){
 if(!works.length)return;
 active=(index+works.length)%works.length;
 if(viewer.hidden){lastFocus=document.activeElement;lock();}
 var work=works[active];viewer.hidden=false;
 viewerImage.src=original(work.file);viewerImage.alt="Photograph by Aizat Tanibergen";
 caption.textContent="AIZAT TANIBERGEN / "+String(active+1).padStart(3,"0");
 count.textContent=String(active+1).padStart(3,"0")+" / "+String(works.length).padStart(3,"0");
 document.getElementById("viewer-close").focus({preventScroll:true});
}
function close(){
 if(viewer.hidden)return;
 viewer.hidden=true;viewerImage.removeAttribute("src");unlock();
 if(lastFocus&&lastFocus.focus)lastFocus.focus({preventScroll:true});
}
function move(step){open(active+step);}
document.getElementById("viewer-close").addEventListener("click",close);
document.getElementById("viewer-prev").addEventListener("click",function(){move(-1);});
document.getElementById("viewer-next").addEventListener("click",function(){move(1);});
viewer.addEventListener("click",function(e){if(e.target===viewer)close();});
viewer.addEventListener("touchstart",function(e){if(e.touches&&e.touches.length===1)touchStart={x:e.touches[0].clientX,y:e.touches[0].clientY};},{passive:true});
viewer.addEventListener("touchend",function(e){
 if(!touchStart||!e.changedTouches||!e.changedTouches.length)return;
 var dx=e.changedTouches[0].clientX-touchStart.x,dy=e.changedTouches[0].clientY-touchStart.y;
 if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.25)move(dx<0?1:-1);
 touchStart=null;
},{passive:true});
document.addEventListener("keydown",function(e){if(viewer.hidden)return;if(e.key==="Escape")close();if(e.key==="ArrowLeft")move(-1);if(e.key==="ArrowRight")move(1);});
function progress(){
 raf=false;var max=document.documentElement.scrollHeight-window.innerHeight;
 document.documentElement.style.setProperty("--read",max>0?String((window.scrollY||window.pageYOffset)/max):"0");
}
window.addEventListener("scroll",function(){if(!raf){raf=true;window.requestAnimationFrame(progress);}},{passive:true});
window.addEventListener("resize",progress,{passive:true});
function init(){render();progress();}
fetch("../previews/metadata.json?v=photos-root-01",{cache:"force-cache"}).then(function(r){if(!r.ok)throw new Error("metadata unavailable");return r.json();}).then(function(m){metadata=m||{};init();}).catch(init);
})();