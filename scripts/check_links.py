#!/usr/bin/env python3
"""Check every link in data/tools.json and write a Markdown report.

GitHub repo links are checked through the GitHub API (exists, archived,
renamed). Other links get an HTTP request. Results fall into three groups:

  broken   - definitely gone (404/410, missing repo, DNS failure)
  watch    - still up but worth a look (archived repo, moved/renamed repo)
  unclear  - the site blocked or failed the check (403, 429, 5xx, timeout);
             often bot protection, so these are listed but never alone
             counted as broken

Exit code: 1 if anything is broken, else 0.
Writes the report to link-report.md and, when running in GitHub Actions,
sets the output `broken=true|false`.
"""
import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data", "tools.json")
TOKEN = os.environ.get("GITHUB_TOKEN", "")
UA = "Mozilla/5.0 (compatible; claude-code-field-guide-linkcheck/1.0; +https://github.com/inquiredu/claude-code-field-guide)"
GH_RE = re.compile(r"^https://github\.com/([^/]+)/([^/#?]+)/?$")


def request(url, method="GET", headers=None):
    req = urllib.request.Request(url, method=method, headers={"User-Agent": UA, **(headers or {})})
    with urllib.request.urlopen(req, timeout=25) as r:
        return r.status, r.geturl(), r.read(200_000) if method == "GET" else b""


def check_github(owner, repo):
    headers = {"Accept": "application/vnd.github+json"}
    if TOKEN:
        headers["Authorization"] = f"Bearer {TOKEN}"
    try:
        _, _, body = request(f"https://api.github.com/repos/{owner}/{repo}", headers=headers)
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return "broken", "Repo not found"
        return "unclear", f"GitHub API returned {e.code}"
    except Exception as e:  # network trouble
        return "unclear", f"GitHub API error: {e}"
    info = json.loads(body)
    full = info.get("full_name", "")
    if info.get("archived"):
        return "watch", f"Repo is archived (read-only) as {full}"
    if full.lower() != f"{owner}/{repo}".lower():
        return "watch", f"Repo moved to {full}"
    return "ok", ""


def check_web(url):
    for method in ("HEAD", "GET"):
        try:
            status, final, _ = request(url, method=method)
            if final.rstrip("/") != url.rstrip("/") and urllib.parse.urlsplit(final).netloc != urllib.parse.urlsplit(url).netloc:
                return "watch", f"Redirects to another site: {final}"
            return "ok", ""
        except urllib.error.HTTPError as e:
            if method == "HEAD" and e.code in (400, 403, 405, 501):
                continue  # some servers reject HEAD; retry with GET
            if e.code in (404, 410):
                return "broken", f"HTTP {e.code}"
            return "unclear", f"HTTP {e.code}"
        except urllib.error.URLError as e:
            reason = str(getattr(e, "reason", e))
            if "Name or service not known" in reason or "nodename nor servname" in reason or "getaddrinfo" in reason:
                return "broken", "Domain doesn't resolve"
            return "unclear", reason
        except Exception as e:
            return "unclear", str(e)
    return "unclear", "No response"


def main():
    with open(DATA, encoding="utf-8") as f:
        tools = json.load(f)["tools"]

    groups = {"broken": [], "watch": [], "unclear": []}
    for t in tools:
        url = t["url"]
        m = GH_RE.match(url)
        result, detail = check_github(m[1], m[2]) if m else check_web(url)
        label = f"#{t['number']} {t['name']}"
        print(f"{result:8} {label} - {url} {detail}")
        if result != "ok":
            groups[result].append((t, detail))

    lines = ["Automated monthly check of every link in `data/tools.json`.", ""]
    titles = {
        "broken": "Broken (fix these)",
        "watch": "Worth a look",
        "unclear": "Couldn't check (often bot protection; open by hand to confirm)",
    }
    for key in ("broken", "watch", "unclear"):
        if not groups[key]:
            continue
        lines += [f"### {titles[key]}", ""]
        for t, detail in groups[key]:
            lines.append(f"- [ ] **#{t['number']} {t['name']}** ({t['category']}): {t['url']} - {detail}")
        lines.append("")
    if not any(groups.values()):
        lines.append("All links passed.")
    lines += ["", f"Checked {len(tools)} links. When an entry changes, update its `url`, `status`, and `note` in `data/tools.json`."]

    with open(os.path.join(ROOT, "link-report.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")

    broken = bool(groups["broken"] or groups["watch"])
    out = os.environ.get("GITHUB_OUTPUT")
    if out:
        with open(out, "a") as f:
            f.write(f"broken={'true' if broken else 'false'}\n")
    print(f"\nbroken={len(groups['broken'])} watch={len(groups['watch'])} unclear={len(groups['unclear'])}")
    return 1 if groups["broken"] else 0


if __name__ == "__main__":
    sys.exit(main())
