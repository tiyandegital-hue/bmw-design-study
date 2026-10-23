/* KAALO-style study scene: procedural coupé sculpture for the BMW design study hero.
   One WebGL scene, DPR-capped, pauses off-screen. Paint is switchable (configurator psychology). */
import * as THREE from 'three';
import { RoomEnvironment } from './vendor/addons/RoomEnvironment.js';

const canvas = document.getElementById('gl');
const fallback = document.getElementById('stageFallback');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
} catch (e) {
  if (fallback) fallback.textContent = '3D unavailable in this browser — the study continues below.';
  throw e;
}
if (fallback) fallback.style.display = 'none';

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const camera = new THREE.PerspectiveCamera(38, 2, 0.1, 100);
camera.position.set(4.4, 1.55, 4.8);
camera.lookAt(0, 0.62, 0);

/* ——— the coupé: an extruded side profile (a sculpture, not a CAD model) ——— */
const s = new THREE.Shape();
s.moveTo(-2.35, 0.30);
s.lineTo(-2.44, 0.74);
s.quadraticCurveTo(-2.44, 0.96, -2.16, 1.01);
s.bezierCurveTo(-1.60, 1.10, -1.28, 1.44, -0.58, 1.47);
s.bezierCurveTo(0.05, 1.50, 0.42, 1.30, 0.86, 1.10);
s.bezierCurveTo(1.45, 0.94, 2.05, 0.92, 2.34, 0.84);
s.quadraticCurveTo(2.50, 0.78, 2.47, 0.55);
s.quadraticCurveTo(2.45, 0.34, 2.30, 0.29);
s.lineTo(-2.35, 0.30);

const bodyGeo = new THREE.ExtrudeGeometry(s, {
  depth: 1.62, steps: 1, bevelEnabled: true,
  bevelThickness: 0.14, bevelSize: 0.11, bevelSegments: 5, curveSegments: 24
});
bodyGeo.translate(0, 0, -0.81);

const paint = new THREE.MeshPhysicalMaterial({
  color: 0x1c69d4, metalness: 0.65, roughness: 0.30,
  clearcoat: 1.0, clearcoatRoughness: 0.06, envMapIntensity: 1.15
});
const body = new THREE.Mesh(bodyGeo, paint);

/* glass canopy: a shell of the same body, clipped to the greenhouse zone (y >= 1.04),
   so the dark glass reads from every angle */
renderer.localClippingEnabled = true;
const glass = new THREE.Mesh(bodyGeo, new THREE.MeshPhysicalMaterial({
  color: 0x0a0e13, metalness: 0.9, roughness: 0.08, clearcoat: 1, envMapIntensity: 1.4,
  clippingPlanes: [new THREE.Plane(new THREE.Vector3(0, 1, 0), -1.10)]
}));
glass.scale.set(1.006, 1.006, 1.006);

const car = new THREE.Group();
car.add(body); car.add(glass);

/* wheels + arches */
const tireMat = new THREE.MeshStandardMaterial({ color: 0x0b0b0c, roughness: 0.92, metalness: 0.05 });
const rimMat = new THREE.MeshStandardMaterial({ color: 0xdfe3e8, roughness: 0.18, metalness: 1.0 });
const archMat = new THREE.MeshStandardMaterial({ color: 0x0d0f12, roughness: 0.6, metalness: 0.3 });
function wheel(x) {
  const grp = new THREE.Group();
  const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.345, 0.345, 0.24, 36), tireMat);
  tire.rotation.x = Math.PI / 2;
  grp.add(tire);
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.205, 0.205, 0.25, 24), rimMat);
  rim.rotation.x = Math.PI / 2;
  grp.add(rim);
  for (let i = 0; i < 5; i++) {
    const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.185, 0.255), rimMat);
    const a = (i / 5) * Math.PI * 2;
    spoke.position.set(Math.sin(a) * 0.105, Math.cos(a) * 0.105, 0);
    spoke.rotation.z = -a;
    grp.add(spoke);
  }
  grp.position.set(x, 0.345, 0);
  return grp;
}
[1.42, -1.42].forEach(x => {
  const w = wheel(x);
  w.children.forEach(c => { c.position.z = 0.88; });
  const w2 = w.clone();
  w2.children.forEach(c => { c.position.z = -0.88; });
  car.add(w); car.add(w2);
  [0.93, -0.93].forEach(z => {
    const arch = new THREE.Mesh(new THREE.CircleGeometry(0.42, 32), archMat);
    arch.position.set(x, 0.36, z);
    if (z < 0) arch.rotation.y = Math.PI;
    car.add(arch);
  });
});

