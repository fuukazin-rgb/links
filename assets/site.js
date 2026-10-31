/* niche-hobby 共通スクリプト */
/* Google アナリティクス（アクセス解析） */
(function(){
  if(/\/admin\//.test(location.pathname)) return;
  var id='G-PT8WZ1PBPW';
  var s=document.createElement('script'); s.async=true;
  s.src='https://www.googletagmanager.com/gtag/js?id='+id;
  document.head.appendChild(s);
  window.dataLayer=window.dataLayer||[];
  window.gtag=function(){dataLayer.push(arguments);};
  gtag('js',new Date());
  gtag('config',id);
})();

(function(){
  var root=document.documentElement;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var motionOn=!reduce;
  try{ if(localStorage.getItem('nh-motion')==='off') motionOn=false; }catch(e){}
  window.nhMotion=function(){ return motionOn; };

  /* アニメーションの切り替え */
  var mbtn=document.getElementById('motionBtn');
  function paint(){
    root.setAttribute('data-motion',motionOn?'on':'off');
    if(!mbtn) return;
    mbtn.setAttribute('aria-label',motionOn?'アニメーションを止める':'アニメーションを再生する');
    mbtn.innerHTML=motionOn
      ?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 6v12M15 6v12"/></svg>'
      :'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
  }
  paint();
  if(mbtn) mbtn.addEventListener('click',function(){
    motionOn=!motionOn; paint();
    try{ localStorage.setItem('nh-motion',motionOn?'on':'off'); }catch(e){}
    document.dispatchEvent(new CustomEvent('nh-motion'));
  });

  /* スマホのメニュー */
  var drawer=document.getElementById('drawer');
  var openBtn=document.getElementById('menuBtn');
  var closeBtn=document.getElementById('menuClose');
  function setDrawer(open){
    if(!drawer) return;
    drawer.classList.toggle('open',open);
    drawer.setAttribute('aria-hidden',open?'false':'true');
    document.body.style.overflow=open?'hidden':'';
    if(openBtn) openBtn.setAttribute('aria-expanded',open?'true':'false');
    if(open && closeBtn) closeBtn.focus();
  }
  if(openBtn) openBtn.addEventListener('click',function(){ setDrawer(true); });
  if(closeBtn) closeBtn.addEventListener('click',function(){ setDrawer(false); });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape') setDrawer(false); });
  if(drawer) drawer.querySelectorAll('a').forEach(function(a){ a.addEventListener('click',function(){ setDrawer(false); }); });

  /* スクロールで出てくる */
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
    },{threshold:.12,rootMargin:'0px 0px -40px 0px'});
    document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('in'); });
  }

  /* カードの3Dチルト */
  if(window.matchMedia('(pointer:fine)').matches){
    document.querySelectorAll('.tilt').forEach(function(card){
      card.addEventListener('pointermove',function(ev){
        if(!motionOn) return;
        var r=card.getBoundingClientRect();
        var x=(ev.clientX-r.left)/r.width-.5, y=(ev.clientY-r.top)/r.height-.5;
        card.style.setProperty('--ry',(x*7).toFixed(2)+'deg');
        card.style.setProperty('--rx',(-y*7).toFixed(2)+'deg');
      });
      card.addEventListener('pointerleave',function(){ card.style.setProperty('--ry','0deg'); card.style.setProperty('--rx','0deg'); });
    });
  }

  /* 時計 */
  var clock=document.getElementById('clock');
  if(clock){
    var tick=function(){ clock.textContent=new Date(Date.now()+9*3600*1000).toISOString().slice(11,19); };
    tick(); setInterval(tick,1000);
  }

  /* YouTube はクリックしてから読み込む */
  document.querySelectorAll('.yt[data-id]').forEach(function(b){
    b.addEventListener('click',function(){
      var id=b.getAttribute('data-id');
      var f=document.createElement('iframe');
      f.src='https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&rel=0';
      f.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      f.allowFullscreen=true;
      f.title=b.getAttribute('aria-label')||'YouTube';
      b.innerHTML=''; b.appendChild(f); b.style.cursor='default';
    },{once:true});
  });

  /* スライドバナー */
  var slider=document.getElementById('slider');
  var activeIndex=0;
  if(slider){
    var slides=[].slice.call(slider.querySelectorAll('.slide'));
    var dotsWrap=slider.querySelector('.s-dots');
    var num=slider.querySelector('.s-num b');
    var DUR=7000, timer=null, paused=false;
    slider.style.setProperty('--dur',DUR/1000+'s');
    slides.forEach(function(s,i){
      var b=document.createElement('button');
      b.type='button'; b.setAttribute('aria-label',(i+1)+'枚目のバナー'); b.innerHTML='<i></i>';
      b.addEventListener('click',function(){ go(i); });
      dotsWrap.appendChild(b);
    });
    var dots=[].slice.call(dotsWrap.children);
    function go(i){
      activeIndex=(i+slides.length)%slides.length;
      slides.forEach(function(s,k){ s.classList.toggle('on',k===activeIndex); s.setAttribute('aria-hidden',k===activeIndex?'false':'true'); });
      dots.forEach(function(d,k){ d.classList.remove('on'); void d.offsetWidth; d.classList.toggle('on',k===activeIndex); });
      if(num) num.textContent=('0'+(activeIndex+1)).slice(-2);
      schedule();
      document.dispatchEvent(new CustomEvent('nh-slide',{detail:activeIndex}));
    }
    function schedule(){
      clearTimeout(timer);
      if(paused||!motionOn) return;
      timer=setTimeout(function(){ go(activeIndex+1); },DUR);
    }
    slider.querySelector('.prev').addEventListener('click',function(){ go(activeIndex-1); });
    slider.querySelector('.next').addEventListener('click',function(){ go(activeIndex+1); });
    slider.addEventListener('mouseenter',function(){ paused=true; slider.classList.add('paused'); clearTimeout(timer); });
    slider.addEventListener('mouseleave',function(){ paused=false; slider.classList.remove('paused'); schedule(); });
    var sx=null;
    slider.addEventListener('touchstart',function(e){ sx=e.touches[0].clientX; },{passive:true});
    slider.addEventListener('touchend',function(e){
      if(sx===null) return; var dx=e.changedTouches[0].clientX-sx; sx=null;
      if(Math.abs(dx)>50) go(activeIndex+(dx<0?1:-1));
    });
    document.addEventListener('nh-motion',function(){ if(!motionOn) slider.classList.add('paused'); else slider.classList.remove('paused'); schedule(); });
    if(!motionOn) slider.classList.add('paused');
    go(0);
  }

  /* MONON をタップするとびっくり顔 */
  document.querySelectorAll('[data-monon]').forEach(function(m){
    var bubble=document.getElementById(m.getAttribute('data-monon'));
    var words=['それな','エビデンスは？','それな','!?'], w=0;
    m.style.cursor='pointer';
    m.addEventListener('click',function(ev){
      ev.preventDefault();
      if(bubble){ w=(w+1)%words.length; bubble.textContent=words[w]; }
      var img=m.querySelector('.monon-img');
      if(img&&img.animate&&motionOn){
        try{
          img.animate([{transform:'translateY(0) rotate(0)'},{transform:'translateY(-30px) rotate(8deg)'},{transform:'translateY(0) rotate(-4deg)'},{transform:'translateY(-8px) rotate(2deg)'},{transform:'translateY(0) rotate(0)'}],{duration:700,easing:'ease-out',composite:'add'});
        }catch(e){}
      }
      if(bubble&&bubble.animate&&motionOn){ try{ bubble.animate([{transform:'scale(.6)'},{transform:'scale(1.15)'},{transform:'scale(1)'}],{duration:400,easing:'ease-out',composite:'add'}); }catch(e){} }
    });
  });

  /* 3D の nh モノグラム */
  var canvas=document.getElementById('nh3d');
  if(!canvas||!window.THREE) return;
  var renderer;
  try{ renderer=new THREE.WebGLRenderer({canvas:canvas,antialias:true,alpha:true}); }catch(e){ return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  var scene=new THREE.Scene();
  scene.fog=new THREE.Fog(0x05060A,14,42);
  var camera=new THREE.PerspectiveCamera(40,1,.1,100);
  camera.position.set(0,.4,13);

  function P(x,y){ return new THREE.Vector3((x-60)/20,(50-y)/20,0); }
  function path(segs){
    var p=new THREE.CurvePath();
    segs.forEach(function(s){
      if(s.length===2) p.add(new THREE.LineCurve3(P(s[0][0],s[0][1]),P(s[1][0],s[1][1])));
      else p.add(new THREE.QuadraticBezierCurve3(P(s[0][0],s[0][1]),P(s[1][0],s[1][1]),P(s[2][0],s[2][1])));
    });
    return p;
  }
  var R=.3;
  var matN=new THREE.MeshStandardMaterial({color:0xF6F5F2,metalness:.25,roughness:.25,emissive:0xffffff,emissiveIntensity:.08});
  var matH=new THREE.MeshStandardMaterial({color:0x12A37A,metalness:.35,roughness:.2,emissive:0x12A37A,emissiveIntensity:.6});
  var mark=new THREE.Group();
  function tube(p,mat,seg){ mark.add(new THREE.Mesh(new THREE.TubeGeometry(p,seg,R,28,false),mat)); }
  tube(path([[[14,86],[14,48]],[[14,48],[14,34],[37,34]],[[37,34],[60,34],[60,48]]]),matN,120);
  tube(path([[[60,10],[60,86]]]),matH,60);
  tube(path([[[60,48],[60,34],[83,34]],[[83,34],[106,34],[106,48]],[[106,48],[106,86]]]),matH,120);
  var cap=new THREE.SphereGeometry(R,24,24);
  [[14,86,matN],[60,10,matH],[60,86,matH],[106,86,matH]].forEach(function(c){ var s=new THREE.Mesh(cap,c[2]); s.position.copy(P(c[0],c[1])); mark.add(s); });

  function glowTex(color){
    var c=document.createElement('canvas'); c.width=c.height=128;
    var g=c.getContext('2d'), gr=g.createRadialGradient(64,64,0,64,64,64);
    gr.addColorStop(0,color); gr.addColorStop(.35,color.replace(/[\d.]+\)$/,'0.25)')); gr.addColorStop(1,'rgba(0,0,0,0)');
    g.fillStyle=gr; g.fillRect(0,0,128,128);
    return new THREE.CanvasTexture(c);
  }
  var halo=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex('rgba(46,230,168,0.9)'),blending:THREE.AdditiveBlending,transparent:true,depthWrite:false}));
  halo.scale.set(11,11,1); halo.position.set(.6,0,-1.2);
  var rig=new THREE.Group(); rig.add(halo); rig.add(mark);
  var ringMat=new THREE.MeshBasicMaterial({color:0x2EE6A8,transparent:true,opacity:.35,blending:THREE.AdditiveBlending});
  var ring1=new THREE.Mesh(new THREE.TorusGeometry(4.2,.012,8,180),ringMat);
  var ring2=new THREE.Mesh(new THREE.TorusGeometry(5.1,.008,8,180),ringMat.clone()); ring2.material.opacity=.18;
  ring1.rotation.x=1.25; ring2.rotation.x=1.1; ring2.rotation.y=.4;
  rig.add(ring1); rig.add(ring2);
  var orb=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex('rgba(200,255,235,1)'),blending:THREE.AdditiveBlending,transparent:true,depthWrite:false}));
  orb.scale.set(.7,.7,1); rig.add(orb);
  scene.add(rig);

  var small=window.innerWidth<700, N=small?500:1100, pos=new Float32Array(N*3);
  for(var i=0;i<N;i++){ pos[i*3]=(Math.random()-.5)*40; pos[i*3+1]=(Math.random()-.5)*24; pos[i*3+2]=(Math.random()-.5)*30-4; }
  var pg=new THREE.BufferGeometry(); pg.setAttribute('position',new THREE.BufferAttribute(pos,3));
  var pts=new THREE.Points(pg,new THREE.PointsMaterial({size:.07,map:glowTex('rgba(150,255,215,1)'),transparent:true,opacity:.75,blending:THREE.AdditiveBlending,depthWrite:false}));
  scene.add(pts);
  var grid=new THREE.GridHelper(80,80,0x12A37A,0x12A37A);
  grid.material.transparent=true; grid.material.opacity=.16; grid.position.y=-3.6;
  scene.add(grid);
  scene.add(new THREE.AmbientLight(0xffffff,.35));
  var key=new THREE.DirectionalLight(0xffffff,.9); key.position.set(4,6,8); scene.add(key);
  var rim=new THREE.PointLight(0x2EE6A8,2.2,30); rim.position.set(-5,2,4); scene.add(rim);
  var back=new THREE.PointLight(0x7CFFD6,1.4,30); back.position.set(3,-2,-4); scene.add(back);

  var mx=0,my=0,tx=0,ty=0;
  window.addEventListener('pointermove',function(e){ mx=e.clientX/window.innerWidth-.5; my=e.clientY/window.innerHeight-.5; },{passive:true});
  function layout(){
    var w=canvas.clientWidth||canvas.parentNode.clientWidth, h=canvas.clientHeight||canvas.parentNode.clientHeight;
    if(!w||!h) return;
    renderer.setSize(w,h,false);
    camera.aspect=w/h; camera.updateProjectionMatrix();
    var visH=2*13*Math.tan(20*Math.PI/180);
    if(w>760){ rig.position.set(visH*camera.aspect*.22,.4,0); rig.scale.setScalar(1); }
    else { rig.position.set(0,(h/2-150)/h*visH,0); rig.scale.setScalar(.6); }
  }
  layout(); window.addEventListener('resize',layout);
  var visible=true, slideOk=true;
  new IntersectionObserver(function(e){ visible=e[0].isIntersecting; }).observe(canvas);
  var host=canvas.closest('.slide');
  if(host){
    var idx=[].indexOf.call(host.parentNode.querySelectorAll('.slide'),host);
    document.addEventListener('nh-slide',function(e){ slideOk=(e.detail===idx); if(slideOk) layout(); });
  }
  var clk=new THREE.Clock(), t=0;
  function frame(){
    requestAnimationFrame(frame);
    var dt=Math.min(clk.getDelta(),.05);
    if(!visible||!slideOk) return;
    if(motionOn) t+=dt;
    tx+=(mx-tx)*.05; ty+=(my-ty)*.05;
    mark.rotation.y=Math.sin(t*.45)*.55+tx*.8;
    mark.rotation.x=Math.sin(t*.32)*.12+ty*.4;
    mark.position.y=Math.sin(t*1.1)*.15;
    var pulse=.5+.5*Math.sin(t*1.8);
    matH.emissiveIntensity=.45+pulse*.55;
    halo.material.opacity=.45+pulse*.35; halo.scale.setScalar(10+pulse*1.6);
    ring1.rotation.z=t*.25; ring2.rotation.z=-t*.18;
    var a=t*.9; orb.position.set(Math.cos(a)*4.2,Math.sin(a)*4.2*Math.cos(1.25),Math.sin(a)*4.2*Math.sin(1.25));
    pts.rotation.y=t*.02; pts.position.y=Math.sin(t*.3)*.3;
    grid.position.z=(t*1.2)%1;
    camera.position.x=tx*1.2; camera.position.y=.4-ty*.8; camera.lookAt(0,0,0);
    rim.intensity=1.6+pulse*1.4;
    renderer.render(scene,camera);
  }
  frame();
})();

