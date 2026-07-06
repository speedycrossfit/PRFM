# PRFM Training — Site Handoff
**Version:** Launch-Ready Pre-Release  
**Built by:** Johnny Graham with Claude (Anthropic) across multiple sessions  
**Handed to:** Ben Thompson / PRFM Training

---

## Folder Structure

```
prfm-handoff/
├── index.html          ← The entire site. One file. Start here.
├── The PRFM Method - Athlete Mindset.pdf   ← Lead magnet PDF. Sent via Formspree Autoresponse link.
├── style/
│   ├── main.css        ← All styling. Edit here to change colours, fonts, layout.
│   └── main.js         ← Scroll animations, count-up stats, launch-day button swap.
├── images/
│   ├── logo-white.png              ← Nav + footer (on black backgrounds)
│   ├── logo-black.png              ← Orange strip + guarantee band (on orange)
│   ├── favicon-tile-black.png      ← Browser tab icon
│   ├── hero-athlete.jpg            ← Hero section background photo
│   ├── ben-lunge-event.jpg         ← Coach section photo (Ben competing)
│   ├── testimonial-josh.jpg        ← Josh P. headshot
│   ├── testimonial-sara.jpg        ← Sara headshot
│   ├── testimonial-liam.jpg        ← Liam F. headshot
│   └── [other Ben photos]          ← Unused for now, keep for future pages
└── HANDOFF.md          ← This file
```

> **All three files (index.html, style/main.css, style/main.js) plus the images/ folder must be in the same place for the site to work. Never move one without the others.**

---

## Deploying to Vercel

1. Push this entire folder to a GitHub repository (everything in it, including `images/`)
2. In Vercel, connect the repo. No build settings needed — it's a static site.
3. Vercel will serve `index.html` automatically from the root.
4. Every push to your main branch auto-deploys. That's it.

**Critical:** Vercel's servers are Linux and **filenames are case-sensitive**. `ben-lunge-event.jpg` and `Ben-Lunge-Event.jpg` are different files. The filenames in `index.html` and `main.css` must match the actual files in `images/` exactly.

---

## The One Thing to Do Before Launch: Wire the Forms

There are **three real name + email forms** on the page — hero, orange strip, and final CTA — all POSTing to the same live Formspree endpoint: `action="https://formspree.io/f/xdarbjra"`. Formspree emails Ben every signup and has a dashboard to export them.

**If you change the Formspree endpoint:** search `index.html` for `formspree.io/f/xdarbjra` — it appears in all 3 `<form>` tags. Replace every instance.

