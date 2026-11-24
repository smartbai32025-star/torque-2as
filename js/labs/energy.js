/* energy.js — Lab 6: work of a torque W = M·θ. Mode 1: a winch lifts a load at constant speed (exercise 11).
   Mode 2: a couple spins a disc up from rest, W becomes Ec = ½Jω² (exercise 6). */
"use strict";
(function () {
  const host = document.getElementById("lab-energy");
  const lab = new Lab(host, { title: "مختبر 6: العزم ينجز عملا", cam: [2.3, .5, 6.4], target: [-.3, -.7, 0], aspectFit: 1.1 });
  LABS.push(lab);
  const P = lab.panel;
  const g = 10;
  const st = { mode: "win", m: 200, r: .3, N: 1, th: 0, run: false, F: 10, R: .2, md: .314, w: 0 };

  UI.seg(P, [["win", "ملفاف يرفع حمولة"], ["disc", "مزدوجة تدير قرصا"]], st.mode, k => { st.mode = k; reset(); show(); });
  const bA = h("div", { style: "display:grid;gap:12px" }), bB = h("div", { style: "display:grid;gap:12px" }); P.append(bA, bB);
  UI.slider(bA, { label: "كتلة الحمولة m", min: 50, max: 300, step: 10, value: st.m, unit: "kg", cls: "force", show: v => String(v), onInput: v => st.m = v });
  UI.slider(bA, { label: "نصف قطر أسطوانة الملفاف r", min: .1, max: .4, step: .01, value: st.r, unit: "m", cls: "arm", onInput: v => { st.r = v; build(); } });
  UI.slider(bA, { label: "سرعة الدوران", min: .5, max: 3, step: .5, value: st.N, unit: "tr/min", cls: "energy", show: v => fmtT(v, 1), onInput: v => st.N = v });
  const oA = UI.readout(bA, [["M", "عزم المزدوجة المحرّكة"], ["th", "الزاوية الممسوحة"], ["W", "عمل المزدوجة"], ["h", "ارتفاع الحمولة"], ["WP", "عمل الثقل"], ["Pw", "استطاعة المحرك"]]);
  UI.slider(bB, { label: "شدّة كل قوة من المزدوجة F", min: 2, max: 20, step: 1, value: st.F, unit: "N", cls: "force", show: v => String(v), onInput: v => { st.F = v; reset(); } });
  UI.slider(bB, { label: "نصف قطر القرص R", min: .1, max: .3, step: .01, value: st.R, unit: "m", cls: "arm", onInput: v => { st.R = v; reset(); build(); } });
  const oB = UI.readout(bB, [["M", "عزم المزدوجة"], ["J", "عزم عطالة القرص"], ["th", "الزاوية الممسوحة"], ["W", "العمل = الطاقة المكتسبة"], ["w", "السرعة الزاوية"]]);
  // energy bars
  const bars = h("div", { class: "readout", style: "gap:8px" });
  bars.innerHTML = `<div style="font-size:13.5px;color:#9fb0c3">الحصيلة الطاقوية</div>
    <div><div style="display:flex;justify-content:space-between;font-size:13.5px"><span class="b1n">عمل المزدوجة (مكتسب)</span><span class="b1v ltr"></span></div><div style="height:12px;background:#1f2a37;border-radius:6px"><div class="b1" style="height:100%;width:0;background:#a487ff;border-radius:6px"></div></div></div>
    <div><div style="display:flex;justify-content:space-between;font-size:13.5px"><span class="b2n"></span><span class="b2v ltr"></span></div><div style="height:12px;background:#1f2a37;border-radius:6px"><div class="b2" style="height:100%;width:0;background:#5aa6ff;border-radius:6px"></div></div></div>`;
  P.append(bars);
  UI.btns(P, [["شغّل", b => { st.run = !st.run; b.textContent = st.run ? "أوقف" : "شغّل"; st.btn = b; }, "primary"], ["من البداية", () => reset()]]);
  const say = (() => { const v = UI.verdict(P), el = P.querySelector(".verdict"); let last = "";
    return (t, k) => { if (t !== last) { last = t; v(t, k); renderInline(el); } }; })();

  function reset() { st.th = 0; st.w = 0; st.run = false; if (st.btn) st.btn.textContent = "شغّل"; }
  function show() {
    bA.style.display = st.mode === "win" ? "grid" : "none"; bB.style.display = st.mode === "disc" ? "grid" : "none";
    bars.querySelector(".b2n").textContent = st.mode === "win" ? "عمل الثقل (مقدَّم إلى الحمولة) |W(P)|" : "الطاقة الحركية الدورانية Ec";
    if (lab.ok) { gW.visible = st.mode === "win"; gD.visible = st.mode === "disc"; Lw.forEach(l => l.on = st.mode === "win"); Ld.forEach(l => l.on = st.mode === "disc"); }
  }
  let gW, gD, Lw = [], Ld = [];
  const b1 = bars.querySelector(".b1"), b2 = bars.querySelector(".b2"), b1v = bars.querySelector(".b1v"), b2v = bars.querySelector(".b2v");

  if (lab.ok) {
    var S = lab.scene;
    gW = new THREE.Group(); gD = new THREE.Group(); S.add(gW, gD);
    var drum = new THREE.Group(), rope = new Bar3(0xe6dcc8, .012), load = new THREE.Mesh(new THREE.BoxGeometry(.5, .45, .45), G.mat(0x9c7b52, { roughness: .7 }));
    var Pv = new Arrow3(C3.force, { r: .025, head: .15, headR: .07 }), Tv = new Arrow3(0xffd27a, { r: .02, head: .13, headR: .06 });
    var hBar = new Bar3(C3.arm, .016), floor = new THREE.Mesh(new THREE.BoxGeometry(2.4, .04, 1.2), G.mat(0x26313e));
    floor.position.set(-.4, -2.6, 0);
    gW.add(drum, rope, load, Pv, Tv, hBar, floor, axisRod(1.2, .035));
    var turnW = new TurnArrow3(C3.torque, .3, .02); turnW.position.z = .5; gW.add(turnW); turnW.set(-1, 1.4, 2.0);
    Lw = [lab.label("M"), lab.label("P"), lab.label("h"), lab.label("r")];
    Lw[0].el.style.color = "#c9b6ff"; Lw[1].el.style.color = "#ff9b7d"; Lw[2].el.style.color = "#5fe3d3"; Lw[3].el.style.color = "#5fe3d3";
    var disc = new THREE.Group(); gD.add(disc, axisRod(1.4, .035));
    var F1 = new Arrow3(C3.force, { r: .03, head: .16, headR: .07 }), F2 = new Arrow3(C3.force, { r: .03, head: .16, headR: .07 });
    gD.add(F1, F2);
    Ld = [lab.label("F"), lab.label("F′"), lab.label("ω")];
    Ld[0].el.style.color = Ld[1].el.style.color = "#ff9b7d"; Ld[2].el.style.color = "#c9b6ff";
  }
  function build() {
    if (!lab.ok) return;
    drum.clear(); disc.clear();
    const rk = .35 + (st.r - .1) * 2.2;
    drum.add(new THREE.Mesh(new THREE.CylinderGeometry(rk, rk, .7, 48).rotateX(Math.PI / 2), G.mat(0x8f6f4a, { roughness: .6 })));
    for (const z of [-.38, .38]) { const fl = new THREE.Mesh(new THREE.TorusGeometry(rk + .04, .06, 12, 64), G.mat(C3.body2, { metalness: .5 })); fl.position.z = z; drum.add(fl); }
    const mk = new THREE.Mesh(new THREE.BoxGeometry(.06, rk * 2, .02), G.mat(0xffffff, { emissive: 0xffffff, emissiveIntensity: .3 })); mk.position.z = .41; drum.add(mk);
    st.rk = rk;
    const Rk = .45 + (st.R - .1) * 4.5;
    disc.add(new THREE.Mesh(new THREE.CylinderGeometry(Rk, Rk, .08, 64).rotateX(Math.PI / 2), G.mat(0x7a8ea6, { metalness: .4, roughness: .35 })));
    const st2 = new THREE.Mesh(new THREE.BoxGeometry(Rk * 2, .06, .1), G.mat(0xffffff, { emissive: 0xffffff, emissiveIntensity: .25 })); disc.add(st2);
    st.Rk = Rk;
  }
  build(); show();

  let sim = 0;
  function tick(dt) {
    if (st.mode === "win") {
      const w = 2 * Math.PI * st.N / 60;
      if (st.run) st.th = Math.min(st.th + w * dt * 24, 2 * Math.PI * 4); // animation runs 24x faster than real time
      if (st.th >= 2 * Math.PI * 4 && st.run) { st.run = false; if (st.btn) st.btn.textContent = "شغّل"; }
      const M = st.m * g * st.r, W = M * st.th, hh = st.r * st.th;
      oA("M", `M=mgr=${fmt(M, 1)}\\ \\text{N}\\cdot\\text{m}`);
      oA("th", `\\theta=${fmt(st.th, 2)}\\ \\text{rad}\\ (${fmt(st.th / 2 / Math.PI, 2)}\\ \\text{tr})`);
      oA("W", `W=M\\theta=${fmt(W, 0)}\\ \\text{J}`);
      oA("h", `h=r\\theta=${fmt(hh, 2)}\\ \\text{m}`);
      oA("WP", `W(\\vec P)=-mgh=${fmt(-st.m * g * hh, 0)}\\ \\text{J}`);
      oA("Pw", `P=M\\omega=${fmt(M * w, 1)}\\ \\text{W}`);
      const Wmax = st.m * g * st.r * 2 * Math.PI * 4;
      b1.style.width = b2.style.width = (W / Wmax * 100).toFixed(1) + "%";
      b1v.textContent = fmtT(W, 0) + " J"; b2v.textContent = fmtT(st.m * g * hh, 0) + " J";
      say("السرعة ثابتة: $\\sum M=0\\Rightarrow M=T\\,r=mgr$، وكل العمل المكتسب يُقدَّم للحمولة: $W=|W(\\vec P)|$.", "ok");
      if (!lab.ok) return;
      const rk = st.rk, scaleH = 2.0 / (st.r * 2 * Math.PI * 4); // whole climb fits on screen
      drum.rotation.z = -st.th;
      const top = new THREE.Vector3(-rk, 0, 0), y0 = -2.3 + .225, yL = y0 + hh * scaleH;
      load.position.set(-rk, yL, 0);
      rope.between(top, new THREE.Vector3(-rk, yL + .225, 0));
      Pv.set(new THREE.Vector3(-rk - .35, yL, .3), new THREE.Vector3(0, -1, 0), .25 + st.m * .0016);
      Tv.set(new THREE.Vector3(-rk + .0, yL + .24, .3), new THREE.Vector3(0, 1, 0), .25 + st.m * .0016);
      hBar.between(new THREE.Vector3(-rk + .45, y0, 0), new THREE.Vector3(-rk + .45, yL, 0)); hBar.visible = hh > .01;
      Lw[0].at(new THREE.Vector3(.1, rk + .45, .5)); Lw[1].at(new THREE.Vector3(-rk - .55, yL - .3 - st.m * .0008, .3));
      Lw[2].at(new THREE.Vector3(-rk + .65, (y0 + yL) / 2, 0)); Lw[2].on = hh > .05 && st.mode === "win";
      Lw[3].at(new THREE.Vector3(-rk / 2, .12, .45));
    } else {
      const M = st.F * 2 * st.R, J = .5 * st.md * st.R * st.R, thMax = 2 * Math.PI * 20;
      if (st.run && st.th < thMax) { sim += dt; st.th = Math.min(thMax, st.th + dt * (8 + st.th * .9)); }
      if (st.th >= thMax && st.run) { st.run = false; if (st.btn) st.btn.textContent = "شغّل"; }
      const W = M * st.th, w = Math.sqrt(2 * W / J);
      oB("M", `M=F\\cdot2R=${fmt(M, 2)}\\ \\text{N}\\cdot\\text{m}`);
      oB("J", `J=\\tfrac12mR^2=${fmt(J * 1000, 2)}\\times10^{-3}\\ \\text{kg}\\cdot\\text{m}^2`);
      oB("th", `\\theta=2\\pi n=${fmt(st.th, 1)}\\ \\text{rad}\\ (${fmt(st.th / 2 / Math.PI, 1)}\\ \\text{tr})`);
      oB("W", `W=M\\theta=E_c=${fmt(W, 1)}\\ \\text{J}`);
      oB("w", `\\omega=\\sqrt{2W/J}=${fmt(w, 0)}\\ \\text{rad/s}`);
      const Wmax = M * thMax;
      b1.style.width = b2.style.width = (W / Wmax * 100).toFixed(1) + "%";
      b1v.textContent = fmtT(W, 1) + " J"; b2v.textContent = fmtT(W, 1) + " J";
      say("بدون احتكاك: $E_{cA}+W=E_{cB}$ و $E_{cA}=0$، إذن $\\tfrac12J\\omega^2=M\\theta$. القرص كتلته $m=314\\,\\text{g}$ كما في التمرين (6).", "ok");
      if (!lab.ok) return;
      st.vis = (st.vis || 0) + dt * Math.min(9, w * .06) * (st.run || st.th > 0 ? 1 : 0);
      disc.rotation.z = st.vis;
      const Rk = st.Rk, z = .1;
      const a = st.vis, u = new THREE.Vector3(Math.cos(a), Math.sin(a), 0), t = new THREE.Vector3(-Math.sin(a), Math.cos(a), 0);
      const A = u.clone().multiplyScalar(Rk).setZ(z), B = u.clone().multiplyScalar(-Rk).setZ(z), len = st.F * .06;
      F1.set(A, t, len); F2.set(B, t.clone().negate(), len);
      Ld[0].at(A.clone().addScaledVector(t, len + .18)); Ld[1].at(B.clone().addScaledVector(t, -len - .18));
      Ld[2].at(new THREE.Vector3(0, Rk + .35, .1));
    }
  }
  lab.onFrame(tick);
  tick(0);
})();
