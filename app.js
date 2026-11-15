(() => {
 const body=document.body, root=document.getElementById('works'), switcher=document.getElementById('modeSwitch');
 const isIndex=new URLSearchParams(location.search).get('view')==='index';
 if(isIndex){body.classList.add('index-view');document.querySelector('meta[name="theme-color"]').content='#e9e7e1';switcher.innerHTML='VIEW: <b>THE INDEX</b> <span>↗</span>';}
 else switcher.innerHTML='VIEW: <b>AFTER HOURS</b> <span>↗</span>';
 switcher.addEventListener('click',()=>{location.href=isIndex?'./':'?view=index';});
 const works=window.TANIBERGEN_WORKS||[];
 document.getElementById('workCount').textContent=String(works.length).padStart(2,'0')+' FRAMES';
 works.forEach((work,i)=>{
   const card=document.createElement('article');card.className='work-card';
   const media=document.createElement('div');media.className='media is-empty';media.dataset.empty='FRAME '+String(i+1).padStart(2,'0');
   const img=document.createElement('img');img.src=work.file;img.alt=work.title;img.loading=i<2?'eager':'lazy';img.decoding='async';
   img.addEventListener('load',()=>media.classList.remove('is-empty'));
   img.addEventListener('error',()=>img.remove());
   media.appendChild(img);
   const info=document.createElement('div');info.className='work-info';
   const name=document.createElement('span');name.textContent=work.title;
   const meta=document.createElement('span');meta.textContent=work.category+' / '+work.year;
   info.append(name,meta);card.append(media,info);
   card.addEventListener('click',()=>{if(!img.complete||!img.naturalWidth)return;const box=document.getElementById('lightbox');box.querySelector('img').src=img.src;box.querySelector('.lightbox-caption').textContent=work.title+' / '+work.category+' / '+work.year;box.classList.add('open');box.setAttribute('aria-hidden','false');});
   root.appendChild(card);
 });
 const box=document.getElementById('lightbox');
 const close=()=>{box.classList.remove('open');box.setAttribute('aria-hidden','true');box.querySelector('img').src='';};
 box.querySelector('.lightbox-close').addEventListener('click',close);box.addEventListener('click',e=>{if(e.target===box)close();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
})();