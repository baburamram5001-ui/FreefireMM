import * as THREE from "three";

export function makeCharacter(scene) {
  const group = new THREE.Group();
  scene.add(group);

  const skin = new THREE.MeshStandardMaterial({ color: 0xf2c9a0, roughness: 0.65, metalness: 0.0 });
  const armor = new THREE.MeshStandardMaterial({ color: 0x1a4d7a, roughness: 0.35, metalness: 0.4 });
  const armorTrim = new THREE.MeshStandardMaterial({ color: 0xc9a84c, roughness: 0.3, metalness: 0.6 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x1a1f28, roughness: 0.6, metalness: 0.2 });
  const hair = new THREE.MeshStandardMaterial({ color: 0x2a1a10, roughness: 0.5, metalness: 0.0 });

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.45, 0.72, 6, 16), armor);
  torso.position.y = 1.55;
  torso.castShadow = true;
  group.add(torso);

  const chestPlate = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.55, 0.5), armorTrim);
  chestPlate.position.set(0, 1.68, 0.26);
  chestPlate.castShadow = true;
  group.add(chestPlate);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 24, 20), skin);
  head.position.y = 2.25;
  head.castShadow = true;
  group.add(head);

  const hairMesh = new THREE.Mesh(new THREE.SphereGeometry(0.33, 24, 20, 0, Math.PI * 2, 0, Math.PI * 0.58), hair);
  hairMesh.position.y = 2.3;
  hairMesh.castShadow = true;
  group.add(hairMesh);

  const leftArm = makeLimb(0.16, 0.66, armor, skin);
  leftArm.position.set(-0.58, 1.72, 0);
  group.add(leftArm);

  const rightArm = makeLimb(0.16, 0.66, armor, skin);
  rightArm.position.set(0.58, 1.72, 0);
  group.add(rightArm);

  const leftLeg = makeLimb(0.22, 0.8, dark, null);
  leftLeg.position.set(-0.24, 0.78, 0);
  group.add(leftLeg);

  const rightLeg = makeLimb(0.22, 0.8, dark, null);
  rightLeg.position.set(0.24, 0.78, 0);
  group.add(rightLeg);

  const cape = new THREE.Mesh(
    new THREE.PlaneGeometry(0.9, 1.4),
    new THREE.MeshStandardMaterial({ color: 0x8b1a1a, roughness: 0.7, side: THREE.DoubleSide })
  );
  cape.position.set(0, 1.5, -0.35);
  cape.rotation.x = 0.12;
  cape.castShadow = true;
  group.add(cape);

  const mixer = new THREE.AnimationMixer(group);
  const idleClip = makeIdleClip();
  const idleAction = mixer.clipAction(idleClip);
  idleAction.weight = 1;
  idleAction.play();

  return { group, mixer, idleAction, parts: { leftArm, rightArm, cape } };
}

function makeLimb(radius, length, mainMat, tipMat) {
  const pivot = new THREE.Group();
  const upper = new THREE.Mesh(new THREE.CapsuleGeometry(radius, length * 0.6, 4, 12), mainMat);
  upper.position.y = -length * 0.4;
  upper.castShadow = true;
  pivot.add(upper);
  if (tipMat) {
    const tip = new THREE.Mesh(new THREE.SphereGeometry(radius * 1.05, 12, 10), tipMat);
    tip.position.y = -length * 0.78;
    tip.castShadow = true;
    pivot.add(tip);
  }
  return pivot;
}

function makeIdleClip() {
  const times = [0, 1.5, 3.0];
  const tracks = [
    new THREE.VectorKeyframeTrack("leftArm.rotation.x", times, [0, 0.08, 0]),
    new THREE.VectorKeyframeTrack("rightArm.rotation.x", times, [0, -0.08, 0]),
    new THREE.VectorKeyframeTrack(".position", [0, 1.5, 3.0], [0, 0, 0, 0, 0.04, 0, 0, 0, 0]),
  ];
  return new THREE.AnimationClip("idle", 3.0, tracks);
}
