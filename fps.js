// Walking around the venue: the controls a guest drives with, and what stops them
// walking through the furniture. Shared by the lobby (lobby3d.js) and the ballroom
// (ballroom3d.js); gate3d.js owns the one instance and hands it to whichever room is up.
//
// Phones: a thumbstick in the bottom-left corner moves, a drag anywhere else looks.
// Computers: W/A/S/D (and the arrow keys) move, the mouse looks once the canvas is
// clicked and the pointer locks; Esc hands the cursor back.
import * as THREE from 'three';

export const EYE_H = 1.65;     // the guest's eye height, both rooms
const SPEED = 2.6;             // metres per second at a full push
const RUN = 1.8;               // shift, or a thumbstick pushed to the rim
const ACCEL = 9;               // how quickly the walk picks up and settles
const MOUSE = 0.0022;          // radians per pixel of mouse movement
const TOUCH = 2.4;             // radians per screen-width dragged
const PITCH_MAX = 0.62;        // keep the horizon in view; the rooms have little to see straight up
const STICK_R = 54;            // thumbstick radius in CSS pixels
const DEAD = 0.14;             // ignore the first bit of a thumbstick push

// ---------------------------------------------------------------- controls

// `canvas` is the 3D canvas; `stick` the thumbstick element (its knob is the first child).
// Reports a move vector (x = strafe, y = forward, both -1..1), look deltas in radians,
// and whether the guest has taken the wheel since the last check.
export function createControls(canvas, stick) {
  const knob = stick && stick.firstElementChild;
  const keys = new Set();
  const move = { x: 0, y: 0 };
  const look = { yaw: 0, pitch: 0 };
  let run = false;
  let touched = false;      // the guest moved or looked: cancel whatever the room was doing
  let enabled = false;
  let stickId = null, lookId = null;
  let lookAt = null;
  let locked = false;

  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  // ---- thumbstick (touch) ----
  function stickTo(e) {
    const r = stick.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    let dx = (e.clientX - cx) / STICK_R, dy = (e.clientY - cy) / STICK_R;
    const len = Math.hypot(dx, dy);
    if (len > 1) { dx /= len; dy /= len; }
    if (knob) knob.style.transform = `translate(${dx * STICK_R}px, ${dy * STICK_R}px)`;
    const mag = Math.min(1, len);
    if (mag < DEAD) { move.x = move.y = 0; return; }
    // rescale past the dead zone so a small push still creeps
    const k = (mag - DEAD) / (1 - DEAD) / (mag || 1);
    move.x = dx * k;
    move.y = -dy * k;   // up on the stick walks forward
    run = len > 0.96;
    touched = true;
  }
  function stickOff() {
    stickId = null;
    move.x = move.y = 0;
    run = false;
    if (knob) knob.style.transform = '';
    if (stick) stick.classList.remove('is-held');
  }
  if (stick) {
    stick.addEventListener('pointerdown', (e) => {
      if (!enabled || stickId !== null) return;
      stickId = e.pointerId;
      stick.setPointerCapture(e.pointerId);
      stick.classList.add('is-held');
      stickTo(e);
      e.preventDefault();
    });
    stick.addEventListener('pointermove', (e) => { if (e.pointerId === stickId) stickTo(e); });
    for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) {
      stick.addEventListener(ev, (e) => { if (e.pointerId === stickId) stickOff(); });
    }
    // the stick is for driving, not for scrolling the page behind it
    stick.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
  }

  // ---- looking ----
  // A touch anywhere but the thumbstick turns the view. The room still gets the tap
  // (to open a photo, or walk to a spot) when the finger barely moved — see `dragged`.
  function onDown(e) {
    if (!enabled || e.pointerType === 'mouse' || lookId !== null) return;
    if (stick && stick.contains(e.target)) return;
    lookId = e.pointerId;
    lookAt = [e.clientX, e.clientY, 0];
  }
  function onMove(e) {
    if (e.pointerId !== lookId || !lookAt) return;
    const w = canvas.clientWidth || 1;
    const dx = e.clientX - lookAt[0], dy = e.clientY - lookAt[1];
    lookAt = [e.clientX, e.clientY, lookAt[2] + Math.abs(dx) + Math.abs(dy)];
    if (lookAt[2] < 6) return;            // let a tap stay a tap
    look.yaw -= (dx / w) * TOUCH;
    look.pitch -= (dy / w) * TOUCH;
    touched = true;
  }
  function onUp(e) {
    if (e.pointerId !== lookId) return;
    lookId = null;
    lookAt = null;
  }
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);

  // ---- mouse look, once the canvas is clicked (computers) ----
  function onMouseMove(e) {
    if (!locked) return;
    look.yaw -= e.movementX * MOUSE;
    look.pitch -= e.movementY * MOUSE;
    if (e.movementX || e.movementY) touched = true;
  }
  function onLockChange() {
    locked = document.pointerLockElement === canvas;
    canvas.classList.toggle('is-locked', locked);
  }
  document.addEventListener('pointerlockchange', onLockChange);
  document.addEventListener('mousemove', onMouseMove);

  // ---- keyboard ----
  const KEYS = {
    KeyW: 'f', ArrowUp: 'f', KeyS: 'b', ArrowDown: 'b',
    KeyA: 'l', ArrowLeft: 'l', KeyD: 'r', ArrowRight: 'r',
  };
  function typing(el) {
    return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable);
  }
  function onKey(e) {
    const k = KEYS[e.code];
    if (!enabled || !k || typing(document.activeElement) || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.type === 'keydown') keys.add(k); else keys.delete(k);
    run = e.shiftKey;
    if (e.type === 'keydown') touched = true;
    e.preventDefault();
  }
  window.addEventListener('keydown', onKey);
  window.addEventListener('keyup', onKey);
  window.addEventListener('blur', () => keys.clear());

  return {
    // the room is being walked around: show the thumbstick, accept the keys
    start(touch) {
      enabled = true;
      if (stick) stick.hidden = !touch;
    },
    stop() {
      enabled = false;
      keys.clear();
      stickOff();
      if (stick) stick.hidden = true;
      if (locked) document.exitPointerLock();
    },
    // click-to-look on computers; the room calls this when a click wasn't a tap on something
    lock() {
      if (!enabled || locked || !canvas.requestPointerLock) return;
      const r = canvas.requestPointerLock();
      if (r && r.catch) r.catch(() => {});   // denied (or the document lost focus): mouse look just stays off
    },
    locked: () => locked,
    // how far the finger has travelled in the current touch-look, in pixels
    dragged: () => (lookAt ? lookAt[2] : 0),
    // move vector for this frame, keys folded in with the thumbstick
    axes() {
      let x = move.x, y = move.y;
      if (keys.size) {
        x += (keys.has('r') ? 1 : 0) - (keys.has('l') ? 1 : 0);
        y += (keys.has('f') ? 1 : 0) - (keys.has('b') ? 1 : 0);
      }
      const len = Math.hypot(x, y);
      if (len > 1) { x /= len; y /= len; }
      return { x, y, speed: SPEED * (run ? RUN : 1) };
    },
    // look accumulated since the last frame, then reset
    takeLook() {
      const out = { yaw: look.yaw, pitch: look.pitch };
      look.yaw = look.pitch = 0;
      return out;
    },
    // true once if the guest has moved or looked since this was last asked
    took() {
      const was = touched;
      touched = false;
      return was;
    },
    clampPitch: (p) => clamp(p, -PITCH_MAX, PITCH_MAX),
    dispose() {
      this.stop();
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      document.removeEventListener('pointerlockchange', onLockChange);
      document.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKey);
    },
  };
}

