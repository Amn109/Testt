/* galerie.js
   - tout le code précédent (thumbnails, lightbox, arrows, WebP attempt...)
   - + navigation buttons: Accueil (index.html) & Chronologie (chronologie.html)
   - injecte les styles nécessaires, accessible et minimaliste
*/

(function(){
  const imagesList = [
    
    "https://images.ladepeche.fr/api/v1/images/view/5c2cbabc8fe56f1b09089402/large/image.jpg",
    "https://scontent-cdg4-2.xx.fbcdn.net/v/t1.6435-9/74627109_2380577095524706_1145143056840785920_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=127cfc&_nc_ohc=2SBEQQYW-7oQ7kNvwH-WGYO&_nc_oc=AdmwgfJDyc2UE6xv3ij-Cio4T2qCDiHg4ARe0E1MnoDbpHHqQEXt-AM7KaTBX_I3ALcgJEPjv-nGYpXMY0dq2nxk&_nc_zt=23&_nc_ht=scontent-cdg4-2.xx&_nc_gid=Em8FNThGKsa0ZsaH8xx9FQ&oh=00_AfjEMehYiq_Jyk4fDYSeMUYguCzdlxaX78Nbt_-azx8b6g&oe=69455FAE",
    "https://images.ladepeche.fr/api/v1/images/view/5dc15ebad286c24d460e5117/large/image.jpg?v=1",
    "https://scontent-cdg4-3.xx.fbcdn.net/v/t1.6435-9/74620871_2380576062191476_5231523487994085376_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=127cfc&_nc_ohc=ZH70h6wXG6MQ7kNvwG_UbET&_nc_oc=Adnj2_UneQ1luoA4L4HrEerEDP8JJCp3tfX_TTgB5_zltz7lL9243ru-E9Kki83MXg_9UCn-X3C8e22D6gk8PXOE&_nc_zt=23&_nc_ht=scontent-cdg4-3.xx&_nc_gid=jMk-wHAh_Hq05Ic-1eLOEQ&oh=00_AfiZCGcWrDtVUZwhMQXBCUfj-NcWPYMNqFuCdCnlJ7HxGQ&oe=694551AD",
    "https://scontent-cdg4-2.xx.fbcdn.net/v/t1.6435-9/73523556_2380576698858079_5476094245976670208_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=127cfc&_nc_ohc=UZ_eFqWJgRoQ7kNvwGwRWsY&_nc_oc=AdmscK7XkslbDos1f3hil6o5BrjpTvij1bX38RfWjRurF7ypCVQg2Syi1Q7Yca9YjAjMvWvJtn4j5zaeVrm8cCQR&_nc_zt=23&_nc_ht=scontent-cdg4-2.xx&_nc_gid=-jIGSL3fB1GKpeDTKflO7A&oh=00_AfhkKJyvlsak8p7po-749CzhM3pHX1j860Y8XOBtikQqHQ&oe=69455685",
    "https://images.ladepeche.fr/api/v1/images/view/5dbef14fd286c20ffc76e545/full/image.jpg?v=1",
    "https://images.ladepeche.fr/api/v1/images/view/5dbef1c68fe56f16e27db5f5/full/image.jpg?v=1 , https://protectioncivile06.org/wp-content/uploads/2019/11/LARENG_1-1.jpg",
    "https://cdn-s-www.dna.fr/images/7AB6C42E-5232-4848-8550-B6CF282F263A/NW_raw/louis-lareng-(au-centre)-avec-jean-jacques-buttiker-responsable-de-l-antenne-de-bartenheim-et-elisabeth-groelly-presidente-departementale-de-la-protection-civile-photos-dna-ghislaine-mougel-1424800907.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/c/c1/Louis_Lareng%2C_le_24_mai_2013.JPG"
  ];

  const MAX_IMAGES = Math.min(20, imagesList.length);

  function safeLocal(name){
    if(/^https?:\/\//i.test(name)) return name;
    return './' + encodeURIComponent(name);
  }

  // Try WebP variant then fallback
  function resolveBest(orig){
    return new Promise((resolve) => {
      const url = safeLocal(orig);
      const extMatch = url.match(/\.(jpe?g|png)$/i);
      if(!extMatch) return resolve(url);
      const webpUrl = url.replace(/\.(jpe?g|png)$/i, '.webp');
      const img = new Image();
      let done = false;
      const tidy = (u) => { if(!done){ done = true; img.onload = img.onerror = null; resolve(u); } };
      img.onload = () => tidy(webpUrl);
      img.onerror = () => tidy(url);
      img.src = webpUrl;
      setTimeout(()=> { if(!done) tidy(url); }, 1200);
    });
  }

  function preload(src){
    const i = new Image();
    i.decoding = 'async';
    i.src = src;
  }

  // DOM refs
  const body = document.body;
  const scene = document.getElementById('scene');
  const overlay = document.getElementById('overlay');
  const progress = document.getElementById('progress');
  const mainFrame = document.getElementById('mainFrame');
  const spotlight = document.getElementById('spotlight');
  const artLights = document.getElementById('artLights');

  const portrait = document.getElementById('portraitImage');

  const btnPrev = document.getElementById('btnPrev');
  const btnNext = document.getElementById('btnNext');
  const gCounter = document.getElementById('gCounter');

  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxClose = document.getElementById('lightboxClose');

  // dynamic elements
  let thumbStrip = null;
  let thumbs = [];
  let arrowLeft = null;
  let arrowRight = null;
  let navButtonsContainer = null;

  let currentIndex = 1;
  let raf = null;
  let pulseId = null;

  // inject CSS for thumb strip, arrows and nav buttons
  (function injectStyles(){
    const s = document.createElement('style');
    s.textContent = `
      .thumb-strip {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 10px;
        align-items: center;
        justify-content: center;
        padding: 8px 12px;
        z-index: 30;
        background: transparent;
        max-width: 760px;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }
      .thumb-strip .thumb {
        width: 64px;
        height: 48px;
        object-fit: cover;
        border-radius: 6px;
        box-shadow: 0 6px 18px rgba(0,0,0,0.45);
        border: 1px solid rgba(255,255,255,0.03);
        cursor: pointer;
        transition: transform 160ms var(--ease), box-shadow 160ms var(--ease), border-color 160ms var(--ease);
        flex: 0 0 auto;
      }
      .thumb-strip .thumb.active {
        transform: translateY(-6px) scale(1.06);
        outline: 2px solid rgba(255,210,110,0.06);
        border-color: rgba(255,255,255,0.06);
        box-shadow: 0 18px 36px rgba(0,0,0,0.6);
      }
      .thumb-strip::-webkit-scrollbar{ height:8px; }
      .thumb-strip::-webkit-scrollbar-thumb{ background: rgba(255,255,255,0.04); border-radius:8px; }

      .extra-arrow {
        width:44px;
        height:44px;
        border-radius:8px;
        display:inline-flex;
        align-items:center;
        justify-content:center;
        background: linear-gradient(180deg, rgba(20,16,14,0.95), rgba(10,8,7,0.95));
        color:#fff;
        border: 1px solid rgba(255,255,255,0.02);
        box-shadow: 0 8px 24px rgba(0,0,0,0.45);
        cursor:pointer;
        position:absolute;
        z-index:40;
      }
      .extra-arrow:disabled { opacity:0.36; cursor:not-allowed; transform:none; box-shadow:none; }
      .extra-arrow svg { width:18px; height:18px; }
      .extra-arrow:hover { transform: translateY(-2px); }

      /* Nav buttons top-left */
      .nav-buttons {
        position: fixed;
        left: 18px;
        top: 18px;
        display: flex;
        gap: 10px;
        z-index: 500;
        align-items: center;
      }
      .nav-btn {
        background: linear-gradient(180deg, rgba(18, 16, 14, 0), rgba(12, 10, 9, 0));
        color: #f6e9d6;
        padding: 8px 12px;
        border-radius: 8px;
        font-family:Inter, system-ui
        font-size: 13px;
        border: 1px solid rgba(255,255,255,0.03);
        box-shadow: 0 8px 20px rgba(0,0,0,0.5);
        cursor: pointer;
        transition: transform 160ms var(--ease), opacity 160ms var(--ease);
      }
      .nav-btn:focus { outline: 3px solid rgba(255,200,120,0.12); outline-offset:2px; }
      .nav-btn:hover { transform: translateY(-2px); }
      @media (max-width:700px){
        .thumb-strip { width: min(90vw, 420px); left: 50%; transform: translateX(-50%); }
        .nav-buttons { left: 12px; top: 12px; gap:8px; }
        .nav-btn { padding: 6px 10px; font-size:12px; }
      }
    `;
    document.head.appendChild(s);
  })();

  // hide cartel (description) and the bottom gallery-controls (counter + bottom arrows)
  function hideCartelAndBottomControls(){
    try {
      const cartel = document.querySelector('.cartel');
      if(cartel) cartel.style.display = 'none';
      const galleryControls = document.querySelector('.gallery-controls');
      if(galleryControls) galleryControls.style.display = 'none';
      if(gCounter) gCounter.style.display = 'none';
    } catch(e){}
  }

  function setButtonsState(){
    if(btnPrev) btnPrev.disabled = currentIndex <= 1;
    if(btnNext) btnNext.disabled = currentIndex >= MAX_IMAGES;
    if(arrowLeft) arrowLeft.disabled = currentIndex <= 1;
    if(arrowRight) arrowRight.disabled = currentIndex >= MAX_IMAGES;
  }

  function highlightThumb(){
    thumbs.forEach((t, idx) => {
      if(idx === currentIndex - 1) t.classList.add('active');
      else t.classList.remove('active');
    });
    if(thumbStrip && thumbs[currentIndex - 1]){
      const t = thumbs[currentIndex - 1];
      const scroll = t.offsetLeft - (thumbStrip.clientWidth/2) + (t.clientWidth/2);
      thumbStrip.scrollTo({ left: scroll, behavior: 'smooth' });
    }
  }

  function prev(){ if(currentIndex > 1) updatePortrait(currentIndex - 1); }
  function nextImg(){ if(currentIndex < MAX_IMAGES) updatePortrait(currentIndex + 1); }

  // create thumbnail strip and append to body
  function createThumbnailStrip(){
    if(thumbStrip) return;
    thumbStrip = document.createElement('div');
    thumbStrip.className = 'thumb-strip';
    imagesList.forEach((src, i) => {
      const t = document.createElement('img');
      t.className = 'thumb';
      t.draggable = false;
      t.alt = `Vignette ${i+1}`;
      t.addEventListener('click', ()=> updatePortrait(i+1));
      thumbs.push(t);
      thumbStrip.appendChild(t);
      resolveBest(src).then(u => { t.src = u; }).catch(()=> { t.src = safeLocal(src); });
    });
    document.body.appendChild(thumbStrip);
    positionThumbStrip();
    highlightThumb();
  }

  // create side arrows (left/right)
  function createExtraArrows(){
    removeExtraArrows();
    arrowLeft = document.createElement('button');
    arrowLeft.className = 'extra-arrow';
    arrowLeft.setAttribute('aria-label', 'Image précédente');
    arrowLeft.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>`;
    arrowLeft.addEventListener('click', (e)=>{ e.preventDefault(); prev(); });
    arrowRight = document.createElement('button');
    arrowRight.className = 'extra-arrow';
    arrowRight.setAttribute('aria-label', 'Image suivante');
    arrowRight.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg>`;
    arrowRight.addEventListener('click', (e)=>{ e.preventDefault(); nextImg(); });

    document.body.appendChild(arrowLeft);
    document.body.appendChild(arrowRight);
    repositionExtraArrows();
    setButtonsState();
  }
  function removeExtraArrows(){
    if(arrowLeft && arrowLeft.parentNode) arrowLeft.parentNode.removeChild(arrowLeft);
    if(arrowRight && arrowRight.parentNode) arrowRight.parentNode.removeChild(arrowRight);
    arrowLeft = null; arrowRight = null;
  }

  // create top-left nav buttons (Accueil & Chronologie)
  function createNavButtons({ accueilHref = 'index.html', chronoHref = 'chronologie.html' } = {}){
    if(navButtonsContainer) return;
    navButtonsContainer = document.createElement('div');
    navButtonsContainer.className = 'nav-buttons';
    const btnHome = document.createElement('button');
    btnHome.className = 'nav-btn';
    btnHome.setAttribute('aria-label','Aller à l\'accueil');
    btnHome.textContent = '';
    btnHome.addEventListener('click', ()=> { window.location.href = accueilHref; });

    const btnChrono = document.createElement('button');
    btnChrono.className = 'nav-btn';
    btnChrono.setAttribute('aria-label','Aller à la chronologie');
    btnChrono.textContent = '';
    btnChrono.addEventListener('click', ()=> { window.location.href = chronoHref; });

    navButtonsContainer.appendChild(btnHome);
    navButtonsContainer.appendChild(btnChrono);
    document.body.appendChild(navButtonsContainer);

    // keyboard shortcuts: H = home, C = chronologie (only when not typing)
    window.addEventListener('keydown', (e) => {
      if(e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = document.activeElement && document.activeElement.tagName.toLowerCase();
      if(tag === 'input' || tag === 'textarea' || (document.activeElement && document.activeElement.isContentEditable)) return;
      if(e.key === 'h' || e.key === 'H') { btnHome.focus(); setTimeout(()=> btnHome.click(), 60); }
      if(e.key === 'c' || e.key === 'C') { btnChrono.focus(); setTimeout(()=> btnChrono.click(), 60); }
    });
  }

  // reposition arrows relative to the frame bounding box
  function repositionExtraArrows(){
    if(!mainFrame) return;
    const rect = mainFrame.getBoundingClientRect();
    const size = 44;
    const midY = rect.top + rect.height/2;
    if(arrowLeft){
      const leftX = Math.max(6, rect.left - (size + 12));
      arrowLeft.style.left = `${leftX}px`;
      arrowLeft.style.top  = `${midY - (size/2)}px`;
    }
    if(arrowRight){
      const rightX = Math.min(window.innerWidth - size - 6, rect.right + 12);
      arrowRight.style.left = `${rightX}px`;
      arrowRight.style.top  = `${midY - (size/2)}px`;
    }
  }

  // position thumb strip under the frame
  function positionThumbStrip(){
    if(!thumbStrip || !mainFrame) return;
    const rect = mainFrame.getBoundingClientRect();
    const top = rect.bottom + 18;
    thumbStrip.style.top = `${Math.max(top, 24)}px`;
    thumbStrip.style.maxWidth = `${Math.min(rect.width * 1.05, 840)}px`;
    const centerX = rect.left + rect.width/2;
    thumbStrip.style.left = `${centerX}px`;
  }

  function setupObservers(){
    if(!scene) return;
    const mo = new MutationObserver(()=> {
      repositionExtraArrows();
      positionThumbStrip();
    });
    mo.observe(scene, { attributes:true, attributeFilter:['style'] });

    if(window.ResizeObserver && mainFrame){
      const ro = new ResizeObserver(()=> {
        repositionExtraArrows();
        positionThumbStrip();
      });
      ro.observe(mainFrame);
    }

    window.addEventListener('scroll', () => { repositionExtraArrows(); positionThumbStrip(); });
    window.addEventListener('resize', () => { repositionExtraArrows(); positionThumbStrip(); });
  }

  // updatePortrait with smooth swap, no scene jump & reposition
  function updatePortrait(index){
    if(index < 1 || index > MAX_IMAGES) return;
    currentIndex = index;
    hideCartelAndBottomControls();

    const prevSceneTransform = scene ? (scene.style.transform || getComputedStyle(scene).transform) : '';
    const prevSceneTransition = scene ? scene.style.transition : '';
    if(scene) scene.style.transition = 'none';

    if(portrait){
      portrait.style.transition = 'opacity 140ms ease';
      portrait.style.opacity = '0';
    }
    if(mainFrame){
      mainFrame.style.transition = 'transform 120ms ease';
      mainFrame.style.transform = 'translateY(-6px) scale(1.03)';
    }

    const srcRaw = imagesList[index - 1];

    resolveBest(srcRaw).then(finalUrl => {
      const onLoad = () => {
        if(scene){
          scene.style.transform = prevSceneTransform || '';
          setTimeout(()=> { scene.style.transition = prevSceneTransition || ''; }, 40);
        }
        portrait.style.opacity = '1';
        portrait.removeEventListener('load', onLoad);
        portrait.removeEventListener('error', onError);
        setTimeout(()=> {
          repositionExtraArrows();
          positionThumbStrip();
          highlightThumb();
          setButtonsState();
        }, 40);
      };
      const onError = () => {
        portrait.src = safeLocal(srcRaw);
        if(scene) scene.style.transition = prevSceneTransition || '';
        portrait.style.opacity = '1';
        portrait.removeEventListener('load', onLoad);
        portrait.removeEventListener('error', onError);
        setTimeout(()=> {
          repositionExtraArrows();
          positionThumbStrip();
          highlightThumb();
          setButtonsState();
        }, 80);
      };

      portrait.addEventListener('load', onLoad);
      portrait.addEventListener('error', onError);

      portrait.src = finalUrl;
      portrait.setAttribute('data-highres', finalUrl);
      portrait.alt = `Tableau ${index} sur ${MAX_IMAGES}`;

      // update cartel text if present (hidden)
      const cartelTitle = document.querySelector('.cartel .cartel-title');
      const cartelMeta = document.querySelector('.cartel .cartel-meta');
      if(cartelTitle) cartelTitle.textContent = `Tableau ${index}`;
      if(cartelMeta) cartelMeta.textContent = `Image ${index} — Don musée`;

      // preload neighbours
      if(index < imagesList.length) resolveBest(imagesList[index]).then(preload).catch(()=>{});
      if(index - 2 >= 0) resolveBest(imagesList[index - 2]).then(preload).catch(()=>{});

      stopPulse();
      setTimeout(()=> startPulse(1.03), 420);

    }).catch(()=>{
      const fallback = safeLocal(srcRaw);
      portrait.src = fallback;
      portrait.setAttribute('data-highres', fallback);
      portrait.alt = `Tableau ${index} sur ${MAX_IMAGES}`;
      if(scene) scene.style.transition = prevSceneTransition || '';
      portrait.style.opacity = '1';
      setTimeout(()=> {
        repositionExtraArrows();
        positionThumbStrip();
        highlightThumb();
        setButtonsState();
      }, 80);
    });
  }

  function startPulse(baseScale = 1.03){
    let start = null;
    function step(now){
      if(!start) start = now;
      const t = (now - start) / 1000;
      const breathing = 0.007 * (Math.sin(t * 1.9) * 0.5 + 0.5);
      const s = baseScale + breathing;
      if(mainFrame) mainFrame.style.transform = `translateY(-6px) scale(${s})`;
      pulseId = requestAnimationFrame(step);
    }
    pulseId = requestAnimationFrame(step);
  }
  function stopPulse(){ if(pulseId) cancelAnimationFrame(pulseId); if(mainFrame) mainFrame.style.transform = ''; }

  function hideOverlaySmoothly(delay = 240){
    if(!overlay) return;
    overlay.style.opacity = '0';
    setTimeout(()=> { try{ overlay.style.display = 'none'; } catch(e){} }, delay + 80);
  }
  function positionOverlay(offsetY = 220){
    if(!mainFrame || !overlay) return;
    overlay.style.display = overlay.style.display === 'none' ? 'flex' : overlay.style.display;
    overlay.style.opacity = overlay.style.opacity || '1';
    const rect = mainFrame.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const topY = rect.bottom + offsetY;
    overlay.style.left = `${centerX}px`;
    overlay.style.top = `${topY}px`;
    overlay.style.transform = `translate(-50%, 0)`;
  }
  function positionArtLights(verticalOffset = 160){
    if(!mainFrame || !artLights) return;
    artLights.style.display = artLights.style.display === 'none' ? 'flex' : artLights.style.display;
    const rect = mainFrame.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const topY = rect.top - verticalOffset;
    artLights.style.left = `${centerX}px`;
    artLights.style.top = `${topY}px`;
    artLights.style.transform = `translateX(-50%)`;
  }

  function setupAutoReposition(){
    setupObservers();
    let frames = 0;
    function loop() {
      repositionExtraArrows();
      positionThumbStrip();
      frames++;
      if(frames < 120) requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  function easeOutCubic(t){ return 1 - Math.pow(1 - t, 3); }
  function computeCameraTransform(targetEl, containerEl, scale = 1.28){
    const tRect = targetEl.getBoundingClientRect();
    const cRect = containerEl.getBoundingClientRect();
    const dx = (tRect.left + tRect.width/2) - (cRect.left + cRect.width/2);
    const dy = (tRect.top + tRect.height/2) - (cRect.top + cRect.height/2);
    return { tx: -dx, ty: -dy, scale };
  }
  function animateCamera(tx, ty, scale, duration = 1000, cb){
    const start = performance.now();
    const from = { x: 0, y: 0, s: 1 };
    function step(now){
      const t = Math.min(1, (now - start) / duration);
      const e = easeOutCubic(t);
      const curX = from.x + (tx - from.x) * e;
      const curY = from.y + (ty - from.y) * e;
      const curS = from.s + (scale - from.s) * e;
      if(scene) scene.style.transform = `translate(${curX}px, ${curY}px) scale(${curS})`;
      if(t < 1) raf = requestAnimationFrame(step);
      else if(cb) cb();
    }
    raf = requestAnimationFrame(step);
  }

  function playEntrance(){
    positionOverlay(220);
    positionArtLights(160);
    const dur1 = 1200, dur2 = 900;
    const startTime = performance.now();
    function tick(now){
      const t = Math.min(1, (now - startTime) / dur1);
      if(progress) progress.style.width = `${Math.round(t * 100)}%`;
      if(progress) progress.setAttribute('aria-valuenow', Math.round(t * 100));
      if(t < 1) raf = requestAnimationFrame(tick);
      else {
        if(progress){ progress.style.width='100%'; progress.setAttribute('aria-valuenow',100); }
        hideOverlaySmoothly(260);
        setTimeout(()=> { body.classList.add('entered'); if(artLights) artLights.style.opacity='1'; }, 160);
        const cam = computeCameraTransform(mainFrame, document.documentElement, 1.22);
        scene._camera = { tx: cam.tx * 0.55, ty: cam.ty * 0.28, s: cam.scale };
        setTimeout(()=> {
          animateCamera(scene._camera.tx, scene._camera.ty, scene._camera.s, dur2, ()=> {
            if(spotlight) spotlight.style.opacity = '1';
            if(mainFrame) mainFrame.setAttribute('aria-disabled','false');
            if(mainFrame) mainFrame.style.cursor = 'pointer';
            const baseScale = 1.03;
            if(mainFrame) mainFrame.style.transition = 'transform 360ms ease';
            if(mainFrame) mainFrame.style.transform = `translateY(-6px) scale(${baseScale})`;
            setTimeout(()=> startPulse(baseScale), 380);
            positionArtLights(160);
          });
        }, 180);
      }
    }
    raf = requestAnimationFrame(tick);
  }

  // lightbox
  function openLightbox(){
    const url = portrait.getAttribute('data-highres') || portrait.src || '';
    if(!url) return;
    lightboxImage.src = url;
    lightboxImage.alt = portrait.alt || 'Image agrandie';
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    body.classList.add('lightbox-open');
    body.classList.add('no-tilt');
    stopPulse();
    lightboxClose.focus();
  }
  function closeLightbox(){
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    body.classList.remove('lightbox-open');
    body.classList.remove('no-tilt');
    startPulse(1.03);
    setTimeout(()=> { if(mainFrame) mainFrame.style.transition = ''; }, 120);
    if(mainFrame) mainFrame.focus();
  }

  window.addEventListener('keydown', (e) => {
    if(lightbox.classList.contains('open')){
      if(e.key === 'Escape'){ closeLightbox(); return; }
      if(e.key === 'ArrowLeft'){ if(currentIndex > 1) updatePortrait(currentIndex - 1); e.preventDefault(); }
      if(e.key === 'ArrowRight'){ if(currentIndex < MAX_IMAGES) updatePortrait(currentIndex + 1); e.preventDefault(); }
      return;
    }
    if(e.key === 'ArrowLeft'){ if(currentIndex > 1) updatePortrait(currentIndex - 1); }
    else if(e.key === 'ArrowRight'){ if(currentIndex < MAX_IMAGES) updatePortrait(currentIndex + 1); }
    else if(e.key === 'Enter' || e.key === ' '){
      if(document.activeElement === mainFrame){
        e.preventDefault();
        openLightbox();
      }
    }
  });

  if(mainFrame){
    mainFrame.addEventListener('click', openLightbox);
    mainFrame.addEventListener('keydown', (e) => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); openLightbox(); } });
  }
  if(portrait) portrait.addEventListener('dragstart', e => e.preventDefault());
  if(lightbox) lightbox.addEventListener('click', (e)=>{ if(e.target === lightbox) closeLightbox(); });
  if(lightboxClose) lightboxClose.addEventListener('click', closeLightbox);

  // tilt / parallax
  (function(){
    const frame = document.getElementById('mainFrame');
    if(!frame) return;
    const img = document.getElementById('portraitImage');
    const canvas = frame.querySelector('.canvas');
    const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let rafId = null;
    let pointer = { x:0, y:0, active:false };
    let state = { rx:0, ry:0, tx:0, ty:0 };

    function onPointerMove(e){
      if(document.body.classList.contains('no-tilt')) return;
      pointer.active = true;
      const rect = frame.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const px = (e.clientX - cx) / (rect.width / 2);
      const py = (e.clientY - cy) / (rect.height / 2);
      pointer.x = Math.max(-1, Math.min(1, px));
      pointer.y = Math.max(-1, Math.min(1, py));
      if(!rafId) rafId = requestAnimationFrame(updateFrame);
    }
    function updateFrame(){
      const maxRot = 3.2;
      const maxTranslate = 8;
      let targetRx = -pointer.y * maxRot;
      let targetRy = pointer.x * maxRot;
      let targetTx = -pointer.x * maxTranslate;
      let targetTy = -pointer.y * maxTranslate * 0.5;
      if(document.body.classList.contains('no-tilt')) { targetRx = 0; targetRy = 0; targetTx = 0; targetTy = 0; pointer.active = false; }
      state.rx += (targetRx - state.rx) * 0.12;
      state.ry += (targetRy - state.ry) * 0.12;
      state.tx += (targetTx - state.tx) * 0.12;
      state.ty += (targetTy - state.ty) * 0.12;
      frame.style.transform = `translateZ(0) rotateX(${state.rx}deg) rotateY(${state.ry}deg) scale(1.02)`;
      img.style.transform = `translate(${state.tx * 1.2}px, ${state.ty * 1.2}px) scale(1.03)`;
      if(canvas) canvas.style.transform = `translateZ(28px) translateY(${state.ty * 0.6}px)`;
      if(Math.abs(state.rx - targetRx) > 0.01 || Math.abs(state.ry - targetRy) > 0.01 || pointer.active) rafId = requestAnimationFrame(updateFrame);
      else { cancelAnimationFrame(rafId); rafId = null; }
    }
    function onPointerLeave(){ pointer.active = false; pointer.x=0; pointer.y=0; if(!rafId) rafId = requestAnimationFrame(updateFrame); }

    if(!prefersReduce){
      frame.addEventListener('pointermove', onPointerMove, { passive:true });
      frame.addEventListener('pointerenter', onPointerMove, { passive:true });
      frame.addEventListener('pointerleave', onPointerLeave, { passive:true });
      frame.addEventListener('focus', ()=>{ frame.style.transform = 'translateZ(0) scale(1.02) rotateX(0deg) rotateY(0deg)'; img.style.transform = 'scale(1.03)'; });
      frame.addEventListener('blur', ()=>{ frame.style.transform=''; img.style.transform=''; });
    }
  })();

  // preload first few images
  for(let i=0;i<Math.min(3, imagesList.length); i++){
    resolveBest(imagesList[i]).then(preload).catch(()=>{ preload(safeLocal(imagesList[i])); });
  }

  // init
  document.addEventListener('DOMContentLoaded', () => {
    hideCartelAndBottomControls();
    createThumbnailStrip();
    createExtraArrows();
    createNavButtons({ accueilHref: 'index.html', chronoHref: 'chronologie.html' });
    setupAutoReposition();

    if(imagesList.length > 0){ currentIndex = 1; updatePortrait(currentIndex); }
    if(overlay){ overlay.style.display = 'flex'; overlay.style.opacity = '1'; }
    if(artLights){ artLights.style.display = 'flex'; artLights.style.opacity = '0'; }
    if(mainFrame) mainFrame.setAttribute('aria-disabled','true');
    positionOverlay(220); positionArtLights(160);
    playEntrance();

    document.addEventListener('click', ()=> { repositionExtraArrows(); positionThumbStrip(); }, { passive:true });
  });

})();
