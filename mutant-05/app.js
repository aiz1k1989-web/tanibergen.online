(function(){
"use strict";
const source=Array.isArray(window.TANIBERGEN_WORKS)?window.TANIBERGEN_WORKS:[];
const works=source.filter((work,index)=>work&&work.file&&source.findIndex(item=>item&&item.file===work.file)===index);
const opening=document.getElementById("opening-image");
const sequence=document.getElementById("sequence");
const viewer=document.getElementById("viewer");
const viewerImage=document.getElementById("viewer-image");
const status=document.getElementById("viewer-status");
const closeButton=document.getElementById("viewer-close");
const previousButton=document.getElementById("viewer-previous");
const nextButton=document.getElementById("viewer-next");
const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let metadata={},activeIndex=-1,returnFocus=null,openedByKeyboard=false,scrollPosition=0,closeTimer=0,touchStart=null;
const modulo=(value,length)=>((value%length)+length)%length;
const imagePath=file=>"../cut-previews/"+file;
const originalPath=file=>"../"+file;
function dimensions(file){return metadata[file]||{width:3,height:4}}
function makeFrame(work,index){
  const frame=document.createElement("button");
  const image=document.createElement("img");
  const size=dimensions(work.file);
  frame.type="button";
  frame.className="frame";
  frame.setAttribute("aria-label","Open photograph "+(index+1));
  image.alt="";
  image.width=size.width||3;
  image.height=size.height||4;
  image.decoding="async";
  image.loading=index===0?"eager":"lazy";
  if(index===0)image.fetchPriority="high";
  image.src=imagePath(work.file);
  frame.appendChild(image);
  frame.addEventListener("click",()=>{
    const keyboard=frame.matches(":focus-visible");
    openViewer(index,keyboard,frame);
    if(!keyboard&&document.activeElement===frame)frame.blur();
  });
  return frame;
}
function buildArchive(){
  if(!works.length)return;
  opening.replaceChildren(makeFrame(works[0],0));
  const rest=works.slice(1);
  const pattern=[2,1,2,3,1,2,2,1,3,2,1,2];
  const fragment=document.createDocumentFragment();
  let cursor=0,spreadIndex=0;
  while(cursor<rest.length){
    const count=Math.min(pattern[spreadIndex%pattern.length],rest.length-cursor);
    const spread=document.createElement("div");
    const group=rest.slice(cursor,cursor+count);
    let layout="spread--single";
    if(count===2)layout=spreadIndex%2===0?"spread--pair-a":"spread--pair-b";
    if(count===3)layout="spread--trio";
    spread.className="spread "+layout;
    if(count===1)spread.classList.add(["spread--left","spread--right","spread--center"][spreadIndex%3]);
    group.forEach((work,offset)=>spread.appendChild(makeFrame(work,cursor+offset+1)));
    fragment.appendChild(spread);
    cursor+=count;
    spreadIndex++;
  }
  sequence.replaceChildren(fragment);
  setupReveal();
}
function setupReveal(){
  if(reduced||!("IntersectionObserver"in window))return;
  document.documentElement.classList.add("motion-ready");
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },{rootMargin:"0px 0px 12% 0px",threshold:.02});
  document.querySelectorAll(".frame").forEach(frame=>observer.observe(frame));
}
function lockScroll(){
  scrollPosition=window.scrollY;
  document.body.style.top="-"+scrollPosition+"px";
  document.body.classList.add("viewer-open");
}
function unlockScroll(){
  document.body.classList.remove("viewer-open");
  document.body.style.top="";
  window.scrollTo(0,scrollPosition);
}
function showImage(index){
  const targetIndex=modulo(index,works.length);
  activeIndex=targetIndex;
  const work=works[targetIndex];
  viewerImage.classList.add("is-switching");
  const preview=imagePath(work.file);
  viewerImage.onload=()=>viewerImage.classList.remove("is-switching");
  viewerImage.src=preview;
  if(viewerImage.complete)viewerImage.classList.remove("is-switching");
  const original=new Image();
  original.decoding="async";
  original.src=originalPath(work.file);
  const reveal=()=>{
    if(activeIndex!==targetIndex||viewer.hidden)return;
    viewerImage.onload=()=>viewerImage.classList.remove("is-switching");
    viewerImage.src=original.src;
    if(viewerImage.complete)viewerImage.classList.remove("is-switching");
  };
  if(original.decode)original.decode().then(reveal).catch(()=>{});
  else original.onload=reveal;
  status.textContent="Photograph "+(activeIndex+1)+" of "+works.length;
}
function openViewer(index,keyboard,origin){
  if(!works.length)return;
  window.clearTimeout(closeTimer);
  returnFocus=origin||document.activeElement;
  openedByKeyboard=!!keyboard;
  lockScroll();
  viewer.hidden=false;
  viewer.setAttribute("aria-hidden","false");
  viewer.classList.remove("is-closing","is-open");
  showImage(index);
  requestAnimationFrame(()=>viewer.classList.add("is-open"));
  if(openedByKeyboard)closeButton.focus({preventScroll:true});
  else if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();
}
function moveViewer(direction){
  if(viewer.hidden||activeIndex<0)return;
  showImage(activeIndex+direction);
}
function closeViewer(){
  if(viewer.hidden||viewer.classList.contains("is-closing"))return;
  viewer.classList.remove("is-open");
  viewer.classList.add("is-closing");
  viewer.setAttribute("aria-hidden","true");
  viewerImage.onload=null;
  viewerImage.removeAttribute("src");
  closeTimer=window.setTimeout(()=>{
    viewer.hidden=true;
    viewer.classList.remove("is-closing");
    unlockScroll();
    activeIndex=-1;
    if(openedByKeyboard&&returnFocus&&returnFocus.isConnected)returnFocus.focus({preventScroll:true});
    else if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();
    returnFocus=null;
    openedByKeyboard=false;
  },260);
}
function onKeydown(event){
  if(viewer.hidden)return;
  if(event.key==="Escape"){event.preventDefault();closeViewer();return}
  if(event.key==="ArrowLeft"){event.preventDefault();moveViewer(-1);return}
  if(event.key==="ArrowRight"){event.preventDefault();moveViewer(1);return}
  if(event.key==="Tab"){
    const controls=[closeButton,previousButton,nextButton];
    const first=controls[0],last=controls[controls.length-1];
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
  }
}
viewer.addEventListener("click",event=>{
  if(event.target.matches("[data-dismiss]"))closeViewer();
});
closeButton.addEventListener("click",closeViewer);
previousButton.addEventListener("click",()=>moveViewer(-1));
nextButton.addEventListener("click",()=>moveViewer(1));
viewer.addEventListener("pointerdown",event=>{
  if(event.pointerType==="touch")touchStart={x:event.clientX,y:event.clientY};
});
viewer.addEventListener("pointerup",event=>{
  if(!touchStart)return;
  const dx=event.clientX-touchStart.x,dy=event.clientY-touchStart.y;
  if(Math.abs(dx)>48&&Math.abs(dx)>Math.abs(dy)*1.15)moveViewer(dx<0?1:-1);
  else if(dy>78&&dy>Math.abs(dx)*1.15)closeViewer();
  touchStart=null;
});
viewer.addEventListener("pointercancel",()=>touchStart=null);
document.addEventListener("keydown",onKeydown);
function loadMetadata(){
  fetch("../previews/metadata.json?v=photos-root-01",{cache:"force-cache"})
    .then(response=>response.ok?response.json():{})
    .then(data=>{metadata=data||{};buildArchive()})
    .catch(()=>buildArchive());
}
loadMetadata();
})();