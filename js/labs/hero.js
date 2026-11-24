/* hero.js — decorative header scene: a wheel turned by a tangent force (no controls). */
"use strict";
(function () {
  const host = document.getElementById("hero3d");
  if (!host || !Lab.webgl()) return;
  const r = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  r.setPixelRatio(Math.min(devicePixelRatio, 2));
  r.outputColorSpace = THREE.SRGBColorSpace;
  host.prepend(r.domElement);
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(34, 1, .1, 50);
  cam.position.set(1.6, .9, 5.2); cam.lookAt(0.2, 0, 0);
  scene.add(new THREE.HemisphereLight(0xdfe9ff, 0x1a2230, 1.3));
  const dl = new THREE.DirectionalLight(0xffffff, 1.7); dl.position.set(3, 4, 5); scene.add(dl);

  const R = 1.15;
  const wheel = new THREE.Group();
  const metal = G.mat(C3.body, { metalness: .55, roughness: .3 });
  wheel.add(new THREE.Mesh(new THREE.TorusGeometry(R, .07, 20, 90), metal));
  for (let i = 0; i < 3; i++) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(R * 2, .07, .05), G.mat(C3.body2));
    s.rotation.z = i * Math.PI / 3; wheel.add(s);
  }
  wheel.add(new THREE.Mesh(new THREE.CylinderGeometry(.16, .16, .14, 30).rotateX(Math.PI / 2), G.mat(C3.body2)));
  scene.add(wheel, axisRod(1.4, .04));

  const F = new Arrow3(C3.force, { r: .035, head: .2, headR: .09 });
  const arm = new Bar3(C3.arm, .022);
  const turn = new TurnArrow3(C3.torque, .55, .025);
  scene.add(F, arm, turn);
  turn.set(1, 1.9, -.4);
  const A = new THREE.Vector3(R, 0, 0);
  F.set(A, new THREE.Vector3(0, 1, 0), 1.0);
  arm.between(new THREE.Vector3(), A);

  const size = () => { const w = host.clientWidth, hh = host.clientHeight; r.setSize(w, hh, false); cam.aspect = w / hh; cam.updateProjectionMatrix(); };
  new ResizeObserver(size).observe(host); size();
  let vis = true, t0 = performance.now();
  new IntersectionObserver(e => { vis = e[0].isIntersecting; if (vis) requestAnimationFrame(tick); }).observe(host);
  function tick(now) {
    const t = (now - t0) / 1000;
    wheel.rotation.z = REDUCED ? .2 : t * .6;
    scene.rotation.y = REDUCED ? -.25 : -.25 + Math.sin(t * .25) * .18;
    r.render(scene, cam);
    if (vis && !REDUCED) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
