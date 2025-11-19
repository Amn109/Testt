// script.js - vitrines + livres + viewer HTML (murs en noir pur)
(function(){
  const canvas = document.getElementById('museum-canvas');

  // ---------- scene / renderer ----------
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b0707);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;

  // final camera position (adjusted to stay IN the room and show vitrines)
  const CAMERA_TARGET_POS = new THREE.Vector3(0, 1.6, 6.0);

  const camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 200);
  camera.position.copy(CAMERA_TARGET_POS);
  camera.lookAt(0, 1.4, 0);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.minDistance = 2.4;
  controls.maxDistance = 30;
  controls.maxPolarAngle = Math.PI / 2.15;

  window.addEventListener('resize', onWindowResize);
  function onWindowResize(){
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // ---------- lights ----------
  const hemi = new THREE.HemisphereLight(0xffffff, 0x222222, 0.5); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xfff3d6, 0.8); key.position.set(5,8,2); scene.add(key);
  const fill = new THREE.PointLight(0xfff9f0, 0.5, 20); fill.position.set(-4,4,6); scene.add(fill);

  // ---------- room geometry ----------
  const floorMat = new THREE.MeshStandardMaterial({ color:0x9b7f6b, roughness:0.64 });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(28, 14), floorMat); floor.rotation.x = -Math.PI/2; floor.position.y = 0; scene.add(floor);

  // <<<<<< CHANGEMENT : murs en noir pur >>>>>>
  const wallMat = new THREE.MeshStandardMaterial({ color:0x000000, roughness:0.95 });
  // -------------------------------------------------------------------------

  const backWall = new THREE.Mesh(new THREE.BoxGeometry(28, 8, 0.6), wallMat); backWall.position.set(0,4,-7); scene.add(backWall);
  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.6, 8, 14), wallMat); leftWall.position.set(-14,4,0); scene.add(leftWall);
  const rightWall = leftWall.clone(); rightWall.position.set(14,4,0); scene.add(rightWall);
  const frontWall = new THREE.Mesh(new THREE.BoxGeometry(28, 8, 0.6), wallMat); frontWall.position.set(0,4,7); scene.add(frontWall);

  const bench = new THREE.Mesh(new THREE.BoxGeometry(4,0.18,0.5), new THREE.MeshStandardMaterial({ color:0x3a3a3a, roughness:0.6 }));
  bench.position.set(0,0.45,2.2); scene.add(bench);

  // ---------- Archive ITEMS (title, year, text, image) ----------
  const ITEMS = [
    { title:"Louis Lareng, l'inventeur du samu", year:2012, text:"Le professeur et son équipe devant un hélicoptère du Samu. Dans son bureau à l'agence régionale de santé, à Toulouse, le professeur Louis Lareng a accroché les Pyrénées dans son dos. «C'est une photo du pic du Gar. C'est beau, n'est-ce pas, avec cette lumière ?», demande-il.A 89 ans, le professeur Louis Lareng porte beau. Il a toujours un agenda de ministre, se lève à 5 h30 et quitte le bureau après 20 h. «Avant, c'était minuit», précise-t-il. L'homme est en forme aussi. «Le seul fait d'être actif et d'avoir une vie stimulante me maintient en bonne santé.»Le professeur et son équipe devant un hélicoptère du Samu. Dans son bureau à l'agence régionale de santé, à Toulouse, le professeur Louis Lareng a accroché les Pyrénées dans son dos. «C'est une photo du pic du Gar. C'est beau, n'est-ce pas, avec cette lumière ?», demande-il.A 89 ans, le professeur Louis Lareng porte beau. Il a toujours un agenda de ministre, se lève à 5 h30 et quitte le bureau après 20 h. «Avant, c'était minuit», précise-t-il. L'homme est en forme aussi. «Le seul fait d'être actif et d'avoir une vie stimulante me maintient en bonne santé.»Le professeur et son équipe devant un hélicoptère du Samu. Dans son bureau à l'agence régionale de santé, à Toulouse, le professeur Louis Lareng a accroché les Pyrénées dans son dos. «C'est une photo du pic du Gar. C'est beau, n'est-ce pas, avec cette lumière ?», demande-il.A 89 ans, le professeur Louis Lareng porte beau. Il a toujours un agenda de ministre, se lève à 5 h30 et quitte le bureau après 20 h. «Avant, c'était minuit», précise-t-il. L'homme est en forme aussi. «Le seul fait d'être actif et d'avoir une vie stimulante me maintient en bonne santé.»Le professeur et son équipe devant un hélicoptère du Samu. Dans son bureau à l'agence régionale de santé, à Toulouse, le professeur Louis Lareng a accroché les Pyrénées dans son dos. «C'est une photo du pic du Gar. C'est beau, n'est-ce pas, avec cette lumière ?», demande-il.A 89 ans, le professeur Louis Lareng porte beau. Il a toujours un agenda de ministre, se lève à 5 h30 et quitte le bureau après 20 h. «Avant, c'était minuit», précise-t-il. L'homme est en forme aussi. «Le seul fait d'être actif et d'avoir une vie stimulante me maintient en bonne santé.»", image: "https://upload.wikimedia.org/wikipedia/commons/6/6d/Marie_Curie_c1920.jpg" },
    { title:"", year:"", text:"Lareng, ce nom est désormais associé à la création du Samu (Service d'aide médicale urgente) à Toulouse. C'était en 1967. «Mais, j'ai commencé à y travailler dès 1955. Ce sont les accidents de la route qui m'ont amené à créer ce service car ils devenaient de plus en plus nombreux. Au départ, le Samu n'existait que deux heures par jour, de 17 h à 19h. Cela correspondait à la sortie des usines. Puis, les accidents de la route ont augmenté, il a fallu augmenter les gardes en conséquence. En 1968, une circulaire disait qu'on mettait en place, à Toulouse, un service expérimental de réanimation d'urgence qui adapterait les soins aux besoins. En 1981, quand j'étais député, j'ai présenté une loi qui prévoyait que ce soit le préfet qui mette en place le Samu dans son département.» En 1986, ce système est étendu à toute la France.", image: "https://upload.wikimedia.org/wikipedia/commons/7/78/Nelson_Mandela_1994.jpg" },
    { title:"Interview — Simone Veil", year:1979, text:"Interview sur mémoire et politique, contexte et extraits.", image: "https://upload.wikimedia.org/wikipedia/commons/1/1f/Simone_Veil_1974.jpg" },
    { title:"Conversation — Albert Einstein", year:1921, text:"Conversation informelle sur science, société et philosophie.", image: "https://upload.wikimedia.org/wikipedia/commons/d/d3/Albert_Einstein_1921.jpg" },
    { title:"Témoignage — Rosa Parks", year:1955, text:"Récit et témoignage sur la ségrégation et la désobéissance civile.", image: "https://upload.wikimedia.org/wikipedia/commons/7/73/Rosa_Parks_%28GPN-2004-00023%29.jpg" },
    { title:"Portrait — Charles de Gaulle", year:1959, text:"Discours et contexte historique — notes d'archives.", image: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Charles_de_Gaulle_1960.jpg" },
    { title:"Interview — Frida Kahlo", year:1941, text:"Fragments d'entretien, journaux et notes personnelles.", image: "https://upload.wikimedia.org/wikipedia/commons/1/1a/Frida_Kahlo_%281934%29.jpg" },
    { title:"Entretien — Winston Churchill", year:1946, text:"Réflexions et mémoires après-guerre.", image: "https://upload.wikimedia.org/wikipedia/commons/1/1e/Churchill_portrait_NYP_45063.jpg" },
    { title:"Portrait — Martin Luther King Jr.", year:1963, text:"Extrait de discours et dossier de presse.", image: "https://upload.wikimedia.org/wikipedia/commons/8/8b/Martin_Luther_King,_Jr..jpg" },
    { title:"Hommage — Léonard de Vinci", year:1505, text:"Archives et annotations sur l'oeuvre et la correspondance.", image: "https://upload.wikimedia.org/wikipedia/commons/e/e6/Leonardo_da_Vinci_-_presumed_self-portrait_-_WGA12798.jpg" }
  ];

  // ---------- make book visuals (canvas textures) ----------
  function makeBookTexture(title, color='#b57a6b'){
    const w=800,h=1100;
    const c=document.createElement('canvas'); c.width=w; c.height=h;
    const ctx=c.getContext('2d');
    ctx.fillStyle = color; ctx.fillRect(0,0,w,h);
    ctx.globalAlpha = 0.06; ctx.fillStyle = '#fff';
    for(let i=0;i<20;i++) ctx.fillRect(Math.random()*w, Math.random()*h, 30, 6);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#fff'; ctx.font = '700 36px Georgia';
    wrapText(ctx, title, 36, 80, w-72, 40);
    ctx.fillStyle = 'rgba(255,255,255,0.95)'; ctx.font='600 20px Inter';
    ctx.fillText('Archives — extrait', 36, h-110);
    return new THREE.CanvasTexture(c);
  }
  function wrapText(ctx, text, x, y, maxWidth, lineHeight){
    const words = text.split(' ');
    let line = '', cy=y;
    for(let n=0;n<words.length;n++){
      const test = line + words[n] + ' ';
      if(ctx.measureText(test).width > maxWidth && n>0){ ctx.fillText(line, x, cy); line = words[n] + ' '; cy += lineHeight; }
      else line = test;
    }
    ctx.fillText(line, x, cy);
  }

  // ---------- vitrines + books ----------
  const vitrines = new THREE.Group(); scene.add(vitrines);
  const N_VITRINES = 4;
  const vitrineSpacing = 6;
  const vitrineY = 2.3;
  const vitrineZ = -6.6;
  let createdBooks = [];

  for(let i=0;i<N_VITRINES;i++){
    const x = -((N_VITRINES-1)*vitrineSpacing)/2 + i*vitrineSpacing;
    const base = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.4, 0.9), new THREE.MeshStandardMaterial({ color:0x4b3c32, roughness:0.6 }));
    base.position.set(x, vitrineY-0.65, vitrineZ); vitrines.add(base);

    const glassMat = new THREE.MeshPhysicalMaterial({ color:0xffffff, metalness:0, roughness:0.1, transparent:true, opacity:0.12, transmission:0.9, clearcoat:0.2 });
    const glass = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.4, 0.9), glassMat); glass.position.set(x, vitrineY, vitrineZ); vitrines.add(glass);

    const booksInVitrine = 3;
    for(let b=0;b<booksInVitrine;b++){
      const itemIndex = (i*booksInVitrine + b) % ITEMS.length;
      const item = ITEMS[itemIndex];
      const tex = makeBookTexture(item.title, ['#7a4b3a','#7a5a8b','#4b7a6b','#a65a4f'][ (i+b) % 4 ]);
      const bookW = 0.32;
      const bookH = bookW * 1.4;
      const mat = new THREE.MeshStandardMaterial({ map: tex, roughness:0.7 });
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(bookW, bookH), mat);
      const offsetX = (b - (booksInVitrine-1)/2) * (bookW + 0.08);
      plane.position.set(x + offsetX, vitrineY - 0.05, vitrineZ + 0.28);
      plane.rotation.y = (Math.random()*6-3) * Math.PI/180;
      plane.userData = { itemIndex };
      plane.name = `book_plane_${itemIndex}`;
      scene.add(plane);
      createdBooks.push(plane);
    }
  }

  // lights for vitrines
  for(let i=0;i<N_VITRINES;i++){
    const x = -((N_VITRINES-1)*vitrineSpacing)/2 + i*vitrineSpacing;
    const sp = new THREE.SpotLight(0xfff3d6, 0.9, 6, Math.PI/10, 0.6);
    sp.position.set(x, 3.2, vitrineZ+1.2);
    sp.target.position.set(x, vitrineY, vitrineZ);
    scene.add(sp); scene.add(sp.target);
  }

  // ---------- raycast interactions ----------
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let hovering = false;
  window.addEventListener('pointermove', (e)=>{
    pointer.x = ( e.clientX / window.innerWidth ) * 2 - 1;
    pointer.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
  });

  window.addEventListener('click', (e)=>{
    const viewer = document.getElementById('archiveViewer');
    if (viewer && viewer.getAttribute('aria-hidden') === 'false') return;
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(createdBooks, true);
    if(intersects.length){
      const hit = intersects[0].object;
      const itemIndex = hit.userData.itemIndex;
      if(typeof itemIndex !== 'undefined') openViewerAt(itemIndex);
    }
  });

  function updateHover(){
    raycaster.setFromCamera(pointer, camera);
    const inter = raycaster.intersectObjects(createdBooks, true);
    if(inter.length){
      if(!hovering){ document.body.classList.add('cursor-pointer'); hovering = true; }
    } else {
      if(hovering){ document.body.classList.remove('cursor-pointer'); hovering = false; }
    }
  }

  // ---------- Viewer HTML (overlay) ----------
  const viewer = document.getElementById('archiveViewer');
  const viewerLeft = document.getElementById('archiveLeft');
  const viewerRight = document.getElementById('archiveRight');
  const viewerClose = document.getElementById('archiveClose');
  const viewerPrev = document.getElementById('archivePrev');
  const viewerNext = document.getElementById('archiveNext');
  const viewerIdx = document.getElementById('archiveIdx');
  let viewerIndex = 0;

  function escapeHtml(s){
    if(!s) return '';
    return String(s).replace(/[&<>"]/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  }

  function createArticleHTML(item){
    const imgHtml = item.image ? `<img src="${item.image}" alt="${escapeHtml(item.title)}" onerror="this.style.display='none'">` : '';
    const safeText = escapeHtml(item.text || 'Aucun texte disponible.');
    const meta = item.year ? `${item.year}` : '';
    return `
      ${imgHtml}
      <h2>${escapeHtml(item.title)}</h2>
      <div class="meta">${meta}</div>
      <div class="content">${safeText}</div>
    `;
  }

  function renderPages(animate){
    const leftIdx = ((viewerIndex % ITEMS.length) + ITEMS.length) % ITEMS.length;
    const rightIdx = (leftIdx + 1) % ITEMS.length;
    const leftHTML = createArticleHTML(ITEMS[leftIdx]);
    const rightHTML = createArticleHTML(ITEMS[rightIdx]);

    if(animate){
      viewerLeft.style.opacity = 0; viewerRight.style.opacity = 0;
      setTimeout(()=> {
        viewerLeft.innerHTML = leftHTML;
        viewerRight.innerHTML = rightHTML;
        viewerLeft.scrollTop = 0; viewerRight.scrollTop = 0;
        viewerLeft.style.opacity = 1; viewerRight.style.opacity = 1;
      }, 130);
    } else {
      viewerLeft.innerHTML = leftHTML;
      viewerRight.innerHTML = rightHTML;
      viewerLeft.scrollTop = 0; viewerRight.scrollTop = 0;
    }

    if(viewerIdx) viewerIdx.textContent = `${leftIdx+1} / ${ITEMS.length}`;
  }

  function openViewerAt(index){
    viewerIndex = index % ITEMS.length;
    renderPages(false);
    viewer.setAttribute('aria-hidden','false');
    viewer.style.opacity = 1; viewer.style.pointerEvents = 'auto';
    controls.enabled = false;
  }
  function closeViewer(){ viewer.setAttribute('aria-hidden','true'); viewer.style.opacity = 0; viewer.style.pointerEvents = 'none'; controls.enabled = true; }

  viewerClose.addEventListener('click', closeViewer);
  viewerPrev.addEventListener('click', ()=>{ viewerIndex = (viewerIndex - 2 + ITEMS.length) % ITEMS.length; renderPages(true); });
  viewerNext.addEventListener('click', ()=>{ viewerIndex = (viewerIndex + 2) % ITEMS.length; renderPages(true); });
  window.addEventListener('keydown', (e)=>{ if(viewer.getAttribute('aria-hidden') === 'false'){ if(e.key === 'ArrowRight') viewerNext.click(); if(e.key === 'ArrowLeft') viewerPrev.click(); if(e.key === 'Escape') closeViewer(); } });

  // ---------- animate ----------
  const clock = new THREE.Clock();
  function animate(){
    requestAnimationFrame(animate);
    updateHover();
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  // ---------- intro camera animation (start near back wall, glide to target) ----------
  (function introCamera(){
    const startPos = new THREE.Vector3(0, 1.6, -3);
    const endPos = CAMERA_TARGET_POS.clone();
    const startLook = new THREE.Vector3(0, 1.4, -6.5);
    const endLook = new THREE.Vector3(0, 1.4, -1.4); // regarde légèrement vers vitrines

    camera.position.copy(startPos);
    camera.lookAt(startLook);
    controls.target.copy(startLook);

    const DURATION = 1400;
    const t0 = performance.now();

    function step(){
      const t = performance.now() - t0;
      const norm = Math.min(1, t / DURATION);
      const ease = norm < 0.5 ? 4*norm*norm*norm : 1 - Math.pow(-2*norm + 2, 3)/2;

      camera.position.lerpVectors(startPos, endPos, ease);
      const look = new THREE.Vector3().lerpVectors(startLook, endLook, ease);
      camera.lookAt(look);
      controls.target.lerp(look, 0.12);

      if(norm < 1) requestAnimationFrame(step);
      else {
        camera.position.copy(endPos);
        camera.lookAt(endLook);
        controls.target.copy(endLook);
        controls.update();
      }
    }
    setTimeout(()=> requestAnimationFrame(step), 120);
  })();

  console.log('Salle de vitrines initialisée — murs noir pur (0x000000).');
})();
