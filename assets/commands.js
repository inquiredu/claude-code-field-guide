(() => {
  const { esc, json, fail, copy } = CFG;
  const V = {
    documented: ["Verified", "s-ok", "In the docs and described correctly"],
    different: ["Changed", "s-relabel", "Exists, but the sheet's description is wrong or outdated"],
    not_found: ["Not in docs", "s-unk", "Couldn't find it in the current documentation"],
    missed: ["Sheets missed", "s-added", "Current command the cheat sheets left out"]
  };
  const KINDS = { all: "All", slash: "Slash commands", cli: "Terminal (CLI)", shortcut: "Keyboard", keyword: "Keywords", file: "Files", env: "Environment" };
  const ORDER = ["Start & memory", "Session", "Context", "Models & thinking", "Permissions & safety", "Review & code", "Tools & integrations", "Automation", "Settings", "Shortcuts", "CLI"];
  const $ = id => document.getElementById(id);
  const main = $("cmds");
  const state = { q: "", kind: "all", v: null };
  let D = [];

  const verdictOf = i => i.origin === "missed" ? "missed" : i.verdict;

  function render() {
    const q = state.q.toLowerCase().trim();
    const list = D.filter(i =>
      (state.kind === "all" || i.kind === state.kind) &&
      (!state.v || verdictOf(i) === state.v) &&
      (!q || [i.cmd, i.desc, i.sheet_said || "", i.group].join(" ").toLowerCase().includes(q)));
    $("ccount").textContent = `Showing ${list.length} of ${D.length}`;
    if (!list.length) { main.innerHTML = `<div class="empty">Nothing matches. Try a broader word.</div>`; return; }
    const groups = ORDER.filter(g => list.some(i => i.group === g)).concat([...new Set(list.map(i => i.group))].filter(g => !ORDER.includes(g)));
    main.innerHTML = `<div class="cmd-table-wrap"><table class="cmds">
      <thead><tr><th scope="col">Command</th><th scope="col">What it does</th><th scope="col">Check</th></tr></thead>
      <tbody>${groups.map(g => `<tr class="grp"><td colspan="3">${esc(g)}</td></tr>` + list.filter(i => i.group === g).map(i => {
        const v = V[verdictOf(i)];
        const showSheet = i.origin === "sheet" && i.verdict !== "documented" && i.sheet_said;
        return `<tr>
          <td><code>${esc(i.cmd)}</code> <button type="button" class="mini" data-copy="${esc(i.cmd)}" aria-label="Copy ${esc(i.cmd)}" style="padding:2px 7px;font-size:11px">Copy</button></td>
          <td>${esc(i.desc)}${showSheet ? `<div class="credit" style="margin-top:4px">Sheet said: <s>${esc(i.sheet_said)}</s></div>` : ""}</td>
          <td><a href="${esc(i.source_url)}" target="_blank" rel="noopener" title="${v[2]}"><span class="stamp ${v[1]}" style="transform:none">${v[0]}</span></a></td>
        </tr>`;
      }).join("")).join("")}</tbody></table></div>`;
  }

  json("data/commands.json").then(d => {
    D = d.items;
    $("ceyebrow").textContent = `Claude Code · ${D.length} items · checked against the docs on ${new Date(d.checked_on + "T12:00:00").toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}`;
    $("cstamps").innerHTML = Object.entries(V).map(([k, v]) => `<button type="button" data-v="${k}" aria-pressed="false" title="${v[2]}"><span class="stamp ${v[1]}" style="transform:none;padding:1px 6px">${v[0]}</span><b>${D.filter(i => verdictOf(i) === k).length}</b></button>`).join("");
    const kinds = Object.keys(KINDS).filter(k => k === "all" || D.some(i => i.kind === k));
    $("kinds").innerHTML = kinds.map(k => `<button type="button" class="chip" data-k="${k}" aria-pressed="${k === "all"}">${KINDS[k]}</button>`).join("");
    $("csrc").innerHTML = `<p>Checked against Anthropic's documentation: ${d.sources.map(s => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>`).join(" · ")}. Tap a stamp to open the page it came from.</p><p>Original sheets: ${d.sheets.map(s => `"${esc(s.title)}"${s.author !== "unknown" ? ` by ${esc(s.author)}` : ""}`).join(" and ")}, shared on Reddit.</p>`;
    $("cq").addEventListener("input", e => { state.q = e.target.value; render(); });
    $("kinds").addEventListener("click", e => { const b = e.target.closest(".chip"); if (!b) return; state.kind = b.dataset.k; document.querySelectorAll("#kinds .chip").forEach(x => x.setAttribute("aria-pressed", x === b)); render(); });
    $("cstamps").addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; state.v = state.v === b.dataset.v ? null : b.dataset.v; document.querySelectorAll("#cstamps button").forEach(x => x.setAttribute("aria-pressed", x.dataset.v === state.v)); render(); });
    main.addEventListener("click", e => { const b = e.target.closest("[data-copy]"); if (b) copy(b.dataset.copy, b, "Copy"); });
    render();
  }).catch(() => fail(main, "command list"));
})();
