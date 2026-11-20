(function(){
"use strict";
const works=(window.TANIBERGEN_WORKS||[]).filter((w,i,a)=>w&&w.file&&a.findIndex(x=>x&&x.file===w.file)===i);
const field=document.querySelector("#field"),viewer=document.querySelector("#viewer"),photo=document.querySelector("#photo"),type=document.querySelector(".type-layer"),status=document.querySelector("#status");
const closeBtn=document.querySelector("#close"),prevBtn=document.querySelector("#prev"),nextBtn=document.querySelector("#next");
const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches,meta={};
let tiles=[],vw=innerWidth,vh=innerHeight,scale=1,cx=0,cy=0,vx=0,vy=0,drag=null,pointers=new Map(),pinch=null,dirty=true,active=-1,focusReturn=null,keyboardOpen=false,last=performance.now(),nearest=0;
const WW=6500,WH=5200,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),mod=(v,n)=>((v%n)+n)%n;
function rand(n){const x=Math.sin(n*91.73+17.21)*43758.5453;return x-Math.floor(x)}
function size(file){return meta[file]||{width:3,height:4}}
function build(){
 const frag=document.createDocumentFragment();
 tiles=works.map((w,i)=>{
  const d=size(w.file),ratio=d.width/d.height,angle=i*2.3999632297,radius=i===0?0:Math.sqrt(i)*248,width=i===0?430:clamp(138+rand(i+5)*108,138,246),height=width/ratio;
  const el=document.createElement("div"),img=document.createElement("img");
  el.className="tile";el.dataset.index=i;el.setAttribute("role","button");el.setAttribute("tabindex","-1");el.setAttribute("aria-label","Open photograph "+(i+1));
  img.alt="";img.decoding="async";img.draggable=false;img.width=d.width;img.height=d.height;el.appendChild(img);frag.appendChild(el);
  return{file:w.file,index:i,x:WW/2+Math.cos(angle)*radius,y:WH/2+Math.sin(angle)*radius*.82,width,height,el,img,loaded:false,color:null};
 });
 field.appendChild(frag);cx=WW/2;cy=WH/2;resize();draw();
}
function resize(){vw=innerWidth;vh=innerHeight;scale=clamp(vw/1280,.58,1.08);dirty=true}
function load(t){if(t.loaded)return;t.loaded=true;t.img.onload=()=>{t.img.classList.add("ready");sample(t);dirty=true};t.img.src="../cut-previews/"+t.file}
function sample(t){try{const c=document.createElement("canvas"),ctx=c.getContext("2d",{willReadFrequently:true});c.width=c.height=5;ctx.drawImage(t.img,0,0,5,5);const p=ctx.getImageData(0,0,5,5).data;let r=0,g=0,b=0;for(let i=0;i<p.length;i+=4){r+=p[i];g+=p[i+1];b+=p[i+2]}const n=p.length/4,k=.18;t.color="rgb("+Math.round(r/n*k)+","+Math.round(g/n*k)+","+Math.round(b/n*k)+")";if(t.index===nearest)document.body.style.setProperty("--ambient",t.color)}catch(e){}}
function draw(){
 let best=Infinity,bestIndex=0;const margin=260;
 for(const t of tiles){const dx=mod(t.x-cx+WW/2,WW)-WW/2,dy=mod(t.y-cy+WH/2,WH)-WH/2,x=vw/2+dx*scale-t.width*scale/2,y=vh/2+dy*scale-t.height*scale/2,w=t.width*scale,h=t.height*scale;
  t.el.style.width=w+"px";t.el.style.height=h+"px";t.el.style.transform="translate3d("+x.toFixed(1)+"px,"+y.toFixed(1)+"px,0)";
  const dist=Math.hypot(dx,dy);if(dist<best){best=dist;bestIndex=t.index}
  if(x<vw+margin&&x+w>-margin&&y<vh+margin&&y+h>-margin)load(t);
  t.el.style.opacity=String(clamp(1-dist/5700,.48,1));
 }
 if(bestIndex!==nearest){nearest=bestIndex;const t=tiles[nearest];if(t.color)document.body.style.setProperty("--ambient",t.color)}
 type.style.transform="translate3d("+((cx-WW/2)*-.025*scale).toFixed(1)+"px,"+((cy-WH/2)*-.022*scale).toFixed(1)+"px,0)";
}
function tick(now){const dt=Math.min((now-last)/1000,.05);last=now;if(!drag&&!pinch&&!reduced&&(Math.abs(vx)>3||Math.abs(vy)>3)){cx-=vx*dt/scale;cy-=vy*dt/scale;const f=Math.exp(-dt*3.25);vx*=f;vy*=f;dirty=true}if(dirty){draw();dirty=false}requestAnimationFrame(tick)}
function show(t){photo.classList.add("switching");const preview="../cut-previews/"+t.file,original="../"+t.file;const swap=src=>{photo.onload=()=>photo.classList.remove("switching");photo.src=src;if(photo.complete)photo.classList.remove("switching")};swap(preview);const full=new Image();full.decoding="async";full.src=original;const reveal=()=>{if(active===t.index&&!viewer.hidden)swap(original)};if(full.decode)full.decode().then(reveal).catch(()=>{});else full.onload=reveal}
function open(i,keyboard){if(!tiles.length)return;active=mod(i,tiles.length);focusReturn=document.activeElement;keyboardOpen=!!keyboard;const t=tiles[active];load(t);viewer.hidden=false;viewer.classList.remove("open");void viewer.offsetWidth;viewer.classList.add("open");show(t);status.textContent="Photograph "+(active+1)+" of "+tiles.length;closeBtn.focus({preventScroll:true})}
function move(dir){if(viewer.hidden)return;active=mod(active+dir,tiles.length);const t=tiles[active];const dx=mod(t.x-cx+WW/2,WW)-WW/2,dy=mod(t.y-cy+WH/2,WH)-WH/2;cx+=dx;cy+=dy;dirty=true;load(t);show(t);status.textContent="Photograph "+(active+1)+" of "+tiles.length}
function close(){if(viewer.hidden)return;viewer.classList.remove("open");photo.onload=null;photo.removeAttribute("src");photo.classList.remove("switching");const done=()=>{if(!viewer.classList.contains("open"))viewer.hidden=true};const onEnd=e=>{if(e.target===viewer){viewer.removeEventListener("transitionend",onEnd);done()}};viewer.addEventListener("transitionend",onEnd);setTimeout(done,280);if(keyboardOpen&&focusReturn&&focusReturn.focus)focusReturn.focus({preventScroll:true});else if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();focusReturn=null;active=-1}
field.addEventListener("pointerdown",e=>{field.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===2){const p=[...pointers.values()];pinch={distance:Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y),scale};drag=null;return}const tile=e.target.closest(".tile");drag={id:e.pointerId,lastX:e.clientX,lastY:e.clientY,lastT:e.timeStamp,moved:0,index:tile?Number(tile.dataset.index):-1};vx=vy=0});
field.addEventListener("pointermove",e=>{if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size>1){const p=[...pointers.values()],d=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);if(pinch&&pinch.distance)scale=clamp(pinch.scale*d/pinch.distance,.42,1.65);dirty=true;return}if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.lastX,dy=e.clientY-drag.lastY,dt=Math.max(1,e.timeStamp-drag.lastT);drag.moved+=Math.abs(dx)+Math.abs(dy);cx-=dx/scale;cy-=dy/scale;vx=dx/dt*500+vx*.5;vy=dy/dt*500+vy*.5;drag.lastX=e.clientX;drag.lastY=e.clientY;drag.lastT=e.timeStamp;dirty=true});
function end(e){if(!pointers.has(e.pointerId))return;pointers.delete(e.pointerId);if(pinch){if(pointers.size<2)pinch=null;drag=null;return}if(drag&&drag.id===e.pointerId){const d=drag;drag=null;if(d.moved<9&&d.index>=0){open(d.index,false);if(document.activeElement&&document.activeElement.blur)document.activeElement.blur()}}}
field.addEventListener("pointerup",end);field.addEventListener("pointercancel",end);
field.addEventListener("wheel",e=>{e.preventDefault();if(e.ctrlKey)scale=clamp(scale*Math.exp(-e.deltaY*.001),.42,1.65);else{cx+=e.deltaX/scale;cy+=e.deltaY/scale}dirty=true},{passive:false});
closeBtn.addEventListener("click",close);prevBtn.addEventListener("click",()=>move(-1));nextBtn.addEventListener("click",()=>move(1));viewer.addEventListener("click",e=>{if(e.target===viewer)close()});
let touch=null;viewer.addEventListener("touchstart",e=>{if(e.touches.length===1)touch={x:e.touches[0].clientX,y:e.touches[0].clientY}},{passive:true});viewer.addEventListener("touchend",e=>{if(!touch||!e.changedTouches.length)return;const dx=e.changedTouches[0].clientX-touch.x,dy=e.changedTouches[0].clientY-touch.y;if(Math.abs(dx)>42&&Math.abs(dx)>Math.abs(dy)*1.15)move(dx<0?1:-1);else if(dy>78&&dy>Math.abs(dx)*1.15)close();touch=null},{passive:true});
document.addEventListener("keydown",e=>{if(!viewer.hidden){if(e.key==="Escape")close();else if(e.key==="ArrowRight")move(1);else if(e.key==="ArrowLeft")move(-1);return}if(e.key==="ArrowRight"){cx+=420/scale;dirty=true}else if(e.key==="ArrowLeft"){cx-=420/scale;dirty=true}else if(e.key==="ArrowUp"){cy-=420/scale;dirty=true}else if(e.key==="ArrowDown"){cy+=420/scale;dirty=true}else if(e.key==="Enter"&&document.activeElement===document.body)open(nearest,true)});
addEventListener("resize",resize);fetch("../previews/metadata.json?v=photos-root-01",{cache:"force-cache"}).then(r=>r.ok?r.json():{}).then(data=>{Object.assign(meta,data||{});build()}).catch(build);requestAnimationFrame(tick);
})();