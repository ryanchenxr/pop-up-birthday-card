// Drawing helpers inserted inside the card scene; no extra network resources.
function flower(x,cx,cy,r,petal=rose){
  x.save();x.translate(cx,cy);x.fillStyle=petal;x.strokeStyle=ink;x.lineWidth=2;
  for(let i=0;i<6;i++){x.save();x.rotate(i*Math.PI/3);x.beginPath();x.ellipse(0,-r*.65,r*.44,r*.66,0,0,Math.PI*2);x.fill();x.stroke();x.restore();}
  x.beginPath();x.arc(0,0,r*.34,0,Math.PI*2);x.fillStyle=gold;x.fill();x.stroke();x.restore();
}
function leaf(x,cx,cy,r,rotation){x.save();x.translate(cx,cy);x.rotate(rotation);x.beginPath();x.ellipse(0,0,r*.42,r,0,0,Math.PI*2);x.fillStyle='#87ad82';x.fill();x.strokeStyle=ink;x.lineWidth=2;x.stroke();x.beginPath();x.moveTo(0,-r*.8);x.lineTo(0,r*.8);x.stroke();x.restore();}
function greetingLines(x,cx,top,width,color=ink){const lines=CONFIG.coverLines;lines.forEach((s,i)=>text(x,s,cx,top+i*(i<2?150:140),(i===lines.length-1&&lines.length>2?'bold 70px ':'bold 132px ')+ '"Trebuchet MS",sans-serif',color,width));}
function drawGardenCover(x,w,h){
  x.fillStyle='#f8f1d8';x.fillRect(0,0,w,h);x.strokeStyle='#749477';x.lineWidth=16;x.strokeRect(25,25,w-50,h-50);
  x.lineWidth=2;x.setLineDash([8,12]);x.strokeRect(54,54,w-108,h-108);x.setLineDash([]);
  x.strokeStyle='#749477';x.lineWidth=8;x.beginPath();x.moveTo(170,840);x.bezierCurveTo(110,570,180,160,500,145);x.moveTo(1330,840);x.bezierCurveTo(1390,570,1320,160,1000,145);x.stroke();
  for(let i=0;i<7;i++){let yy=220+i*88;leaf(x,180+Math.sin(i*.8)*45,yy,38,-.8);leaf(x,1320-Math.sin(i*.8)*45,yy,38,.8);}
  [[220,180,65,rose],[390,135,45,'#fff8e6'],[165,435,50,'#efb16d'],[220,745,66,rose],[380,820,52,'#fff8e6'],[1280,180,65,'#fff8e6'],[1110,135,45,rose],[1335,435,50,rose],[1280,745,66,'#efb16d'],[1120,820,52,rose]].forEach(a=>flower(x,...a));
  greetingLines(x,750,310,850,'#405c48');
  x.fillStyle='#e9b2b3';x.strokeStyle=ink;x.lineWidth=3;x.beginPath();x.roundRect(627,755,246,100,12);x.fill();x.stroke();
  for(let i=0;i<5;i++){x.beginPath();x.moveTo(650+i*49,762);x.lineTo(650+i*49,850);x.stroke();}
  flower(x,690,740,39,'#fff8e6');flower(x,750,720,48,rose);flower(x,810,746,37,'#efb16d');grain(x,w,h);
}
function drawStarlightCover(x,w,h){
  x.fillStyle='#293956';x.fillRect(0,0,w,h);x.strokeStyle=gold;x.lineWidth=12;x.strokeRect(22,22,w-44,h-44);x.strokeStyle='#94a3cf';x.lineWidth=2;x.setLineDash([6,12]);x.strokeRect(48,48,w-96,h-96);x.setLineDash([]);
  for(let i=0;i<42;i++){let cx=80+rnd()*1340,cy=70+rnd()*810;if(cx>650&&cy>200&&cy<700)continue;star(x,cx,cy,10+rnd()*17,i%3?gold:rose,rnd());}
  x.fillStyle='#f6d675';x.beginPath();x.arc(335,405,195,0,Math.PI*2);x.fill();x.fillStyle='#293956';x.beginPath();x.arc(410,340,178,0,Math.PI*2);x.fill();
  x.strokeStyle='#b9c2e8';x.lineWidth=3;x.beginPath();x.moveTo(200,135);x.lineTo(430,185);x.lineTo(580,100);x.stroke();star(x,200,135,22,gold);star(x,430,185,15,rose);star(x,580,100,19,gold);
  greetingLines(x,1010,300,700,'#fff0cb');
  x.fillStyle='#e5e8f4';x.beginPath();x.moveTo(60,915);x.bezierCurveTo(60,800,150,785,230,825);x.bezierCurveTo(300,710,440,750,480,822);x.bezierCurveTo(600,745,720,785,750,855);x.bezierCurveTo(890,760,1010,785,1060,850);x.bezierCurveTo(1190,750,1330,790,1440,860);x.lineTo(1440,950);x.lineTo(60,950);x.closePath();x.fill();
  for(const [cx,cy] of [[700,140],[680,700],[1290,700]])star(x,cx,cy,28,gold);grain(x,w,h);
}
function drawCoverDesign(x,w,h){if(style==='garden')drawGardenCover(x,w,h);else if(style==='starlight')drawStarlightCover(x,w,h);else drawPartyCover(x,w,h);}
function drawFloorDesign(x,w,h){
  x.fillStyle=cream;x.fillRect(0,0,w,h);frame(x,w,h);x.beginPath();x.ellipse(750,470,560,320,0,0,Math.PI*2);x.fillStyle=style==='garden'?'#dce8c9':style==='starlight'?'#a3aed2':'#abb4de';x.fill();x.strokeStyle=ink;x.lineWidth=2;x.stroke();
  for(let i=0;i<30;i++){let a=rnd()*Math.PI*2,r=Math.sqrt(rnd()),cx=750+510*r*Math.cos(a),cy=470+280*r*Math.sin(a);if(style==='garden')flower(x,cx,cy,8+rnd()*7,i%2?rose:'#fff6dd');else if(style==='starlight')star(x,cx,cy,9+rnd()*10,gold);else{x.fillStyle=i%3===0?rose:i%3===1?gold:'#fff6dd';x.fillRect(cx,cy,7,12);}}
  text(x,CONFIG.message,750,902,'italic 46px Georgia',ink,1240);heart(x,1260,910,18,rose);grain(x,w,h);
}
function sideTexture(colors){
  if(style==='party')return balloonTexture(colors);
  return texture(420,900,(x,w,h)=>{for(let i=0;i<2;i++){let cx=i?285:130,cy=i?265:145;x.strokeStyle=cream;x.lineWidth=18;x.beginPath();x.moveTo(cx,cy);x.bezierCurveTo(cx-30,480,cx+15,700,cx,895);x.stroke();x.strokeStyle=ink;x.lineWidth=4;x.stroke();if(style==='garden'){leaf(x,cx-35,480,67,-.7);leaf(x,cx+35,620,67,.7);flower(x,cx,cy,88,i?rose:'#fff6dd');}else{star(x,cx,cy,103,i?rose:gold,.12);star(x,cx-25,580,35,'#c1c9ed');}}});
}
function drawBunting(x,w){
  x.save();x.strokeStyle=cream;x.lineWidth=13;x.beginPath();x.moveTo(90,135);x.quadraticCurveTo(w/2,300,w-90,135);x.stroke();x.strokeStyle=ink;x.lineWidth=3;x.stroke();
  for(let i=0;i<13;i++){let t=i/12,xx=100+t*(w-200),yy=135+4*t*(1-t)*82;x.fillStyle=[rose,gold,blue,'#9fc7ae'][i%4];x.beginPath();x.moveTo(xx-35,yy);x.lineTo(xx+35,yy);x.lineTo(xx+2,yy+72);x.closePath();x.fill();x.stroke();}x.restore();
}
