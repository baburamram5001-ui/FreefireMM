import * as THREE from "three";
import { makeCharacter } from "./lobbyCharacter.js";
import { buildLobbyEnvironment } from "./lobbyEnvironment.js";

let scene, camera, renderer, clock;
let player, mixer;
let env;
let animFrameId;
let canvas;

const CAMERA_FOV = 65;
const FAR_CLIP = 500;
const CAMERA_OFFSET = new THREE.Vector3(0, 3.2, 6.5);

export function initLobby(container) {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a1020);
  scene.fog = new THREE.FogExp2(0x0a1020, 0.012);

  clock = new THREE.Clock();

  camera = new THREE.PerspectiveCamera(CAMERA_FOV, container.clientWidth / container.clientHeight, 0.1, FAR_CLIP);
  camera.position.copy(CAMERA_OFFSET);
  camera.lookAt(0, 1.5, 0);

  canvas = document.createElement("canvas");
  container.appendChild(canvas);

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const hemi = new THREE.HemisphereLight(0x4a6a9a, 0x1a1a2a, 0.5);
  scene.add(hemi);

  const keyLight = new THREE.DirectionalLight(0xffe4b5, 1.2);
  keyLight.position.set(8, 16, 10);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(2048, 2048);
  keyLight.shadow.camera.near = 0.5;
  keyLight.shadow.camera.far = 50;
  keyLight.shadow.camera.left = -15;
  keyLight.shadow.camera.right = 15;
  keyLight.shadow.camera.top = 15;
  keyLight.shadow.camera.bottom = -15;
  keyLight.shadow.bias = -0.0003;
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0x4a9eff, 0.8);
  rimLight.position.set(-10, 8, -12);
  scene.add(rimLight);

  const spotLight = new THREE.SpotLight(0xc9a84c, 2, 30, Math.PI / 5, 0.5, 1.5);
  spotLight.position.set(0, 20, 0);
  spotLight.target.position.set(0, 0, 0);
  scene.add(spotLight);
  scene.add(spotLight.target);

  const platformLight = new THREE.PointLight(0x4a9eff, 1.5, 15);
  platformLight.position.set(0, 0.5, 0);
  scene.add(platformLight);

  env = buildLobbyEnvironment(scene);
  const charResult = makeCharacter(scene);
  player = charResult.group;
  mixer = charResult.mixer;

  window.addEventListener("resize", onResize);
  animate();

  return { cleanup: disposeLobby };
}

function onResize() {
  if (!renderer || !camera) return;
  const container = canvas.parentElement;
  if (!container) return;
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}

function animate() {
  animFrameId = requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.getElapsedTime();

  if (mixer) mixer.update(dt);

  if (env.floatingOrbs) {
    for (const orb of env.floatingOrbs) {
      orb.position.y = orb.userData.baseY + Math.sin(t * orb.userData.speed + orb.userData.phase) * 0.6;
    }
  }

  if (player) {
    player.rotation.y = Math.sin(t * 0.3) * 0.15;
  }

  if (env.mistParticles) {
    env.mistParticles.rotation.y = t * 0.02;
  }

  if (env.stars) {
    env.stars.rotation.y = t * 0.005;
  }

  renderer.render(scene, camera);
}

function disposeLobby() {
  cancelAnimationFrame(animFrameId);
  window.removeEventListener("resize", onResize);
  if (renderer) {
    renderer.dispose();
    renderer.forceContextLoss();
  }
  if (canvas && canvas.parentNode) {
    canvas.parentNode.removeChild(canvas);
  }
  scene = null;
  camera = null;
  renderer = null;
  mixer = null;
  player = null;
  env = null;
}
