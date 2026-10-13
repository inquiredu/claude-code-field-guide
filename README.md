# Claude Field Guide

A free, hands-on learning site for using Claude well, built from viral Claude cheat sheets and checked against Anthropic's own documentation.

**Live site:** https://inquiredu.org/claude-code-field-guide/

Cheat sheets about Claude spread fast and age faster. The infographics behind this site recommended models that have since been replaced, listed keyboard shortcuts that no longer work, pointed to settings that moved, and mixed one author's preferences in with facts. This site keeps the useful ideas, checks every factual claim against Anthropic's help center and docs, labels opinions as opinions, and teaches by having you try each idea right away.

## What's here

| Page | What it does |
|---|---|
| **Home** (`index.html`) | Three learning paths with saved progress, plus the reference shelf |
| **Learn** (`learn.html`) | 14 lessons in three paths: *Start here*, *Make it yours*, *Build with Claude Code*. Each has a short idea, a **Try it** exercise with a copyable prompt, a "you've got it when" self-check, and a quick quiz |
| **Glossary** (`glossary.html`) | 32 AI terms in plain language, with flashcards. Terms from the original "20 Basic AI Terms" list are stamped Accurate or Sharpened, with the reason for any correction |
| **Commands** (`commands.html`) | 135 Claude Code commands, shortcuts, and settings from two cheat sheets, each stamped Verified, Changed, Not in docs, or Sheets missed, linked to the docs page |
| **Tools** (`tools.html`) | 54 add-ons, skills, and MCP servers from the "Claude Code Resource Bible," every link tested |
| **Sheet check** (`check.html`) | 32 claims from five infographics, stamped Current, Outdated, Wrong, Opinion, or Unverified, with a "guess first" mode |

Progress, stars, and quiz answers are saved only in the visitor's browser. Nothing is collected.

## How claims were checked

Every factual claim was checked on October 13, 2026 against Anthropic's own sources only: support.claude.com, code.claude.com/docs, docs.claude.com, claude.com, and anthropic.com. No AI-generated encyclopedias, blogs, or forums were used as evidence. Each lesson, claim, and command links to the page it was checked against.

## Monthly link check

A GitHub Action (`.github/workflows/link-check.yml`) runs `scripts/check_links.py` on the 1st of every month and can be started any time from the **Actions** tab with **Run workflow**. It checks every tool link plus every official source the lessons, sheet check, and command reference cite.

- GitHub repos are checked through the GitHub API, which flags missing, archived, and renamed repos.
- Other links get a web request. A 404, a 410, or a domain that no longer exists counts as broken.
- Sites that block automated checks (403, 429, timeouts) are listed as "couldn't check" but never open an issue on their own.

When something breaks, the workflow opens an issue labeled `link-check` with a checklist, or comments on the open one, and closes it when a later run passes. A moved help-center page can mean the facts on it changed, so re-read the page before swapping the link.

## How it's built

A static site with no build step, served by GitHub Pages. It uses the inquiredu design system (Electric Lake palette): `assets/inquiredu.css` is copied unchanged from the design system, and `assets/style.css` builds every page on its semantic tokens, so the Ivory and Night themes both work. Pages set `data-theme="auto"` to follow the visitor's light or dark setting.

```
index.html, learn.html, glossary.html, commands.html, tools.html, check.html
assets/inquiredu.css    inquiredu design system tokens and base styles (do not edit; regenerate from the design system)
assets/style.css        site layout and components on inquiredu tokens
assets/brand/           inquiredu wordmark and endorsed lockup SVGs
assets/core.js          shared helpers: saved progress, copy buttons, data loading
assets/<page>.js        one script per page
data/lessons.json       paths and lessons
data/glossary.json      terms
data/commands.json      Claude Code commands with verdicts and sources
data/claims.json        cheat-sheet claims with verdicts and sources
data/tools.json         tool guide entries
scripts/check_links.py  monthly link checker
```

All content lives in `data/`. To fix or add something, edit the JSON and commit. Each file's fields match what you see on the page; copy an existing entry as a template.

## Sources and credits

Built from infographics shared on Reddit:

- "Claude Code Resource Bible" (SATNA_PROJECT community)
- "How to Claude: The One Cheat Sheet to Save" (AIDigitalServices community; author not shown)
- "Claude: Chat vs Cowork vs Projects" and "100 Tips to Master Claude" by Ruben Hassid, How to AI
- "Every Claude Code Command" by Charlie Hills
- "Claude Code Cheat Sheet" v2.1.81 (vibecoders_ community)
- "20 Basic But Important AI Terms" by Shushant Lakhyani

The original graphics aren't reproduced; ideas are restated in our own words, and short quotes of the original claims appear only for comparison. Not affiliated with Anthropic.

## License

- **Code** (`*.html`, `assets/`, `scripts/`): [MIT](LICENSE)
- **Written content** (lessons, glossary, summaries, notes, and stamps in `data/`): [CC BY 4.0](LICENSE-CONTENT.md)

Made by [inquiredu](https://inquiredu.org).
