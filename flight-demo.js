(() => {
  if (!window.React || !window.ReactDOM) throw new Error('React runtime missing');
  const React = window.React;
  const ReactDOM = window.ReactDOM;
  const h = React.createElement;
  const { useEffect, useRef, useState } = React;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rad = d => d * Math.PI / 180;

  function VirtualStick({ side, value, onChange }) {
    const activePointer = useRef(null);
    const updateFromEvent = (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const radius = rect.width * .36;
      let x = (e.clientX - cx) / radius;
      let y = -(e.clientY - cy) / radius;
      const len = Math.hypot(x, y);
      if (len > 1) { x /= len; y /= len; }
      onChange({ x: clamp(x,-1,1), y: clamp(y,-1,1) });
    };
    const down = (e) => {
      activePointer.current = e.pointerId;
      e.currentTarget.setPointerCapture?.(e.pointerId);
      updateFromEvent(e);
    };
    const move = (e) => { if (activePointer.current === e.pointerId) updateFromEvent(e); };
    const up = (e) => {
      if (activePointer.current !== e.pointerId) return;
      activePointer.current = null;
      try { e.currentTarget.releasePointerCapture?.(e.pointerId); } catch {}
      onChange({x:0,y:0});
    };
    const left = side === 'left';
    return h('div', { className:'stick-wrap' },
      h('div', { className:'stick-label' }, left ? 'STICK L · THROTTLE / YAW' : 'STICK R · PITCH / ROLL'),
      h('div', {
        className:'virtual-stick',
        onPointerDown:down, onPointerMove:move, onPointerUp:up, onPointerCancel:up
      }, h('div', {
        className:'stick-knob',
        style:{ '--sx':`${value.x*34}px`, '--sy':`${-value.y*34}px` }
      })),
      h('div', { className:'stick-axis' }, left ? 'W/S · THR  |  A/D · YAW' : '↑/↓ · PITCH  |  ←/→ · ROLL')
    );
  }

  function Hud({ t }) {
    const items = [
      ['MODE',t.mode,true],
      ['THR',`${Math.round(t.throttle)} %`,false],
      ['AGL',`${t.alt.toFixed(1)} m`,true],
      ['YAW',`${Math.round(t.yaw)}°`,false],
      ['PITCH',`${Math.round(t.pitch)}°`,false],
      ['ROLL',`${Math.round(t.roll)}°`,false]
    ];
    return h('div',{className:'flight-hud'},...items.map(([k,v,a]) =>
      h('div',{className:`hud-item${a?' accent':''}`,key:k},h('span',null,k),h('b',null,v))
    ));
  }

  function FlightApp({ modelUrl, posterUrl }) {
    const [mode,setMode] = useState('ANGLE');
    const [loaded,setLoaded] = useState(false);
    const [leftStick,setLeftStick] = useState({x:0,y:0});
    const [rightStick,setRightStick] = useState({x:0,y:0});
    const [telemetry,setTelemetry] = useState({mode:'ANGLE',throttle:50,alt:12,roll:0,pitch:0,yaw:0});

    const modelRef = useRef(null);
    const stageRef = useRef(null);
    const leftRef = useRef(leftStick);
    const rightRef = useRef(rightStick);
    const modeRef = useRef(mode);
    const keysRef = useRef(new Set());
    const stateRef = useRef({roll:0,pitch:0,yaw:0,alt:12,x:0,z:0,vx:0,vz:0});
    const telemetryClock = useRef(0);
    const activeRef = useRef(true);

    useEffect(()=>{ leftRef.current=leftStick; },[leftStick]);
    useEffect(()=>{ rightRef.current=rightStick; },[rightStick]);
    useEffect(()=>{ modeRef.current=mode; },[mode]);

    const reset = () => {
      stateRef.current = {roll:0,pitch:0,yaw:0,alt:12,x:0,z:0,vx:0,vz:0};
      leftRef.current = {x:0,y:0}; rightRef.current={x:0,y:0};
      setLeftStick({x:0,y:0}); setRightStick({x:0,y:0});
    };

    useEffect(() => {
      const down = e => {
        const k=e.key.toLowerCase();
        if (['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(k)) {
          e.preventDefault(); keysRef.current.add(k);
        }
      };
      const up = e => keysRef.current.delete(e.key.toLowerCase());
      window.addEventListener('keydown',down,{passive:false});
      window.addEventListener('keyup',up);
      return ()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);};
    },[]);

    useEffect(() => {
      const pause=()=>{activeRef.current=false;};
      const resume=()=>{activeRef.current=true;};
      window.addEventListener('simdron-flight-pause',pause);
      window.addEventListener('simdron-flight-resume',resume);
      return()=>{window.removeEventListener('simdron-flight-pause',pause);window.removeEventListener('simdron-flight-resume',resume);};
    },[]);

    useEffect(() => {
      const mv=modelRef.current;
      if (!mv) return;
      const onLoad=()=>setLoaded(true);
      mv.addEventListener('load',onLoad);
      return()=>mv.removeEventListener('load',onLoad);
    },[]);

    useEffect(() => {
      let raf=0;
      let last=performance.now();
      const frame=(now)=>{
        let dt=(now-last)/1000; last=now; dt=Math.min(dt,.035);
        if(!activeRef.current){ raf=requestAnimationFrame(frame); return; }
        const st=stateRef.current;
        const keys=keysRef.current;
        const l=leftRef.current, r=rightRef.current;
        const keyAxis=(pos,neg)=>(keys.has(pos)?1:0)-(keys.has(neg)?1:0);

        const throttle=clamp(l.y + keyAxis('w','s'),-1,1);
        const yawIn=clamp(l.x + keyAxis('d','a'),-1,1);
        const pitchIn=clamp(r.y + keyAxis('arrowup','arrowdown'),-1,1);
        const rollIn=clamp(r.x + keyAxis('arrowright','arrowleft'),-1,1);
        const m=modeRef.current;

        if(m==='ACRO'){
          st.pitch=clamp(st.pitch + pitchIn*72*dt,-82,82);
          st.roll=clamp(st.roll + rollIn*95*dt,-88,88);
        }else{
          const targetPitch=pitchIn*34;
          const targetRoll=rollIn*38;
          const smoothing=1-Math.exp(-7.5*dt);
          st.pitch=lerp(st.pitch,targetPitch,smoothing);
          st.roll=lerp(st.roll,targetRoll,smoothing);
        }
        st.yaw=(st.yaw + yawIn*88*dt + 360) % 360;

        const cp=Math.cos(rad(st.pitch));
        const cr=Math.cos(rad(st.roll));
        const tiltLoss=(1-Math.max(0,cp*cr))*4.5;
        const vertical=m==='HORIZON' ? throttle*3.2 : throttle*3.2 - tiltLoss;
        st.alt=clamp(st.alt + vertical*dt,0,80);

        const targetVx=Math.sin(rad(st.roll))*5.2;
        const targetVz=Math.sin(rad(st.pitch))*5.5;
        const motionSmooth=1-Math.exp(-2.8*dt);
        st.vx=lerp(st.vx,targetVx,motionSmooth);
        st.vz=lerp(st.vz,targetVz,motionSmooth);
        st.x+=st.vx*dt; st.z+=st.vz*dt;

        const mv=modelRef.current;
        if(mv){
          // model-viewer convention: roll pitch yaw.
          mv.setAttribute('orientation',`${st.roll.toFixed(2)}deg ${st.pitch.toFixed(2)}deg ${st.yaw.toFixed(2)}deg`);
          mv.style.setProperty('--alt-shift',`${clamp(-(st.alt-12)*4,-105,85)}px`);
        }
        const stage=stageRef.current;
        if(stage){
          stage.style.setProperty('--gx',`${(-st.x*22)%54}px`);
          stage.style.setProperty('--gz',`${(st.z*22)%54}px`);
        }

        telemetryClock.current+=dt;
        if(telemetryClock.current>.08){
          telemetryClock.current=0;
          setTelemetry({mode:m,throttle:50+throttle*50,alt:st.alt,roll:st.roll,pitch:st.pitch,yaw:st.yaw});
        }
        raf=requestAnimationFrame(frame);
      };
      raf=requestAnimationFrame(frame);
      return()=>cancelAnimationFrame(raf);
    },[]);

    const modeCopy={
      ACRO:'Rate control. La actitud no vuelve automáticamente a nivel al soltar pitch o roll.',
      ANGLE:'Attitude control con auto-nivelado. Al inclinarse, disminuye el componente vertical y puede perder altura.',
      HORIZON:'Traslación similar a ANGLE con compensación vertical: la altura responde al throttle sin penalización por inclinación.'
    };

    return h('div',{className:'flight-app'},
      h('div',{className:'flight-topbar'},
        h('div',{className:'flight-title'},'SIMDRON / FLIGHT CONTROL DEMO'),
        h('div',{className:`flight-status${loaded?' live':''}`},loaded?'MODEL READY':'LOADING MODEL…'),
        h('div',{className:'flight-modes'},...['ACRO','ANGLE','HORIZON'].map(m=>h('button',{key:m,className:mode===m?'active':'',onClick:()=>setMode(m)},m))),
        h('button',{className:'flight-reset',onClick:reset},'RESET')
      ),
      h('div',{className:'flight-body'},
        h('div',{className:'flight-stage',ref:stageRef},
          h('div',{className:'sim-horizon'}),
          h('div',{className:'sim-ground'}),
          h('model-viewer',{
            ref:modelRef,
            className:'flight-model',
            src:modelUrl,
            poster:posterUrl,
            alt:'Modelo 3D interactivo de dron FPV SimDron',
            'camera-controls':true,
            'disable-pan':true,
            'interaction-prompt':'none',
            'shadow-intensity':'1',
            'exposure':'1',
            'camera-orbit':'35deg 72deg auto',
            'min-camera-orbit':'auto 35deg auto',
            'max-camera-orbit':'auto 105deg auto',
            'touch-action':'none'
          }),
          h(Hud,{t:telemetry}),
          h('div',{className:'flight-crosshair'})
        ),
        h('aside',{className:'flight-sidepanel'},
          h('h3',null,mode),
          h('p',null,modeCopy[mode]),
          h('div',{className:'keyboard-map'},
            h('div',null,h('span',null,'W / S'),h('b',null,'THROTTLE')),
            h('div',null,h('span',null,'A / D'),h('b',null,'YAW')),
            h('div',null,h('span',null,'↑ / ↓'),h('b',null,'PITCH')),
            h('div',null,h('span',null,'← / →'),h('b',null,'ROLL'))
          ),
          h('div',{className:'stick-zone'},
            h(VirtualStick,{side:'left',value:leftStick,onChange:setLeftStick}),
            h(VirtualStick,{side:'right',value:rightStick,onChange:setRightStick})
          ),
          h('div',{className:'flight-help'},'SIMPLIFIED VISUAL DEMONSTRATION · NOT A FLIGHT-DYNAMICS SUBSTITUTE')
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
