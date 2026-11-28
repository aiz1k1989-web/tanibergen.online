(function(){
"use strict";
const root=document.getElementById("entries");
function paragraph(text){const p=document.createElement("p");p.textContent=text;return p;}
function render(posts){
 root.replaceChildren();
 if(!posts.length){const p=document.createElement("p");p.className="empty";p.textContent="No entries yet.";root.appendChild(p);return;}
 posts.slice().sort((a,b)=>b.date.localeCompare(a.date)).forEach((post,index)=>{
  const article=document.createElement("article");article.className="entry";
  const aside=document.createElement("div");aside.className="entry-aside";
  const date=document.createElement("time");date.className="entry-meta";date.dateTime=post.date;date.textContent=post.displayDate;
  const location=document.createElement("span");location.className="entry-location";location.textContent=post.location;
  if(post.displayTime){const time=document.createElement("time");time.className="entry-meta";time.dateTime=post.date+"T10:03:46+07:00";time.textContent=post.displayTime;aside.appendChild(time);}
  aside.append(date,location);
  if(post.mood){const mood=document.createElement("span");mood.className="entry-mood";mood.textContent="MOOD / "+post.mood;aside.appendChild(mood);}
  const number=document.createElement("span");number.className="entry-number";number.textContent=String(posts.length-index).padStart(2,"0");
  aside.appendChild(number);
  const content=document.createElement("div");content.className="entry-content";
  const title=document.createElement("h2");title.textContent=post.title;
  const body=document.createElement("div");body.className="entry-body";
  post.paragraphs.forEach(text=>body.appendChild(paragraph(text)));
  content.append(title,body);
  if(Array.isArray(post.images)&&post.images.length){const images=document.createElement("div");images.className="entry-images";post.images.forEach(src=>{const img=document.createElement("img");img.src=src;img.loading="lazy";img.alt="";images.appendChild(img);});content.appendChild(images);}
  article.append(aside,content);root.appendChild(article);
 });
}
fetch("posts.json?v=2").then(response=>{if(!response.ok)throw new Error("Posts unavailable");return response.json();}).then(render).catch(()=>{root.textContent="Entries could not be loaded.";});
})();