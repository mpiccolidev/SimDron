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
    const featureImg3d = $('#mapFeatureImage3d', mapFeature);
    const featureImg2d = $('#mapFeatureImage2d', mapFeature);
    const featureTier = $('[data-map-tier]', mapFeature);
    const featureTitle = $('[data-map-title]', mapFeature);
    const featureCode = $('[data-map-code]', mapFeature);
    const featureHeading = $('[data-map-heading]', mapFeature);
    const featureDescription = $('[data-map-description]', mapFeature);

    const mapVisuals = {
      'POLYGON / STRUCT': { view3d:'assets/scenario-polygon.webp', view2d:'assets/map-struct-preview.webp' },
      'HANGAR': { view3d:'assets/scenario-hangar.webp', view2d:'assets/map-hangar-preview.webp' },
      'FIELD': { view3d:'assets/scenario-field.webp', view2d:'assets/map-field-preview.webp' },
      'FOREST': { view3d:'assets/scenario-forest.webp', view2d:'assets/map-forest-preview.webp' },
      'INDUSTRIAL': { view3d:'assets/scenario-industrial.webp', view2d:'assets/map-industrial-preview.webp' },
      'URBAN': { view3d:'assets/scenario-urban.webp', view2d:'assets/map-urban-detail.webp' },
      'MOUNTAIN': { view3d:'assets/scenario-mountain.webp', view2d:'assets/map-mountain-preview.webp' },
      'TRENCH': { view3d:'assets/scenario-trench.webp', view2d:'assets/map-trench-preview.webp' },
      'AIRBASE': { view3d:'assets/map-airbase-preview.webp', view2d:'assets/map-airbase-preview.webp' },
      'DECK': { view3d:'assets/map-deck-preview.webp', view2d:'assets/map-deck-preview.webp' },
      'DESERT': { view3d:'assets/map-desert-preview.webp', view2d:'assets/map-desert-preview.webp' },
      'COAST': { view3d:'assets/map-coast-preview.webp', view2d:'assets/map-coast-preview.webp' },
      'FOB': { view3d:'assets/map-fob-preview.webp', view2d:'assets/map-fob-preview.webp' },
      'COMBAT': { view3d:'assets/map-combat-preview.webp', view2d:'assets/map-combat-preview.webp' },
      'NETROAD': { view3d:'assets/map-netroad-preview.webp', view2d:'assets/map-netroad-preview.webp' }
    };

    $$('.map-card').forEach(card => card.addEventListener('click', () => {
      $$('.map-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      const title = card.dataset.mapTitle;
      const visuals = mapVisuals[title] || { view3d: card.dataset.mapSrc, view2d: card.dataset.mapSrc };
      const swap = () => {
        if (featureImg3d) {
          featureImg3d.src = visuals.view3d;
          featureImg3d.alt = `Vista 3D del entorno ${title} de SimDron`;
        }
        if (featureImg2d) {
          featureImg2d.src = visuals.view2d;
          featureImg2d.alt = `Mapa 2D del entorno ${title} de SimDron`;
        }
        featureTier.textContent = card.dataset.mapTier;
        featureTitle.textContent = title;
        featureCode.textContent = card.dataset.mapCode;
        featureHeading.textContent = card.dataset.mapHeading;
        featureDescription.textContent = card.dataset.mapDescription;
        requestAnimationFrame(() => mapFeature.classList.remove('swapping'));
      };
      mapFeature.classList.add('swapping');
      const preload3d = new Image();
      const preload2d = new Image();
      let pending = 2;
      const done = () => { pending -= 1; if (pending <= 0) swap(); };
      preload3d.onload = done; preload3d.onerror = done;
      preload2d.onload = done; preload2d.onerror = done;
      preload3d.src = visuals.view3d;
      preload2d.src = visuals.view2d;
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

// v4.7 progressive disclosure layer — overview first, visual depth on demand
(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];

  const techData = {
    unity: {
      code:'CORE / UNITY', title:'REAL-TIME SIMULATION',
      text:'Unity constituye el núcleo técnico que reúne físicas, lógica de simulación, UI, cámaras, IA, herramientas de instructor y despliegue XR en una misma arquitectura.',
      facts:['PHYSICS','AI / AUTOMATION','3D SCENARIOS','TOOLS / UI'],
      visual:'assets/tech-unity-cys-meta.webp',
      visualCaption:'CYS XR LAB / UNITY / META QUEST'
    },
    quest: {
      code:'XR / STANDALONE', title:'META QUEST 3 / 3S',
      text:'La realidad virtual no funciona solo como pantalla: modifica la relación del alumno con el entorno, la percepción FPV y la forma de desplegar el sistema.',
      facts:['360° IMMERSION','FPV HMD','PORTABLE','COST-EFFICIENT'],
      sections:[
        ['01','INMERSIÓN','Comprender el entorno en 360°, moverse naturalmente dentro de él y mantener referencias espaciales mientras se sigue la aeronave.'],
        ['02','PREPARACIÓN FPV','El HMD reproduce una experiencia de primera persona más cercana al empleo FPV y permite exposición temprana a factores fisiológicos como la cinetosis.'],
        ['03','PORTABILIDAD','El sistema puede desplegarse con visor Meta Quest, controles y gamepad, reduciendo la dependencia de infraestructura fija.'],
        ['04','EFICIENCIA DE COSTOS','Menor infraestructura de despliegue sin renunciar al valor inmersivo, favoreciendo instrucción repetible, escalable e iteración rápida.']
      ],
      gallery:[
        ['assets/quest-headset.webp','META QUEST 3 / 3S — HMD'],
        ['assets/quest-controllers.webp','VR INPUT — CONTROLLERS'],
        ['assets/flight-keyboard.webp','BLUETOOTH KEYBOARD / XR UI']
      ]
    },
    fpv: {
      code:'FLT / FPV', title:'FIRST PERSON VIEW',
      text:'Vuelo en primera persona con dinámica configurable, telemetría, OSD y perfiles de control. La configuración puede sumar payloads, fibra óptica y degradación de enlace dentro del entorno simulado.',
      facts:['FLIGHT PRESETS','PAYLOAD','FIBER','ECM / LINK']
    },
    isr: {
      code:'ISR / SRR', title:'RECON & SENSOR STACK',
      text:'Perfiles de reconocimiento con cámaras RGB, IR y térmicas, gimbal, FOV, seguimiento y gradientes térmicos diferenciados para tareas ISR/SRR.',
      facts:['RGB / IR / THERMAL','GIMBAL / FOV','TRACK / PHOTO','THERMAL GRADIENTS'],
      visual:'assets/sensor-isr-srr.webp',
      visualCaption:'SRR / GIMBAL / RGB + IR'
    },
    mission: {
      code:'C2 / INSTRUCTOR', title:'MISSION CONTROL',
      text:'Planificación, supervisión multioperador, telemetría, capas de información, automatización y revisión posterior desde la estación de instructor.',
      facts:['UP TO 10 VISORS','OFFLINE Wi-Fi LAN','AUTO / AI','DEBRIEF / AAR'],
      visual:'assets/mission-control-ai.webp',
      visualCaption:'MISSION CONTROL / AUTO-AI / WAYPOINT ROUTE',
      gallery:[
        ['assets/c2-mission-authoring.webp','MISSION CONTROL / MULTI-VTX'],
        ['assets/mission-control-ai.webp','MISSION CONTROL / INSTRUCTOR CONSOLE']
      ]
    }
  };

  const techPanel = $('#heroTechDetail');
  $$('[data-tech-detail]').forEach(btn => btn.addEventListener('click', () => {
    const data = techData[btn.dataset.techDetail];
    if (!data || !techPanel) return;
    const wasActive = btn.classList.contains('active');
    $$('[data-tech-detail]').forEach(b => b.classList.remove('active'));
    if (wasActive) {
      techPanel.classList.remove('open');
      techPanel.setAttribute('aria-hidden','true');
      return;
    }
    btn.classList.add('active');
    $('#heroTechCode').textContent = data.code;
    $('#heroTechTitle').textContent = data.title;
    $('#heroTechText').textContent = data.text;
    const facts = $('#heroTechFacts');
    if (facts) facts.innerHTML = data.facts.map(x => `<span>${x}</span>`).join('');
    const extra = $('#heroTechExtra');
    if (extra) {
      extra.innerHTML = '';
      extra.hidden = true;

      if (data.sections?.length || data.visual || data.gallery?.length) {
        const blocks = [];
        if (data.sections?.length) {
          blocks.push(`<div class="tech-value-grid">${data.sections.map(s => `
            <article><span>${s[0]}</span><b>${s[1]}</b><p>${s[2]}</p></article>
          `).join('')}</div>`);
        }
        if (data.visual) {
          blocks.push(`<figure class="tech-visual"><img src="${data.visual}" alt="${data.visualCaption || data.title}" loading="lazy"><figcaption>${data.visualCaption || data.title}</figcaption></figure>`);
        }
        if (data.gallery?.length) {
          blocks.push(`<div class="tech-media-strip">${data.gallery.map(g => `
            <figure><img src="${g[0]}" alt="${g[1]}" loading="lazy"><figcaption>${g[1]}</figcaption></figure>
          `).join('')}</div>`);
        }
        extra.innerHTML = blocks.join('');
        extra.hidden = false;
      }
    }
    techPanel.classList.add('open');
    techPanel.setAttribute('aria-hidden','false');
  }));

  const G = (src, caption, alt = caption) => ({src, caption, alt});

  const systemData = {
    flight: {
      code:'FLT / 01', title:'FLIGHT DYNAMICS',
      text:'La capa de vuelo representa distintos niveles de asistencia y respuesta de plataforma sin reducir el entrenamiento a un único comportamiento genérico.',
      points:['ACRO / ANGLE / HORIZON','MODE 1–4','WIND / ALTITUDE','RTH / ASSISTED MODES'],
      subtopics:[
        {
          label:'PRESETS', code:'FLT / PRESET', title:'Perfiles y ajuste de plataforma',
          text:'Los perfiles permiten cambiar respuesta, asistencia y parámetros físicos para representar plataformas y tareas distintas dentro de una interfaz común.',
          facts:['16 PRESETS','PHYSICS','PLATFORM TUNING','ASSISTED / MANUAL'],
          custom:'preset-browser',
          gallery:[
            G('assets/flight-profile-tuning.webp','PHYSICS / PROFILE TUNING','Panel de ajustes físicos y plataforma en SimDron'),
            G('assets/flight-routes-composite.webp','ASSISTED FLIGHT OVERVIEW','Rutas asistidas y telemetría de vuelo')
          ]
        },
        {
          label:'ASSISTED', code:'FLT / ASSIST', title:'Vuelo asistido y navegación',
          text:'La misma capa puede combinar control manual con asistencia de altura, rutas, waypoints, navegación automatizada y retorno según el perfil seleccionado.',
          facts:['ALTITUDE HOLD','WAYPOINTS','RTH','ROUTE LOGIC'],
          gallery:[
            G('assets/flight-routes-composite.webp','ASSISTED ROUTES / OVERVIEW','Vista combinada de rutas asistidas'),
            G('assets/flight-routes-3d.webp','3D ROUTE / TERRAIN','Ruta asistida sobre terreno 3D'),
            G('assets/flight-routes-map.webp','MAP ROUTE / TELEMETRY','Ruta y telemetría sobre mapa')
          ]
        },
        {
          label:'INPUT', code:'FLT / INPUT', title:'Múltiples esquemas de entrada',
          text:'El entrenamiento puede adaptarse a gamepad, controladores VR y teclado Bluetooth manteniendo esquemas de sticks y perfiles de control coherentes entre modalidades.',
          facts:['MODE 1–4','GAMEPAD','VR INPUT','BLUETOOTH KEYBOARD'],
          gallery:[G('assets/flight-keyboard.webp','BLUETOOTH KEYBOARD / UI','Uso de teclado Bluetooth dentro del entorno XR')]
        }
      ]
    },
    mission: {
      code:'MSN / 02', title:'MISSION SYSTEMS',
      text:'La misión incorpora variables que condicionan el empleo de la plataforma y obligan a considerar autonomía, enlace, carga, configuración y efectos del entorno.',
      points:['VLOS / BLOS / ELOS','BATTERY / RANGE','PAYLOAD','RF / FIBER'],
      subtopics:[
        {
          label:'PAYLOAD', code:'MSN / PAYLOAD', title:'Configuración de payload',
          text:'Las configuraciones de carga permiten representar montajes y restricciones de plataforma dentro del mismo flujo de operación, manteniendo físicas, telemetría y estado de misión integrados.',
          facts:['LOADOUT PRESETS','RACKS / LOADS','FIBER CONFIG','PLATFORM STATE'],
          gallery:[
            G('assets/mission-payload-close.webp','PAYLOAD / PLATFORM','Configuración de carga sobre plataforma FPV'),
            G('assets/mission-payload-ui.webp','PAYLOAD / IN-SIM CONFIG','Selección de carga dentro de la simulación'),
            G('assets/mission-payload-night.webp','PAYLOAD / LOW LIGHT','Operación de payload en condición nocturna')
          ]
        },
        {
          label:'LINK / ECM', code:'MSN / LINK', title:'Enlace y degradación',
          text:'El enlace puede degradarse para representar pérdida de calidad, interferencia y contramedidas electrónicas, alterando la continuidad y la percepción de la operación.',
          facts:['RF LINK','DEGRADATION','ECM EFFECTS','FIBER OPTION'],
          gallery:[
            G('assets/ecm-hmd-degraded.webp','ECM / DEGRADED VIDEO','Representación visual de degradación del enlace sobre la percepción del piloto.'),
            G('assets/ecm-hmd-lens.webp','ECM / HMD EFFECT','Efecto visual asociado a interferencia y degradación de señal dentro del entorno simulado.')
          ]
        },
        {
          label:'MULTI-UAV', code:'MSN / MULTI', title:'Automatización y múltiples actores',
          text:'El sistema puede escalar desde una sola aeronave hacia escenarios con varias plataformas, activos autónomos y oposición controlada por IA.',
          facts:['SWARM','COORDINATION','AUTONOMOUS SYSTEMS','OPFOR AI'],
          gallery:[
            G('assets/mission-swarm.webp','MULTI-UAV / SWARM','Enjambre de plataformas en un mismo escenario'),
            G('assets/mission-autonomous.webp','AUTONOMOUS SYSTEMS','Familiarización con distintas tecnologías autónomas'),
            G('assets/mission-ai-opfor.webp','AI / OPFOR','Actores terrestres y comportamiento de oposición en escenario')
          ]
        },
        {
          label:'TACTICAL FLOW', code:'MSN / EMPLOYMENT', title:'Secuencia de empleo coordinado',
          text:'La simulación permite representar un flujo completo entre reconocimiento, preparación de la plataforma FPV, conducción manual y observación posterior del resultado, manteniendo cada rol dentro del mismo escenario de entrenamiento.',
          facts:['01 SRR / RECON','02 FPV / DEPLOY','03 ACRO / PILOT','04 SRR / BDA'],
          gallery:[
            G('assets/mission-employment-01-srr.webp','01 / SRR — TARGET ACQUISITION','El dron SRR busca y confirma un blanco de oportunidad dentro del escenario simulado.'),
            G('assets/mission-employment-02-fpv-deploy.webp','02 / FPV — DEPLOYMENT','La plataforma FPV es emplazada y configurada de acuerdo con la tarea antes del despegue.'),
            G('assets/mission-employment-03-acro.webp','03 / FPV — MANUAL ACRO','El piloto conduce manualmente el FPV en modo ACRO mediante vista en primera persona.'),
            G('assets/mission-employment-04-bda.webp','04 / SRR — EFFECTS OBSERVATION','Tras el impacto, el SRR permanece en observación para registrar el efecto y apoyar la revisión posterior.')
          ]
        },
        {
          label:'C-UAS', code:'MSN / C-UAS', title:'C-UAS Familiarization',
          text:'Módulo defensivo orientado a familiarizar al alumno con la amenaza de UAS de baja cota y con distintos tipos de respuesta dentro de un escenario simulado. El foco está en reconocer la situación, seleccionar un medio disponible y comprender las limitaciones de cada respuesta, no en una mecánica de shooter.',
          facts:['THREAT RECOGNITION','NON-KINETIC / JAMMING','KINETIC RESPONSE','MOBILE DEFENSE'],
          gallery:[
            G('assets/cuas-equipment.webp','C-UAS / EQUIPMENT','Medios simulados disponibles dentro del escenario para prácticas de familiarización defensiva.'),
            G('assets/cuas-jamming.webp','NON-KINETIC / ELECTRONIC INTERFERENCE','Dispositivo portátil de interferencia electrónica para representar una medida C-UAS no cinética.'),
            G('assets/cuas-kinetic.webp','KINETIC / CLOSE-RANGE RESPONSE','Respuesta cinética simulada de corto alcance frente a una amenaza aérea dentro del entorno de entrenamiento.')
          ]
        }
      ]
    },
    sensors: {
      code:'ISR / 03', title:'SENSOR STACK',
      text:'Las cámaras forman parte del problema operacional: observación, identificación, campo de visión, orientación del gimbal y representación multiespectral.',
      points:['RGB / IR / THERMAL','GIMBAL','FOV','TRACK / PHOTO'],
      subtopics:[
        {
          label:'EO / IR', code:'ISR / EO-IR', title:'Visualización multiespectral',
          text:'RGB, IR y térmica pueden utilizarse dentro de la misma lógica de observación, con cambios de visualización y parámetros de cámara según el perfil.',
          facts:['RGB','IR','THERMAL','SENSOR PROFILES']
        },
        {
          label:'THERMAL', code:'ISR / THERMAL', title:'Gradientes térmicos diferenciados',
          text:'La representación térmica incorpora gradientes que separan materiales, volúmenes y fuentes para ofrecer una lectura de escena distinta de la cámara visible.',
          facts:['MATERIAL RESPONSE','CONTRAST','HEAT SOURCES','THERMAL VIEW'],
          gallery:[G('assets/sensor-thermal-industrial.webp','THERMAL / INDUSTRIAL SCENE','Escena industrial con gradiente térmico')]
        },
        {
          label:'RECON', code:'ISR / RECON', title:'Reconocimiento y seguimiento',
          text:'Gimbal, FOV, tracking, fotografía y perfiles SRR concentran herramientas orientadas a observación, búsqueda y seguimiento dentro de la simulación.',
          facts:['GIMBAL','FOV','TRACK','SRR / PHOTO'],
          gallery:[G('assets/sensor-isr-srr.webp','ISR / SRR SENSOR UI','Interfaz SRR con gimbal, FOV y visualización RGB + IR.')]
        }
      ]
    },
    c2: {
      code:'C2 / 04', title:'INSTRUCTOR & MISSION CONTROL',
      text:'La estación de instructor convierte sesiones individuales en ejercicios coordinados, observables y revisables con múltiples operadores.',
      points:['MAP / WAYPOINTS','LIVE WALL','TELEMETRY','SESSION TRACE / AAR'],
      subtopics:[
        {
          label:'MULTI-VISOR', code:'C2 / MULTI', title:'Ejercicios multioperador',
          text:'Mission Control puede reunir varios visores sobre una misma sesión, compartir información por red local y dar al instructor una vista consolidada del ejercicio.',
          facts:['UP TO 10 VISORS','OFFLINE LAN','LIVE WALL','SHARED EXERCISE'],
          gallery:[G('assets/c2-mission-authoring.webp','MISSION CONTROL / LIVE EXERCISE','Mission Control durante la construcción y seguimiento de una misión')]
        },
        {
          label:'AUTHORING', code:'C2 / AUTHOR', title:'Construcción y conducción de misión',
          text:'El instructor puede combinar rutas, capas de información, contactos, objetivos y estados del ejercicio para preparar y conducir escenarios de distinta complejidad.',
          facts:['MISSION GENERATOR','INFORMATION LAYERS','CONTACT LIBRARY','WAYPOINTS'],
          gallery:[
            G('assets/c2-mission-authoring.webp','MULTI-VTX / LIVE WALL','Vista con múltiples visores y seguimiento de ejercicio.'),
            G('assets/mission-control-ai.webp','INSTRUCTOR CONSOLE / AUTO-AI','Consola de instructor con rutas, modos automáticos y estado de plataforma.'),
            G('assets/c2-contact-library.webp','CONTACT LIBRARY','Biblioteca visual de contactos para escenarios'),
            G('assets/flight-routes-map.webp','ROUTES / TRACE','Rutas y trazado sobre mapa')
          ]
        },
        {
          label:'INSTRUCTION', code:'C2 / TRAIN', title:'Herramientas de instrucción',
          text:'La experiencia suma asistencia al alumno, checking de prevuelo, configuración de plataforma y espacios de familiarización para acompañar preparación y ejecución.',
          facts:['STUDENT ASSIST','PREFLIGHT','CONFIGURATION','FAMILIARIZATION'],
          gallery:[
            G('assets/c2-basics-lab.webp','BASIC SYSTEMS / LAB','Escena de familiarización con sistemas y componentes'),
            G('assets/c2-preflight-hangar.webp','PREFLIGHT / HANGAR','Entorno de prevuelo e instrucción en hangar'),
            G('assets/flight-profile-tuning.webp','PLATFORM CONFIG','Configuración física y de perfil de vuelo')
          ]
        },
        {
          label:'DEBRIEF', code:'C2 / AAR', title:'Trazado y debriefing',
          text:'La sesión puede conservar información de la ejecución para revisar lo ocurrido y convertir la actividad en feedback útil para instructor y alumnos.',
          facts:['SESSION TRACE','DEBRIEFING','AAR','FEEDBACK'],
          gallery:[G('assets/flight-routes-map.webp','TRACE / TELEMETRY','Trazado de ruta y telemetría para revisión')]
        }
      ]
    },
    environment: {
      code:'ENV / 05', title:'SYNTHETIC ENVIRONMENT',
      text:'El entorno no funciona como fondo decorativo: modifica visibilidad, referencias visuales, navegación y lectura del escenario mediante clima, iluminación y geografía.',
      points:['WEATHER / SMOKE','DAY / NIGHT','WATER / VISIBILITY','TRAINING SCENARIOS'],
      subtopics:[
        {
          label:'WEATHER', code:'ENV / WEATHER', title:'Atmósfera y condiciones de visibilidad',
          text:'Humo, cobertura nubosa, agua y variaciones de visibilidad permiten modificar la lectura del entorno y las referencias disponibles durante el ejercicio.',
          facts:['CLOUD COVER','SMOKE','WATER','VISIBILITY'],
          gallery:[
            G('assets/env-smoke-weather.webp','SMOKE / VISIBILITY','Humo y visibilidad degradada en entorno urbano'),
            G('assets/env-clouds-compare.webp','PROCEDURAL CLOUDS','Comparación de condiciones de nubosidad'),
            G('assets/env-water.webp','WATER / ENVIRONMENT','Curso de agua dentro del entorno de simulación')
          ]
        },
        {
          label:'LIGHTING', code:'ENV / LIGHT', title:'Iluminación y ciclo visual',
          text:'Distintos cielos y condiciones lumínicas cambian contraste, orientación y percepción del terreno sin alterar la lógica base de la misión.',
          facts:['DAY','SUNSET','NIGHT','OVERCAST'],
          gallery:[
            G('assets/env-skyboxes-grid.webp','SKYBOX LIBRARY','Conjunto de condiciones de cielo'),
            G('assets/env-sky-day.webp','DAY / CLEAR','Condición diurna clara'),
            G('assets/env-sky-sunset.webp','SUNSET','Atardecer de alto contraste'),
            G('assets/env-sky-evening.webp','EVENING','Transición de iluminación al anochecer'),
            G('assets/env-sky-overcast.webp','OVERCAST','Cielo cubierto y baja iluminación'),
            G('assets/env-sky-moon.webp','NIGHT / MOON','Noche con iluminación lunar'),
            G('assets/env-sky-milkyway.webp','NIGHT / MILKY WAY','Condición nocturna con cielo estrellado')
          ]
        },
        {
          label:'SCENARIOS', code:'ENV / SCENE', title:'Entornos de entrenamiento',
          text:'La biblioteca combina escenarios urbanos, rurales, industriales y geográficos para que la tarea cambie junto con el terreno y las referencias disponibles.',
          facts:['HANGAR','FOB / ALTIPLANO','PATAGONIA','URBAN / INDUSTRIAL'],
          gallery:[
            G('assets/scenario-field.webp','FIELD','Campo de entrenamiento y referencias abiertas'),
            G('assets/scenario-forest.webp','FOREST','Entorno forestal y navegación entre vegetación'),
            G('assets/scenario-hangar.webp','HANGAR','Infraestructura de hangar y área de instrucción'),
            G('assets/scenario-polygon.webp','POLYGON / STRUCT','Entorno estructural para práctica y maniobra'),
            G('assets/scenario-urban.webp','URBAN','Escenario urbano de alta densidad'),
            G('assets/scenario-industrial.webp','INDUSTRIAL','Complejo industrial y estructuras de gran escala'),
            G('assets/scenario-mountain.webp','MOUNTAIN','Entorno de montaña y nieve'),
            G('assets/scenario-trench.webp','TRENCH','Posiciones, obstáculos y terreno táctico'),
            G('assets/env-scene-fob.webp','FOB / ALTIPLANO','Escenario FOB en región de altura'),
            G('assets/env-scene-netroad.webp','NETROAD / PATAGONIA','Escenario patagónico con red vial y edificaciones')
          ]
        }
      ]
    }
  };

  const presetData = [
    {id:'01', name:"Mavic 2 Pro / Zoom", image:'assets/preset-01.webp'},
    {id:'02', name:"Mavic 3 Classic", image:'assets/preset-02.webp'},
    {id:'03', name:"Mavic 4 Pro", image:'assets/preset-03.webp'},
    {id:'04', name:"Mini 4 Pro", image:'assets/preset-04.webp'},
    {id:'05', name:"Matrice 4T", image:'assets/preset-05.webp'},
    {id:'06', name:"Matrice 350 RTK", image:'assets/preset-06.webp'},
    {id:'07', name:"Agras T50", image:'assets/preset-07.webp'},
    {id:'08', name:"FPV 7\" Long Range", image:'assets/preset-08.webp'},
    {id:'09', name:"FPV 5\" Race", image:'assets/preset-09.webp'},
    {id:'10', name:"Whoop 65 mm", image:'assets/preset-10.webp'},
    {id:'11', name:"DJI Avata 2", image:'assets/preset-11.webp'},
    {id:'12', name:"DJI Neo", image:'assets/preset-12.webp'},
    {id:'13', name:"Vampire", image:'assets/preset-13.webp'},
    {id:'14', name:"Skydio X10", image:'assets/preset-14.webp'},
    {id:'15', name:"DJI Inspire 3", image:'assets/preset-15.webp'},
    {id:'16', name:"FPV 13\" Long Range", image:'assets/preset-16.webp'}
  ];

  const sysPanel = $('#systemDetail');
  const sysTabs = $('#systemDetailTabs');
  const deep = $('#systemDeep');
  const deepVisual = $('#systemDeepVisual');
  const deepImg = $('#systemDeepImage');
  const deepCaption = $('#systemDeepCaption');
  const deepGallery = $('#systemDeepGallery');
  const deepCustom = $('#systemDeepCustom');

  const clearCustom = () => {
    if (!deepCustom) return;
    deepCustom.innerHTML = '';
    deepCustom.hidden = true;
  };

  const renderPresetBrowser = () => {
    if (!deepCustom) return;
    deepCustom.hidden = false;
    deepCustom.innerHTML = `
      <div class="preset-browser">
        <div class="preset-stage">
          <span id="presetBrowserIndex">PRESET 01 / 16</span>
          <img id="presetBrowserImage" src="${presetData[0].image}" alt="${presetData[0].name}">
          <b id="presetBrowserName">${presetData[0].name}</b>
          <small>Perfil seleccionable / representación visual</small>
        </div>
        <div class="preset-selector" role="tablist" aria-label="Presets de aeronave">
          ${presetData.map((p,i) => `<button type="button" class="${i===0?'active':''}" data-preset-index="${i}" role="tab"><span>${p.id}</span><b>${p.name}</b></button>`).join('')}
        </div>
      </div>`;
    const stageImg = $('#presetBrowserImage', deepCustom);
    const stageName = $('#presetBrowserName', deepCustom);
    const stageIndex = $('#presetBrowserIndex', deepCustom);
    $$('[data-preset-index]', deepCustom).forEach(btn => btn.addEventListener('click', () => {
      const i = Number(btn.dataset.presetIndex);
      const p = presetData[i];
      $$('[data-preset-index]', deepCustom).forEach(b => b.classList.toggle('active', b === btn));
      stageImg.classList.add('swap');
      const preload = new Image();
      preload.onload = () => {
        stageImg.src = p.image;
        stageImg.alt = p.name;
        stageName.textContent = p.name;
        stageIndex.textContent = `PRESET ${p.id} / 16`;
        stageImg.classList.remove('swap');
      };
      preload.src = p.image;
    }));
  };

  const clearGallery = () => {
    if (!deepGallery) return;
    deepGallery.innerHTML = '';
    deepGallery.hidden = true;
  };

  const setDeepVisual = (item, activeButton = null) => {
    if (!item || !deepVisual || !deepImg) return;
    deepVisual.hidden = false;
    deepVisual.classList.add('swapping');
    const preload = new Image();
    const apply = () => {
      deepImg.src = item.src;
      deepImg.alt = item.alt || item.caption || '';
      if (deepCaption) deepCaption.textContent = item.caption || '';
      if (deepGallery) $$('button', deepGallery).forEach(b => b.classList.toggle('active', b === activeButton));
      requestAnimationFrame(() => deepVisual.classList.remove('swapping'));
    };
    preload.onload = apply;
    preload.onerror = apply;
    preload.src = item.src;
  };

  const renderGallery = gallery => {
    clearGallery();
    if (!gallery?.length || !deepGallery) return;
    deepGallery.hidden = false;
    gallery.forEach((item, index) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', item.caption || `Imagen ${index + 1}`);
      if (index === 0) b.classList.add('active');
      const img = document.createElement('img');
      img.src = item.src;
      img.alt = item.alt || item.caption || '';
      img.loading = 'lazy';
      const label = document.createElement('span');
      label.textContent = item.caption || `VIEW ${index + 1}`;
      b.append(img, label);
      b.addEventListener('click', () => setDeepVisual(item, b));
      deepGallery.appendChild(b);
    });
    setDeepVisual(gallery[0], deepGallery.firstElementChild);
  };

  const closeDeep = () => {
    if (!deep) return;
    deep.classList.remove('open');
    deep.setAttribute('aria-hidden','true');
    if (sysTabs) $$('button', sysTabs).forEach(b => b.classList.remove('active'));
    clearGallery();
    clearCustom();
  };

  const showSubtopic = (sub, button) => {
    if (!deep || !sub) return;
    if (sysTabs) $$('button', sysTabs).forEach(b => b.classList.toggle('active', b === button));
    $('#systemDeepCode').textContent = sub.code;
    $('#systemDeepTitle').textContent = sub.title;
    $('#systemDeepText').textContent = sub.text;
    $('#systemDeepFacts').innerHTML = sub.facts.map(x => `<span>${x}</span>`).join('');

    clearCustom();
    if (sub.gallery?.length) {
      renderGallery(sub.gallery);
    } else if (sub.image && deepImg && deepVisual) {
      clearGallery();
      setDeepVisual({src:sub.image, caption:sub.caption || sub.title, alt:sub.title});
    } else {
      clearGallery();
      if (deepVisual) deepVisual.hidden = true;
      if (deepImg) deepImg.removeAttribute('src');
    }

    if (sub.custom === 'preset-browser') renderPresetBrowser();

    deep.classList.add('open');
    deep.setAttribute('aria-hidden','false');
  };

  $$('[data-system-detail]').forEach(btn => btn.addEventListener('click', () => {
    const data = systemData[btn.dataset.systemDetail];
    if (!data || !sysPanel) return;
    const wasActive = btn.classList.contains('active');
    $$('[data-system-detail]').forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-expanded','false');
      const cue = $('i', b); if (cue) cue.textContent = 'OPEN +';
    });
    if (wasActive) {
      sysPanel.classList.remove('open');
      sysPanel.setAttribute('aria-hidden','true');
      closeDeep();
      return;
    }
    btn.classList.add('active');
    btn.setAttribute('aria-expanded','true');
    const activeCue = $('i', btn); if (activeCue) activeCue.textContent = 'CLOSE ×';
    $('#systemDetailCode').textContent = data.code;
    $('#systemDetailTitle').textContent = data.title;
    $('#systemDetailText').textContent = data.text;
    $('#systemDetailPoints').innerHTML = data.points.map(x => `<span>${x}</span>`).join('');
    if (sysTabs) {
      sysTabs.innerHTML = data.subtopics.map((x,i) => `<button type="button" data-sub-index="${i}"><span>${String(i+1).padStart(2,'0')}</span><b>${x.label}</b><small>ABRIR DETALLE</small><i>+</i></button>`).join('');
      $$('button', sysTabs).forEach(b => b.addEventListener('click', () => {
        const i = Number(b.dataset.subIndex);
        const isActive = b.classList.contains('active');
        if (isActive) { closeDeep(); return; }
        showSubtopic(data.subtopics[i], b);
      }));
    }
    closeDeep();
    sysPanel.classList.add('open');
    sysPanel.setAttribute('aria-hidden','false');
  }));

  const toggleCap = card => {
    const open = card.classList.toggle('expanded');
    card.setAttribute('aria-expanded', String(open));
    const cue = $('.cap-head i', card);
    if (cue) cue.textContent = open ? 'CLOSE ×' : 'DETAIL +';
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


// v5.0 — tactical UX: clear interaction hierarchy, sensor explorer and image viewer.
(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];

  const sensorData = {
    rgb: {
      src:'assets/sensors.webp', code:'ISR / RGB', stage:'RGB / FPV', caption:'LIVE FEED / TELEMETRY',
      title:'RGB / FPV + OSD',
      text:'Vista visible integrada con OSD y telemetría para navegación, observación, orientación y control de la plataforma.',
      facts:['RGB FEED','OSD / TELEMETRY','FOV','CAMERA FPS']
    },
    srr: {
      src:'assets/srr-ui.webp', code:'ISR / SRR', stage:'SRR / GIMBAL', caption:'RECON / SENSOR CONTROL',
      title:'SRR / GIMBAL CONTROL',
      text:'El perfil de reconocimiento concentra control de gimbal, FOV, captura y visualización del sensor para búsqueda y observación desde una plataforma dedicada.',
      facts:['GIMBAL PITCH','FOV','PHOTO','SRR PROFILE']
    },
    thermal: {
      src:'assets/sensor-thermal-industrial.webp', code:'ISR / THERMAL', stage:'THERMAL / IR', caption:'MULTISPECTRAL VIEW',
      title:'VISUALIZACIÓN TÉRMICA',
      text:'La representación térmica separa materiales, volúmenes y fuentes mediante gradientes diferenciados para ofrecer una lectura de escena distinta de la cámara visible.',
      facts:['THERMAL VIEW','MATERIAL RESPONSE','CONTRAST','HEAT SOURCES']
    },
    track: {
      src:'assets/mission-employment-01-srr.webp', code:'ISR / OBSERVATION', stage:'TRACK / OBSERVATION', caption:'RECON / EFFECT ASSESSMENT',
      title:'SEGUIMIENTO Y OBSERVACIÓN',
      text:'Reconocimiento, seguimiento y observación pueden integrarse al ciclo de misión para localizar referencias, mantener un punto de interés y registrar resultados para revisión posterior.',
      facts:['RECON','TRACK','PHOTO','POST-MISSION REVIEW']
    }
  };

  let sensorKey = 'rgb';
  const sensorImg = $('#sensorStageImage');
  const sensorStage = $('#sensorStage');
  const sensorButtons = $$('[data-sensor-view]');

  const setSensor = key => {
    const data = sensorData[key];
    if (!data || !sensorImg) return;
    sensorKey = key;
    sensorButtons.forEach(b => {
      const active = b.dataset.sensorView === key;
      b.classList.toggle('active', active);
      b.setAttribute('aria-selected', String(active));
      const cue = $('i', b); if (cue) cue.textContent = active ? 'SELECTED' : 'OPEN →';
    });
    sensorStage?.classList.add('swapping');
    const preload = new Image();
    const apply = () => {
      sensorImg.src = data.src;
      sensorImg.alt = data.title;
      $('#sensorStageCode').textContent = data.stage;
      $('#sensorStageCaption').textContent = data.caption;
      $('#sensorReadoutCode').textContent = data.code;
      $('#sensorReadoutTitle').textContent = data.title;
      $('#sensorReadoutText').textContent = data.text;
      $('#sensorFacts').innerHTML = data.facts.map(x => `<span>${x}</span>`).join('');
      requestAnimationFrame(() => sensorStage?.classList.remove('swapping'));
    };
    preload.onload = apply; preload.onerror = apply; preload.src = data.src;
  };
  sensorButtons.forEach(b => b.addEventListener('click', () => setSensor(b.dataset.sensorView)));

  // Lightweight image viewer. It reuses already-loaded web previews; no extra library.
  const modal = $('#imageModal');
  const modalImg = $('#imageModalImage');
  const modalTitle = $('#imageModalTitle');
  const modalCaption = $('#imageModalCaption');
  const modalIndex = $('#imageModalIndex');
  const prev = $('#imagePrev');
  const next = $('#imageNext');
  let items = [];
  let current = 0;

  const paint = () => {
    if (!items.length) return;
    current = (current + items.length) % items.length;
    const item = items[current];
    modalImg.src = item.src;
    modalImg.alt = item.alt || item.title || '';
    modalTitle.textContent = item.title || 'SIMDRON';
    modalCaption.textContent = item.caption || item.alt || '';
    modalIndex.textContent = `VIEW ${String(current+1).padStart(2,'0')} / ${String(items.length).padStart(2,'0')}`;
    const multi = items.length > 1;
    prev.hidden = !multi; next.hidden = !multi;
  };

  const openViewer = (gallery, index = 0) => {
    items = gallery.filter(x => x?.src);
    if (!items.length) return;
    current = Math.max(0, Math.min(index, items.length - 1));
    paint();
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
    document.body.classList.add('modal-open');
  };
  const closeViewer = () => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
    modalImg.removeAttribute('src');
    document.body.classList.remove('modal-open');
  };
  const deepItems = () => {
    const buttons = $$('#systemDeepGallery button');
    if (buttons.length) return buttons.map(b => ({
      src: $('img', b)?.getAttribute('src'),
      title: $('span', b)?.textContent || 'TECHNICAL VIEW',
      caption: $('img', b)?.alt || ''
    }));
    const img = $('#systemDeepImage');
    return img?.getAttribute('src') ? [{src:img.getAttribute('src'), title:$('#systemDeepCaption')?.textContent || 'TECHNICAL VIEW', caption:img.alt || ''}] : [];
  };

  const openDeep = () => {
    const gallery = deepItems();
    const buttons = $$('#systemDeepGallery button');
    const active = buttons.findIndex(b => b.classList.contains('active'));
    openViewer(gallery, active >= 0 ? active : 0);
  };
  $('#deepImageZoom')?.addEventListener('click', openDeep);
  $('#systemDeepImage')?.addEventListener('click', openDeep);

  const openMap = (mode = 'compare') => {
    const title = $('[data-map-title]')?.textContent || 'MAP PREVIEW';
    const caption = $('[data-map-description]')?.textContent || title;
    const img3d = $('#mapFeatureImage3d');
    const img2d = $('#mapFeatureImage2d');
    const gallery = [];
    if (img3d?.getAttribute('src')) gallery.push({ src: img3d.getAttribute('src'), title: `${title} / VISTA 3D`, caption, alt: img3d.alt || title });
    if (img2d?.getAttribute('src')) gallery.push({ src: img2d.getAttribute('src'), title: `${title} / MAPA 2D`, caption, alt: img2d.alt || title });
    if (!gallery.length) return;
    openViewer(gallery, mode === '2d' ? Math.min(1, gallery.length - 1) : 0);
  };
  $('#mapImageZoom3d')?.addEventListener('click', () => openMap('3d'));
  $('#mapImageZoom2d')?.addEventListener('click', () => openMap('2d'));
  $('#mapFeatureImage3d')?.addEventListener('click', () => openMap('3d'));
  $('#mapFeatureImage2d')?.addEventListener('click', () => openMap('2d'));

  const openSensor = () => {
    const keys = Object.keys(sensorData);
    const gallery = keys.map(k => ({src:sensorData[k].src, title:sensorData[k].title, caption:sensorData[k].text, alt:sensorData[k].title}));
    openViewer(gallery, Math.max(0, keys.indexOf(sensorKey)));
  };
  $('#sensorImageZoom')?.addEventListener('click', openSensor);
  sensorImg?.addEventListener('click', openSensor);

  $$('[data-close-image]').forEach(el => el.addEventListener('click', closeViewer));
  prev?.addEventListener('click', () => { current -= 1; paint(); });
  next?.addEventListener('click', () => { current += 1; paint(); });
  document.addEventListener('keydown', e => {
    if (!modal?.classList.contains('open')) return;
    if (e.key === 'Escape') closeViewer();
    if (e.key === 'ArrowLeft') { current -= 1; paint(); }
    if (e.key === 'ArrowRight') { current += 1; paint(); }
  });
})();
