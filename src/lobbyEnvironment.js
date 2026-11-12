import * as THREE from "three";

export function buildLobbyEnvironment(scene) {
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x2a3245,
    roughness: 0.3,
    metalness: 0.4,
  });
  const floor = new THREE.Mesh(new THREE.CircleGeometry(40, 64), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const ringMat = new THREE.MeshStandardMaterial({
    color: 0xc9a84c,
    roughness: 0.25,
    metalness: 0.7,
    emissive: 0x332200,
    emissiveIntensity: 0.5,
  });
  const ring = new THREE.Mesh(new THREE.RingGeometry(4.2, 4.8, 64), ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.01;
  scene.add(ring);

  const innerRing = new THREE.Mesh(
    new THREE.RingGeometry(3.5, 3.7, 64),
    new THREE.MeshBasicMaterial({ color: 0x4a9eff, transparent: true, opacity: 0.6 })
  );
  innerRing.rotation.x = -Math.PI / 2;
  innerRing.position.y = 0.015;
  scene.add(innerRing);

  const pillarMat = new THREE.MeshStandardMaterial({ color: 0x3a4560, roughness: 0.4, metalness: 0.5 });
  const capMat = new THREE.MeshStandardMaterial({ color: 0xc9a84c, roughness: 0.2, metalness: 0.8 });
  const pillarCount = 8;
  const pillarRadius = 12;
  for (let i = 0; i < pillarCount; i++) {
    const a = (i / pillarCount) * Math.PI * 2;
    const x = Math.cos(a) * pillarRadius;
    const z = Math.sin(a) * pillarRadius;

    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.7, 10, 16), pillarMat);
    pillar.position.set(x, 5, z);
    pillar.castShadow = true;
    pillar.receiveShadow = true;
    scene.add(pillar);

    const cap = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.5, 1.8), capMat);
    cap.position.set(x, 10.2, z);
    cap.castShadow = true;
    scene.add(cap);

    const base = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.4, 1.8), capMat);
    base.position.set(x, 0.2, z);
    scene.add(base);

    const orb = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 16, 12),
      new THREE.MeshStandardMaterial({
        color: 0x4a9eff,
        emissive: 0x2a6eff,
        emissiveIntensity: 1.5,
        roughness: 0.2,
      })
    );
    orb.position.set(x, 11.2, z);
    scene.add(orb);
  }

  const archMat = new THREE.MeshStandardMaterial({ color: 0x2a3550, roughness: 0.5, metalness: 0.3 });
  for (let i = 0; i < pillarCount; i++) {
    const a1 = (i / pillarCount) * Math.PI * 2;
    const a2 = ((i + 1) / pillarCount) * Math.PI * 2;
    const x1 = Math.cos(a1) * pillarRadius;
    const z1 = Math.sin(a1) * pillarRadius;
    const x2 = Math.cos(a2) * pillarRadius;
    const z2 = Math.sin(a2) * pillarRadius;
    const midX = (x1 + x2) / 2;
    const midZ = (z1 + z2) / 2;
    const dist = Math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2);

    const arch = new THREE.Mesh(new THREE.BoxGeometry(dist * 0.95, 1.2, 0.6), archMat);
    arch.position.set(midX, 10.6, midZ);
    arch.lookAt(0, 10.6, 0);
    arch.castShadow = true;
    scene.add(arch);
  }

  const mistParticles = createMist(scene);
  const floatingOrbs = createFloatingOrbs(scene);

  const farMountains = createDistantMountains(scene);

  const stars = createStars(scene);

  return { mistParticles, floatingOrbs, farMountains, stars };
}

function createMist(scene) {
  const count = 60;
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const offsets = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 6 + Math.random() * 30;
    positions[i * 3] = Math.cos(a) * r;
    positions[i * 3 + 1] = Math.random() * 3 + 0.5;
    positions[i * 3 + 2] = Math.sin(a) * r;
    offsets[i] = Math.random() * Math.PI * 2;
  }
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("offset", new THREE.BufferAttribute(offsets, 1));

  const mat = new THREE.PointsMaterial({
    color: 0x6a8aaa,
    size: 3,
    transparent: true,
    opacity: 0.3,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geo, mat);
  scene.add(points);
  return points;
}

function createFloatingOrbs(scene) {
  const orbs = [];
  const orbMat = new THREE.MeshStandardMaterial({
    color: 0x4a9eff,
    emissive: 0x2a6eff,
    emissiveIntensity: 2,
    roughness: 0.2,
  });
  for (let i = 0; i < 12; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 8 + Math.random() * 20;
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), orbMat.clone());
    orb.position.set(Math.cos(a) * r, 2 + Math.random() * 6, Math.sin(a) * r);
    orb.userData = { baseY: orb.position.y, speed: 0.5 + Math.random(), phase: Math.random() * Math.PI * 2 };
    scene.add(orb);
    orbs.push(orb);
  }
  return orbs;
}

function createDistantMountains(scene) {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0x1a2540, roughness: 0.9, metalness: 0 });
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const r = 70 + Math.random() * 20;
    const h = 15 + Math.random() * 25;
    const mountain = new THREE.Mesh(new THREE.ConeGeometry(8 + Math.random() * 6, h, 5), mat);
    mountain.position.set(Math.cos(a) * r, h / 2 - 2, Math.sin(a) * r);
    mountain.rotation.y = Math.random() * Math.PI;
    group.add(mountain);
  }
  scene.add(group);
  return group;
}

function createStars(scene) {
  const count = 300;
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const elev = Math.random() * Math.PI * 0.5;
    const r = 150;
    positions[i * 3] = Math.cos(a) * Math.cos(elev) * r;
    positions[i * 3 + 1] = Math.sin(elev) * r + 20;
    positions[i * 3 + 2] = Math.sin(a) * Math.cos(elev) * r;
  }
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.6, transparent: true, opacity: 0.8 });
  const stars = new THREE.Points(geo, mat);
  scene.add(stars);
  return stars;
}
