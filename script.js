const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

// Mobile navigation
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');
if (menuToggle && navMenu) {
  menuToggle.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!open));
    navMenu.classList.toggle('is-open', !open);
  });
  navMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    menuToggle.setAttribute('aria-expanded', 'false');
    navMenu.classList.remove('is-open');
  }));
}

// Animated dossier accordions
for (const dossier of document.querySelectorAll('.dossier')) {
  const trigger = dossier.querySelector('.dossier-trigger');
  trigger?.addEventListener('click', () => {
    const open = dossier.classList.toggle('is-open');
    trigger.setAttribute('aria-expanded', String(open));
  });
}

// Lazy map expander
const mapExpander = document.getElementById('mapExpander');
const mapToggle = document.getElementById('mapToggle');
if (mapExpander && mapToggle) {
  mapToggle.addEventListener('click', () => {
    const open = mapExpander.classList.toggle('is-open');
    mapToggle.setAttribute('aria-expanded', String(open));
    if (open) {
      const img = mapExpander.querySelector('img[data-src]');
      if (img && !img.src) {
        img.onload = () => img.classList.add('is-loaded');
        img.src = img.dataset.src;
      } else if (img) {
        img.classList.add('is-loaded');
      }
    }
  });
}

// Flight-mode conceptual 3D demonstrations
const viewer = document.getElementById('droneViewer');
const bankReadout = document.getElementById('bankReadout');
const modeBrief = document.getElementById('modeBrief');
const modeButtons = [...document.querySelectorAll('.mode-btn')];
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let demoFrame = null;

const modeText = {
  acro: ['ACRO', 'Control directo de velocidad angular. La actitud no se autonivela al soltar el mando.'],
  angle: ['ANGLE', 'La inclinación se limita y la plataforma retorna hacia una actitud nivelada al liberar el stick.'],
  horizon: ['HORIZON', 'Respuesta híbrida: autonivelación cerca del centro con mayor autoridad de actitud hacia los extremos.']
};

function updateModeText(mode) {
  if (!modeBrief) return;
  modeBrief.innerHTML = `<strong>${modeText[mode][0]}</strong><span>${modeText[mode][1]}</span>`;
  modeButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.mode === mode));
}

function orientationFor(mode, t) {
  const pi = Math.PI;
  if (mode === 'acro') {
    return { roll: 360 * t, pitch: 8 * Math.sin(t * pi * 2) };
  }
  if (mode === 'angle') {
    return { roll: 28 * Math.sin(t * pi), pitch: 6 * Math.sin(t * pi) };
  }
  return { roll: 48 * Math.sin(t * pi), pitch: 14 * Math.sin(t * pi * 2) };
}

function runModeDemo(mode) {
  updateModeText(mode);
  if (!viewer) return;
  if (demoFrame) cancelAnimationFrame(demoFrame);

  viewer.removeAttribute('auto-rotate');
  if (prefersReduced) {
    viewer.setAttribute('orientation', '0deg 0deg 0deg');
    if (bankReadout) bankReadout.textContent = '000°';
    return;
  }

  const duration = mode === 'acro' ? 2000 : 1500;
  const start = performance.now();
  function frame(now) {
    const t = Math.min(1, (now - start) / duration);
    const o = orientationFor(mode, t);
    viewer.setAttribute('orientation', `${o.roll.toFixed(1)}deg ${o.pitch.toFixed(1)}deg 0deg`);
    if (bankReadout) bankReadout.textContent = `${String(Math.round(Math.abs(o.roll)) % 360).padStart(3,'0')}°`;
    if (t < 1) demoFrame = requestAnimationFrame(frame);
    else {
      viewer.setAttribute('orientation', '0deg 0deg 0deg');
      if (bankReadout) bankReadout.textContent = '000°';
      setTimeout(() => viewer.setAttribute('auto-rotate', ''), 350);
    }
  }
  demoFrame = requestAnimationFrame(frame);
}

modeButtons.forEach(btn => btn.addEventListener('click', () => runModeDemo(btn.dataset.mode)));