// ---------------------------------------------------------------- collision

// Everything a guest can walk into, as rectangles on the floor. Worked out from the
// room itself rather than kept by hand, so furniture that moves takes its blocker along:
// every mesh whose world box reaches into the band a walking guest occupies counts.
// Floors, rugs and carpets are too flat to reach it; chandeliers and the ceiling are above it.
const BAND = { lo: 0.35, hi: 1.5 };
const FLAT = 0.3;    // a box shallower than this is something you walk on, not into
const HUGE = 0.62;   // a box covering more than this much of the room is the shell, not furniture

export function buildBlockers(scene, { w, d, skip } = {}) {
  const out = [];
  const box = new THREE.Box3();
  const geoBox = new THREE.Box3();
  const m = new THREE.Matrix4();
  const area = w && d ? w * d : Infinity;
  scene.updateMatrixWorld(true);
  scene.traverse((o) => {
    if (!o.isMesh || (skip && skip(o))) return;
    if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
    // an instanced mesh's own box covers every copy at once (every wall slat as one
    // slab across the room), so take each instance's box on its own
    const n = o.isInstancedMesh ? o.count : 1;
    for (let i = 0; i < n; i++) {
      geoBox.copy(o.geometry.boundingBox);
      if (o.isInstancedMesh) {
        o.getMatrixAt(i, m);
        m.premultiply(o.matrixWorld);
        box.copy(geoBox).applyMatrix4(m);
      } else {
        box.copy(geoBox).applyMatrix4(o.matrixWorld);
      }
      if (box.max.y < BAND.lo || box.min.y > BAND.hi) continue;      // under foot, or overhead
      if (box.max.y - box.min.y < FLAT) continue;                    // a rug, a step, a tabletop edge
      const bw = box.max.x - box.min.x, bd = box.max.z - box.min.z;
      if (bw * bd > area * HUGE) continue;                           // the floor or the ceiling
      out.push({ x0: box.min.x, x1: box.max.x, z0: box.min.z, z1: box.max.z });
    }
  });
  return merge(out);
}

