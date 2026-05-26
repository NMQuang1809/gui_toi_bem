/**
 * Screen 4 — Parametric heart particle field (10k+), OrbitControls,
 * perspective match → GSAP snap + bloom + synced heartbeat.
 */

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

// ==================== Config ====================

const PARTICLE_COUNT_DESKTOP = 12000;
const PARTICLE_COUNT_MOBILE = 10000;
const SPARKLE_COUNT_DESKTOP = 3500;
const SPARKLE_COUNT_MOBILE = 2200;
const BURST_COUNT = 500;
const EXPLOSION_BURST_COUNT = 1600;
const DOM_CONFETTI_COUNT = 72;

/** Smaller heart so it fits fully in viewport (frame for center photo) */
const HEART_SIZE = 30;
const HEART_GROUP_SCALE = 0.88;
const HEART_CENTER_Y = 2.2;
const SHELL_JITTER = 0.32;

/** Epsilon: camera “frontal” alignment for perspective illusion */
const ALIGN_DOT_THRESHOLD = 0.92;
const ALIGN_Y_MAX = 0.22;

const IDEAL_CAMERA = new THREE.Vector3(0, 0, 52);

let renderer = null;
let scene = null;
let camera = null;
let controls = null;
let composer = null;
let bloomPass = null;
let heartGroup = null;
let heartPoints = null;
let sparkles = null;
let burstPoints = null;
let animationId = null;
let completed = false;
let isRunning = false;
let heartbeatTween = null;
let snapTween = null;
let burstVelocities = null;
let burstLife = 0;
let usePostProcess = false;

let targetPositions = null;
let scatterPositions = null;
let currentPositions = null;

const clock = new THREE.Clock();
const _burstVec = new THREE.Vector3();

// ==================== Parametric heart ====================

function heartXY(t) {
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y =
    13 * Math.cos(t) -
    5 * Math.cos(2 * t) -
    2 * Math.cos(3 * t) -
    Math.cos(4 * t);
  return { x, y };
}

function buildHeartShellPositions(count) {
  const arr = new Float32Array(count * 3);
  const scale = HEART_SIZE / 16;
  const jitter = (SHELL_JITTER * scale) / 16;

  for (let i = 0; i < count; i++) {
    const t = Math.random() * Math.PI * 2;
    const { x: bx, y: by } = heartXY(t);
    const shell = 0.88 + Math.random() * 0.12;
    arr[i * 3] = bx * shell * scale + (Math.random() - 0.5) * jitter;
    arr[i * 3 + 1] =
      (HEART_CENTER_Y + (by - HEART_CENTER_Y) * shell) * scale +
      (Math.random() - 0.5) * jitter;
    arr[i * 3 + 2] = (Math.random() - 0.5) * HEART_SIZE * 0.06;
  }
  return arr;
}

/** Initial cloud — particles close together, slightly scattered */
function buildScatterPositions(count) {
  const arr = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const bias = Math.pow(Math.random(), 0.7);
    const r = 5 + bias * 14;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    arr[i * 3] = r * Math.sin(phi) * Math.cos(theta) * 1.05;
    arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.9;
    arr[i * 3 + 2] = r * Math.cos(phi) * 0.7;
  }
  return arr;
}

function buildHeartColors(count) {
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const c = new THREE.Color();
    const roll = Math.random();
    if (roll < 0.1) {
      c.setHSL(0, 0, 0.95);
    } else {
      const hue = THREE.MathUtils.lerp(0.92, 0.99, Math.random());
      c.setHSL(hue, 0.82, 0.36 + Math.random() * 0.16);
    }
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  return colors;
}

// ==================== Camera match (perspective illusion) ====================

function getCameraAlignment() {
  const dir = camera.position.clone().normalize();
  const frontZ = Math.abs(dir.z);
  const flatY = 1 - THREE.MathUtils.smoothstep(Math.abs(dir.y), ALIGN_Y_MAX, ALIGN_Y_MAX + 0.14);
  const flatX = 1 - THREE.MathUtils.smoothstep(Math.abs(dir.x), 0.3, 0.55);
  const zScore = THREE.MathUtils.smoothstep(frontZ, ALIGN_DOT_THRESHOLD - 0.12, 1);
  return Math.min(zScore * flatY * flatX, 1);
}

function isCameraAligned() {
  return getCameraAlignment() >= ALIGN_DOT_THRESHOLD;
}

