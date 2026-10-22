const wishArea=document.getElementById('wishes'),wishAnnouncement=document.getElementById('wish-announcement');
let wishOpenedAt=null,wishesVisible=false,selectedWish=-1;
function wrapWish(ctx,value,width){const lines=[];let line='';for(const ch of Array.from(value)){if(ch==='\n'){lines.push(line);line='';continue;}if(line&&ctx.measureText(line+ch).width>width){lines.push(line);line=ch;}else line+=ch;}lines.push(line);return lines;}
function wishTexture(wish){return texture(1600,205,(x,w,h)=>{
  x.fillStyle=cream;x.beginPath();x.moveTo(5,5);x.lineTo(w-5,5);x.lineTo(w-40,h/2);x.lineTo(w-5,h-5);x.lineTo(5,h-5);x.lineTo(40,h/2);x.closePath();x.fill();
  x.fillStyle=gold;x.strokeStyle=ink;x.lineWidth=3;x.beginPath();x.moveTo(23,17);x.lineTo(w-23,17);x.lineTo(w-57,h/2);x.lineTo(w-23,h-17);x.lineTo(23,h-17);x.lineTo(57,h/2);x.closePath();x.fill();x.stroke();
  x.setLineDash([9,7]);x.lineWidth=2;x.beginPath();x.moveTo(95,29);x.lineTo(w-95,29);x.moveTo(95,h-29);x.lineTo(w-95,h-29);x.stroke();x.setLineDash([]);
  const speaker=wish.from&&wish.to?wish.from+' → '+wish.to: wish.from||wish.to||wish.label;
  text(x,speaker,w/2,59,'bold 29px "Trebuchet MS",sans-serif',ink,1300);
  let size=90;x.font='bold '+size+'px "Trebuchet MS",sans-serif';let lines=wrapWish(x,wish.text,1370);
  if(lines.length>1){size=48;do{x.font='bold '+size+'px "Trebuchet MS",sans-serif';lines=wrapWish(x,wish.text,1370);if(lines.length<=2||size<=16)break;size-=2;}while(true);}
  lines.forEach((line,i)=>text(x,line,w/2,130+(i-(lines.length-1)/2)*size*1.1,'bold '+size+'px "Trebuchet MS",sans-serif',ink,1370));grain(x,w,h);
});}
const wishBoard=surface(6.25,.8,wishTexture({label:'',text:''}));wishBoard.position.set(0,4.45,.065);wishBoard.castShadow=false;wishBoard.visible=false;lid.add(wishBoard);
const wishButtons=CONFIG.wishes.map((wish,index)=>{const b=document.createElement('button');b.type='button';b.className='wish-button';b.textContent=wish.label;b.setAttribute('aria-pressed','false');b.addEventListener('click',()=>{
  if(!wishesVisible)return;
  selectedWish=index;wishButtons.forEach((item,i)=>item.setAttribute('aria-pressed',String(i===index)));
  const previous=wishBoard.material.map;wishBoard.material.map=wishTexture(wish);wishBoard.material.needsUpdate=true;previous.dispose();wishBoard.visible=true;wishAnnouncement.textContent=[wish.from&&wish.to?wish.from+' → '+wish.to:wish.from||wish.to||'',wish.text].filter(Boolean).join('：');
});wishArea.append(b);return b;});
function resetWishes(){wishOpenedAt=null;wishesVisible=false;selectedWish=-1;wishArea.classList.remove('is-visible');wishArea.inert=true;wishArea.setAttribute('aria-hidden','true');delete wishArea.dataset.openedAt;delete wishArea.dataset.revealedAt;wishBoard.visible=false;wishAnnouncement.textContent='';wishButtons.forEach(b=>b.setAttribute('aria-pressed','false'));}
function updateWishes(time){
  if(ready&&target>=.999&&progress>=.995){
    if(wishOpenedAt===null){wishOpenedAt=time;wishArea.dataset.openedAt=String(time);}
    if(!wishesVisible&&time-wishOpenedAt>=1000){wishesVisible=true;wishArea.classList.add('is-visible');wishArea.inert=false;wishArea.setAttribute('aria-hidden','false');wishArea.dataset.revealedAt=String(time);}
  }else if(wishOpenedAt!==null||wishesVisible)resetWishes();
}
