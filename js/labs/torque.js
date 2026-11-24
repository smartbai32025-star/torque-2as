/* torque.js — Lab 2: torque of one force about an axis; lever arm d as the perpendicular to the line of action. */
"use strict";
(function () {
  const host = document.getElementById("lab-torque");
  const lab = new Lab(host, { title: "مختبر 2: عزم قوة وذراعها", cam: [1.1, 0.9, 4.6], target: [0.95, 0.1, 0], aspectFit: 1.3, maxDist: 16 });
  LABS.push(lab);
  const P = lab.panel;
  const st = { F: 10, OA: .8, al: 60, par: false, pos: "ccw", swing: 0, swingT: -1 };
  const K = 2.2;

  P.append(h("h4", {}, "غيّر القوة"));
  const sF = UI.slider(P, { label: "الشدّة F", min: 0, max: 20, step: .5, value: st.F, unit: "N", cls: "force", show: v => fmtT(v, 1), onInput: v => { st.F = v; } });
  const sA = UI.slider(P, { label: "بعد نقطة التطبيق OA", min: .1, max: 1, step: .05, value: st.OA, unit: "m", cls: "arm", onInput: v => { st.OA = v; } });
  const sAl = UI.slider(P, { label: "الزاوية α بين القوة و OA", min: 0, max: 180, step: 1, value: st.al, unit: "°", cls: "force", show: v => String(v), onInput: v => { st.al = v; st.par = false; } });
  P.append(h("h4", {}, "حالات خاصة"));
  UI.btns(P, [
    ["مماسية α = 90°", () => { st.par = false; sAl.set(90); }],
    ["حاملها يمرّ بالمحور", () => { st.par = false; sAl.set(0); }],
    ["موازية للمحور", () => { st.par = true; }],
  ]);
  P.append(h("h4", {}, "الجهة الموجبة"));
  UI.seg(P, [["ccw", "عكس عقارب الساعة"], ["cw", "مع عقارب الساعة"]], st.pos, k => st.pos = k);
  const out = UI.readout(P, [["d", "الذراع"], ["M", "العزم"]]);
  const say = UI.verdict(P);
  UI.btns(P, [["شاهد أثر القوة", () => { st.swingT = 0; }, "primary"]]);
  if (!lab.ok) { tick(0); return; }

  const S = lab.scene;
  S.add(axisRod(1.4, .04));
  const body = new THREE.Group(); S.add(body);
  const bar = new THREE.Mesh(new THREE.BoxGeometry(1.08 * K, .16, .1), G.mat(C3.body, { metalness: .35, roughness: .4 }));
  bar.position.x = 1.08 * K / 2 - .08; body.add(bar);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(.12, .12, .16, 30).rotateX(Math.PI / 2), G.mat(C3.body2)); body.add(hub);
  const Am = new THREE.Mesh(new THREE.SphereGeometry(.06, 18, 12), G.mat(0xffffff, { emissive: 0xffffff, emissiveIntensity: .3 })); body.add(Am);
  const Fv = new Arrow3(C3.force, { r: .03, head: .18, headR: .08 }); body.add(Fv);
  const line = new Poly3(C3.force, { dashed: true, opacity: .75 }); body.add(line);
  const arm = new Bar3(C3.arm, .025); body.add(arm);
  const right = new Poly3(C3.arm); body.add(right);
  const angArc = new Poly3(0xffffff, { opacity: .8 }); body.add(angArc);
  const ext = new Poly3(C3.light, { dashed: true, opacity: .5 }); body.add(ext);
  const turn = new TurnArrow3(C3.torque, .48, .025); turn.position.z = .12; S.add(turn);
  const L = { O: lab.label("O"), A: lab.label("A"), F: lab.label("F"), d: lab.label("d"), H: lab.label("H"), al: lab.label("α"), D: lab.label("(Δ)") };
  L.F.el.style.color = "#ff9b7d"; L.d.el.style.color = "#5fe3d3";
  let lastSign = null;

  function tick(dt) {
    const a = st.al * DEG, F = st.F, OA = st.OA;
    const d = st.par ? 0 : OA * Math.abs(Math.sin(a));
    const Mz = st.par ? 0 : OA * F * Math.sin(a);                    // + = counter-clockwise (seen from the front)
    const s = st.pos === "ccw" ? 1 : -1;
    const M = s * Mz;
    out("d", st.par ? "d = 0\\ (\\text{موازية للمحور})" : `d = OA\\sin\\alpha = ${fmt(OA, 2)}\\times\\sin ${Math.round(st.al)}^\\circ = ${fmt(d, 3)}\\ \\text{m}`);
    out("M", `M_{/\\Delta} = ${Math.abs(M) < 1e-9 ? "" : M > 0 ? "+" : "-"}F\\,d = ${fmt(M, 2)}\\ \\text{N}\\cdot\\text{m}`);
    if (Math.abs(Mz) < 1e-6) say(st.par ? "القوة موازية للمحور: لا تستطيع إدارة الجسم حوله، فعزمها معدوم." : (F === 0 ? "لا قوة، فلا عزم." : "حامل القوة يمرّ بالمحور: الذراع معدوم، فالعزم معدوم ولا يدور الجسم."), "warn");
    else say(`القوة تدير الجسم ${Mz > 0 ? "عكس" : "مع"} عقارب الساعة، أي في الجهة ${M > 0 ? "<b>الموجبة</b> فالعزم موجب" : "<b>السالبة</b> فالعزم سالب"}.`, M > 0 ? "ok" : "");
    if (!lab.ok) return;

    // swing preview: rotate the body a little in the direction of the torque
    let sw = 0;
    if (st.swingT >= 0) {
      st.swingT += dt;
      const T = st.swingT, k = T < 1 ? (1 - Math.cos(Math.PI * T)) / 2 : T < 1.6 ? 1 : T < 2.4 ? (1 + Math.cos(Math.PI * (T - 1.6) / .8)) / 2 : 0;
      sw = Math.sign(Mz) * Math.min(1, Math.abs(Mz) / 4 + .25) * .6 * k;
      if (T >= 2.4) st.swingT = -1;
    }
    body.rotation.z = sw;

    const A = new THREE.Vector3(OA * K, 0, .06);
    Am.position.copy(A);
    const f = st.par ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(Math.cos(a), Math.sin(a), 0);
    Fv.set(A, f, F * .075);
    if (st.par) { line.visible = false; arm.visible = false; right.visible = false; angArc.visible = false; ext.visible = false; }
    else {
      line.visible = true; ext.visible = true;
      line.setPoints([A.clone().addScaledVector(f, -4.5), A.clone().addScaledVector(f, 4.5)]);
      ext.setPoints([A, A.clone().add(new THREE.Vector3(.7, 0, 0))]);
      const O = new THREE.Vector3(0, 0, .06);
      const Hh = A.clone().addScaledVector(f, -A.clone().sub(O).dot(f));
      arm.between(O, Hh); arm.visible = d > .005;
      // right-angle mark at H
      if (d > .05) {
        const toO = O.clone().sub(Hh).normalize(), q = .14, sg = Hh.clone().sub(A).dot(f) > 0 ? -1 : 1;
        const p1 = Hh.clone().addScaledVector(toO, q), p2 = p1.clone().addScaledVector(f, q * sg), p3 = Hh.clone().addScaledVector(f, q * sg);
        right.setPoints([p1, p2, p3]); right.visible = true;
      } else right.visible = false;
      angArc.visible = st.al > 2 && st.al < 178;
      if (angArc.visible) angArc.setPoints(arcPoints(A, .36, 0, a));
      const w = v => body.localToWorld(v.clone());
      L.H.at(w(Hh.clone().add(new THREE.Vector3(.12, .14, 0)))); L.H.on = d > .05;
      L.d.at(w(O.clone().lerp(Hh, .5).add(new THREE.Vector3(-.12, .1, 0)))); L.d.on = d > .05;
      L.al.at(w(A.clone().add(new THREE.Vector3(Math.cos(a / 2), Math.sin(a / 2), 0).multiplyScalar(.52)))); L.al.on = angArc.visible;
    }
    const w = v => body.localToWorld(v.clone());
    if (st.par) { L.H.on = L.d.on = L.al.on = false; }
    L.O.at(w(new THREE.Vector3(-.2, -.22, 0))); L.A.at(w(A.clone().add(new THREE.Vector3(.05, -.24, 0))));
    L.F.at(w(A.clone().addScaledVector(f, F * .075 + .2))); L.F.on = F > 0;
    L.D.at(new THREE.Vector3(0, .25, .75));
    const sign = Math.abs(Mz) < 1e-6 ? 0 : Math.sign(Mz);
    if (sign !== lastSign) { turn.set(sign, 1.5, sign > 0 ? 2.2 : 2.2 + 1.5); lastSign = sign; }
  }
  lab.onFrame(tick);
  tick(0);
})();