function applyParticleBlend(blend) {
  const n = currentPositions.length;
  for (let i = 0; i < n; i += 3) {
    currentPositions[i] = THREE.MathUtils.lerp(scatterPositions[i], targetPositions[i], blend);
    currentPositions[i + 1] = THREE.MathUtils.lerp(
      scatterPositions[i + 1],
      targetPositions[i + 1],
      blend
    );
    currentPositions[i + 2] = THREE.MathUtils.lerp(
      scatterPositions[i + 2],
      targetPositions[i + 2],
      blend
    );
  }
  heartPoints.geometry.attributes.position.needsUpdate = true;
}

// ==================== Background sparkles (Three.js layer) ====================

function createBackgroundSparkles(count) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const phases = new Float32Array(count);
  const speeds = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 100;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 80;
    positions[i * 3 + 2] = -12 - Math.random() * 35;
    phases[i] = Math.random() * Math.PI * 2;
    speeds[i] = 0.4 + Math.random() * 1.6;
    const c = new THREE.Color();
    c.setHSL(0.93 + Math.random() * 0.06, 0.6, 0.55 + Math.random() * 0.2);
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.userData = { phases, speeds, baseZ: positions.slice() };

  const material = new THREE.PointsMaterial({
    size: 0.1,
    vertexColors: true,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });

  const points = new THREE.Points(geometry, material);
  points.renderOrder = -1;
  return points;
}

function animateSparkles(time) {
  if (!sparkles) return;
  const { phases, speeds, baseZ } = sparkles.geometry.userData;
  const pos = sparkles.geometry.attributes.position.array;

  for (let i = 0; i < phases.length; i++) {
    pos[i * 3] += Math.sin(time * 0.12 + phases[i]) * 0.006;
    pos[i * 3 + 1] += Math.cos(time * 0.09 + phases[i]) * 0.005;
    pos[i * 3 + 2] = baseZ[i * 3 + 2] + Math.sin(time * speeds[i] + phases[i]) * 1.2;
  }
  sparkles.geometry.attributes.position.needsUpdate = true;
}

// ==================== Burst on match ====================

function spawnBurst(count = BURST_COUNT, intensity = 1) {
  const positions = new Float32Array(count * 3);
  burstVelocities = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    _burstVec
      .set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
      .normalize()
      .multiplyScalar((4 + Math.random() * 10) * intensity);
    burstVelocities[i * 3] = _burstVec.x;
    burstVelocities[i * 3 + 1] = _burstVec.y;
    burstVelocities[i * 3 + 2] = _burstVec.z;
    positions[i * 3] = (Math.random() - 0.5) * 0.4;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 0.4;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(buildHeartColors(count), 3));

  const material = new THREE.PointsMaterial({
    size: intensity > 1 ? 0.18 : 0.14,
    vertexColors: true,
    transparent: true,
    opacity: 1,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });

  if (burstPoints) {
    burstPoints.geometry.dispose();
    burstPoints.material.dispose();
    scene.remove(burstPoints);
  }

  burstPoints = new THREE.Points(geometry, material);
  burstPoints.renderOrder = 2;
  scene.add(burstPoints);
  burstLife = intensity > 1 ? 2.2 : 1.4;
}

/** Large radial spark burst from heart center (explosion reveal) */
function spawnExplosionBurst() {
  spawnBurst(EXPLOSION_BURST_COUNT, 2.4);
}

/** DOM confetti radiating from screen center */
function spawnDOMConfetti() {
  const container = document.getElementById("explosion-confetti");
  if (!container || typeof gsap === "undefined") return;

  container.innerHTML = "";
  const colors = ["#ff1493", "#ff6b9d", "#ffd54f", "#ffffff", "#ffb6c9", "#e91e63"];
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;

  for (let i = 0; i < DOM_CONFETTI_COUNT; i++) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.background = colors[i % colors.length];
    piece.style.left = `${cx}px`;
    piece.style.top = `${cy}px`;
    if (Math.random() > 0.5) piece.style.borderRadius = "50%";
    container.appendChild(piece);

    const angle = Math.random() * Math.PI * 2;
    const dist = 120 + Math.random() * Math.max(window.innerWidth, window.innerHeight) * 0.45;
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist;

    gsap.fromTo(
      piece,
      { x: 0, y: 0, scale: 0, opacity: 1, rotation: 0 },
      {
        x: tx,
        y: ty,
        scale: 0.6 + Math.random() * 0.8,
        rotation: (Math.random() - 0.5) * 720,
        opacity: 0,
        duration: 1.1 + Math.random() * 0.9,
        ease: "power2.out",
        delay: Math.random() * 0.12,
      }
    );
  }
}

