(function(){
"use strict";
var source=Array.isArray(window.TANIBERGEN_WORKS)?window.TANIBERGEN_WORKS:[];
var seen=Object.create(null);
var works=source.filter(function(work){if(!work||!work.file||seen[work.file])return false;seen[work.file]=true;return true;});
var hero=document.getElementById("hero-image"),heroButton=document.getElementById("hero-photo");
var side=document.getElementById("opening-side"),montage=document.getElementById("montage");
var viewer=document.getElementById("viewer"),viewerImage=document.getElementById("viewer-image");
var active=0,lastFocus=null,savedY=0,bodyState=null,touchStart=null,metadata={},observer=null;
var desktopSpans=[4,3,5,4,3,6,3,4,5,3,6,4,3,5,4,8,3,4,5,3,6,4,3,4];
var mobileSpans=[3,3,6,3,3,3,6,3,3,3,6,3];
function pad(n){return String(n).padStart(3,"0");}
function preview(file){return "../cut-previews/"+file;}
function original(file){return "../"+file;}
function getDimensions(file){return metadata[file]||null;}
function setImageDimensions(img,file){
 var m=getDimensions(file);
 if(m&&m.width&&m.height){img.width=m.width;img.height=m.height;}
}
function makeOpening(work,index){
 var button=document.createElement("button");button.type="button";button.className="photo-opening";button.setAttribute("aria-label","Open photograph "+pad(index+1));
 var image=document.createElement("img");image.alt="";image.loading="eager";image.decoding="async";image.draggable=false;
 setImageDimensions(image,work.file);image.src=preview(work.file);button.appendChild(image);
 button.addEventListener("click",function(){open(index);});return button;
}
function makePhoto(work,index){
 var button=document.createElement("button");button.type="button";button.className="photo";button.setAttribute("aria-label","Open photograph "+pad(index+1));
 var span=desktopSpans[(index-3)%desktopSpans.length],mobile=mobileSpans[(index-3)%mobileSpans.length];
 button.style.setProperty("--span",String(span));button.style.setProperty("--mobile-span",String(mobile));
 var image=document.createElement("img");image.alt="";image.loading="lazy";image.decoding="async";image.draggable=false;
 setImageDimensions(image,work.file);image.src=preview(work.file);button.appendChild(image);
 button.addEventListener("click",function(){open(index);});return button;
}
function render(){
 if(!works.length)return;
 // The first archive image is the author's self-portrait and must remain the opening image.
 var first=works[0];setImageDimensions(hero,first.file);hero.src=preview(first.file);
 heroButton.addEventListener("click",function(){open(0);});
 for(var i=1;i<3&&i<works.length;i++)side.appendChild(makeOpening(works[i],i));
 var fragment=document.createDocumentFragment();
 for(var j=3;j<works.length;j++)fragment.appendChild(makePhoto(works[j],j));
 montage.appendChild(fragment);
 layoutMontage();
 if("ResizeObserver"in window){observer=new ResizeObserver(layoutMontage);observer.observe(montage);}
}
function layoutMontage(){
 if(!montage||!montage.children.length)return;
 var mobile=window.matchMedia("(max-width:760px)").matches;
 var columns=mobile?6:12,rowHeight=mobile?5:7,gap=mobile?7:12,rowGap=mobile?8:12;
 var width=montage.clientWidth,columnWidth=(width-gap*(columns-1))/columns;
 Array.prototype.forEach.call(montage.children,function(card,index){
  var work=works[index+3];
  if(!work)return;
  var span=Number(getComputedStyle(card).getPropertyValue(mobile?"--mobile-span":"--span"))||3;
  var m=getDimensions(work.file),image=card.querySelector("img");
  var imageWidth=m&&m.width?m.width:image.naturalWidth,imageHeight=m&&m.height?m.height:image.naturalHeight;
  if(!imageWidth||!imageHeight||!columnWidth)return;
  var cardWidth=span*columnWidth+(span-1)*gap;
  var desiredHeight=cardWidth*imageHeight/imageWidth;
  var rows=Math.max(8,Math.ceil((desiredHeight+rowGap)/(rowHeight+rowGap)));
  card.style.gridRowEnd="span "+rows;
 });
}
function lockScroll(){
 savedY=window.scrollY||window.pageYOffset||0;
 bodyState={position:document.body.style.position,top:document.body.style.top,left:document.body.style.left,right:document.body.style.right,width:document.body.style.width,overflow:document.body.style.overflow};
 document.body.style.position="fixed";document.body.style.top="-"+savedY+"px";document.body.style.left="0";document.body.style.right="0";document.body.style.width="100%";document.body.style.overflow="hidden";
}
function unlockScroll(){
 if(!bodyState)return;
 Object.keys(bodyState).forEach(function(key){document.body.style[key]=bodyState[key];});
 bodyState=null;window.scrollTo(0,savedY);
}
function open(index){
 if(!works.length)return;
 active=(index+works.length)%works.length;
 if(viewer.hidden){lastFocus=document.activeElement;lockScroll();}
 viewer.hidden=false;viewerImage.src=original(works[active].file);viewerImage.alt=active===0?"Self portrait by Aizat Tanibergen":"Photograph by Aizat Tanibergen";
 document.getElementById("viewer-close").focus({preventScroll:true});
}
function close(){
 if(viewer.hidden)return;
 viewer.hidden=true;viewerImage.removeAttribute("src");unlockScroll();
 if(lastFocus&&typeof lastFocus.focus==="function")lastFocus.focus({preventScroll:true});
}
function move(delta){open(active+delta);}
document.getElementById("viewer-close").addEventListener("click",close);
document.getElementById("viewer-prev").addEventListener("click",function(){move(-1);});
document.getElementById("viewer-next").addEventListener("click",function(){move(1);});
viewer.addEventListener("click",function(event){if(event.target===viewer)close();});
viewer.addEventListener("touchstart",function(event){if(event.touches&&event.touches.length===1)touchStart={x:event.touches[0].clientX,y:event.touches[0].clientY};},{passive:true});
viewer.addEventListener("touchend",function(event){
 if(!touchStart||!event.changedTouches||!event.changedTouches.length)return;
 var dx=event.changedTouches[0].clientX-touchStart.x,dy=event.changedTouches[0].clientY-touchStart.y;
 if(Math.abs(dx)>52&&Math.abs(dx)>Math.abs(dy)*1.2)move(dx<0?1:-1);
 touchStart=null;
},{passive:true});
document.addEventListener("keydown",function(event){
 if(viewer.hidden)return;
 if(event.key==="Escape")close();
 else if(event.key==="ArrowLeft")move(-1);
 else if(event.key==="ArrowRight")move(1);
});
window.addEventListener("resize",layoutMontage,{passive:true});
function init(){render();}
fetch("../previews/metadata.json",{cache:"force-cache"}).then(function(response){if(!response.ok)throw new Error("Image metadata unavailable");return response.json();}).then(function(data){metadata=data||{};init();}).catch(init);
})();