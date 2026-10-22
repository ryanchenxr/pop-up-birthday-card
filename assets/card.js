(() => {
'use strict';
const stage = document.getElementById('stage'), button = document.getElementById('toggle'), slider = document.getElementById('angle'), hint = document.getElementById('hint');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const music=document.getElementById('music-track'),soundButton=document.getElementById('sound');
let musicEnabled=CONFIG.musicEnabled,musicRequest=0;
soundButton.hidden=!CONFIG.musicEnabled;
music.volume=.7;
function syncSound(){const playing=!music.paused&&!music.ended;soundButton.textContent=playing?'♫ 关闭音乐':'♫ 播放音乐';soundButton.setAttribute('aria-pressed',String(playing));}
function stopMusic(){musicRequest++;music.pause();music.currentTime=0;syncSound();}
async function playMusic(restart=false){
  if(!musicEnabled)return;
  const request=++musicRequest;
  if(restart)music.currentTime=0;
  try{await music.play();if(request!==musicRequest&&(!musicEnabled||target<=.5))music.pause();syncSound();}
  catch(e){if(request===musicRequest){syncSound();soundButton.textContent='♫ 点击播放音乐';}}
}
soundButton.addEventListener('click',()=>{if(!music.paused){musicEnabled=false;stopMusic();}else{musicEnabled=true;playMusic(music.ended);}});
for(const event of ['playing','pause','ended'])music.addEventListener(event,syncSound);
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopMusic();});

