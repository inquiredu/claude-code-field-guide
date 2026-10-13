(() => {
  const { esc, slug, json, fail } = CFG;
  const STAMPS = {
    accurate: ["Accurate", "s-ok", "The original definition holds up"],
    sharpened: ["Sharpened", "s-fixed", "The original overstated something; this version corrects it"],
    added: ["Added", "s-added", "Not on the original list, but used constantly"]
  };
  const $ = id => document.getElementById(id);
  const main = $("terms");
  const state = { q: "", group: "All", stamp: null, flash: false, deck: [], i: 0, flipped: false };
  let T = [];

  const filtered = () => {
    const q = state.q.toLowerCase().trim();
    return T.filter(t =>
      (state.group === "All" || t.group === state.group) &&
      (!state.stamp || t.stamp === state.stamp) &&
      (!q || [t.term, t.short, t.plain, t.example].join(" ").toLowerCase().includes(q)));
  };

  function card(t) {
    const s = STAMPS[t.stamp];
    return `<article class="term" id="${slug(t.term)}">
      <div class="top"><div class="cat">${esc(t.group)}</div><span class="stamp ${s[1]}" title="${s[2]}">${s[0]}</span></div>
      <h2>${esc(t.term)}</h2>
      <p class="short">${esc(t.short)}</p>
      <p>${esc(t.plain)}</p>
      <p class="ex">Example: ${esc(t.example)}</p>
      ${t.sheet_said ? `<p class="sheet">Original list: ${t.stamp === "sharpened" ? `<s>${esc(t.sheet_said)}</s><br>${esc(t.why)}` : esc(t.sheet_said)}</p>` : ""}
      ${t.related?.length ? `<div class="termchips">${t.related.map(r => `<a href="#${slug(r)}">${esc(r)}</a>`).join("")}</div>` : ""}
    </article>`;
  }

  function shuffle(a) { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  function renderFlash() {
    if (!state.deck.length) { main.innerHTML = `<div class="empty">No terms match these filters.</div>`; return; }
    const t = state.deck[state.i];
    main.innerHTML = `<div class="flash-wrap">
      <div class="count">Card ${state.i + 1} of ${state.deck.length}</div>
      <button type="button" class="fcard" id="fc" aria-label="Flip card">
        ${state.flipped
          ? `<span class="big" style="font-size:22px">${esc(t.term)}</span><span>${esc(t.short)}</span><span class="hint">${esc(t.example)}</span>`
          : `<span class="hint">What's the term?</span><span class="big" style="font-size:clamp(20px,4vw,26px)">${esc(t.short)}</span><span class="hint">Tap to flip</span>`}
      </button>
      <div class="frow">
        <button class="btn ghost" type="button" id="fprev">← Back</button>
        <button class="btn ghost" type="button" id="fshuf">Shuffle</button>
        <button class="btn" type="button" id="fnext">Next →</button>
      </div></div>`;
    $("fc").onclick = () => { state.flipped = !state.flipped; renderFlash(); $("fc").focus(); };
    $("fnext").onclick = () => { state.i = (state.i + 1) % state.deck.length; state.flipped = false; renderFlash(); };
    $("fprev").onclick = () => { state.i = (state.i - 1 + state.deck.length) % state.deck.length; state.flipped = false; renderFlash(); };
    $("fshuf").onclick = () => { state.deck = shuffle(state.deck); state.i = 0; state.flipped = false; renderFlash(); };
  }

  function render() {
    const list = filtered();
    $("gcount").textContent = `Showing ${list.length} of ${T.length}`;
    if (state.flash) { state.deck = list; state.i = Math.min(state.i, Math.max(list.length - 1, 0)); renderFlash(); return; }
    main.innerHTML = list.length ? `<div class="g-grid">${list.map(card).join("")}</div>` : `<div class="empty">Nothing matches. Try a broader word.</div>`;
  }

  json("data/glossary.json").then(d => {
    T = d.terms;
    const groups = ["All", ...new Set(T.map(t => t.group))];
    $("groups").innerHTML = groups.map(g => `<button type="button" class="chip" data-g="${esc(g)}" aria-pressed="${g === "All"}">${esc(g)}</button>`).join("");
    $("stamps").innerHTML = Object.entries(STAMPS).map(([k, v]) => `<button type="button" data-s="${k}" aria-pressed="false" title="${v[2]}"><span class="stamp ${v[1]}" style="transform:none;padding:1px 6px">${v[0]}</span><b>${T.filter(t => t.stamp === k).length}</b></button>`).join("");
    $("gq").addEventListener("input", e => { state.q = e.target.value; state.i = 0; render(); });
    $("groups").addEventListener("click", e => { const b = e.target.closest(".chip"); if (!b) return; state.group = b.dataset.g; state.i = 0; document.querySelectorAll("#groups .chip").forEach(x => x.setAttribute("aria-pressed", x === b)); render(); });
    $("stamps").addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; state.stamp = state.stamp === b.dataset.s ? null : b.dataset.s; state.i = 0; document.querySelectorAll("#stamps button").forEach(x => x.setAttribute("aria-pressed", x.dataset.s === state.stamp)); render(); });
    $("mode").addEventListener("click", e => { state.flash = !state.flash; state.flipped = false; state.i = 0; if (state.flash) state.deck = shuffle(filtered()); e.currentTarget.setAttribute("aria-pressed", state.flash); e.currentTarget.textContent = state.flash ? "Show all cards" : "Practice with flashcards"; if (state.flash) renderFlash(); else render(); $("gcount").textContent = `Showing ${filtered().length} of ${T.length}`; });
    render();
    if (location.hash) { const el = document.getElementById(location.hash.slice(1)); if (el) requestAnimationFrame(() => el.scrollIntoView({ block: "center" })); }
  }).catch(() => fail(main, "glossary"));
})();