function updateBurst(dt) {
  if (!burstPoints || burstLife <= 0) return;
  burstLife -= dt;
  const pos = burstPoints.geometry.attributes.position.array;
  const vel = burstVelocities;

  const count = burstVelocities.length / 3;
  const maxLife = burstLife > 1.8 ? 2.2 : 1.4;

  for (let i = 0; i < count; i++) {
    pos[i * 3] += vel[i * 3] * dt;
    pos[i * 3 + 1] += vel[i * 3 + 1] * dt;
    pos[i * 3 + 2] += vel[i * 3 + 2] * dt;
    vel[i * 3] *= 0.93;
    vel[i * 3 + 1] *= 0.93;
    vel[i * 3 + 2] *= 0.93;
  }
  burstPoints.geometry.attributes.position.needsUpdate = true;
  burstPoints.material.opacity = Math.max(0, burstLife / maxLife);
}

// ==================== Render + bloom ====================

function renderScene() {
  if (!renderer || !scene || !camera) return;
  if (usePostProcess && composer) composer.render();
  else renderer.render(scene, camera);
}

function enableBloomEffect() {
  if (!renderer || !scene || !camera) return;

  const canvas = renderer.domElement;
  const w = canvas.clientWidth || window.innerWidth;
  const h = canvas.clientHeight || window.innerHeight;

  if (composer) composer.dispose();

  bloomPass = new UnrealBloomPass(new THREE.Vector2(w, h), 0.55, 0.4, 0.85);
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(bloomPass);
  usePostProcess = true;

  if (typeof gsap !== "undefined") {
    gsap.to(bloomPass, {
      strength: 1.05,
      radius: 0.55,
      duration: 1.2,
      ease: "power2.out",
    });
  }
}

// ==================== Completion UI ====================

function lockCamera() {
  if (!camera) return;
  if (typeof gsap === "undefined") {
    camera.position.copy(IDEAL_CAMERA);
    camera.lookAt(0, 0, 0);
    return;
  }
  gsap.to(camera.position, {
    x: IDEAL_CAMERA.x,
    y: IDEAL_CAMERA.y,
    z: IDEAL_CAMERA.z,
    duration: 0.6,
    ease: "power3.inOut",
    onUpdate: () => camera.lookAt(0, 0, 0),
    onComplete: () => camera.lookAt(0, 0, 0),
  });
}

/** Infinite heartbeat — starts AFTER explosion reveal completes */
function startSynchronizedHeartbeat(photoWrap) {
  if (typeof gsap === "undefined" || !heartGroup) return;

  if (heartbeatTween) heartbeatTween.kill();

  const base = HEART_GROUP_SCALE;
  heartGroup.scale.set(base, base, base);
  if (photoWrap) gsap.set(photoWrap, { scale: 1 });

  const pulse = { s: 1 };
  heartbeatTween = gsap.to(pulse, {
    s: 1.1,
    duration: 0.42,
    yoyo: true,
    repeat: -1,
    ease: "sine.inOut",
    onUpdate: () => {
      const v = base * pulse.s;
      heartGroup.scale.set(v, v, v);
      if (photoWrap) {
        gsap.set(photoWrap, { scale: pulse.s });
        const photo = photoWrap.querySelector(".couple-photo");
        if (photo) gsap.set(photo, { scale: 1, rotation: 0 });
      }
    },
  });
}

/**
 * Explosion reveal: 3D burst + DOM confetti → photo POP → title/message POP → heartbeat.
 */