// Fold overlapping rectangles into one, so a sofa built from eight boxes is eight fewer
// things to test every frame. Only while the result stays furniture-sized: left unchecked,
// the four walls touch at the corners and chain into a single rectangle covering the whole
// room, which would wall the guest in on their first step.
const MERGED_MAX = 4.5; // m² of floor
function merge(rects) {
  const out = [];
  for (const r of rects.sort((a, b) => a.x0 - b.x0)) {
    let hit = null;
    for (const o of out) {
      if (r.x0 > o.x1 + 0.04 || r.x1 < o.x0 - 0.04 || r.z0 > o.z1 + 0.04 || r.z1 < o.z0 - 0.04) continue;
      const w = Math.max(o.x1, r.x1) - Math.min(o.x0, r.x0);
      const d = Math.max(o.z1, r.z1) - Math.min(o.z0, r.z0);
      if (w * d > MERGED_MAX) continue; // would swallow more floor than it blocks
      hit = o;
      break;
    }
    if (hit) {
      hit.x0 = Math.min(hit.x0, r.x0); hit.x1 = Math.max(hit.x1, r.x1);
      hit.z0 = Math.min(hit.z0, r.z0); hit.z1 = Math.max(hit.z1, r.z1);
    } else {
      out.push({ ...r });
    }
  }
  return out;
}

const blocked = (x, z, rects, r) => rects.some((b) => x > b.x0 - r && x < b.x1 + r && z > b.z0 - r && z < b.z1 + r);

// Walk `pos` by (dx, dz), stopping at the furniture but sliding along it rather than
// sticking — try the whole step, then each axis on its own.
export function slide(pos, dx, dz, rects, bounds, r = 0.42) {
  const inside = blocked(pos.x, pos.z, rects, r);
  const fit = (x, z) => (
    x > bounds.x0 + r && x < bounds.x1 - r && z > bounds.z0 + r && z < bounds.z1 - r &&
    // standing in something already (a blocker that grew around a named spot): let them
    // walk out of it rather than sealing them in, but not deeper into anything new
    (inside || !blocked(x, z, rects, r))
  );
  const nx = pos.x + dx, nz = pos.z + dz;
  if (fit(nx, nz)) { pos.x = nx; pos.z = nz; return; }
  if (fit(nx, pos.z)) { pos.x = nx; return; }
  if (fit(pos.x, nz)) pos.z = nz;
}
