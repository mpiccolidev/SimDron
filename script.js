(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];

  $('#year').textContent = new Date().getFullYear();

  // Mobile nav
  const menuToggle = $('#menuToggle');
  const nav = $('#mainNav');
  menuToggle?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
  });
  $$('.main-nav a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  }));

  // Reveal-on-scroll, restrained by design.
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const delay = Number(el.dataset.delay || 0);
      setTimeout(() => el.classList.add('visible'), delay);
      revealObserver.unobserve(el);
    });
  }, { threshold: .12, rootMargin: '0px 0px -40px' });
  $$('.reveal').forEach(el => revealObserver.observe(el));

  // Platform library
  const platformData = {
    rtf: {
      image: 'assets/rtf.webp', index: '01 / 06', kicker: 'READY TO FLY', name: 'RTF',
      description: 'Perfil general de vuelo pensado para familiarización, operación visual y transición progresiva hacia configuraciones de mayor complejidad.',
      specs: [['CONTROL','ASSISTED / MANUAL'],['VIEW','VLOS / ELOS'],['ROLE','GENERAL PURPOSE']]
    },
    fpv: {
      image: 'assets/fpv-profile.webp', index: '02 / 06', kicker: 'FIRST PERSON VIEW', name: 'FPV',
      description: 'Perfil orientado a operación inmersiva en primera persona, maniobra directa y entrenamiento de respuesta manual.',
      specs: [['CONTROL','ACRO / ANGLE / HORIZON'],['VIEW','FPV'],['INPUT','MODE 1–4 / GAMEPAD']]
    },
    mini: {
      image: 'assets/mini.webp', index: '03 / 06', kicker: 'COMPACT PLATFORM', name: 'MINI',
      description: 'Configuración compacta para representar plataformas ligeras, recorridos cerrados y tareas donde tamaño y maniobrabilidad condicionan la operación.',
      specs: [['CLASS','COMPACT'],['CONTROL','MULTIROTOR'],['ROLE','TRAINING / MANEUVER']]
    },
    pro: {
      image: 'assets/pro.webp', index: '04 / 06', kicker: 'ADVANCED MULTIROTOR', name: 'PRO',
      description: 'Perfil de mayores prestaciones para integrar sensores, autonomía y configuraciones de misión con mayor carga de sistemas.',
      specs: [['SENSOR','GIMBAL / RGB / IR'],['ROLE','ISR / GENERAL'],['SYSTEM','CONFIGURABLE']]
    },
    hs: {
      image: 'assets/hs.webp', index: '05 / 06', kicker: 'HIGH SPEED', name: 'HS',
      description: 'Perfil orientado a respuesta rápida y dinámica diferenciada para entrenar control y toma de decisiones a mayor velocidad.',
      specs: [['CLASS','HIGH SPEED'],['CONTROL','MULTIROTOR'],['ROLE','MANEUVER']]
    },
    srr: {
      image: 'assets/srr.webp', index: '06 / 06', kicker: 'SHORT RANGE RECON', name: 'SRR',
      description: 'Perfil de reconocimiento de corto alcance basado en una plataforma tipo Matrice 4T, con gimbal y sensores orientados a observación e ISR.',
      specs: [['PLATFORM','MATRICE 4T TYPE'],['SENSOR','RGB / IR'],['ROLE','SRR / ISR']]
    }
  };
  const pImage = $('#platformImage');
  const pIndex = $('#platformIndex');
  const pKicker = $('#platformKicker');
  const pName = $('#platformName');
  const pDesc = $('#platformDescription');
  const pSpecs = $('#platformSpecs');
  $$('[data-platform]').forEach(btn => btn.addEventListener('click', () => {
    const item = platformData[btn.dataset.platform];
    if (!item || btn.classList.contains('active')) return;
    $$('[data-platform]').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected','false'); });
    btn.classList.add('active'); btn.setAttribute('aria-selected','true');
    pImage.classList.add('swapping');
    const preload = new Image();
    preload.onload = () => {
      pImage.src = item.image;
      pImage.alt = `Perfil ${item.name} de SimDron`;
      pIndex.textContent = item.index;
      pKicker.textContent = item.kicker;
      pName.textContent = item.name;
      pDesc.textContent = item.description;
      pSpecs.innerHTML = item.specs.map(([k,v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
      requestAnimationFrame(() => pImage.classList.remove('swapping'));
    };
    preload.src = item.image;
  }));

  // Cartography: image isn't requested until the section is opened.
  $$('.map-trigger').forEach(trigger => trigger.addEventListener('click', () => {
    const item = trigger.closest('.map-item');
    const open = item.classList.toggle('open');
    trigger.setAttribute('aria-expanded', String(open));
    trigger.querySelector('.map-action').textContent = open ? 'CLOSE MAP ×' : 'VIEW MAP +';
    if (open) {
      const img = item.querySelector('img[data-src]');
      if (img && !img.src) {
        img.addEventListener('load', () => img.classList.add('loaded'), { once:true });
        img.src = img.dataset.src;
      } else if (img) img.classList.add('loaded');
    }
  }));

  // Lazy YouTube thumbnails only near the media section.
  const thumbObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const img = entry.target;
      const id = img.dataset.youtubeThumb;
      img.src = `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
      img.onerror = () => { img.onerror = null; img.src = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`; };
      thumbObserver.unobserve(img);
    });
  }, { rootMargin: '300px' });
  $$('[data-youtube-thumb]').forEach(img => thumbObserver.observe(img));

  // YouTube embeds are click-to-load.
  const videoModal = $('#videoModal');
  const videoFrame = $('#videoFrame');
  const closeVideo = () => {
    videoModal.classList.remove('open');
    videoModal.setAttribute('aria-hidden','true');
    videoFrame.innerHTML = '';
    document.body.classList.remove('modal-open');
  };
  $$('[data-youtube]').forEach(card => card.addEventListener('click', () => {
    const id = card.dataset.youtube;
    videoFrame.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0" title="SimDron video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
    videoModal.classList.add('open');
    videoModal.setAttribute('aria-hidden','false');
    document.body.classList.add('modal-open');
  }));
  $$('[data-close-video]').forEach(el => el.addEventListener('click', closeVideo));

  // Data-conscious flight demonstrator.
  const flightModal = $('#flightModal');
  const flightLoading = $('#flightLoading');
  const root = $('#flightReactRoot');
  const confirmLoad = $('#confirmFlightLoad');
  const connectionNote = $('#connectionNote');
  let flightLoaded = false;
  let loadingFlight = false;

  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (conn?.saveData) connectionNote.textContent = 'Ahorro de datos está activo en este dispositivo. El modelo solo se cargará si confirmás.';
  else if (['slow-2g','2g','3g'].includes(conn?.effectiveType)) connectionNote.textContent = `Conexión detectada: ${conn.effectiveType}. Se recomienda Wi‑Fi para cargar el modelo.`;
  else connectionNote.textContent = 'Recomendado con Wi‑Fi o conexión sin límite de datos.';

  const openFlight = () => {
    flightModal.classList.add('open');
    flightModal.setAttribute('aria-hidden','false');
    document.body.classList.add('modal-open');
    if (flightLoaded) { flightLoading.classList.add('hidden'); window.dispatchEvent(new Event('simdron-flight-resume')); }
  };
  const closeFlight = () => {
    flightModal.classList.remove('open');
    flightModal.setAttribute('aria-hidden','true');
    document.body.classList.remove('modal-open');
    if (flightLoaded) window.dispatchEvent(new Event('simdron-flight-pause'));
  };
  $$('[data-open-demo]').forEach(el => el.addEventListener('click', openFlight));
  $$('[data-close-flight]').forEach(el => el.addEventListener('click', closeFlight));

  const loadScript = (src, opts = {}) => new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-runtime="${src}"]`);
    if (existing) {
      if (existing.dataset.ready === '1') return resolve();
      existing.addEventListener('load', resolve, { once:true });
      existing.addEventListener('error', reject, { once:true });
      return;
    }
    const s = document.createElement('script');
    s.src = src;
    s.dataset.runtime = src;
    if (opts.module) s.type = 'module';
    s.onload = () => { s.dataset.ready = '1'; resolve(); };
    s.onerror = reject;
    document.head.appendChild(s);
  });

  confirmLoad?.addEventListener('click', async () => {
    if (flightLoaded || loadingFlight) return;
    loadingFlight = true;
    const oldText = confirmLoad.textContent;
    confirmLoad.textContent = 'Preparando…';
    confirmLoad.disabled = true;
    try {
      // React is an island: neither React nor the 3D runtime is part of the initial page load.
      await loadScript('https://unpkg.com/react@18.3.1/umd/react.production.min.js');
      await loadScript('https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js');
      await loadScript('https://cdn.babylonjs.com/babylon.js');
      await loadScript('https://cdn.babylonjs.com/loaders/babylonjs.loaders.min.js');
      await loadScript('flight-demo.js');
      window.mountSimDronFlightDemo(root, {
        modelUrl: 'assets/fpv-drone.glb',
        posterUrl: 'assets/model-poster.jpg'
      });
      flightLoaded = true;
      flightLoading.classList.add('hidden');
    } catch (err) {
      console.error(err);
      confirmLoad.textContent = 'Error · reintentar';
      confirmLoad.disabled = false;
      connectionNote.textContent = 'No se pudo cargar el demostrador. Verificá la conexión y volvé a intentar.';
      loadingFlight = false;
      return;
    }
    confirmLoad.textContent = oldText;
    loadingFlight = false;
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (flightModal.classList.contains('open')) closeFlight();
      if (videoModal.classList.contains('open')) closeVideo();
      nav.classList.remove('open');
      menuToggle?.setAttribute('aria-expanded','false');
    }
  });
})();
