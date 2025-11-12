/* media.js — ajoute la timeline (seek) au-dessus des vignettes
   - affiche temps courant / durée
   - affiche buffered
   - permet de chercher (drag / click)
   - garde le reste : rideau, vignettes, autoplay overlay, volume, fullscreen, play/pause
*/

(function(){
  const SLOTS = [
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
  ];

  const TITLES = [
    "Entretien — Marie Curie",
    "Portrait — Nelson Mandela",
    "Interview — Simone Veil",
    "Conversation — Albert Einstein",
    "Témoignage — Rosa Parks",
    "Portrait — Charles de Gaulle",
    "Interview — Frida Kahlo",
    "Entretien — Winston Churchill",
    "Portrait — Martin Luther King Jr.",
    "Hommage — Léonard de Vinci"
  ];

  // DOM
  const stage = document.getElementById('stage');
  const screenArea = document.getElementById('screenArea');
  const player = document.getElementById('player');
  const thumbsWrap = document.getElementById('thumbsWrap');
  const playOverlay = document.getElementById('playOverlay');
  const overlayPlayBtn = document.getElementById('overlayPlayBtn');
  const audioControls = document.getElementById('audioControls');
  const volControl = document.getElementById('volControl');
  const fsBtn = document.getElementById('fsBtn');
  const playPauseBtn = document.getElementById('playPauseBtn');

  // timeline elements
  const seek = document.getElementById('seek');
  const bufferedBar = document.getElementById('bufferedBar');
  const curTimeBar = document.getElementById('curTimeBar');
  const durTimeBar = document.getElementById('durTimeBar');

  let currentIndex = 0;
  let thumbs = [];
  const STORAGE_VOL_KEY = 'tv_volume_v1';
  let currentVolume = parseFloat(localStorage.getItem(STORAGE_VOL_KEY)) || 0.8;
  volControl.value = currentVolume;

  let isSeeking = false;

  // bloque le scroll global
  function preventDefault(e){ e.preventDefault(); }
  window.addEventListener('wheel', preventDefault, { passive:false });
  window.addEventListener('touchmove', preventDefault, { passive:false });
  document.addEventListener('keydown', (e) => {
    const scrollKeys = ['ArrowUp','ArrowDown','PageUp','PageDown','Home','End'];
    if(scrollKeys.includes(e.code)){
      const ae = document.activeElement;
      if(ae === document.body || ae === document.documentElement) e.preventDefault();
    }
  }, { passive:false });

  // formatage temps
  function fmtTime(s){
    if(!isFinite(s)) return '0:00';
    s = Math.floor(s);
    const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = s%60;
    if(h>0) return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
    return `${m}:${String(sec).padStart(2,'0')}`;
  }

  // construction des vignettes
  function buildThumbs(){
    thumbsWrap.innerHTML = '';
    SLOTS.forEach((src, i) => {
      const t = document.createElement('button');
      t.className = 'thumb';
      t.dataset.index = i;
      t.title = TITLES[i] || `Vidéo ${i+1}`;

      const vid = document.createElement('video');
      vid.src = src;
      vid.muted = true;
      vid.loop = true;
      vid.playsInline = true;
      vid.preload = 'metadata';
      vid.autoplay = true;
      vid.className = 'thumb-video';

      const title = document.createElement('span');
      title.className = 'title';
      title.textContent = TITLES[i] || `Vidéo ${i+1}`;

      const badge = document.createElement('span');
      badge.className = 'badge';
      badge.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8 5v14l11-7z"></path></svg>';

      t.appendChild(vid);
      t.appendChild(badge);
      t.appendChild(title);

      t.addEventListener('click', ()=> onThumbClick(i));
      thumbsWrap.appendChild(t);
      thumbs.push({button:t, video:vid});
      vid.play().catch(()=>{/* ignore preview failure */});
    });
    highlightActive();
  }

  function highlightActive(){
    thumbs.forEach((obj, idx) => obj.button.classList.toggle('active', idx === currentIndex));
    updatePlayPauseUI();
  }

  // volume wiring
  volControl.addEventListener('input', (e)=>{
    currentVolume = parseFloat(e.target.value);
    localStorage.setItem(STORAGE_VOL_KEY, currentVolume);
    if(player){
      player.volume = currentVolume;
      if(currentVolume > 0) player.muted = false;
    }
  });

  // overlay
  function showOverlay(show){
    if(show){ playOverlay.classList.add('show'); playOverlay.setAttribute('aria-hidden','false'); }
    else { playOverlay.classList.remove('show'); playOverlay.setAttribute('aria-hidden','true'); }
  }

  // lecture d'un slot (tentative audio non muet)
  function playSlot(i){
    const src = SLOTS[i];
    if(!src) return;
    currentIndex = i;
    highlightActive();

    player.src = src;
    player.volume = currentVolume;
    player.muted = false;
    player.removeAttribute('controls');
    player.load();

    player.play().then(()=> {
      showOverlay(false);
      updatePlayPauseUI();
    }).catch(err => {
      console.warn('Autoplay audio blocked — showing overlay', err);
      player.muted = true;
      player.play().catch(()=>{/* ignore */});
      showOverlay(true);
      updatePlayPauseUI();
    }).finally(()=> {
      audioControls.style.display = 'flex';
    });
  }

  // rideau sequence
  function playSlotWithCurtain(i){
    if(i === currentIndex && !player.paused && !player.muted) return;
    currentIndex = i;
    highlightActive();

    const cssDur = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--curtain-duration')) || 1.1;
    const durMs = Math.round(cssDur * 1000);

    stage.classList.remove('open');
    void stage.offsetHeight;
    setTimeout(()=> {
      stage.classList.add('open');
      setTimeout(()=> { playSlot(i); }, durMs + 40);
    }, durMs + 80);
  }

  // fullscreen helpers
  function isFullscreen(){ return !!(document.fullscreenElement || document.webkitFullscreenElement); }
  function enterFullscreen(){ const t = screenArea || player; if(t.requestFullscreen) return t.requestFullscreen(); if(t.webkitRequestFullscreen) return t.webkitRequestFullscreen(); }
  function exitFullscreen(){ if(document.exitFullscreen) return document.exitFullscreen(); if(document.webkitExitFullscreen) return document.webkitExitFullscreen(); }
  function updateFsButton(){ if(isFullscreen()) { fsBtn.classList.add('fullscreen'); fsBtn.textContent='⤢'; fsBtn.title='Quitter le plein écran'; } else { fsBtn.classList.remove('fullscreen'); fsBtn.textContent='⛶'; fsBtn.title='Plein écran'; } }
  fsBtn.addEventListener('click',(e)=>{ e.preventDefault(); if(!isFullscreen()) enterFullscreen().catch(()=>{}); else exitFullscreen().catch(()=>{}); });
  document.addEventListener('fullscreenchange', updateFsButton);
  document.addEventListener('webkitfullscreenchange', updateFsButton);

  // overlay click: explicit user gesture to play with audio
  overlayPlayBtn.addEventListener('click', ()=>{
    showOverlay(false);
    try { player.muted = false; player.volume = currentVolume; player.play().catch(()=>{}); } catch(e){ console.warn(e); }
  });

  // click sur vidéo : toggle mute/unmute
  player.addEventListener('click', ()=> {
    if(player.muted){ player.muted = false; player.volume = currentVolume; showOverlay(false); }
    else { player.muted = true; }
    updatePlayPauseUI();
  });

  // fin -> suivante
  player.addEventListener('ended', ()=> {
    const next = (currentIndex + 1) % SLOTS.length;
    playSlotWithCurtain(next);
  });

  // play/pause UI sync
  player.addEventListener('play', ()=> { if(!player.muted) showOverlay(false); audioControls.style.display='flex'; updatePlayPauseUI(); });
  player.addEventListener('pause', ()=> updatePlayPauseUI());

  // thumbnail click
  function onThumbClick(i){ playSlotWithCurtain(i); }

  /* -------- TIMELINE (seek) -------- */
  // mise à jour du buffered bar
  function updateBuffered(){
    try{
      const b = player.buffered;
      if(b && b.length && isFinite(player.duration) && player.duration > 0){
        const end = b.end(b.length-1);
        const pct = (end / player.duration) * 100;
        bufferedBar.style.width = pct + '%';
      } else {
        bufferedBar.style.width = '0%';
      }
    }catch(e){ bufferedBar.style.width = '0%'; }
  }

  // timeupdate -> mettre à jour seek si pas en train de drag
  player.addEventListener('timeupdate', ()=> {
    if(!isSeeking && isFinite(player.duration) && player.duration > 0){
      const pct = (player.currentTime / player.duration) * 100;
      seek.value = pct;
      curTimeBar.textContent = fmtTime(player.currentTime);
    }
  });

  // metadata loaded -> durée
  player.addEventListener('loadedmetadata', ()=> {
    durTimeBar.textContent = fmtTime(player.duration);
    updateBuffered();
  });

  player.addEventListener('progress', updateBuffered);

  // interaction utilisateur sur la seekbar
  seek.addEventListener('input', (e) => {
    if(!isFinite(player.duration)) return;
    const pct = parseFloat(e.target.value);
    const t = (pct/100) * player.duration;
    curTimeBar.textContent = fmtTime(t); // preview while dragging
    isSeeking = true;
  });

  seek.addEventListener('change', (e) => {
    if(!isFinite(player.duration)) { isSeeking = false; return; }
    const pct = parseFloat(e.target.value);
    const t = (pct/100) * player.duration;
    player.currentTime = t;
    isSeeking = false;
  });

  // clicking directly on the timeline area to jump (optional)
  document.querySelectorAll('.timeline-area').forEach(area => {
    area.addEventListener('click', (ev) => {
      const rect = ev.currentTarget.getBoundingClientRect();
      const x = ev.clientX - rect.left;
      const pct = (x / rect.width) * 100;
      if(isFinite(player.duration) && player.duration>0){
        player.currentTime = (pct/100) * player.duration;
      }
    });
  });

  /* -------- play / pause control (bottom button) -------- */
  function togglePlayPause(){
    if(!player.src) return;
    if(player.paused) player.play().catch(e => console.warn('Play failed', e));
    else player.pause();
    updatePlayPauseUI();
  }
  function updatePlayPauseUI(){
    if(!playPauseBtn) return;
    const isPlaying = !!(player.currentTime > 0 && !player.paused && !player.ended && player.readyState > 2);
    playPauseBtn.textContent = isPlaying ? '⏸' : '▶';
    playPauseBtn.title = isPlaying ? 'Pause' : 'Lecture';
  }
  if(playPauseBtn) playPauseBtn.addEventListener('click', (e)=>{ e.preventDefault(); togglePlayPause(); });

  // raccourci espace pour play/pause (empêche scroll)
  document.addEventListener('keydown', (e)=>{
    const tag = document.activeElement && document.activeElement.tagName.toLowerCase();
    if(tag === 'input' || tag === 'textarea') return;
    if(e.code === 'Space'){ e.preventDefault(); togglePlayPause(); }
  });

  /* -------- init -------- */
  document.addEventListener('DOMContentLoaded', ()=>{
    buildThumbs();
    player.volume = currentVolume;
    // ouverture rideaux et tentative de lecture initiale
    setTimeout(()=> {
      stage.classList.add('open');
      const cssDur = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--curtain-duration')) || 1.1;
      setTimeout(()=> { playSlot(currentIndex); }, cssDur * 1000 + 80);
    }, 180);
  });

})();