const W=7.2,H=4.8,style=CONFIG.style||'party',ink='#263b59',cream='#fff0cb',rose=style==='garden'?'#e5a39e':'#eaa9b2',gold='#eac859',blue=style==='garden'?'#9cbba0':style==='starlight'?'#93a3d2':'#829bc9';
let renderer;
try { renderer = new THREE.WebGLRenderer({alpha:true,antialias:true}); }
catch(e) { document.getElementById('loading').textContent='暂时无法打开卡片，请换一个浏览器试试。'; return; }
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.setClearColor(0x000000,0);renderer.domElement.style.visibility='hidden';stage.append(renderer.domElement);
const scene=new THREE.Scene(),root=new THREE.Group();scene.add(root);
let viewHeight=7.7;
const camera=new THREE.PerspectiveCamera(38,1,.1,60);
scene.add(new THREE.HemisphereLight(0xfffbef,0x8192a8,2.1));
const light=new THREE.DirectionalLight(0xfff5e5,2.4);light.position.set(-4,10,7);light.castShadow=true;light.shadow.mapSize.set(2048,2048);Object.assign(light.shadow.camera,{left:-9,right:9,top:10,bottom:-7,near:.1,far:35});light.shadow.bias=-.0003;light.shadow.normalBias=.015;light.shadow.radius=3;light.target.position.set(0,0,1);scene.add(light,light.target);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.16}));ground.rotation.x=-Math.PI/2;ground.position.y=-.07;ground.receiveShadow=true;scene.add(ground);
let seed=208;function rnd(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
function texture(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');draw(x,w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),8);return t;}
function grain(x,w,h){x.save();for(let i=0;i<16000;i++){x.fillStyle=rnd()>.5?'rgba(92,66,39,.035)':'rgba(255,255,255,.1)';x.fillRect(rnd()*w,rnd()*h,1+rnd()*2,1+rnd()*2);}x.restore();}
function star(x,cx,cy,r,color,rot=0){x.save();x.translate(cx,cy);x.rotate(rot);x.beginPath();for(let i=0;i<8;i++){let a=i*Math.PI/4-Math.PI/2,rr=i%2?r*.34:r;x.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}x.closePath();x.fillStyle=color;x.fill();x.strokeStyle=ink;x.lineWidth=2;x.stroke();x.restore();}
function heart(x,cx,cy,s,color){x.save();x.translate(cx,cy);x.scale(s,s);x.beginPath();x.moveTo(0,.3);x.bezierCurveTo(-1.4,-.6,-.8,-1.4,0,-.7);x.bezierCurveTo(.8,-1.4,1.4,-.6,0,.3);x.fillStyle=color;x.fill();x.strokeStyle=ink;x.lineWidth=.06;x.stroke();x.restore();}
function text(x,s,px,y,font,color=ink,maxWidth=Infinity){
  x.font=font;const size=Number(font.match(/([0-9.]+)px/)[1]);
  const scale=Math.min(1,maxWidth/Math.max(1,x.measureText(s).width));
  x.font=font.replace(/[0-9.]+px/,(size*scale)+'px');
  x.fillStyle=color;x.textAlign='center';x.textBaseline='middle';x.fillText(s,px,y);
}
function coverImage(x,img,px,py,w,h){
  const scale=Math.max(w/img.width,h/img.height),sw=w/scale,sh=h/scale;
  x.drawImage(img,(img.width-sw)/2,(img.height-sh)/2,sw,sh,px,py,w,h);
}
function frame(x,w,h){x.strokeStyle=gold;x.lineWidth=22;x.strokeRect(11,11,w-22,h-22);x.strokeStyle=ink;x.lineWidth=2;x.setLineDash([11,9]);x.strokeRect(40,40,w-80,h-80);x.setLineDash([]);}
function drawPartyCover(x,w,h){x.fillStyle=blue;x.fillRect(0,0,w,h);x.strokeStyle=rose;x.lineWidth=20;x.strokeRect(30,30,w-60,h-60);x.strokeStyle=ink;x.lineWidth=3;x.setLineDash([13,9]);x.strokeRect(55,55,w-110,h-110);x.setLineDash([]);
for(let i=0;i<40;i++){const a=i*Math.PI*2/40,cx=750+600*Math.cos(a),cy=500+370*Math.sin(a);if(i%3===0)heart(x,cx,cy,19,rose);else star(x,cx,cy,15+i%4,gold,a);}
x.beginPath();for(let i=0;i<200;i++){let a=i*Math.PI*2/200,rr=1+.018*Math.cos(a*35);x.lineTo(750+530*rr*Math.cos(a),500+350*rr*Math.sin(a));}x.closePath();x.fillStyle=gold;x.fill();x.lineWidth=4;x.strokeStyle=ink;x.stroke();x.beginPath();x.ellipse(750,500,505,325,0,0,Math.PI*2);x.fillStyle=cream;x.fill();x.lineWidth=3;x.stroke();
const lines=CONFIG.coverLines,ribbon=lines.length>2?lines[lines.length-1]:'',mainLines=ribbon?lines.slice(0,-1):lines;mainLines.forEach((line,i)=>{const y=mainLines.length===1?425:285+i*175/Math.max(1,mainLines.length-1);text(x,line,750,y,'bold 142px "Trebuchet MS",sans-serif',ink,840);});
if(ribbon){x.save();x.translate(750,590);x.rotate(-.025);x.fillStyle=rose;x.beginPath();x.moveTo(-340,-47);x.lineTo(340,-47);x.lineTo(320,0);x.lineTo(340,47);x.lineTo(-340,47);x.lineTo(-320,0);x.closePath();x.fill();x.stroke();text(x,ribbon,0,1,'italic bold 68px "Trebuchet MS",sans-serif',ink,600);x.restore();}
// A small drawn birthday cake, printed on the cover.
x.fillStyle=blue;x.beginPath();x.ellipse(750,765,122,20,0,0,Math.PI*2);x.fill();x.stroke();x.fillStyle=rose;x.beginPath();x.roundRect(650,699,200,62,12);x.fill();x.stroke();x.fillStyle='#fff9e3';x.beginPath();x.ellipse(750,700,100,19,0,0,Math.PI*2);x.fill();x.stroke();for(let i=0;i<3;i++){let xx=705+i*45;x.fillStyle=[blue,gold,rose][i];x.fillRect(xx-5,651,10,46);x.strokeRect(xx-5,651,10,46);x.fillStyle=gold;x.beginPath();x.ellipse(xx,640,6,13,.15,0,Math.PI*2);x.fill();}grain(x,w,h);}
/*STYLE_DRAWINGS*/
const coverTexture=texture(1500,1000,drawCoverDesign);
const baseTexture=texture(1500,1000,drawFloorDesign);
const paperMat=new THREE.MeshStandardMaterial({color:0xffedbd,roughness:1});
const base=new THREE.Mesh(new THREE.BoxGeometry(W,.045,H),paperMat);base.position.set(0,0,H/2);base.receiveShadow=true;base.castShadow=true;root.add(base);
function material(map){return new THREE.MeshStandardMaterial({map,roughness:1,metalness:0,alphaTest:.45,side:THREE.FrontSide});}
function surface(w,h,map){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),material(map));m.castShadow=true;m.receiveShadow=true;return m;}
const floor=surface(W-.02,H-.02,baseTexture);floor.rotation.x=-Math.PI/2;floor.position.set(0,.026,H/2);root.add(floor);
const lid=new THREE.Group();lid.position.set(0,.14,0);root.add(lid);
const lidBody=new THREE.Mesh(new THREE.BoxGeometry(W,H,.04),paperMat);lidBody.position.y=H/2;lidBody.castShadow=true;lid.add(lidBody);
const cover=surface(W-.005,H-.005,coverTexture);cover.position.set(0,H/2,-.024);cover.rotation.x=Math.PI;lid.add(cover);
const popups=[];
function paperPiece(map,w,h,x,z,y=.08){const g=new THREE.Group();g.position.set(x,y,z);root.add(g);const f=surface(w,h,map);f.position.y=h/2;f.customDepthMaterial=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,map,alphaTest:.45});g.add(f);const b=new THREE.Mesh(f.geometry,new THREE.ShaderMaterial({uniforms:{image:{value:map}},vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'uniform sampler2D image; varying vec2 vUv;void main(){float a=texture2D(image,vUv).a;if(a<0.45)discard;gl_FragColor=vec4(0.90,0.85,0.73,1.0);}',side:THREE.BackSide}));b.position.y=h/2;g.add(b);popups.push(g);return g;}
function balloonTexture(colors){return texture(420,900,(x,w,h)=>{colors.forEach((c,i)=>{let cx=i?275:135,cy=i?210:135,rx=i?82:90,ry=i?107:118;x.strokeStyle=cream;x.lineWidth=15;x.beginPath();x.moveTo(cx,cy+ry);x.bezierCurveTo(cx-20,470,cx+30,640,cx-10,895);x.stroke();x.strokeStyle=ink;x.lineWidth=3;x.stroke();x.beginPath();x.ellipse(cx,cy,rx+7,ry+7,i?-.16:.14,0,Math.PI*2);x.fillStyle=cream;x.fill();x.beginPath();x.ellipse(cx,cy,rx,ry,i?-.16:.14,0,Math.PI*2);x.fillStyle=c;x.fill();x.strokeStyle=ink;x.lineWidth=4;x.stroke();x.strokeStyle='#fff5d9';x.lineWidth=8;x.lineCap='round';x.beginPath();x.ellipse(cx-15,cy-15,rx*.6,ry*.65,0,3.5,4.7);x.stroke();x.fillStyle=c;x.beginPath();x.moveTo(cx,cy+ry-2);x.lineTo(cx-10,cy+ry+18);x.lineTo(cx+12,cy+ry+18);x.closePath();x.fill();});star(x,80,530,25,gold);star(x,330,650,25,rose);grain(x,w,h);});}
paperPiece(sideTexture([rose,gold]),1.1,2.9,-2.9,1.1,.09);paperPiece(sideTexture(['#85b6aa',blue]),1.1,2.9,2.9,1.1,.095);
const bannerTex=texture(1400,230,(x,w,h)=>{x.fillStyle=cream;x.beginPath();x.moveTo(15,15);x.lineTo(1385,15);x.lineTo(1340,115);x.lineTo(1385,215);x.lineTo(15,215);x.lineTo(60,115);x.closePath();x.fill();x.fillStyle=gold;x.strokeStyle=ink;x.lineWidth=5;x.beginPath();x.moveTo(35,30);x.lineTo(1365,30);x.lineTo(1320,115);x.lineTo(1365,200);x.lineTo(35,200);x.lineTo(80,115);x.closePath();x.fill();x.stroke();x.setLineDash([9,7]);x.lineWidth=2;x.strokeRect(130,47,1140,136);x.setLineDash([]);text(x,CONFIG.message,700,116,'bold 73px Georgia',ink,1110);grain(x,w,h);});
paperPiece(bannerTex,5.6,.92,0,3.74,.075);
/*WISH_INTERACTION*/
// Small folded support strips behind the foreground pieces.
const supports=[];for(const xx of [-.95,.95]){let p=new THREE.Mesh(new THREE.PlaneGeometry(.22,.6),new THREE.MeshStandardMaterial({color:0xfff2d7,roughness:1,side:THREE.DoubleSide}));p.position.x=xx;p.castShadow=true;root.add(p);supports.push(p);}
let ready=false,presented=false,progress=0,target=0,tilt=0,wantedTilt=0,lastTime=0,celebrated=false;
let subjectGroup=null;
const load=src=>new Promise((resolve,reject)=>{new THREE.TextureLoader().load(src,t=>{t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());resolve(t)},undefined,reject)});
Promise.all([load(ASSETS.foreground),load(ASSETS.background)]).then(([foreground,background])=>{const innerTex=texture(1500,1000,(x,w,h)=>{x.fillStyle=cream;x.fillRect(0,0,w,h);coverImage(x,background.image,20,20,w-40,h-40);drawBunting(x,w);frame(x,w,h);grain(x,w,h);});const inner=surface(W-.005,H-.005,innerTex);inner.position.set(0,H/2,.024);lid.add(inner);const subjectScale=Math.min(4.6/foreground.image.width,4.0/foreground.image.height);subjectGroup=paperPiece(foreground,foreground.image.width*subjectScale,foreground.image.height*subjectScale,0,.7,.105);ready=true;resize();}).catch(()=>{document.getElementById('loading').textContent='加载遇到了问题，请刷新重试。';});
function syncControls(){const open=target>.5;button.textContent=open?'合上生日卡':'打开生日卡';button.setAttribute('aria-expanded',String(open));slider.value=Math.round(progress*100);hint.textContent=open?'轻轻左右拖动，看看纸片的层次':'点击卡片，展开这份祝福';}
function setTarget(v){if(v<.999)resetWishes();const wasOpen=target>.5;target=Math.max(0,Math.min(1,v));if(target>.5&&!wasOpen)playMusic(true);else if(target<=.5&&wasOpen)stopMusic();if(target<.6)celebrated=false;if(reduceMotion)progress=target;syncControls();}
button.addEventListener('click',()=>setTarget(target>.5?0:1));slider.addEventListener('input',()=>{setTarget(Number(slider.value)/100);progress=target;});
let pointer=null;
stage.addEventListener('pointerdown',e=>{if(!ready)return;pointer={x:e.clientX,y:e.clientY,tilt,drag:false};stage.setPointerCapture(e.pointerId)});
stage.addEventListener('pointermove',e=>{if(!pointer)return;const dx=e.clientX-pointer.x;if(Math.hypot(dx,e.clientY-pointer.y)>6)pointer.drag=true;if(pointer.drag)wantedTilt=Math.max(-.3,Math.min(.3,pointer.tilt+dx/600));});
stage.addEventListener('pointerup',()=>{if(pointer&&!pointer.drag)setTarget(target>.5?0:1);pointer=null;});stage.addEventListener('pointercancel',()=>{pointer=null});
function resize(){const rect=stage.getBoundingClientRect();if(!rect.width||!rect.height)return;const aspect=rect.width/rect.height,viewH=Math.max(7.7,9.3/aspect);viewHeight=viewH;camera.aspect=aspect;camera.updateProjectionMatrix();renderer.setSize(rect.width,rect.height);resizeConfetti();}
const fc=document.getElementById('confetti'),ctx=fc.getContext('2d');let flakes=[],fw=0,fh=0;function resizeConfetti(){fw=innerWidth;fh=innerHeight;fc.width=fw*devicePixelRatio;fc.height=fh*devicePixelRatio;ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);}
function celebrate(){if(reduceMotion)return;const colors=[rose,gold,'#829bc9','#75a897',cream];flakes=Array.from({length:90},()=>({x:fw*.5+(rnd()-.5)*fw*.6,y:fh*.2+rnd()*fh*.15,vx:(rnd()-.5)*160,vy:-100-rnd()*180,r:rnd()*6,spin:(rnd()-.5)*5,color:colors[Math.floor(rnd()*colors.length)],life:3+rnd()*1.5}));}
function drawConfetti(dt){ctx.clearRect(0,0,fw,fh);flakes=flakes.filter(p=>p.life>0&&p.y<fh+20);for(const p of flakes){p.life-=dt;p.vy+=dt*130;p.x+=p.vx*dt;p.y+=p.vy*dt;p.r+=p.spin*dt;ctx.save();ctx.globalAlpha=Math.min(1,p.life);ctx.translate(p.x,p.y);ctx.rotate(p.r);ctx.fillStyle=p.color;ctx.fillRect(-3,-5,6,10*Math.cos(p.r));ctx.restore();}}
function tick(time){requestAnimationFrame(tick);const dt=Math.min((time-lastTime)/1000,.04);lastTime=time;if(Math.abs(progress-target)>.0001)progress+=(target-progress)*(1-Math.exp(-dt*4.5));else progress=target;tilt+=(wantedTilt-tilt)*(1-Math.exp(-dt*7));root.rotation.y=tilt;const cameraDistance=10+6*progress,elevation=THREE.MathUtils.degToRad(64-36*progress),aimY=1.7*progress,aimZ=2.4-.7*progress;camera.fov=THREE.MathUtils.radToDeg(2*Math.atan(viewHeight/(2*cameraDistance)));camera.updateProjectionMatrix();camera.position.set(0,aimY+cameraDistance*Math.sin(elevation),aimZ+cameraDistance*Math.cos(elevation));camera.lookAt(0,aimY,aimZ);
const a=(1-progress)*Math.PI/2;lid.rotation.x=a;for(const g of popups)g.rotation.x=a;if(subjectGroup)subjectGroup.position.z=.7+progress*progress;for(const p of supports){p.position.y=.1+Math.sin(progress*Math.PI/2)*.22;p.position.z=.4+progress*progress;p.rotation.x=-Math.PI/2+progress*Math.PI*.32;}
if(ready&&progress>.93&&!celebrated){celebrated=true;celebrate();}slider.value=Math.round(progress*100);updateWishes(time);renderer.render(scene,camera);if(ready&&!presented){presented=true;renderer.domElement.style.visibility='';document.getElementById('loading').remove();document.getElementById('controls').removeAttribute('aria-hidden');button.disabled=false;slider.disabled=false;}drawConfetti(dt);}
new ResizeObserver(resize).observe(stage);resize();syncControls();requestAnimationFrame(tick);
})();