**Sending the PDF automatically (Autoresponse):**
The site promises a free "PRFM Method" PDF on signup. To have Formspree email that back to the person who just signed up, you need the **Autoresponse plugin**, which sits behind a paid Formspree plan (not the free tier — check current plan names/pricing at [formspree.io/plans](https://formspree.io/plans), as these change).

Formspree's autoresponse sends a text/HTML message you write — it does not attach a real file. So the working setup is:
1. The PDF — **`The PRFM Method - Athlete Mindset.pdf`** — lives at the root of the repo, alongside `index.html`. Once deployed, it's served at:
   `https://yourdomain.com/The%20PRFM%20Method%20-%20Athlete%20Mindset.pdf`
   (swap `yourdomain.com` for the real domain once live; the `%20`s are just spaces in the filename, which is normal).
2. In the Formspree dashboard, upgrade to a plan that includes Autoresponse, open your form → **Plugins → Autoresponse**, and turn it on.
3. Set the "from" name, subject (e.g. "Your PRFM Method guide"), and message body. Paste the PDF's public URL into the message as a download link/button. Note: per Formspree's own docs, submission field data (like the person's name) can't be dropped into the autoresponse body unless the form is on a custom domain within a Formspree project — keep the message generic ("Hey — here's your guide...") rather than "Hey {{name}}" unless that's set up.
4. Formspree requires a field literally named `email` to know where to send the autoresponse — all three forms already have that.
5. Test by submitting each of the three forms with a real email address and confirming the autoresponse arrives with a working PDF link.

---

## Launch Day: Flipping All Buttons


Every "JOIN WAITLIST" button on the page will become "START NOW" or "APPLY NOW" in one edit.

Open `style/main.js`. At the very top, find:

```javascript
const LAUNCH_MODE = false;
```

Change `false` to `true`. Save. Push to GitHub. Done.

Every button on the page — nav, hero, orange strip, all 7 programme cards, final CTA — updates automatically. Each button already has its launch-day label stored in a `data-launch-text` attribute in the HTML.

To go back to waitlist mode, set it to `false` again.

---

## Things Not Yet Built (Open Items)

- **PDF delivery** — forms are wired to Formspree and collect name + email, but the actual PDF file still needs to be added to the project and the Formspree Autoresponse plugin (paid plan) still needs to be turned on. See "Wire the Forms" above.
- **Live spots counter** — the "100 spots" number is currently static, updated manually. A live counter requires tracking real submissions (e.g. via the Formspree dashboard) to know the real count.
- **Thank-you page / redirect** — after someone submits the waitlist form, they currently see the browser's default behaviour. Add a `_next` hidden input pointing to a thank-you URL once you have one.

---

## Common Edits

### Change a price
Open `index.html`. Find the programme by name (Base, Build, Strong, Capacity, Prime, Pro, Custom). Edit the `<div class="card-price">` block. Example:
```html
<div class="card-price">$149<span class="price-week">/mo · $35/wk</span></div>
```

### Change programme descriptions
Same location — the `<div class="card-detail">` inside each programme card.

### Update the "100 spots" number as your waitlist fills
Search `index.html` for `spots-count`. Every instance of the number is wrapped in `<span class="spots-count">100</span>` — update the number in each place, or remove the scarcity language entirely once the waitlist is closed.

### Add a testimonial
In `index.html`, find section 09 (search `FIELD REPORTS`). Copy one `<div class="quote">` block, paste it after the last one, update the photo src, name, journey line, and quote text. Add the client's photo to `images/` first.

### Change the hero photo
In `style/main.css`, find `.hero-visual` and update the `url('../images/...')` part of `background-image`. Keep the `linear-gradient(...)` in front of it — that's the orange overlay treatment.

### Change the coach photo
In `style/main.css`, find `.ben-photo` and update its `url('../images/...')` the same way.

### Change brand colours
Open `style/main.css`. At the very top, find `:root { ... }`. All colours are defined here:
```css
:root {
  --black:  #111111;
  --cream:  #F9F6F2;
  --white:  #FFFFFF;
  --orange: #FF8210;
}
```
Change a value here and it updates everywhere on the site instantly.

---

## Design System: Rules to Follow When Editing

These were deliberate decisions — breaking them will make the site look inconsistent.

**Colours:** Only ever use the four CSS variables above. Never hardcode a hex value anywhere.

**Fonts:** Three fonts, each with a specific job:
- `Inter` — all body text and headings
- `IBM Plex Mono` — labels, tags, prices, button text, anything monospaced
- `Fraunces italic` — pull quotes and testimonial blockquotes only

**Buttons:** All buttons have `border-radius: 6px`. If you add a new button, use one of the two existing classes:
- `.bracket-btn` — solid orange, black text. Primary CTAs.
- `.ghost-btn` — transparent, thin border. Secondary CTAs on light backgrounds.

**Sections alternate backgrounds** in this order: black → orange → cream → black → cream → orange → cream → black → cream → black → footer. Breaking that rhythm makes the page feel unbalanced.

**Orange accent:** Used for: brand colour, active state, price highlights, eyebrow labels, the orange gradient on photos. Not used for: body text, backgrounds (except the strip sections). Don't add more orange — the current balance is deliberate.

---

## How the "Join Waitlist" Buttons Work (Not All the Same)

Two different things happen depending on which button someone clicks, by design:

1. **Hero, orange strip, and final CTA** — each is a real name + email `<form>` that submits straight to Formspree. Hero's submit button reads "Join the Waitlist"; the other two read "Send me the guide." These are the only three places someone can actually enter their details.
2. **Nav bar and all 7 programme card buttons** — plain anchor links, no form. Nav links to `#contact` (scrolls down to the final CTA form). The 7 programme card buttons link to `#top` (scrolls up to the hero + orange strip forms). Neither collects anything itself — they just get the person to one of the three real forms above.

If you add a new "Join Waitlist" button somewhere on the page, decide which of these two patterns it should follow rather than inventing a third: either a full `<form>` like the three above (only do this if you actually want a fourth entry point posting to Formspree), or a simple `<a href="#top" class="...waitlist-cta" data-launch-text="...">Join Waitlist</a>` / `href="#contact"` link, matching the programme cards and nav bar.

---

## How the Scroll Animations Work

Every element with `class="reveal"` starts invisible and fades up when it enters the viewport. This is handled by `main.js` using an `IntersectionObserver` — no library needed.

To make something animate in on scroll, add `class="reveal"` to it.  
To stagger a group of items, wrap them in `class="reveal-group"` and add `style="--i:0"`, `--i:1"`, `--i:2"` etc. to each child.

The three stat numbers (17 years / 3 countries / 1000+ clients) count up from 0 when they scroll into view. To change a stat's final value, change `data-target="N"`. The `data-suffix="+"` attribute appends a symbol after the number finishes counting.

---

## Sections Reference

| # | Section | Background | Notes |
|---|---------|-----------|-------|
| 01 | Nav bar | Black | Sticky. Logo + links + CTA. |
| 02 | Hero | Black | Headline, sub-copy, hero photo. Real name+email `<form>`, submit button reads "Join the Waitlist." Wired to Formspree. |
| 03 | Waitlist strip | Orange | Real name+email `<form>`. Wired to Formspree. |
| 04 | Philosophy | Cream | Three pillars: Goal First, Built by Hand, Evolves with You. |
| 05 | How it works | Black | Five-step process. |
| 06 | Programme table | Cream | Two-row card grid. 7 programmes. Pro is the funnel target. |
| 07 | Guarantee | Orange | "It's coached" trust statement. |
| 08 | Coach Ben | Cream | Bio, stats, Ben's competition photo. |
| 09 | Testimonials | Black | Three real clients with photos. |
| 10 | Pull quote | Cream | Ben's founder quote. |
| 11 | Final CTA | Black | Real name+email `<form>`. Same Formspree endpoint as sections 02/03. |
| — | Footer | Black | Logo + copyright. |


---

## For the LLM Helping with Future Edits

This site uses a deliberate, well-documented structure. Before making any change:

1. **Read the CSS comment above the rule you're changing.** Every section of `main.css` has a comment block explaining what it controls and what to watch out for.
2. **Read the HTML comment above the section you're changing.** Same — every section in `index.html` is documented.
3. **Never add inline styles except for `--i:N` stagger variables.** All styling belongs in `main.css`.
4. **Never add a `<style>` block inside `index.html`.** The CSS is fully external.
5. **Image paths in CSS use `../images/`** (one level up from `style/`). Image paths in HTML use `images/` (relative to root).
6. **The launch-day button swap is in `main.js` — `const LAUNCH_MODE = false`.** Changing this to `true` flips every CTA on the page. Don't modify individual button text manually.
7. **The programme table is NOT one grid — it's three independent tiers stacked in a flex column (`.prog-tiers`), each with its own sub-grid:** `.tier-entry-grid` (Base/Build, 2 equal columns), `.tier-goals-grid` (Strong/Capacity/Prime, 3 equal columns), and `.tier-access-grid` (Pro/Custom, 3fr + 2fr columns). Adding a card means adding it to the right tier's grid and adjusting that grid's own `grid-template-columns` — not tracking a single 5-column total across the whole table.
8. **All three real forms (hero, orange strip, final CTA) POST to the same Formspree endpoint.** If you update one `action`, update the other two.

---

*Best of luck Ben. Good luck with the launch.*
