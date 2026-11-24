/* core.js — shared helpers: number formatting, KaTeX, UI controls and the Lab base (three.js stage).
   Classic script (no modules) so the page also works when opened from a file:// path. */
"use strict";

/** Format a number with a decimal comma (Algerian school convention). */
function fmt(x, d = 2) {
  if (!isFinite(x)) return "—";
  let s = Number(x).toFixed(d);
  if (d > 0) s = s.replace(/\.?0+$/, m => (m.startsWith(".") ? "" : m)); // trim trailing zeros
  if (s === "-0") s = "0";
  return s.replace(".", "{,}");
}
/** Same, for plain text (not TeX). */
function fmtT(x, d = 2) { return fmt(x, d).replace("{,}", ","); }

/** Render TeX into an element (inline unless display). */
function tex(el, s, display = false) {
  try { katex.render(s, el, { throwOnError: false, displayMode: display }); }
  catch (e) { el.textContent = s; }
}
/** Replace $…$ and $$…$$ in all text of a root element by KaTeX. */
function renderMath(root) {
  root.querySelectorAll("[data-tex]").forEach(el => tex(el, el.dataset.tex, el.classList.contains("f") || el.dataset.display === "1"));
}
const $ = (s, r = document) => r.querySelector(s);
const h = (tag, attrs = {}, html = "") => {
  const e = document.createElement(tag);
  for (const k in attrs) {
    if (k === "class") e.className = attrs[k];
    else if (k.startsWith("on")) e.addEventListener(k.slice(2), attrs[k]);
    else e.setAttribute(k, attrs[k]);
  }
  if (html) e.innerHTML = html;
  return e;
};
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const DEG = Math.PI / 180;

/* ---------------- UI controls ---------------- */
const UI = {
  /** Range slider with live value. Returns {get value(), set(v), input}. */
  slider(parent, { label, min, max, step, value, unit = "", cls = "", show = v => fmtT(v, 2), onInput }) {
    const id = "s" + Math.random().toString(36).slice(2, 8);
    const wrap = h("div", { class: "ctl " + cls });
    const lab = h("label", { for: id }, `<span>${label}</span><output></output>`);
    const inp = h("input", { type: "range", id, min, max, step, value });
    const out = lab.querySelector("output");
    const upd = () => { out.textContent = show(+inp.value) + (unit ? " " + unit : ""); onInput && onInput(+inp.value); };
    inp.addEventListener("input", upd);
    wrap.append(lab, inp); parent.append(wrap);
    out.textContent = show(+value) + (unit ? " " + unit : "");
    return { input: inp, get value() { return +inp.value; }, set(v) { inp.value = v; upd(); } };
  },
  /** Segmented choice. options: [[key,label],...] */
  seg(parent, options, value, onChange) {
    const w = h("div", { class: "seg", role: "group" });
    const bs = options.map(([k, l]) => {
      const b = h("button", { type: "button", "aria-pressed": String(k === value) }, l);
      b.addEventListener("click", () => { bs.forEach(x => x.setAttribute("aria-pressed", "false")); b.setAttribute("aria-pressed", "true"); onChange(k); });
      w.append(b); return b;
    });
    parent.append(w);
    return { select(k) { const i = options.findIndex(o => o[0] === k); if (i >= 0) bs[i].click(); } };
  },
  btns(parent, list) {
    const w = h("div", { class: "btns" });
    const out = list.map(([label, fn, cls = ""]) => { const b = h("button", { type: "button", class: "btn " + cls }, label); b.addEventListener("click", () => fn(b)); w.append(b); return b; });
    parent.append(w); return out;
  },
  /** Readout box. rows: [[key, label]]; returns set(key, texString). */
  readout(parent, rows) {
    const w = h("div", { class: "readout", "aria-live": "polite" });
    const cells = {};
    rows.forEach(([k, l]) => { const r = h("div", { class: "row" }, `<span>${l}</span><span class="v"></span>`); cells[k] = r.querySelector(".v"); w.append(r); });
    parent.append(w);
    const last = {};
    return (k, s) => { if (last[k] !== s) { last[k] = s; tex(cells[k], s); } };
  },
  verdict(parent) {
    const v = h("div", { class: "verdict" }); parent.append(v);
    return (text, kind = "") => { v.className = "verdict " + kind; v.innerHTML = text; };
  },
  note(parent, html) { const n = h("div", { class: "qs" }, html); parent.append(n); renderInline(n); return n; },
};
/** Render $…$ inside an element's HTML. */
function renderInline(el) {
  el.innerHTML = el.innerHTML.replace(/\$([^$]+)\$/g, (_, t) => { const s = document.createElement("span"); tex(s, t); return s.outerHTML; });
}

