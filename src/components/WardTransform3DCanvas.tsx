'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

interface WardTransform3DCanvasProps {
  progressRef: React.MutableRefObject<number>;
  pointerRef: React.MutableRefObject<{ x: number; y: number }>;
  reduceMotion?: boolean | null;
}

const _dummy = new THREE.Object3D();
const _color = new THREE.Color();

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function createGroundPlazaTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#091f3a';
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.1)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i <= 512; i += 32) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 512);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(512, i);
      ctx.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(8, 5);
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export function WardTransform3DCanvas({
  progressRef,
  pointerRef,
  reduceMotion = false,
}: WardTransform3DCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const reduceMotionRef = useRef<boolean>(Boolean(reduceMotion));

  useEffect(() => {
    reduceMotionRef.current = Boolean(reduceMotion);
  }, [reduceMotion]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = Math.max(container.clientWidth, 320);
    const height = Math.max(container.clientHeight, 300);

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
        alpha: false,
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
    scene.background = new THREE.Color('#071a33');
    scene.fog = new THREE.FogExp2('#071a33', 0.036);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 90);
    camera.position.set(-2.4, 2.9, 8.8);
    camera.lookAt(0, 1.0, -0.8);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

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

    // 3-Point Warm/Cool Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x091a30, 0.95);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfef3c7, 1.9);
    keyLight.position.set(8, 13, 9);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.left = -12;
    keyLight.shadow.camera.right = 12;
    keyLight.shadow.camera.top = 10;
    keyLight.shadow.camera.bottom = -10;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 32;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x34d399, 1.1);
    rimLight.position.set(-9, 6, -7);
    scene.add(rimLight);

    // Continuous Ground Plane (extends seamlessly into horizon fog)
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const groundTex = createGroundPlazaTexture(maxAniso);
    textures.push(groundTex);

    const baseGround = new THREE.Mesh(
      trackGeo(new THREE.PlaneGeometry(56, 36)),
      trackMat(
        new THREE.MeshStandardMaterial({
          map: groundTex,
          roughness: 0.85,
          metalness: 0.12,
        })
      )
    );
    baseGround.rotation.x = -Math.PI / 2;
    baseGround.receiveShadow = !isSoftwareGl;
    scene.add(baseGround);

    // 1. Sequential Road Surface Tiles (transition from dusty unpaved -> clean paved avenue)
    const roadSegmentsCount = 10;
    const segWidth = 1.72;
    const roadSegGeo = trackGeo(new THREE.BoxGeometry(segWidth, 0.06, 2.7));
    const laneStripeGeo = trackGeo(new THREE.BoxGeometry(0.85, 0.02, 0.1));
    const laneStripeMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        emissive: 0xe2e8f0,
        emissiveIntensity: 0.18,
        roughness: 0.4,
        metalness: 0.05,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      })
    );

    const dustyColor = new THREE.Color('#5a5043');
    const cleanAsphaltColor = new THREE.Color('#1a283d');
    const roadSegments: Array<{
      x: number;
      mat: THREE.MeshStandardMaterial;
      stripe: THREE.Mesh;
    }> = [];

    for (let i = 0; i < roadSegmentsCount; i++) {
      const x = -7.74 + i * segWidth;
      const mat = trackMat(
        new THREE.MeshStandardMaterial({
          color: dustyColor.clone(),
          roughness: 0.92,
          metalness: 0.05,
        })
      );
      const tile = new THREE.Mesh(roadSegGeo, mat);
      tile.position.set(x, 0.03, 0);
      tile.receiveShadow = !isSoftwareGl;
      scene.add(tile);

      const stripe = new THREE.Mesh(laneStripeGeo, laneStripeMat);
      stripe.position.set(x, 0.072, 0);
      stripe.scale.set(0.01, 1, 0.01);
      scene.add(stripe);

      roadSegments.push({ x, mat, stripe });
    }

    // 2. Stormwater Drainage Channels & Clean Pedestrian Footpaths (North & South curbs)
    const footpathMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x334155,
        roughness: 0.55,
        metalness: 0.18,
      })
    );
    const kerbTrimMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x15803d,
        emissive: 0x10b981,
        emissiveIntensity: 0.22,
        roughness: 0.35,
        metalness: 0.3,
      })
    );
    const grateMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        roughness: 0.32,
        metalness: 0.82,
      })
    );

    const curbGroup = new THREE.Group();
    scene.add(curbGroup);

    const northWalk = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(18.0, 0.14, 1.35)),
      footpathMat
    );
    northWalk.position.set(0, 0.07, -2.08);
    northWalk.receiveShadow = !isSoftwareGl;
    curbGroup.add(northWalk);

    const southWalk = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(18.0, 0.14, 1.2)),
      footpathMat
    );
    southWalk.position.set(0, 0.07, 2.0);
    southWalk.receiveShadow = !isSoftwareGl;
    curbGroup.add(southWalk);

    const northKerb = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(18.0, 0.16, 0.12)),
      kerbTrimMat
    );
    northKerb.position.set(0, 0.08, -1.4);
    curbGroup.add(northKerb);

    const southKerb = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(18.0, 0.16, 0.12)),
      kerbTrimMat
    );
    southKerb.position.set(0, 0.08, 1.4);
    curbGroup.add(southKerb);

    // Storm drain grates along both curbs
    const grateGeo = trackGeo(new THREE.BoxGeometry(0.45, 0.03, 0.24));
    const grateMesh = new THREE.InstancedMesh(grateGeo, grateMat, 12);
    for (let i = 0; i < 6; i++) {
      const gx = -6.5 + i * 2.6;
      _dummy.position.set(gx, 0.068, -1.25);
      _dummy.rotation.set(0, 0, 0);
      _dummy.scale.set(1, 1, 1);
      _dummy.updateMatrix();
      grateMesh.setMatrixAt(i, _dummy.matrix);

      _dummy.position.set(gx, 0.068, 1.25);
      _dummy.updateMatrix();
      grateMesh.setMatrixAt(6 + i, _dummy.matrix);
    }
    grateMesh.computeBoundingSphere();
    curbGroup.add(grateMesh);

    // 3. Composite 8-Part Municipal Sweeper & Sanitation Truck (grounded at y=0)
    const sweeperGroup = new THREE.Group();
    sweeperGroup.position.set(-8.6, 0, 0.28);
    scene.add(sweeperGroup);

    const chassisMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.6,
        metalness: 0.65,
      })
    );
    const cabMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        roughness: 0.28,
        metalness: 0.2,
      })
    );
    const tankMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x15803d,
        roughness: 0.35,
        metalness: 0.3,
      })
    );
    const glassMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.35,
        roughness: 0.12,
        metalness: 0.85,
      })
    );
    const tireMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.88,
        metalness: 0.08,
      })
    );
    const brushMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        roughness: 0.55,
        metalness: 0.25,
      })
    );
    const beaconMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xfbbf24,
        emissiveIntensity: 1.4,
        roughness: 0.2,
        metalness: 0.4,
      })
    );

    // Truck Chassis
    const truckChassis = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(2.15, 0.2, 0.95)),
      chassisMat
    );
    truckChassis.position.set(0, 0.34, 0);
    truckChassis.castShadow = !isSoftwareGl;
    sweeperGroup.add(truckChassis);

    // Truck Cab & Windshield
    const truckCab = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.75, 0.72, 0.9)),
      cabMat
    );
    truckCab.position.set(0.68, 0.8, 0);
    truckCab.castShadow = !isSoftwareGl;
    sweeperGroup.add(truckCab);

    const windshield = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.12, 0.34, 0.78)),
      glassMat
    );
    windshield.position.set(1.03, 0.88, 0);
    sweeperGroup.add(windshield);

    // Sanitation / Water Compactor Tank + Gold Civic Band
    const truckTank = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(1.28, 0.82, 0.92)),
      tankMat
    );
    truckTank.position.set(-0.38, 0.85, 0);
    truckTank.castShadow = !isSoftwareGl;
    sweeperGroup.add(truckTank);

    const tankStripe = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(1.3, 0.12, 0.95)),
      brushMat
    );
    tankStripe.position.set(-0.38, 0.86, 0);
    sweeperGroup.add(tankStripe);

    // Amber Roof Beacon
    const roofBeacon = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.1, 0.12, 0.14, 12)),
      beaconMat
    );
    roofBeacon.position.set(0.68, 1.23, 0);
    sweeperGroup.add(roofBeacon);

    // 4 Spinning Wheels
    const wheelGeo = trackGeo(new THREE.CylinderGeometry(0.24, 0.24, 0.16, 18));
    const hubGeo = trackGeo(new THREE.CylinderGeometry(0.11, 0.11, 0.18, 12));
    const truckWheels: THREE.Group[] = [];
    const wheelOffsets: Array<[number, number]> = [
      [0.65, 0.48],
      [0.65, -0.48],
      [-0.65, 0.48],
      [-0.65, -0.48],
    ];
    for (const [wx, wz] of wheelOffsets) {
      const wGroup = new THREE.Group();
      wGroup.position.set(wx, 0.24, wz);
      const tire = new THREE.Mesh(wheelGeo, tireMat);
      tire.rotation.x = Math.PI / 2;
      wGroup.add(tire);
      const hub = new THREE.Mesh(hubGeo, grateMat);
      hub.rotation.x = Math.PI / 2;
      wGroup.add(hub);
      sweeperGroup.add(wGroup);
      truckWheels.push(wGroup);
    }

    // 2 Rotating Front Sweeper Brushes
    const brushGeo = trackGeo(new THREE.CylinderGeometry(0.22, 0.26, 0.12, 12));
    const sweeperBrushes: THREE.Mesh[] = [];
    for (const bz of [-0.46, 0.46]) {
      const brush = new THREE.Mesh(brushGeo, brushMat);
      brush.position.set(1.12, 0.11, bz);
      sweeperGroup.add(brush);
      sweeperBrushes.push(brush);
    }

    // 4. Roadside Litter & Debris (InstancedMesh, swept away as truck passes)
    const litterCount = 56;
    const litterGeo = trackGeo(new THREE.DodecahedronGeometry(0.085, 0));
    const litterMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.75,
        metalness: 0.08,
      })
    );
    const litterMesh = new THREE.InstancedMesh(litterGeo, litterMat, litterCount);
    litterMesh.frustumCulled = false;

    const litterData: Array<{
      x: number;
      z: number;
      scale: number;
      rot: number;
    }> = [];
    const litterPalette = [0xd97706, 0x94a3b8, 0x78716c, 0xca8a04];

    for (let i = 0; i < litterCount; i++) {
      const lx = -7.6 + (i / (litterCount - 1)) * 15.2;
      const side = i % 2 === 0 ? -1 : 1;
      const lz = side * (0.72 + ((i * 29) % 10) * 0.055);
      const scale = 0.72 + (i % 4) * 0.22;
      const rot = (i * 1.37) % (Math.PI * 2);
      litterData.push({ x: lx, z: lz, scale, rot });
      _color.setHex(litterPalette[i % litterPalette.length]);
      litterMesh.setColorAt(i, _color);
    }
    if (litterMesh.instanceColor) {
      litterMesh.instanceColor.needsUpdate = true;
    }
    scene.add(litterMesh);

    // 5. Water Mist Spray Droplets trailing sweeper (InstancedMesh)
    const mistCount = 30;
    const mistGeo = trackGeo(new THREE.SphereGeometry(0.045, 8, 8));
    const mistMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x7dd3fc,
        emissive: 0x38bdf8,
        emissiveIntensity: 0.65,
        roughness: 0.2,
        metalness: 0.2,
      })
    );
    const mistMesh = new THREE.InstancedMesh(mistGeo, mistMat, mistCount);
    mistMesh.frustumCulled = false;
    scene.add(mistMesh);

    // 6. Composite 5-Part Ward 65 Architectural Buildings (North Avenue, grounded y=0)
    const buildingConfigs = [
      { x: -6.8, z: -4.2, w: 1.75, d: 1.5, h: 2.7, warm: true },
      { x: -4.1, z: -4.5, w: 2.0, d: 1.6, h: 3.6, warm: false },
      { x: -1.2, z: -4.3, w: 2.2, d: 1.7, h: 4.1, warm: true },
      { x: 1.8, z: -4.5, w: 1.95, d: 1.6, h: 3.4, warm: false },
      { x: 4.5, z: -4.2, w: 2.1, d: 1.65, h: 3.9, warm: true },
      { x: 7.1, z: -4.4, w: 1.7, d: 1.5, h: 2.9, warm: false },
    ];

    const plinthMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.72,
        metalness: 0.2,
      })
    );
    const bldgBodyMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x163864,
        roughness: 0.45,
        metalness: 0.35,
      })
    );
    const bldgCrownMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x25538f,
        roughness: 0.32,
        metalness: 0.55,
      })
    );
    const solarPanelMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x0ea5e9,
        roughness: 0.18,
        metalness: 0.85,
      })
    );

    const buildings: Array<{
      riseGroup: THREE.Group;
      windowMat: THREE.MeshStandardMaterial;
      delay: number;
    }> = [];

    for (let i = 0; i < buildingConfigs.length; i++) {
      const cfg = buildingConfigs[i];
      const baseGroup = new THREE.Group();
      baseGroup.position.set(cfg.x, 0, cfg.z);
      scene.add(baseGroup);

      // Fixed construction plinth
      const plinth = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(cfg.w * 1.12, 0.22, cfg.d * 1.12)),
        plinthMat
      );
      plinth.position.y = 0.11;
      baseGroup.add(plinth);

      // Telescoping rising architectural superstructure (pivot at y=0.22)
      const riseGroup = new THREE.Group();
      riseGroup.position.y = 0.22;
      baseGroup.add(riseGroup);

      const shaft = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(cfg.w, cfg.h, cfg.d)),
        bldgBodyMat
      );
      shaft.position.y = cfg.h / 2;
      shaft.castShadow = !isSoftwareGl;
      shaft.receiveShadow = !isSoftwareGl;
      riseGroup.add(shaft);

      const crown = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(cfg.w * 0.84, 0.26, cfg.d * 0.84)),
        bldgCrownMat
      );
      crown.position.y = cfg.h + 0.13;
      riseGroup.add(crown);

      const solarUnit = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(cfg.w * 0.55, 0.08, cfg.d * 0.5)),
        solarPanelMat
      );
      solarUnit.position.y = cfg.h + 0.3;
      solarUnit.rotation.x = 0.18;
      riseGroup.add(solarUnit);

      const winMat = trackMat(
        new THREE.MeshStandardMaterial({
          color: cfg.warm ? 0xfde68a : 0x7dd3fc,
          emissive: cfg.warm ? 0xf59e0b : 0x38bdf8,
          emissiveIntensity: 0.05,
          roughness: 0.25,
          metalness: 0.4,
        })
      );

      for (const frac of [0.32, 0.58, 0.82]) {
        const band = new THREE.Mesh(
          trackGeo(new THREE.BoxGeometry(cfg.w * 1.02, 0.11, cfg.d * 1.02)),
          winMat
        );
        band.position.y = cfg.h * frac;
        riseGroup.add(band);
      }

      buildings.push({
        riseGroup,
        windowMat: winMat,
        delay: i * 0.045,
      });
    }

    // 7. Composite 4-Part Solar/LED Street Lights (8 lamps along North & South curbs)
    const poleMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xcbd5e1,
        roughness: 0.32,
        metalness: 0.82,
      })
    );
    const streetLights: Array<{
      group: THREE.Group;
      bulbMat: THREE.MeshStandardMaterial;
      poolMat: THREE.MeshBasicMaterial;
      delay: number;
    }> = [];

    const lightXs = [-6.2, -2.1, 2.1, 6.2];
    for (let i = 0; i < lightXs.length; i++) {
      for (const side of [-1, 1] as const) {
        const lx = lightXs[i];
        const lz = side === -1 ? -1.52 : 1.52;
        const lGroup = new THREE.Group();
        lGroup.position.set(lx, 0.14, lz);
        scene.add(lGroup);

        const poleBase = new THREE.Mesh(
          trackGeo(new THREE.CylinderGeometry(0.08, 0.11, 0.18, 12)),
          chassisMat
        );
        poleBase.position.y = 0.09;
        lGroup.add(poleBase);

        const pole = new THREE.Mesh(
          trackGeo(new THREE.CylinderGeometry(0.04, 0.055, 2.05, 12)),
          poleMat
        );
        pole.position.y = 1.02;
        pole.castShadow = !isSoftwareGl;
        lGroup.add(pole);

        const armDir = side === -1 ? 1 : -1;
        const arm = new THREE.Mesh(
          trackGeo(new THREE.BoxGeometry(0.05, 0.05, 0.46)),
          poleMat
        );
        arm.position.set(0, 2.04, armDir * 0.22);
        lGroup.add(arm);

        const bulbMat = trackMat(
          new THREE.MeshStandardMaterial({
            color: 0xfef9c3,
            emissive: 0xfbbf24,
            emissiveIntensity: 0.0,
            roughness: 0.2,
            metalness: 0.2,
          })
        );
        const bulb = new THREE.Mesh(
          trackGeo(new THREE.BoxGeometry(0.16, 0.06, 0.22)),
          bulbMat
        );
        bulb.position.set(0, 2.0, armDir * 0.42);
        lGroup.add(bulb);

        const poolMat = trackMat(
          new THREE.MeshBasicMaterial({
            color: 0xfde68a,
            transparent: true,
            opacity: 0,
            depthWrite: false,
          })
        );
        const lightPool = new THREE.Mesh(
          trackGeo(new THREE.CircleGeometry(0.85, 24)),
          poolMat
        );
        lightPool.rotation.x = -Math.PI / 2;
        lightPool.position.set(0, -0.05, armDir * 0.45);
        lGroup.add(lightPool);

        streetLights.push({
          group: lGroup,
          bulbMat,
          poolMat,
          delay: i * 0.06 + (side === 1 ? 0.025 : 0),
        });
      }
    }

    // 8. Composite 3-Part Avenue Trees (12 trees blooming in Stage 4)
    const trunkMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x78350f,
        roughness: 0.88,
        metalness: 0.05,
      })
    );
    const leafMat1 = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x15803d,
        roughness: 0.65,
        metalness: 0.08,
      })
    );
    const leafMat2 = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x22c55e,
        roughness: 0.58,
        metalness: 0.08,
      })
    );

    const trees: Array<{ group: THREE.Group; delay: number; maxScale: number }> =
      [];
    const treePositions: Array<[number, number]> = [
      [-7.6, -2.55],
      [-5.1, -2.55],
      [-2.8, -2.55],
      [0.0, -2.55],
      [2.8, -2.55],
      [5.2, -2.55],
      [7.6, -2.55],
      [-6.5, 2.45],
      [-3.5, 2.45],
      [0.0, 2.45],
      [3.5, 2.45],
      [6.5, 2.45],
    ];

    for (let i = 0; i < treePositions.length; i++) {
      const [tx, tz] = treePositions[i];
      const tGroup = new THREE.Group();
      tGroup.position.set(tx, 0.14, tz);
      scene.add(tGroup);

      const trunk = new THREE.Mesh(
        trackGeo(new THREE.CylinderGeometry(0.06, 0.09, 0.68, 8)),
        trunkMat
      );
      trunk.position.y = 0.34;
      trunk.castShadow = !isSoftwareGl;
      tGroup.add(trunk);

      const crown1 = new THREE.Mesh(
        trackGeo(new THREE.DodecahedronGeometry(0.42, 1)),
        i % 2 === 0 ? leafMat1 : leafMat2
      );
      crown1.position.y = 0.86;
      crown1.castShadow = !isSoftwareGl;
      tGroup.add(crown1);

      const crown2 = new THREE.Mesh(
        trackGeo(new THREE.DodecahedronGeometry(0.3, 1)),
        i % 2 === 0 ? leafMat2 : leafMat1
      );
      crown2.position.set(0.08, 1.18, 0.04);
      crown2.castShadow = !isSoftwareGl;
      tGroup.add(crown2);

      trees.push({
        group: tGroup,
        delay: (i % 6) * 0.045,
        maxScale: 0.88 + (i % 3) * 0.14,
      });
    }

    // 9. Clean-City Ambient Energy Motes (InstancedMesh)
    const moteCount = 44;
    const moteGeo = trackGeo(new THREE.OctahedronGeometry(0.05, 0));
    const moteMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0x34d399,
        emissiveIntensity: 0.85,
        roughness: 0.25,
        metalness: 0.4,
      })
    );
    const moteMesh = new THREE.InstancedMesh(moteGeo, moteMat, moteCount);
    moteMesh.frustumCulled = false;
    const motePalette = [0x34d399, 0xfbbf24, 0x38bdf8];
    for (let i = 0; i < moteCount; i++) {
      _color.setHex(motePalette[i % motePalette.length]);
      moteMesh.setColorAt(i, _color);
    }
    if (moteMesh.instanceColor) {
      moteMesh.instanceColor.needsUpdate = true;
    }
    scene.add(moteMesh);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

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

    const clock = new THREE.Clock();
    let frameId = 0;
    let disposed = false;
    let smoothedProgress = progressRef.current;

    const applyStageState = (p: number, elapsed: number) => {
      // Sweeper truck drives from x = -8.6 to x = +8.6 across p = 0.02 -> 0.56
      const driveT = smoothstep(0.02, 0.56, p);
      const truckX = -8.6 + driveT * 17.2;
      sweeperGroup.position.x = truckX;

      const isSweeping = p > 0.01 && p < 0.58;
      const wheelRot = -driveT * 28.0;
      for (const w of truckWheels) {
        w.rotation.z = wheelRot;
      }
      for (let i = 0; i < sweeperBrushes.length; i++) {
        sweeperBrushes[i].rotation.y =
          (isSweeping ? elapsed * 8.0 : 0) + driveT * 18.0;
      }
      roofBeacon.rotation.y = elapsed * 4.5;

      // Road segments transition cleanly from dusty -> paved right as truck passes
      for (const seg of roadSegments) {
        const cleanT = smoothstep(seg.x - 1.1, seg.x + 0.6, truckX);
        seg.mat.color.copy(dustyColor).lerp(cleanAsphaltColor, cleanT);
        seg.mat.roughness = 0.92 - cleanT * 0.3;
        const stripeT = smoothstep(0.2, 0.55, p) * cleanT;
        seg.stripe.scale.set(Math.max(0.01, stripeT), 1, Math.max(0.01, stripeT));
      }

      // Roadside litter gets swept away as truck passes each piece
      for (let i = 0; i < litterCount; i++) {
        const item = litterData[i];
        const cleared = smoothstep(item.x - 0.4, item.x + 0.45, truckX);
        const s = item.scale * (1 - cleared);
        _dummy.position.set(
          item.x,
          0.06 + cleared * 0.14,
          item.z * (1 - cleared * 0.45)
        );
        _dummy.rotation.set(item.rot, item.rot + cleared * 2.5, 0);
        _dummy.scale.setScalar(Math.max(0.0001, s));
        _dummy.updateMatrix();
        litterMesh.setMatrixAt(i, _dummy.matrix);
      }
      litterMesh.instanceMatrix.needsUpdate = true;

      // Water mist spray trailing the rotary brushes
      const mistActive = p > 0.03 && p < 0.57 ? 1 : 0;
      for (let i = 0; i < mistCount; i++) {
        if (!mistActive) {
          _dummy.scale.setScalar(0.0001);
          _dummy.position.set(0, -5, 0);
        } else {
          const cycle = ((elapsed * 1.9 + i * 0.13) % 1 + 1) % 1;
          const side = i % 2 === 0 ? 1 : -1;
          _dummy.position.set(
            truckX + 0.95 - cycle * 1.5,
            0.12 + Math.sin(cycle * Math.PI) * 0.32,
            0.28 + side * (0.42 + cycle * 0.32)
          );
          _dummy.scale.setScalar((1 - cycle) * 1.15);
        }
        _dummy.updateMatrix();
        mistMesh.setMatrixAt(i, _dummy.matrix);
      }
      mistMesh.instanceMatrix.needsUpdate = true;

      // Drainage & sidewalks rise smoothly into place
      const curbT = smoothstep(0.18, 0.52, p);
      curbGroup.position.y = -0.15 * (1 - curbT);

      // Ward buildings rise and illuminate windows
      for (const b of buildings) {
        const bT = smoothstep(0.32 + b.delay, 0.72 + b.delay, p);
        b.riseGroup.scale.y = 0.08 + bT * 0.92;
        b.windowMat.emissiveIntensity = 0.04 + smoothstep(0.45, 0.8, p) * 0.92;
      }

      // LED Street lights rise & illuminate
      for (const l of streetLights) {
        const lT = smoothstep(0.42 + l.delay, 0.72 + l.delay, p);
        l.group.scale.y = 0.05 + lT * 0.95;
        const glowT = smoothstep(0.54 + l.delay, 0.82 + l.delay, p);
        l.bulbMat.emissiveIntensity = glowT * 1.8;
        l.poolMat.opacity = glowT * 0.22;
      }

      // Green trees bloom along footpaths
      for (const tree of trees) {
        const tT = smoothstep(0.58 + tree.delay, 0.92 + tree.delay, p);
        const s = Math.max(0.05, tT * tree.maxScale);
        tree.group.scale.set(s, s, s);
      }

      // Clean-air floating motes appear in later half
      const moteAlpha = smoothstep(0.5, 0.88, p);
      for (let i = 0; i < moteCount; i++) {
        if (moteAlpha <= 0.01) {
          _dummy.scale.setScalar(0.0001);
          _dummy.position.set(0, -5, 0);
        } else {
          const mx = -7.5 + ((i * 37) % 150) * 0.1;
          const mz = -3.0 + ((i * 53) % 60) * 0.1;
          const my =
            0.6 + ((elapsed * 0.45 + i * 0.23) % 3.2) + Math.sin(elapsed + i) * 0.15;
          _dummy.position.set(mx, my, mz);
          _dummy.rotation.set(elapsed + i, elapsed * 0.7 + i, 0);
          _dummy.scale.setScalar(moteAlpha * (0.7 + (i % 3) * 0.25));
        }
        _dummy.updateMatrix();
        moteMesh.setMatrixAt(i, _dummy.matrix);
      }
      moteMesh.instanceMatrix.needsUpdate = true;
    };

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

    const tick = () => {
      if (disposed) return;
      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.getElapsedTime();

      const targetP = Math.max(0, Math.min(1, progressRef.current));
      if (reduceMotionRef.current) {
        smoothedProgress = targetP;
      } else {
        smoothedProgress = THREE.MathUtils.damp(
          smoothedProgress,
          targetP,
          5.5,
          delta
        );
      }

      applyStageState(smoothedProgress, elapsed);

      // Scroll-choreographed camera sweep + pointer parallax
      const px = pointerRef.current?.x ?? 0;
      const py = pointerRef.current?.y ?? 0;

      const camTargetX =
        THREE.MathUtils.lerp(-2.5, 1.5, smoothedProgress) + px * 0.9;
      const camTargetY =
        THREE.MathUtils.lerp(2.7, 4.7, smoothedProgress) - py * 0.45;
      const camTargetZ = THREE.MathUtils.lerp(8.4, 11.2, smoothedProgress);

      if (reduceMotionRef.current) {
        camera.position.set(camTargetX, camTargetY, camTargetZ);
      } else {
        camera.position.x = THREE.MathUtils.damp(
          camera.position.x,
          camTargetX,
          4.2,
          delta
        );
        camera.position.y = THREE.MathUtils.damp(
          camera.position.y,
          camTargetY,
          4.2,
          delta
        );
        camera.position.z = THREE.MathUtils.damp(
          camera.position.z,
          camTargetZ,
          4.2,
          delta
        );
      }
      camera.lookAt(
        THREE.MathUtils.lerp(-1.2, 0.2, smoothedProgress),
        THREE.MathUtils.lerp(0.85, 1.35, smoothedProgress),
        -0.8
      );

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    applyStageState(smoothedProgress, 0);
    if (isSoftwareGl) {
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
  }, [progressRef, pointerRef]);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="w-full h-full pointer-events-none select-none"
    />
  );
}