/* headlight signature: two slim emissive bars at the nose */
const lightMat = new THREE.MeshStandardMaterial({ color: 0xdceeff, emissive: 0x9fc8ff, emissiveIntensity: 2.4 });
[0.48, -0.48].forEach(z => {
  const bar = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.05, 0.52), lightMat);
  bar.position.set(2.47, 0.74, z);
  car.add(bar);
});

/* studio floor — same colour as the hero band, fog fades its edge away */
scene.fog = new THREE.Fog(0x1a2129, 11, 30);
const floor = new THREE.Mesh(
  new THREE.CircleGeometry(40, 48),
  new THREE.MeshStandardMaterial({ color: 0x1a2129, roughness: 0.42, metalness: 0.35, envMapIntensity: 0.6 })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.005;
scene.add(floor);
scene.add(car);
car.position.y = 0.02;
car.scale.setScalar(1.12);

const key = new THREE.DirectionalLight(0xffffff, 2.0);
key.position.set(4, 6, 3);
scene.add(key);
const rim = new THREE.PointLight(0x1c69d4, 7, 22);
rim.position.set(-5, 2.6, -4);
scene.add(rim);

/* ——— interaction: turntable + drag with inertia ——— */
let targetRotY = 0.65, rotY = 0.65, vel = 0, dragging = false, lastX = 0, idleFor = 99;
canvas.addEventListener('pointerdown', e => { dragging = true; lastX = e.clientX; idleFor = 0; canvas.setPointerCapture(e.pointerId); });
canvas.addEventListener('pointermove', e => {
  if (!dragging) return;
  const dx = e.clientX - lastX; lastX = e.clientX;
  vel = dx * 0.005; targetRotY += vel;
});
['pointerup', 'pointercancel'].forEach(ev => canvas.addEventListener(ev, () => { dragging = false; }));

/* paint configurator — called from the page's swatch buttons */
const paintNameEl = document.getElementById('paintName');
let paintTarget = new THREE.Color(0x1c69d4);
window.setPaint = function (hex, name) {
  paintTarget = new THREE.Color(hex);
  if (paintNameEl) paintNameEl.textContent = name;
  document.querySelectorAll('.swatch').forEach(b =>
    b.classList.toggle('active', b.dataset.name === name));
};

/* ——— sizing + render loop (pauses off-screen) ——— */
const baseCamPos = camera.position.clone();
function resize() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  /* pull the camera back on narrow stages so the whole car stays in frame */
  const m = camera.aspect >= 1.6 ? 1 : Math.min(2.1, Math.pow(1.6 / camera.aspect, 0.9));
  camera.position.copy(baseCamPos).multiplyScalar(m);
  camera.lookAt(0, 0.62, 0);
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(canvas);
resize();

let running = true;
new IntersectionObserver(en => { running = en[0].isIntersecting; }, { threshold: 0.02 }).observe(canvas);
document.addEventListener('visibilitychange', () => { running = !document.hidden && running; });

const clock = new THREE.Clock();
let firstFrame = true;
function tick() {
  requestAnimationFrame(tick);
  if (!running) return;
  if (firstFrame) { firstFrame = false; window.__glReady = true; }
  const t = clock.getElapsedTime();
  if (!dragging) {
    vel *= 0.94; targetRotY += vel;
    idleFor += 0.016;
    if (!reduced && idleFor > 2.5) targetRotY += 0.0028;
  }
  rotY += (targetRotY - rotY) * 0.08;
  car.rotation.y = rotY;
  car.position.y = 0.02 + (reduced ? 0 : Math.sin(t * 0.9) * 0.015);
  paint.color.lerp(paintTarget, 0.08);
  renderer.render(scene, camera);
}
tick();
