SimDron Web v4.7 — VISUAL ARCHIVE / DEEP DIVE
================================================

OBJETIVO
Usar prácticamente todo el material visual nuevo sin convertir la landing
en una pared de capturas. La página sigue siendo rápida de recorrer, pero
cada bloque técnico abre una segunda capa de información y una galería.

REEMPLAZAR EN LA RAÍZ:
- index.html
- styles.css
- script.js

AGREGAR EN /assets:
- todos los .webp incluidos en este patch

NO TOCA:
- title / meta description / canonical
- Search Console / archivo de verificación
- flight-demo.js
- fpv-drone.glb
- mapas ya existentes
- videos
- resto de assets públicos actuales

NUEVA LÓGICA
01 FLIGHT DYNAMICS
   - PRESETS: perfil y tuning físico
   - ASSISTED: rutas 3D, mapa y telemetría
   - INPUT: teclado Bluetooth / inputs

02 MISSION SYSTEMS
   - PAYLOAD: montaje, UI y operación nocturna
   - LINK / ECM
   - MULTI-UAV: enjambre, sistemas autónomos y OPFOR AI

03 SENSOR STACK
   - EO / IR
   - THERMAL: escena térmica industrial
   - RECON

04 INSTRUCTOR / C2
   - MULTI-VISOR
   - AUTHORING: Mission Control, biblioteca de contactos, rutas
   - INSTRUCTION: laboratorio, prevuelo y configuración
   - DEBRIEF

05 SYNTHETIC ENVIRONMENT
   - WEATHER: humo, nubes, agua
   - LIGHTING: librería completa de cielos
   - SCENARIOS: Hangar, FOB / Altiplano, NetRoad / Patagonia

CARGA DE DATOS
Las galerías se generan al abrir el subtema correspondiente. El visitante
que solo scrollea la portada no descarga toda esta biblioteca visual.

SUBIDA
1. GitHub -> Add file -> Upload files.
2. Arrastrar index.html, styles.css, script.js y la carpeta assets.
3. Commit changes.
4. Esperar GitHub Pages y hacer Ctrl+F5.

SEO
No se modificó la cabecera SEO de la versión anterior.
