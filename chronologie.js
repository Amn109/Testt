/* chronologie.js — ring abaissé au centre (remplace entièrement votre fichier) */

(function(){
  // ---------- CONFIG / DATA ----------
 const EVENTS = [
    {
      year: "8 avril 1923",
      title: "Naissance Louis Xavier Dominique Lareng est né à Ayzac-Ost (Hautes-Pyrénées)." ,
      text: "Louis Xavier Dominique Lareng est né à Ayzac-Ost (Hautes-Pyrénées).",
      source: "Wikipédia",
      img: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Louis_Lareng%2C_le_24_mai_2013.JPG"
    },
    {
      year: "1955",
      title: "Doctorat en médecine",
      text: "Il obtient son diplôme de docteur en médecine.",
      source: "Wikipédia",
      img: "https://www.univ-toulouse.fr/sites/default/files/louis_lareng.jpg"
    },
    {
      year: "1961",
      title: "Professeur agrégé d’anesthésie-réanimation",
      text: "Il devient professeur, spécialisé dans l’anesthésie-réanimation, à l’université de Toulouse.",
      source: "Wikipédia",
      img: "https://www.char-fr.net/local/cache-vignettes/L515xH669/louis_lareng_jeune-6a598.jpg?1744949566"
    },
    {
      year: "16 juillet 1968",
      title: "Création du premier SAMU à Toulouse",
      text: "Une délibération de la Commission Administrative des Hôpitaux de Toulouse crée le SAMU à titre d’essai, sous l’impulsion de Lareng.",
      source: "samu-urgences-de-france.fr",
      img: "https://protectioncivile06.org/wp-content/uploads/2019/11/LARENG_1-1.jpg"
    },
    {
      year: "1972",
      title: "Reconnaissance du SAMU",
      text: "Le système du SAMU commence à être officiellement reconnu en France, avec régulation d’appel et intervention pré-hospitalière.",
      source: "Wikipédia",
      img: "https://www.char-fr.net/IMG/png/lareng_louis_2.png"
    },
    {
      year: "21 juin 1981",
      title: "Élection député",
      text: "Lareng est élu député de la Haute-Garonne (groupe socialiste).",
      source: "Wikipédia",
      img: "https://www.assemblee-nationale.fr/histoire/trombinoscope/VRepublique/Legis07/Photo/lareng_louis.jpg"
    },
    {
      year: "6 janvier 1986",
      title: "Loi « Lareng » sur l’aide médicale urgente",
      text: "En tant que député, il fait adopter la loi qui étend le SAMU à l’ensemble du territoire français.",
      source: "Wikipédia",
      img: "https://france3-regions.franceinfo.fr/image/X74ilsD4lU3U8Gb2HfGXcoBbec0/2101x1181/regions/2020/06/09/5edf916064a65_maxnewsworldtwo618406-4498325.jpg"
    },
    {
      year: "7 octobre 2008",
      title: "Inauguration du Pavillon Louis Lareng",
      text: "À Toulouse, le bâtiment du SAMU 31 est inauguré et porte désormais son nom.",
      source: "CHU Média",
      img: "https://mediaclip.ina.fr/media/videos/imagettes/886x498/2d1/R24064614.jpeg"
    },
    {
      year: "2011",
      title: "40 ans du SAMU & hommage",
      text: "Le documentaire « Louis Lareng – 40 ans au pied de l’arbre » est diffusé en hommage à son action.",
      source: "Wikipédia",
      img: "https://images.ladepeche.fr/api/v1/images/view/5c37cefd3e454652ab344f7e/small/image.jpg"
    },
    {
      year: "2012",
      title: "Médaille Grand Or de la Protection Civile",
      text: "Il reçoit cette distinction en reconnaissance de son engagement dans la médecine d'urgence.",
      source: "Wikipédia",
      img: "https://lh3.googleusercontent.com/proxy/WsA0H5G2WNQ59MXLGKBZSB_3HBFESFv92sIZpbtp3DwkuzzP3u_wuKk25_V7u6cC26BdMyGgEJCCUz1xak3a9nez3Ise6qYpVYU"
    },
    {
      year: "8 avril 2016",
      title: "Inscription de la Légion d’honneur",
      text: "Il est fait chevalier de la Légion d’honneur (ou distinction équivalente selon les sources).",
      source: "Wikipédia",
      img: "https://cdn-hub.ina.fr/notice/690x517/107/RBF01012396.jpeg"
    },
    {
      year: "3 novembre 2019",
      title: "Décès",
      text: "Louis Lareng s’éteint à Toulouse à l’âge de 96 ans.",
      source: "Santé et Autonomie / communiqués",
      img: "https://www.grandsudinsolite.fr/client/gfx/photos/produit/01-lareng-1_16373.jpg"
    },
    {
      year: "13 mai 2022",
      title: "Station de téléphérique nommée en son honneur",
      text: "La station « Hôpital Rangueil – Louis Lareng » est inaugurée à Toulouse en hommage à son œuvre.",
      source: "Wikipédia / communiqués locaux",
      img: "https://i.ytimg.com/vi/jLG6HlRHgys/maxresdefault.jpg"
    },
    {
      year: "2020-21 (date indéterminée)",
      title: "Promotion « Louis Lareng »",
      text: "La promotion des élèves directeurs d’hôpital de l'EHESP prend le nom «Louis Lareng» en reconnaissance de son impact.",
      source: "Wikipédia / EHESP",
      img: "https://www.univ-toulouse.fr/sites/default/files/louis_lareng.jpg"
    },
    {
      year: "Date indéterminée",
      title: "Impact et héritage national",
      text: "Le modèle SAMU initié par Lareng est désormais présent dans presque tous les départements français, incarnant la régulation médicosanitaire d'urgence.",
      source: "Analyses historiques / CHU",
      img: "https://www.char-fr.net/IMG/jpg/lareng-serre_1984.jpg"
    }
  ];


  // ---------- UI SELECTORS (attendus dans le HTML) ----------
  const carouselEl = document.getElementById('carousel');
  const btnL = document.getElementById('btnLeft');
  const btnR = document.getElementById('btnRight');
  const detailPane = document.getElementById('detailPane');
  const closeDetail = document.getElementById('closeDetail');
  const detailImg = document.getElementById('detailImg');
  const detailTitle = document.getElementById('detailTitle');
  const detailYear = document.getElementById('detailYear');
  const detailText = document.getElementById('detailText');

  // ---------- VISUAL / BEHAVIOR CONFIG ----------
  const visibleCount = Math.max(5, Math.min(11, Math.floor(EVENTS.length * 0.6)));
  const focusScale = 1.06;
  const baseScaleDefault = 0.92;
  const CARD_WIDTH_PX = 150; // réduit légèrement pour meilleure lisibilité
  const CARD_HEIGHT_PX = 200;

  // POSITIONNEMENT DU RING (modifie si besoin)
  // RING_TOP place le ring relatif au conteneur (plus grand % = plus bas)
  // RING_TRANSLATE_Y ajoute un translateY à l'intérieur du transform (affecte l'apparence)
  const RING_TOP = '66%';         // <-- position verticale (plus grand = plus bas)
  const RING_TRANSLATE_Y = '40%'; // <-- translate qui fait descendre visuellement le ring

  // ---------- internal ----------
  const n = EVENTS.length;
  const angleStep = 360 / n;
  let rotationY = 0;
  let targetRotationY = 0;
  let animating = false;
  let baseScale = baseScaleDefault;

  // create ring and cards
  const ring = document.createElement('div');
  ring.className = 'ring';
  carouselEl.innerHTML = '';
  carouselEl.appendChild(ring);

  document.documentElement.style.setProperty('--card-w', CARD_WIDTH_PX + 'px');
  document.documentElement.style.setProperty('--card-h', CARD_HEIGHT_PX + 'px');

  const cards = [];
  EVENTS.forEach((ev, i) => {
    const c = document.createElement('button');
    c.className = 'card';
    c.dataset.index = i;
    c.setAttribute('aria-label', `${ev.year} — ${ev.title}`);
    c.innerHTML = `
      <div class="cover"><img loading="lazy" src="${ev.img}" alt="${ev.title}"></div>
      <div class="meta"><div class="year">${ev.year}</div><div class="title">${ev.title}</div></div>
    `;
    c.style.width = CARD_WIDTH_PX + 'px';
    c.style.height = CARD_HEIGHT_PX + 'px';

    ring.appendChild(c);
    cards.push(c);

    c.addEventListener('click', () => openDetail(i));
  });

  function toRad(d){ return d * Math.PI / 180; }
  function normAngle(a){
    let r = ((a + 180) % 360) - 180;
    if(r < -180) r += 360;
    return r;
  }

  function computeRadius(){
    const cw = CARD_WIDTH_PX;
    const raw = (cw/2) / Math.tan(Math.PI / Math.max(3, n));
    const maxAllowed = Math.max(420, (carouselEl.clientWidth || window.innerWidth) * 0.48);
    const minAllowed = 300;
    const r = Math.max(minAllowed, Math.min(maxAllowed, Math.round(raw * 1.06)));
    return r;
  }

  function isVisible(frontIndex, i){
    const dist = Math.min(Math.abs(i - frontIndex), n - Math.abs(i - frontIndex));
    const half = Math.floor(visibleCount / 2);
    return dist <= half;
  }

  function findFrontIndex(){
    let best = 0, bestVal = Infinity;
    for(let i=0;i<n;i++){
      const v = Math.abs(normAngle(i * angleStep + rotationY));
      if(v < bestVal){ bestVal = v; best = i; }
    }
    return best;
  }

  function applyTransforms(){
    const radius = computeRadius();
    ring.style.transform = `translate(-50%, ${RING_TRANSLATE_Y}) rotateY(${rotationY}deg) scale(${baseScale})`;
    const front = findFrontIndex();

    cards.forEach((c,i) => {
      const ang = i * angleStep;
      c.style.transform = `rotateY(${ang}deg) translateZ(${radius}px) translateY(-50%)`;
      const rel = normAngle(ang + rotationY);
      const absRel = Math.abs(rel);
      const depthFactor = Math.max(0, 1 - absRel / 180);

      if(isVisible(front, i)){
        if(absRel < angleStep * 0.6){
          c.style.opacity = '1';
          c.style.pointerEvents = 'auto';
          c.style.zIndex = '300';
          c.style.transform += ` scale(${focusScale})`;
          c.classList.add('front');
        } else {
          const o = 0.4 + depthFactor * 0.9;
          c.style.opacity = String(Math.max(0.4, Math.min(0.98, o)));
          c.style.pointerEvents = 'auto';
          c.style.zIndex = String(Math.round(100 + depthFactor * 140));
          c.classList.remove('front');
        }
      } else {
        c.style.opacity = '0.06';
        c.style.pointerEvents = 'none';
        c.style.zIndex = '1';
        c.classList.remove('front');
      }
    });
  }

  function animateTo(target, cb){
    targetRotationY = target;
    animating = true;
    const step = () => {
      rotationY += (targetRotationY - rotationY) * 0.16;
      applyTransforms();
      if(Math.abs(targetRotationY - rotationY) < 0.04){
        rotationY = targetRotationY;
        animating = false;
        applyTransforms();
        if(cb) cb();
      } else {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }

  function goToIndex(index, animate = true){
    index = ((index % n) + n) % n;
    let desired = -index * angleStep;
    while(desired - rotationY > 180) desired -= 360;
    while(desired - rotationY < -180) desired += 360;
    if(animate) animateTo(desired); else { rotationY = desired; applyTransforms(); }
  }

  function next(steps = 1){ goToIndex(getCurrentIndex() + steps, true); }
  function prev(steps = 1){ goToIndex(getCurrentIndex() - steps, true); }

  function getCurrentIndex(){
    let best = 0, bestVal = Infinity;
    for(let i=0;i<n;i++){
      const v = Math.abs(normAngle(i * angleStep + rotationY));
      if(v < bestVal){ bestVal = v; best = i; }
    }
    return best;
  }

  function openDetail(i){
    const ev = EVENTS[i];
    if(!detailPane) return;
    detailImg.src = ev.img;
    detailTitle.textContent = ev.title;
    detailYear.textContent = ev.year;
    detailPane.setAttribute('aria-hidden','false');
    goToIndex(i, true);
    closeDetail && closeDetail.focus();
  }
  closeDetail && closeDetail.addEventListener('click', ()=> detailPane.setAttribute('aria-hidden','true'));

  // input handlers
  let dragging = false, lastX = 0;
  carouselEl.addEventListener('pointerdown', (e)=>{
    dragging = true; lastX = e.clientX;
    carouselEl.setPointerCapture && carouselEl.setPointerCapture(e.pointerId);
    document.body.style.cursor = 'grabbing';
  });
  window.addEventListener('pointermove', (e)=>{
    if(!dragging) return;
    const dx = e.clientX - lastX;
    lastX = e.clientX;
    rotationY += dx * 0.28;
    applyTransforms();
  });
  window.addEventListener('pointerup', (e)=>{
    if(!dragging) return;
    dragging = false; document.body.style.cursor = '';
    const nearest = getCurrentIndex();
    goToIndex(nearest, true);
  });

  carouselEl.addEventListener('wheel', (ev)=>{
    ev.preventDefault();
    baseScale += (ev.deltaY < 0 ? 0.045 : -0.045);
    baseScale = Math.max(0.62, Math.min(1.08, baseScale));
    applyTransforms();
  }, { passive:false });

  btnL && btnL.addEventListener('click', () => prev(1));
  btnR && btnR.addEventListener('click', () => next(1));
  window.addEventListener('keydown', (e)=>{
    if(e.key === 'ArrowLeft') prev(1);
    if(e.key === 'ArrowRight') next(1);
    if(e.key === 'Escape') detailPane && detailPane.setAttribute('aria-hidden','true');
  });

  function init(){
    rotationY = 0;
    baseScale = baseScaleDefault;
    ring.style.position = 'absolute';
    ring.style.left = '50%';
    ring.style.top = RING_TOP;            // <-- position verticale du ring
    ring.style.transformStyle = 'preserve-3d';
    ring.style.transformOrigin = 'center center';
    applyTransforms();
    goToIndex(0, false);
    setTimeout(()=> { applyTransforms(); }, 80);
    window.addEventListener('resize', applyTransforms);
  }
  init();

  // expose helpers for debugging in console
  window._chronomap = {
    EVENTS, goToIndex, next, prev, getCurrentIndex, computeRadius, applyTransforms
  };

})();

/* ---------- Robust timeline click handler (improved) ----------
   Remplace l'ancien "timeline detail enhancer".
   - écoute pointerdown/touchstart/click en capture
   - vérifie elementFromPoint et retry court si un overlay temporaire bloque
   - ouvre panneau détail (lorem) sans modifier le DOM existant
----------------------------------------------------------------*/
(function(){
  const SELECTORS = [
    '.card',
    '.timeline-card',
    '.carousel-item',
    '.tile',
    '.panel',
    '.item',
    '.frame',
    '.alcove .canvas img',
    '.canvas img',
    '.thumb img',
    '#carousel img',
    '[data-timeline-index]'
  ].join(',');

  const $ = (s, r=document) => r.querySelector(s);
  const $all = (s, r=document) => Array.from(r.querySelectorAll(s));

  // create detail pane if missing (non-destructif)
  if(!document.getElementById('timelineDetailPane')){
    const pane = document.createElement('div');
    pane.id = 'timelineDetailPane';
    pane.setAttribute('aria-hidden','true');
    pane.innerHTML = `
      <div class="td-inner" role="dialog" aria-label="Détails événement">
        <button class="td-close" aria-label="Fermer">✕</button>
        <div class="td-left"><img class="td-img" src="" alt=""></div>
        <div class="td-right">
          <div class="td-year">0000</div>
          <h3 class="td-title">Titre</h3>
          <div class="detailText"><p></p></div>
        </div>
      </div>
    `;
    const css = `
      #timelineDetailPane{ position:fixed; left:50%; bottom:8vh; transform:translate(-50%,18px); width:min(980px,94%); background:linear-gradient(180deg, rgba(6,14,13,0.94), rgba(2,6,6,0.98)); color:#e9efe9; border-radius:10px; box-shadow:0 30px 120px rgba(0,0,0,0.7); padding:14px; border:1px solid rgba(255,255,255,0.02); opacity:0; pointer-events:none; transition:opacity 260ms ease, transform 320ms cubic-bezier(.2,.9,.3,1); z-index:1200; }
      #timelineDetailPane[aria-hidden="false"]{ opacity:1; pointer-events:auto; transform:translate(-50%,0); }
      #timelineDetailPane .td-inner{ display:flex; gap:16px; align-items:flex-start; position:relative; }
      #timelineDetailPane .td-left{ flex:0 0 240px; height:160px; border-radius:8px; overflow:hidden; background:rgba(255,255,255,0.02); box-shadow: inset 0 2px 6px rgba(255,255,255,0.02); }
      #timelineDetailPane .td-left img{ width:100%; height:100%; object-fit:cover; display:block; }
      #timelineDetailPane .td-right{ flex:1; font-family: Georgia, serif; line-height:1.45; padding-right:8px; }
      #timelineDetailPane .td-title{ margin:4px 0 8px 0; font-size:18px; color:#fff; }
      #timelineDetailPane .td-year{ color: #7fe0bd; font-weight:700; font-size:13px; opacity:0.95; }
      #timelineDetailPane .td-body p{ margin:0 0 10px 0; color:rgba(233,230,222,0.95); }
      #timelineDetailPane .td-close{ position:absolute; right:12px; top:8px; background:rgba(0,0,0,0.45); border:0; color:#fff; padding:6px 10px; border-radius:8px; cursor:pointer; font-size:14px; box-shadow:0 6px 18px rgba(0,0,0,0.45); }
      @media (max-width:720px){ #timelineDetailPane .td-inner{ flex-direction:column; } #timelineDetailPane .td-left{ width:100%; height:220px; } }
    `;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    document.body.appendChild(pane);
  }

  const pane = document.getElementById('timelineDetailPane');
  const closeBtn = pane.querySelector('.td-close');
  const imgEl = pane.querySelector('.td-img');
  const titleEl = pane.querySelector('.td-title');
  const yearEl = pane.querySelector('.td-year');
  const bodyEl = pane.querySelector('.td-body');

  function openPane({year='', title='Événement', src='', html=null}){
    if(src) imgEl.src = src; else imgEl.removeAttribute('src');
    imgEl.alt = title;
    titleEl.textContent = title;
    yearEl.textContent = year || '';
    if(html) bodyEl.innerHTML = html;
    pane.setAttribute('aria-hidden','false');
  }
  function closePane(){ pane.setAttribute('aria-hidden','true'); }

  closeBtn.addEventListener('click', closePane);
  window.addEventListener('keydown', (e)=> { if(e.key === 'Escape') closePane(); });

  // helper: try to find candidate from element or point
  function findCandidateFromEvent(ev){
    // prefer closest selector from the original target
    const direct = ev.target && ev.target.closest ? ev.target.closest(SELECTORS) : null;
    if(direct) return direct;
    // try elementFromPoint (use client coords)
    const x = ev.clientX || (ev.touches && ev.touches[0] && ev.touches[0].clientX) || 0;
    const y = ev.clientY || (ev.touches && ev.touches[0] && ev.touches[0].clientY) || 0;
    const el = document.elementFromPoint(x, y);
    if(!el) return null;
    return el.closest ? el.closest(SELECTORS) : null;
  }

  // robust open routine (with a short retry if an overlay hides the card)
  function handleOpenForEvent(ev){
    // don't process right-click / ctrl-click
    if(ev.button && ev.button !== 0) return;
    // find candidate immediately
    let candidate = findCandidateFromEvent(ev);
    if(candidate){
      processCandidate(candidate);
      return;
    }

    // if nothing found, attempt a quick retry loop (100ms total) to account for transient overlays/animations
    let attempts = 0;
    const maxAttempts = 6;
    const retry = setInterval(() => {
      attempts++;
      candidate = findCandidateFromEvent(ev);
      if(candidate || attempts >= maxAttempts){
        clearInterval(retry);
        if(candidate) processCandidate(candidate);
      }
    }, 18);
  }

  function processCandidate(candidate){
    // safety: ensure it's visible
    if(!candidate) return;
    // extract metadata (data-* first, then fallbacks)
    const dataYear = candidate.dataset && candidate.dataset.year ? candidate.dataset.year.trim() : '';
    const dataTitle = candidate.dataset && candidate.dataset.title ? candidate.dataset.title.trim() : '';
    const dataImg  = candidate.dataset && candidate.dataset.img ? candidate.dataset.img.trim() : '';
    const dataDesc = candidate.dataset && candidate.dataset.desc ? candidate.dataset.desc.trim() : '';

    const qYear = candidate.querySelector && (candidate.querySelector('.year') || candidate.querySelector('.meta .year'));
    const qTitle = candidate.querySelector && (candidate.querySelector('.title') || candidate.querySelector('.meta .title') || candidate.querySelector('h4') || candidate.querySelector('h3'));
    const qImg = candidate.querySelector && candidate.querySelector('img');

    const year = dataYear || (qYear ? qYear.textContent.trim() : '');
    const title = dataTitle || (qTitle ? qTitle.textContent.trim() : '') || (qImg ? (qImg.alt || '') : '') || 'Événement';
    const src = dataImg || (qImg ? qImg.src : '') || '';

    // try richer text from global arrays if present
    let htmlDesc = null;
    try {
      const idx = candidate.dataset && (candidate.dataset.index || candidate.dataset.timelineIndex || candidate.dataset['timelineIndex']);
      if(idx && window.events && window.events[idx] && window.events[idx].description){
        htmlDesc = `<p>${window.events[idx].description}</p>`;
      } else if(idx && window.TIMELINE_EVENTS && TIMELINE_EVENTS[idx] && TIMELINE_EVENTS[idx].desc){
        htmlDesc = `<p>${TIMELINE_EVENTS[idx].desc}</p>`;
      } else if(dataDesc){
        htmlDesc = `<p>${dataDesc}</p>`;
      }
    } catch(e){
      console.warn('[timeline] error while reading global events:', e);
    }

    openPane({ year, title, src, html: htmlDesc });
  }

  // install listeners: pointerdown (capture), touchstart, click (capture) to be defensive
  const optsCapture = { capture: true, passive: false };

  // pointerdown: primary for mouse/pen/touch
  document.addEventListener('pointerdown', function(ev){
    // if pane is open and click inside pane, ignore (handled elsewhere)
    if(pane.getAttribute('aria-hidden') === 'false' && pane.contains(ev.target)) return;
    // if clicked a detail-close, skip
    if(ev.target.closest && ev.target.closest('#timelineDetailPane')) return;
    try { handleOpenForEvent(ev); } catch(e){ console.error('[timeline] handler error', e); }
  }, optsCapture);

  // touchstart fallback
  document.addEventListener('touchstart', function(ev){
    try { handleOpenForEvent(ev); } catch(e){ console.error('[timeline] handler error', e); }
  }, optsCapture);

  // click capture as final catch-all
  document.addEventListener('click', function(ev){
    // allow links inside timeline to work normally unless we specifically handle a card
    const candidate = findCandidateFromEvent(ev);
    if(candidate){
      ev.preventDefault(); // prevent link navigation if any
      processCandidate(candidate);
      ev.stopPropagation();
    }
  }, optsCapture);

  // extra debug: if user opens console we might want to re-attach listeners (helps intermittent race)
  window.addEventListener('focus', () => {
    // no-op but left for future expansions
  });

  // click outside pane closes it
  document.addEventListener('click', function(e){
    if(pane.getAttribute('aria-hidden') === 'false' && !pane.contains(e.target)){
      // don't close when clicking a timeline card (we want card clicks to open)
      if(e.target.closest && e.target.closest(SELECTORS)) return;
      closePane();
    }
  });

  // developer debug helper - enable this to log pointer events and elementFromPoint if you still have issues.
  // console.log('[timeline] robust click handler active — selectors:', SELECTORS);
})();
