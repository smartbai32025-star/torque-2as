/* balance.js — Lab 5: a rod pivoting at its centre with two hanging masses; equilibrium when the sum of torques is zero. */
"use strict";
(function () {
  const host = document.getElementById("lab-balance");
  const lab = new Lab(host, { title: "مختبر 5: ابحث عن التوازن", cam: [0, .6, 5.4], target: [0, -.35, 0], aspectFit: 1.3 });
  LABS.push(lab);
  const P = lab.panel;
  const g = 10, HALF = .3, K = 6; // half-length of the rod in metres, units per metre
  const st = { m1: 40, x1: .2, m2: 80, x2: .05, tilt: 0 };

  P.append(h("h4", {}, "الجسم الأيسر (A)"));
  const s1 = UI.slider(P, { label: "الكتلة m₁", min: 10, max: 200, step: 5, value: st.m1, unit: "g", cls: "force", show: v => String(v), onInput: v => st.m1 = v });
  const sx1 = UI.slider(P, { label: "البعد OA", min: 0, max: HALF, step: .01, value: st.x1, unit: "m", cls: "arm", onInput: v => st.x1 = v });
  P.append(h("h4", {}, "الجسم الأيمن (C)"));
  const s2 = UI.slider(P, { label: "الكتلة m₂", min: 10, max: 200, step: 5, value: st.m2, unit: "g", cls: "force", show: v => String(v), onInput: v => st.m2 = v });
  const sx2 = UI.slider(P, { label: "البعد OC", min: 0, max: HALF, step: .01, value: st.x2, unit: "m", cls: "arm", onInput: v => st.x2 = v });
  const out = UI.readout(P, [["M1", "عزم ثقل m₁"], ["M2", "عزم ثقل m₂"], ["MR", "عزم ردّ فعل المحور"], ["S", "المجموع"]]);
  const say = UI.verdict(P);
  UI.btns(P, [["تحدّي التمرين (10)", () => { s1.set(40); sx1.set(.2); s2.set(80); sx2.set(0); }, "primary"]]);
  UI.note(P, "<b>تحدٍّ:</b> $m_1=40\\,\\text{g}$ على بعد $20\\,\\text{cm}$. حرّك $m_2=80\\,\\text{g}$ حتى يتوازن الساق. أين يجب أن تكون؟ ثم تحقّق بالحساب: $m_1\\cdot OA=m_2\\cdot OC$.");
  if (!lab.ok) { tick(0); return; }

  const S = lab.scene;
  S.add(axisRod(.7, .045));
  const stand = new THREE.Mesh(new THREE.BoxGeometry(.18, 2.0, .18), G.mat(0x2c3a4a)); stand.position.set(0, -1.05, -.25); S.add(stand);
  const base = new THREE.Mesh(new THREE.BoxGeometry(1.4, .1, .8), G.mat(0x2c3a4a)); base.position.set(0, -2.05, -.25); S.add(base);
  const beam = new THREE.Group(); S.add(beam);
  beam.add(new THREE.Mesh(new THREE.BoxGeometry(2 * HALF * K + .3, .12, .16), G.mat(0xd4b483, { roughness: .7 })));
  for (let i = -6; i <= 6; i++) {
    const t = new THREE.Mesh(new THREE.BoxGeometry(.012, i % 2 ? .05 : .09, .01), G.mat(0x3a2c18));
    t.position.set(i * .05 * K, .02, .085); beam.add(t);
  }
  const mkLoad = c => {
    const grp = new THREE.Group();
    const str = new THREE.Mesh(new THREE.CylinderGeometry(.008, .008, 1, 6), G.mat(0xdddddd)); grp.add(str);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(.16, .16, .3, 28), G.mat(c, { metalness: .5, roughness: .3 })); grp.add(body);
    const P = new Arrow3(C3.force, { r: .022, head: .13, headR: .06 }); grp.add(P);
    grp.userData = { str, body, P }; S.add(grp); return grp;
  };
  const W1 = mkLoad(0x8fa3b8), W2 = mkLoad(0xc9a26a);
  const turn = new TurnArrow3(C3.torque, .4, .022); turn.position.set(0, 0, .25); S.add(turn);
  const L = { O: lab.label("O"), A: lab.label("A"), C: lab.label("C"), P1: lab.label("P<sub>1</sub>"), P2: lab.label("P<sub>2</sub>") };
  L.P1.el.style.color = L.P2.el.style.color = "#ff9b7d";
  let lastSign = null;

  function hang(W, x, m) {
    const p = beam.localToWorld(new THREE.Vector3(x, -.06, 0));
    const len = .9, { str, body, P } = W.userData;
    W.position.set(0, 0, 0);
    str.position.set(p.x, p.y - len / 2, 0); str.scale.y = len;
    const s = .6 + Math.cbrt(m / 80) * .45;
    body.scale.set(s, s, s); body.position.set(p.x, p.y - len - .15 * s, 0);
    P.set(new THREE.Vector3(p.x, p.y - len - .15 * s, .25), new THREE.Vector3(0, -1, 0), m / 1000 * g * .9);
    return body.position;
  }

  function tick(dt) {
    const M1 = st.m1 / 1000 * g * st.x1, M2 = -st.m2 / 1000 * g * st.x2, Sum = M1 + M2;
    out("M1", `+m_1g\\cdot OA=${fmt(M1, 3)}\\ \\text{N}\\cdot\\text{m}`);
    out("M2", `-m_2g\\cdot OC=${fmt(M2, 3)}\\ \\text{N}\\cdot\\text{m}`);
    out("MR", `M(\\vec R)=0`);
    out("S", `\\sum M=${fmt(Sum, 3)}\\ \\text{N}\\cdot\\text{m}`);
    const eq = Math.abs(Sum) < 5e-4;
    say(eq ? "متوازن: مجموع العزوم معدوم ✓" : `غير متوازن: الساق يدور ${Sum > 0 ? "عكس عقارب الساعة (ينزل الطرف الأيسر)" : "مع عقارب الساعة (ينزل الطرف الأيمن)"}.`, eq ? "ok" : "warn");
    if (!lab.ok) return;
    const target = eq ? 0 : clamp(Sum * 2.2, -.3, .3) + Math.sign(Sum) * .06;
    st.tilt += (target - st.tilt) * Math.min(1, dt * 4);
    beam.rotation.z = st.tilt;
    const p1 = hang(W1, -st.x1 * K, st.m1), p2 = hang(W2, st.x2 * K, st.m2);
    L.O.at(new THREE.Vector3(.0, .3, .3));
    L.A.at(beam.localToWorld(new THREE.Vector3(-st.x1 * K, .22, 0)));
    L.C.at(beam.localToWorld(new THREE.Vector3(st.x2 * K, .22, 0)));
    L.P1.at(p1.clone().add(new THREE.Vector3(-.32, -.3 - st.m1 / 1000 * g * .45, .25)));
    L.P2.at(p2.clone().add(new THREE.Vector3(.32, -.3 - st.m2 / 1000 * g * .45, .25)));
    const sign = eq ? 0 : Math.sign(Sum);
    if (sign !== lastSign) { turn.set(sign, 1.4, sign > 0 ? .9 : 2.3); lastSign = sign; }
  }
  lab.onFrame(tick);
  tick(0);
})();
