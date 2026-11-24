/* main.js — page wiring: math rendering, active section in the nav, theme toggle. */
"use strict";
(function () {
  renderMath(document);

  // highlight the section being read
  const links = [...document.querySelectorAll(".toc a")];
  const byId = Object.fromEntries(links.map(a => [a.getAttribute("href").slice(1), a]));
  const io = new IntersectionObserver(es => {
    es.forEach(e => {
      if (!e.isIntersecting) return;
      links.forEach(a => a.classList.remove("on"));
      const a = byId[e.target.id];
      if (a) { a.classList.add("on"); a.scrollIntoView({ block: "nearest", inline: "nearest" }); }
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  document.querySelectorAll("section.unit").forEach(s => io.observe(s));

  // theme: follows the system, the button overrides it (remembered per viewer when storage works)
  const root = document.documentElement, KEY = "torque-theme";
  try { const t = localStorage.getItem(KEY); if (t) root.dataset.theme = t; } catch (e) { /* storage unavailable: keep system theme */ }
  document.getElementById("themeBtn").addEventListener("click", () => {
    const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark";
    try { localStorage.setItem(KEY, root.dataset.theme); } catch (e) { /* not persisted */ }
  });
})();
