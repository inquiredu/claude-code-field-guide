(() => {
  const { esc, json, fail } = CFG;
  const V = {
    current: ["Current", "s-ok", "Accurate today"],
    outdated: ["Outdated", "s-fixed", "Was true; it has changed"],
    wrong: ["Wrong", "s-unk", "Not accurate"],
    opinion: ["Opinion", "s-relabel", "One author's advice or taste, not a checkable fact"],
    unverified: ["Unverified", "s-heads", "No official source confirms it"]
  };
  const $ = id => document.getElementById(id);
  const main = $("claims");
  const state = { q: "", topic: "All", v: null, guess: false, revealed: new Set() };
  let C = [], sheets = {};

  function card(c) {
    const v = V[c.verdict];
    const hidden = state.guess && !state.revealed.has(c.id);
    const sheet = sheets[c.sheet];
    return `<article class="claim" id="claim-${c.id}">
      <p class="said">${esc(c.claim)}</p>
      ${hidden ? "" : `<span class="stamp ${v[1]}" title="${v[2]}">${v[0]}</span>`}
      ${hidden
        ? `<div class="truth"><div class="meta" style="margin-bottom:6px">Your call?</div><div class="frow" style="justify-content:flex-start">${Object.entries(V).map(([k, x]) => `<button type="button" class="mini" data-guess="${k}" data-id="${c.id}">${x[0]}</button>`).join("")}</div></div>`
        : `<p class="truth">${c.guessed ? `<b>${c.guessed === c.verdict ? "You got it. " : `You guessed ${V[c.guessed][0].toLowerCase()}. `}</b>` : ""}${esc(c.truth)}</p>`}
      <p class="src">${sheet ? `From ${esc(sheet.label)}` : ""}${!hidden && c.source_url ? ` · Checked against <a href="${esc(c.source_url)}" target="_blank" rel="noopener">${esc(c.source_title || "official source")}</a>` : ""}</p>
    </article>`;
  }

  function render() {
    const q = state.q.toLowerCase().trim();
    const list = C.filter(c =>
      (state.topic === "All" || c.topic === state.topic) &&
      (!state.v || c.verdict === state.v) &&
      (!q || [c.claim, c.truth, c.topic].join(" ").toLowerCase().includes(q)));
    $("kcount").textContent = `Showing ${list.length} of ${C.length}`;
    main.innerHTML = list.length ? `<div class="claims">${list.map(card).join("")}</div>` : `<div class="empty">Nothing matches. Try a broader word.</div>`;
  }

  json("data/claims.json").then(d => {
    C = d.claims; sheets = d.sheets;
    $("keyebrow").textContent = `Sheet check · ${C.length} claims from ${Object.keys(sheets).length} infographics`;
    $("kstamps").innerHTML = Object.entries(V).filter(([k]) => C.some(c => c.verdict === k)).map(([k, v]) => `<button type="button" data-v="${k}" aria-pressed="false" title="${v[2]}"><span class="stamp ${v[1]}" style="transform:none;padding:1px 6px">${v[0]}</span><b>${C.filter(c => c.verdict === k).length}</b></button>`).join("");
    const topics = ["All", ...new Set(C.map(c => c.topic))];
    $("ktopics").innerHTML = topics.map(t => `<button type="button" class="chip" data-t="${esc(t)}" aria-pressed="${t === "All"}">${esc(t)}</button>`).join("");
    $("ksrc").innerHTML = `<p>Infographics checked: ${Object.values(sheets).map(s => esc(s.full)).join("; ")}. Checked on ${esc(d.checked_on)} against Anthropic's help center, documentation, and product pages only.</p>`;
    $("kq").addEventListener("input", e => { state.q = e.target.value; render(); });
    $("ktopics").addEventListener("click", e => { const b = e.target.closest(".chip"); if (!b) return; state.topic = b.dataset.t; document.querySelectorAll("#ktopics .chip").forEach(x => x.setAttribute("aria-pressed", x === b)); render(); });
    $("kstamps").addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; state.v = state.v === b.dataset.v ? null : b.dataset.v; document.querySelectorAll("#kstamps button").forEach(x => x.setAttribute("aria-pressed", x.dataset.v === state.v)); render(); });
    $("guess").addEventListener("click", e => { state.guess = !state.guess; state.revealed.clear(); C.forEach(c => delete c.guessed); e.currentTarget.setAttribute("aria-pressed", state.guess); e.currentTarget.textContent = state.guess ? "Show all answers" : "Guess first"; render(); });
    main.addEventListener("click", e => {
      const b = e.target.closest("[data-guess]"); if (!b) return;
      const c = C.find(x => String(x.id) === b.dataset.id);
      c.guessed = b.dataset.guess; state.revealed.add(c.id); render();
      document.getElementById("claim-" + c.id)?.querySelector(".truth")?.setAttribute("tabindex", "-1");
    });
    render();
  }).catch(() => fail(main, "claims"));
})();
