// frise.js - détecte la page actuelle et met la pastille en "active"
// place ce fichier en <script defer> (voir HTML)
(() => {
  const timeline = document.getElementById('siteTimeline');
  if (!timeline) return;
  const links = Array.from(timeline.querySelectorAll('a[data-key]'));

  // récupère le nom de fichier courant (fallback index.html)
  const path = (window.location.pathname || '').split('/').pop();
  const current = path === '' ? 'index.html' : path;

  // active le bon lien
  let activeIndex = 0;
  links.forEach((a, i) => {
    // normaliser href (juste le fichier)
    const key = (a.getAttribute('data-key') || '').split('/').pop();
    if (key === current) {
      a.classList.add('active');
      a.setAttribute('aria-current', 'page');
      activeIndex = i;
    } else {
      a.classList.remove('active');
      a.removeAttribute('aria-current');
    }
    // accessibility: keyboard activation
    a.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        a.click();
      }
    });
  });

  // navigation clavier gauche/droite (optionnel mais pratique)
  window.addEventListener('keydown', (e) => {
    // n'interfère pas si l'utilisateur tape dans un champ
    const tag = document.activeElement && document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement.isContentEditable) return;

    if (e.key === 'ArrowRight' || e.key === 'PageDown') {
      const next = (activeIndex + 1) % links.length;
      window.location.href = links[next].getAttribute('href');
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      const prev = (activeIndex - 1 + links.length) % links.length;
      window.location.href = links[prev].getAttribute('href');
    }
  });

  // Amélioration : si tu veux marquer visuellement le point central (par ex. pour debug),
  // tu peux ajouter une classe spéciale via JS ici.
})();
