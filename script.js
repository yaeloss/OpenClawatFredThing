const slideFiles = [
  'slides/s1-title.html',
  'slides/s2-chatbot-to-agent.html',
  'slides/s3-what-is-openclaw.html',
  'slides/s4-how-it-works.html',
  'slides/s5-bigtech-vs-opensource.html',
  'slides/s6-agent-trilemma.html',
  'slides/s7-live-demo.html',
  'slides/s8-closing.html'
];

let current = 0;
let total = 0;
let slides;
let substep = 0;

function updateProgress() {
  document.getElementById('progress').style.width = ((current + 1) / total * 100) + '%';
}

function applySubstep(slideEl, step) {
  for (let i = 0; i <= 10; i++) slideEl.classList.remove('stage-' + i);
  slideEl.classList.add('stage-' + step);
}

function removeSubstepClasses(slideEl) {
  for (let i = 0; i <= 10; i++) slideEl.classList.remove('stage-' + i);
}

function goTo(n) {
  const currentSlide = slides[current];
  const maxSub = parseInt(currentSlide.dataset.substeps || '0', 10);
  const direction = n > current ? 1 : (n < current ? -1 : 0);

  // Handle substeps within current slide
  if (direction === 1 && substep < maxSub) {
    substep++;
    applySubstep(currentSlide, substep);
    return;
  }

  if (direction === -1 && substep > 0) {
    substep--;
    applySubstep(currentSlide, substep);
    return;
  }

  // Prevent going out of bounds
  const target = Math.max(0, Math.min(n, total - 1));
  if (target === current) return;

  // Leave current slide
  slides[current].classList.remove('active');
  removeSubstepClasses(slides[current]);

  current = target;
  const newSlide = slides[current];
  const newMaxSub = parseInt(newSlide.dataset.substeps || '0', 10);

  // If arriving by going backward, show slide fully revealed
  if (direction === -1 && newMaxSub > 0) {
    substep = newMaxSub;
  } else {
    substep = 0;
  }

  newSlide.classList.add('active');
  if (newMaxSub > 0) {
    applySubstep(newSlide, substep);
  }

  updateProgress();
}

function initNavigation() {
  slides = document.querySelectorAll('.slide');
  total = slides.length;
  if (total > 0) {
    slides[0].classList.add('active');
    const firstMaxSub = parseInt(slides[0].dataset.substeps || '0', 10);
    if (firstMaxSub > 0) applySubstep(slides[0], 0);
    updateProgress();
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') { e.preventDefault(); goTo(current + 1); }
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); goTo(current - 1); }
    if (e.key === 'Home') { e.preventDefault(); goTo(0); }
    if (e.key === 'End') { e.preventDefault(); goTo(total - 1); }
    if (e.key === 'f' || e.key === 'F') {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen();
      else document.exitFullscreen();
    }
  });

  document.addEventListener('click', e => {
    if (e.clientX < window.innerWidth * 0.3) goTo(current - 1);
    else goTo(current + 1);
  });
}

// Load all slide fragments
Promise.all(slideFiles.map(f => fetch(f).then(r => {
  if (!r.ok) throw new Error('Failed to load ' + f);
  return r.text();
})))
  .then(contents => {
    document.getElementById('slides-container').innerHTML = contents.join('\n');
    initNavigation();
  })
  .catch(err => {
    document.getElementById('slides-container').innerHTML =
      '<div style="display:flex;align-items:center;justify-content:center;height:100vh;color:#ff7832;font-family:monospace;font-size:18px;text-align:center;padding:40px;">' +
      'Could not load slides.<br><br>' +
      'If opening from a file, run a local server:<br>' +
      '<code style="color:#34d399;margin-top:12px;display:block;">python3 -m http.server 8000</code><br>' +
      'Then open <code style="color:#34d399;">http://localhost:8000</code>' +
      '</div>';
    console.error(err);
  });
