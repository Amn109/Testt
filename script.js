// script.js — version finale : deux cadres modernes (URLs fournies) + correction flip vertical
// Debug : (fichier uploadé si besoin)
const UPLOADED_FILE = '/mnt/data/55a7609c-ed88-4d91-86d8-fae69a998f0b.png';
console.log('Uploaded local file (debug):', UPLOADED_FILE);

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

  // robust image loader: try local -> remote -> embedded
  function tryLoadTextureSequence(localUrl, remoteUrl, embedUrl, onSuccess, onFail){
    const maxAniso = renderer.capabilities.getMaxAnisotropy ? renderer.capabilities.getMaxAnisotropy() : 1;

    function makeTextureFromImage(img){
      const tex = new THREE.Texture(img);
      tex.needsUpdate = true;
      tex.encoding = THREE.sRGBEncoding;
      tex.flipY = false;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.anisotropy = maxAniso;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.generateMipmaps = true;
      return tex;
    }

    // 1) try local
    if(localUrl){
      const imgLocal = new Image();
      imgLocal.onload = () => { try { onSuccess(makeTextureFromImage(imgLocal)); return; } catch(e) { /* continue */ } };
      imgLocal.onerror = () => { /* continue to remote */ };
      imgLocal.src = localUrl;
      // short delay to allow local load; then try remote if nothing succeeded
      setTimeout(() => { tryRemote(); }, 500);
      return;
    } else {
      tryRemote();
    }

    function tryRemote(){
      if(!remoteUrl){
        useEmbed();
        return;
      }
      const imgRem = new Image();
      imgRem.crossOrigin = 'anonymous';
      imgRem.onload = () => { onSuccess(makeTextureFromImage(imgRem)); };
      imgRem.onerror = () => { useEmbed(); };
      imgRem.src = remoteUrl;
    }

    function useEmbed(){
      if(!embedUrl) { if(onFail) onFail(); return; }
      const imgE = new Image();
      imgE.onload = () => { onSuccess(makeTextureFromImage(imgE)); };
      imgE.onerror = () => { if(onFail) onFail(); };
      imgE.src = embedUrl;
    }
  }

  // ---------- PAINTINGS : only two modern frames near the door ----------
  const backZ = -6.65;

  // user-provided images (the two links you sent)
  const LEFT_IMAGE  = 'https://images.ladepeche.fr/api/v1/images/view/5dbeea6fd286c24066448ac5/full/image.jpg?v=1';
  const RIGHT_IMAGE = 'https://scontent-cdg4-1.xx.fbcdn.net/v/t1.6435-9/75481668_2380575275524888_1200117637502205952_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=127cfc&_nc_ohc=lb9Tt1Q_bIIQ7kNvwHwMPO7&_nc_oc=AdnqqYI3WEGb9PsyQ2G8C1vfGRsUc2sH9LAinn_VqcuGGfzbfHs4PYWjCZgghb9duPfIdFoideboftjiT7M9PNJF&_nc_zt=23&_nc_ht=scontent-cdg4-1.xx&_nc_gid=hZ7zwiamYByiPQOeOfBurQ&oh=00_AfjYPkek3WTCKgbqKbmz15yoo3PgCeCONB6L3wGBYWSDHQ&oe=69486BEC';

  // createModernFrame(localUrl|null, remoteUrl, positionVec3, size, title, flipVertical)
  function createModernFrame(localUrl, remoteUrl, positionVec3, size = [1.8, 1.3], title = '', flipVertical = false) {
    const placeholderCanvas = document.createElement('canvas'); placeholderCanvas.width = 800; placeholderCanvas.height = 540;
    const pctx = placeholderCanvas.getContext('2d');
    pctx.fillStyle = '#e6e6e6'; pctx.fillRect(0,0,placeholderCanvas.width, placeholderCanvas.height);
    pctx.fillStyle = '#666'; pctx.font = '26px Georgia'; pctx.textAlign = 'center';
    pctx.fillText('Chargement...', placeholderCanvas.width/2, placeholderCanvas.height/2);
    const placeholderTex = new THREE.CanvasTexture(placeholderCanvas);
    placeholderTex.encoding = THREE.sRGBEncoding;
    placeholderTex.needsUpdate = true;

    const imgMat = new THREE.MeshStandardMaterial({ map: placeholderTex, roughness: 0.5 });
    imgMat.polygonOffset = true; imgMat.polygonOffsetFactor = -0.6; imgMat.polygonOffsetUnits = -1;

    const w = size[0], h = size[1];
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(w, h), imgMat);
    plane.position.set(positionVec3.x, positionVec3.y, positionVec3.z + 0.02);
    // flip vertically at geometry level when requested
    plane.scale.y = flipVertical ? -1 : 1;
    scene.add(plane);

    // modern frame parts
    const frameDepth = 0.06;
    const outerW = w + 0.12, outerH = h + 0.12;
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8, roughness: 0.18 });
    frameMat.polygonOffset = true; frameMat.polygonOffsetFactor = -0.7; frameMat.polygonOffsetUnits = -2;

    const top = new THREE.Mesh(new THREE.BoxGeometry(outerW, 0.06, frameDepth), frameMat);
    top.position.set(positionVec3.x, positionVec3.y + (h/2) + 0.03, positionVec3.z - 0.02); scene.add(top);
    const bottom = top.clone(); bottom.position.set(positionVec3.x, positionVec3.y - (h/2) - 0.03, positionVec3.z - 0.02); scene.add(bottom);
    const left = new THREE.Mesh(new THREE.BoxGeometry(0.06, h, frameDepth), frameMat);
    left.position.set(positionVec3.x - (w/2) - 0.03, positionVec3.y, positionVec3.z - 0.02); scene.add(left);
    const right = left.clone(); right.position.set(positionVec3.x + (w/2) + 0.03, positionVec3.y, positionVec3.z - 0.02); scene.add(right);

    // inner bevel
    const bevelMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.6, roughness: 0.25 });
    const innerTop = new THREE.Mesh(new THREE.BoxGeometry(w - 0.06, 0.02, frameDepth + 0.002), bevelMat);
    innerTop.position.set(positionVec3.x, positionVec3.y + (h/2) + 0.01, positionVec3.z - 0.021); scene.add(innerTop);

    if (title) {
      const pc = document.createElement('canvas'); pc.width = 512; pc.height = 64;
      const pct = pc.getContext('2d');
      pct.fillStyle = '#faf7f2'; pct.fillRect(0,0,pc.width,pc.height);
      pct.fillStyle = '#222'; pct.font = '18px Georgia'; pct.textAlign = 'center';
      pct.fillText(title, pc.width/2, pc.height/2 + 6);
      const ptex = new THREE.CanvasTexture(pc);
      const plaque = new THREE.Mesh(new THREE.PlaneGeometry(Math.min(1.2, w*0.8), 0.08), new THREE.MeshBasicMaterial({ map: ptex }));
      plaque.position.set(positionVec3.x, positionVec3.y - (h/2) - 0.10, positionVec3.z + 0.02);
      scene.add(plaque);
    }

    // load texture (try local first if provided, then remote, then embed)
    tryLoadTextureSequence(localUrl, remoteUrl, svgDataURL('#666','Image'), (tx) => {
      tx.wrapS = tx.wrapT = THREE.ClampToEdgeWrapping;
      tx.minFilter = THREE.LinearMipmapLinearFilter;
      tx.encoding = THREE.sRGBEncoding;
      tx.anisotropy = renderer.capabilities.getMaxAnisotropy ? renderer.capabilities.getMaxAnisotropy() : 1;
      tx.needsUpdate = true;
      imgMat.map = tx;
      imgMat.needsUpdate = true;
    }, () => {
      console.warn('Failed to load image for', remoteUrl);
    });

    return { plane, parts: [top,bottom,left,right] };
  }

  // create two frames near the door — both flipped vertically to correct upside-down display
  createModernFrame(null, LEFT_IMAGE,  new THREE.Vector3(-2.2, 2.15, backZ), [1.8, 1.3], 'Louis Lareng — (A)', true);
  createModernFrame(null, RIGHT_IMAGE, new THREE.Vector3( 2.2, 2.15, backZ), [1.8, 1.3], 'Louis Lareng — (B)', true);

  // ---------- DOOR 3D (unchanged) ----------
  const doorWidth = 1.6;
  const doorHeight = 2.4;
  const doorThickness = 0.12;
  const hingeOnLeft = true;

  const backWallFrontZ = -6.7;
  const doorCenterZ = backWallFrontZ + 0.06;
  const doorCenterY = 1.2;

  const hingeOffset = hingeOnLeft ? -doorWidth/2 : doorWidth/2;
  const hingeWorldX = 0 + hingeOffset;
  const doorPivot = new THREE.Object3D();
  doorPivot.position.set(hingeWorldX, doorCenterY, doorCenterZ);
  scene.add(doorPivot);

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

  const frameThickness = 0.14;
  const frameDepth = 0.18;
  const frameMat = new THREE.MeshStandardMaterial({ color:0x2f1f14, roughness:0.45, metalness:0.08 });
  const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(doorWidth + frameThickness, doorHeight + frameThickness, frameDepth), frameMat);
  doorFrame.position.set(0, doorCenterY, doorCenterZ - (frameDepth/2) + 0.01);
  scene.add(doorFrame);

  const rim = new THREE.Mesh(new THREE.BoxGeometry(doorWidth + 0.02, doorHeight + 0.02, 0.01), new THREE.MeshStandardMaterial({ color:0xfff1d9, emissive:0x3a2a1a, emissiveIntensity:0.06, roughness:0.9, transparent:true, opacity:0.45 }));
  rim.position.set(0, doorCenterY, doorCenterZ + 0.07);
  scene.add(rim);

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

  const innerLight = new THREE.PointLight(0xfff3d6, 0.28, 14, 2);
  innerLight.position.set(0, 1.6, doorCenterZ - 2.0);
  scene.add(innerLight);

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

  const interactiveObjects = [doorMesh, seat, knob];

  let doorOpen = false;
  let isAnimating = false;
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

  for (let i=-1;i<=1;i++){
    const lampMat = new THREE.MeshStandardMaterial({ emissive: 0xfff7e0, emissiveIntensity: 0.18, color: 0xfffff0, roughness: 0.8 });
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.13, 24, 24), lampMat);
    lamp.position.set(i*0.9, 3.7, -0.2); scene.add(lamp);
    const pl = new THREE.PointLight(0xfffbf0, 0.35, 6, 2); pl.position.set(lamp.position.x, 3.6, lamp.position.z); scene.add(pl);
  }

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

  camera.position.set(0,1.0,14);
  gsap.to(camera.position, { x:0, y:1.6, z:8, duration:1.6, ease:"power3.out", onUpdate: ()=>{ camera.lookAt(0,1.4,-1.5); }});

  console.log('script.js chargé — cadres créés et flip vertical appliqué.');
})();
