'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

interface Hero3DCanvasProps {
  pointerRef: React.MutableRefObject<{ x: number; y: number }>;
  reduceMotion?: boolean | null;
}

// Pre-allocated scratch objects for zero-GC per-frame updates
const _dummy = new THREE.Object3D();
const _baseColor = new THREE.Color();

function createPlazaGridTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#081b34';
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.14)';
    ctx.lineWidth = 1.5;
    const step = 32;
    for (let i = 0; i <= 512; i += step) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 512);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(512, i);
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(251, 191, 36, 0.18)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(256, 256, 175, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(52, 211, 153, 0.16)';
    ctx.beginPath();
    ctx.arc(256, 256, 118, 0, Math.PI * 2);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export function Hero3DCanvas({
  pointerRef,
  reduceMotion = false,
}: Hero3DCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const reduceMotionRef = useRef<boolean>(Boolean(reduceMotion));

  useEffect(() => {
    reduceMotionRef.current = Boolean(reduceMotion);
  }, [reduceMotion]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = Math.max(container.clientWidth, 320);
    const height = Math.max(container.clientHeight, 260);

    // Software WebGL detection (covers headless/CPU renderers without changing scene content)
    const isSoftwareGl = (() => {
      try {
        const probe = document.createElement('canvas').getContext('webgl2');
        if (!probe) return true;
        const ext = probe.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : probe.RENDERER;
        const gpu = String(probe.getParameter(param));
        probe.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(
      isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2)
    );
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const bgNavy = new THREE.Color('#0B2545');
    scene.background = bgNavy;
    scene.fog = new THREE.FogExp2('#0B2545', 0.045);

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 80);
    const baseCamPos = { x: 3.4, y: 3.7, z: 10.6 };
    camera.position.set(baseCamPos.x, baseCamPos.y, baseCamPos.z);
    camera.lookAt(-0.7, 1.35, 0);

    // Procedural Studio Environment Reflection
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    // Track disposable resources cleanly
    const geometries: THREE.BufferGeometry[] = [];
    const materials: THREE.Material[] = [];
    const textures: THREE.Texture[] = [];

    const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
      geometries.push(g);
      return g;
    };
    const trackMat = <T extends THREE.Material>(m: T): T => {
      materials.push(m);
      return m;
    };

    // Balanced Warm/Cool 3-Point Civic Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x061326, 0.9);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfde68a, 1.9);
    keyLight.position.set(7.5, 11, 6.5);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.left = -9;
    keyLight.shadow.camera.right = 9;
    keyLight.shadow.camera.top = 9;
    keyLight.shadow.camera.bottom = -9;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 28;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x34d399, 1.15);
    rimLight.position.set(-7, 5, -6);
    scene.add(rimLight);

    // Root world group shifted slightly right so left hero copy remains clean
    const worldGroup = new THREE.Group();
    worldGroup.position.set(1.3, -0.35, 0);
    scene.add(worldGroup);

    // 1. Civic Plaza Ground & Coplanar Grid Overlay
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const plazaTex = createPlazaGridTexture(maxAniso);
    textures.push(plazaTex);

    const groundMat = trackMat(
      new THREE.MeshStandardMaterial({
        map: plazaTex,
        roughness: 0.78,
        metalness: 0.15,
      })
    );
    const groundMesh = new THREE.Mesh(
      trackGeo(new THREE.CircleGeometry(14, 64)),
      groundMat
    );
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = !isSoftwareGl;
    worldGroup.add(groundMesh);

    const ringOverlayMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.35,
        roughness: 0.35,
        metalness: 0.7,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      })
    );
    const plazaRim = new THREE.Mesh(
      trackGeo(new THREE.RingGeometry(2.65, 2.74, 48)),
      ringOverlayMat
    );
    plazaRim.rotation.x = -Math.PI / 2;
    plazaRim.position.y = 0.02;
    worldGroup.add(plazaRim);

    // 2. Central Ward 65 Municipal Pavilion (Composite 9-part Group grounded at y=0)
    const pavilionGroup = new THREE.Group();
    worldGroup.add(pavilionGroup);

    const stoneMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x1e3a5f,
        roughness: 0.65,
        metalness: 0.25,
      })
    );
    const marbleMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        roughness: 0.32,
        metalness: 0.12,
      })
    );
    const goldMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        roughness: 0.22,
        metalness: 0.9,
      })
    );
    const emeraldMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x15803d,
        emissive: 0x10b981,
        emissiveIntensity: 0.35,
        roughness: 0.3,
        metalness: 0.6,
      })
    );
    const saffronMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xea580c,
        emissive: 0xf97316,
        emissiveIntensity: 0.4,
        roughness: 0.28,
        metalness: 0.55,
      })
    );

    // Stepped octagonal base
    const base1 = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(2.0, 2.25, 0.24, 8)),
      stoneMat
    );
    base1.position.y = 0.12;
    base1.castShadow = !isSoftwareGl;
    base1.receiveShadow = !isSoftwareGl;
    pavilionGroup.add(base1);

    const base2 = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(1.55, 1.72, 0.2, 8)),
      marbleMat
    );
    base2.position.y = 0.34;
    base2.castShadow = !isSoftwareGl;
    base2.receiveShadow = !isSoftwareGl;
    pavilionGroup.add(base2);

    // 6 Architectural Pillars
    const pillarGeo = trackGeo(new THREE.CylinderGeometry(0.11, 0.13, 1.35, 16));
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const pillar = new THREE.Mesh(pillarGeo, marbleMat);
      pillar.position.set(
        Math.cos(angle) * 1.15,
        0.44 + 0.675,
        Math.sin(angle) * 1.15
      );
      pillar.castShadow = !isSoftwareGl;
      pavilionGroup.add(pillar);
    }

    // Core inner civic chamber
    const coreChamber = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.68, 0.72, 1.3, 16)),
      stoneMat
    );
    coreChamber.position.y = 0.44 + 0.65;
    pavilionGroup.add(coreChamber);

    // Upper cornice & Lathe civic dome
    const cornice = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(1.42, 1.35, 0.18, 16)),
      goldMat
    );
    cornice.position.y = 1.88;
    cornice.castShadow = !isSoftwareGl;
    pavilionGroup.add(cornice);

    const domePoints = [
      new THREE.Vector2(1.18, 0),
      new THREE.Vector2(1.12, 0.28),
      new THREE.Vector2(0.88, 0.58),
      new THREE.Vector2(0.52, 0.82),
      new THREE.Vector2(0.18, 0.96),
      new THREE.Vector2(0.0, 1.02),
    ];
    const domeGeo = trackGeo(new THREE.LatheGeometry(domePoints, 28));
    const domeMesh = new THREE.Mesh(domeGeo, marbleMat);
    domeMesh.position.y = 1.97;
    domeMesh.castShadow = !isSoftwareGl;
    pavilionGroup.add(domeMesh);

    // Tricolor finial spire (Emerald + Saffron + Gold)
    const spireBase = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.12, 0.22, 0.24, 16)),
      emeraldMat
    );
    spireBase.position.y = 3.06;
    pavilionGroup.add(spireBase);

    const spireMid = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.06, 0.11, 0.28, 16)),
      saffronMat
    );
    spireMid.position.y = 3.3;
    pavilionGroup.add(spireMid);

    const spireTip = new THREE.Mesh(
      trackGeo(new THREE.OctahedronGeometry(0.14, 0)),
      goldMat
    );
    spireTip.position.y = 3.6;
    pavilionGroup.add(spireTip);

    // 3. Surrounding Ward 65 Architectural Skyline Clusters (grounded on y=0)
    const towerMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x132f55,
        roughness: 0.52,
        metalness: 0.42,
      })
    );
    const towerRoofMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x1e4976,
        roughness: 0.35,
        metalness: 0.6,
      })
    );
    const glowWindowMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x7dd3fc,
        emissive: 0x38bdf8,
        emissiveIntensity: 0.9,
        roughness: 0.2,
        metalness: 0.4,
      })
    );
    const warmWindowMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xfde68a,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.8,
        roughness: 0.25,
        metalness: 0.35,
      })
    );

    const buildingConfigs = [
      { x: -3.2, z: -2.4, w: 0.9, d: 0.9, h: 2.3, warm: true },
      { x: -1.8, z: -3.6, w: 1.15, d: 0.95, h: 3.1, warm: false },
      { x: 0.2, z: -4.2, w: 1.0, d: 1.0, h: 2.6, warm: true },
      { x: 2.2, z: -3.7, w: 1.2, d: 1.0, h: 3.4, warm: false },
      { x: 3.7, z: -2.1, w: 0.95, d: 0.95, h: 2.5, warm: true },
      { x: 4.1, z: 0.4, w: 0.85, d: 1.1, h: 2.0, warm: false },
      { x: 3.2, z: 2.3, w: 0.9, d: 0.85, h: 1.7, warm: true },
      { x: -3.6, z: 0.8, w: 0.85, d: 0.85, h: 1.65, warm: false },
    ];

    for (const b of buildingConfigs) {
      const bGroup = new THREE.Group();
      bGroup.position.set(b.x, 0, b.z);

      const podium = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(b.w * 1.14, 0.22, b.d * 1.14)),
        stoneMat
      );
      podium.position.y = 0.11;
      bGroup.add(podium);

      const shaft = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(b.w, b.h, b.d)),
        towerMat
      );
      shaft.position.y = 0.22 + b.h / 2;
      shaft.castShadow = !isSoftwareGl;
      shaft.receiveShadow = !isSoftwareGl;
      bGroup.add(shaft);

      const crown = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(b.w * 0.72, 0.24, b.d * 0.72)),
        towerRoofMat
      );
      crown.position.y = 0.22 + b.h + 0.12;
      bGroup.add(crown);

      const accentBand = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(b.w * 1.02, 0.08, b.d * 1.02)),
        b.warm ? warmWindowMat : glowWindowMat
      );
      accentBand.position.y = 0.22 + b.h * 0.72;
      bGroup.add(accentBand);

      worldGroup.add(bGroup);
    }

    // 4. Orbital Civic Service Rings & Floating Nodes
    const orbitalGroup = new THREE.Group();
    orbitalGroup.position.set(0, 2.15, 0);
    worldGroup.add(orbitalGroup);

    const outerRing = new THREE.Mesh(
      trackGeo(new THREE.TorusGeometry(2.75, 0.032, 16, 84)),
      goldMat
    );
    outerRing.rotation.x = Math.PI * 0.42;
    outerRing.rotation.y = Math.PI * 0.12;
    orbitalGroup.add(outerRing);

    const innerRing = new THREE.Mesh(
      trackGeo(new THREE.TorusGeometry(2.15, 0.028, 16, 72)),
      emeraldMat
    );
    innerRing.rotation.x = -Math.PI * 0.36;
    innerRing.rotation.z = Math.PI * 0.18;
    orbitalGroup.add(innerRing);

    const orbitalNodes: THREE.Mesh[] = [];
    const nodeGeo = trackGeo(new THREE.OctahedronGeometry(0.11, 0));
    for (let i = 0; i < 6; i++) {
      const mat = i % 2 === 0 ? goldMat : emeraldMat;
      const node = new THREE.Mesh(nodeGeo, mat);
      orbitalNodes.push(node);
      orbitalGroup.add(node);
    }

    // 5. Instanced Ambient Civic Light Motes (single draw call)
    const moteCount = 68;
    const moteGeo = trackGeo(new THREE.OctahedronGeometry(0.045, 0));
    const moteMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0x38bdf8,
        emissiveIntensity: 0.75,
        roughness: 0.25,
        metalness: 0.5,
      })
    );
    const moteInstanced = new THREE.InstancedMesh(moteGeo, moteMat, moteCount);
    moteInstanced.frustumCulled = false;

    const moteSeeds: Array<{
      radius: number;
      angle: number;
      speed: number;
      yBase: number;
      amp: number;
      scale: number;
    }> = [];
    const palette = [0xfbbf24, 0x34d399, 0x38bdf8];

    for (let i = 0; i < moteCount; i++) {
      const seed = {
        radius: 1.5 + ((i * 37) % 100) * 0.048,
        angle: (i / moteCount) * Math.PI * 2,
        speed: 0.08 + ((i * 19) % 10) * 0.015,
        yBase: 0.4 + ((i * 53) % 100) * 0.038,
        amp: 0.18 + (i % 5) * 0.05,
        scale: 0.75 + (i % 4) * 0.22,
      };
      moteSeeds.push(seed);
      _baseColor.setHex(palette[i % palette.length]);
      moteInstanced.setColorAt(i, _baseColor);
    }
    if (moteInstanced.instanceColor) {
      moteInstanced.instanceColor.needsUpdate = true;
    }
    worldGroup.add(moteInstanced);

    const updateMotes = (elapsed: number) => {
      for (let i = 0; i < moteCount; i++) {
        const s = moteSeeds[i];
        const a = s.angle + elapsed * s.speed;
        _dummy.position.set(
          Math.cos(a) * s.radius,
          s.yBase + Math.sin(elapsed * 1.1 + i) * s.amp,
          Math.sin(a) * s.radius
        );
        _dummy.rotation.set(elapsed * 0.6 + i, elapsed * 0.8 + i, 0);
        _dummy.scale.setScalar(s.scale);
        _dummy.updateMatrix();
        moteInstanced.setMatrixAt(i, _dummy.matrix);
      }
      moteInstanced.instanceMatrix.needsUpdate = true;
    };

    const updateOrbits = (elapsed: number) => {
      outerRing.rotation.z = elapsed * 0.16;
      innerRing.rotation.y = -elapsed * 0.22;
      spireTip.rotation.y = elapsed * 0.9;
      spireTip.position.y = 3.6 + Math.sin(elapsed * 2.0) * 0.05;

      for (let i = 0; i < orbitalNodes.length; i++) {
        const angle = (i / orbitalNodes.length) * Math.PI * 2 + elapsed * 0.42;
        const r = i % 2 === 0 ? 2.75 : 2.15;
        orbitalNodes[i].position.set(
          Math.cos(angle) * r,
          Math.sin(angle * 2) * 0.42,
          Math.sin(angle) * r
        );
        orbitalNodes[i].rotation.y = elapsed * 1.2 + i;
      }
    };

    // Pre-warm shaders cleanly on GPU devices
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // ResizeObserver for crisp responsive aspect updates
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.max(entry.contentRect.width, 1);
        const h = Math.max(entry.contentRect.height, 1);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    });
    resizeObserver.observe(container);

    // Animation & software-WebGL paced loop
    const clock = new THREE.Clock();
    let frameId = 0;
    let disposed = false;

    function afterDraw(cb: () => void) {
      if (disposed) return;
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (gl && typeof gl.fenceSync === 'function') {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          if (disposed) {
            if (sync) gl.deleteSync(sync);
            return;
          }
          const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 5);
          } else {
            if (sync) gl.deleteSync(sync);
            frameId = window.setTimeout(cb, 80);
          }
        };
        frameId = window.setTimeout(poll, 5);
      } else {
        frameId = window.setTimeout(cb, 80);
      }
    }

    // Initialize positions at t=0
    updateMotes(0);
    updateOrbits(0);

    const tick = () => {
      if (disposed) return;
      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.getElapsedTime();

      const scrollFactor = reduceMotionRef.current
        ? 0
        : Math.min(1, Math.max(0, window.scrollY / 420));

      if (!reduceMotionRef.current) {
        updateMotes(elapsed);
        updateOrbits(elapsed);
        worldGroup.rotation.y =
          Math.sin(elapsed * 0.18) * 0.14 + scrollFactor * 0.35;
      }

      const px = pointerRef.current?.x ?? 0;
      const py = pointerRef.current?.y ?? 0;
      const targetCamX = baseCamPos.x + px * 0.85 - scrollFactor * 0.65;
      const targetCamY = baseCamPos.y - py * 0.45 + scrollFactor * 0.9;

      camera.position.x = THREE.MathUtils.damp(
        camera.position.x,
        targetCamX,
        3.5,
        delta
      );
      camera.position.y = THREE.MathUtils.damp(
        camera.position.y,
        targetCamY,
        3.5,
        delta
      );
      camera.lookAt(-0.7, 1.35, 0);

      renderer.render(scene, camera);

      if (reduceMotionRef.current) {
        return;
      }

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    if (reduceMotionRef.current) {
      renderer.render(scene, camera);
    } else if (isSoftwareGl) {
      afterDraw(tick);
    } else {
      frameId = window.requestAnimationFrame(tick);
    }

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(frameId);
      resizeObserver.disconnect();

      for (const g of geometries) g.dispose();
      for (const m of materials) m.dispose();
      for (const t of textures) t.dispose();
      envTarget.dispose();
      renderer.dispose();

      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [pointerRef]);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="w-full h-full pointer-events-none select-none"
    />
  );
}
