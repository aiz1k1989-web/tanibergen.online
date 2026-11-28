(function(){
"use strict";
const root=document.getElementById("entries");
function node(tag,className,text){
 const el=document.createElement(tag);
 if(className)el.className=className;
 if(text!==undefined)el.textContent=text;
 return el;
}
function paragraph(text){return node("p","",text);}
function render(posts){
 root.replaceChildren();
 const unique=[];
 const seen=new Set();
 posts.slice().sort((a,b)=>(b.publishedAt||b.date).localeCompare(a.publishedAt||a.date)).forEach(post=>{
  const key=(post.date||"")+"|"+(post.title||"");
  if(!seen.has(key)){seen.add(key);unique.push(post);}
 });
 if(!unique.length){root.appendChild(node("p","empty","No entries yet."));return;}
 unique.forEach(post=>{
  const article=node("article","entry");
  const card=node("div","entry-card");
  const author=node("header","post-author");
  const avatar=node("img","author-avatar");
  avatar.src=post.avatar||"../previews/photos/me/IMG_9519.webp";
  avatar.alt="";
  avatar.loading="eager";
  avatar.decoding="async";
  const identity=node("div","author-identity");
  identity.appendChild(node("strong","author-name",post.author||"Aizat Tanibergen"));
  identity.appendChild(node("span","author-label","Journal"));
  author.append(avatar,identity);
  const meta=node("div","post-meta");
  const date=node("time","entry-date",post.displayDate||post.date);
  date.dateTime=post.date;
  const time=node("time","entry-time",post.displayTime||"");
  if(post.publishedAt)time.dateTime=post.publishedAt;
  const location=node("span","entry-location",post.location||"");
  meta.append(date,time,location);
  const content=node("div","entry-content");
  content.appendChild(node("h2","",post.title||""));
  const body=node("div","entry-body");
  (Array.isArray(post.paragraphs)?post.paragraphs:[]).forEach(text=>body.appendChild(paragraph(text)));
  content.appendChild(body);
  if(Array.isArray(post.images)&&post.images.length){
   const images=node("div","entry-images");
   post.images.forEach(src=>{const img=node("img");img.src=src;img.loading="lazy";img.alt="";images.appendChild(img);});
   content.appendChild(images);
  }
  card.append(author,meta,content);
  article.appendChild(card);
  root.appendChild(article);
 });
}
fetch("posts.json?v=3",{cache:"no-store"}).then(response=>{
 if(!response.ok)throw new Error("Posts unavailable");
 return response.json();
}).then(render).catch(()=>{root.textContent="Entries could not be loaded.";});
})();
