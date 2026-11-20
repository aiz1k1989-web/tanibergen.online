(function(){
"use strict";
var works=Array.isArray(window.TANIBERGEN_WORKS)?window.TANIBERGEN_WORKS:[];
var hero=document.getElementById("hero-image"),side=document.getElementById("opening-side"),montage=document.getElementById("montage");
var viewer=document.getElementById("viewer"),viewerImage=document.getElementById("viewer-image"),viewerCount=document.getElementById("viewer-count"),viewerCaption=document.getElementById("viewer-caption");
var metadata={},active=0,lastFocus=null,savedY=0,bodyState=null,touchStart=null,resizeObserver=null;
var desktopSpans=[6,3,3,4,4,4,8,4,5,7,3,3,6,6,4,8,4,4,5,7,3,3,6,4];
var mobileSpans=[6,3,3,3,3,4,4,3,3,6,3,3];
function pad(n){return String(n).padStart(3,"0");}
function preview(file){return "../previews/"+file;}
function original(file){return "../"+file;}
function dimensions(file){return metadata[file]||null;}
function makeFrame(work,index,extraClass){
 var b=document.createElement("button");b.type="button";b.className="frame"+(extraClass?" "+extraClass:"");b.setAttribute("aria-label","Open photograph "+pad(index+1));b.dataset.index=String(index);
 var img=document.createElement("img");img.alt="";img.loading=index===0?"eager":"lazy";img.decoding="async";img.draggable=false;
 var m=dimensions(work.file);if(m&&m.width&&m.height){img.width=m.width;img.height=m.height;}
 img.src=preview(work.file);b.appendChild(img);b.addEventListener("click",function(){open(index);});return b;
}
function makePhoto(work,index){
 var b=document.createElement("button");b.type="button";b.className="photo";b.dataset.index=String(index);b.dataset.number=pad(index+1);b.setAttribute("aria-label","Open photograph "+pad(index+1));
 var span=desktopSpans[(index-5)%desktopSpans.length],mobile=mobileSpans[(index-5)%mobileSpans.length];
 b.style.setProperty("--span",String(span));b.style.setProperty("--mobile-span",String(mobile));
 var img=document.createElement("img");img.alt="";img.loading="lazy";img.decoding="async";img.draggable=false;
 var m=dimensions(work.file);if(m&&m.width&&m.height){img.width=m.width;img.height=m.height;}
 img.src=preview(work.file);b.appendChild(img);b.addEventListener("click",function(){open(index);});return b;
}
function render(){
 if(!works.length)return;
 hero.src=preview(works[0].file);var m=dimensions(works[0].file);if(m){hero.width=m.width;hero.height=m.height;}
 document.querySelector(".frame-main").addEventListener("click",function(){open(0);});
 for(var i=1;i<5&&i<works.length;i++)side.appendChild(makeFrame(works[i],i,""));
 var frag=document.createDocumentFragment();for(var j=5;j<works.length;j++)frag.appendChild(makePhoto(works[j],j));montage.appendChild(frag);
 document.getElementById("sequence-count").textContent=pad(Math.max(0,works.length-5))+" FRAMES";
 layoutMontage();
 if("ResizeObserver"in window){resizeObserver=new ResizeObserver(layoutMontage);resizeObserver.observe(montage);}
}
function layoutMontage(){
 var mobile=window.matchMedia("(max-width:760px)").matches,cols=mobile?6:12,row=mobile?5:7,gap=mobile?7:10,rowGap=mobile?8:12;
 var width=montage.clientWidth,colWidth=(width-gap*(cols-1))/cols;
 Array.prototype.forEach.call(montage.children,function(card){
  var span=Number(getComputedStyle(card).getPropertyValue(mobile?"--mobile-span":"--span"))||3;
  var img=card.querySelector("img"),m=dimensions(works[Number(card.dataset.index)].file);
  var w=m&&m.width?m.width:img.naturalWidth,h=m&&m.height?m.height:img.naturalHeight;
  if(!w||!h)return;
  var cardWidth=span*colWidth+(span-1)*gap,cardHeight=cardWidth*h/w;
  var rows=Math.max(8,Math.ceil((cardHeight+rowGap)/(row+rowGap)));
  card.style.setProperty(mobile?"--mobile-rows":"--rows",String(rows));
 });
}
function lock(){
 savedY=window.scrollY||window.pageYOffset;bodyState={position:document.body.style.position,top:document.body.style.top,left:document.body.style.left,right:document.body.style.right,width:document.body.style.width,overflow:document.body.style.overflow};
 document.body.style.position="fixed";document.body.style.top="-"+savedY+"px";document.body.style.left="0";document.body.style.right="0";document.body.style.width="100%";document.body.style.overflow="hidden";
}
function unlock(){
 if(!bodyState)return;Object.keys(bodyState).forEach(function(k){document.body.style[k]=bodyState[k];});bodyState=null;window.scrollTo(0,savedY);
}
function open(index){
 if(!works.length)return;active=(index+works.length)%works.length;
 if(viewer.hidden){lastFocus=document.activeElement;lock();}
 var work=works[active];viewer.hidden=false;viewerImage.src=original(work.file);viewerImage.alt="Photograph by Aizat Tanibergen";
 viewerCount.textContent=pad(active+1)+" / "+pad(works.length);viewerCaption.textContent="AIZAT TANIBERGEN / "+pad(active+1);
 document.getElementById("viewer-close").focus({preventScroll:true});
}
function close(){
 if(viewer.hidden)return;viewer.hidden=true;viewerImage.removeAttribute("src");unlock();if(lastFocus&&lastFocus.focus)lastFocus.focus({preventScroll:true});
}
function move(step){open(active+step);}
document.getElementById("viewer-close").addEventListener("click",close);
document.getElementById("viewer-prev").addEventListener("click",function(){move(-1);});
document.getElementById("viewer-next").addEventListener("click",function(){move(1);});
viewer.addEventListener("click",function(e){if(e.target===viewer)close();});
viewer.addEventListener("touchstart",function(e){if(e.touches&&e.touches.length===1)touchStart={x:e.touches[0].clientX,y:e.touches[0].clientY};},{passive:true});
viewer.addEventListener("touchend",function(e){if(!touchStart||!e.changedTouches||!e.changedTouches.length)return;var dx=e.changedTouches[0].clientX-touchStart.x,dy=e.changedTouches[0].clientY-touchStart.y;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.2)move(dx<0?1:-1);touchStart=null;},{passive:true});
document.addEventListener("keydown",function(e){if(viewer.hidden)return;if(e.key==="Escape")close();if(e.key==="ArrowLeft")move(-1);if(e.key==="ArrowRight")move(1);});
window.addEventListener("resize",layoutMontage,{passive:true});
function init(){render();}
fetch("../previews/metadata.json",{cache:"force-cache"}).then(function(r){if(!r.ok)throw new Error("metadata unavailable");return r.json();}).then(function(data){metadata=data||{};init();}).catch(init);
})();