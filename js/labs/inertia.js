/* inertia.js — Lab 4: compare moments of inertia (same mass, same work received) and Huygens' theorem on a rod. */
"use strict";
(function () {
  const host = document.getElementById("lab-inertia");
  const lab = new Lab(host, { title: "مختبر 4: من يدور أسرع؟", cam: [0, 3.1, 7.7], target: [0, -.15, 0], aspectFit: 1.25, maxDist: 16 });
  LABS.push(lab);
  const P = lab.panel;
  const st = { mode: "cmp", m: 1, R: .2, W: 2, L: .6, d: 0, run: true };
  const BODIES = [
    { k: "ring", n: "حلقة", c: 1, f: "MR^2" },
    { k: "hcyl", n: "أسطوانة مجوّفة", c: 1, f: "MR^2" },
    { k: "disc", n: "قرص", c: .5, f: "\\tfrac12MR^2" },
    { k: "scyl", n: "أسطوانة مملوءة", c: .5, f: "\\tfrac12MR^2" },
    { k: "sph", n: "كرة مملوءة", c: .4, f: "\\tfrac25MR^2" },
    { k: "rod", n: "ساق طولها 2R", c: 1 / 3, f: "\\tfrac1{12}M(2R)^2" },
  ];
  const J = b => b.c * st.m * st.R * st.R;

  UI.seg(P, [["cmp", "مقارنة الأجسام"], ["huy", "نظرية هويغنز"]], st.mode, k => { st.mode = k; show(); });
  const boxA = h("div", { style: "display:grid;gap:12px" }), boxB = h("div", { style: "display:grid;gap:12px" });
  P.append(boxA, boxB);
  UI.slider(boxA, { label: "الكتلة M (لكل جسم)", min: .5, max: 3, step: .1, value: st.m, unit: "kg", show: v => fmtT(v, 1), onInput: v => st.m = v });
  UI.slider(boxA, { label: "نصف القطر R", min: .1, max: .3, step: .01, value: st.R, unit: "m", cls: "arm", onInput: v => { st.R = v; build(); } });
  UI.slider(boxA, { label: "العمل المقدَّم لكل جسم W", min: .5, max: 5, step: .1, value: st.W, unit: "J", cls: "energy", show: v => fmtT(v, 1), onInput: v => st.W = v });
  const outA = UI.readout(boxA, BODIES.map(b => [b.k, b.n]));
  UI.note(boxA, "كلها تأخذ الطاقة نفسها: $\\tfrac12J\\omega^2=W\\Rightarrow\\omega=\\sqrt{2W/J}$. الكتلة البعيدة عن المحور تجعل $J$ أكبر فيدور الجسم أبطأ.");

  UI.slider(boxB, { label: "كتلة الساق m", min: .2, max: 2, step: .1, value: .5, unit: "kg", show: v => fmtT(v, 1), onInput: v => st.mr = v });
  st.mr = .5;
  UI.slider(boxB, { label: "طول الساق L", min: .3, max: 1, step: .05, value: st.L, unit: "m", cls: "arm", onInput: v => { st.L = v; build(); } });
  const sD = UI.slider(boxB, { label: "بعد المحور Δ عن المركز d", min: 0, max: 1, step: .01, value: 0, cls: "axis", show: v => fmtT(v * st.L / 2, 2) + " m", onInput: v => st.d = v });
  UI.btns(boxB, [["المحور في الطرف d = L/2", () => sD.set(1)]]);
  const outB = UI.readout(boxB, [["J0", "حول Δ₀ (المركز)"], ["md", "الحدّ md²"], ["J", "حول Δ"]]);
  const verB = (() => { const v = UI.verdict(boxB), el = boxB.querySelector(".verdict"); let last = "";
    return (t, k) => { if (t !== last) { last = t; v(t, k); renderInline(el); } }; })();
  if (!lab.ok) { show(); tick(0); return; }

  const S = lab.scene;
  const gA = new THREE.Group(), gB = new THREE.Group(); S.add(gA, gB);
  const spins = [], labels = [];
  const metal = c => G.mat(c, { metalness: .35, roughness: .38 });
  const cols = [0x7fa7d9, 0x6fc2b3, 0xc79be6, 0xe0a46a, 0xd98c9c, 0xa9b8c9];

  function makeBody(k, Rk, c) {
    const grp = new THREE.Group(), m = metal(c), mark = G.mat(0xffffff, { emissive: 0xffffff, emissiveIntensity: .4 });
    let geo, markPos;
    if (k === "ring") { geo = new THREE.TorusGeometry(Rk, Rk * .09, 14, 64).rotateX(Math.PI / 2); markPos = [Rk, Rk * .1, 0]; }
    else if (k === "disc") { geo = new THREE.CylinderGeometry(Rk, Rk, Rk * .14, 48); markPos = [Rk * .8, Rk * .08, 0]; }
    else if (k === "hcyl") { geo = new THREE.CylinderGeometry(Rk, Rk, Rk * 1.1, 48, 1, true); markPos = [Rk, Rk * .56, 0]; }
    else if (k === "scyl") { geo = new THREE.CylinderGeometry(Rk, Rk, Rk * 1.1, 48); markPos = [Rk * .8, Rk * .56, 0]; }
    else if (k === "sph") { geo = new THREE.SphereGeometry(Rk, 40, 24); markPos = [Rk * .98, 0, 0]; }
    else { geo = new THREE.BoxGeometry(Rk * 2, Rk * .16, Rk * .16); markPos = [Rk, Rk * .1, 0]; }
    if (k === "hcyl") m.side = THREE.DoubleSide;
    grp.add(new THREE.Mesh(geo, m));
    const mk = new THREE.Mesh(new THREE.SphereGeometry(Rk * .09, 12, 8), mark); mk.position.set(...markPos); grp.add(mk);
    if (k === "sph") { const band = new THREE.Mesh(new THREE.TorusGeometry(Rk * 1.001, Rk * .025, 8, 60).rotateY(Math.PI / 2), mark); grp.add(band); }
    return grp;
  }
  const axisV = (len, op = 1, dashed = false) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(.022, .022, len, 12), G.mat(C3.axis, { transparent: op < 1, opacity: op, emissive: C3.axis, emissiveIntensity: .25 }));
    return m;
  };
  let rod, rodAxis, rodAxis0, rodPivot;
  function build() {
    gA.clear(); spins.length = 0; labels.forEach(l => l.hide());
    const Rk = .35 + (st.R - .1) * 2.2;
    BODIES.forEach((b, i) => {
      const col = i % 3, row = Math.floor(i / 3);
      const x = (1 - col) * 2.3, y = row ? -1.25 : 1.15, z = 0;
      const body = makeBody(b.k, Rk, cols[i]); body.position.set(x, y, z); gA.add(body);
      const ax = axisV(1.7); ax.position.set(x, y, z); gA.add(ax);
      spins.push(body);
      if (!labels[i]) labels[i] = lab.label("", "ar");
      labels[i].set(b.n).at(new THREE.Vector3(x, y - Rk * .75 - .38, z));
    });
    // Huygens rod
    gB.clear();
    const Lk = st.L * 4;
    rod = new THREE.Group();
    const bar = new THREE.Mesh(new THREE.BoxGeometry(Lk, .14, .14), metal(0xa9b8c9)); rod.add(bar);
    const g0 = new THREE.Mesh(new THREE.SphereGeometry(.07, 16, 10), G.mat(0xffffff, { emissive: 0xffffff, emissiveIntensity: .4 })); rod.add(g0);
    rodPivot = new THREE.Group(); rodPivot.add(rod); gB.add(rodPivot);
    rodAxis = axisV(2.2); gB.add(rodAxis);
    rodAxis0 = new Poly3(C3.axis, { dashed: true }); rodAxis0.setPoints([new THREE.Vector3(0, -1.1, 0), new THREE.Vector3(0, 1.1, 0)]); rod.add(rodAxis0);
    st.Lk = Lk;
    dBar = new Bar3(C3.arm, .022); gB.add(dBar);
  }
  const LG = lab.label("G"), LD = lab.label("Δ"), LD0 = lab.label("Δ<sub>0</sub>"), Ld = lab.label("d");
  LD.el.style.color = LD0.el.style.color = "#ffd27a"; Ld.el.style.color = "#5fe3d3";
  let dBar;
  gB.scale.setScalar(1.55); gB.position.y = -.2;
  build();

  function show() {
    boxA.style.display = st.mode === "cmp" ? "grid" : "none";
    boxB.style.display = st.mode === "huy" ? "grid" : "none";
    if (!lab.ok) return;
    gA.visible = st.mode === "cmp"; gB.visible = st.mode === "huy";
    labels.forEach(l => l.on = st.mode === "cmp");
    [LG, LD, LD0, Ld].forEach(l => l.on = st.mode === "huy");
  }
  show();

  const ang = new Array(6).fill(0);
  let angB = 0;
  function tick(dt) {
    if (st.mode === "cmp") {
      BODIES.forEach((b, i) => {
        const j = J(b), w = Math.sqrt(2 * st.W / j);
        outA(b.k, `J=${fmt(j * 1000, 2)}\\times10^{-3}\\ \\ \\omega=${fmt(w, 1)}`);
        ang[i] += w * dt * .22;
        if (lab.ok) spins[i].rotation.y = ang[i];
      });
    } else {
      const m = st.mr, L = st.L, d = st.d * L / 2;
      const J0 = m * L * L / 12, md = m * d * d, Jt = J0 + md;
      outB("J0", `\\tfrac1{12}mL^2=${fmt(J0 * 1000, 2)}\\times10^{-3}`);
      outB("md", `md^2=${fmt(md * 1000, 2)}\\times10^{-3}`);
      outB("J", `J_\\Delta=${fmt(Jt * 1000, 2)}\\times10^{-3}\\ \\text{kg}\\cdot\\text{m}^2`);
      verB(st.d > .99 ? "المحور في طرف الساق: $J=\\tfrac1{12}mL^2+m\\left(\\tfrac L2\\right)^2=\\tfrac13mL^2$" : st.d < .01 ? "المحور يمرّ بالمركز: $J=J_{\\Delta_0}$ أصغر قيمة ممكنة." : "كلما ابتعد المحور عن المركز زاد عزم العطالة.", st.d > .99 ? "ok" : "");
      if (lab.ok) {
        const dk = st.d * st.Lk / 2;
        angB += dt * 1.3 * Math.sqrt(.02 / Jt) ;
        rodPivot.position.set(dk, 0, 0); rod.position.set(-dk, 0, 0);
        rodPivot.rotation.y = angB; rodAxis.position.set(dk, 0, 0);
        gB.updateMatrixWorld(true);
        const gL = gB.worldToLocal(rod.localToWorld(new THREE.Vector3()));   // rod centre, in gB space
        const W = v => gB.localToWorld(v.clone());
        dBar.between(new THREE.Vector3(dk, .9, 0), gL.clone().setY(.9)); dBar.visible = st.d > .02;
        LG.at(W(gL.clone().add(new THREE.Vector3(0, -.22, 0))));
        LD.at(W(new THREE.Vector3(dk, 1.25, 0))); LD0.at(W(gL.clone().setY(1.25))); LD0.on = st.d > .05;
        Ld.at(W(gL.clone().lerp(new THREE.Vector3(dk, 0, 0), .5).setY(1.05))); Ld.on = st.d > .05;
      }
    }
  }
  lab.onFrame(tick);
  tick(0);
})();
