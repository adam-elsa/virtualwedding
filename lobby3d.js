// Low-poly hotel lobby with the couple's photos on the walls.
// Seen right after the guest walks through the hotel doors (gate3d.js), as the
// backdrop for our story; then the invitation page takes over.
//
// Room layout (metres-ish): x -10..10, z -12..12, the entrance door is at z = +12
// behind the camera. Ahead: wood panel wall, reception desk, slatted column (right).
// Left wall: lounge. Photos hang on the front, left and right walls.
import * as THREE from 'three';

const W = 20, D = 24, H = 5.2;
const SLAT_H = H - 0.4; // leave a gap at the top for the warm cove light

// photos on the front, left and right walls
const PHOTOS = [
  { id: 'venue', src: 'assets/img/04_Venue.jpg', pos: [-9.84, 2.6, -9.6], normal: [1, 0, 0], max: 2.5 },
  { id: 'adam', src: 'assets/img/02_ProfileAdam.jpg', pos: [-1.89, 2.6, -11.94], normal: [0, 0, 1], max: 2.4 },
  { id: 'elsa', src: 'assets/img/02_ProfileElsa.jpg', pos: [0.63, 2.6, -11.94], normal: [0, 0, 1], max: 2.4 },
  { id: 'together', src: 'assets/img/01_Banner.jpg', pos: [3.75, 2.65, -11.94], normal: [0, 0, 1], max: 2.8 },
  { id: 'story-a', src: 'assets/img/05_TimingAkadResepsi.jpg', pos: [5.84, 2.6, -9.2], normal: [-1, 0, 0], max: 2.6 },
  { id: 'story-b', src: 'assets/img/06_FooterThankyou.jpg', pos: [8.0, 2.6, -5.84], normal: [0, 0, 1], max: 2.8 },
  { id: 'story-c', src: 'assets/img/07_Story1.jpg', pos: [9.84, 2.6, -4.55], normal: [-1, 0, 0], max: 2.7 },
  { id: 'story-d', src: 'assets/img/08_Story2.jpg', pos: [9.84, 2.6, -1.35], normal: [-1, 0, 0], max: 3.0 },
];
// map board right beside the door
const MAP_BOARD = { id: 'map', pos: [-4.86, 2.6, -11.94], normal: [0, 0, 1], max: 2.5, aspect: 1.45 };
const DESK_X = -3.4;
const DOOR = { x: -8.1, w: 2.5, h: 3.35 };

