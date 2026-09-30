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

  // Cartography browser. Public map assets are deliberately web-resolution previews.
  const mapFeature = $('[data-map-feature]');
  if (mapFeature) {
    const featureImg = $('.map-feature-visual img', mapFeature);
    const featureTier = $('[data-map-tier]', mapFeature);
    const featureTitle = $('[data-map-title]', mapFeature);
    const featureCode = $('[data-map-code]', mapFeature);
    const featureHeading = $('[data-map-heading]', mapFeature);
    const featureDescription = $('[data-map-description]', mapFeature);

    $$('.map-card').forEach(card => card.addEventListener('click', () => {
      $$('.map-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      const nextSrc = card.dataset.mapSrc;
      const swap = () => {
        featureImg.src = nextSrc;
        featureImg.alt = `Vista general del entorno ${card.dataset.mapTitle} de SimDron`;
        featureTier.textContent = card.dataset.mapTier;
        featureTitle.textContent = card.dataset.mapTitle;
        featureCode.textContent = card.dataset.mapCode;
        featureHeading.textContent = card.dataset.mapHeading;
        featureDescription.textContent = card.dataset.mapDescription;
        requestAnimationFrame(() => mapFeature.classList.remove('swapping'));
      };
      mapFeature.classList.add('swapping');
      const preload = new Image();
      preload.onload = swap;
      preload.onerror = swap;
      preload.src = nextSrc;
    }));

    // This is only a UI discouragement, not DRM; the real protection is serving
    // reduced-resolution previews instead of source cartography.
    $$('.map-browser img').forEach(img => {
      img.addEventListener('contextmenu', e => e.preventDefault());
      img.draggable = false;
    });
  }

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

// v4.5 progressive disclosure layer
(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];

  const techData = {
    unity: ['CORE / UNITY', 'REAL-TIME SIMULATION', 'Motor principal del sistema para físicas, lógica de simulación, UI, cámaras, escenas y despliegue multiplataforma.'],
    quest: ['XR / STANDALONE', 'META QUEST 3 / 3S', 'Ejecución standalone optimizada para VR, con interacción inmersiva, gamepad y operación sin una PC de vuelo conectada durante la sesión.'],
    fpv: ['FLT / FPV', 'FIRST PERSON VIEW', 'Vuelo en primera persona con dinámica configurable, telemetría, OSD, perfiles de control y condiciones de enlace representadas dentro del entorno sintético.'],
    isr: ['ISR / SRR', 'RECON & SENSOR STACK', 'Perfiles de reconocimiento con cámaras RGB, IR y térmicas, gimbal, FOV, observación, seguimiento y herramientas orientadas a ISR/SRR.'],
    mission: ['C2 / INSTRUCTOR', 'MISSION CONTROL', 'Planificación, supervisión multioperador, telemetría, mapa, estados de misión y revisión posterior desde la estación de instructor.']
  };
  const techPanel = $('#heroTechDetail');
  $$('[data-tech-detail]').forEach(btn => btn.addEventListener('click', () => {
    const key = btn.dataset.techDetail;
    const data = techData[key];
    if (!data || !techPanel) return;
    const wasActive = btn.classList.contains('active');
    $$('[data-tech-detail]').forEach(b => b.classList.remove('active'));
    if (wasActive) {
      techPanel.classList.remove('open');
      techPanel.setAttribute('aria-hidden','true');
      return;
    }
    btn.classList.add('active');
    $('#heroTechCode').textContent = data[0];
    $('#heroTechTitle').textContent = data[1];
    $('#heroTechText').textContent = data[2];
    techPanel.classList.add('open');
    techPanel.setAttribute('aria-hidden','false');
  }));

  const systemData = {
    flight: ['FLT / 01','FLIGHT DYNAMICS','La capa de vuelo representa distintos niveles de asistencia y respuesta de plataforma sin reducir el entrenamiento a un único comportamiento genérico.',['ACRO / ANGLE / HORIZON','MODE 1–4','WIND / ALTITUDE','RTH / ASSISTED MODES']],
    mission: ['MSN / 02','MISSION SYSTEMS','La misión incorpora variables que condicionan el empleo de la plataforma y obligan a considerar autonomía, enlace, carga y configuración.',['VLOS / BLOS / ELOS','BATTERY / RANGE','PAYLOAD','RF / FIBER']],
    sensors: ['ISR / 03','SENSOR STACK','Las cámaras forman parte del problema operacional: observación, identificación, campo de visión, orientación del gimbal y representación multiespectral.',['RGB / IR / THERMAL','GIMBAL','FOV','TRACK / PHOTO']],
    c2: ['C2 / 04','INSTRUCTOR & MISSION CONTROL','La estación de instructor convierte sesiones individuales en ejercicios coordinados, observables y revisables con múltiples operadores.',['MAP / WAYPOINTS','LIVE WALL','TELEMETRY','SESSION TRACE / AAR']]
  };
  const sysPanel = $('#systemDetail');
  $$('[data-system-detail]').forEach(btn => btn.addEventListener('click', () => {
    const data = systemData[btn.dataset.systemDetail];
    if (!data || !sysPanel) return;
    const wasActive = btn.classList.contains('active');
    $$('[data-system-detail]').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-expanded','false'); });
    if (wasActive) {
      sysPanel.classList.remove('open');
      sysPanel.setAttribute('aria-hidden','true');
      return;
    }
    btn.classList.add('active');
    btn.setAttribute('aria-expanded','true');
    $('#systemDetailCode').textContent = data[0];
    $('#systemDetailTitle').textContent = data[1];
    $('#systemDetailText').textContent = data[2];
    $('#systemDetailPoints').innerHTML = data[3].map(x => `<span>${x}</span>`).join('');
    sysPanel.classList.add('open');
    sysPanel.setAttribute('aria-hidden','false');
  }));

  const toggleCap = card => {
    const open = card.classList.toggle('expanded');
    card.setAttribute('aria-expanded', String(open));
  };
  $$('[data-expand-card]').forEach(card => {
    card.addEventListener('click', () => toggleCap(card));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleCap(card); }
    });
  });

  const devToggle = $('#devToggle');
  const devDetails = $('#devDetails');
  devToggle?.addEventListener('click', () => {
    const open = devToggle.getAttribute('aria-expanded') !== 'true';
    devToggle.setAttribute('aria-expanded', String(open));
    devDetails?.classList.toggle('open', open);
    devDetails?.setAttribute('aria-hidden', String(!open));
    const label = $('.dev-toggle-action', devToggle);
    if (label) label.childNodes[0].nodeValue = open ? 'OCULTAR DEVELOPMENT ' : 'VER DEVELOPMENT ';
  });
})();
