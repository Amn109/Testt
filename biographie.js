// biographie.js
// affichage de "vitrines" avec photos de statues (planes) + overlay texte
// fonctionne en local (file://) — utilise textures HTTPS (Unsplash source)

(function(){
  const canvas = document.getElementById('scene-canvas');
  const overlay = document.getElementById('bioOverlay');
  const bioTitle = document.getElementById('bioTitle');
  const bioSubtitle = document.getElementById('bioSubtitle');
  const bioText = document.getElementById('bioText');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const closeBtn = document.getElementById('closeBtn');

  // three essentials
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x060405);

  const renderer = new THREE.WebGLRenderer({canvas, antialias:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;

  const camera = new THREE.PerspectiveCamera(55, window.innerWidth/window.innerHeight, 0.1, 120);
  camera.position.set(0,1.6,6);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.maxPolarAngle = Math.PI/2.2;
  controls.minDistance = 2.2;
  controls.maxDistance = 12;

  window.addEventListener('resize', ()=> {
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // lights
  scene.add(new THREE.HemisphereLight(0xffffff, 0x080808, 0.5));
  const dir = new THREE.DirectionalLight(0xfff6e6, 0.9);
  dir.position.set(6,8,4); scene.add(dir);
  scene.add(new THREE.PointLight(0xfff6e6, 0.15, 20));

  // floor + back wall (black)
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 18), new THREE.MeshStandardMaterial({color:0xf3eae0, roughness:0.98}));
  floor.rotation.x = -Math.PI/2; floor.position.y = 0; scene.add(floor);

  const backWall = new THREE.Mesh(new THREE.BoxGeometry(30, 10, 0.5), new THREE.MeshStandardMaterial({color:0x050505, roughness:0.95}));
  backWall.position.set(0,5,-7); scene.add(backWall);

  // pedestals + frames (we will place planes on pedestals)
  const NUM = 6;
  const spacing = 2.4;
  const startX = -((NUM-1) * spacing) / 2;
  const pedestals = [];

  const pedMat = new THREE.MeshStandardMaterial({color:0x4b4b4b, roughness:0.6});
  const topMat = new THREE.MeshStandardMaterial({color:0x8a7b6b, roughness:0.45});

  for (let i=0;i<NUM;i++){
    const px = startX + i*spacing;
    // base
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.45,0.45,0.12,32), pedMat);
    base.position.set(px, 0.06, -3.8);
    scene.add(base);
    // shelf behind (glass box illusion) - optional
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.4,0.12,0.55), topMat);
    shelf.position.set(px, 0.18, -3.7);
    scene.add(shelf);
    pedestals.push({x:px, base, shelf});
  }

  // images (statues). use Unsplash source which serves https images for CORS-friendly loading.
  // different &sig to get variety (these are statue photos).
  const imageURLs = [
    'https://source.unsplash.com/800x800/?statue,sculpture&sig=11',
    'https://source.unsplash.com/800x800/?ancient,statue&sig=22',
    'https://source.unsplash.com/800x800/?classical,statue&sig=33',
    'https://source.unsplash.com/800x800/?marble,statue&sig=44',
    'https://source.unsplash.com/800x800/?greek,statue&sig=55',
    'https://source.unsplash.com/800x800/?bust,statue&sig=66'
  ];

  // demo bio content
  const BIO = [
    {title:"Enfance — Premiers pas", subtitle:"0–12 ans", text: "Texte détaillé de la période enfance. Raconte la famille, le lieu de naissance, la petite enfance et premiers apprentissages. (Remplace par tes propres paragraphes)"},
    {title:"Adolescence — Construction d'identité", subtitle:"13–18 ans", text: "Texte période adolescence. Études, rencontres, premières décisions importantes. (Long paragraphe...)"},
    {title:"Jeune adulte — Choix & ambition", subtitle:"19–29 ans", text: "Texte période jeune adulte. Développements professionnels, voyages, engagements, erreurs et apprentissages."},
    {title:"Adulte — Consolidation", subtitle:"30–50 ans", text: "Texte période adulte. Période productive, publications, responsabilités. Détailler inventaires, dates, contributions."},
    {title:"Âge mûr — Transmission", subtitle:"51–70 ans", text: "Texte période mûre. Transmission, enseignement, réflexions. Réalisations tardives, reconnaissance."},
    {title:"Héritage — Mémoire", subtitle:"70+ ans", text: "Texte héritage. Bilan, postérité, archives, publications tardives et commémorations."}
  ];

  // loader for textures
  const texLoader = new THREE.TextureLoader();

  // array to keep statue objects
  const statues = [];

  function addStatue(index){
    const info = pedestals[index];
    const url = imageURLs[index % imageURLs.length];

    // plane geometry that will display the statue photo
    const planeW = 1.0;
    const planeH = 1.6; // portrait orientation for full-body statue
    const geometry = new THREE.PlaneGeometry(planeW, planeH);

    const placeholder = new THREE.MeshBasicMaterial({color:0x222222});
    const plane = new THREE.Mesh(geometry, placeholder);

    // ensure plane sits slightly above the shelf
    plane.position.set(info.x, 0.18 + (planeH/2) + 0.02, -3.7); // z a bit forward of shelf
    plane.rotation.y = 0;
    scene.add(plane);

    // add a slightly transparent glass box around it (subtle)
    const glassMat = new THREE.MeshPhysicalMaterial({color:0xffffff, metalness:0, roughness:0.2, transparent:true, opacity:0.06});
    const box = new THREE.Mesh(new THREE.BoxGeometry(planeW+0.28, planeH+0.28, 0.26), glassMat);
    box.position.set(info.x, plane.position.y, -3.7 - 0.06);
    scene.add(box);

    // load texture (crossOrigin via unsplash is OK)
    texLoader.setCrossOrigin('anonymous');
    texLoader.load(url, (tx) => {
      tx.encoding = THREE.sRGBEncoding;
      const mat = new THREE.MeshStandardMaterial({map: tx, roughness:0.8});
      plane.material = mat;
      plane.material.needsUpdate = true;
    }, undefined, (err) => {
      console.warn('texture failed', err);
      // fallback color already present
    });

    statues.push({plane, index});
  }

  for (let i=0;i<NUM;i++) addStatue(i);

  // interaction: raycast to detect click on plane
  const ray = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  window.addEventListener('pointermove', (e) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = - (e.clientY / window.innerHeight) * 2 + 1;
  });

  let current = 0;
  function openBio(idx){
    current = idx;
    const stat = statues[idx];
    if (!stat) return;

    // compute camera target and animate camera to show the plane
    const target = new THREE.Vector3();
    stat.plane.getWorldPosition(target);
    const camDest = { x: target.x, y: target.y + 0.3, z: target.z + 1.8 };

    const from = { x: camera.position.x, y: camera.position.y, z: camera.position.z, tx: controls.target.x, ty: controls.target.y, tz: controls.target.z };
    controls.enabled = false;
    gsap.to(from, {
      x: camDest.x, y: camDest.y, z: camDest.z,
      tx: target.x, ty: target.y, tz: target.z,
      duration: 0.9, ease: "power2.inOut",
      onUpdate: ()=>{ camera.position.set(from.x, from.y, from.z); controls.target.set(from.tx, from.ty, from.tz); },
      onComplete: ()=>{ controls.enabled = true; }
    });

    // fill overlay
    const data = BIO[idx] || {title:`Étape ${idx+1}`, subtitle:'', text:'(contenu manquant)'};
    bioTitle.textContent = data.title;
    bioSubtitle.textContent = data.subtitle;
    bioText.textContent = data.text;
    overlay.classList.add('show');
    overlay.setAttribute('aria-hidden','false');
  }

  // hide overlay
  function closeOverlay(){
    overlay.classList.remove('show');
    overlay.setAttribute('aria-hidden','true');
  }

  window.addEventListener('click', (e) => {
    // if overlay open ignore clicks (except close controls)
    if (overlay.classList.contains('show')) return;
    ray.setFromCamera(pointer, camera);
    // gather intersects with all planes
    const objects = statues.map(s => s.plane);
    const hits = ray.intersectObjects(objects, true);
    if (hits.length){
      const hit = hits[0].object;
      const statIndex = statues.findIndex(s => s.plane === hit || s.plane.children.includes(hit));
      if (statIndex >= 0) openBio(statIndex);
    }
  });

  prevBtn.addEventListener('click', ()=> openBio((current-1+NUM)%NUM));
  nextBtn.addEventListener('click', ()=> openBio((current+1)%NUM));
  closeBtn.addEventListener('click', closeOverlay);
  window.addEventListener('keydown', (e)=> {
    if (overlay.classList.contains('show')) {
      if (e.key === 'Escape') closeOverlay();
      if (e.key === 'ArrowLeft') prevBtn.click();
      if (e.key === 'ArrowRight') nextBtn.click();
    }
  });

  // animate
  const clock = new THREE.Clock();
  function animate(){
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    // subtle floating for planes to look alive
    statues.forEach((s,i) => {
      s.plane.position.y += Math.sin(t*0.9 + i*0.4) * 0.0006;
    });
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  // initial camera cinematic — show all vitrines
  camera.position.set(0, 1.8, 9.0);
  controls.target.set(0, 0.9, -3.5);
  gsap.to(camera.position, { x:0, y:1.6, z:6.5, duration:1.6, ease:"power3.out", onUpdate: ()=> camera.lookAt(controls.target) });

})();
