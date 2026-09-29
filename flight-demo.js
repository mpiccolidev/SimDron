(() => {
  if (!window.React || !window.ReactDOM) throw new Error('React runtime missing');
  if (!window.BABYLON) throw new Error('Babylon runtime missing');

  const React = window.React;
  const ReactDOM = window.ReactDOM;
  const BABYLON = window.BABYLON;
  const h = React.createElement;
  const { useEffect, useMemo, useRef, useState } = React;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rad = d => d * Math.PI / 180;

  function VirtualStick({ side, value, onChange }) {
    const activePointer = useRef(null);

    const updateFromEvent = (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const radius = rect.width * .39;
      let x = (e.clientX - cx) / radius;
      let y = -(e.clientY - cy) / radius;
      const len = Math.hypot(x, y);
      if (len > 1) { x /= len; y /= len; }
      onChange({ x: clamp(x, -1, 1), y: clamp(y, -1, 1) });
    };

    const down = (e) => {
      activePointer.current = e.pointerId;
      e.currentTarget.setPointerCapture?.(e.pointerId);
      e.preventDefault();
      updateFromEvent(e);
    };
    const move = (e) => {
      if (activePointer.current === e.pointerId) {
        e.preventDefault();
        updateFromEvent(e);
      }
    };
    const up = (e) => {
      if (activePointer.current !== e.pointerId) return;
      activePointer.current = null;
      try { e.currentTarget.releasePointerCapture?.(e.pointerId); } catch {}
      onChange({ x: 0, y: 0 });
    };

    const left = side === 'left';
    return h('div', { className: 'stick-wrap' },
      h('div', { className: 'stick-label' }, left ? 'STICK L · THROTTLE / YAW' : 'STICK R · PITCH / ROLL'),
      h('div', {
        className: 'virtual-stick',
        onPointerDown: down,
        onPointerMove: move,
        onPointerUp: up,
        onPointerCancel: up,
        onContextMenu: e => e.preventDefault()
      },
        h('div', {
          className: 'stick-knob',
          style: {
            '--sx': `${value.x * 34}px`,
            '--sy': `${-value.y * 34}px`
          }
        })
      ),
      h('div', { className: 'stick-axis' }, left ? 'W/S · THR  |  A/D · YAW' : '↑/↓ · PITCH  |  ←/→ · ROLL')
    );
  }

  function Hud({ t }) {
    const items = [
      ['MODE', t.mode, true],
      ['THR', `${Math.round(t.throttle)} %`, false],
      ['AGL', `${t.alt.toFixed(1)} m`, true],
      ['YAW', `${Math.round(t.yaw)}°`, false],
      ['PITCH', `${Math.round(t.pitch)}°`, false],
      ['ROLL', `${Math.round(t.roll)}°`, false]
    ];
    return h('div', { className: 'flight-hud' }, ...items.map(([k, v, a]) =>
      h('div', { className: `hud-item${a ? ' accent' : ''}`, key: k },
        h('span', null, k),
        h('b', null, v)
      )
    ));
  }

  function FlightApp({ modelUrl }) {
    const [mode, setMode] = useState('ANGLE');
    const [loaded, setLoaded] = useState(false);
    const [loadError, setLoadError] = useState('');
    const [leftStick, setLeftStick] = useState({ x: 0, y: 0 });
    const [rightStick, setRightStick] = useState({ x: 0, y: 0 });
    const [keyTick, setKeyTick] = useState(0);
    const [telemetry, setTelemetry] = useState({ mode: 'ANGLE', throttle: 50, alt: 12, roll: 0, pitch: 0, yaw: 0 });

    const canvasRef = useRef(null);
    const sceneRef = useRef(null);
    const engineRef = useRef(null);
    const cameraRef = useRef(null);
    const aircraftRef = useRef(null);
    const modelRootRef = useRef(null);
    const modelSizeRef = useRef(.66);
    const baseGroundYRef = useRef(-.46);

    const leftRef = useRef(leftStick);
    const rightRef = useRef(rightStick);
    const modeRef = useRef(mode);
    const keysRef = useRef(new Set());
    const stateRef = useRef({ roll: 0, pitch: 0, yaw: 0, alt: 12, x: 0, z: 0, vx: 0, vz: 0 });
    const telemetryClock = useRef(0);
    const activeRef = useRef(true);
    const frameRef = useRef(0);
    const fiberRef = useRef(null);
    const fiberPointsRef = useRef([]);
    const fiberAnchorLocalRef = useRef(null);
    const fiberFrameRef = useRef(0);

    useEffect(() => { leftRef.current = leftStick; }, [leftStick]);
    useEffect(() => { rightRef.current = rightStick; }, [rightStick]);
    useEffect(() => { modeRef.current = mode; }, [mode]);

    const clearKeys = () => {
      if (keysRef.current.size) {
        keysRef.current.clear();
        setKeyTick(v => v + 1);
      }
    };

    const reset = () => {
      stateRef.current = { roll: 0, pitch: 0, yaw: 0, alt: 12, x: 0, z: 0, vx: 0, vz: 0 };
      leftRef.current = { x: 0, y: 0 };
      rightRef.current = { x: 0, y: 0 };
      setLeftStick({ x: 0, y: 0 });
      setRightStick({ x: 0, y: 0 });
      clearKeys();

      const rig = aircraftRef.current;
      if (rig) {
        rig.position.set(0, 0, 0);
        rig.rotationQuaternion = BABYLON.Quaternion.Identity();
      }
      const fiber = fiberRef.current;
      if (fiber && aircraftRef.current && fiberAnchorLocalRef.current) {
        const rig = aircraftRef.current;
        rig.computeWorldMatrix(true);
        const anchor = BABYLON.Vector3.TransformCoordinates(fiberAnchorLocalRef.current, rig.getWorldMatrix());
        const pts = fiberPointsRef.current;
        for (let i = 0; i < pts.length; i++) pts[i].copyFrom(anchor);
        if (pts.length) BABYLON.MeshBuilder.CreateLines('fiberTrail', { points: pts, instance: fiber });
      }
      const camera = cameraRef.current;
      if (camera) {
        const size = modelSizeRef.current || .66;
        camera.alpha = Math.PI * 1.22;
        camera.beta = Math.PI * .39;
        camera.radius = size * 2.15;
        camera.target.copyFromFloats(0, 0, 0);
      }
    };

    // Desktop Mode 2 keyboard input.
    useEffect(() => {
      const controlled = new Set(['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright']);
      const down = (e) => {
        const k = e.key.toLowerCase();
        if (!controlled.has(k)) return;
        e.preventDefault();
        if (!keysRef.current.has(k)) {
          keysRef.current.add(k);
          setKeyTick(v => v + 1);
        }
      };
      const up = (e) => {
        const k = e.key.toLowerCase();
        if (!controlled.has(k)) return;
        e.preventDefault();
        if (keysRef.current.delete(k)) setKeyTick(v => v + 1);
      };
      const blur = () => clearKeys();
      const visibility = () => { if (document.hidden) clearKeys(); };
      window.addEventListener('keydown', down, { passive: false });
      window.addEventListener('keyup', up, { passive: false });
      window.addEventListener('blur', blur);
      document.addEventListener('visibilitychange', visibility);
      return () => {
        window.removeEventListener('keydown', down);
        window.removeEventListener('keyup', up);
        window.removeEventListener('blur', blur);
        document.removeEventListener('visibilitychange', visibility);
      };
    }, []);

    useEffect(() => {
      const pause = () => { activeRef.current = false; clearKeys(); };
      const resume = () => { activeRef.current = true; clearKeys(); };
      window.addEventListener('simdron-flight-pause', pause);
      window.addEventListener('simdron-flight-resume', resume);
      return () => {
        window.removeEventListener('simdron-flight-pause', pause);
        window.removeEventListener('simdron-flight-resume', resume);
      };
    }, []);

    // Real 3D scene. Unlike model-viewer, the aircraft is a TransformNode that we
    // explicitly rotate and translate; OrbitCamera is used only to inspect/follow it.
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      let disposed = false;
      const engine = new BABYLON.Engine(canvas, true, {
        preserveDrawingBuffer: false,
        stencil: true,
        antialias: true,
        adaptToDeviceRatio: true
      });
      engineRef.current = engine;

      const scene = new BABYLON.Scene(engine);
      sceneRef.current = scene;
      scene.clearColor = new BABYLON.Color4(0.025, 0.03, 0.03, 1);
      scene.ambientColor = new BABYLON.Color3(.22, .22, .22);

      const camera = new BABYLON.ArcRotateCamera(
        'inspectionCamera',
        Math.PI * 1.22,
        Math.PI * .39,
        1.4,
        BABYLON.Vector3.Zero(),
        scene
      );
      cameraRef.current = camera;
      camera.attachControl(canvas, true);
      camera.panningSensibility = 0;
      camera.wheelDeltaPercentage = .012;
      camera.pinchDeltaPercentage = .008;
      camera.inertia = .72;
      camera.angularSensibilityX = 750;
      camera.angularSensibilityY = 750;
      camera.lowerBetaLimit = .18;
      camera.upperBetaLimit = Math.PI - .24;
      // Arrow keys belong to the simulated right stick, never to the inspection camera.
      camera.keysUp = [];
      camera.keysDown = [];
      camera.keysLeft = [];
      camera.keysRight = [];

      const hemi = new BABYLON.HemisphericLight('hemi', new BABYLON.Vector3(.25, 1, -.2), scene);
      hemi.intensity = 1.28;
      hemi.diffuse = new BABYLON.Color3(.96, .98, 1);
      hemi.groundColor = new BABYLON.Color3(.1, .1, .1);

      const key = new BABYLON.DirectionalLight('key', new BABYLON.Vector3(-.45, -.8, .55), scene);
      key.position = new BABYLON.Vector3(3, 5, -3);
      key.intensity = 1.7;

      const rim = new BABYLON.DirectionalLight('rim', new BABYLON.Vector3(.5, -.25, -.7), scene);
      rim.position = new BABYLON.Vector3(-4, 2, 4);
      rim.intensity = .65;
      rim.diffuse = new BABYLON.Color3(1, .84, .25);

      const aircraft = new BABYLON.TransformNode('aircraftRig', scene);
      aircraft.rotationQuaternion = BABYLON.Quaternion.Identity();
      aircraftRef.current = aircraft;

      const makeGrid = (groundY, size) => {
        const gridRoot = new BABYLON.TransformNode('gridRoot', scene);
        const half = size * 7;
        const step = size * .72;
        const count = 22;
        const lineColor = new BABYLON.Color3(.12, .135, .135);
        for (let i = -count; i <= count; i++) {
          const p = i * step;
          const l1 = BABYLON.MeshBuilder.CreateLines(`gx${i}`, { points: [
            new BABYLON.Vector3(-half, groundY, p),
            new BABYLON.Vector3(half, groundY, p)
          ] }, scene);
          l1.color = lineColor;
          l1.alpha = .42;
          l1.isPickable = false;
          l1.parent = gridRoot;

          const l2 = BABYLON.MeshBuilder.CreateLines(`gz${i}`, { points: [
            new BABYLON.Vector3(p, groundY, -half),
            new BABYLON.Vector3(p, groundY, half)
          ] }, scene);
          l2.color = lineColor;
          l2.alpha = .42;
          l2.isPickable = false;
          l2.parent = gridRoot;
        }

        const pad = BABYLON.MeshBuilder.CreateDisc('referencePad', { radius: size * .72, tessellation: 64 }, scene);
        pad.rotation.x = Math.PI / 2;
        pad.position.y = groundY + .002;
        pad.isPickable = false;
        const padMat = new BABYLON.StandardMaterial('padMat', scene);
        padMat.diffuseColor = new BABYLON.Color3(.035, .04, .04);
        padMat.emissiveColor = new BABYLON.Color3(.02, .02, .02);
        padMat.specularColor = BABYLON.Color3.Black();
        pad.material = padMat;

        const ring = BABYLON.MeshBuilder.CreateTorus('referenceRing', {
          diameter: size * 1.15,
          thickness: size * .012,
          tessellation: 96
        }, scene);
        ring.position.y = groundY + .01;
        ring.isPickable = false;
        const ringMat = new BABYLON.StandardMaterial('ringMat', scene);
        ringMat.emissiveColor = new BABYLON.Color3(1, .78, 0);
        ringMat.diffuseColor = new BABYLON.Color3(.15, .12, 0);
        ring.material = ringMat;
      };

      BABYLON.SceneLoader.ImportMeshAsync(null, '', modelUrl, scene).then(result => {
        if (disposed) return;

        // Determine the actual visual bounds of the imported GLB and re-parent the
        // imported top-level nodes below a centered root. This makes the rotation
        // pivot independent from however Blender exported the model origin.
        let min = new BABYLON.Vector3(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
        let max = new BABYLON.Vector3(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);
        const importedSet = new Set(result.meshes);

        result.meshes.forEach(mesh => {
          if (!mesh || !mesh.getBoundingInfo) return;
          mesh.computeWorldMatrix(true);
          const info = mesh.getBoundingInfo();
          if (!info || !info.boundingBox) return;
          min = BABYLON.Vector3.Minimize(min, info.boundingBox.minimumWorld);
          max = BABYLON.Vector3.Maximize(max, info.boundingBox.maximumWorld);
        });

        const center = min.add(max).scale(.5);
        const dimensions = max.subtract(min);
        const maxDim = Math.max(dimensions.x, dimensions.y, dimensions.z, .1);
        modelSizeRef.current = maxDim;
        baseGroundYRef.current = -maxDim * .70;

        const modelRoot = new BABYLON.TransformNode('centeredModelRoot', scene);
        modelRootRef.current = modelRoot;
        // Only top-level imported meshes/nodes are reparented so the GLB hierarchy stays intact.
        result.meshes.forEach(mesh => {
          if (!mesh) return;
          if (!mesh.parent || !importedSet.has(mesh.parent)) mesh.parent = modelRoot;
          mesh.isPickable = false;
        });
        result.transformNodes?.forEach(node => {
          if (!node || node === modelRoot) return;
          if (!node.parent || (!importedSet.has(node.parent) && node.parent !== modelRoot)) {
            // GLTFLoader usually exposes meshes as the visible hierarchy, so leave
            // nested transform nodes untouched; this branch only catches detached roots.
          }
        });

        modelRoot.position = center.scale(-1);
        modelRoot.parent = aircraft;

        // Fit to the viewport from the actual model size — not a hard-coded camera distance.
        camera.radius = maxDim * 2.05;
        camera.lowerRadiusLimit = maxDim * .82;
        camera.upperRadiusLimit = maxDim * 6.5;
        camera.target.copyFromFloats(0, 0, 0);
        camera.minZ = Math.max(.005, maxDim * .02);
        camera.maxZ = maxDim * 100;

        makeGrid(baseGroundYRef.current, maxDim);

        // Visual fiber spool trail. The anchor sits near the lower-rear area of the
        // aircraft rig and leaves a lightweight world-space line as the vehicle moves.
        // It is deliberately visual-only and does not alter flight dynamics.
        fiberAnchorLocalRef.current = new BABYLON.Vector3(0, -maxDim * .13, maxDim * .34);
        aircraft.computeWorldMatrix(true);
        const fiberAnchor = BABYLON.Vector3.TransformCoordinates(fiberAnchorLocalRef.current, aircraft.getWorldMatrix());
        const fiberPoints = Array.from({ length: 180 }, () => fiberAnchor.clone());
        fiberPointsRef.current = fiberPoints;
        const fiber = BABYLON.MeshBuilder.CreateLines('fiberTrail', { points: fiberPoints, updatable: true }, scene);
        fiber.color = new BABYLON.Color3(.98, .79, .18);
        fiber.alpha = .72;
        fiber.isPickable = false;
        fiberRef.current = fiber;

        setLoaded(true);
      }).catch(err => {
        console.error('SimDron 3D model load error', err);
        if (!disposed) setLoadError('No se pudo cargar el modelo 3D.');
      });

      const resize = () => engine.resize();
      window.addEventListener('resize', resize);
      const ro = new ResizeObserver(() => engine.resize());
      ro.observe(canvas);

      engine.runRenderLoop(() => scene.render());

      return () => {
        disposed = true;
        window.removeEventListener('resize', resize);
        ro.disconnect();
        aircraftRef.current = null;
        cameraRef.current = null;
        sceneRef.current = null;
        engineRef.current = null;
        fiberRef.current = null;
        fiberPointsRef.current = [];
        fiberAnchorLocalRef.current = null;
        scene.dispose();
        engine.dispose();
      };
    }, [modelUrl]);

    // Flight-control simulation. This loop changes the actual Babylon aircraft rig.
    useEffect(() => {
      let raf = 0;
      let last = performance.now();

      const frame = (now) => {
        let dt = Math.min((now - last) / 1000, .035);
        last = now;
        if (!activeRef.current) {
          raf = requestAnimationFrame(frame);
          return;
        }

        const st = stateRef.current;
        const keys = keysRef.current;
        const l = leftRef.current;
        const r = rightRef.current;
        const keyAxis = (pos, neg) => (keys.has(pos) ? 1 : 0) - (keys.has(neg) ? 1 : 0);

        const throttle = clamp(l.y + keyAxis('w', 's'), -1, 1);
        const yawIn = clamp(l.x + keyAxis('d', 'a'), -1, 1);
        // Mode 2: pushing the pitch stick forward / ArrowUp commands nose-down.
        // Keep the on-screen stick moving upward, but invert the aerodynamic command.
        const pitchIn = -clamp(r.y + keyAxis('arrowup', 'arrowdown'), -1, 1);
        const rollIn = clamp(r.x + keyAxis('arrowright', 'arrowleft'), -1, 1);
        const m = modeRef.current;

        if (m === 'ACRO') {
          st.pitch = clamp(st.pitch + pitchIn * 78 * dt, -82, 82);
          st.roll = clamp(st.roll + rollIn * 108 * dt, -88, 88);
        } else {
          const targetPitch = pitchIn * 34;
          const targetRoll = rollIn * 38;
          const smoothing = 1 - Math.exp(-7.5 * dt);
          st.pitch = lerp(st.pitch, targetPitch, smoothing);
          st.roll = lerp(st.roll, targetRoll, smoothing);
        }

        st.yaw = (st.yaw + yawIn * 92 * dt + 360) % 360;

        const cp = Math.cos(rad(st.pitch));
        const cr = Math.cos(rad(st.roll));
        const tiltLoss = (1 - Math.max(0, cp * cr)) * 4.8;
        const vertical = m === 'HORIZON' ? throttle * 3.2 : throttle * 3.2 - tiltLoss;
        st.alt = clamp(st.alt + vertical * dt, 0, 80);

        // Simplified horizontal motion for the third-person demonstrator.
        // Pitch drives forward/back movement in the current yaw direction;
        // roll adds lateral movement. The camera follows but does not replace it.
        const yawR = rad(st.yaw);
        const forward = -Math.sin(rad(st.pitch)) * 2.1;
        const lateral = Math.sin(rad(st.roll)) * 1.7;
        const targetVx = Math.sin(yawR) * forward + Math.cos(yawR) * lateral;
        const targetVz = Math.cos(yawR) * forward - Math.sin(yawR) * lateral;
        const motionSmooth = 1 - Math.exp(-2.8 * dt);
        st.vx = lerp(st.vx, targetVx, motionSmooth);
        st.vz = lerp(st.vz, targetVz, motionSmooth);
        st.x += st.vx * dt;
        st.z += st.vz * dt;

        const rig = aircraftRef.current;
        const camera = cameraRef.current;
        const size = modelSizeRef.current || .66;
        if (rig) {
          rig.rotationQuaternion = BABYLON.Quaternion.RotationYawPitchRoll(
            rad(st.yaw),
            rad(-st.pitch),
            rad(-st.roll)
          );
          // Altitude is visually compressed so the vehicle remains inspectable.
          rig.position.x = st.x * size * .22;
          rig.position.z = st.z * size * .22;
          rig.position.y = clamp((st.alt - 12) * size * .022, -size * .35, size * .65);

          // Unspool a visual fiber line from the aircraft. Keep a fixed number of
          // points so the Babylon line can be updated cheaply on desktop and mobile.
          if (fiberRef.current && fiberAnchorLocalRef.current && fiberPointsRef.current.length) {
            fiberFrameRef.current = (fiberFrameRef.current + 1) % 3;
            if (fiberFrameRef.current === 0) {
              rig.computeWorldMatrix(true);
              const anchor = BABYLON.Vector3.TransformCoordinates(fiberAnchorLocalRef.current, rig.getWorldMatrix());
              const pts = fiberPointsRef.current;
              for (let i = 0; i < pts.length - 1; i++) pts[i].copyFrom(pts[i + 1]);
              pts[pts.length - 1].copyFrom(anchor);
              BABYLON.MeshBuilder.CreateLines('fiberTrail', { points: pts, instance: fiberRef.current });
            }
          }
        }

        if (camera && rig) {
          // Chase-style target with damping: the aircraft can visibly move inside
          // the frame while the camera gently follows it. Mouse/touch still owns orbit/zoom.
          const desiredTarget = rig.position.clone();
          camera.target = BABYLON.Vector3.Lerp(camera.target, desiredTarget, 1 - Math.exp(-3.5 * dt));
        }

        telemetryClock.current += dt;
        if (telemetryClock.current > .065) {
          telemetryClock.current = 0;
          setTelemetry({
            mode: m,
            throttle: 50 + throttle * 50,
            alt: st.alt,
            roll: st.roll,
            pitch: st.pitch,
            yaw: st.yaw
          });
        }

        raf = requestAnimationFrame(frame);
      };

      raf = requestAnimationFrame(frame);
      frameRef.current = raf;
      return () => cancelAnimationFrame(raf);
    }, []);

    const visualSticks = useMemo(() => {
      void keyTick;
      const keys = keysRef.current;
      const keyAxis = (pos, neg) => (keys.has(pos) ? 1 : 0) - (keys.has(neg) ? 1 : 0);
      return {
        left: {
          x: clamp(leftStick.x + keyAxis('d', 'a'), -1, 1),
          y: clamp(leftStick.y + keyAxis('w', 's'), -1, 1)
        },
        right: {
          x: clamp(rightStick.x + keyAxis('arrowright', 'arrowleft'), -1, 1),
          y: clamp(rightStick.y + keyAxis('arrowup', 'arrowdown'), -1, 1)
        }
      };
    }, [leftStick, rightStick, keyTick]);

    const modeCopy = {
      ACRO: 'Rate control. La actitud se conserva al soltar pitch o roll; el piloto debe corregirla manualmente.',
      ANGLE: 'Auto-nivelado. El dron se inclina para trasladarse y puede perder altura si no se compensa con throttle.',
      HORIZON: 'Movimiento comparable a ANGLE con compensación vertical: la altura responde principalmente al throttle.'
    };

    return h('div', { className: 'flight-app' },
      h('div', { className: 'flight-topbar' },
        h('div', { className: 'flight-title' }, 'SIMDRON / FLIGHT CONTROL DEMO'),
        h('div', { className: `flight-status${loaded ? ' live' : ''}` }, loadError || (loaded ? 'MODEL READY' : 'LOADING MODEL…')),
        h('div', { className: 'flight-modes' }, ...['ACRO', 'ANGLE', 'HORIZON'].map(m =>
          h('button', { key: m, className: mode === m ? 'active' : '', onClick: () => setMode(m) }, m)
        )),
        h('button', { className: 'flight-reset', onClick: reset }, 'RESET')
      ),
      h('div', { className: 'flight-body' },
        h('div', { className: 'flight-stage' },
          h('canvas', {
            ref: canvasRef,
            className: 'flight-canvas',
            tabIndex: 0,
            'aria-label': 'Vista tridimensional interactiva del dron FPV SimDron'
          }),
          !loaded && h('div', { className: 'flight-stage-loading' }, loadError || 'CARGANDO MODELO 3D…'),
          h(Hud, { t: telemetry }),
          h('div', { className: 'flight-crosshair' }),
          h('div', { className: 'inspect-hint' }, 'DRAG · ORBIT   /   WHEEL · ZOOM')
        ),
        h('aside', { className: 'flight-sidepanel' },
          h('h3', null, mode),
          h('p', null, modeCopy[mode]),
          h('div', { className: 'keyboard-map' },
            h('div', null, h('span', null, 'W / S'), h('b', null, 'THROTTLE')),
            h('div', null, h('span', null, 'A / D'), h('b', null, 'YAW')),
            h('div', null, h('span', null, '↑ / ↓'), h('b', null, 'PITCH')),
            h('div', null, h('span', null, '← / →'), h('b', null, 'ROLL'))
          ),
          h('div', { className: 'stick-zone' },
            h(VirtualStick, { side: 'left', value: visualSticks.left, onChange: setLeftStick }),
            h(VirtualStick, { side: 'right', value: visualSticks.right, onChange: setRightStick })
          ),
          h('div', { className: 'flight-help' }, 'SIMPLIFIED VISUAL DEMONSTRATION · NOT A FLIGHT-DYNAMICS SUBSTITUTE')
        )
      )
    );
  }

  window.mountSimDronFlightDemo = (root, options) => {
    const node = h(FlightApp, options);
    if (ReactDOM.createRoot) ReactDOM.createRoot(root).render(node);
    else ReactDOM.render(node, root);
  };
})();
