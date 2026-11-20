(function(){
"use strict";
const source=window.TANIBERGEN_WORKS||[];
const works=source.filter((w,i)=>w&&w.file&&source.findIndex(x=>x&&x.file===w.file)===i);
const field=document.querySelector("#field"),viewer=document.querySelector("#viewer"),viewImage=document.querySelector("#view-image");
const closeBtn=document.querySelector("#dismiss"),prevBtn=document.querySelector("#previous"),nextBtn=document.querySelector("#next");
const typeMain=document.querySelector(".type-main"),typeSub=document.querySelector(".type-sub");
const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
const meta={};let tiles=[],vw=innerWidth,vh=innerHeight,scale=1,cx=0,cy=0,vx=0,vy=0,drag=null,pointers=new Map(),pinch=null,dirty=true,nearest=0,active=-1,returnFocus=null,keyboardOpen=false,lastTime=performance.now();
const WORLD_W=6500,WORLD_H=5400,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),mod=(v,n)=>((v%n)+n)%n;
function seeded(n){const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)}
function dimensions(file){return meta[file]||{width:3,height:4}}
function makeTiles(){
 const frag=document.createDocumentFragment();
 tiles=works.map((w,i)=>{
  const d=dimensions(w.file),ratio=d.width/d.height,angle=i*2.399963229728653;
  const radius=i===0?0:Math.sqrt(i)*268;
  const width=i===0?460:clamp(142+seeded(i+19)*130,142,272),height=width/ratio;
  const item={file:w.file,index:i,x:WORLD_W/2+Math.cos(angle)*radius,y:WORLD_H/2+Math.sin(angle)*radius*.82,width,height,el:document.createElement("button"),img:document.createElement("img"),loaded:false};
  item.el.type="button";item.el.className="tile";item.el.setAttribute("aria-label","Open photograph "+String(i+1).padStart(3,"0"));item.el.dataset.index=i;item.el.tabIndex=-1;
  item.img.alt="";item.img.decoding="async";item.img.draggable=false;item.img.width=d.width;item.img.height=d.height;
  item.el.appendChild(item.img);frag.appendChild(item.el);return item;
 });
 field.appendChild(frag);cx=WORLD_W/2;cy=WORLD_H/2;resize();draw();
}
function resize(){vw=innerWidth;vh=innerHeight;scale=clamp(vw/1360,.56,1.05);dirty=true}
function tint(img,item){
 try{const c=document.createElement("canvas"),ctx=c.getContext("2d",{willReadFrequently:true});c.width=6;c.height=6;ctx.drawImage(img,0,0,6,6);const p=ctx.getImageData(0,0,6,6).data;let r=0,g=0,b=0;for(let i=0;i<p.length;i+=4){r+=p[i];g+=p[i+1];b+=p[i+2]}const n=p.length/4;item.color="rgb("+Math.round(r/n*.17)+","+Math.round(g/n*.17)+","+Math.round(b/n*.17)+")";if(item.index===nearest)document.body.style.setProperty("--ambient",item.color)}catch(e){item.color="#080808"}
}
function load(item){if(item.loaded)return;item.loaded=true;item.img.onload=()=>{item.img.classList.add("ready");tint(item.img,item);dirty=true};item.img.src="../cut-previews/"+item.file}
function draw(){
 let best=Infinity,bestIndex=0;const margin=300;
 for(const t of tiles){
  const dx=mod(t.x-cx+WORLD_W/2,WORLD_W)-WORLD_W/2,dy=mod(t.y-cy+WORLD_H/2,WORLD_H)-WORLD_H/2;
  const x=vw/2+dx*scale-t.width*scale/2,y=vh/2+dy*scale-t.height*scale/2,w=t.width*scale,h=t.height*scale;
  t.el.style.width=w+"px";t.el.style.height=h+"px";t.el.style.transform="translate3d("+x.toFixed(1)+"px,"+y.toFixed(1)+"px,0)";
  const dist=Math.hypot(dx,dy);if(dist<best){best=dist;bestIndex=t.index}
  if(x<vw+margin&&x+w>-margin&&y<vh+margin&&y+h>-margin)load(t);
  t.el.style.opacity=String(clamp(1-dist/7200,.54,1));
 }
 if(bestIndex!==nearest){nearest=bestIndex;const t=tiles[nearest];if(t.color)document.body.style.setProperty("--ambient",t.color)}
 const px=(cx-WORLD_W/2),py=(cy-WORLD_H/2);
 typeMain.style.setProperty("--tx",(px*-.025*scale).toFixed(1)+"px");typeMain.style.setProperty("--ty",(py*-.018*scale).toFixed(1)+"px");
 typeSub.style.setProperty("--sx",(px*.018*scale).toFixed(1)+"px");typeSub.style.setProperty("--sy",(py*.012*scale).toFixed(1)+"px");
}
function frame(now){const dt=Math.min((now-lastTime)/1000,.05);lastTime=now;if(!drag&&!pinch&&!reduced&&(Math.abs(vx)>3||Math.abs(vy)>3)){cx-=vx*dt/scale;cy-=vy*dt/scale;const f=Math.exp(-dt*3.25);vx*=f;vy*=f;dirty=true}if(dirty){draw();dirty=false}requestAnimationFrame(frame)}
function open(index,fromKeyboard){
 if(!tiles.length)return;active=mod(index,tiles.length);returnFocus=tiles[active].el;keyboardOpen=!!fromKeyboard;
 const item=tiles[active];load(item);viewer.hidden=false;viewer.classList.remove("open");void viewer.offsetWidth;viewer.classList.add("open");show(item);
 if(fromKeyboard)closeBtn.focus({preventScroll:true});
}
function show(item){
 viewImage.classList.add("switching");viewImage.onload=()=>viewImage.classList.remove("switching");viewImage.src="../cut-previews/"+item.file;
 const original=new Image();original.decoding="async";original.src="../"+item.file;
 const useOriginal=()=>{if(active===item.index&&!viewer.hidden){viewImage.onload=()=>viewImage.classList.remove("switching");viewImage.src=original.src}};
 if(original.decode)original.decode().then(useOriginal).catch(()=>{});else original.onload=useOriginal;
}
function navigate(delta){
 if(viewer.hidden)return;active=mod(active+delta,tiles.length);const item=tiles[active];
 const dx=mod(item.x-cx+WORLD_W/2,WORLD_W)-WORLD_W/2,dy=mod(item.y-cy+WORLD_H/2,WORLD_H)-WORLD_H/2;
 cx+=dx;cy+=dy;dirty=true;load(item);show(item);
}
function close(){
 if(viewer.hidden)return;viewer.classList.remove("open");viewImage.onload=null;viewImage.removeAttribute("src");viewImage.classList.remove("switching");
 const finish=()=>{if(!viewer.classList.contains("open"))viewer.hidden=true};
 viewer.addEventListener("transitionend",function done(e){if(e.target===viewer){viewer.removeEventListener("transitionend",done);finish()}});
 setTimeout(finish,300);
 if(keyboardOpen&&returnFocus){returnFocus.focus({preventScroll:true})}else if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();
 active=-1;returnFocus=null;keyboardOpen=false;
}
field.addEventListener("pointerdown",e=>{
 field.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(pointers.size===2){const p=[...pointers.values()];pinch={distance:Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y),scale};drag=null;return}
 const tile=e.target.closest(".tile");drag={id:e.pointerId,x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,lastT:e.timeStamp,moved:0,tile:tile?Number(tile.dataset.index):-1};vx=vy=0;
});
field.addEventListener("pointermove",e=>{
 if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(pointers.size>=2){const p=[...pointers.values()],d=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);if(pinch&&pinch.distance>0)scale=clamp(pinch.scale*d/pinch.distance,.4,1.75);dirty=true;return}
 if(!drag||drag.id!==e.pointerId)return;
 const dx=e.clientX-drag.lastX,dy=e.clientY-drag.lastY,dt=Math.max(1,e.timeStamp-drag.lastT);
 drag.moved+=Math.abs(dx)+Math.abs(dy);cx-=dx/scale;cy-=dy/scale;vx=dx/dt*1000*.5+vx*.5;vy=dy/dt*1000*.5+vy*.5;
 drag.lastX=e.clientX;drag.lastY=e.clientY;drag.lastT=e.timeStamp;dirty=true;
});
function endPointer(e){
 if(!pointers.has(e.pointerId))return;pointers.delete(e.pointerId);
 if(pinch){if(pointers.size<2)pinch=null;drag=null;return}
 if(drag&&drag.id===e.pointerId){const d=drag;drag=null;if(d.moved<9&&d.tile>=0){open(d.tile,false);if(document.activeElement&&document.activeElement.blur)document.activeElement.blur()}else if(e.timeStamp-d.lastT>90)vx=vy=0}
}
field.addEventListener("pointerup",endPointer);field.addEventListener("pointercancel",endPointer);
field.addEventListener("wheel",e=>{e.preventDefault();if(e.ctrlKey)scale=clamp(scale*Math.exp(-e.deltaY*.001),.4,1.75);else{cx+=e.deltaX/scale;cy+=e.deltaY/scale}dirty=true},{passive:false});
closeBtn.addEventListener("click",close);prevBtn.addEventListener("click",()=>navigate(-1));nextBtn.addEventListener("click",()=>navigate(1));
viewer.addEventListener("click",e=>{if(e.target===viewer)close()});
let touch=null;viewer.addEventListener("touchstart",e=>{if(e.touches.length===1)touch={x:e.touches[0].clientX,y:e.touches[0].clientY}},{passive:true});
viewer.addEventListener("touchend",e=>{if(!touch||!e.changedTouches.length)return;const dx=e.changedTouches[0].clientX-touch.x,dy=e.changedTouches[0].clientY-touch.y;if(Math.abs(dx)>46&&Math.abs(dx)>Math.abs(dy)*1.1)navigate(dx<0?1:-1);else if(dy>90&&dy>Math.abs(dx)*1.2)close();touch=null},{passive:true});
document.addEventListener("keydown",e=>{
 if(!viewer.hidden){if(e.key==="Escape")close();else if(e.key==="ArrowRight")navigate(1);else if(e.key==="ArrowLeft")navigate(-1);return}
 if(e.key==="ArrowRight"){cx+=420/scale;dirty=true}else if(e.key==="ArrowLeft"){cx-=420/scale;dirty=true}else if(e.key==="ArrowUp"){cy-=420/scale;dirty=true}else if(e.key==="ArrowDown"){cy+=420/scale;dirty=true}else if(e.key==="Enter"&&document.activeElement===document.body)open(nearest,true);
});
addEventListener("resize",resize);
fetch("../previews/metadata.json",{cache:"force-cache"}).then(r=>r.ok?r.json():{}).then(data=>{Object.assign(meta,data||{});makeTiles()}).catch(makeTiles);
requestAnimationFrame(frame);
})();