function playExplosionReveal(options) {
  const titleEl = options.titleEl;
  const wrap = options.imageWrap;
  const img = options.imageEl;
  const msgEl = options.messageEl;
  const flash = document.getElementById("explosion-flash");

  if (heartGroup) heartGroup.rotation.set(0, 0, 0);

  spawnExplosionBurst();
  spawnDOMConfetti();
  options.onMatched?.();

  if (typeof gsap === "undefined") {
    if (wrap && img) {
      if (options.imageCenter) img.src = options.imageCenter;
      wrap.hidden = false;
      wrap.classList.add("is-revealed");
    }
    if (titleEl) {
      titleEl.hidden = false;
      titleEl.style.opacity = "1";
    }
    if (msgEl && options.message) {
      msgEl.textContent = options.message;
      msgEl.hidden = false;
      msgEl.style.opacity = "1";
    }
    startSynchronizedHeartbeat(wrap);
    return;
  }

  const tl = gsap.timeline({
    onComplete: () => {
      if (wrap) wrap.classList.add("is-revealed");
      if (img) gsap.set(img, { scale: 1, rotation: 0, opacity: 1 });
      if (wrap) gsap.set(wrap, { scale: 1 });
      startSynchronizedHeartbeat(wrap);
    },
  });

  if (flash) {
    tl.fromTo(
      flash,
      { opacity: 0, scale: 0.35 },
      { opacity: 0.9, scale: 2.2, duration: 0.28, ease: "power2.out" },
      0
    ).to(flash, { opacity: 0, scale: 2.8, duration: 0.55, ease: "power2.in" }, 0.12);
  }

  if (wrap && img) {
    if (options.imageCenter) img.src = options.imageCenter;
    wrap.hidden = false;
    gsap.set(wrap, { scale: 1, opacity: 1 });
    gsap.set(img, { opacity: 1, scale: 1, rotation: 0 });
    tl.fromTo(
      img,
      { scale: 0, rotation: 360 },
      {
        scale: 1,
        rotation: 0,
        duration: 1.5,
        ease: "back.out(1.7)",
        onComplete: () => {
          gsap.set(img, { scale: 1, rotation: 0, opacity: 1 });
        },
      },
      0.08
    );
  }

  if (titleEl) {
    titleEl.hidden = false;
    titleEl.textContent = options.title || titleEl.textContent;
    gsap.set(titleEl, { opacity: 1 });
    tl.from(
      titleEl,
      {
        scale: 0,
        y: 48,
        rotation: -18,
        duration: 1.15,
        ease: "back.out(2)",
      },
      0.32
    );
  }

  if (msgEl && options.message) {
    msgEl.textContent = options.message;
    msgEl.hidden = false;
    gsap.set(msgEl, { opacity: 1 });
    tl.from(
      msgEl,
      {
        scale: 0,
        y: 28,
        duration: 0.95,
        ease: "back.out(1.9)",
      },
      0.5
    );
  } else if (msgEl && !options.message) {
    msgEl.hidden = true;
  }
}

function triggerCompletion(options) {
  if (completed) return;
  completed = true;

  const hint = document.getElementById("final-hint");
  if (hint) {
    if (typeof gsap !== "undefined") {
      gsap.to(hint, { opacity: 0, duration: 0.35, onComplete: () => (hint.hidden = true) });
    } else {
      hint.hidden = true;
    }
  }

  if (controls) controls.enabled = false;
  lockCamera();

  const state = { blend: Math.max(getCameraAlignment(), 0.5) };

  if (typeof gsap === "undefined") {
    applyParticleBlend(1);
    enableBloomEffect();
    playExplosionReveal(options);
    return;
  }

  snapTween = gsap.to(state, {
    blend: 1,
    duration: 0.65,
    ease: "power4.inOut",
    onUpdate: () => applyParticleBlend(state.blend),
    onComplete: () => {
      applyParticleBlend(1);
      playExplosionReveal(options);
    },
  });

  enableBloomEffect();

  gsap.to(heartPoints.material, {
    size: 0.28,
    opacity: 1,
    duration: 0.85,
    ease: "power2.out",
  });
}

// ==================== Scene build ====================

function createHeartParticles(count) {
  targetPositions = buildHeartShellPositions(count);
  scatterPositions = buildScatterPositions(count);
  currentPositions = new Float32Array(scatterPositions);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(currentPositions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(buildHeartColors(count), 3));

  const material = new THREE.PointsMaterial({
    size: 0.22,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });

  const points = new THREE.Points(geometry, material);
  heartGroup = new THREE.Group();
  heartGroup.add(points);
  heartGroup.scale.set(HEART_GROUP_SCALE, HEART_GROUP_SCALE, HEART_GROUP_SCALE);
  scene.add(heartGroup);
  return points;
}

function onResize() {
  if (!renderer || !camera) return;
  const canvas = renderer.domElement;
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (w === 0 || h === 0) return;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
  if (composer) composer.setSize(w, h);
}

function animate() {
  if (!isRunning) return;
  animationId = requestAnimationFrame(animate);

  const dt = Math.min(clock.getDelta(), 0.05);
  const elapsed = clock.getElapsedTime();

  if (controls) controls.update();

  if (!completed) {
    if (heartGroup) {
      heartGroup.rotation.y += dt * 0.12;
      heartGroup.rotation.x = Math.sin(elapsed * 0.35) * 0.08;
    }

    const align = getCameraAlignment();
    const preview = Math.pow(align, 2) * 0.72;
    applyParticleBlend(preview);

    const hint = document.getElementById("final-hint");
    if (hint && !hint.hidden) {
      hint.style.opacity = String(0.45 + align * 0.55);
    }

    if (isCameraAligned()) {
      triggerCompletion(animate._options);
    }
  }

  animateSparkles(elapsed);
  updateBurst(dt);
  renderScene();
}

