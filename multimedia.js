/* multimedia.js - playlist + UI (no libs) */

(function(){
  // playlist - change src/poster/titles to your files if needed
  const playlist = [
    {
      id: 'bunny',
      title: 'Big Buck Bunny',
      desc: 'Animation courte très populaire (Big Buck Bunny).',
      src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      poster: 'https://peach.blender.org/wp-content/uploads/title_anouncement.jpg?x11217'
    },
    {
      id: 'elephant',
      title: 'Elephants Dream',
      desc: 'Court métrage d\'animation (Elephants Dream).',
      src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      poster: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Elephants_Dream_screenshot_001.png/320px-Elephants_Dream_screenshot_001.png'
    },
    {
      id: 'sintel',
      title: 'Sintel',
      desc: 'Sintel — court métrage d\'animation.',
      src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      poster: 'https://download.blender.org/durian/trailer/sintel_trailer-480p.jpg'
    }
  ];

  // DOM
  const player = document.getElementById('player');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const thumbsWrap = document.getElementById('thumbs');
  const playToggle = document.getElementById('playToggle');
  const timeLabel = document.getElementById('time');
  const posterImg = document.getElementById('posterImg');
  const metaTitle = document.getElementById('metaTitle');
  const metaDesc = document.getElementById('metaDesc');

  let current = 0;

  // build thumbnails
  function buildThumbs(){
    playlist.forEach((it, idx) => {
      const d = document.createElement('div'); d.className = 'thumb'; d.dataset.idx = idx;
      const img = document.createElement('img'); img.src = it.poster; img.alt = it.title;
      d.appendChild(img);
      d.addEventListener('click', ()=> select(idx, true));
      thumbsWrap.appendChild(d);
    });
    updateThumbs();
  }

  function updateThumbs(){
    const nodes = thumbsWrap.querySelectorAll('.thumb');
    nodes.forEach(n => n.classList.remove('active'));
    const sel = thumbsWrap.querySelector(`.thumb[data-idx="${current}"]`);
    if(sel) sel.classList.add('active');
  }

  // select video
  function select(idx, autoplay=false){
    current = (idx + playlist.length) % playlist.length;
    const it = playlist[current];
    // update player src
    player.src = it.src;
    player.poster = it.poster;
    posterImg.src = it.poster;
    metaTitle.textContent = it.title;
    metaDesc.textContent = it.desc;
    updateThumbs();

    if(autoplay){
      player.play().catch(()=>{/* autoplay blocked */});
      playToggle.textContent = '⏸';
    } else {
      playToggle.textContent = '▶';
    }
  }

  // prev/next handlers
  prevBtn.addEventListener('click', ()=> { select(current - 1, true); });
  nextBtn.addEventListener('click', ()=> { select(current + 1, true); });

  // play/pause toggle
  playToggle.addEventListener('click', ()=> {
    if(player.paused) { player.play(); playToggle.textContent = '⏸'; }
    else { player.pause(); playToggle.textContent = '▶'; }
  });

  // keyboard controls
  window.addEventListener('keydown', (e)=>{
    if(e.code === 'Space'){ e.preventDefault(); if(player.paused) player.play(); else player.pause(); }
    if(e.key === 'ArrowRight'){ select(current + 1, true); }
    if(e.key === 'ArrowLeft'){ select(current - 1, true); }
  });

  // update time display
  player.addEventListener('timeupdate', ()=> {
    const s = Math.floor(player.currentTime);
    const mm = Math.floor(s / 60), ss = s % 60;
    timeLabel.textContent = `${mm}:${String(ss).padStart(2,'0')}`;
    // transport play/pause icon sync
    playToggle.textContent = player.paused ? '▶' : '⏸';
  });

  // when video ends -> advance
  player.addEventListener('ended', ()=> select(current + 1, true));

  // initial build
  buildThumbs();
  select(0, false);

  // nav buttons in header
  document.getElementById('btn-home').addEventListener('click', ()=> window.location.href = 'index.html');
  document.getElementById('btn-chrono').addEventListener('click', ()=> window.location.href = 'chronologie.html');
  document.getElementById('openGallery').addEventListener('click', ()=> window.location.href = 'galerie.html');
  document.getElementById('gotoChrono').addEventListener('click', ()=> window.location.href = 'chronologie.html');

})();
