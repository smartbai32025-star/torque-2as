/* exam.js — self-test (MCQ with instant feedback) and step-by-step solved exercises.
   Exercises come from Fares Fergani's series 2AS-U03-1; every number was re-checked. */
"use strict";
(function () {
  /* ---------------- quiz ---------------- */
  const QUIZ = [
    ["وحدة عزم القوة في النظام الدولي هي:", ["$\\text{N}\\cdot\\text{m}$", "$\\text{N/m}$", "$\\text{kg}\\cdot\\text{m}^2$", "$\\text{J/s}$"], 0, "العزم جداء قوة ($\\text{N}$) في مسافة ($\\text{m}$)."],
    ["ذراع القوة بالنسبة لمحور هو:", ["البعد بين المحور ونقطة تطبيق القوة", "البعد العمودي بين المحور وحامل القوة", "طول شعاع القوة", "نصف قطر الجسم دائما"], 1, "الذراع عمودي على <b>حامل</b> القوة؛ ولا يساوي $OA$ إلا إذا كانت القوة عمودية على $OA$."],
    ["قوة شدّتها $20\\,\\text{N}$ مماسيّة لعجلة نصف قطرها $0{,}3\\,\\text{m}$. قيمة عزمها المطلقة:", ["$66{,}7\\,\\text{N}\\cdot\\text{m}$", "$20\\,\\text{N}\\cdot\\text{m}$", "$6\\,\\text{N}\\cdot\\text{m}$", "$0{,}015\\,\\text{N}\\cdot\\text{m}$"], 2, "قوة مماسية: $d=R$، إذن $M=F\\cdot R=20\\times0{,}3=6\\,\\text{N}\\cdot\\text{m}$."],
    ["قوة $F=10\\,\\text{N}$ تُطبَّق في $A$ حيث $OA=0{,}5\\,\\text{m}$ وتصنع زاوية $30^\\circ$ مع $OA$. قيمة عزمها المطلقة:", ["$5\\,\\text{N}\\cdot\\text{m}$", "$2{,}5\\,\\text{N}\\cdot\\text{m}$", "$4{,}33\\,\\text{N}\\cdot\\text{m}$", "$0$"], 1, "$d=OA\\sin30^\\circ=0{,}25\\,\\text{m}$، إذن $M=10\\times0{,}25=2{,}5\\,\\text{N}\\cdot\\text{m}$."],
    ["يكون عزم قوة بالنسبة لمحور معدوما إذا:", ["كانت القوة عمودية على $OA$", "كانت شدّتها صغيرة", "مرّ حاملها بالمحور أو وازاه", "كانت مماسية للمسار"], 2, "في الحالتين لا تستطيع القوة إدارة الجسم حول هذا المحور: $M=0$."],
    ["سائق يطبّق مزدوجة قوتاها $15\\,\\text{N}$ على مقود نصف قطره $0{,}2\\,\\text{m}$. عزمها:", ["$3\\,\\text{N}\\cdot\\text{m}$", "$6\\,\\text{N}\\cdot\\text{m}$", "$30\\,\\text{N}\\cdot\\text{m}$", "$0$ لأن المحصّلة معدومة"], 1, "$M=F\\cdot d=F\\cdot2R=15\\times0{,}4=6\\,\\text{N}\\cdot\\text{m}$. المحصّلة المعدومة تمنع الانسحاب لا الدوران."],
    ["عزم المزدوجة:", ["يتعلّق بموضع محور الدوران", "لا يتعلّق بموضع المحور بل بالبعد بين حاملي القوتين", "يساوي مجموع شدّتي القوتين", "معدوم دائما"], 1, "جرّب ذلك في مختبر المزدوجة: حرّك المحور ويبقى $M=F\\cdot2R$."],
    ["أجسام لها الكتلة $M$ نفسها ونصف القطر $R$ نفسه. أكبرها عزم عطالة حول محورها:", ["القرص", "الكرة المملوءة", "الحلقة", "الأسطوانة المملوءة"], 2, "كتلة الحلقة كلها على بعد $R$: $J=MR^2$، وهو الأكبر ($\\tfrac12$ للقرص، $\\tfrac25$ للكرة)."],
    ["ساق كتلتها $0{,}3\\,\\text{kg}$ وطولها $1\\,\\text{m}$ تدور حول محور يمرّ بطرفها. عزم عطالتها:", ["$0{,}025\\,\\text{kg}\\cdot\\text{m}^2$", "$0{,}1\\,\\text{kg}\\cdot\\text{m}^2$", "$0{,}3\\,\\text{kg}\\cdot\\text{m}^2$", "$0{,}075\\,\\text{kg}\\cdot\\text{m}^2$"], 1, "هويغنز: $J=\\tfrac1{12}mL^2+m\\left(\\tfrac L2\\right)^2=\\tfrac13mL^2=0{,}1\\,\\text{kg}\\cdot\\text{m}^2$."],
    ["عزم ثابت $M=2\\,\\text{N}\\cdot\\text{m}$ يدير قرصا $3$ دورات. عمله:", ["$6\\,\\text{J}$", "$12\\pi\\approx37{,}7\\,\\text{J}$", "$6\\pi\\approx18{,}8\\,\\text{J}$", "$0{,}67\\,\\text{J}$"], 1, "$\\theta=2\\pi\\times3=6\\pi\\,\\text{rad}$، إذن $W=M\\theta=12\\pi\\approx37{,}7\\,\\text{J}$."],
    ["قرص عزم عطالته $0{,}02\\,\\text{kg}\\cdot\\text{m}^2$ يدور بسرعة زاوية $10\\,\\text{rad/s}$. طاقته الحركية:", ["$0{,}2\\,\\text{J}$", "$2\\,\\text{J}$", "$1\\,\\text{J}$", "$0{,}1\\,\\text{J}$"], 2, "$E_c=\\tfrac12J\\omega^2=\\tfrac12\\times0{,}02\\times100=1\\,\\text{J}$."],
    ["جسم يدور بمعدّل $120$ دورة في الدقيقة. سرعته الزاوية:", ["$120\\,\\text{rad/s}$", "$2\\,\\text{rad/s}$", "$4\\pi\\approx12{,}6\\,\\text{rad/s}$", "$2\\pi\\,\\text{rad/s}$"], 2, "$\\omega=\\dfrac{2\\pi n}{60}=\\dfrac{2\\pi\\times120}{60}=4\\pi\\,\\text{rad/s}$."],
    ["شرط توازن جسم صلب قابل للدوران حول محور ثابت:", ["$\\sum\\vec F=\\vec0$ فقط", "$\\sum M_{/\\Delta}(\\vec F_{ext})=0$", "$\\sum F\\cdot d>0$", "أن يكون ثقله معدوما"], 1, "مجموع عزوم القوى الخارجية بالنسبة للمحور معدوم."],
    ["كرة مملوءة تتدحرج دون انزلاق بسرعة $v$. طاقتها الحركية:", ["$\\tfrac12mv^2$", "$\\tfrac15mv^2$", "$\\tfrac7{10}mv^2$", "$\\tfrac25mv^2$"], 2, "$\\tfrac12mv^2+\\tfrac12\\left(\\tfrac25mR^2\\right)\\left(\\tfrac vR\\right)^2=\\tfrac7{10}mv^2$."],
    ["محرّك عزمه $50\\,\\text{N}\\cdot\\text{m}$ يدور بسرعة زاوية $20\\,\\text{rad/s}$. استطاعته:", ["$2{,}5\\,\\text{W}$", "$70\\,\\text{W}$", "$1000\\,\\text{W}$", "$500\\,\\text{W}$"], 2, "$P=M\\cdot\\omega=50\\times20=1000\\,\\text{W}$."],
  ];
  const box = document.getElementById("quizBox"), score = document.getElementById("score");
  let done = 0, good = 0;
  const upd = () => { score.textContent = `النتيجة: ${good} / ${done}` + (done === QUIZ.length ? `  —  ${good >= 13 ? "ممتاز!" : good >= 9 ? "جيد، راجع الأسئلة الخاطئة" : "أعد قراءة الملخص ثم حاول مجددا"}` : ""); };
  const makeQuiz = () => QUIZ.forEach(([q, opts, ok, why], i) => {
    // build the markup and typeset it first; listeners go on afterwards (typesetting rewrites innerHTML)
    const el = h("div", { class: "q" }, `<div class="qt"><span class="qn">${i + 1}.</span>${q}</div><div class="opts">${opts.map(t => `<button type="button" class="opt">${t}</button>`).join("")}</div><div class="why">${why}</div>`);
    renderInline(el);
    const o = el.querySelector(".opts");
    [...o.children].forEach((b, j) => {
      b.addEventListener("click", () => {
        if (el.classList.contains("done")) return;
        el.classList.add("done"); done++;
        if (j === ok) good++; else b.classList.add("wrong");
        o.children[ok].classList.add("right");
        [...o.children].forEach(x => x.disabled = true);
        upd();
      });
    });
    box.append(el);
  });
  const reset = h("button", { type: "button", class: "btn2", style: "justify-self:start" }, "أعد الاختبار");
  reset.addEventListener("click", () => { box.innerHTML = ""; done = good = 0; makeQuiz(); upd(); box.scrollIntoView({ block: "start" }); });
  box.after(reset);
  makeQuiz();
  upd();

  /* ---------------- solved exercises ---------------- */
  const F = t => `<div class="f" data-tex="${t.replace(/"/g, "&quot;")}"></div>`;
  const ink = "var(--ink)", red = "var(--force)", teal = "var(--arm)", vio = "var(--torque)", amb = "var(--axis)";
  const arrowDefs = `<defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="context-stroke"/></marker></defs>`;
  const T = (x, y, s, c = ink, sz = 15) => `<text x="${x}" y="${y}" fill="${c}" font-size="${sz}" font-family="Times New Roman" font-style="italic" font-weight="700">${s}</text>`;

  const EX = [
    {
      n: 2, title: "عزم ثقل نواس بسيط في ثلاث وضعيات",
      st: `جسم نقطي كتلته $m=100\\,\\text{g}$ معلّق بخيط طوله $\\ell=40\\,\\text{cm}$. احسب عزم ثقله $\\vec P$ بالنسبة لمحور الدوران في الوضعيات: (1) الخيط أفقي، (2) الخيط يصنع $\\alpha=30^\\circ$ مع الشاقول، (3) الخيط شاقولي. يعطى $g=10\\,\\text{m/s}^2$.`,
      svg: `<svg viewBox="0 0 260 200">${arrowDefs}<line x1="30" y1="30" x2="70" y2="30" stroke="${ink}" stroke-width="3"/><circle cx="50" cy="30" r="4" fill="${amb}"/>
        <path d="M50 30 A160 160 0 0 1 210 30" fill="none" stroke="${ink}" stroke-dasharray="4 4" opacity=".0"/>
        <path d="M210 30 A160 160 0 0 1 50 190" fill="none" stroke="${ink}" stroke-dasharray="4 4" opacity=".5"/>
        <line x1="50" y1="30" x2="210" y2="30" stroke="${ink}" stroke-width="1.5"/><circle cx="210" cy="30" r="8" fill="#8a96a8"/>${T(222, 35, "(1)")}
        <line x1="50" y1="30" x2="130" y2="168.6" stroke="${ink}" stroke-width="1.5"/><circle cx="130" cy="168.6" r="8" fill="#8a96a8"/>${T(142, 175, "(2)")}
        <line x1="50" y1="30" x2="50" y2="190" stroke="${ink}" stroke-width="1.5" stroke-dasharray="5 4"/><circle cx="50" cy="190" r="8" fill="#8a96a8" opacity=".6"/>${T(14, 195, "(3)")}
        <line x1="130" y1="168.6" x2="130" y2="198" stroke="${red}" stroke-width="2.5" marker-end="url(#ah)"/>${T(136, 196, "P", red)}
        <line x1="50" y1="150" x2="130" y2="150" stroke="${teal}" stroke-width="2.5"/>${T(84, 145, "d", teal)}
        <path d="M50 70 A40 40 0 0 0 70 64.6" fill="none" stroke="${vio}" stroke-width="1.5"/>${T(60, 88, "α", vio, 13)}</svg>`,
      steps: [
        ["الحالة (1): الخيط أفقي", `حامل $\\vec P$ شاقولي، فالذراع هو البعد الأفقي بين المحور وحامل الثقل: $d=\\ell$.` + F("M_{/\\Delta}(\\vec P)=m\\,g\\,\\ell=0{,}1\\times10\\times0{,}4=0{,}4\\ \\text{N}\\cdot\\text{m}")],
        ["الحالة (2): α = 30°", `من الشكل: $\\sin\\alpha=\\dfrac d\\ell\\Rightarrow d=\\ell\\sin\\alpha$.` + F("M_{/\\Delta}(\\vec P)=m\\,g\\,\\ell\\sin\\alpha=0{,}1\\times10\\times0{,}4\\times\\sin30^\\circ=0{,}2\\ \\text{N}\\cdot\\text{m}")],
        ["الحالة (3): الخيط شاقولي", `حامل $\\vec P$ يمرّ بمحور الدوران، فالذراع معدوم:` + F("M_{/\\Delta}(\\vec P)=0") + `<p class="note">لاحظ أن العزم يتناقص كلما اقترب النواس من وضع التوازن.</p>`],
      ],
    },
    {
      n: 4, title: "عزوم قوى على قضيب، ثم توازن قرص",
      st: `<b>1.</b> قضيب متجانس $AB$ ثقله $P=10\\,\\text{N}$ يدور حول محور أفقي $(\\Delta)$ يمرّ بـ $O$. تُطبَّق في $A$ القوة $F_1=2\\,\\text{N}$ (تصنع $\\alpha=60^\\circ$ مع القضيب) وفي $B$ القوة $F_2=1{,}5\\,\\text{N}$ شاقولية نحو الأسفل. $OA=70\\,\\text{cm}$، $OB=30\\,\\text{cm}$، $OG=20\\,\\text{cm}$ (G بين A و O). نختار الجهة الموجبة مع عقارب الساعة. احسب العزوم ومجموعها واستنتج جهة الدوران.<br><b>2.</b> قرص نصف قطره $R=30\\,\\text{cm}$ يدور دون احتكاك حول محور يمرّ بمركزه. في نقطة $M$ من محيطه قوة $F_1=2\\,\\text{N}$ يصنع حاملها $\\alpha=30^\\circ$ مع القطر $MM'$. احسب عزمها، ثم شدّة القوة المماسية $\\vec F_2$ في $M'$ التي تحقّق التوازن.`,
      svg: `<svg viewBox="0 0 260 150">${arrowDefs}<rect x="40" y="62" width="200" height="12" rx="2" fill="#b9c3cf" stroke="${ink}"/>
        <circle cx="180" cy="68" r="4" fill="${amb}"/>${T(176, 92, "O")}${T(30, 92, "A")}${T(236, 92, "B")}${T(148, 58, "G")}<circle cx="151" cy="68" r="3" fill="${ink}"/>
        <line x1="40" y1="68" x2="10" y2="16" stroke="${red}" stroke-width="2.5" marker-end="url(#ah)"/>${T(4, 14, "F₁", red)}
        <line x1="234" y1="74" x2="234" y2="120" stroke="${red}" stroke-width="2.5" marker-end="url(#ah)"/>${T(240, 120, "F₂", red)}
        <line x1="151" y1="74" x2="151" y2="140" stroke="${red}" stroke-width="2.5" marker-end="url(#ah)"/>${T(156, 142, "P", red)}
        <line x1="180" y1="62" x2="180" y2="20" stroke="${ink}" stroke-width="2" marker-end="url(#ah)"/>${T(186, 24, "R")}
        <path d="M62 68 A22 22 0 0 0 51 49" fill="none" stroke="${vio}"/>${T(64, 56, "α", vio, 13)}</svg>`,
      steps: [
        ["عزم F₁", `حامل $\\vec F_1$ يصنع $60^\\circ$ مع القضيب: $d_1=OA\\sin60^\\circ$. القوة تدير القضيب مع عقارب الساعة (+).` + F("M(\\vec F_1)=+F_1\\,OA\\sin60^\\circ=2\\times0{,}7\\times0{,}866=+1{,}21\\ \\text{N}\\cdot\\text{m}")],
        ["عزم F₂ وعزم P وعزم R", F("M(\\vec F_2)=+F_2\\cdot OB=1{,}5\\times0{,}3=+0{,}45\\ \\text{N}\\cdot\\text{m}") + F("M(\\vec P)=-P\\cdot OG=-10\\times0{,}2=-2\\ \\text{N}\\cdot\\text{m}") + `و $M(\\vec R)=0$ لأن حامل $\\vec R$ يمرّ بالمحور.`],
        ["المجموع وجهة الدوران", F("\\sum M=1{,}21+0{,}45-2+0=-0{,}34\\ \\text{N}\\cdot\\text{m}") + `المجموع سالب: يدور القضيب في الجهة السالبة، أي <b>عكس عقارب الساعة</b> (ينزل الطرف $A$).`],
        ["2. عزم F₁ على القرص", `$d=R\\sin\\alpha$:` + F("M(\\vec F_1)=F_1R\\sin30^\\circ=2\\times0{,}3\\times0{,}5=0{,}3\\ \\text{N}\\cdot\\text{m}")],
        ["2. القوة F₂ المحقّقة للتوازن", `$\\vec F_2$ مماسية في $M'$ ($d=R$) وتدير القرص عكس $\\vec F_1$:` + F("\\sum M=0\\Rightarrow M(\\vec F_1)-F_2R=0\\Rightarrow F_2=\\dfrac{0{,}3}{0{,}3}=1\\ \\text{N}")],
      ],
    },
    {
      n: 6, title: "مزدوجة تدير قرصا من السكون",
      st: `نؤثّر على قرص $(D)$ نصف قطره $R=20\\,\\text{cm}$ وكتلته $m=314\\,\\text{g}$ بمزدوجة قوى $(\\vec F,\\vec F')$ مماسيّة لمحيطه، $F=F'=10\\,\\text{N}$، فيدور حول محور يمرّ بمركزه انطلاقا من السكون من $A$ إلى $B$ ماسحا $20$ دورة (دون احتكاك). احسب عزم المزدوجة وعملها، ثم السرعة الزاوية للقرص في $B$.`,
      svg: `<svg viewBox="0 0 260 150">${arrowDefs}<ellipse cx="130" cy="80" rx="90" ry="34" fill="#b9c3cf" stroke="${ink}"/><line x1="130" y1="10" x2="130" y2="146" stroke="${amb}" stroke-width="2" stroke-dasharray="6 4"/>${T(136, 22, "(Δ)")}
        <line x1="220" y1="80" x2="250" y2="40" stroke="${red}" stroke-width="2.5" marker-end="url(#ah)"/>${T(236, 36, "F", red)}
        <line x1="40" y1="80" x2="10" y2="120" stroke="${red}" stroke-width="2.5" marker-end="url(#ah)"/>${T(6, 140, "F′", red)}
        <path d="M150 34 A30 12 0 0 1 120 30" fill="none" stroke="${vio}" stroke-width="2" marker-end="url(#ah)"/>${T(152, 30, "+", vio)}</svg>`,
      steps: [
        ["عزم المزدوجة", `القوتان مماسيّتان في طرفي قطر: $d=2R$.` + F("M=F\\cdot2R=10\\times0{,}4=4\\ \\text{N}\\cdot\\text{m}")],
        ["عمل المزدوجة", `$\\theta=2\\pi n=40\\pi\\,\\text{rad}$:` + F("W_{AB}=M\\theta=4\\times40\\pi\\approx502{,}7\\ \\text{J}")],
        ["الحصيلة وانحفاظ الطاقة", `الجملة: القرص. القوى $\\vec P$ و $\\vec R$ حاملاهما يمرّان بالمحور فعملهما معدوم. الطاقة المكتسبة هي عمل المزدوجة:` + F("E_{cA}+W_{AB}=E_{cB}\\Rightarrow 0+W_{AB}=\\tfrac12J\\omega_B^2,\\quad J=\\tfrac12mR^2")],
        ["السرعة الزاوية في B", F("\\omega_B=\\sqrt{\\dfrac{4W_{AB}}{mR^2}}=\\sqrt{\\dfrac{4\\times502{,}7}{0{,}314\\times0{,}2^2}}\\approx400\\ \\text{rad/s}")],
      ],
    },
    {
      n: 8, title: "قضيب وجسمان: عزم العطالة، الطاقة، والاحتكاك",
      st: `قضيب $(B)$ كتلته $m=200\\,\\text{g}$ وطوله $L=50\\,\\text{cm}$ يدور حول محور أفقي يمرّ بمركزه، وفي طرفيه جسمان نقطيان كتلة كل منهما $m'=150\\,\\text{g}$. يدور بسرعة ثابتة $\\omega_0=10{,}47\\,\\text{rad/s}$.<br>1) احسب الزاوية الممسوحة وعدد الدورات خلال دقيقتين، وعزم عطالة الجملة، وطاقتها الحركية.<br>2) نتركها فتتوقّف خلال $10\\,\\text{min}$ بسبب الاحتكاك: احسب عمل الاحتكاك والاستطاعة المحوّلة.<br>3) إذا توقّفت بعد $500$ دورة، احسب عزم الاحتكاك $M_f$ (ثابت).`,
      svg: `<svg viewBox="0 0 260 120"><rect x="30" y="54" width="200" height="12" fill="#b9c3cf" stroke="${ink}" transform="rotate(-12 130 60)"/>
        <rect x="18" y="58" width="22" height="30" fill="#5d6f84" transform="rotate(-12 130 60)"/><rect x="220" y="34" width="22" height="30" fill="#5d6f84" transform="rotate(-12 130 60)"/>
        <circle cx="130" cy="60" r="4" fill="${amb}"/>${T(124, 86, "O")}${T(8, 112, "m′")}${T(236, 20, "m′")}</svg>`,
      steps: [
        ["الزاوية وعدد الدورات", F("\\theta=\\omega_0\\Delta t=10{,}47\\times120=1256{,}4\\ \\text{rad},\\qquad n=\\dfrac{\\theta}{2\\pi}\\approx200\\ \\text{tr}")],
        ["عزم عطالة الجملة", `القضيب حول منتصفه، والجسمان نقطيان على بعد $L/2$:` + F("J=\\tfrac1{12}mL^2+2m'\\left(\\tfrac L2\\right)^2=4{,}17\\times10^{-3}+2\\times9{,}375\\times10^{-3}=2{,}29\\times10^{-2}\\ \\text{kg}\\cdot\\text{m}^2")],
        ["الطاقة الحركية", F("E_{c0}=\\tfrac12J\\omega_0^2=\\tfrac12\\times2{,}29\\times10^{-2}\\times10{,}47^2\\approx1{,}26\\ \\text{J}")],
        ["عمل الاحتكاك والاستطاعة", F("E_{c0}-|W_f|=0\\Rightarrow |W_f|=1{,}26\\ \\text{J},\\quad W_f=-1{,}26\\ \\text{J}") + F("P=\\dfrac{|W_f|}{\\Delta t}=\\dfrac{1{,}26}{600}=2{,}1\\times10^{-3}\\ \\text{W}")],
        ["عزم الاحتكاك", F("|W_f|=|M_f|\\,\\theta\\Rightarrow |M_f|=\\dfrac{1{,}26}{500\\times2\\pi}\\approx4\\times10^{-4}\\ \\text{N}\\cdot\\text{m}")],
      ],
    },
    {
      n: 10, title: "توازن ساق على قرص، ثم دوران بعد إزالة كتلة",
      st: `قرص متجانس $(S)$ كتلته $m=100\\,\\text{g}$ ونصف قطره $r=10\\,\\text{cm}$ يدور في مستوٍ شاقولي حول محور أفقي يمرّ بمركزه $O$. على امتداد أحد أقطاره ساق $AB$ مهملة الكتلة طولها $L=40\\,\\text{cm}$ منتصفها $O$، تحمل في $A$ كتلة نقطية $m_1=40\\,\\text{g}$، ونثبّت كتلة $m_2=80\\,\\text{g}$ في نقطة $C$ من الساق لتبقى الجملة متوازنة أفقيا.<br>1) أوجد $OC$.<br>2) نزيل $m_2$ والساق أفقية دون سرعة ابتدائية: احسب عمل ثقل $m_1$ حتى الوضع الشاقولي $D$، ثم الطاقة الحركية والسرعة الزاوية للجملة (قرص + $m_1$) في $D$.`,
      svg: `<svg viewBox="0 0 260 150">${arrowDefs}<circle cx="130" cy="60" r="34" fill="#b9c3cf" stroke="${ink}"/><rect x="20" y="57" width="220" height="6" fill="#8a96a8"/>
        <circle cx="130" cy="60" r="4" fill="${amb}"/>${T(124, 50, "O")}<circle cx="230" cy="60" r="9" fill="#5d6f84"/>${T(226, 44, "A")}<circle cx="80" cy="60" r="11" fill="#c9a26a"/>${T(74, 44, "C")}${T(14, 50, "B")}
        <path d="M230 60 A100 100 0 0 1 130 160" fill="none" stroke="${ink}" stroke-dasharray="4 4" opacity=".5"/>${T(136, 146, "D")}
        <line x1="230" y1="69" x2="230" y2="110" stroke="${red}" stroke-width="2.5" marker-end="url(#ah)"/>${T(236, 108, "P₁", red)}</svg>`,
      steps: [
        ["1) موضع m₂", `عزوم $\\vec R$ وثقل القرص معدومة (حاملاهما يمرّان بالمحور). شرط التوازن:` + F("m_1g\\cdot OA-m_2g\\cdot OC=0\\Rightarrow OC=\\dfrac{m_1\\,(L/2)}{m_2}=\\dfrac{0{,}04\\times0{,}2}{0{,}08}=0{,}1\\ \\text{m}=10\\ \\text{cm}")],
        ["2-أ) ماذا يحدث؟", `يختلّ التوازن: يبقى عزم ثقل $m_1$ وحده، فتدور الجملة في جهة نزول $m_1$.`],
        ["2-ب) عمل ثقل m₁", `تنزل $m_1$ بارتفاع $h=L/2$:` + F("W(\\vec P_1)=m_1g\\dfrac L2=0{,}04\\times10\\times0{,}2=8\\times10^{-2}\\ \\text{J}")],
        ["2-ج) الطاقة الحركية في D", F("E_{cA}+W(\\vec P_1)=E_{cD}\\Rightarrow E_{cD}=8\\times10^{-2}\\ \\text{J}")],
        ["2-ج) السرعة الزاوية في D", `عزم عطالة الجملة: قرص ($m=0{,}1\\,\\text{kg}$) + كتلة نقطية على بعد $L/2$:` + F("J=\\tfrac12mr^2+m_1\\left(\\tfrac L2\\right)^2=\\tfrac12\\times0{,}1\\times0{,}1^2+0{,}04\\times0{,}2^2=2{,}1\\times10^{-3}\\ \\text{kg}\\cdot\\text{m}^2") + F("\\omega_D=\\sqrt{\\dfrac{2E_{cD}}{J}}=\\sqrt{\\dfrac{2\\times0{,}08}{2{,}1\\times10^{-3}}}\\approx8{,}73\\ \\text{rad/s}")],
      ],
    },
    {
      n: 11, title: "ملفاف يرفع حمولة بسرعة ثابتة",
      st: `يُدار ملفاف بمحرّك يطبّق مزدوجة عزمها $M_\\Delta$. يلتفّ حول أسطوانته (نصف قطرها $r=30\\,\\text{cm}$) حبل يرفع جسما $(S)$ كتلته $m=200\\,\\text{kg}$ بسرعة ثابتة. احسب: عزم المزدوجة المحرّكة، عملها عندما يدور الملفاف $2{,}5$ دورة، الارتفاع الموافق وعمل الثقل، ثم استطاعة المحرّك إذا كان يدور بمعدّل دورة واحدة في الدقيقة. $g=10\\,\\text{m/s}^2$.`,
      svg: `<svg viewBox="0 0 260 170">${arrowDefs}<circle cx="150" cy="50" r="40" fill="#c4a27a" stroke="${ink}"/><circle cx="150" cy="50" r="5" fill="${amb}"/>
        <line x1="150" y1="50" x2="110" y2="50" stroke="${teal}" stroke-width="2"/>${T(124, 44, "r", teal)}
        <line x1="110" y1="50" x2="110" y2="122" stroke="${ink}" stroke-width="1.5"/><rect x="92" y="122" width="36" height="30" fill="#8a7458" stroke="${ink}"/>
        <line x1="110" y1="152" x2="110" y2="168" stroke="${red}" stroke-width="2.5" marker-end="url(#ah)"/>${T(118, 166, "P", red)}
        <path d="M195 30 A48 48 0 0 1 196 72" fill="none" stroke="${vio}" stroke-width="2" marker-end="url(#ah)"/>${T(204, 56, "M", vio)}</svg>`,
      steps: [
        ["عزم المزدوجة المحرّكة", `الحركة الدورانية منتظمة: $\\sum M=0$، والحمولة منتظمة الحركة: $T=P$.` + F("M_\\Delta-T\\,r=0\\Rightarrow M_\\Delta=m\\,g\\,r=200\\times10\\times0{,}3=600\\ \\text{N}\\cdot\\text{m}")],
        ["عمل المزدوجة", F("W=M_\\Delta\\,\\theta=600\\times2{,}5\\times2\\pi\\approx9{,}42\\times10^3\\ \\text{J}")],
        ["الارتفاع وعمل الثقل", `نقطة من محيط الأسطوانة تقطع $S=r\\theta$ وهو ارتفاع الحمولة:` + F("h=r\\theta=0{,}3\\times5\\pi\\approx4{,}71\\ \\text{m},\\qquad W(\\vec P)=-m\\,g\\,h\\approx-9{,}42\\times10^3\\ \\text{J}") + `<p class="note">العمل المكتسب يساوي العمل المقدَّم للحمولة: $W=|W(\\vec P)|$.</p>`],
        ["استطاعة المحرّك", F("P_m=M_\\Delta\\,\\omega=600\\times\\dfrac{2\\pi}{60}\\approx62{,}8\\ \\text{W}")],
      ],
    },
  ];

  const exBox = document.getElementById("exBox");
  EX.forEach((e, k) => {
    const card = h("article", { class: "card ex" });
    card.innerHTML = `<div class="ex-head"><h3>تمرين ${k + 1}: ${e.title}</h3><span class="ex-src">(التمرين ${e.n} من السلسلة)</span></div>
      <div class="ex-body"><div class="ex-st">${e.st}</div><div class="ex-fig" aria-hidden="true">${e.svg}</div></div>
      <div class="sol">${e.steps.map(([t, b]) => `<div class="st"><h5>${t}</h5>${b}</div>`).join("")}</div>
      <div class="sol-btns no-print"><button type="button" class="btn2 primary nx">أظهر الخطوة التالية</button><button type="button" class="btn2 all">أظهر الحلّ كاملا</button><button type="button" class="btn2 hide">أخفِ الحلّ</button></div>`;
    exBox.append(card);
    renderInline(card.querySelector(".ex-st"));
    card.querySelectorAll(".st").forEach(s => renderInline(s));
    renderMath(card);
    const sts = [...card.querySelectorAll(".st")], nx = card.querySelector(".nx");
    let i = 0;
    const sync = () => { sts.forEach((s, j) => s.classList.toggle("on", j < i)); nx.disabled = i >= sts.length; nx.textContent = i >= sts.length ? "اكتمل الحلّ" : `أظهر الخطوة ${i + 1} من ${sts.length}`; };
    nx.addEventListener("click", () => { i = Math.min(sts.length, i + 1); sync(); sts[i - 1].scrollIntoView({ block: "nearest", behavior: REDUCED ? "auto" : "smooth" }); });
    card.querySelector(".all").addEventListener("click", () => { i = sts.length; sync(); });
    card.querySelector(".hide").addEventListener("click", () => { i = 0; sync(); });
    sync();
  });
})();
