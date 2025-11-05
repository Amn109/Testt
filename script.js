// script.js - robust painting textures: local -> remote (crossOrigin) -> embedded fallback
// Requires three r0.146.0 + OrbitControls + gsap (déjà inclus dans ton HTML)

(function(){
  const canvas = document.getElementById('museum-canvas');

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf2efe9);

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.physicallyCorrectLights = true;
  renderer.outputEncoding = THREE.sRGBEncoding;

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, 1.6, 8);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.minDistance = 2.2;
  controls.maxDistance = 18;
  controls.maxPolarAngle = Math.PI / 2.1;

  window.addEventListener('resize', onWindowResize);
  function onWindowResize(){
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // ---------- LIGHTS ----------
  const ambient = new THREE.HemisphereLight(0xffffff, 0xaaaaaa, 0.45);
  scene.add(ambient);

  const skylightMat = new THREE.MeshStandardMaterial({ emissive: 0xffffff, emissiveIntensity: 1.6, color: 0xffffff, roughness: 1 });
  const skylight = new THREE.Mesh(new THREE.PlaneGeometry(6.6, 3.2), skylightMat);
  skylight.rotation.x = -Math.PI/2;
  skylight.position.set(0, 4.5, 0);
  scene.add(skylight);

  const skylFill1 = new THREE.PointLight(0xffffff, 0.9, 25, 2);
  skylFill1.position.set(0, 4.4, 0);
  scene.add(skylFill1);

  // ---------- FLOOR ----------
  function makeWoodTexture(w=1024, h=1024){
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#7a5636'; ctx.fillRect(0,0,w,h);
    ctx.fillStyle = '#6d4a2f';
    for (let y=0; y<w; y+=32){
      ctx.fillRect(0, y, w, 20);
      for (let x=0; x<w; x+=120){
        ctx.globalAlpha = 0.08;
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.ellipse(x + (Math.random()*40 - 20), y + 10 + (Math.random()*6 - 3), 8, 4, Math.random()*Math.PI, 0, Math.PI*2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
    ctx.globalAlpha = 0.06; ctx.fillStyle = '#fff';
    for (let i=0;i<10;i++){ ctx.fillRect(i*110, 0, 2, h); }
    ctx.globalAlpha = 1;
    return new THREE.CanvasTexture(c);
  }

  const floorTex = makeWoodTexture(2048,2048);
  floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
  floorTex.repeat.set(6,4);
  const floorMat = new THREE.MeshStandardMaterial({ map: floorTex, metalness: 0.16, roughness: 0.45 });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(24, 14), floorMat);
  floor.rotation.x = -Math.PI/2; floor.position.y = 0; scene.add(floor);
  const gloss = new THREE.Mesh(new THREE.PlaneGeometry(24,14), new THREE.MeshStandardMaterial({ color: 0x000000, metalness: 0.2, roughness: 0.9, transparent: true, opacity: 0.03 }));
  gloss.rotation.x = -Math.PI/2; gloss.position.y = 0.01; scene.add(gloss);

  // ---------- WALLS / ARCH / FURNITURE ----------
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xf7f3ee, roughness: 0.92 });
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(20, 6, 0.6), wallMat); backWall.position.set(0,3,-7); scene.add(backWall);
  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.6,6,14), wallMat); leftWall.position.set(-10,3,0); scene.add(leftWall);
  const rightWall = leftWall.clone(); rightWall.position.set(10,3,0); scene.add(rightWall);

  const innerLeft = new THREE.Mesh(new THREE.BoxGeometry(6, 4.2, 0.4), wallMat); innerLeft.position.set(-6.8,2.5,-1.6); scene.add(innerLeft);
  const innerRight = innerLeft.clone(); innerRight.position.set(6.8,2.5,-1.6); scene.add(innerRight);

  const archLeft = new THREE.Mesh(new THREE.BoxGeometry(1.2, 4.6, 0.6), new THREE.MeshStandardMaterial({ color:0xece7e2, roughness:0.9 }));
  archLeft.position.set(-2.8, 2.3, -7); scene.add(archLeft);
  const archRight = archLeft.clone(); archRight.position.set(2.8,2.3,-7); scene.add(archRight);
  const archTop = new THREE.Mesh(new THREE.BoxGeometry(6, 1.0, 0.6), new THREE.MeshStandardMaterial({ color:0xece7e2, roughness:0.9 }));
  archTop.position.set(0,4.0,-7); scene.add(archTop);

  // bench + pedestal
  const benchMat = new THREE.MeshStandardMaterial({ color: 0x333033, metalness:0.12, roughness:0.5 });
  const seat = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.18, 0.5), benchMat); seat.position.set(0,0.45,2.5); scene.add(seat);
  const legMat = new THREE.MeshStandardMaterial({ color:0x222222, metalness:0.45, roughness:0.3 });
  const legL = new THREE.Mesh(new THREE.BoxGeometry(0.12,0.45,0.12), legMat); legL.position.set(-1.1,0.225,2.5); scene.add(legL);
  const legR = legL.clone(); legR.position.set(1.1,0.225,2.5); scene.add(legR);

  const pedestalMat = new THREE.MeshStandardMaterial({ color: 0xf0efe8, roughness: 0.95 });
  const pedestal = new THREE.Mesh(new THREE.BoxGeometry(0.8,1.0,0.6), pedestalMat); pedestal.position.set(-3.2,0.5,1.4); scene.add(pedestal);
  const bustMat = new THREE.MeshStandardMaterial({ color: 0xfffbf7, metalness:0.02, roughness:0.6 });
  const bust = new THREE.Mesh(new THREE.SphereGeometry(0.28,32,32), bustMat); bust.position.set(-3.2,1.05,1.4); scene.add(bust);

  // ---------- EMBEDDED FALLBACK & HELPERS ----------
  function svgDataURL(color, label){
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='900'><rect width='100%' height='100%' fill='${color}'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Georgia, serif' font-size='80' fill='#ffffff' opacity='0.95'>${label}</text></svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }
  const embeddedImages = [
    svgDataURL('#b85c4b','Image 1'),
    svgDataURL('#4b79b8','Image 2'),
    svgDataURL('#6abf69','Image 3'),
    svgDataURL('#d9a94b','Image 4')
  ];

  // robust image loader using HTMLImageElement (allows crossOrigin)
  function tryLoadTextureSequence(localUrl, remoteUrl, embedUrl, onSuccess, onFail){
    const maxAniso = renderer.capabilities.getMaxAnisotropy ? renderer.capabilities.getMaxAnisotropy() : 1;

    function makeTextureFromImage(img){
      const tex = new THREE.Texture(img);
      tex.needsUpdate = true;
      tex.encoding = THREE.sRGBEncoding;
      tex.flipY = false; // plane UVs work better with flipY=false when using Image -> Texture
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.anisotropy = maxAniso;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.generateMipmaps = true;
      return tex;
    }

    // 1) try local (file:// or relative path)
    if(localUrl){
      const imgLocal = new Image();
      imgLocal.onload = () => {
        const tx = makeTextureFromImage(imgLocal);
        console.log('Loaded LOCAL image:', localUrl);
        onSuccess(tx);
      };
      imgLocal.onerror = () => {
        // try remote next
        tryRemote();
      };
      // for local file:// the browser will often allow loading the file when src points to relative path
      imgLocal.src = localUrl;
      return;
    } else {
      tryRemote();
    }

    // remote attempt with crossOrigin
    function tryRemote(){
      if(!remoteUrl){
        // go to embed directly
        useEmbed();
        return;
      }
      const imgRem = new Image();
      imgRem.crossOrigin = 'anonymous';
      imgRem.onload = () => {
        const tx = makeTextureFromImage(imgRem);
        console.log('Loaded REMOTE image:', remoteUrl);
        onSuccess(tx);
      };
      imgRem.onerror = () => {
        useEmbed();
      };
      imgRem.src = remoteUrl;
    }

    function useEmbed(){
      const imgE = new Image();
      imgE.onload = () => {
        const tx = makeTextureFromImage(imgE);
        console.log('Using EMBEDDED fallback texture');
        onSuccess(tx);
      };
      imgE.onerror = () => {
        console.error('All attempts failed for', localUrl, remoteUrl);
        if(onFail) onFail();
      };
      imgE.src = embedUrl;
    }
  }

  // ---------- PAINTINGS (BACK WALL) - plaqués sur mur ----------
  const backZ = -6.65; // légèrement devant la face du mur
  const paintingData = [
    { pos: [-6.5, 2.15, backZ], size: [2.2, 1.6], local:'./images/1.jpg', remote:'https://upload.wikimedia.org/wikipedia/commons/3/31/Antoine_Watteau_-_Embarkation_for_Cythera.jpg', embed: embeddedImages[0] },
    { pos: [-2.2, 2.15, backZ], size: [1.8, 1.3], local:'./images/2.jpg', remote:'https://upload.wikimedia.org/wikipedia/commons/2/24/Jean-Honor%C3%A9_Fragonard_-_The_Swing.jpg', embed: embeddedImages[1] },
    { pos: [2.2, 2.15, backZ], size: [1.8, 1.3], local:'./images/3.jpg', remote:'https://upload.wikimedia.org/wikipedia/commons/1/1b/%27The_Birth_of_Venus%27_by_Sandro_Botticelli_%281448-1486%29.jpg', embed: embeddedImages[2] },
    { pos: [6.5, 2.15, backZ], size: [2.2, 1.6], local:'./images/4.jpg', remote:'https://upload.wikimedia.org/wikipedia/commons/6/62/Carl_Henning_Pedersen_-_art.jpg', embed: embeddedImages[3] }
  ];

  // helper : ajouter plaque texte sous un plane (tableau)
  function addPlaque(targetPlane, text){
    const c = document.createElement('canvas'); c.width = 512; c.height = 128;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#faf7f2'; ctx.fillRect(0,0,c.width,c.height);
    ctx.fillStyle = '#222'; ctx.font = '20px Georgia'; ctx.textAlign = 'center';
    ctx.fillText(text, c.width/2, c.height/2 + 8);
    const tex = new THREE.CanvasTexture(c); tex.encoding = THREE.sRGBEncoding;
    const mat = new THREE.MeshBasicMaterial({ map: tex });
    const w = Math.min(1.6, targetPlane.geometry.parameters.width * 0.75);
    const h = 0.12 * (w / 1.6);
    const plaque = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    plaque.position.set(targetPlane.position.x, targetPlane.position.y - (targetPlane.geometry.parameters.height/2) - (h/2) - 0.08, targetPlane.position.z + 0.02);
    plaque.rotation.copy(targetPlane.rotation);
    scene.add(plaque);
    return plaque;
  }

  function createPainting(p, idx){
    // placeholder canvas texture while loading
    const placeholderCanvas = document.createElement('canvas'); placeholderCanvas.width = 800; placeholderCanvas.height = 600;
    const ctx = placeholderCanvas.getContext('2d'); ctx.fillStyle = '#efe7df'; ctx.fillRect(0,0,800,600);
    ctx.fillStyle='#c9b9a3'; ctx.font='28px Georgia'; ctx.textAlign='center'; ctx.fillText('Chargement image...',400,320);
    const canvasTexPlaceholder = new THREE.CanvasTexture(placeholderCanvas);
    canvasTexPlaceholder.encoding = THREE.sRGBEncoding;
    canvasTexPlaceholder.needsUpdate = true;

    // material uses placeholder until the real texture is loaded
    const matCanvas = new THREE.MeshStandardMaterial({ map: canvasTexPlaceholder, roughness: 0.7 });

    const plane = new THREE.Mesh(new THREE.PlaneGeometry(p.size[0], p.size[1]), matCanvas);
    plane.position.set(p.pos[0], p.pos[1], p.pos[2] + 0.02);
    plane.rotation.y = 0;
    scene.add(plane);

    const frame = new THREE.Mesh(new THREE.BoxGeometry(p.size[0]+0.14, p.size[1]+0.14, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x93601b, metalness: 0.9, roughness: 0.2 }));
    frame.position.copy(plane.position);
    frame.rotation.copy(plane.rotation);
    frame.position.z -= 0.03; scene.add(frame);

    // spotlight
    const sp = new THREE.SpotLight(0xfff6e8, 1.2, 8, Math.PI/14, 0.6);
    sp.position.set(p.pos[0], p.pos[1] + 1.6, p.pos[2] + 1.3);
    sp.target = plane; scene.add(sp); scene.add(sp.target);

    // load texture robustly
    tryLoadTextureSequence(p.local, p.remote, p.embed, (tx) => {
      // ensure texture params
      tx.wrapS = tx.wrapT = THREE.ClampToEdgeWrapping;
      tx.minFilter = THREE.LinearMipmapLinearFilter;
      tx.encoding = THREE.sRGBEncoding;
      tx.anisotropy = renderer.capabilities.getMaxAnisotropy ? renderer.capabilities.getMaxAnisotropy() : 1;
      tx.needsUpdate = true;

      // replace material's map and update
      matCanvas.map = tx;
      matCanvas.needsUpdate = true;

      // add plaque with generic title
      addPlaque(plane, `Œuvre ${idx+1}`);
    }, () => {
      console.warn('Texture failed for painting', idx);
      addPlaque(plane, `Œuvre ${idx+1} (image indisponible)`);
    });
  }
  paintingData.forEach((p,i)=>createPainting(p,i));

  // ---------- SIDE WALL PAINTINGS ----------
  const userImageA = 'https://www.osr.ch/fileadmin/_processed_/7/c/csm_CharlieChaplinJeune__c_RoyExportSAS_3d7e016691.jpg';
  const userImageB = 'https://wl-sympa.cf.tsp.li/resize/728x/jpg/fec/bd8/609eda588486cabdba47273f9d.jpg';

  const leftWallPaintings = [
    { x: -9.7, y: 2.15, z: -4.5,   w: 1.6, h: 1.1, local: './images/left1.jpg', remote: userImageA, embed: svgDataURL('#8c6b58','Chaplin') },
    { x: -9.7, y: 2.15, z: 0.0,    w: 1.8, h: 1.2, local: './images/left2.jpg', remote: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Claude_Monet_-_Impression%2C_soleil_levant.jpg', embed: svgDataURL('#6e8fb8','Monet') },
    { x: -9.7, y: 2.15, z: 4.5,    w: 1.6, h: 1.1, local: './images/left3.jpg', remote: 'https://upload.wikimedia.org/wikipedia/commons/5/56/Vincent_van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg', embed: svgDataURL('#324a6b','VanGogh') }
  ];

  const rightWallPaintings = [
    { x: 9.7, y: 2.15, z: -4.5,   w: 1.6, h: 1.1, local: './images/right1.jpg', remote: userImageB, embed: svgDataURL('#4b5f7a','Portrait') },
    { x: 9.7, y: 2.15, z: 0.0,    w: 1.8, h: 1.2, local: './images/right2.jpg', remote: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Masterpiece.jpg', embed: svgDataURL('#7a5b3a','Master') },
    { x: 9.7, y: 2.15, z: 4.5,    w: 1.6, h: 1.1, local: './images/right3.jpg', remote: 'https://upload.wikimedia.org/wikipedia/commons/8/80/Pierre-Auguste_Renoir_-_Luncheon_of_the_Boating_Party.jpg', embed: svgDataURL('#b87a46','Renoir') }
  ];

  function createWallPainting(entry, side, idx){
    const placeholder = document.createElement('canvas'); placeholder.width = 800; placeholder.height = 600;
    const ctx = placeholder.getContext('2d'); ctx.fillStyle = '#efe7df'; ctx.fillRect(0,0,800,600);
    ctx.fillStyle='#c9b9a3'; ctx.font='24px Georgia'; ctx.textAlign='center'; ctx.fillText('Chargement...',400,320);
    const placeholderTex = new THREE.CanvasTexture(placeholder);
    placeholderTex.encoding = THREE.sRGBEncoding;
    placeholderTex.needsUpdate = true;

    const mat = new THREE.MeshStandardMaterial({ map: placeholderTex, roughness: 0.7 });
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(entry.w, entry.h), mat);
    plane.position.set(entry.x + (side==='left' ? 0.05 : -0.05), entry.y, entry.z);
    plane.rotation.y = (side === 'left') ? Math.PI/2 : -Math.PI/2;
    scene.add(plane);

    const frame = new THREE.Mesh(new THREE.BoxGeometry(entry.w + 0.12, entry.h + 0.12, 0.06),
      new THREE.MeshStandardMaterial({ color: 0x7b4f23, metalness: 0.85, roughness: 0.25 }));
    frame.position.copy(plane.position);
    frame.rotation.copy(plane.rotation);
    frame.position.z -= (plane.rotation.y === 0 ? 0.03 : (plane.rotation.y > 0 ? 0.02 : -0.02));
    scene.add(frame);

    const sp = new THREE.SpotLight(0xfff7e8, 1.1, 6, Math.PI/12, 0.6);
    const lightX = entry.x + (side === 'left' ? 1.2 : -1.2);
    sp.position.set(lightX, entry.y + 1.5, entry.z);
    sp.target = plane; scene.add(sp); scene.add(sp.target);

    tryLoadTextureSequence(entry.local || './images/missing.jpg', entry.remote, entry.embed, (tx) => {
      tx.wrapS = tx.wrapT = THREE.ClampToEdgeWrapping;
      tx.minFilter = THREE.LinearMipmapLinearFilter;
      tx.encoding = THREE.sRGBEncoding;
      tx.anisotropy = renderer.capabilities.getMaxAnisotropy ? renderer.capabilities.getMaxAnisotropy() : 1;
      tx.needsUpdate = true;
      mat.map = tx; mat.needsUpdate = true;
      addPlaque(plane, `Œuvre mur ${side} ${idx+1}`);
    }, () => {
      addPlaque(plane, `Œuvre mur ${side} ${idx+1} (image indisponible)`);
    });
  }

  leftWallPaintings.forEach((p,i) => createWallPainting(p,'left',i));
  rightWallPaintings.forEach((p,i) => createWallPainting(p,'right',i));

  // ---------- DOOR 3D (placée devant le mur + contraste) ----------
  const doorWidth = 1.6;
  const doorHeight = 2.4;
  const doorThickness = 0.12;
  const hingeOnLeft = true; // change à false pour hinge droite

  // calculs de placement (back wall face ~ -6.7)
  const backWallFrontZ = -6.7;
  const doorCenterZ = backWallFrontZ + 0.06;
  const doorCenterY = 1.2;

  const hingeOffset = hingeOnLeft ? -doorWidth/2 : doorWidth/2;
  const hingeWorldX = 0 + hingeOffset;
  const doorPivot = new THREE.Object3D();
  doorPivot.position.set(hingeWorldX, doorCenterY, doorCenterZ);
  scene.add(doorPivot);

  // door texture (contraste plus fort)
  const doorCanvas = document.createElement('canvas'); doorCanvas.width = 512; doorCanvas.height = 1024;
  const dctx = doorCanvas.getContext('2d');
  dctx.fillStyle = '#4a2e1b'; dctx.fillRect(0,0,512,1024);
  dctx.fillStyle = '#3f2415';
  for(let x=0;x<512;x+=80){ dctx.fillRect(x+6,0,56,1024); dctx.globalAlpha = 0.06; for(let i=0;i<40;i++){ dctx.beginPath(); dctx.ellipse(x+10+Math.random()*40, Math.random()*1024, 6+Math.random()*6, 2+Math.random()*4, Math.random()*Math.PI,0,Math.PI*2); dctx.fill(); } dctx.globalAlpha = 1; }
  const doorTex = new THREE.CanvasTexture(doorCanvas); doorTex.encoding = THREE.sRGBEncoding;
  const doorMat = new THREE.MeshStandardMaterial({ map: doorTex, roughness: 0.45, metalness: 0.02 });

  const doorGeom = new THREE.BoxGeometry(doorWidth, doorHeight, doorThickness);
  const doorMesh = new THREE.Mesh(doorGeom, doorMat);
  doorMesh.position.set( hingeOnLeft ? doorWidth/2 : -doorWidth/2, 0, 0 );
  doorPivot.add(doorMesh);

  // frame + rim
  const frameThickness = 0.14;
  const frameDepth = 0.18;
  const frameMat = new THREE.MeshStandardMaterial({ color:0x2f1f14, roughness:0.45, metalness:0.08 });
  const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(doorWidth + frameThickness, doorHeight + frameThickness, frameDepth), frameMat);
  doorFrame.position.set(0, doorCenterY, doorCenterZ - (frameDepth/2) + 0.01);
  scene.add(doorFrame);

  const rim = new THREE.Mesh(new THREE.BoxGeometry(doorWidth + 0.02, doorHeight + 0.02, 0.01), new THREE.MeshStandardMaterial({ color:0xfff1d9, emissive:0x3a2a1a, emissiveIntensity:0.06, roughness:0.9, transparent:true, opacity:0.45 }));
  rim.position.set(0, doorCenterY, doorCenterZ + 0.07);
  scene.add(rim);

  // knob + plate + glass inset
  const knobMat = new THREE.MeshStandardMaterial({ color:0xd4af37, metalness:0.98, roughness:0.18 });
  const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.04,0.02,24), knobMat);
  knob.rotation.z = Math.PI/2;
  const knobLocalX = hingeOnLeft ? (doorWidth/2 - 0.2) : (-doorWidth/2 + 0.2);
  knob.position.set(knobLocalX, 0.0, doorThickness/2 + 0.02);
  doorPivot.add(knob);
  const plate = new THREE.Mesh(new THREE.BoxGeometry(0.06,0.06,0.01), knobMat);
  plate.position.set(knobLocalX, 0.0, doorThickness/2 + 0.018);
  doorPivot.add(plate);
  const glassMat = new THREE.MeshPhysicalMaterial({ color:0x0b0b0b, transparent:true, opacity:0.06, roughness:0.2 });
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(doorWidth*0.48, doorHeight*0.22), glassMat);
  glass.position.set(hingeOnLeft ? doorWidth/4 : -doorWidth/4, 0.18, doorThickness/2 + 0.03);
  doorPivot.add(glass);

  // subtle inner light to show depth when open
  const innerLight = new THREE.PointLight(0xfff3d6, 0.28, 14, 2);
  innerLight.position.set(0, 1.6, doorCenterZ - 2.0);
  scene.add(innerLight);

  // add a sign above the door
  const signCanvas = document.createElement('canvas'); signCanvas.width=512; signCanvas.height=120;
  const sctx = signCanvas.getContext('2d');
  sctx.fillStyle = '#222'; sctx.fillRect(0,0,512,120);
  sctx.fillStyle = '#fff'; sctx.font='28px Georgia'; sctx.textAlign='center';
  sctx.fillText('ENTRÉE', 256, 72);
  const signTex = new THREE.CanvasTexture(signCanvas);
  const signMat = new THREE.MeshBasicMaterial({ map: signTex, transparent: false });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.18), signMat);
  sign.position.set(0, doorCenterY + 1.3, doorCenterZ + 0.06);
  scene.add(sign);

  // interactive set (doorMesh & seat)
  const interactiveObjects = [doorMesh, seat, knob];

  // door state & animation flags
  let doorOpen = false;
  let isAnimating = false;

  // navigation config (ouvre la porte puis navigue vers multimedia.html)
  let navigateAfterOpen = true;
  const targetPage = 'galerie.html';

  function toggleDoor(){
    if(isAnimating) return;
    isAnimating = true;
    const from = { a: doorPivot.rotation.y };
    const toVal = doorOpen ? 0 : (hingeOnLeft ? -Math.PI/2 + 0.02 : Math.PI/2 - 0.02);

    gsap.to(from, {
      a: toVal,
      duration: 0.9,
      ease: 'power2.inOut',
      onUpdate: () => { doorPivot.rotation.y = from.a; },
      onComplete: () => {
        isAnimating = false;
        doorOpen = !doorOpen;
        if (doorOpen) {
          if (navigateAfterOpen) {
            window.location.href = targetPage;
          } else {
            controls.enabled = false;
            gsap.to(camera.position, {
              x: 0, y: 1.6, z: -4.2,
              duration: 1.6,
              ease: 'power2.inOut',
              onUpdate: () => { camera.lookAt(0, 1.4, -7); },
              onComplete: () => { controls.enabled = true; }
            });
          }
        }
      }
    });
  }

  function setDoorHover(on){
    if(on){
      gsap.to(doorMat, { roughness: 0.35, duration: 0.14 });
      document.body.classList.add('cursor-pointer');
    } else {
      gsap.to(doorMat, { roughness: 0.45, duration: 0.3 });
      document.body.classList.remove('cursor-pointer');
    }
  }

  // ---------- GLOBAL LIGHT TWEAKS / RIM ----------
  scene.traverse(obj => {
    if (obj.isSpotLight) {
      obj.intensity = Math.max(0.9, (obj.intensity || 1) * 1.05);
      obj.angle = Math.min(Math.PI/8, (obj.angle || 0.3) * 0.95);
      obj.penumbra = 0.6;
    }
  });

  const ceilingSoft = new THREE.PointLight(0xfff8ef, 0.28, 12, 2);
  ceilingSoft.position.set(0, 3.9, -2.8);
  scene.add(ceilingSoft);

  const rimLightLeft = new THREE.PointLight(0xfff8ee, 0.06, 12);
  rimLightLeft.position.set(-2.6, 3.6, -7.4);
  scene.add(rimLightLeft);
  const rimLightRight = rimLightLeft.clone(); rimLightRight.position.x = 2.6; scene.add(rimLightRight);

  // ---------- pointer / raycast + interactions ----------
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let hovering = false;
  window.addEventListener('pointermove', (e) => {
    pointer.x = ( e.clientX / window.innerWidth ) * 2 - 1;
    pointer.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
  });

  window.addEventListener('click', (e) => {
    if (hovering) toggleDoor();
  });
  window.addEventListener('keydown', (e)=>{ if (e.key === 'Enter') toggleDoor(); });

  // ---------- chandeliers (small lamps) ----------
  for (let i=-1;i<=1;i++){
    const lampMat = new THREE.MeshStandardMaterial({ emissive: 0xfff7e0, emissiveIntensity: 0.18, color: 0xfffff0, roughness: 0.8 });
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.13, 24, 24), lampMat);
    lamp.position.set(i*0.9, 3.7, -0.2); scene.add(lamp);
    const pl = new THREE.PointLight(0xfffbf0, 0.35, 6, 2); pl.position.set(lamp.position.x, 3.6, lamp.position.z); scene.add(pl);
  }

  // ---------- animate ----------
  const clock = new THREE.Clock();
  function animate(){
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(interactiveObjects, true);
    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const isDoorHit = (hit === doorMesh || hit === knob || hit.parent === doorPivot || hit.parent === doorMesh);
      if (isDoorHit) {
        if (!hovering){ hovering = true; setDoorHover(true); }
      } else {
        if (hovering){ hovering = false; setDoorHover(false); }
      }
    } else {
      if (hovering){ hovering = false; setDoorHover(false); }
    }

    camera.position.y += Math.sin(t*0.6) * 0.0006;
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  // cinematic entrance
  camera.position.set(0,1.0,14);
  gsap.to(camera.position, { x:0, y:1.6, z:8, duration:1.6, ease:"power3.out", onUpdate: ()=>{ camera.lookAt(0,1.4,-1.5); }});

  console.log('script.js chargé — images des tableaux : tentative local → remote → embedded. Door Z:', doorCenterZ);
})();
