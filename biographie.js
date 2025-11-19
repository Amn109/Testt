// biographie.js (version mise à jour — textes de biographie longs par tranche d'âge)
(() => {
  // DOM
  const canvas = document.getElementById('scene-canvas');
  const overlay = document.getElementById('bioOverlay');
  const bioClose = document.getElementById('bioClose');
  const bioTitle = document.getElementById('bioTitle');
  const bioSubtitle = document.getElementById('bioSubtitle');
  const bioText = document.getElementById('bioText');
  const bioImage = document.getElementById('bioImage');
  const bioPrev = document.getElementById('bioPrev');
  const bioNext = document.getElementById('bioNext');

  // --- biographies détaillées par tranche d'âge (FR) ---
  const BIO_BY_AGE = {
    "0–5": `Naissance & premiers pas (0–5)
Né(e) au sein d'un foyer aimant, ces premières années posent les fondations : alimentation, sommeil et premiers repères affectifs. Les tout premiers apprentissages — tenir sa tête, ramper, marcher — sont des victoires quotidiennes. Les interactions rodi parentales façonnent la confiance initiale ; les jeux simples et les histoires racontées éveillent la curiosité. Ces années marquent aussi la découverte du langage : on prime les premiers mots, les rires, et la relation au monde extérieure commence à se dessiner.`,
    "6–12": `Enfance & apprentissages (6–12)
L'enfance scolaire commence : école primaire, premières compétences en lecture et calcul, et l'apparition d'intérêts marqués (dessin, musique, sport). C'est une période de construction sociale : amitiés durables se nouent et on apprend le sens du groupe. Les activités extrascolaires enrichissent la personnalité ; l'encouragement des adultes permet l'apparition de talents précoces. On pose les premières bases de la discipline et de la persévérance.`,
    "13–17": `Adolescence & formation identitaire (13–17)
Transition majeure : le corps change, les émotions se renforcent et l'identité se confronte au monde. On explore des opinions, des styles, des premières amours, et parfois la rébellion. Les études se complexifient, les choix d'orientation commencent à apparaître, et les relations d'amis prennent une place centrale. Cette tranche forge le sens critique : lectures, projets et premiers engagements associatifs ou créatifs laissent des traces durables.`,
    "18–24": `Jeune adulte & exploration (18–24)
Après l'adolescence vient l'autonomie : études supérieures, premiers emplois, voyages et rencontres déterminantes. On expérimente la responsabilité financière et la gestion du quotidien. C'est une période d'expérimentation professionnelle et personnelle : stages, projets, parfois un premier vrai travail. Les choix faits ici — filière d'études, ville, cercle social — orientent la trajectoire des années suivantes.`,
    "25–34": `Installation & ambition (25–34)
Carrière en mouvement : progression professionnelle, parfois changement de secteur ou création d'entreprise. Les projets personnels (couple, enfants) s'imbriquent aux ambitions ; gestion du temps et priorités se complexifient. On développe un réseau professionnel solide, on publie, participe à des conférences, construit un portefeuille de réalisations concrètes. Ces années exigent des décisions structurantes qui auront un impact sur la suite.`,
    "35–44": `Consolidation & réalisation (35–44)
Période d'aboutissement opérationnelle : leadership, responsabilités managériales, mise en place de systèmes pérennes. On mène des projets de grande échelle, on publie, enseigne ou encadre la génération suivante. Côté personnel, la famille et les engagements associatifs ou sociaux prennent souvent plus de profondeur. C'est aussi une période où l'on commence à penser aux fruits à long terme de ses choix professionnels.`,
    "45–54": `Pleine maturité & réévaluation (45–54)
On récolte souvent les fruits d'années de travail — promotions, reconnaissance, résultats tangibles. Mais c'est aussi l'époque de questionnements : "Que reste-t-il à accomplir ?" Les priorités peuvent se réorienter vers l'équilibre vie pro/vie perso, la transmission et la qualité du temps passé avec les proches. Beaucoup lancent des projets de mentorat, changent de cap pour donner plus de sens à leurs actions, ou se spécialisent davantage.`,
    "60–69": `Âge mûr & transmission (60–69)
Le regard se tourne vers la transmission : mentorat, écriture de mémoires, ou engagements culturels. La carrière active peut ralentir ; certains prennent leur retraite et transforment leur expertise en activités bénévoles ou artistiques. Les voyages réfléchis, le partage d'expérience et l'archivage de documents personnels deviennent centraux. C'est une période de consolidation de l'héritage intellectuel et affectif.`,
    "70–79": `Sérénité & transmission approfondie (70–79)
Temps de recul et de tri des souvenirs : réorganisation des archives personnelles, rencontres intergénérationnelles, et parfois publication d'essais ou de recueils. L'accent se met sur la qualité des relations et sur le partage de savoirs pratiques et d'histoires de vie. On assume davantage les paradoxes d'une trajectoire riche, et on savoure la transmission aux plus jeunes.`,
    "80+": `Héritage & postérité (80+)
Bilan final : témoignages, commémorations et réception des hommages. Les récits oraux et les archives (lettres, photos, publications) deviennent essentiels pour la mémoire collective. Les proches organisent la conservation de l'héritage culturel et affectif. Cette dernière période valorise le sens profond des accomplissements et la continuité des valeurs au-delà de la vie.`  
  };

  // --- THREE setup (optimisé) ---
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

  // IMAGES (liste inchangée — ton fichier doit fournir ces URLs)
  const IMAGES = [
    { img: "https://cdn.artphotolimited.com/images/5b9fc1ecac06024957be8806/300x300/salvador-dali-en-1959.jpg", title: "Dali — 1959", desc: "Salvador Dali, 1959." },
    { img: "https://cdn.shortpixel.ai/spai/q_lossless+w_998+to_auto+ret_img/independent-photo.com/wp-content/uploads/2022/02/download-1.jpeg", title: "Photographie 2", desc: "Photographie contemporaine." },
    { img: "https://fr.muzeo.com/sites/default/files/styles/image_oeuvre_search/public/oeuvres/photo/guerres_et_anneees_folles/curiosite_en_1930__un_diner_d124931.jpg?itok=t06gFtta", title: "1930 — Dîner", desc: "Scène, 1930." },
    { img: "https://cdn.artphotolimited.com/images/597620ca681a4e5b29462ebe/300x300/jacques-chirac-en-campagne-electorale-en-correze.jpg", title: "Chirac — campagne", desc: "Jacques Chirac en campagne." },
    { img: "https://fr.muzeo.com/sites/default/files/styles/image_oeuvre_search/public/oeuvres/photo/la_belle_eepoque/un_vieux_chien_de_mer285217.jpg?itok=ygMN0nr_", title: "Vieux chien", desc: "Photo ancienne." },
    { img: "https://i.pinimg.com/736x/20/cf/46/20cf4676753ac568ca4189744a032234.jpg", title: "Portrait 6", desc: "Portrait." },
    { img: "https://www.myposter.fr/magazin/wp-content/uploads/2019/03/audrey-hepburn-392920_1920.jpg", title: "Audrey Hepburn", desc: "Portrait classique." },
    { img: "https://m.media-amazon.com/images/I/91iCD6xECnL._AC_UF1000,1000_QL80_.jpg", title: "Image 8", desc: "Œuvre moderne." },
    { img: "https://cdn.shortpixel.ai/spai/q_lossless+w_1003+to_auto+ret_img/independent-photo.com/wp-content/uploads/2019/10/Jacob-Aue-Sobol-7-600x400-1.jpg", title: "Jacob Aue Sobol", desc: "Photographie expressive." },

    { img: "https://images.pexels.com/photos/2987101/pexels-photo-2987101.jpeg", title: "Pexels 1", desc: "Nouvelle image (pexels)." },
    { img: "https://images.pexels.com/photos/20616946/pexels-photo-20616946.jpeg", title: "Pexels 2", desc: "Nouvelle image (pexels)." },
    { img: "https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg", title: "Pexels 3", desc: "Nouvelle image (pexels)." },
    { img: "https://images.pexels.com/photos/10328983/pexels-photo-10328983.jpeg", title: "Pexels 4", desc: "Nouvelle image (pexels)." },

    { img: "https://apprendre-la-photographie.net/wp-content/uploads/2016/12/image-noir-blanc-paysage-eau-filtre-nd-luke-austin.jpg", title: "Paysage NB", desc: "Paysage NB" },
    { img: "https://www.artenza.fr/cdn/shop/collections/Entre-ombre-et-lumiere-alexandre-lawniczak-collections.jpg?v=1722254963&width=4669", title: "Artenza", desc: "Entre ombre et lumière." },
    { img: "https://cdn.artphotolimited.com/images/60df3a8fbd40b852ce5e0fff/300x300/entre-ciel-et-terre.jpg", title: "Entre ciel & terre", desc: "Photographie." },
    { img: "https://storage.googleapis.com/yk-cdn/photos/cusblack/andrea-pavan/point.jpg", title: "Point", desc: "Photographie moderne." }
  ];

  const AGE_RANGES = [
    "25–34", "35–44", "45–54", "18–24", "13–17", "6–12", "0–5", "60–69", "70–79", "80+"
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

  // loader robuste (concurrency)
  const LOAD_CONCURRENCY = 2;
  const queue = [];
  let running = 0;
  function enqueue(task) { queue.push(task); processQueue(); }
  function processQueue() {
    if (running >= LOAD_CONCURRENCY) return;
    const t = queue.shift();
    if (!t) return;
    running++;
    t().finally(() => { running--; processQueue(); });
  }
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
    enqueue(() => loadImageAsTexture(thumbUrl).then(t => onThumb && onThumb(t)).catch(()=>{}).finally(() => {
      enqueue(() => loadImageAsTexture(url).catch(() => loadImageAsTexture('https://api.allorigins.win/raw?url=' + encodeURIComponent(url))).catch(() => loadImageAsTexture('https://images.weserv.nl/?url=' + encodeURIComponent(cleaned) + '&w=1600&q=80')).then(t => onFull && onFull(t)).catch(()=>{}));
    }));
  }

  // create paintings
  const gallery = new THREE.Group(); scene.add(gallery);
  const paintingPlanes = [];
  const planeToGroup = new Map();

  function createPainting(data, pos, rotationY = 0, plaqueText = '', ageLabel = '') {
    const group = new THREE.Group();
    group.position.copy(pos);
    group.rotation.y = rotationY;

    const w = 1.6, h = 1.1;
    const frame = new THREE.Mesh(new THREE.BoxGeometry(w + 0.12, h + 0.12, 0.08), new THREE.MeshStandardMaterial({ color: 0x5a3f2a, metalness: 0.15, roughness: 0.45 }));
    frame.position.set(0, 0, -0.06); group.add(frame);

    const planeMat = new THREE.MeshBasicMaterial({ map: PLACEHOLDER_TEX, toneMapped: false });
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(w, h), planeMat);
    plane.position.set(0, 0, 0);
    plane.userData = { data, age: ageLabel };
    group.add(plane);

    const pcanvas = document.createElement('canvas'); pcanvas.width = 512; pcanvas.height = 96;
    const pctx2 = pcanvas.getContext('2d');
    pctx2.fillStyle = '#faf7f2'; pctx2.fillRect(0, 0, pcanvas.width, pcanvas.height);
    pctx2.fillStyle = '#222'; pctx2.font = '18px Georgia'; pctx2.textAlign = 'center';
    pctx2.fillText(plaqueText || data.title, pcanvas.width / 2, pcanvas.height / 2 + 8);
    const plaque = new THREE.Mesh(new THREE.PlaneGeometry(Math.min(1.2, w * 0.8), 0.12), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(pcanvas) }));
    plaque.position.set(0, -(h / 2) - 0.14, 0.02);
    group.add(plaque);

    // age plaque (DOM)
    const ageDom = document.createElement('div'); ageDom.className = 'age-plaque';
    ageDom.style.position = 'fixed'; ageDom.style.display = 'none';
    ageDom.style.background = 'rgba(18,18,18,0.9)';
    ageDom.style.color = '#f6e7d6';
    ageDom.style.padding = '6px 8px';
    ageDom.style.fontSize = '13px';
    ageDom.style.borderRadius = '8px';
    ageDom.style.boxShadow = '0 8px 20px rgba(0,0,0,0.5)';
    ageDom.textContent = ageLabel || '';
    document.body.appendChild(ageDom);
    group.userData.ageEl = ageDom;
    group.userData.target = plane;

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
    createPainting(IMAGES[iImg], new THREE.Vector3(backStartX + i * backStep, 2.6, -8.9), 0, IMAGES[iImg].title, AGE_RANGES[iImg] || '');
  }
  for (let i = 0; i < 3 && iImg < IMAGES.length; i++, iImg++) {
    createPainting(IMAGES[iImg], new THREE.Vector3(-13.4, 2.6, -4.0 + i * 3.2), Math.PI / 2, IMAGES[iImg].title, AGE_RANGES[4 + i] || '');
  }
  for (let i = 0; i < 3 && iImg < IMAGES.length; i++, iImg++) {
    createPainting(IMAGES[iImg], new THREE.Vector3(13.4, 2.6, -4.0 + i * 3.2), -Math.PI / 2, IMAGES[iImg].title, AGE_RANGES[7 + i] || '');
  }

  // wall headers (DOM)
  function makeLabel(text) {
    const el = document.createElement('div'); el.className = 'wall-header';
    el.style.position = 'fixed'; el.style.display = 'none';
    el.style.background = 'rgba(18,18,18,0.9)';
    el.style.color = '#f6e7d6';
    el.style.padding = '8px 10px';
    el.style.borderRadius = '8px';
    el.style.fontSize = '14px';
    el.style.boxShadow = '0 8px 20px rgba(0,0,0,0.45)';
    el.textContent = text; document.body.appendChild(el); return el;
  }
  const headerBack = makeLabel('Adulte');
  const headerLeft = makeLabel('Enfance');
  const headerRight = makeLabel('Âgé');
  const headerPositions = { back: new THREE.Vector3(0, 4.6, -9.1), left: new THREE.Vector3(-14.6, 4.6, -0.8), right: new THREE.Vector3(14.6, 4.6, -0.8) };

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
    const age = plane.userData.age || '';
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
        showOverlayWithData(data, age);
        activePlane = plane;
      }
    });
  }

  function showOverlayWithData(data, ageLabel) {
    bioTitle.textContent = data.title || 'Titre';
    bioSubtitle.textContent = ageLabel || '';
    const bio = (ageLabel && BIO_BY_AGE[ageLabel]) ? BIO_BY_AGE[ageLabel] : (data.desc || '');
    bioText.textContent = bio;
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

  // convert world to screen position
  function worldToScreenPos(vec3, camera) {
    const v = vec3.clone();
    v.project(camera);
    return { x: (v.x + 1) * 0.5 * window.innerWidth, y: (1 - (v.y + 1) * 0.5) * window.innerHeight, z: v.z };
  }

  // position wall headers & age plaques each frame
  function updateLabelsAndAge() {
    const headers = [
      { el: headerBack, pos: headerPositions.back },
      { el: headerLeft, pos: headerPositions.left },
      { el: headerRight, pos: headerPositions.right }
    ];
    headers.forEach(entry => {
      const sc = worldToScreenPos(entry.pos, camera);
      if (sc.z > 1 || sc.z < -1) { entry.el.style.display = 'none'; return; }
      entry.el.style.display = 'block';
      entry.el.style.left = Math.round(sc.x) + 'px';
      entry.el.style.top = Math.round(sc.y) + 'px';
    });

    planeToGroup.forEach((group) => {
      const el = group.userData.ageEl;
      const target = group.userData.target;
      if (!el || !target) return;
      const world = new THREE.Vector3(); target.getWorldPosition(world); world.y += 0.78;
      const sc = worldToScreenPos(world, camera);
      if (sc.z > 1 || sc.z < -1) { el.style.display = 'none'; return; }
      el.style.display = 'block';
      el.style.left = Math.round(sc.x) + 'px';
      el.style.top = Math.round(sc.y) + 'px';
    });
  }

  // animate
  function animate() {
    requestAnimationFrame(animate);
    updateHover();
    updateLabelsAndAge();
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
  window._GALLERY = { paintingPlanes, planeToGroup, IMAGES, AGE_RANGES, BIO_BY_AGE };

})();
