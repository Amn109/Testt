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

  {
    title: "Louis Lareng, l'inventeur du samu",
    year: 2012,
    text: `Louis Lareng, né le 8 avril 1923 dans les Hautes-Pyrénées, a consacré sa vie à l'urgence médicale. Orphelin de mère et élevé par sa tante, il obtient une bourse qui lui permet d'étudier la médecine à Toulouse. Spécialisé en anesthésie-réanimation, il devient le premier professeur d'anesthésie-réanimation en France et exerce à l'hôpital Purpan.

Confronté à l'augmentation des accidents de la route, Lareng met en place dès 1955 un dispositif d'intervention d'urgence qui aboutit à la création du SAMU à Toulouse en 1967. Une circulaire de 1968 officialise l'expérimentation ; en 1981, devenu député, il propose une loi permettant au préfet d'organiser le SAMU dans chaque département. Le système est généralisé à toute la France en 1986.

Toujours actif et à l'avant-garde, Lareng s'investit ensuite dans la télémédecine et le dossier de santé numérique pour améliorer le bien-être des patients et des soignants. Marié depuis 1952 à Marie-Blanche, professeure en bactériologie, il est père de trois enfants. Distingué par de nombreuses décorations, un Prix Louis Lareng a été créé pour récompenser les contributions en télémédecine et e-santé.`,
    image: "https://upload.wikimedia.org/wikipedia/commons/6/6d/Marie_Curie_c1920.jpg"
  },
  {
    title: "Le nouveau combat de Louis Lareng",
    year: 2014,
    text: `Recréer du lien social distendu dans nos sociétés, notamment urbaines. Tel est le leitmotiv du professeur Louis Lareng. Après avoir fondé le SAMU, cet ancien professeur de médecine âgé de 91 ans s’est trouvé un nouveau combat. «Il s’agit de permettre aux populations les plus fragiles de pouvoir reprendre en main leur destin,» dit-il. Pour ce faire, il a le projet de créer ce qu’il appelle un «carrefour de Citoyenneté-institut du Lien social». Récemment, il avait convié à l’IFRASS de Toulouse, (Institut de formation, de recherche, d’animation, santé Sociale), sous le haut patronage de Mme Escoffier, ministre chargée de la Décentralisation, l’ensemble des acteurs régionaux, participant au développement, à la transmission des connaissances et à l’accompagnement des populations fragilisées (personnes âgées, familles monoparentales, handicapés…), pour leur proposer la création du Carrefour de Citoyenneté - Institut du Lien Social.
Cet Institut de formation, dont les contours restent à dessiner par un groupe de travail formé avec les décideurs et acteurs, a pour vocation de promouvoir des formations adaptées aux réalités, et de ce fait, spécifiques, pour les aidants bénévoles et professionnels participant au maintien et au développement du lien social.
«Aujourd’hui, les bouleversements sociétaux perturbent les relations entre les hommes, le chacun pour soi remplaçant le vivre-ensemble. On devient de plus en plus consommateur de République plutôt que de Citoyenneté» explique Louis Lareng. Il faut, selon lui, se mobiliser en faveur ce projet novateur dans lequel l’enseignement de «la pratique de l’accompagnement» sera capable de répondre à la «France qui souffre».
Soulignant l’ambition et la générosité de son projet, Mme Escoffier a assuré de son soutien total dans la mise en œuvre de cet Institut du Lien social.
La Dépêche du Midi
`,
    image: "https://upload.wikimedia.org/wikipedia/commons/6/6d/Marie_Curie_c1920.jpg"
  },
  {
    title: "Création du SAMU et aide médicale urgente",
    year: 2014,
    text: `Louis Lareng a transformé l’aide médicale d’urgence en France en initiant, à Toulouse, le premier Service d’Aide Médicale Urgente (SAMU). Face à l’augmentation des accidents de la route, il a développé l’idée de porter les soins d’urgence directement sur les lieux de l’accident, avec une régulation médicale centralisée par téléphone. Ce dispositif novateur a permis d’orienter en temps réel les secours adaptés et de sauver de nombreuses vies. Après une phase expérimentale, Lareng a porté l’initiative au niveau législatif afin qu’elle soit étendue progressivement à l’ensemble du pays, donnant naissance au réseau national des SAMU tel qu’on le connaît aujourd’hui.
`,
    image: "https://upload.wikimedia.org/wikipedia/commons/6/6d/Marie_Curie_c1920.jpg"
  },
  {
    title: "Engagement politique et action locale",
    year: 2014,
    text: `Parallèlement à sa carrière médicale, Louis Lareng s’est investi en politique locale et nationale. Il a exercé des mandats municipaux et régionaux et a été député, ce qui lui a permis de défendre la structuration de la médecine d’urgence au plus haut niveau. À l’Assemblée, il a œuvré pour des textes et des dispositifs permettant le déploiement du SAMU dans tous les départements. Homme ancré dans sa région, il a souvent refusé des propositions parisiennes pour rester à Toulouse et poursuivre des projets de santé publique locaux.
`,
    image: "https://upload.wikimedia.org/wikipedia/commons/6/6d/Marie_Curie_c1920.jpg"
  },
  {
    title: "Innovations en télémédecine et e-santé",
    year: 2014,
    text: `Pionnier de la télémédecine, Lareng a très tôt perçu le potentiel des échanges d’images et de données pour améliorer l’accès aux soins dans les zones isolées. Il a contribué à la création d’institutions et de réseaux régionaux dédiés à la téléconsultation et a défendu l’idée que la télémédecine est un acte médical à part entière. Son action a favorisé la mise en place d’outils permettant à un médecin local de confronter un cas à des spécialistes distants, améliorant ainsi la prise en charge des patients éloignés des centres hospitaliers.
`,
    image: "https://upload.wikimedia.org/wikipedia/commons/6/6d/Marie_Curie_c1920.jpg"
  },
  {
    title: "Parcours personnel et formation",
    year: 2014,
    text: `Né dans les Hautes-Pyrénées, Louis Lareng a connu une enfance marquée par des difficultés familiales puis par le soutien d’un instituteur et d’une tante qui lui a permis d’accéder aux études. Après une formation médicale à Toulouse, il s’est spécialisé en anesthésie-réanimation, discipline émergente à l’époque. Il a mené de front une carrière hospitalière et universitaire, devenant professeur et assumant des responsabilités académiques, tout en menant des actions concrètes sur le terrain hospitalier.
`,
    image: "https://upload.wikimedia.org/wikipedia/commons/6/6d/Marie_Curie_c1920.jpg"
  },
  {
    title: "Distinctions et honneurs",
    year: 2014,
    text: `Au fil de sa carrière, Lareng a reçu de nombreuses distinctions civiles et professionnelles en reconnaissance de son apport à la médecine d’urgence et à l’innovation en santé. Son engagement a été salué par des hommages institutionnels et par la création d’un prix portant son nom, destiné à récompenser des contributions significatives en télémédecine et en e-santé. Plusieurs bâtiments et structures locales ont également été nommés en son honneur, témoignant de son empreinte durable.
`,
    image: "https://upload.wikimedia.org/wikipedia/commons/6/6d/Marie_Curie_c1920.jpg"
  },
  {
    title: "Engagement dans la Protection Civile",
    year: 2014,
    text: `En complément du développement du SAMU, Lareng a participé activement à la structuration de la Protection Civile, promouvant le bénévolat de secours et la coordination des acteurs civiques et médicaux. Son action a contribué à fédérer des associations locales et à renforcer les capacités d’intervention citoyennes, notamment en période de crise. Il a ainsi soutenu le développement d’un réseau de volontaires formés pour assister les services d’urgence.
`,
    image: "https://upload.wikimedia.org/wikipedia/commons/6/6d/Marie_Curie_c1920.jpg"
  },
  {
    title: "Le nouveau combat de Louis Lareng",
    year: 2014,
    text: `Recréer du lien social distendu dans nos sociétés, notamment urbaines. Tel est le leitmotiv du professeur Louis Lareng. Après avoir fondé le SAMU, cet ancien professeur de médecine âgé de 91 ans s’est trouvé un nouveau combat. «Il s’agit de permettre aux populations les plus fragiles de pouvoir reprendre en main leur destin,» dit-il. Pour ce faire, il a le projet de créer ce qu’il appelle un «carrefour de Citoyenneté-institut du Lien social». Récemment, il avait convié à l’IFRASS de Toulouse, (Institut de formation, de recherche, d’animation, santé Sociale), sous le haut patronage de Mme Escoffier, ministre chargée de la Décentralisation, l’ensemble des acteurs régionaux, participant au développement, à la transmission des connaissances et à l’accompagnement des populations fragilisées (personnes âgées, familles monoparentales, handicapés…), pour leur proposer la création du Carrefour de Citoyenneté - Institut du Lien Social.
Cet Institut de formation, dont les contours restent à dessiner par un groupe de travail formé avec les décideurs et acteurs, a pour vocation de promouvoir des formations adaptées aux réalités, et de ce fait, spécifiques, pour les aidants bénévoles et professionnels participant au maintien et au développement du lien social.
«Aujourd’hui, les bouleversements sociétaux perturbent les relations entre les hommes, le chacun pour soi remplaçant le vivre-ensemble. On devient de plus en plus consommateur de République plutôt que de Citoyenneté» explique Louis Lareng. Il faut, selon lui, se mobiliser en faveur ce projet novateur dans lequel l’enseignement de «la pratique de l’accompagnement» sera capable de répondre à la «France qui souffre».
Soulignant l’ambition et la générosité de son projet, Mme Escoffier a assuré de son soutien total dans la mise en œuvre de cet Institut du Lien social.
La Dépêche du Midi
`,
    image: "https://upload.wikimedia.org/wikipedia/commons/6/6d/Marie_Curie_c1920.jpg"
  },
  {
    title: "Hommages et postérité",
    year: 2014,
    text: `La disparition de Louis Lareng a suscité de nombreux hommages. Les institutions locales et nationales ont salué sa vision humaniste et son souci constant que le progrès bénéficie aux patients. Son modèle pour l’organisation des urgences et son engagement pour la télémédecine ont laissé une postérité institutionnelle et scientifique : le réseau des SAMU, des initiatives régionales de télé-santé et des prix académiques perpétuent son œuvre.
`,
    image: "https://upload.wikimedia.org/wikipedia/commons/6/6d/Marie_Curie_c1920.jpg"
  },
  {
    title: "Portrait du visionnaire",
    year: 2014,
    text: `Louis Lareng était perçu comme un humaniste et un visionnaire, animé par l’idée que la médecine doit être accessible et utile à tous. Même après des décennies d’activité, il est resté proche du terrain, attentif à l’innovation et fidèle à ses racines régionales. Sa réputation combine exigence professionnelle, inventivité organisationnelle et simplicité humaine, qualités qui expliquent l’influence durable de son travail sur la médecine d’urgence et la santé numérique.
`,
    image: "https://upload.wikimedia.org/wikipedia/commons/6/6d/Marie_Curie_c1920.jpg"
  },
  ];

  // ---------- make book visuals (canvas textures) ----------
  function makeBookTexture(title, color='#b57a6b' ){
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
