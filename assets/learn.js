(() => {
  const { esc, slug, lesson, setLesson, copy, json, fail } = CFG;
  const nav = document.getElementById("lesson-nav");
  const main = document.getElementById("lesson");
  let data = { paths: [], lessons: [] };

  const byId = id => data.lessons.find(l => l.id === id);
  const inPath = p => data.lessons.filter(l => l.path === p);

  function renderNav(current) {
    const wide = matchMedia("(min-width: 821px)").matches;
    const doneCount = data.lessons.filter(l => lesson(l.id).done).length;
    nav.innerHTML = `<details class="lesson-menu" ${wide ? "open" : ""}><summary>All lessons <span class="count">${doneCount} of ${data.lessons.length} done</span></summary><div class="lesson-menu-body">` + data.paths.map(p => `
      <section>
        <h2>${esc(p.title)}</h2>
        <ol>${inPath(p.id).map(l => {
          const st = lesson(l.id);
          return `<li><a href="#${l.id}" aria-current="${l.id === current}"><span class="dot ${st.done ? "done" : ""}" aria-hidden="true">${st.done ? "✓" : ""}</span>${esc(l.title)}${st.done ? '<span class="sr"> (done)</span>' : ""}</a></li>`;
        }).join("")}</ol>
      </section>`).join("") + `</div></details>`;
  }

  function quizHTML(l, st) {
    if (!l.quiz?.length) return "";
    return `<section class="block"><h2>Quick check</h2>${l.quiz.map((q, qi) => {
      const picked = st.quiz?.[qi];
      const answered = picked !== undefined;
      return `<div class="q" data-q="${qi}"><p>${esc(q.q)}</p><div class="opts">${q.options.map((o, oi) => {
        const cls = answered ? (oi === q.answer ? "right" : oi === picked ? "wrong" : "") : "";
        return `<button type="button" data-o="${oi}" class="${cls}" ${answered ? "disabled" : ""}>${esc(o)}</button>`;
      }).join("")}</div>${answered ? `<p class="explain">${picked === q.answer ? "Right. " : "Not quite. "}${esc(q.explain)}</p>` : ""}</div>`;
    }).join("")}</section>`;
  }

  function renderLesson(id) {
    const l = byId(id) || data.lessons[0];
    const st = lesson(l.id);
    const path = data.paths.find(p => p.id === l.path);
    const list = data.lessons;
    const idx = list.indexOf(l);
    const next = list[idx + 1];
    const prev = list[idx - 1];

    main.innerHTML = `
      <div class="meta">${esc(path.title)} · Lesson ${inPath(l.path).indexOf(l) + 1} of ${inPath(l.path).length} · about ${l.minutes} min</div>
      <h1>${esc(l.title)}</h1>
      <p class="why">${esc(l.why)}</p>
      <div class="idea">${l.idea.map(p => `<p>${esc(p)}</p>`).join("")}</div>

      <section class="block try">
        <h2><span class="tag">Try it</span> ${esc(l.try.intro)}</h2>
        <ol class="steps">${l.try.steps.map(s => `<li>${esc(s)}</li>`).join("")}</ol>
        ${l.try.prompt ? `<div class="prompt-box" id="pb">${esc(l.try.prompt)}<button type="button" class="mini" id="copy-prompt">Copy prompt</button></div>` : ""}
        ${l.try.where ? `<p class="credit">${esc(l.try.where)}</p>` : ""}
        <div><a class="mini primary" href="${esc(l.try.open || "https://claude.ai/new")}" target="_blank" rel="noopener">${esc(l.try.openLabel || "Open Claude in a new tab")}</a></div>
      </section>

      <section class="block">
        <h2>You've got it when…</h2>
        <ul class="checks">${l.check.map((c, i) => `<li><label><input type="checkbox" data-c="${i}" ${st.checks?.includes(i) ? "checked" : ""}> <span>${esc(c)}</span></label></li>`).join("")}</ul>
      </section>

      ${quizHTML(l, st)}

      ${l.terms?.length ? `<div><div class="meta" style="margin-bottom:6px">Words from this lesson</div><div class="termchips">${l.terms.map(t => `<a href="glossary.html#${slug(t)}">${esc(t)}</a>`).join("")}</div></div>` : ""}
      ${l.credit ? `<p class="credit">${esc(l.credit.text)}${l.credit.url ? ` <a href="${esc(l.credit.url)}" target="_blank" rel="noopener">Source</a>` : ""}</p>` : ""}
      ${l.sources?.length ? `<p class="credit">Checked against: ${l.sources.map(s => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>`).join(" · ")}</p>` : ""}

      <div class="lesson-foot">
        ${st.done ? `<span class="done-banner">Lesson complete</span>` : `<button type="button" class="btn" id="complete">Mark complete</button>`}
        <span style="display:flex;gap:8px;flex-wrap:wrap">
          ${prev ? `<a class="mini" href="#${prev.id}">← ${esc(prev.title)}</a>` : ""}
          ${next ? `<a class="mini primary" href="#${next.id}">Next: ${esc(next.title)} →</a>` : `<a class="mini primary" href="./">Back to the hub</a>`}
        </span>
      </div>`;

    renderNav(l.id);

    const pb = document.getElementById("copy-prompt");
    if (pb) pb.addEventListener("click", () => copy(l.try.prompt, pb, "Copy prompt", document.getElementById("pb")));

    main.querySelectorAll("[data-c]").forEach(cb => cb.addEventListener("change", () => {
      const checks = [...main.querySelectorAll("[data-c]")].filter(x => x.checked).map(x => +x.dataset.c);
      const all = checks.length === l.check.length;
      setLesson(l.id, { checks, ...(all ? { done: true } : {}) });
      if (all && !st.done) renderLesson(l.id);
    }));

    main.querySelectorAll(".q").forEach(qel => qel.addEventListener("click", e => {
      const b = e.target.closest("[data-o]"); if (!b) return;
      const qi = +qel.dataset.q;
      const quiz = { ...(lesson(l.id).quiz || {}), [qi]: +b.dataset.o };
      setLesson(l.id, { quiz });
      const y = scrollY;
      renderLesson(l.id);
      scrollTo(0, y);
    }));

    const done = document.getElementById("complete");
    if (done) done.addEventListener("click", () => { setLesson(l.id, { done: true }); renderLesson(l.id); });
  }

  function route(focus) {
    const id = location.hash.slice(1);
    const target = byId(id) ? id : (data.lessons.find(l => !lesson(l.id).done) || data.lessons[0]).id;
    renderLesson(target);
    if (focus) { main.focus({ preventScroll: true }); scrollTo(0, 0); }
  }

  json("data/lessons.json").then(d => {
    data = d;
    route(false);
    addEventListener("hashchange", () => route(true));
  }).catch(() => fail(main, "lessons"));
})();
