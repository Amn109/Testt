/* media.js — version YouTube thumbnails + iframe embed (minimal)
   - Affiche les miniatures des vidéos YouTube listées dans SLOTS
   - Au clic, insère un iframe youtube-nocookie dans #screenArea
   - Ne convertit pas/ni n'essaie d'utiliser des file:// ou sandbox: schemes
*/

(function(){
  // --- 10 liens YouTube fournis
  const SLOTS = [
    "https://www.youtube.com/watch?v=qDL6VmpMAcc",
    "https://www.youtube.com/watch?v=Y047fBCVA0M",
    "https://www.youtube.com/watch?v=VhwNpQV_nP0",
    "https://www.youtube.com/watch?v=0nl_iTzBovs",
    "https://www.youtube.com/watch?v=r7zFPk2KdWA",
    "https://www.youtube.com/watch?v=UTWX0QFoZVE",
    "https://www.youtube.com/watch?v=Z_lHAKkn8Zg",
    "https://www.youtube.com/watch?v=wk3pGoqxN3Q",
    "https://www.youtube.com/watch?v=-yjMXqeLEag",
    "https://www.youtube.com/watch?v=QtMkeag0Hr0"
  ];

  const TITLES = [
    "Vidéo 1","Vidéo 2","Vidéo 3","Vidéo 4","Vidéo 5",
    "Vidéo 6","Vidéo 7","Vidéo 8","Vidéo 9","Vidéo 10"
  ];

  // DOM refs (doivent exister dans ton HTML)
  const stage = document.getElementById('stage');
  const screenArea = document.getElementById('screenArea');
  const player = document.getElementById('player'); // on garde le <video> mais on l'utilise pas pour YouTube
  const thumbsWrap = document.getElementById('thumbsWrap');
  const playOverlay = document.getElementById('playOverlay');
  const overlayPlayBtn = document.getElementById('overlayPlayBtn');
  const audioControls = document.getElementById('audioControls');
  const volControl = document.getElementById('volControl');
  const fsBtn = document.getElementById('fsBtn');
  const playPauseBtn = document.getElementById('playPauseBtn');

  const seek = document.getElementById('seek');
  const bufferedBar = document.getElementById('bufferedBar');
  const curTimeBar = document.getElementById('curTimeBar');
  const durTimeBar = document.getElementById('durTimeBar');

  let currentIndex = 0;
  let thumbs = [];
  const STORAGE_VOL_KEY = 'tv_volume_v1';
  let currentVolume = parseFloat(localStorage.getItem(STORAGE_VOL_KEY)) || 0.8;
  if(volControl) volControl.value = currentVolume;

  let isSeeking = false;
  let currentIframe = null;
  let usingIframe = false;

  // helper : parse YouTube ID from URL (watch, youtu.be, embed)
  function parseYouTubeId(url){
    if(!url) return null;
    let m;
    m = url.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/);
    if(m) return m[1];
    m = url.match(/[?&]v=([A-Za-z0-9_-]{6,})/);
    if(m) return m[1];
    m = url.match(/youtube\.com\/embed\/([A-Za-z0-9_-]{6,})/);
    if(m) return m[1];
    return null;
  }

  // formatage temps (utile pour mp4 si jamais)
  function fmtTime(s){
    if(!isFinite(s)) return '0:00';
    s = Math.floor(s);
    const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = s%60;
    if(h>0) return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
    return `${m}:${String(sec).padStart(2,'0')}`;
  }

  // build thumbnails: YouTube => image thumbnail
  function buildThumbs(){
    thumbsWrap.innerHTML = '';
    thumbs = [];
    SLOTS.forEach((src, i) => {
      const t = document.createElement('button');
      t.className = 'thumb';
      t.dataset.index = i;
      t.title = TITLES[i] || `Vidéo ${i+1}`;

      const ytId = parseYouTubeId(src);
      if(ytId){
        const img = document.createElement('img');
        img.className = 'thumb-video thumb-img';
        img.alt = TITLES[i] || `Vidéo ${i+1}`;
        // hqdefault.jpg thumbnail
        img.src = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
        t.appendChild(img);
      } else {
        // fallback: show an empty placeholder
        const placeholder = document.createElement('div');
        placeholder.style.width = '100%';
        placeholder.style.height = '100%';
        placeholder.style.background = '#222';
        t.appendChild(placeholder);
      }

      const title = document.createElement('span');
      title.className = 'title';
      title.textContent = TITLES[i] || `Vidéo ${i+1}`;

      const badge = document.createElement('span');
      badge.className = 'badge';
      badge.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8 5v14l11-7z"></path></svg>';

      t.appendChild(badge);
      t.appendChild(title);

      t.addEventListener('click', ()=> onThumbClick(i));
      thumbsWrap.appendChild(t);
      thumbs.push({button:t, src});
    });
    highlightActive();
  }

  function highlightActive(){
    thumbs.forEach((obj, idx) => obj.button.classList.toggle('active', idx === currentIndex));
    updatePlayPauseUI();
  }

  // show iframe youtube in screenArea
  function showYouTubeIframe(ytId){
    removeIframe(); // teardown si présent
    const iframe = document.createElement('iframe');
    iframe.id = 'yt-embed';
    iframe.setAttribute('title', 'YouTube video player');
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
    iframe.setAttribute('allowfullscreen', '');
    // autoplay=1 (peut être bloqué si audio non muté)
    iframe.src = `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = '0';
    screenArea.appendChild(iframe);
    currentIframe = iframe;
    usingIframe = true;
    // hide HTML5 video while iframe visible
    if(player) player.style.display = 'none';
    // timeline won't work for iframe — reset UI
    durTimeBar.textContent = '--:--';
    curTimeBar.textContent = '0:00';
    bufferedBar.style.width = '0%';
    seek.value = 0;
    showOverlay(false);
    audioControls.style.display = 'flex';
  }

  function removeIframe(){
    if(currentIframe){
      try { currentIframe.remove(); } catch(e){/*ignore*/ }
      currentIframe = null;
    }
    usingIframe = false;
    if(player) player.style.display = 'block';
  }

  // play slot: if youtube -> iframe, else (none in this config) do nothing
  function playSlot(i){
    const src = SLOTS[i];
    if(!src) return;
    currentIndex = i;
    highlightActive();

    const ytId = parseYouTubeId(src);
    if(ytId){
      // use iframe embed
      if(player){
        // pause HTML5 player if previously used
        try { player.pause(); } catch(e){}
      }
      showYouTubeIframe(ytId);
    } else {
      // fallback: nothing
      console.warn('Source non-YouTube détectée (aucune action)', src);
    }
  }

  function onThumbClick(i){ playSlot(i); }

  // overlay listener (if user clicks to unmute) — for iframe we can't unmute via overlay
  overlayPlayBtn && overlayPlayBtn.addEventListener('click', ()=>{
    showOverlay(false);
    try {
      if(usingIframe){
        // nothing to do — the user must interact with the iframe/player itself
      } else {
        player.muted = false;
        player.volume = currentVolume;
        player.play().catch(()=>{});
      }
    } catch(e){ console.warn(e); }
  });

  // play/pause UI (for HTML5 video only, for iframe we just focus)
  function togglePlayPause(){
    if(usingIframe){
      if(currentIframe) currentIframe.focus();
      return;
    }
    if(player.paused) player.play().catch(e => console.warn('Play failed', e));
    else player.pause();
    updatePlayPauseUI();
  }
  function updatePlayPauseUI(){
    if(!playPauseBtn) return;
    let isPlaying = false;
    if(!usingIframe){
      isPlaying = !!(player.currentTime > 0 && !player.paused && !player.ended && player.readyState > 2);
    }
    playPauseBtn.textContent = isPlaying ? '⏸' : '▶';
    playPauseBtn.title = isPlaying ? 'Pause' : 'Lecture';
  }
  if(playPauseBtn) playPauseBtn.addEventListener('click', (e)=>{ e.preventDefault(); togglePlayPause(); });

  // keyboard space shortcut
  document.addEventListener('keydown', (e)=>{
    const tag = document.activeElement && document.activeElement.tagName.toLowerCase();
    if(tag === 'input' || tag === 'textarea') return;
    if(e.code === 'Space'){ e.preventDefault(); togglePlayPause(); }
  });

  // small helpers for timeline (do nothing for iframe)
  function updateBuffered(){
    if(usingIframe){
      bufferedBar.style.width = '0%';
      return;
    }
    try{
      const b = player.buffered;
      if(b && b.length && isFinite(player.duration) && player.duration > 0){
        const end = b.end(b.length-1);
        const pct = (end / player.duration) * 100;
        bufferedBar.style.width = pct + '%';
      } else bufferedBar.style.width = '0%';
    }catch(e){ bufferedBar.style.width = '0%'; }
  }

  // mp4 handlers exist but won't run in this setup; safe to keep minimal behaviour
  if(player){
    player.addEventListener('timeupdate', ()=> {
      if(!isSeeking && !usingIframe && isFinite(player.duration) && player.duration > 0){
        const pct = (player.currentTime / player.duration) * 100;
        seek.value = pct;
        curTimeBar.textContent = fmtTime(player.currentTime);
      }
    });
    player.addEventListener('loadedmetadata', ()=> {
      if(!usingIframe) durTimeBar.textContent = fmtTime(player.duration);
      updateBuffered();
    });
    player.addEventListener('progress', updateBuffered);
    player.addEventListener('play', ()=> { if(!player.muted) showOverlay(false); audioControls.style.display='flex'; updatePlayPauseUI(); });
    player.addEventListener('pause', ()=> updatePlayPauseUI());
    player.addEventListener('ended', ()=> {
      const next = (currentIndex + 1) % SLOTS.length;
      playSlotWithCurtain(next);
    });
  }

  // curtain sequence (same as ton code)
  function playSlotWithCurtain(i){
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

  // init
  document.addEventListener('DOMContentLoaded', ()=>{
    buildThumbs();
    if(player) player.volume = currentVolume;
    setTimeout(()=> {
      stage.classList.add('open');
      const cssDur = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--curtain-duration')) || 1.1;
      setTimeout(()=> { playSlot(currentIndex); }, cssDur * 1000 + 80);
    }, 180);
  });

})();
