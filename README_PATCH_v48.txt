SimDron Web v4.8 — TACTICAL EMPLOYMENT
========================================

OBJETIVO
Agregar una secuencia visual de empleo coordinado dentro de:
MISSION SYSTEMS -> TACTICAL FLOW

SECUENCIA
01 SRR / RECON
   El dron de reconocimiento busca y confirma el blanco dentro del escenario simulado.

02 FPV / DEPLOY
   La plataforma FPV es emplazada y configurada según la tarea antes del despegue.

03 FPV / MANUAL ACRO
   El piloto conduce manualmente el FPV en modo ACRO mediante vista en primera persona.

04 SRR / EFFECTS OBSERVATION
   El SRR permanece en observación tras el impacto para registrar efectos y apoyar la revisión posterior.

ARCHIVOS A REEMPLAZAR EN LA RAÍZ
- index.html
- script.js

styles.css se incluye sin cambios para que el paquete sea autosuficiente; no es obligatorio reemplazarlo.

ARCHIVOS NUEVOS EN /assets
- mission-employment-01-srr.webp
- mission-employment-02-fpv-deploy.webp
- mission-employment-03-acro.webp
- mission-employment-04-bda.webp

Las cuatro capturas fueron normalizadas a 1024x768, WebP, sin deformación.

NO TOCA
- title / meta description / canonical / SEO
- flight-demo.js
- fpv-drone.glb
- mapas
- videos
- Google verification

SUBIDA
1. GitHub -> Add file -> Upload files
2. Arrastrar index.html, script.js y la carpeta assets.
3. Commit changes.
4. Esperar GitHub Pages y hacer Ctrl+F5.

TAMAÑOS DE LAS IMÁGENES NORMALIZADAS
- mission-employment-01-srr.webp: 61 KB
- mission-employment-02-fpv-deploy.webp: 79 KB
- mission-employment-03-acro.webp: 79 KB
- mission-employment-04-bda.webp: 100 KB
