(function(){
"use strict";
const works=(window.TANIBERGEN_WORKS||[]).filter((w,i,a)=>w&&w.file&&a.findIndex(x=>x&&x.file===w.file)===i);
const field=document.querySelector("#field"),viewer=document.querySelector("#viewer"),viewImage=document.querySelector("#view-image"),typeBg=document.querySelector("#type-bg"),counter=document.querySelector("#sr-status");
const closeBtn=document.querySelector("#dismiss"),prevBtn=document.querySelector("#previous"),nextBtn=document.querySelector("#next");
const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
const meta={};let tiles=[],vw=innerWidth,vh=innerHeight,scale=1,cx=0,cy=0,vx=0,vy=0,drag=null,pointers=new Map(),pinch=null,dirty=true,nearest=0,active=-1,returnFocus=null,closeByKeyboard=false,lastTime=performance.now(),currentColor="#090909",colorTimer=0;
const WORLD_W=6200,WORLD_H=5200,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),mod=(v,n)=>((v%n)+n)%n;
function seeded(n){let x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)}
function dims(file){return meta[file]||{width:3,height:4}}
function makeTiles(){
 const frag=document.createDocumentFragment();
 tiles=works.map((w,i)=>{
  const d=dims(w.file),ratio=d.width/d.height;
  const angle=i*2.399963229728653,radius=i===0?0:Math.sqrt(i)*252;
  const width=i===0?420:clamp(132+seeded(i+7)*116,132,248);
  const height=width/ratio;
  const item={file:w.file,index:i,x:WORLD_W/2+Math.cos(angle)*radius,y:WORLD_H/2+Math.sin(angle)*radius*.84,width,height,el:document.createElement("div"),img:document.createElement("img"),loaded:false};
  item.el.className="tile";item.el.setAttribute("role","button");item.el.setAttribute("tabindex","-1");item.el.setAttribute("aria-label","Open photograph "+String(i+1).padStart(3,"0"));item.el.dataset.index=i;
  item.img.alt="";item.img.decoding="async";item.img.draggable=false;item.img.width=d.width;item.img.height=d.height;
  item.el.appendChild(item.img);frag.appendChild(item.el);return item;
 });
 field.appendChild(frag);cx=WORLD_W/2;cy=WORLD_H/2;nearest=0;resize();draw();
}
function resize(){vw=innerWidth;vh=innerHeight;scale=clamp(vw/1280,.62,1.08);dirty=true}
function sampleColor(img,item){
 try{const c=document.createElement("canvas"),ctx=c.getContext("2d",{willReadFrequently:true});c.width=8;c.height=8;ctx.drawImage(img,0,0,8,8);const p=ctx.getImageData(0,0,8,8).data;let r=0,g=0,b=0;for(let i=0;i<p.length;i+=4){r+=p[i];g+=p[i+1];b+=p[i+2]}const n=p.length/4;item.color="rgb("+Math.round(r/n)+","+Math.round(g/n)+","+Math.round(b/n)+")";if(item.index===nearest)document.body.style.setProperty("--ambient",item.color)}catch(e){item.color="#090909"}
}
function load(item){
 if(item.loaded)return;item.loaded=true;item.img.onload=()=>{item.img.classList.add("ready");sampleColor(item.img,item);dirty=true};item.img.src="../cut-previews/"+item.file;
}
function draw(){
 const margin=260;let best=Infinity,bestItem=0;
 for(const t of tiles){
  const dx=mod(t.x-cx+WORLD_W/2,WORLD_W)-WORLD_W/2,dy=mod(t.y-cy+WORLD_H/2,WORLD_H)-WORLD_H/2;
  const x=vw/2+dx*scale-t.width*scale/2,y=vh/2+dy*scale-t.height*scale/2,w=t.width*scale,h=t.height*scale;
  t.el.style.width=w+"px";t.el.style.height=h+"px";t.el.style.transform="translate3d("+x.toFixed(1)+"px,"+y.toFixed(1)+"px,0)";
  const dist=Math.hypot(dx,dy);if(dist<best){best=dist;bestItem=t.index}
  if(x<vw+margin&&x+w>-margin&&y<vh+margin&&y+h>-margin)load(t);
  t.el.style.opacity=String(clamp(1-dist/6000,.5,1));
 }
 if(bestItem!==nearest){nearest=bestItem;const t=tiles[nearest];if(t.color){currentColor=t.color;document.body.style.setProperty("--ambient",currentColor)}}
 if(typeBg){const drift=document.body.dataset.mode==="type"?.075:.018;typeBg.style.transform="translate3d("+((cx-WORLD_W/2)*-drift*scale).toFixed(1)+"px,"+((cy-WORLD_H/2)*-drift*drift*scale*18).toFixed(1)+"px,0)";}
}
function frame(now){
 const dt=Math.min((now-lastTime)/1000,.05);lastTime=now;
 if(!drag&&!pinch&&!reduced&&(Math.abs(vx)>3||Math.abs(vy)>3)){cx-=vx*dt/scale;cy-=vy*dt/scale;const f=Math.exp(-dt*3.1);vx*=f;vy*=f;dirty=true}
 if(dirty){draw();dirty=false}
 requestAnimationFrame(frame);
}
function open(index,keyboard){
 if(!tiles.length)return;
 active=mod(index,tiles.length);returnFocus=document.activeElement;closeByKeyboard=!!keyboard;
 const t=tiles[active];load(t);viewer.hidden=false;viewer.classList.remove("open");void viewer.offsetWidth;viewer.classList.add("open");
 showImage(t,true);counter.textContent="Photograph "+(active+1)+" of "+tiles.length;
 closeBtn.focus({preventScroll:true});
}
function showImage(t,first){
 const preview="../cut-previews/"+t.file,original="../"+t.file;
 viewImage.classList.add("switching");
 const show=(src)=>{viewImage.onload=()=>{viewImage.classList.remove("switching")};viewImage.src=src;if(viewImage.complete)viewImage.classList.remove("switching")};
 show(preview);
 const full=new Image();full.decoding="async";full.src=original;
 const reveal=()=>{if(active===t.index&&!viewer.hidden)show(original)};
 if(full.decode)full.decode().then(reveal).catch(()=>{});else full.onload=reveal;
}
function move(delta){
 if(viewer.hidden)return;active=mod(active+delta,tiles.length);const t=tiles[active];
 const dx=mod(t.x-cx+WORLD_W/2,WORLD_W)-WORLD_W/2,dy=mod(t.y-cy+WORLD_H/2,WORLD_H)-WORLD_H/2;
 cx+=dx;cy+=dy;dirty=true;load(t);showImage(t,false);counter.textContent="Photograph "+(active+1)+" of "+tiles.length;
}
function close(){
 if(viewer.hidden)return;
 viewer.classList.remove("open");viewer.hidden=true;viewImage.onload=null;viewImage.removeAttribute("src");viewImage.classList.remove("switching");
 if(closeByKeyboard&&returnFocus&&returnFocus.focus)returnFocus.focus({preventScroll:true});
 else if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();
 returnFocus=null;active=-1;
}
field.addEventListener("pointerdown",e=>{
 if(viewer.hidden===false)return;
 field.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(pointers.size===2){const p=[...pointers.values()];pinch={distance:Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y),scale};drag=null;return}
 const tile=e.target.closest(".tile");drag={id:e.pointerId,x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,lastT:e.timeStamp,moved:0,tile:tile?Number(tile.dataset.index):-1};vx=vy=0;
});
field.addEventListener("pointermove",e=>{
 if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(pointers.size>=2){const p=[...pointers.values()];const d=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);if(pinch&&pinch.distance>0)scale=clamp(pinch.scale*d/pinch.distance,.42,1.65);dirty=true;return}
 if(!drag||drag.id!==e.pointerId)return;
 const dx=e.clientX-drag.lastX,dy=e.clientY-drag.lastY,dt=Math.max(1,e.timeStamp-drag.lastT);
 drag.moved+=Math.abs(dx)+Math.abs(dy);cx-=dx/scale;cy-=dy/scale;
 vx=dx/dt*1000*.52+vx*.48;vy=dy/dt*1000*.52+vy*.48;
 drag.lastX=e.clientX;drag.lastY=e.clientY;drag.lastT=e.timeStamp;dirty=true;
});
function endPointer(e){
 if(!pointers.has(e.pointerId))return;
 pointers.delete(e.pointerId);
 if(pinch){if(pointers.size<2)pinch=null;drag=null;return}
 if(drag&&drag.id===e.pointerId){const d=drag;drag=null;if(d.moved<9&&d.tile>=0){open(d.tile,false);if(document.activeElement&&document.activeElement.blur)document.activeElement.blur()}else if(e.timeStamp-d.lastT>90){vx=vy=0}}
}
field.addEventListener("pointerup",endPointer);field.addEventListener("pointercancel",endPointer);
field.addEventListener("wheel",e=>{e.preventDefault();if(e.ctrlKey){scale=clamp(scale*Math.exp(-e.deltaY*.001),.42,1.65)}else{cx+=e.deltaX/scale;cy+=e.deltaY/scale}dirty=true},{passive:false});
closeBtn.addEventListener("click",close);prevBtn.addEventListener("click",()=>move(-1));nextBtn.addEventListener("click",()=>move(1));
viewer.addEventListener("click",e=>{if(e.target===viewer)close()});
let touch=null;
viewer.addEventListener("touchstart",e=>{if(e.touches.length===1)touch={x:e.touches[0].clientX,y:e.touches[0].clientY}},{passive:true});
viewer.addEventListener("touchend",e=>{if(!touch||!e.changedTouches.length)return;const dx=e.changedTouches[0].clientX-touch.x,dy=e.changedTouches[0].clientY-touch.y;if(Math.abs(dx)>44&&Math.abs(dx)>Math.abs(dy)*1.1)move(dx<0?1:-1);else if(dy>85&&dy>Math.abs(dx)*1.2)close();touch=null},{passive:true});
document.addEventListener("keydown",e=>{
 if(!viewer.hidden){if(e.key==="Escape")close();else if(e.key==="ArrowRight")move(1);else if(e.key==="ArrowLeft")move(-1);return}
 if(e.key==="ArrowRight"){cx+=420/scale;dirty=true}else if(e.key==="ArrowLeft"){cx-=420/scale;dirty=true}else if(e.key==="ArrowUp"){cy-=420/scale;dirty=true}else if(e.key==="ArrowDown"){cy+=420/scale;dirty=true}else if(e.key==="Enter"&&document.activeElement===document.body)open(nearest,true);
});
addEventListener("resize",resize);
fetch("../previews/metadata.json",{cache:"force-cache"}).then(r=>r.ok?r.json():{}).then(data=>{Object.assign(meta,data||{});makeTiles()}).catch(makeTiles);
requestAnimationFrame(frame);
})();