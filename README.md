# PRFM Training — Landing Page

Pre-launch waitlist landing page for PRFM Training, a remote strength & conditioning coaching brand built around Coach Ben Thompson.

## Status

Pre-launch. Copy, CTA text, and the waitlist mechanic are placeholder pending final sign-off. Email forms are markup-ready but not wired to a backend yet — that's being handled separately.

## Stack

Plain HTML, CSS, and JS. No build step, no dependencies, no framework. Deploys as a static site.

## Structure

```
index.html          Full site markup — one page, sections numbered and commented
style/main.css       All styling
style/main.js        Scroll reveal, count-up stats, launch-day CTA swap
images/              Photos, logos, favicons
HANDOFF.md           Full editing guide — read this before making changes
```

## Deploying

Static site, no build settings required.

1. Push this repo to GitHub (including `images/`)
2. Connect it in Vercel
3. Vercel serves `index.html` from the root automatically

Full deployment and editing notes are in `HANDOFF.md`.

## Before this goes live

See **Things Not Yet Built** in `HANDOFF.md` — the email form backend and the launch-day CTA switch (`LAUNCH_MODE` in `main.js`) both need action before this is public-facing.

---

Built with [Claude](https://claude.ai) (Anthropic).
