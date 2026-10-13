# Claude Code Field Guide

A searchable, verified guide to the 54 tools, skills, MCP servers, and articles on the "Claude Code Resource Bible" cheat sheet that circulated on Reddit.

**Live site:** https://inquiredu.org/claude-code-field-guide/

The original image looked authoritative, but a link-by-link check on October 13, 2026 found that 16 of its 55 links were dead or wouldn't load and 8 entries described the wrong tool. This guide keeps every entry, explains each one in plain language from the project's own page or README, and stamps it with what the check found.

## Stamps

| Stamp | Meaning |
|---|---|
| Verified | The link works and the tool matches the description. |
| Link fixed | The cheat sheet's link was dead. The card points to the official or best-known working equivalent and shows the original link crossed out. |
| Relabeled | The link works, but the cheat sheet described the tool wrong. |
| Heads-up | The link works, with a catch: deprecated, renamed, or worth a second look before use. |
| Couldn't confirm | The original couldn't be found; the card shows the closest match. |

## Features

- Search across names, summaries, notes, and URLs
- Filter by category or by stamp
- **Draw a card** jumps to a random tool
- **★ My stack** saves favorites in your browser (nothing leaves your device)
- **Share card** copies a direct link to one tool, like `#tool-31`
- Light and dark themes follow your system setting

## How it's built

A static site with no build step, served by GitHub Pages.

```
index.html          page structure
assets/style.css    design tokens and layout
assets/app.js       search, filters, stars, deep links
assets/favicon.svg
data/tools.json     every entry: summary, stamp, notes, current and original URLs
```

## Updating an entry

Edit `data/tools.json` and commit. Each tool looks like this:

```json
{
  "number": 13,
  "category": "MCP Servers",
  "name": "Playwright",
  "status": "fixed",
  "summary": "Microsoft's official Playwright MCP server...",
  "poster_blurb": "Browser automation (official)",
  "note": "Optional caveat shown under the summary.",
  "url": "https://github.com/microsoft/playwright-mcp",
  "original_url": "https://github.com/anthropics/mcp-server-playwright"
}
```

`status` is one of `ok`, `fixed`, `relabel`, `heads`, or `unk`. Leave out `note` and `original_url` when they don't apply. If you re-verify the whole list, update the date in `data/tools.json` and in the page header.

## Monthly link check

A GitHub Action (`.github/workflows/link-check.yml`) runs `scripts/check_links.py` on the 1st of every month and can be started any time from the **Actions** tab with **Run workflow**.

- GitHub repos are checked through the GitHub API, which flags missing, archived, and renamed repos.
- Other links get a web request. A 404, a 410, or a domain that no longer exists counts as broken.
- Sites that block automated checks (403, 429, timeouts) are listed as "couldn't check" so a human can confirm, but they never trigger an issue on their own.

When something is broken or worth a look, the workflow opens an issue labeled `link-check` with a checklist, or adds a comment to the open one. When a later run passes, it closes the issue.

## License

- **Code** (`index.html`, `assets/`, `scripts/`): [MIT](LICENSE)
- **Written content** (summaries, notes, and stamps in `data/tools.json`): [CC BY 4.0](LICENSE-CONTENT.md)

Tool names and descriptions belong to their projects, and the cheat sheet's original wording is quoted only for comparison.

## Credits

Original list: the "Claude Code Resource Bible" image shared in the SATNA_PROJECT community on Reddit. Verification, summaries, and site by [inquiredu](https://inquiredu.org).
