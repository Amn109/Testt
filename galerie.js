/* galerie.js - Mur de tableaux (version avec tes 15 images distantes)
   - remplace l'ancien galerie.js
   - utilise les 15 URLs que tu as fournies en remote fallbacks
   - cadres dorés visibles, plaques, overlay descriptif
   - three r0.146 + OrbitControls + gsap attendu dans la page
*/

(function(){
  const canvas = document.getElementById('gallery-canvas');

  // Renderer / Scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf2efe9);

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;

  // Camera & controls
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 200);
  camera.position.set(0, 1.8, 16);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.dampingFactor = 0.08;
  controls.enablePan = false; controls.minDistance = 4; controls.maxDistance = 40;
  controls.maxPolarAngle = Math.PI / 2.1;

  window.addEventListener('resize', ()=> {
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Lights
  scene.add(new THREE.HemisphereLight(0xffffff, 0xaaaaaa, 0.55));
  const mainLight = new THREE.PointLight(0xffffff, 0.95, 120, 2);
  mainLight.position.set(0, 9, 8);
  scene.add(mainLight);

  // Floor (canvas texture)
  function makeFloorCanvas(w=2048,h=1024){
    const c = document.createElement('canvas'); c.width=w; c.height=h;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#6c4326'; ctx.fillRect(0,0,w,h);
    for(let y=0;y<h;y+=28){
      ctx.fillStyle = (y%56)? '#6b432a' : '#6f4b31';
      ctx.fillRect(0,y,w,12);
    }
    return new THREE.CanvasTexture(c);
  }
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(60,36), new THREE.MeshStandardMaterial({ map: makeFloorCanvas(), roughness: 0.6 }));
  floor.rotation.x = -Math.PI/2; floor.position.y = 0; scene.add(floor);

  // Back wall
  const backZ = -10;
  const wallWidth = 28, wallHeight = 12;
  const wall = new THREE.Mesh(new THREE.BoxGeometry(wallWidth, wallHeight, 0.6), new THREE.MeshStandardMaterial({ color:0xf7f3ee, roughness:0.96 }));
  wall.position.set(0, wallHeight/2, backZ);
  scene.add(wall);

  // Frame materials
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xD4AF37, metalness: 0.96, roughness: 0.18 });
  const innerBevelMat = new THREE.MeshStandardMaterial({ color: 0x3e2b20, metalness: 0.1, roughness: 0.6 });

  // placeholder texture (while loading)
  function placeholderTex(text){
    const c = document.createElement('canvas'); c.width = 800; c.height = 600;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#efe7df'; ctx.fillRect(0,0,c.width,c.height);
    ctx.fillStyle = '#c9b9a3'; ctx.font = '28px Georgia'; ctx.textAlign = 'center';
    ctx.fillText(text||'Chargement...', c.width/2, c.height/2);
    const t = new THREE.CanvasTexture(c);
    t.encoding = THREE.sRGBEncoding;
    return t;
  }

  // simple svg fallback (data URL)
  function svgDataURL(color, label){
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='900'><rect width='100%' height='100%' fill='${color}'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Georgia, serif' font-size='72' fill='#ffffff' opacity='0.95'>${label}</text></svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  // robust loader using TextureLoader with chained fallbacks
  const loader = new THREE.TextureLoader();
  try { loader.setCrossOrigin('anonymous'); } catch(e){ /* ignore if not needed */ }

  function loadWithFallback(local, remote, embed, onDone){
    // try local
    if(local){
      loader.load(local, (tx)=> { tx.encoding = THREE.sRGBEncoding; onDone(tx, local); }, undefined, ()=> {
        // local failed -> try remote
        if(remote){
          loader.load(remote, (tx2)=> { tx2.encoding = THREE.sRGBEncoding; onDone(tx2, remote); }, undefined, ()=> {
            // remote failed -> embed
            loader.load(embed, (tx3)=> { tx3.encoding = THREE.sRGBEncoding; onDone(tx3, embed); }, undefined, ()=> onDone(null, null));
          });
        } else {
          loader.load(embed, (tx3)=> { tx3.encoding = THREE.sRGBEncoding; onDone(tx3, embed); }, undefined, ()=> onDone(null, null));
        }
      });
      return;
    }
    // no local, try remote
    if(remote){
      loader.load(remote, (tx2)=> { tx2.encoding = THREE.sRGBEncoding; onDone(tx2, remote); }, undefined, ()=> {
        loader.load(embed, (tx3)=> { tx3.encoding = THREE.sRGBEncoding; onDone(tx3, embed); }, undefined, ()=> onDone(null,null));
      });
      return;
    }
    // only embed
    loader.load(embed, (tx3)=> { tx3.encoding = THREE.sRGBEncoding; onDone(tx3, embed); }, undefined, ()=> onDone(null,null));
  }

  // layout 15 artworks (3 rows x 5)
  const colsX = [-10, -5, 0, 5, 10];
  const rowsY = [9.2, 5.0, 1.0];
  const sizesTop = [{w:4.2,h:2.6},{w:3.8,h:2.6},{w:4.6,h:3.0},{w:3.8,h:2.6},{w:3.6,h:2.6}];
  const sizesMid = [{w:2.8,h:2.0},{w:3.6,h:2.4},{w:3.0,h:2.2},{w:2.6,h:1.8},{w:2.6,h:1.8}];
  const sizesBot = [{w:2.4,h:1.6},{w:3.4,h:2.2},{w:1.6,h:1.2},{w:2.0,h:1.4},{w:2.8,h:1.8}];

  // YOUR 15 remote URLs (in the order you provided)
  const remotes = [
    "https://wl-sympa.cf.tsp.li/resize/728x/jpg/fec/bd8/609eda588486cabdba47273f9d.jpg",
    "https://api.playbacpresse.fr/uploads/media/article_lepq/2019/06/3c217963a97bb7b456cf4c4ad5a5a8e196eba9c9.jpeg",
    "https://i.pinimg.com/originals/02/56/8d/02568d4a6255cf6df0ce70f0bc60990c.jpg",
    "https://static.wixstatic.com/media/42f875_95a803a7a7eb469d9bf09cd4189eb7c1~mv2.jpg/v1/fill/w_568,h_684,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/42f875_95a803a7a7eb469d9bf09cd4189eb7c1~mv2.jpg",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9pv1UtKNhcv40vqs8AV-2orKBLADzZ4QcsuhHFxMLEKvG1dbiFyQUzju2kFENYy7t7rM&usqp=CAU",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVNmJy5sqUiJZV6n5tqOvv5laVLWI1jQaSug&s",
    "https://m1.quebecormedia.com/emp/emp/10805294_3573955536bc56-dfc2-4281-9102-29f6888b6f66_ORIGINAL.jpg?impolicy=crop-resize&x=0&y=0&w=1000&h=800&width=1400",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYvemMcab6FQg0UyTMOS74pOU_aLf5D8SaBQ&s",
    "https://prmeng.rosselcdn.net/sites/default/files/dpistyles_v2/prm_16_9_856w/2024/07/21/node_544543/43911126/public/2024/07/21/21909496.jpeg?itok=hBuKnUzs1721578153",
    "https://personnages.cd/storage/biographies/March2022/0s9wqSPnSgmeAy5nAcfw-cropped-262x314.webp",
    "https://media.lesechos.com/api/v1/images/view/687f4186fcf62d82c0035e05/300x300/atelier-de-joseph-siffred-duplessis-louis-xvi-en-costume-de-sacre-p1418-musee-carnavalet.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/John_Wayne_-_still_portrait.jpg/250px-John_Wayne_-_still_portrait.jpg",
    "https://i.pinimg.com/236x/f6/48/6d/f6486d98a896606c3d9526e94bc005b9.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Martin_Luther_King_press_conference_01269u_edit.jpg/330px-Martin_Luther_King_press_conference_01269u_edit.jpg",
    "https://cdn.artphotolimited.com/images/5b9fc1ecac06024957be8806/300x300/jacques-chirac-lors-d-un-interview.jpg"
  ];

  const titles = ['Paysage A','Paysage B','Paysage C','Paysage D','Marine E','Rembrandt F','Monet G','Cezanne H','Kahlo I','Pièce J','Renoir K','Portrait L','Image M','MLK N','Chirac O'];
  const descs  = titles.map(t => `${t} — Description courte. Exemple.`);

  // build layout array
  const items = [];
  for(let col=0; col<5; col++){
    items.push({
      x: colsX[col], y: rowsY[0], w: sizesTop[col].w, h: sizesTop[col].h,
      local:`./images/c${col+1}.jpg`, remote: remotes[col], title: titles[col], desc: descs[col],
      embed: svgDataURL('#bfa77a', titles[col].slice(0,1))
    });
  }
  for(let col=0; col<5; col++){
    const idx = col + 5;
    items.push({
      x: colsX[col], y: rowsY[1], w: sizesMid[col].w, h: sizesMid[col].h,
      local:`./images/c${idx+1}.jpg`, remote: remotes[idx], title: titles[idx], desc: descs[idx],
      embed: svgDataURL('#d0b089', titles[idx].slice(0,1))
    });
  }
  for(let col=0; col<5; col++){
    const idx = col + 10;
    items.push({
      x: colsX[col], y: rowsY[2], w: sizesBot[col].w, h: sizesBot[col].h,
      local:`./images/c${idx+1}.jpg`, remote: remotes[idx], title: titles[idx], desc: descs[idx],
      embed: svgDataURL('#b08966', titles[idx].slice(0,1))
    });
  }

  // interactive list
  const interactive = [];

  // function to create 4-piece frame (left,right,top,bottom)
  function createFrameBorder(centerX, centerY, z, w, h, thickness=0.12, depth=0.06){
    const group = new THREE.Group();
    // left
    const left = new THREE.Mesh(new THREE.BoxGeometry(thickness, h + thickness*2, depth), goldMat);
    left.position.set(centerX - (w/2) - (thickness/2), centerY, z);
    group.add(left);
    // right
    const right = new THREE.Mesh(new THREE.BoxGeometry(thickness, h + thickness*2, depth), goldMat);
    right.position.set(centerX + (w/2) + (thickness/2), centerY, z);
    group.add(right);
    // top
    const top = new THREE.Mesh(new THREE.BoxGeometry(w + thickness*2, thickness, depth), goldMat);
    top.position.set(centerX, centerY + (h/2) + (thickness/2), z);
    group.add(top);
    // bottom
    const bottom = new THREE.Mesh(new THREE.BoxGeometry(w + thickness*2, thickness, depth), goldMat);
    bottom.position.set(centerX, centerY - (h/2) - (thickness/2), z);
    group.add(bottom);

    // inner darker inset (thin plane to simulate bevel)
    const inset = new THREE.Mesh(new THREE.BoxGeometry(w - 0.06, h - 0.06, 0.04), innerBevelMat);
    inset.position.set(centerX, centerY, z + 0.02);
    group.add(inset);

    return group;
  }

  // create each artwork (image plane + frame + plaque)
  function createArtwork(it){
    // image plane (placeholder)
    const imgMat = new THREE.MeshStandardMaterial({ map: placeholderTex(it.title), roughness:0.7 });
    const imgPlane = new THREE.Mesh(new THREE.PlaneGeometry(it.w, it.h), imgMat);
    imgPlane.position.set(it.x, it.y, backZ + 0.31);
    // tiny random rotation to feel organic (small)
    imgPlane.rotation.z = (Math.random()*2-1) * 0.02;
    scene.add(imgPlane);

    // visible golden frame (four pieces) placed slightly behind the plane
    const frame = createFrameBorder(it.x, it.y, backZ + 0.18, it.w + 0.00, it.h + 0.00, 0.12, 0.08);
    frame.rotation.z = imgPlane.rotation.z;
    scene.add(frame);

    // plaque under (title)
    const c = document.createElement('canvas'); c.width = 512; c.height = 80;
    const cx = c.getContext('2d');
    cx.fillStyle = '#fbf7f2'; cx.fillRect(0,0,c.width,c.height);
    cx.fillStyle = '#222'; cx.font = '18px Georgia'; cx.textAlign = 'center';
    cx.fillText(it.title, c.width/2, c.height/2 + 6);
    const pTex = new THREE.CanvasTexture(c); pTex.encoding = THREE.sRGBEncoding;
    const plaqueW = Math.min(1.6, it.w * 0.85);
    const plaqueH = 0.12 * (plaqueW / 1.6);
    const plaque = new THREE.Mesh(new THREE.PlaneGeometry(plaqueW, plaqueH), new THREE.MeshBasicMaterial({ map: pTex }));
    plaque.position.set(it.x, it.y - (it.h/2) - (plaqueH/2) - 0.06, backZ + 0.33);
    plaque.rotation.z = imgPlane.rotation.z;
    scene.add(plaque);

    // spotlight above each painting
    const sp = new THREE.SpotLight(0xfff7e8, 1.05, 8, Math.PI/14, 0.55);
    sp.position.set(it.x, it.y + 1.2, backZ + 2.0);
    sp.target = imgPlane;
    scene.add(sp); scene.add(sp.target);

    // load texture (local -> remote -> embed)
    loadWithFallback(it.local, it.remote, it.embed, (tex, src)=>{
      if(tex){
        tex.flipY = false; // ensure orientation looks correct on PlaneGeometry
        tex.encoding = THREE.sRGBEncoding;
        imgMat.map = tex;
        imgMat.needsUpdate = true;
        imgPlane.userData = { src: src, title: it.title, desc: it.desc };
      } else {
        // fallback: assign embed data url through loader as last attempt
        loader.load(it.embed, (tx)=>{ tx.encoding = THREE.sRGBEncoding; imgMat.map = tx; imgMat.needsUpdate = true; imgPlane.userData = { src: it.embed, title: it.title, desc: it.desc }; }, undefined, ()=> { imgPlane.userData = { src: it.embed, title: it.title, desc: it.desc }; });
      }
    });

    interactive.push(imgPlane);
  }

  // create all artworks
  items.forEach(it => createArtwork(it));

  // door on right side
  const doorW = 1.6, doorH = 2.4, doorT = 0.12;
  const hingeLeft = false;
  const doorPivot = new THREE.Object3D();
  const pivotX = hingeLeft ? -wallWidth/2 + 1.6 : wallWidth/2 - 1.6;
  doorPivot.position.set(pivotX, 1.2, backZ + 0.06);
  scene.add(doorPivot);

  const dCanvas = document.createElement('canvas'); dCanvas.width=512; dCanvas.height=1024;
  const dctx = dCanvas.getContext('2d');
  dctx.fillStyle = '#5a3a2a'; dctx.fillRect(0,0,512,1024);
  for(let x=0;x<512;x+=60){ dctx.fillStyle = x%120? '#4f2f1e' : '#51321f'; dctx.fillRect(x,0,36,1024); }
  const doorTex = new THREE.CanvasTexture(dCanvas); doorTex.encoding = THREE.sRGBEncoding;
  const doorMat = new THREE.MeshStandardMaterial({ map: doorTex, roughness:0.45 });

  const doorMesh = new THREE.Mesh(new THREE.BoxGeometry(doorW, doorH, doorT), doorMat);
  doorMesh.position.set( hingeLeft ? -doorW/2 : doorW/2, doorH/2, 0 );
  doorPivot.add(doorMesh);

  // door frame
  const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(doorW + 0.18, doorH + 0.18, 0.18), new THREE.MeshStandardMaterial({ color:0x2f1f14, roughness:0.45 }));
  doorFrame.position.set(pivotX, doorH/2, backZ - 0.06);
  scene.add(doorFrame);
  interactive.push(doorMesh);

  // Raycaster / interactions
  const ray = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let hovered = false, hoveredObj = null;

  window.addEventListener('pointermove', (e)=> {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = - (e.clientY / window.innerHeight) * 2 + 1;
  });

  window.addEventListener('click', ()=> {
    if(hoveredObj){
      if(hoveredObj === doorMesh){
        openDoorAndNavigate();
        return;
      }
      openPanel(hoveredObj.userData || {});
    }
  });

  // door animation + navigate
  let doorAnimating = false, doorOpen = false;
  const targetPage = 'chronologie.html';
  function openDoorAndNavigate(){
    if(doorAnimating) return;
    doorAnimating = true;
    const start = { a: doorPivot.rotation.y };
    const end = doorOpen ? 0 : (hingeLeft ? -Math.PI/2 + 0.02 : Math.PI/2 - 0.02);
    gsap.to(start, {
      a: end, duration: 0.9, ease: 'power2.inOut',
      onUpdate: ()=> doorPivot.rotation.y = start.a,
      onComplete: ()=> {
        doorAnimating = false; doorOpen = !doorOpen;
        if(doorOpen) setTimeout(()=> window.location.href = targetPage, 450);
      }
    });
  }

  // overlay panel logic
  const panel = document.getElementById('panel');
  const panelImage = document.getElementById('panel-image');
  const panelTitle = document.getElementById('panel-title');
  const panelDesc = document.getElementById('panel-desc');
  const panelClose = document.getElementById('panel-close');

  function openPanel(ud){
    panelImage.src = ud.src || items[0].embed;
    panelTitle.textContent = ud.title || 'Œuvre';
    panelDesc.textContent = ud.desc || 'Description indisponible.';
    panel.setAttribute('aria-hidden','false');
    gsap.fromTo('#panel', { opacity: 0 }, { opacity: 1, duration: 0.22 });
  }
  function closePanel(){ panel.setAttribute('aria-hidden','true'); gsap.to('#panel', { opacity:0, duration:0.15 }); }
  panelClose.addEventListener('click', closePanel);
  window.addEventListener('keydown', (e)=> { if(e.key === 'Escape') closePanel(); });

  // animate loop + hover detection
  function animate(){
    requestAnimationFrame(animate);
    ray.setFromCamera(pointer, camera);
    const hits = ray.intersectObjects(interactive, true);
    if(hits.length > 0){
      let obj = hits[0].object;
      while(obj && !obj.geometry) obj = obj.parent;
      hoveredObj = obj;
      if(!hovered){ hovered = true; document.body.classList.add('cursor-pointer'); }
    } else {
      hoveredObj = null;
      if(hovered){ hovered = false; document.body.classList.remove('cursor-pointer'); }
    }
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  // HUD buttons
  document.getElementById('btn-accueil').addEventListener('click', ()=> window.location.href = 'index.html');
  document.getElementById('btn-chronologie').addEventListener('click', ()=> window.location.href = 'chronologie.html');
  document.querySelectorAll('#panel-links button').forEach(b => {
    b.addEventListener('click', (e)=> {
      const tgt = e.currentTarget.getAttribute('data-target');
      if(tgt) window.location.href = tgt;
    });
  });

  // camera intro
  camera.position.set(0, 1.6, 26);
  gsap.to(camera.position, { x:0, y:1.8, z:16, duration:1.2, ease:'power3.out', onUpdate: ()=> camera.lookAt(0,1.8,0) });

  console.log('Galerie initialisée — 15 tableaux (remote images set).');

})();
