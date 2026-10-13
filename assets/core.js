// Shared helpers for every page: escaping, saved progress, copy buttons, data loading.
window.CFG = (() => {
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const slug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const KEY = "cfg-progress-v1";
  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { return {}; }
  }
  function save(p) {
    try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) {}
  }
  function lesson(id) {
    const p = load();
    return p[id] || { done: false, checks: [], quiz: {} };
  }
  function setLesson(id, data) {
    const p = load();
    p[id] = { ...lesson(id), ...data };
    save(p);
  }

  function copy(text, btn, label = "Copy", fallbackNode = null) {
    const ok = () => { btn.textContent = "Copied"; setTimeout(() => (btn.textContent = label), 1400); };
    const select = () => {
      if (!fallbackNode) return;
      const r = document.createRange(); r.selectNodeContents(fallbackNode);
      const s = getSelection(); s.removeAllRanges(); s.addRange(r);
      btn.textContent = "Selected";
    };
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(ok).catch(select);
    else select();
  }

  async function json(path) {
    const r = await fetch(path);
    if (!r.ok) throw new Error(path + " " + r.status);
    return r.json();
  }

  function fail(el, what) {
    el.innerHTML = `<div class="empty">The ${esc(what)} didn't load. Refresh to try again.</div>`;
  }

  return { esc, slug, load, save, lesson, setLesson, copy, json, fail };
})();
