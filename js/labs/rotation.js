/* rotation.js — Lab 1: angle swept, arc length, angular and linear speed of two points. */
"use strict";
(function () {
  const host = document.getElementById("lab-rot");
  const lab = new Lab(host, { title: "مختبر 1: قرص يدور", cam: [0.9, 1.0, 4.6], target: [0, 0, 0], aspectFit: 1.1 });
  LABS.push(lab);
  const P = lab.panel;
  const st = { R: .5, w: 1.2, th: 0, run: true };
  const K = 2.6; // scene units per metre

  P.append(h("h4", {}, "المقادير"));
  const sR = UI.slider(P, { label: "نصف القطر R", min: .2, max: .6, step: .01, value: st.R, unit: "m", cls: "arm", onInput: v => { st.R = v; build(); } });
  const sW = UI.slider(P, { label: "السرعة الزاوية ω", min: 0, max: 3, step: .05, value: st.w, unit: "rad/s", cls: "energy", onInput: v => st.w = v });
  const [bRun] = UI.btns(P, [["إيقاف", b => { st.run = !st.run; b.textContent = st.run ? "إيقاف" : "تشغيل"; }, "primary"], ["صفّر الزاوية", () => { st.th = 0; }]]);
  const out = UI.readout(P, [["th", "الزاوية الممسوحة"], ["n", "عدد الدورات"], ["S", "القوس الذي قطعته M"], ["vM", "سرعة M (على المحيط)"], ["vN", "سرعة N (في المنتصف)"]]);
  UI.note(P, "<b>لاحظ:</b> للنقطتين $M$ و $N$ السرعة الزاوية نفسها، لكن $v_M = 2\\,v_N$ لأن $v = R\\,\\omega$.");
  if (!lab.ok) { update(); return; }

  const S = lab.scene;
  const disc = new THREE.Group(); S.add(disc);
  const ax = axisRod(1.6, .035); S.add(ax);
  const arc = new Poly3(C3.torque); S.add(arc);
  const sector = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({ color: C3.torque, transparent: true, opacity: .22, side: THREE.DoubleSide, depthWrite: false }));
  S.add(sector);
  const r0 = new Poly3(C3.light, { dashed: true, opacity: .8 }); S.add(r0);
  const vM = new Arrow3(C3.energy), vN = new Arrow3(C3.arm);
  S.add(vM, vN);
  const mk = (c, s = .07) => new THREE.Mesh(new THREE.SphereGeometry(s, 20, 14), G.mat(c, { emissive: c, emissiveIntensity: .4 }));
  const M = mk(0xffffff), N = mk(C3.arm), M1 = mk(0xffffff, .05);
  M1.material = M1.material.clone(); M1.material.transparent = true; M1.material.opacity = .45;
  S.add(M, N, M1);
  const L = { O: lab.label("O"), M: lab.label("M"), N: lab.label("N"), M1: lab.label("M<sub>1</sub>"), th: lab.label("θ"), S: lab.label("S") };
  L.th.el.style.color = "#c9b6ff"; L.S.el.style.color = "#c9b6ff";

  function build() {
    disc.clear();
    const Rk = st.R * K;
    const d = new THREE.Mesh(new THREE.CylinderGeometry(Rk, Rk, .08, 72).rotateX(Math.PI / 2), G.mat(0x2c3e52, { metalness: .3, roughness: .5, transparent: true, opacity: .92 }));
    d.position.z = -.06; disc.add(d);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(Rk, .02, 10, 100), G.mat(C3.body));
    rim.position.z = -.02; disc.add(rim);
    for (let i = 0; i < 12; i++) {
      const t = new THREE.Mesh(new THREE.BoxGeometry(.012, .1, .01), G.mat(C3.body));
      const a = i * Math.PI / 6; t.position.set((Rk - .08) * Math.cos(a), (Rk - .08) * Math.sin(a), .0); t.rotation.z = a + Math.PI / 2; disc.add(t);
    }
    M1.position.set(Rk, 0, .02);
    r0.setPoints([new THREE.Vector3(0, 0, .02), new THREE.Vector3(Rk, 0, .02)]);
    L.M1.at(new THREE.Vector3(Rk + .22, -.12, 0));
    L.O.at(new THREE.Vector3(-.14, -.14, 0));
  }
  build();

  function update() {
    const Rk = st.R * K, th = st.th, a = th % (2 * Math.PI);
    out("th", `\\theta = ${fmt(th, 2)}\\ \\text{rad}`);
    out("n", `n = \\dfrac{\\theta}{2\\pi} = ${fmt(th / (2 * Math.PI), 2)}\\ \\text{tr}`);
    out("S", `S = R\\theta = ${fmt(st.R * th, 2)}\\ \\text{m}`);
    out("vM", `v_M = R\\omega = ${fmt(st.R * st.w, 2)}\\ \\text{m/s}`);
    out("vN", `v_N = \\tfrac R2\\omega = ${fmt(st.R / 2 * st.w, 2)}\\ \\text{m/s}`);
    if (!lab.ok) return;
    disc.rotation.z = th;
    const u = new THREE.Vector3(Math.cos(th), Math.sin(th), 0), tng = new THREE.Vector3(-Math.sin(th), Math.cos(th), 0);
    const pM = u.clone().multiplyScalar(Rk).setZ(.02), pN = u.clone().multiplyScalar(Rk / 2).setZ(.02);
    M.position.copy(pM); N.position.copy(pN);
    vM.set(pM, tng, st.R * st.w * 1.1); vN.set(pN, tng, st.R / 2 * st.w * 1.1);
    const ar = a < .01 ? [] : arcPoints(new THREE.Vector3(0, 0, .03), Rk, 0, a, undefined, undefined, Math.max(8, Math.ceil(a * 20)));
    arc.visible = ar.length > 1; if (arc.visible) arc.setPoints(ar);
    // sector for θ
    sector.geometry.dispose();
    if (a > .01) {
      const pts = [new THREE.Vector3(0, 0, .01), ...arcPoints(new THREE.Vector3(0, 0, .01), Rk * .38, 0, a, undefined, undefined, 40)];
      const idx = []; for (let i = 1; i < pts.length - 1; i++) idx.push(0, i, i + 1);
      const g = new THREE.BufferGeometry().setFromPoints(pts); g.setIndex(idx); sector.geometry = g; sector.visible = true;
    } else sector.visible = false;
    L.M.at(pM.clone().add(u.clone().multiplyScalar(.2)));
    L.N.at(pN.clone().add(new THREE.Vector3(0, 0, 0)).addScaledVector(u, -.16).addScaledVector(tng, -.12));
    L.th.at(new THREE.Vector3(Math.cos(a / 2), Math.sin(a / 2), 0).multiplyScalar(Rk * .25)); L.th.on = a > .25;
    L.S.at(new THREE.Vector3(Math.cos(a / 2), Math.sin(a / 2), 0).multiplyScalar(Rk + .25)); L.S.on = a > .3;
  }
  lab.onFrame(dt => { if (st.run && !REDUCED) st.th += st.w * dt; else if (st.run && REDUCED) st.th += st.w * dt; update(); });
  update();
})();