/* ---------------- 3D helpers ---------------- */
/** Fixed concept colours on the dark stage (match the CSS tokens of dark mode). */
const C3 = { force: 0xff6a3d, arm: 0x2cc3b1, torque: 0xa487ff, axis: 0xf0b43c, energy: 0x5aa6ff, body: 0x8fa3b8, body2: 0x5d6f84, light: 0xdfe7f0, ok: 0x4fd17f };
window.LABS = [];
const G = {
  mat(color, o = {}) { return new THREE.MeshStandardMaterial(Object.assign({ color, roughness: .45, metalness: .1 }, o)); },
  css(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "#fff"; },
};

/** 3D arrow made of a cylinder and a cone. set(origin, dir, length). */
class Arrow3 extends THREE.Group {
  constructor(color, { r = .028, head = .13, headR = .07 } = {}) {
    super();
    this.head = head;
    const m = G.mat(color, { emissive: color, emissiveIntensity: .25 });
    this.shaft = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 1, 16), m);
    this.cone = new THREE.Mesh(new THREE.ConeGeometry(headR, head, 20), m);
    this.add(this.shaft, this.cone);
  }
  set(origin, dir, len) {
    if (len < 1e-4) { this.visible = false; return this; }
    this.visible = true;
    const d = dir.clone().normalize();
    this.position.copy(origin);
    this.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d);
    const hl = Math.min(this.head, len * .5), sl = Math.max(len - hl, 0.0001);
    this.shaft.scale.set(1, sl, 1); this.shaft.position.set(0, sl / 2, 0);
    this.cone.scale.set(1, hl / this.head, 1); this.cone.position.set(0, sl + hl / 2, 0);
    return this;
  }
}
/** Dashed or solid polyline. */
class Poly3 extends THREE.Line {
  constructor(color, { dashed = false, dash = .06, gap = .05, width = 1, opacity = 1 } = {}) {
    const mat = dashed ? new THREE.LineDashedMaterial({ color, dashSize: dash, gapSize: gap, transparent: opacity < 1, opacity })
                       : new THREE.LineBasicMaterial({ color, transparent: opacity < 1, opacity });
    super(new THREE.BufferGeometry(), mat);
    this.dashed = dashed;
  }
  setPoints(pts) {
    this.geometry.dispose();
    this.geometry = new THREE.BufferGeometry().setFromPoints(pts);
    if (this.dashed) this.computeLineDistances();
    return this;
  }
}
/** Thick line as a thin cylinder between two points. */
class Bar3 extends THREE.Mesh {
  constructor(color, r = .018) { super(new THREE.CylinderGeometry(r, r, 1, 12), G.mat(color, { emissive: color, emissiveIntensity: .3 })); }
  between(a, b) {
    const d = b.clone().sub(a), L = d.length();
    if (L < 1e-5) { this.visible = false; return this; }
    this.visible = true;
    this.position.copy(a).addScaledVector(d, .5);
    this.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    this.scale.set(1, L, 1);
    return this;
  }
}
/** Points on a circular arc in the plane spanned by u and v around c. */
function arcPoints(c, r, a0, a1, u = new THREE.Vector3(1, 0, 0), v = new THREE.Vector3(0, 1, 0), n = 48) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const a = a0 + (a1 - a0) * i / n;
    pts.push(c.clone().addScaledVector(u, r * Math.cos(a)).addScaledVector(v, r * Math.sin(a)));
  }
  return pts;
}
/** Curved arrow showing a rotation sense (in the xy plane by default). */
class TurnArrow3 extends THREE.Group {
  constructor(color, r = .5, tube = .022) {
    super();
    this.color = color; this.r = r; this.tube = tube;
    this.mat = G.mat(color, { emissive: color, emissiveIntensity: .35, transparent: true, opacity: .95 });
    this.cone = new THREE.Mesh(new THREE.ConeGeometry(tube * 3, tube * 7, 16), this.mat);
    this.add(this.cone);
  }
  /** sign: +1 counter-clockwise, -1 clockwise (seen from +z). span in radians. */
  set(sign, span = 1.6, start = .3) {
    if (this.arc) { this.remove(this.arc); this.arc.geometry.dispose(); }
    if (!sign) { this.visible = false; return; }
    this.visible = true;
    const a0 = start, a1 = start + span * sign;
    const pts = arcPoints(new THREE.Vector3(), this.r, a0, a1);
    const curve = new THREE.CatmullRomCurve3(pts);
    this.arc = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, this.tube, 8, false), this.mat);
    this.add(this.arc);
    const end = pts[pts.length - 1], prev = pts[pts.length - 3];
    this.cone.position.copy(end);
    this.cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.clone().sub(prev).normalize());
  }
}

