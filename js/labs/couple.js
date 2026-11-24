/* couple.js — Lab 3: a couple on a steering wheel; its torque does not depend on where the axis is. */
"use strict";
(function () {
  const host = document.getElementById("lab-couple");
  const lab = new Lab(host, { title: "مختبر 3: مزدوجة على مقود", cam: [0.5, 0.6, 5.9], target: [0, -.15, 0], aspectFit: 1.15 });
  LABS.push(lab);
  const P = lab.panel;
  const st = { F: 15, R: .2, x: 0, spin: false, phi: 0 };
  const K = 6.5; // units per metre (R = 0.2 m -> 1.3 units)

  P.append(h("h4", {}, "المزدوجة"));
  UI.slider(P, { label: "شدّة كل قوة F", min: 0, max: 30, step: .5, value: st.F, unit: "N", cls: "force", show: v => fmtT(v, 1), onInput: v => st.F = v });
  UI.slider(P, { label: "نصف قطر المقود R", min: .12, max: .22, step: .01, value: st.R, unit: "m", cls: "arm", onInput: v => { st.R = v; build(); } });
  P.append(h("h4", {}, "حرّك المحور الذي نحسب بالنسبة إليه"));
  UI.slider(P, { label: "موضع المحور Δ′ على القطر", min: -1, max: 1, step: .05, value: 0, cls: "axis", show: v => v === 0 ? "المركز" : fmtT(v * st.R * 100, 0) + " cm", onInput: v => st.x = v });
  const out = UI.readout(P, [["M1", "عزم F₁ بالنسبة لـ Δ′"], ["M2", "عزم F₂ بالنسبة لـ Δ′"], ["M", "عزم المزدوجة"], ["S", "محصّلة القوتين"]]);
  UI.btns(P, [["أدر المقود", b => { st.spin = !st.spin; b.textContent = st.spin ? "أوقف" : "أدر المقود"; }, "primary"]]);
  UI.note(P, "حرّك المحور: يتغيّر عزم كل قوة، لكن <b>مجموعهما يبقى</b> $F\\cdot 2R$.");
  if (!lab.ok) { tick(0); return; }

  const S = lab.scene;
  const g = new THREE.Group(); S.add(g);
  const wheel = new THREE.Group(); g.add(wheel);
  S.add(axisRod(1.0, .03));
  const F1 = new Arrow3(C3.force, { r: .03, head: .18, headR: .08 }), F2 = new Arrow3(C3.force, { r: .03, head: .18, headR: .08 });
  const l1 = new Poly3(C3.force, { dashed: true, opacity: .6 }), l2 = new Poly3(C3.force, { dashed: true, opacity: .6 });
  const dBar = new Bar3(C3.arm, .02), d1 = new Bar3(0xffd27a, .016), d2 = new Bar3(0xffd27a, .016);
  const piv = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, .5, 20).rotateX(Math.PI / 2), G.mat(C3.axis, { transparent: true, opacity: .85, emissive: C3.axis, emissiveIntensity: .3 }));
  g.add(F1, F2, l1, l2, dBar, d1, d2, piv);
  const turn = new TurnArrow3(C3.torque, .45, .025); turn.position.z = .15; S.add(turn); turn.set(1, 1.5, 2.3);
  const L = { F1: lab.label("F<sub>1</sub>"), F2: lab.label("F<sub>2</sub>"), d: lab.label("d = 2R"), p: lab.label("Δ′") };
  L.F1.el.style.color = L.F2.el.style.color = "#ff9b7d"; L.d.el.style.color = "#5fe3d3"; L.p.el.style.color = "#ffd27a";

  function build() {
    wheel.clear();
    const Rk = st.R * K;
    wheel.add(new THREE.Mesh(new THREE.TorusGeometry(Rk, .08, 20, 90), G.mat(0x3b4654, { roughness: .6 })));
    for (let i = 0; i < 3; i++) {
      const sp = new THREE.Mesh(new THREE.BoxGeometry(Rk, .1, .06), G.mat(C3.body2));
      const a = Math.PI / 2 + i * 2 * Math.PI / 3 + Math.PI;
      sp.position.set(Math.cos(a) * Rk / 2, Math.sin(a) * Rk / 2, 0); sp.rotation.z = a; wheel.add(sp);
    }
    wheel.add(new THREE.Mesh(new THREE.CylinderGeometry(.28, .28, .14, 36).rotateX(Math.PI / 2), G.mat(C3.body2)));
  }
  build();

  function tick(dt) {
    const F = st.F, R = st.R, x = st.x * R;
    const M1 = F * (R - x), M2 = F * (R + x), M = 2 * F * R;
    out("M1", `+F\\,(R-x) = ${fmt(M1, 2)}\\ \\text{N}\\cdot\\text{m}`);
    out("M2", `+F\\,(R+x) = ${fmt(M2, 2)}\\ \\text{N}\\cdot\\text{m}`);
    out("M", `M = F\\cdot 2R = ${fmt(M, 2)}\\ \\text{N}\\cdot\\text{m}`);
    out("S", `\\vec F_1+\\vec F_2=\\vec 0`);
    if (!lab.ok) return;
    if (st.spin && !REDUCED) st.phi += dt * (.25 + M / 12);
    g.rotation.z = st.phi;
    const Rk = R * K, xk = x * K, z = .12;
    const A1 = new THREE.Vector3(Rk, 0, z), A2 = new THREE.Vector3(-Rk, 0, z);
    const up = new THREE.Vector3(0, 1, 0), dn = new THREE.Vector3(0, -1, 0), len = F * .045;
    F1.set(A1, up, len); F2.set(A2, dn, len);
    l1.setPoints([new THREE.Vector3(Rk, -2.2, z), new THREE.Vector3(Rk, 2.2, z)]);
    l2.setPoints([new THREE.Vector3(-Rk, -2.2, z), new THREE.Vector3(-Rk, 2.2, z)]);
    dBar.between(new THREE.Vector3(-Rk, -Rk - .3, z), new THREE.Vector3(Rk, -Rk - .3, z));
    piv.position.set(xk, 0, z);
    d1.between(new THREE.Vector3(xk, .2, z), new THREE.Vector3(Rk, .2, z));
    d2.between(new THREE.Vector3(xk, -.2, z), new THREE.Vector3(-Rk, -.2, z));
    const w = v => g.localToWorld(v.clone());
    L.F1.at(w(new THREE.Vector3(Rk + .25, len + .1, z))); L.F2.at(w(new THREE.Vector3(-Rk - .25, -len - .1, z)));
    L.F1.on = L.F2.on = F > 0;
    L.d.at(w(new THREE.Vector3(0, -Rk - .52, z)));
    L.p.at(w(new THREE.Vector3(xk, .42, z + .2)));
  }
  lab.onFrame(tick);
  tick(0);
})();
