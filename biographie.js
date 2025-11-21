// biographie.js — centre cliquable → affiche biographie Louis Lareng
(() => {
  // DOM
  const canvas = document.getElementById('scene-canvas');
  const overlay = document.getElementById('bioOverlay');
  const bioClose = document.getElementById('bioClose');
  const bioTitle = document.getElementById('bioTitle');
  const bioText = document.getElementById('bioText');
  const bioImage = document.getElementById('bioImage');
  const bioPrev = document.getElementById('bioPrev');
  const bioNext = document.getElementById('bioNext');

  // --- THREE setup ---
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b0b0b);

  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, 1.6, 8);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.maxPolarAngle = Math.PI / 2.1;
  controls.minDistance = 2.2;
  controls.maxDistance = 18;
  controls.enablePan = false;

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // lights
  scene.add(new THREE.HemisphereLight(0xffffff, 0x222222, 0.45));
  const key = new THREE.DirectionalLight(0xfff3d6, 0.7); key.position.set(6, 8, 2); scene.add(key);

  // floor
  function makeFloorCanvas(w = 2048, h = 1024) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#6b4c36'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#5a3e2b';
    for (let y = 0; y < h; y += 36) ctx.fillRect(0, y, w, 22);
    ctx.globalAlpha = 0.06; ctx.fillStyle = '#fff';
    for (let i = 0; i < 12; i++) ctx.fillRect(i * 180, 0, 2, h);
    return new THREE.CanvasTexture(c);
  }
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 20), new THREE.MeshStandardMaterial({ map: makeFloorCanvas(), roughness: 0.55 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = 0; scene.add(floor);

  // walls
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x0b0b0b, roughness: 0.97 });
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(30, 10, 0.6), wallMat); backWall.position.set(0, 5, -9.5); scene.add(backWall);
  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.6, 10, 20), wallMat); leftWall.position.set(-14.9, 5, 0); scene.add(leftWall);
  const rightWall = leftWall.clone(); rightWall.position.set(14.9, 5, 0); scene.add(rightWall);

  // bench
  const bench = new THREE.Mesh(new THREE.BoxGeometry(6, 0.18, 1.2), new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.5 }));
  bench.position.set(0, 0.45, 3.2); scene.add(bench);

  // IMAGES (inchangées)
  const IMAGES = [
    { img: "https://images.ladepeche.fr/api/v1/images/view/5dbef14fd286c20ffc76e545/full/image.jpg?v=1", title: "Photographie", desc: "Louis Lareng" },
    { img: "https://i.ytimg.com/vi/jLG6HlRHgys/mqdefault.jpg", title: "Photographie 2", desc: "Louis Lareng" },
    { img: "https://www.char-fr.net/IMG/jpg/cara_lareng_coirier-640x480.jpg", title: "1930 — Photographie 3", desc: "Louis Lareng" },
    { img: "https://www.char-fr.net/local/cache-vignettes/L672xH461/lareng-serre_1984-f6cee.jpg?1744949566", title: "Photographie 4", desc: "Louis Lareng" },
    { img: "https://cdn-s-www.dna.fr/images/7AB6C42E-5232-4848-8550-B6CF282F263A/NW_raw/louis-lareng-(au-centre)-avec-jean-jacques-buttiker-responsable-de-l-antenne-de-bartenheim-et-elisabeth-groelly-presidente-departementale-de-la-protection-civile-photos-dna-ghislaine-mougel-1424800907.jpg", title: "Photographie 5", desc: "Louis Lareng" },
    { img: "https://img.20mn.fr/HUoH0KziQsmP6ay6L2h66g/1444x920_professeur-louis-lareng-invente-samu-1968-toulouse", title: "Photographie 6", desc: "Louis Lareng" },
    { img: "https://www.char-fr.net/local/cache-vignettes/L672xH461/Lareng-Coirier_1987-ec2e3.jpg?1744932688", title: "Photographie 7", desc: "Louis Lareng" },
    { img: "https://www.lexpress.fr/resizer/bXur6AlLkP24-yYqt3jRa9NPoRA=/arc-photo-lexpress/eu-central-1-prod/public/UHCOBBLFWNFSJLZPOBORQOMCAA.jpg", title: "Photographie 8", desc: "Louis Lareng" },
    { img: "https://images.ladepeche.fr/api/v1/images/view/5c2d1e3c3e45463bf42090f1/large/image.jpg", title: "Photographie 9", desc: "Louis Lareng" },

    { img: "https://www.grandsudinsolite.fr/client/gfx/photos/produit/01-lareng-1_16373.jpg", title: "Photographie 10", desc: "Louis Lareng" },
    { img: "https://images.pexels.com/photos/20616946/pexels-photo-20616946.jpeg", title: "Pexels 2", desc: "Nouvelle image (pexels)." },
    { img: "https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg", title: "Pexels 3", desc: "Nouvelle image (pexels)." },
    { img: "https://images.pexels.com/photos/10328983/pexels-photo-10328983.jpeg", title: "Pexels 4", desc: "Nouvelle image (pexels)." },

    { img: "https://apprendre-la-photographie.net/wp-content/uploads/2016/12/image-noir-blanc-paysage-eau-filtre-nd-luke-austin.jpg", title: "Paysage NB", desc: "Paysage NB" },
    { img: "https://www.artenza.fr/cdn/shop/collections/Entre-ombre-et-lumiere-alexandre-lawniczak-collections.jpg?v=1722254963&width=4669", title: "Artenza", desc: "Entre ombre et lumière." },
    { img: "https://cdn.artphotolimited.com/images/60df3a8fbd40b852ce5e0fff/300x300/entre-ciel-et-terre.jpg", title: "Entre ciel & terre", desc: "Photographie." },
    { img: "https://storage.googleapis.com/yk-cdn/photos/cusblack/andrea-pavan/point.jpg", title: "Point", desc: "Photographie moderne." }
  ];

  // placeholder texture
  const placeholderCanvas = document.createElement('canvas');
  placeholderCanvas.width = 800; placeholderCanvas.height = 540;
  const pctx = placeholderCanvas.getContext('2d');
  pctx.fillStyle = '#efe7df'; pctx.fillRect(0, 0, placeholderCanvas.width, placeholderCanvas.height);
  pctx.fillStyle = '#c9b9a3';
  pctx.font = '26px Georgia';
  pctx.textAlign = 'center';
  pctx.fillText('Chargement...', placeholderCanvas.width / 2, placeholderCanvas.height / 2);
  const PLACEHOLDER_TEX = new THREE.CanvasTexture(placeholderCanvas);

  // loader (voir version précédente pour robustesse)
  function loadImageAsTexture(src, timeoutMs = 9000) {
    return new Promise((resolve, reject) => {
      const img = new Image(); img.crossOrigin = 'anonymous';
      let done = false;
      const to = setTimeout(() => { if (done) return; done = true; img.src=''; reject(new Error('timeout')); }, timeoutMs);
      img.onload = () => { if (done) return; done = true; clearTimeout(to); try { const tex = new THREE.Texture(img); tex.needsUpdate = true; tex.encoding = THREE.sRGBEncoding; tex.flipY = true; tex.generateMipmaps = false; tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter; resolve(tex); } catch(e){ reject(e);} };
      img.onerror = () => { if (done) return; done = true; clearTimeout(to); reject(new Error('loaderror')); };
      img.src = src;
    });
  }
  function loadTwoPass(url, onThumb, onFull) {
    const cleaned = url.replace(/^https?:\/\//i, '');
    const thumbUrl = 'https://images.weserv.nl/?url=' + encodeURIComponent(cleaned) + '&w=360&fit=cover&q=70';
    // thumb
    loadImageAsTexture(thumbUrl).then(t => onThumb && onThumb(t)).catch(()=>{});
    // full
    loadImageAsTexture(url).then(t => onFull && onFull(t)).catch(()=>{});
  }

  // create paintings
  const gallery = new THREE.Group(); scene.add(gallery);
  const paintingPlanes = [];
  const planeToGroup = new Map();

  function createPainting(data, pos, rotationY = 0, plaqueText = '') {
    const group = new THREE.Group();
    group.position.copy(pos);
    group.rotation.y = rotationY;

    const w = 1.6, h = 1.1;
    const frame = new THREE.Mesh(new THREE.BoxGeometry(w + 0.12, h + 0.12, 0.08), new THREE.MeshStandardMaterial({ color: 0x5a3f2a, metalness: 0.15, roughness: 0.45 }));
    frame.position.set(0, 0, -0.06); group.add(frame);

    const planeMat = new THREE.MeshBasicMaterial({ map: PLACEHOLDER_TEX, toneMapped: false });
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(w, h), planeMat);
    plane.position.set(0, 0, 0);
    plane.userData = { data };
    group.add(plane);

    const pcanvas = document.createElement('canvas'); pcanvas.width = 512; pcanvas.height = 96;
    const pctx2 = pcanvas.getContext('2d');
    pctx2.fillStyle = '#faf7f2'; pctx2.fillRect(0, 0, pcanvas.width, pcanvas.height);
    pctx2.fillStyle = '#222'; pctx2.font = '18px Georgia'; pctx2.textAlign = 'center';
    pctx2.fillText(plaqueText || data.title, pcanvas.width / 2, pcanvas.height / 2 + 8);
    const plaque = new THREE.Mesh(new THREE.PlaneGeometry(Math.min(1.2, w * 0.8), 0.12), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(pcanvas) }));
    plaque.position.set(0, -(h / 2) - 0.14, 0.02);
    group.add(plaque);

    gallery.add(group);
    paintingPlanes.push(plane);
    planeToGroup.set(plane.uuid, group);

    // load two-pass (thumb then full)
    loadTwoPass(data.img, (thumbTex) => { try { plane.material.map = thumbTex; plane.material.needsUpdate = true; } catch(e){}; },
                        (fullTex)  => { try { plane.material.map = fullTex; plane.material.needsUpdate = true; } catch(e){}; });

    return group;
  }

  // layout: back 4, left 3, right 3
  let iImg = 0;
  const backStartX = -12.0, backStep = 6.7;
  for (let i = 0; i < 4 && iImg < IMAGES.length; i++, iImg++) {
    createPainting(IMAGES[iImg], new THREE.Vector3(backStartX + i * backStep, 2.6, -8.9), 0, IMAGES[iImg].title);
  }
  for (let i = 0; i < 3 && iImg < IMAGES.length; i++, iImg++) {
    createPainting(IMAGES[iImg], new THREE.Vector3(-13.4, 2.6, -4.0 + i * 3.2), Math.PI / 2, IMAGES[iImg].title);
  }
  for (let i = 0; i < 3 && iImg < IMAGES.length; i++, iImg++) {
    createPainting(IMAGES[iImg], new THREE.Vector3(13.4, 2.6, -4.0 + i * 3.2), -Math.PI / 2, IMAGES[iImg].title);
  }

  // --- IDENTIFIER le tableau central et lui associer la fiche Louis Lareng ---
  // compute nearest painting to center back wall (0,2.6,-8.9)
  (function bindCenterToLareng() {
    const centerWorld = new THREE.Vector3(0, 2.6, -8.9);
    let best = null; let bestD = Infinity;
    paintingPlanes.forEach(p => {
      const w = new THREE.Vector3(); p.getWorldPosition(w);
      const d = w.distanceTo(centerWorld);
      if (d < bestD) { bestD = d; best = p; }
    });
    if (!best) return;
    const larengDesc = `
<p><strong>Louis Lareng</strong>, né le 8 avril 1923 à Ayzac-Ost (Hautes-Pyrénées) et mort le 3 novembre 2019 à Toulouse, est un professeur agrégé de médecine spécialiste en anesthésie réanimation et homme politique français.</p>

<p>Il est le fondateur du service d'aide médicale urgente (SAMU) avec le docteur Madeleine Bertrand. Le service du SAMU fait son apparition pour la première fois sous cette appellation dans un compte rendu de commission administrative des hôpitaux de Toulouse en 1968.</p>

<p>Il sera officialisé en 1986 lorsque Louis Lareng en tant que député fera adopter la loi « Lareng ».</p>

<p>Il a étudié à la faculté de médecine de Toulouse, et longtemps exercé à l'Hôpital de Purpan. Il est aussi président de la société européenne de télémédecine et e-S@nté, et membre du comité exécutif de la société internationale de télémédecine.</p>

<p>Il fut également président de la Fédération nationale de protection civile pendant 18 ans (1991 à 2009) et a présidé l'association départementale de protection civile de Haute-Garonne.</p>

<ul>
<li>Licencié en sciences biologiques en 1953.</li>
<li>Docteur en médecine depuis 1955.</li>
<li>Professeur d'anesthésie réanimation depuis 1961.</li>
<li>Fondateur du SAMU en 1967.</li>
<li>Président de l'université Paul-Sabatier de 1970 à 1976.</li>
<li>Maire d'Ayzac-Ost de 1965 à 1977.</li>
<li>Député de la 3e circonscription de la Haute-Garonne de 1981 à 1986 (groupe socialiste).</li>
</ul>

<p>Distinctions :</p>
<ul>
<li>1969 : Officier de l'ordre national du Mérite</li>
<li>1976 : Commandeur de l'ordre des Palmes académiques</li>
<li>2016 : Grand officier de la Légion d'honneur</li>
</ul>

<p>Publications et ouvrages : études et contributions majeures listées dans l'historique professionnel.</p>

<p>Le bâtiment abritant le SAMU 31 à l'hôpital Purpan de Toulouse s'appelle « Pavillon Louis Lareng ». Le 30 mars 2013, France 3 Midi-Pyrénées diffusa un documentaire hommage intitulé « Louis Lareng, 40 ans au pied de l'arbre ».</p>

<p>La promotion 2020-2021 des élèves directeurs d'hôpital en formation à l'EHESP a pris le nom de Louis Lareng. Une des stations du Téléo, le téléphérique urbain de Toulouse, porte le nom de <em>Hôpital Rangueil - Louis Lareng</em>.</p>
    `;
    // override the painting's data so that clicking it opens Lareng's fiche
    best.userData.data = {
      img: 'https://www.char-fr.net/IMG/jpg/cara_lareng_coirier-640x480.jpg',
      title: 'Louis Lareng (1923–2019)',
      desc: larengDesc
    };
    // optional: mark it for debug
    best.userData.isCenter = true;
  })();

  // raycast + hover
  const ray = new THREE.Raycaster(); const pointer = new THREE.Vector2();
  window.addEventListener('pointermove', (e) => { pointer.x = (e.clientX / window.innerWidth) * 2 - 1; pointer.y = -(e.clientY / window.innerHeight) * 2 + 1; });

  let hoveredGroup = null;
  function updateHover() {
    ray.setFromCamera(pointer, camera);
    const hits = ray.intersectObjects(paintingPlanes, true);
    if (hits.length) {
      const hitPlane = hits[0].object;
      const group = planeToGroup.get(hitPlane.uuid);
      if (group !== hoveredGroup) {
        if (hoveredGroup) gsap.to(hoveredGroup.scale, { x: 1, y: 1, z: 1, duration: 0.14 });
        hoveredGroup = group;
        if (hoveredGroup) gsap.to(hoveredGroup.scale, { x: 1.06, y: 1.06, z: 1.06, duration: 0.12 });
        document.body.classList.add('cursor-pointer');
      }
    } else {
      if (hoveredGroup) { gsap.to(hoveredGroup.scale, { x: 1, y: 1, z: 1, duration: 0.14 }); hoveredGroup = null; }
      document.body.classList.remove('cursor-pointer');
    }
  }

  // focus & overlay
  const baseline = { pos: camera.position.clone(), target: controls.target.clone() };
  let activePlane = null; let animating = false;

  function focusOnPlane(plane) {
    if (!plane || animating) return;
    const data = plane.userData.data;
    const world = new THREE.Vector3(); plane.getWorldPosition(world);
    const q = plane.getWorldQuaternion(new THREE.Quaternion());
    const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(q);
    const camTarget = world.clone();
    const camDest = world.clone().add(normal.clone().multiplyScalar(1.6)).add(new THREE.Vector3(0, 0.08, 0));

    const from = { x: camera.position.x, y: camera.position.y, z: camera.position.z, tx: controls.target.x, ty: controls.target.y, tz: controls.target.z };
    const to = { x: camDest.x, y: camDest.y, z: camDest.z, tx: camTarget.x, ty: camTarget.y, tz: camTarget.z };

    animating = true; controls.enabled = false;
    gsap.to(from, {
      x: to.x, y: to.y, z: to.z, tx: to.tx, ty: to.ty, tz: to.tz,
      duration: 0.95, ease: "power2.inOut",
      onUpdate: () => { camera.position.set(from.x, from.y, from.z); controls.target.set(from.tx, from.ty, from.tz); camera.lookAt(from.tx, from.ty, from.tz); },
      onComplete: () => {
        controls.enabled = true; animating = false;
        showOverlayWithData(data);
        activePlane = plane;
      }
    });
  }

  function showOverlayWithData(data) {
    bioTitle.textContent = data.title || 'Titre';
    // use innerHTML to preserve paragraph formatting for the long bio
    bioText.innerHTML = data.desc || '';
    bioImage.src = data.img || '';
    overlay.setAttribute('aria-hidden', 'false'); overlay.style.pointerEvents = 'auto';
  }

  function closeOverlay() {
    overlay.setAttribute('aria-hidden', 'true'); overlay.style.pointerEvents = 'none';
    if (animating) return;
    animating = true; controls.enabled = false;
    const from = { x: camera.position.x, y: camera.position.y, z: camera.position.z, tx: controls.target.x, ty: controls.target.y, tz: controls.target.z };
    const to = { x: baseline.pos.x, y: baseline.pos.y, z: baseline.pos.z, tx: baseline.target.x, ty: baseline.target.y, tz: baseline.target.z };
    gsap.to(from, {
      x: to.x, y: to.y, z: to.z, tx: to.tx, ty: to.ty, tz: to.tz,
      duration: 0.9, ease: "power2.inOut",
      onUpdate: () => { camera.position.set(from.x, from.y, from.z); controls.target.set(from.tx, from.ty, from.tz); camera.lookAt(from.tx, from.ty, from.tz); },
      onComplete: () => { controls.enabled = true; animating = false; activePlane = null; }
    });
  }

  window.addEventListener('click', (e) => {
    const bottomZone = window.innerHeight - 140;
    if (overlay.getAttribute('aria-hidden') === 'false') return;
    if (e.clientY > bottomZone) return;
    ray.setFromCamera(pointer, camera);
    const hits = ray.intersectObjects(paintingPlanes, true);
    if (hits.length) {
      const hit = hits[0].object;
      if (hit.userData && hit.userData.data) focusOnPlane(hit);
    }
  });

  // overlay nav
  bioClose.addEventListener('click', closeOverlay);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.getAttribute('aria-hidden') === 'false') closeOverlay();
    if (overlay.getAttribute('aria-hidden') === 'false') {
      if (e.key === 'ArrowLeft') bioPrev.click();
      if (e.key === 'ArrowRight') bioNext.click();
    }
  });

  bioPrev.addEventListener('click', () => {
    if (!activePlane) return;
    const cur = activePlane.userData.data.img;
    const idx = IMAGES.findIndex(d => d.img === cur);
    const prevIdx = (idx - 1 + IMAGES.length) % IMAGES.length;
    closeOverlay();
    setTimeout(() => {
      const targetPlane = paintingPlanes.find(p => p.userData && p.userData.data && p.userData.data.img === IMAGES[prevIdx].img);
      if (targetPlane) focusOnPlane(targetPlane);
    }, 420);
  });

  bioNext.addEventListener('click', () => {
    if (!activePlane) return;
    const cur = activePlane.userData.data.img;
    const idx = IMAGES.findIndex(d => d.img === cur);
    const nextIdx = (idx + 1) % IMAGES.length;
    closeOverlay();
    setTimeout(() => {
      const targetPlane = paintingPlanes.find(p => p.userData && p.userData.data && p.userData.data.img === IMAGES[nextIdx].img);
      if (targetPlane) focusOnPlane(targetPlane);
    }, 420);
  });

  // animate
  function animate() {
    requestAnimationFrame(animate);
    updateHover();
    controls.update();
    renderer.render(scene, camera);
  }

  // intro camera
  (function intro() {
    const start = new THREE.Vector3(0, 2.2, 13.0);
    const end = camera.position.clone();
    camera.position.copy(start);
    controls.target.set(0, 1.6, -4.0);
    gsap.to(camera.position, { x: end.x, y: end.y, z: end.z, duration: 1.4, ease: "power3.out", onUpdate: () => camera.lookAt(controls.target) });
    setTimeout(() => { baseline.pos.copy(camera.position); baseline.target.copy(controls.target); }, 1500);
  })();

  animate();

  // debug
  window._GALLERY = { paintingPlanes, planeToGroup, IMAGES };

})();