/* JOURNAL（ブログ）：note の記事と、このサイトで書いた記事をまとめて表示 */
(function(){
  var box=document.querySelector('.journal[data-src]'); if(!box) return;
  var limit=parseInt(box.getAttribute('data-limit')||'0',10);
  var filter=document.querySelector('.jfilter');
  var LABEL={pro:'Pro',kanri:'Kanri',monon:'MONON',blog:'Blog',making:'Making'};
  function esc(t){ return String(t==null?'':t).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function get(u){ return fetch(u,{cache:'no-store'}).then(function(r){ return r.ok?r.json():[]; }).catch(function(){ return []; }); }
  Promise.all([get('/blog/note.json'),get('/blog/posts.json')]).then(function(res){
    var note=(res[0]||[]).map(function(p){ return {cat:p.cat,date:p.date,title:p.title,url:p.url,img:p.img,ext:true}; });
    var own=(res[1]||[]).map(function(p){ return {cat:p.cat||'blog',date:p.date,title:p.title,url:'/blog/'+p.slug+'/',img:p.cover?('/blog/'+p.slug+'/'+p.cover):'',ext:false,own:true}; });
    var all=own.concat(note).sort(function(a,b){ return a.date<b.date?1:a.date>b.date?-1:0; });
    var items=limit?all.slice(0,limit):all;
    box.innerHTML=items.map(function(p,i){
      var cat=(p.cat in LABEL)?p.cat:'blog';
      var lab=p.own&&cat!=='blog'?LABEL[cat]+' ／ Blog':LABEL[cat];
      return '<a class="post'+(i===0?' feature':'')+'" data-cat="'+cat+'"'+(p.own?' data-own="1"':'')+' href="'+esc(p.url)+'"'+(p.ext?' target="_blank" rel="noopener"':'')+'>'+
        '<div class="th">'+(p.img?'<img src="'+esc(p.img)+'" alt="" loading="lazy">':'')+'<span class="cat '+cat+'">'+esc(lab)+'</span></div>'+
        '<div class="bd"><time datetime="'+esc(p.date)+'">'+esc(String(p.date).replace(/-/g,'.'))+'</time><h3>'+esc(p.title)+'</h3><span class="rd">'+(p.ext?'Read on note →':'Read more →')+'</span></div></a>';
    }).join('');
    box.querySelectorAll('img').forEach(function(img){ img.addEventListener('error',function(){ img.remove(); }); });
    if(!items.length) box.innerHTML='<p class="note">記事を読み込めませんでした。</p>';
  });
  if(filter) filter.addEventListener('click',function(e){
    var b=e.target.closest('button'); if(!b) return;
    filter.querySelectorAll('button').forEach(function(x){ x.setAttribute('aria-pressed',x===b?'true':'false'); });
    var c=b.getAttribute('data-cat');
    box.querySelectorAll('.post').forEach(function(p){
      var ok=c==='all'||p.getAttribute('data-cat')===c||(c==='blog'&&p.getAttribute('data-own')==='1');
      p.hidden=!ok;
    });
  });
})();