// ==================== Public API ====================

export function startFinalScreen(options = {}) {
  stopFinalScreen();

  const canvas = document.getElementById("heart-canvas");
  if (!canvas) return;

  try {
    completed = false;
    isRunning = true;
    usePostProcess = false;
    burstLife = 0;
    animate._options = options;

    const isMobile = window.innerWidth < 768;
    const count = isMobile ? PARTICLE_COUNT_MOBILE : PARTICLE_COUNT_DESKTOP;
    const sparkleCount = isMobile ? SPARKLE_COUNT_MOBILE : SPARKLE_COUNT_DESKTOP;

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(
      46,
      canvas.clientWidth / Math.max(canvas.clientHeight, 1),
      0.1,
      500
    );
    camera.position.set(26, 10, 44);

    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.minDistance = 22;
    controls.maxDistance = 95;
    controls.target.set(0, 0, 0);
    controls.update();

    sparkles = createBackgroundSparkles(sparkleCount);
    scene.add(sparkles);

    heartPoints = createHeartParticles(count);

    const hint = document.getElementById("final-hint");
    if (hint) {
      hint.hidden = false;
      hint.style.opacity = "1";
    }

    const wrap = options.imageWrap;
    const img = options.imageEl;
    const titleEl = options.titleEl;
    const msgEl = options.messageEl;

    if (wrap) {
      wrap.hidden = true;
      wrap.classList.remove("is-revealed");
      if (typeof gsap !== "undefined") gsap.set(wrap, { scale: 1, clearProps: "transform" });
    }
    if (titleEl) {
      titleEl.hidden = true;
      if (typeof gsap !== "undefined") gsap.set(titleEl, { clearProps: "all" });
    }
    if (msgEl) {
      msgEl.hidden = true;
      if (typeof gsap !== "undefined") gsap.set(msgEl, { clearProps: "all" });
    }
    if (img) {
      if (options.imageCenter) img.src = options.imageCenter;
      if (typeof gsap !== "undefined") {
        gsap.set(img, { opacity: 0, scale: 0, rotation: 0, clearProps: "transform" });
      }
    }

    const confetti = document.getElementById("explosion-confetti");
    if (confetti) confetti.innerHTML = "";
    const flash = document.getElementById("explosion-flash");
    if (flash && typeof gsap !== "undefined") {
      gsap.set(flash, { opacity: 0, scale: 0.35 });
    }

    document.getElementById("sparkle-rain")?.classList.remove("is-active");

    window.addEventListener("resize", onResize);
    requestAnimationFrame(() => {
      onResize();
      requestAnimationFrame(onResize);
    });
    clock.start();
    animate();
  } catch (err) {
    console.error("Final screen 3D:", err);
    stopFinalScreen();
    const hint = document.getElementById("final-hint");
    if (hint) {
      hint.textContent =
        "Không tải được Three.js. Mở trang bằng Live Server (http://), không dùng file://";
      hint.hidden = false;
    }
  }
}

export function stopFinalScreen() {
  isRunning = false;
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  if (heartbeatTween) {
    heartbeatTween.kill();
    heartbeatTween = null;
  }
  if (snapTween) {
    snapTween.kill();
    snapTween = null;
  }
  window.removeEventListener("resize", onResize);

  if (burstPoints) {
    burstPoints.geometry.dispose();
    burstPoints.material.dispose();
    burstPoints = null;
  }
  if (heartPoints) {
    heartPoints.geometry.dispose();
    heartPoints.material.dispose();
    heartPoints = null;
  }
  if (heartGroup) {
    scene?.remove(heartGroup);
    heartGroup = null;
  }
  if (sparkles) {
    sparkles.geometry.dispose();
    sparkles.material.dispose();
    sparkles = null;
  }
  if (renderer) {
    renderer.dispose();
    renderer = null;
  }
  if (composer) {
    composer.dispose();
    composer = null;
  }

  controls = null;
  usePostProcess = false;
  bloomPass = null;
  scene = null;
  camera = null;
  targetPositions = null;
  scatterPositions = null;
  currentPositions = null;
  burstVelocities = null;
  burstLife = 0;
  completed = false;
}

window.startFinalScreen = startFinalScreen;
window.stopFinalScreen = stopFinalScreen;
