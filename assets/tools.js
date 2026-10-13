(() => {
  const STAMPS = {
    ok: ["Verified", "Link works and matches"],
    fixed: ["Link fixed", "Cheat sheet link was dead"],
    relabel: ["Relabeled", "Link works, blurb was wrong"],
    heads: ["Heads-up", "Works, with a catch"],
    unk: ["Couldn't confirm", "Closest match shown"]
  };
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const bare = u => u.replace(/^https:\/\//, "");
  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

  let stars = new Set();
  try { stars = new Set(JSON.parse(localStorage.getItem("ccfg-stars") || "[]")); } catch (e) {}
  const save = () => { try { localStorage.setItem("ccfg-stars", JSON.stringify([...stars])); } catch (e) {} };

  const state = { q: "", cat: "All", st: null, mine: false };
  let D = [];

  function card(d) {
    const no = d.number === 0 ? "Start" : "#" + String(d.number).padStart(2, "0");
    const struck = d.status === "relabel" || d.number === 29;
    return `<article class="card" id="tool-${d.number}">
      <div class="top"><div><div class="no">${no} · <span class="cat">${esc(d.category)}</span></div><h2>${esc(d.name)}</h2></div>
      <span class="stamp s-${d.status}" title="${STAMPS[d.status][1]}">${STAMPS[d.status][0]}</span></div>
      <p class="what">${esc(d.summary)}</p>
      <p class="poster">Cheat sheet said: ${struck ? "<s>" + esc(d.poster_blurb) + "</s>" : esc(d.poster_blurb)}</p>
      ${d.note ? `<p class="note">${esc(d.note)}</p>` : ""}
      ${d.original_url ? `<p class="url old" title="Original link from the cheat sheet">${esc(bare(d.original_url))}</p>` : ""}
      <p class="url">${esc(bare(d.url))}</p>
      <div class="actions">
        <a class="go" href="${esc(d.url)}" target="_blank" rel="noopener">Open</a>
        <button type="button" data-copy="${esc(d.url)}">Copy link</button>
        <button type="button" data-share="${d.number}">Share card</button>
        <button type="button" class="star" data-star="${d.number}" aria-pressed="${stars.has(d.number)}" aria-label="Add ${esc(d.name)} to my stack">✦</button>
      </div></article>`;
  }

  function render() {
    const q = state.q.toLowerCase().trim();
    const list = D.filter(d =>
      (state.cat === "All" || d.category === state.cat) &&
      (!state.st || d.status === state.st) &&
      (!state.mine || stars.has(d.number)) &&
      (!q || [d.name, d.summary, d.poster_blurb, d.note || "", d.category, d.url].join(" ").toLowerCase().includes(q)));
    $("deck").innerHTML = list.length ? list.map(card).join("") :
      `<div class="empty">${state.mine && !stars.size ? "Your stack is empty. Tap ✦ on any card to add it." : "Nothing matches. Try a broader word or clear a filter."}</div>`;
    $("count").textContent = `Showing ${list.length} of ${D.length}`;
    $("mineN").textContent = stars.size;
    return list;
  }

  function spotlight(n) {
    const el = document.getElementById("tool-" + n);
    if (!el) return;
    el.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "center" });
    el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash");
  }

  function feedback(btn, text, reset) {
    btn.textContent = text;
    setTimeout(() => { btn.textContent = reset; }, 1400);
  }

  function copy(text, btn, reset, fallbackNode) {
    const ok = () => feedback(btn, "Copied", reset);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(ok).catch(() => selectNode(fallbackNode, btn));
    } else selectNode(fallbackNode, btn);
  }
  function selectNode(node, btn) {
    if (!node) return;
    const r = document.createRange(); r.selectNodeContents(node);
    const s = getSelection(); s.removeAllRanges(); s.addRange(r);
    btn.textContent = "Selected";
  }

  function wire() {
    const cats = ["All", ...new Set(D.map(d => d.category))];
    $("cats").innerHTML = cats.map(c => `<button type="button" class="chip" data-c="${esc(c)}" aria-pressed="${c === "All"}">${esc(c)}</button>`).join("");
    $("tally").innerHTML = Object.entries(STAMPS).map(([k, v]) =>
      `<button type="button" data-s="${k}" aria-pressed="false" title="${v[1]}"><span class="stamp s-${k}" style="transform:none;padding:1px 6px">${v[0]}</span><b>${D.filter(d => d.status === k).length}</b></button>`).join("");

    $("q").addEventListener("input", e => { state.q = e.target.value; render(); });
    $("cats").addEventListener("click", e => {
      const b = e.target.closest(".chip"); if (!b) return;
      state.cat = b.dataset.c;
      document.querySelectorAll(".chip").forEach(x => x.setAttribute("aria-pressed", x === b));
      render();
    });
    $("tally").addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return;
      state.st = state.st === b.dataset.s ? null : b.dataset.s;
      document.querySelectorAll("#tally button").forEach(x => x.setAttribute("aria-pressed", x.dataset.s === state.st));
      render();
    });
    $("mine").addEventListener("click", e => {
      state.mine = !state.mine;
      e.currentTarget.setAttribute("aria-pressed", state.mine);
      render();
    });
    $("draw").addEventListener("click", () => {
      const list = render(); if (!list.length) return;
      spotlight(list[Math.floor(Math.random() * list.length)].number);
    });
    $("deck").addEventListener("click", e => {
      const s = e.target.closest("[data-star]");
      if (s) {
        const n = +s.dataset.star;
        stars.has(n) ? stars.delete(n) : stars.add(n);
        save();
        s.setAttribute("aria-pressed", stars.has(n));
        $("mineN").textContent = stars.size;
        if (state.mine) render();
        return;
      }
      const c = e.target.closest("[data-copy]");
      if (c) { copy(c.dataset.copy, c, "Copy link", c.closest(".card").querySelector(".url:not(.old)")); return; }
      const sh = e.target.closest("[data-share]");
      if (sh) {
        const link = location.origin + location.pathname + "#tool-" + sh.dataset.share;
        history.replaceState(null, "", "#tool-" + sh.dataset.share);
        copy(link, sh, "Share card", null);
      }
    });
  }

  fetch("data/tools.json")
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(data => {
      D = data.tools;
      wire();
      render();
      const m = location.hash.match(/^#tool-(\d+)$/);
      if (m) requestAnimationFrame(() => spotlight(+m[1]));
    })
    .catch(() => {
      $("deck").innerHTML = `<div class="empty">The tool list didn't load. Refresh to try again, or read the raw list in <a href="data/tools.json">data/tools.json</a>.</div>`;
    });
})();