/* ---------------- Lab: one three.js stage + side panel ---------------- */
const COARSE = matchMedia("(pointer: coarse)").matches;
const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;

class Lab {
  /**
   * @param {HTMLElement} host  .lab container (empty)
   * @param {{title:string, hint?:string, cam:number[], target?:number[], fov?:number, minDist?:number, maxDist?:number}} o
   */
  constructor(host, o) {
    this.o = o;
    this.view = h("div", { class: "lab-view" });
    this.panel = h("div", { class: "lab-panel" });
    host.append(this.view, this.panel);
    this.view.append(h("div", { class: "lab-title" }, o.title));
    this.labelsEl = h("div", { class: "lab-labels" });
    this.view.append(this.labelsEl);
    this.labels = [];
    this.updaters = [];
    this.visible = false;
    this.ok = Lab.webgl();
    if (!this.ok) { this.view.append(h("div", { class: "nogl" }, "متصفحك لا يدعم العرض ثلاثي الأبعاد (WebGL). القوانين والقيم في اللوحة ما زالت تعمل.")); return; }

    const r = this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    r.setPixelRatio(Math.min(devicePixelRatio, 2));
    r.outputColorSpace = THREE.SRGBColorSpace;
    this.view.prepend(r.domElement);
    r.domElement.setAttribute("aria-hidden", "true");
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(o.fov || 38, 1, .05, 200);
    this.camera.position.set(...o.cam);
    const tgt = new THREE.Vector3(...(o.target || [0, 0, 0]));
    this.scene.add(new THREE.HemisphereLight(0xdfe9ff, 0x1a2230, 1.25));
    const dl = new THREE.DirectionalLight(0xffffff, 1.6); dl.position.set(3, 5, 6); this.scene.add(dl);
    const dl2 = new THREE.DirectionalLight(0x99b4ff, .5); dl2.position.set(-4, 2, -3); this.scene.add(dl2);

    const c = this.controls = new THREE.OrbitControls(this.camera, r.domElement);
    c.target.copy(tgt); c.enableDamping = true; c.dampingFactor = .08; c.enablePan = false;
    c.minDistance = o.minDist || 2; c.maxDistance = o.maxDist || 14;
    c.update();
    this.home = { pos: this.camera.position.clone(), tgt: tgt.clone() };

    // On touch screens the stage must not trap page scrolling: camera control is opt-in.
    const hint = h("div", { class: "lab-hint" });
    if (COARSE) {
      c.enabled = false; r.domElement.style.touchAction = "pan-y";
      const b = h("button", { type: "button", class: "btn", style: "min-height:32px;padding:2px 10px;font-size:12.5px", "aria-pressed": "false" }, "تدوير المشهد");
      b.addEventListener("click", () => {
        c.enabled = !c.enabled; b.setAttribute("aria-pressed", String(c.enabled));
        r.domElement.style.touchAction = c.enabled ? "none" : "pan-y";
      });
      hint.append(b);
    } else hint.textContent = o.hint || "اسحب بالفأرة لتدوير المشهد • العجلة للتكبير • نقرتان للعودة";
    this.view.append(hint);
    r.domElement.addEventListener("dblclick", () => this.resetCam());

    new ResizeObserver(() => this.resize()).observe(this.view);
    new IntersectionObserver(es => { this.visible = es[0].isIntersecting; if (this.visible) this.loop(); }, { rootMargin: "80px" }).observe(this.view);
    this.resize();
  }
  static webgl() {
    if (Lab._gl !== undefined) return Lab._gl;
    try { const c = document.createElement("canvas"); Lab._gl = !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl"))); }
    catch (e) { Lab._gl = false; }
    return Lab._gl;
  }
  resetCam() { this.camera.position.copy(this.home.pos); this.controls.target.copy(this.home.tgt); this.controls.update(); }
  resize() {
    if (!this.ok) return;
    const w = this.view.clientWidth, hh = this.view.clientHeight;
    if (!w || !hh) return;
    this.renderer.setSize(w, hh, false);
    this.camera.aspect = w / hh;
    // keep the whole scene in frame on narrow screens
    this.camera.zoom = Math.min(1, (w / hh) / (this.o.aspectFit || 1.25));
    this.camera.updateProjectionMatrix();
    this.dirty = true;
  }
  /** HTML label that follows a 3D point. */
  label(text, cls = "") {
    const el = h("div", { class: "lbl " + cls }, text);
    this.labelsEl.append(el);
    const L = { el, p: new THREE.Vector3(), on: true, at(v) { this.p.copy(v); this.on = true; return this; }, hide() { this.on = false; return this; }, set(t) { if (this._t !== t) { this._t = t; el.innerHTML = t; } return this; } };
    this.labels.push(L);
    return L;
  }
  placeLabels() {
    const w = this.view.clientWidth, hh = this.view.clientHeight, v = new THREE.Vector3();
    for (const L of this.labels) {
      if (!L.on) { L.el.style.display = "none"; continue; }
      v.copy(L.p).project(this.camera);
      if (v.z > 1) { L.el.style.display = "none"; continue; }
      L.el.style.display = "";
      L.el.style.left = ((v.x + 1) / 2 * w).toFixed(1) + "px";
      L.el.style.top = ((1 - v.y) / 2 * hh).toFixed(1) + "px";
    }
  }
  onFrame(fn) { this.updaters.push(fn); }
  loop() {
    if (!this.ok || this.running) return;
    this.running = true;
    let last = performance.now();
    const tick = now => {
      if (!this.visible || document.hidden) { this.running = false; return; }
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      this.updaters.forEach(f => f(dt));
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
      this.placeLabels();
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
}
document.addEventListener("visibilitychange", () => { if (!document.hidden) (window.LABS || []).forEach(l => l.visible && l.loop()); });

/** Axis of rotation drawn as an amber rod with a small cap. */
function axisRod(len = 1.2, r = .03) {
  const g = new THREE.Group();
  const m = G.mat(G.css("--axis") || "#d99a1e", { metalness: .5, roughness: .3 });
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 20), m);
  rod.rotation.x = Math.PI / 2; g.add(rod);
  return g;
}