export function createLobby() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x17110c);

  const T = makeTextures();
  const std = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.8, flatShading: true, ...extra });
  const M = {
    oak: std(0xb98a58, { roughness: 0.75 }),
    backing: std(0x120c07),
    ceiling: new THREE.MeshBasicMaterial({ color: 0xc9c4bb }),
    panel: new THREE.MeshStandardMaterial({ map: T.panels, roughness: 0.75 }),
    blackMarble: new THREE.MeshStandardMaterial({ map: T.blackMarble, roughness: 0.25, metalness: 0.1 }),
    sofa: std(0x6c6c6f, { roughness: 0.95 }),
    sofaDark: std(0x5c5c5f, { roughness: 0.95 }),
    chair: std(0xcdc4b6, { roughness: 0.95 }),
    black: std(0x151515, { roughness: 0.5 }),
    silver: std(0xd9d9dc, { roughness: 0.35, metalness: 0.5 }),
    rug: new THREE.MeshStandardMaterial({ map: T.rug, roughness: 1 }),
    pot: std(0xefece6, { roughness: 0.3 }),
    leaf: std(0x3e6b35),
    leaf2: std(0x557f3f),
    frame: std(0x1a1410, { roughness: 0.5 }),
    mat: new THREE.MeshBasicMaterial({ color: 0xf4efe6 }),
    glow: new THREE.MeshBasicMaterial({ color: 0xfff0d2 }),
  };

  function add(geo, mat, x = 0, y = 0, z = 0, parent = scene) {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    parent.add(m);
    return m;
  }
  const boxB = (w, h, d, mat, x, y, z, parent) => add(new THREE.BoxGeometry(w, h, d), mat, x, y + h / 2, z, parent);

  // ---------- lights ----------
  scene.add(new THREE.HemisphereLight(0xfff1e0, 0x5a4a3a, 1.1));
  for (const [x, y, z, c, i] of [
    [-8.4, 4.5, -2, 0xffd29a, 28], [8.4, 4.5, 2.5, 0xffd29a, 28], [DESK_X, 4.6, -10.4, 0xffd29a, 26],
    [0, 4.9, -1, 0xfff4e6, 30], [0, 4.9, 7, 0xfff4e6, 20],
  ]) {
    const l = new THREE.PointLight(c, i, 18, 1.4);
    l.position.set(x, y, z);
    scene.add(l);
  }

  // ---------- shell ----------
  const floor = add(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({ map: T.marble, roughness: 0.3, metalness: 0.05 }), 0, 0, 0);
  floor.rotation.x = -Math.PI / 2;
  T.marble.repeat.set(2, 2.4);
  const ceil = add(new THREE.PlaneGeometry(W, D), M.ceiling, 0, H, 0);
  ceil.rotation.x = Math.PI / 2;
  add(new THREE.PlaneGeometry(D, H), M.backing, -W / 2, H / 2, 0).rotation.y = Math.PI / 2;
  add(new THREE.PlaneGeometry(D, H), M.backing, W / 2, H / 2, 0).rotation.y = -Math.PI / 2;
  add(new THREE.PlaneGeometry(W, H), M.backing, 0, H / 2, D / 2).rotation.y = Math.PI;
  add(new THREE.PlaneGeometry(16, H), M.panel, -2, H / 2, -D / 2);         // wood panel wall ahead
  boxB(4, H, 6, M.backing, 8, 0, -9);                                        // slatted column (right)

  // vertical oak slats, one instanced mesh for every wall
  const slatSpots = [];
  const along = (from, to, step, fn) => { for (let v = from; v <= to; v += step) slatSpots.push(fn(v)); };
  along(-11.9, 11.9, 0.26, (z) => [-W / 2 + 0.05, z, true]);
  along(-5.9, 11.9, 0.26, (z) => [W / 2 - 0.05, z, true]);
  along(-11.9, -6.1, 0.26, (z) => [5.95, z, true]);
  along(6.1, 9.9, 0.26, (x) => [x, -5.95, false]);
  const slats = new THREE.InstancedMesh(new THREE.BoxGeometry(0.11, SLAT_H, 0.1), M.oak, slatSpots.length);
  const mtx = new THREE.Matrix4(), q = new THREE.Quaternion(), qSide = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
  const one = new THREE.Vector3(1, 1, 1);
  slatSpots.forEach(([x, z, side], i) => {
    mtx.compose(new THREE.Vector3(x, SLAT_H / 2, z), side ? qSide : q, one);
    slats.setMatrixAt(i, mtx);
  });
  scene.add(slats);

  // warm cove light washing down each wall + a glowing line at the top
  const wash = new THREE.MeshBasicMaterial({
    map: T.wash, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, // never flicker against the wall behind
  });
  const washes = [
    [D, -W / 2 + 0.12, 0, Math.PI / 2], [18, W / 2 - 0.12, 3, -Math.PI / 2],
    [16, -2, -D / 2 + 0.03, 0], [6, 5.88, -9, -Math.PI / 2], [4, 8, -5.88, 0],
  ];
  for (const [len, x, z, ry] of washes) {
    // step each layer out along the wall's normal so no two surfaces share a plane
    // (they used to z-fight): wall/slats -> wash (+5 cm) -> glowing line (+10 cm)
    const nx = Math.sin(ry), nz = Math.cos(ry);
    add(new THREE.PlaneGeometry(len, 2.6), wash, x + nx * 0.05, H - 1.3, z + nz * 0.05).rotation.y = ry;
    add(new THREE.PlaneGeometry(len, 0.06), M.glow, x + nx * 0.1, SLAT_H + 0.05, z + nz * 0.1).rotation.y = ry;
  }

  // linear ceiling lights (black channels dotted with LEDs)
  const strip = new THREE.MeshBasicMaterial({ map: T.dots });
  T.dots.repeat.set(1, 14);
  for (const x of [-7.5, -3.8, 0, 3.8]) {
    const s = add(new THREE.PlaneGeometry(0.2, 17), strip, x, H - 0.01, -1.5);
    s.rotation.set(Math.PI / 2, 0, 0.32);
  }

  // ---------- reception ----------
  boxB(4.6, 1.1, 1.1, M.blackMarble, DESK_X, 0, -9.2);
  boxB(0.5, 0.02, 0.35, M.silver, DESK_X + 0.8, 1.1, -9.45);
  const screen = boxB(0.5, 0.34, 0.015, M.silver, DESK_X + 0.8, 1.12, -9.28);
  screen.rotation.x = -0.15;
  // pendant lights hanging over the desk
  const glowTex = T.glowDot;
  const sprite = (x, y, z, s, color = 0xffe2b0, opacity = 0.9) => {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false }));
    sp.position.set(x, y, z);
    sp.scale.setScalar(s);
    scene.add(sp);
    return sp;
  };
  [[-2, 4.45], [-1, 4.3], [0, 4.55], [1, 4.3], [2, 4.45]].forEach(([dx, y]) => {
    const x = DESK_X + dx;
    add(new THREE.CylinderGeometry(0.012, 0.012, H - y, 4), M.black, x, y + (H - y) / 2, -10.4);
    add(new THREE.CylinderGeometry(0.035, 0.035, 0.5, 6), M.black, x, y + 0.25, -10.4);
    add(new THREE.SphereGeometry(0.04, 6, 4), M.glow, x, y, -10.4);
    sprite(x, y - 0.05, -10.4, 0.8);
  });

  // ---------- door (front wall, far left) ----------
  const doorMat = new THREE.MeshStandardMaterial({ map: T.door, roughness: 0.6 });
  boxB(DOOR.w, DOOR.h, 0.14, M.black, DOOR.x, 0, -11.95);
  boxB(DOOR.w - 0.3, DOOR.h - 0.2, 0.1, doorMat, DOOR.x, 0, -11.88);
  for (const s of [-1, 1]) boxB(0.05, 0.9, 0.08, M.silver, DOOR.x + s * 0.14, 1.1, -11.8);

  // ---------- lounge (left wall) ----------
  const rug = add(new THREE.PlaneGeometry(5.2, 7), M.rug, -7.1, 0.01, -2);
  rug.rotation.x = -Math.PI / 2;
  // sofa against the wall, facing +x
  const sofa = new THREE.Group();
  boxB(3.3, 0.42, 1.0, M.sofaDark, 0, 0.08, 0, sofa);
  boxB(3.3, 0.6, 0.28, M.sofaDark, 0, 0.3, -0.38, sofa);
  for (const s of [-1, 1]) boxB(0.22, 0.62, 1.0, M.sofaDark, s * 1.65, 0.08, 0, sofa);
  for (const s of [-1, 1]) {
    boxB(1.5, 0.16, 0.72, M.sofa, s * 0.78, 0.5, 0.1, sofa);
    const back = boxB(1.5, 0.5, 0.2, M.sofa, s * 0.78, 0.62, -0.2, sofa);
    back.rotation.x = -0.18;
  }
  for (const [x, z] of [[-1.5, 0.4], [1.5, 0.4], [-1.5, -0.4], [1.5, -0.4]]) boxB(0.06, 0.08, 0.06, M.black, x, 0, z, sofa);
  sofa.position.set(-9.3, 0, -2);
  sofa.rotation.y = Math.PI / 2;
  scene.add(sofa);
  // armchairs facing the coffee table
  for (const [x, z] of [[-5.4, -4.6], [-5.4, 0.6]]) {
    const c = new THREE.Group();
    boxB(1.0, 0.4, 0.95, M.chair, 0, 0.1, 0, c);
    boxB(1.0, 0.75, 0.22, M.chair, 0, 0.1, -0.42, c);
    for (const s of [-1, 1]) boxB(0.18, 0.62, 0.95, M.chair, s * 0.5, 0.1, 0, c);
    boxB(0.7, 0.14, 0.62, M.chair, 0, 0.5, 0.08, c);
    for (const [lx, lz] of [[-0.42, 0.38], [0.42, 0.38], [-0.42, -0.38], [0.42, -0.38]]) boxB(0.04, 0.1, 0.04, M.black, lx, 0, lz, c);
    c.position.set(x, 0, z);
    c.rotation.y = Math.atan2(-7.4 - x, -2 - z);
    scene.add(c);
  }
  boxB(1.3, 0.34, 2.2, M.blackMarble, -7.4, 0.04, -2);
  boxB(1.1, 0.04, 2.0, M.black, -7.4, 0, -2);
  add(new THREE.CylinderGeometry(0.22, 0.22, 0.06, 12), std(0xcaa57a), -7.4, 0.41, -2.4);
  add(new THREE.CylinderGeometry(0.07, 0.06, 0.12, 8), new THREE.MeshStandardMaterial({ color: 0xdfe9ea, roughness: 0.1, transparent: true, opacity: 0.6 }), -7.3, 0.44, -1.6);
  // tripod floor lamp with a black pyramid shade
  const lamp = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const leg = add(new THREE.CylinderGeometry(0.015, 0.015, 1.5, 4), M.black, Math.cos(a) * 0.18, 0.72, Math.sin(a) * 0.18, lamp);
    leg.rotation.set(Math.sin(a) * 0.22, 0, -Math.cos(a) * 0.22);
  }
  add(new THREE.CylinderGeometry(0.015, 0.015, 0.5, 4), M.black, 0, 1.6, 0, lamp);
  const shade = add(new THREE.ConeGeometry(0.46, 0.55, 4, 1, true), new THREE.MeshStandardMaterial({ color: 0x151515, side: THREE.DoubleSide, flatShading: true }), 0, 1.95, 0, lamp);
  shade.rotation.y = Math.PI / 4;
  lamp.position.set(-9.1, 0, 1.9);
  scene.add(lamp);
  sprite(-9.1, 1.72, 1.9, 1.4, 0xffd7a0, 0.8);
  plant(-9.0, 4.4, 1.15);

  // ---------- kotak angpao (left wall, next to the sofa) ----------
  // a burgundy-draped table with a cream gift box: ribbon band, bow with tails, slot, two roses
  const GIFT = { x: -9.45, z: -4.6 }; // right beside the end of the sofa
  const clothMat = std(0x8c1d2c, { roughness: 0.9 });
  const boxMat = std(0xf2ece0, { roughness: 0.7 });
  const ribbonMat = std(0x7a1a28, { roughness: 0.45 });
  const gift = new THREE.Group();
  boxB(0.8, 0.72, 0.8, clothMat, 0, 0, 0, gift);                 // floor-length tablecloth
  boxB(0.88, 0.05, 0.88, clothMat, 0, 0.7, 0, gift);             // its overhanging top
  add(new THREE.CylinderGeometry(0.36, 0.36, 0.012, 18), std(0xf4eee2), 0, 0.756, 0, gift); // lace doily
  boxB(0.56, 0.4, 0.42, boxMat, 0, 0.762, 0, gift);              // box
  boxB(0.6, 0.07, 0.46, boxMat, 0, 1.15, 0, gift);               // lid
  boxB(0.606, 0.05, 0.466, ribbonMat, 0, 1.1, 0, gift);          // ribbon band round the lid
  boxB(0.07, 0.34, 0.01, ribbonMat, 0, 0.77, 0.216, gift);       // ribbon down the front
  for (const s of [-1, 1]) {
    const loop = add(new THREE.SphereGeometry(0.07, 6, 4), ribbonMat, s * 0.075, 1.08, 0.24, gift);
    loop.scale.set(1.5, 0.75, 0.35);
    loop.rotation.z = s * 0.35;
    const tail = boxB(0.035, 0.3, 0.008, ribbonMat, s * 0.045, 0.8, 0.236, gift);
    tail.rotation.z = s * 0.22;
  }
  add(new THREE.SphereGeometry(0.03, 6, 4), ribbonMat, 0, 1.08, 0.25, gift);        // knot
  boxB(0.22, 0.006, 0.03, M.black, 0, 1.22, -0.02, gift);                           // slot on the lid
  for (const [x, c] of [[-0.17, 0xe7a1a1], [0.17, 0xf6ead8]]) {
    add(new THREE.IcosahedronGeometry(0.04, 0), std(c, { roughness: 0.6 }), x, 1.25, 0.06, gift);   // rose
    const leaf = add(new THREE.SphereGeometry(0.03, 5, 3), M.leaf2, x + 0.05 * Math.sign(-x), 1.235, 0.08, gift);
    leaf.scale.set(1.4, 0.35, 0.8);
  }
  gift.position.set(GIFT.x, 0, GIFT.z);
  gift.rotation.y = Math.PI / 2; // front faces into the room
  scene.add(gift);
  plant(9.0, 2.3, 0.95);

  function plant(x, z, sc) {
    const g = new THREE.Group();
    const pot = add(new THREE.SphereGeometry(0.5, 10, 6), M.pot, 0, 0.36, 0, g);
    pot.scale.set(1, 0.75, 1);
    for (let i = 0; i < 13; i++) {
      const pivot = new THREE.Group();
      pivot.position.y = 0.7;
      pivot.rotation.y = (i / 13) * Math.PI * 2 + i * 0.4;
      g.add(pivot);
      const tilt = 0.25 + (i % 4) * 0.18;
      const len = 1.3 + (i % 3) * 0.35;
      const leaf = add(new THREE.ConeGeometry(0.28, len, 3), i % 2 ? M.leaf : M.leaf2, 0, len / 2, 0, pivot);
      leaf.scale.set(1, 1, 0.22);
      pivot.rotation.x = tilt;
    }
    g.position.set(x, 0, z);
    g.scale.setScalar(sc);
    scene.add(g);
  }

  // ---------- framed photos + the map board ----------
  const loader = new THREE.TextureLoader();

  function hang(p, texture) {
    const g = new THREE.Group();
    const center = new THREE.Vector3(...p.pos);
    const normal = new THREE.Vector3(...p.normal);
    g.position.copy(center);
    g.lookAt(center.clone().add(normal));
    scene.add(g);
    const frame = add(new THREE.BoxGeometry(1, 1, 0.06), M.frame, 0, 0, 0, g);
    // frame box front face at +3 cm, white mat just in front, photo well clear of both (no z-fighting)
    const mat = add(new THREE.PlaneGeometry(1, 1), M.mat, 0, 0, 0.04, g);
    const picMat = new THREE.MeshBasicMaterial({
      color: texture ? 0xffffff : 0x8a8580, map: texture || null, toneMapped: false,
      polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1,
    });
    const pic = add(new THREE.PlaneGeometry(1, 1), picMat, 0, 0, 0.07, g);
    const bar = add(new THREE.BoxGeometry(1, 0.05, 0.1), M.black, 0, 0, 0.12, g);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffe0b0, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }));
    g.add(halo);
    const layout = (aspect) => {
      const w = aspect >= 1 ? p.max : p.max * aspect;
      const h = aspect >= 1 ? p.max / aspect : p.max;
      pic.scale.set(w, h, 1);
      mat.scale.set(w + 0.24, h + 0.24, 1);
      frame.scale.set(w + 0.36, h + 0.36, 1);
      bar.scale.x = Math.max(0.6, w * 0.45);
      bar.position.y = h / 2 + 0.38;
      halo.position.set(0, h / 2 + 0.28, 0.22);
      halo.scale.set(Math.max(1.2, w * 0.9), 0.9, 1);
    };
    layout(p.aspect || 1.5);
    if (p.src) {
      loader.load(p.src, (tex) => {
        tex.image = downscale(tex.image, 1024);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 4;
        tex.needsUpdate = true;
        picMat.map = tex;
        picMat.color.set(0xffffff);
        picMat.needsUpdate = true;
        layout(tex.image.width / tex.image.height);
      });
    }
  }
  for (const p of PHOTOS) hang(p);
  hang(MAP_BOARD, T.mapBoard);

  // ---------- camera ----------
  const cam = {
    start: new THREE.Vector3(0, 1.7, 11.2),
    rest: new THREE.Vector3(0, 1.7, 7.2),
    restQ: new THREE.Quaternion(),
    euler: new THREE.Euler(0, 0, 0, 'YXZ'),
    fromPos: new THREE.Vector3(),
    fromQ: new THREE.Quaternion(),
    k: 1,
    dur: 1,
  };
  // smootherstep: speed and acceleration both ease to zero at the ends, no lurch at start/stop
  const ease = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  // the pose the camera is heading for this frame; the camera itself follows it with light smoothing
  const raw = { pos: new THREE.Vector3(), q: new THREE.Quaternion(), snap: true };
  const SMOOTH = 0.12; // seconds

  function fitCamera(camera) {
    const portrait = camera.aspect < 1;
    const fov = portrait ? 62 : 55;
    if (camera.fov !== fov) { camera.fov = fov; camera.updateProjectionMatrix(); }
    // on a narrow screen, centre on the front wall
    cam.rest.set(portrait ? -0.4 : 0, 1.7, portrait ? 4.5 : 9.0);
  }

  // glide from the doorway to the swaying rest view
  function glide(dur) {
    cam.fromPos.copy(raw.pos);
    cam.fromQ.copy(raw.q);
    cam.k = 0;
    cam.dur = dur;
  }

  return {
    scene,
    enter(camera) {
      // the room is ~24 m deep: a tight far plane gives the depth buffer far more precision
      // than the outdoor scene's 600 m, which keeps close layers (frame, mat, photo) from flickering
      camera.far = 70;
      camera.updateProjectionMatrix();
      fitCamera(camera);
      camera.position.copy(cam.start);
      camera.quaternion.identity();
      raw.pos.copy(cam.start);
      raw.q.identity();
      raw.snap = true;
      glide(3.5);
    },
    update(camera, t, dt, pointer) {
      fitCamera(camera);
      cam.euler.set(0.03 - pointer.sy * 0.2, Math.sin(t * 0.15) * 0.03 - pointer.sx * 0.65, 0);
      cam.restQ.setFromEuler(cam.euler);
      cam.k = Math.min(1, cam.k + dt / cam.dur);
      const e = ease(cam.k);
      raw.pos.lerpVectors(cam.fromPos, cam.rest, e);
      raw.q.slerpQuaternions(cam.fromQ, cam.restQ, e);
      // follow the target pose with a little lag, so the sway blends in instead of snapping
      const a = raw.snap ? 1 : 1 - Math.exp(-dt / SMOOTH);
      raw.snap = false;
      camera.position.lerp(raw.pos, a);
      camera.quaternion.slerp(raw.q, a);
    },
  };
}

// ================= helpers =================

function downscale(img, max) {
  const w = img.width, h = img.height;
  if (Math.max(w, h) <= max) return img;
  const s = max / Math.max(w, h);
  const c = document.createElement('canvas');
  c.width = Math.round(w * s);
  c.height = Math.round(h * s);
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  return c;
}

function canvasTex(w, h, draw, repeat) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

function rng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function veins(g, w, h, r, n, style, width) {
  g.strokeStyle = style;
  for (let i = 0; i < n; i++) {
    g.lineWidth = width * (0.4 + r());
    g.beginPath();
    let x = r() * w, y = r() * h;
    g.moveTo(x, y);
    for (let s = 0; s < 4; s++) {
      const nx = x + (r() - 0.5) * w * 0.6, ny = y + (r() - 0.3) * h * 0.5;
      g.quadraticCurveTo(x + (r() - 0.5) * w * 0.3, y + (r() - 0.5) * h * 0.3, nx, ny);
      x = nx; y = ny;
    }
    g.stroke();
  }
}

function makeTextures() {
  const T = {};

  T.marble = canvasTex(1024, 1024, (g, w, h) => {
    const r = rng(11);
    g.fillStyle = '#c3c2bf'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 70; i++) {
      const x = r() * w, y = r() * h, rad = 40 + r() * 160;
      const grd = g.createRadialGradient(x, y, 0, x, y, rad);
      const c = r() > 0.5 ? '255,255,255' : '140,138,134';
      grd.addColorStop(0, `rgba(${c},0.18)`); grd.addColorStop(1, `rgba(${c},0)`);
      g.fillStyle = grd; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    veins(g, w, h, r, 16, 'rgba(120,118,114,0.35)', 2);
    veins(g, w, h, r, 10, 'rgba(255,255,255,0.5)', 1.5);
    g.strokeStyle = 'rgba(150,148,144,0.6)'; g.lineWidth = 2;
    for (let i = 0; i <= 2; i++) {
      g.beginPath(); g.moveTo(0, (i * h) / 2); g.lineTo(w, (i * h) / 2); g.stroke();
      g.beginPath(); g.moveTo((i * w) / 2, 0); g.lineTo((i * w) / 2, h); g.stroke();
    }
  }, true);

  T.blackMarble = canvasTex(512, 256, (g, w, h) => {
    const r = rng(5);
    g.fillStyle = '#131314'; g.fillRect(0, 0, w, h);
    veins(g, w, h, r, 6, 'rgba(70,70,74,0.6)', 3);
    veins(g, w, h, r, 9, 'rgba(235,235,235,0.85)', 1.4);
  });

  // oak panels with thin black joints, like the wall behind the reception
  T.panels = canvasTex(1024, 336, (g, w, h) => {
    const grd = g.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, '#d8a870'); grd.addColorStop(1, '#b7854f');
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
    const r = rng(3);
    g.strokeStyle = 'rgba(120,80,40,0.18)';
    for (let i = 0; i < 160; i++) {
      g.lineWidth = 1 + r();
      const x = r() * w;
      g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + 6, h * 0.3, x - 6, h * 0.7, x + 3, h); g.stroke();
    }
    g.strokeStyle = '#161210'; g.lineWidth = 3;
    const line = (x1, y1, x2, y2) => { g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); };
    line(0, h * 0.52, w, h * 0.52);
    line(0, h * 0.8, w, h * 0.8);
    for (const x of [0.12, 0.3, 0.46, 0.6, 0.74, 0.88]) line(x * w, 0, x * w, h * 0.52);
    for (const x of [0.2, 0.4, 0.55, 0.7, 0.82]) line(x * w, h * 0.52, x * w, h * 0.8);
    for (const x of [0.08, 0.33, 0.62, 0.9]) line(x * w, h * 0.8, x * w, h);
  });

  // double wooden door with grooves and a centre seam
  T.door = canvasTex(256, 384, (g, w, h) => {
    const grd = g.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, '#6b4a2e'); grd.addColorStop(1, '#4e341f');
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(20,12,6,0.55)'; g.lineWidth = 2;
    for (let x = 16; x < w; x += 16) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    g.fillStyle = '#140d07'; g.fillRect(w / 2 - 2, 0, 4, h);
  });

  const drawBoard = (g, w, h) => {
    g.fillStyle = '#f2ece1'; g.fillRect(0, 0, w, h);
    // stylised street map
    const top = 120, bottom = h - 150;
    g.fillStyle = '#e4ddd0'; g.fillRect(40, top, w - 80, bottom - top);
    const r = rng(17);
    g.fillStyle = '#d6cebf';
    for (let i = 0; i < 26; i++) g.fillRect(50 + r() * (w - 160), top + 10 + r() * (bottom - top - 70), 40 + r() * 70, 26 + r() * 40);
    g.strokeStyle = '#ffffff'; g.lineCap = 'round';
    const road = (pts, width) => { g.lineWidth = width; g.beginPath(); g.moveTo(...pts[0]); for (const p of pts.slice(1)) g.lineTo(...p); g.stroke(); };
    road([[40, top + 90], [w - 40, top + 150]], 18);
    road([[260, top], [330, bottom]], 14);
    road([[w - 300, top], [w - 360, bottom]], 14);
    road([[40, bottom - 60], [w - 40, bottom - 110]], 10);
    g.strokeStyle = '#a9c4d6'; g.lineWidth = 14;
    g.beginPath(); g.moveTo(40, bottom - 20); g.bezierCurveTo(300, bottom - 70, 600, bottom + 10, w - 40, bottom - 40); g.stroke();
    // pin
    const px = w / 2 + 20, py = top + 170;
    g.fillStyle = 'rgba(0,0,0,0.18)'; g.beginPath(); g.ellipse(px, py + 6, 22, 8, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#b8862f';
    g.beginPath(); g.arc(px, py - 52, 30, Math.PI, 0); g.lineTo(px, py); g.closePath(); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(px, py - 52, 11, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#1d1712'; g.font = '600 26px Jost, sans-serif'; g.textAlign = 'center';
    g.fillText('Golden Boutique Hotel', px, py + 44);
    // header + times
    g.fillStyle = '#1d1712'; g.fillRect(0, 0, w, 96);
    g.fillStyle = '#d6ae5a'; g.font = '500 34px Jost, sans-serif';
    g.fillText('L O K A S I   &   T E M P A T', w / 2, 60);
    g.fillStyle = '#3a2e22'; g.font = 'italic 40px "Cormorant Garamond", Georgia, serif';
    g.fillText('Akad 13.00 WIB  ·  Resepsi 16.00 WIB', w / 2, h - 88);
    g.font = '500 24px Jost, sans-serif'; g.fillStyle = '#8a6326';
    g.fillText('SABTU, 24 OKTOBER 2026', w / 2, h - 40);
  };
  T.mapBoard = canvasTex(1024, 706, drawBoard);
  if (document.fonts) {
    document.fonts.ready.then(() => {
      drawBoard(T.mapBoard.image.getContext('2d'), 1024, 706);
      T.mapBoard.needsUpdate = true;
    });
  }

  T.rug = canvasTex(256, 256, (g, w, h) => {
    const r = rng(9);
    g.fillStyle = '#48484a'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 1500; i++) {
      g.fillStyle = r() > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)';
      g.fillRect(r() * w, r() * h, 2, 2);
    }
  });

  T.dots = canvasTex(16, 64, (g, w, h) => {
    g.fillStyle = '#141414'; g.fillRect(0, 0, w, h);
    const grd = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, 7);
    grd.addColorStop(0, '#ffffff'); grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd; g.fillRect(0, h / 2 - 8, w, 16);
  }, true);

  T.wash = canvasTex(4, 128, (g, w, h) => {
    const grd = g.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, 'rgba(255,214,160,0.75)');
    grd.addColorStop(0.35, 'rgba(255,200,140,0.25)');
    grd.addColorStop(1, 'rgba(255,200,140,0)');
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
  });

  T.glowDot = canvasTex(64, 64, (g, w, h) => {
    const grd = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    grd.addColorStop(0, 'rgba(255,255,255,1)');
    grd.addColorStop(0.25, 'rgba(255,255,255,0.6)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
  });

  return T;
}
