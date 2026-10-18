# PRFM Fitness — Landing Page

Pre-launch waitlist landing page for PRFM Fitness, a performance-focused training brand for everyday athletes.

## Status

Pre-launch. The primary conversion goal is the waitlist form.

The Performance Mindset guide is available now and is sent manually to waitlist signups. The PDF is not stored in this project; there is no automated guide delivery. The title was updated in Version 4; the guide's content and cover remain the owner's responsibility.

All seven programme categories remain visible without pricing during pre-launch. Launch pricing is preserved in `HANDOFF.md`.

The Version 2 refinements add a six-photo hero carousel, a Recommended Pro badge and gentle hover pulse, a smaller founder photo with concise copy, and one-second PRFM word rotation. The carousel retains the original shoulder-press image first, followed by five user-supplied photographs. Programme cards remain text-only. The standalone philosophy section beneath the hero has been removed; the five-step training journey remains.

Version 4 preserves that design and photo order, adds an inline HUMANS / ATHLETES / PEOPLE hero tagline fading every 2.5 seconds, changes hero photo rotation to 3.5 seconds, and enlarges PRFM program branding with two-second rotation. Approved introductory copy and American-English training spelling are updated. The founder section pairs the existing training photo with the supplied handstand-coaching photo. Testimonials retain their copy with half-size images and a manual, scroll-snapping mobile carousel.

Version 5 centers the five-step journey and adds a single sequential line animation lasting approximately five seconds. PRFM branding now uses two centered lines, and the gap before Entry / Foundation is tighter. Visible sentence dashes are replaced with commas, the founder heading reads "Built by real coaches, not AI", and full-width 3:2 testimonial photographs replace thumbnails. Josh's card uses the supplied landscape competition photo. Existing animation timings, testimonial quotes, mobile swipe behavior and form integration are preserved.

## Stack

PRFM Strong has a dedicated information page at `/programs/strong/`, linked from the existing Strong card. Version 3 refines the strength, muscle-building and functional-training positioning, adds four detailed benefits and Lucide feature icons, and improves session-card hierarchy. The real app recording displays in a 310px-wide phone on desktop, retaining its 280px size on tablet and mobile. The approved hero, homepage, exercise lists and single closing pricing/waitlist section are unchanged. Pricing is announced at launch. All waitlist buttons return to the existing homepage form.

Strong Version 4 changes only the two descriptive paragraphs and removes the playback button. The emphasised closing statement, approved page sections and phone geometry are preserved. The caption keeps its existing row height so the control removal does not shift the phone or feature cards.

PRFM Capacity is available at `/programs/capacity/`. It reuses the approved Strong layout, three universal feature cards, real app recording and mobile session carousel, with conditioning-specific copy and three grouped session previews. A compact five-zone intensity scale is horizontal on desktop and stacked on mobile. The hero now uses the existing user-supplied group photograph of Ben and three fellow coaches on the athletics field, also used by the unchanged homepage carousel. Capacity-only cropping and a lighter mobile overlay keep the group visible without changing the layout. Only the Capacity card's navigation link and label change on the homepage; Strong and all shared styling and scripts are unchanged. Public copy follows the site's existing American-English "program" spelling and plain-hyphen convention.

Plain HTML, CSS, and JavaScript. No framework, no build step, no dependencies.

PRFM Prime is available at `/programs/prime/`, using the approved Strong/Capacity template with its supplied flagship strength-and-conditioning copy, four benefits, 4-5 weekly sessions and three grouped training previews. It reuses the original shoulder-press hero photograph and now displays the dedicated Prime recording supplied on 17 October 2026, with its own matching static poster. The full recording uses the same balanced-quality 640 x 1138 H.264 encoding at 30 fps and target 1.4 Mbps as Strong and Capacity. Silent looping, viewport pause/resume, reduced-motion handling and autoplay fallback remain unchanged. No new photo or recording is invented. Strong, Capacity, shared styles/scripts and their media are unchanged; the only homepage edit is Prime's existing navigation link and label.

PRFM Base is available at `/programs/base/`. It uses the supplied PRFM-branded dumbbell-lunge coaching image, the approved top-aligned overview and shared phone, benefit, duration-panel and session-carousel components. Base is a four-week beginner programme: three full-body sessions per week, approximately 30-40 minutes each, with 2-3 recommended additional 20-30 minute walks. It costs NZ$89 one-off; the only action is the existing pre-launch waitlist, not checkout. The Build pathway is informational. The phone now uses its dedicated Base recording, supplied on 18 October 2026, with a matching static poster. The full-length 77.63-second web copy uses the same 640 x 1138 H.264, 30 fps and target 1.4 Mbps encoding as the other programmes, without audio. Strong, Capacity, Prime and all shared source files remain unchanged; only the existing Base homepage CTA connects to the new page.

PRFM Build Version 1 is available at `/programs/build/`. It follows Base's approved fixed-duration template with the supplied barbell-deadlift hero, top-aligned overview, four gym sessions weekly, approximately 40-50 minute sessions and three clearly labelled sample sessions. It reuses the existing practical-information row, four-benefit layout, three feature cards, phone, four-week delivery panel, desktop session grid and mobile carousel. Its compact pathway links to Strong, Capacity and Prime. The existing approved Build price in `HANDOFF.md` is $89 one-time for four weeks, displayed consistently with Base as `NZ$89 one-off`; there is no checkout. The phone now uses the dedicated Build recording supplied on 18 October 2026, with a matching source still. The full-length 82.03-second web copy uses the same 640 x 1138 H.264, 30 fps and target 1.4 Mbps settings as the other programmes, without audio. All other programme pages, shared code and existing media remain unchanged. Only the existing Build homepage CTA is connected to the new route.

## Structure

```
index.html        Full one-page site markup
programs/base/    PRFM Base information page and phone-width preview
programs/build/   PRFM Build information page and phone-width preview
programs/strong/  PRFM Strong information page and phone-width preview
programs/capacity/ PRFM Capacity information page and phone-width preview
programs/prime/   PRFM Prime information page and phone-width preview
style/main.css    Brand system, layout, responsive styling
style/program.css Shared dedicated-program layout
style/program-ongoing.css Approved full-width ongoing-programming panel
style/program-session-parts.css Opt-in A/B/C session group typography for Prime
style/capacity.css Capacity-only intensity scale and session group labels
style/base.css    Base-only hero, top-aligned overview, practical details and Build pathway
style/build.css   Build-only hero positioning and compact progression links
style/program.js  Viewport-aware muted autoplay and static fallback handling
style/main.js     Reveals, counters, reusable brand rotation and article navigation
images/           PRFM assets and optimised hero carousel photographs
media/            Optimized, locally hosted app screen recording
IMAGE-CREDITS.md  Hero photography sources and licence notes
tests/            Focused animation and counter tests
HANDOFF.md        Editing and launch notes
```

## Forms

The waitlist form posts to the existing Formspree endpoint:

`https://formspree.io/f/xdarbjra`

It collects first name and email only.

PRFM Custom applications will link to a separate Typeform. The application button is awaiting its Typeform URL.

## Preview

Open `index.html` directly in a browser, or serve the folder with any static file server.

Open `mobile-preview.html` for a phone-width view on a desktop browser. It loads the current site inside a 390px-wide frame and is not a separate version of the website.

Open `programs/strong/index.html` for Strong, or `programs/strong/mobile-preview.html` for its phone-width preview. Static hosts serve the Strong directory at `/programs/strong/`; no route configuration is required. Relative assets also allow opening the page directly from the downloaded folder.

Open `programs/capacity/index.html` for Capacity, or `programs/capacity/mobile-preview.html` for its phone-width preview on a Mac. The same responsive page serves desktop and mobile; the ZIP includes both preview utilities and both program pages. Capacity now uses its own 55-second recording supplied on 16 October 2026, at `media/prfm-capacity-app-demo.mp4`, with a matching static poster. Its Version 2 headlines are "Build your engine. Expand your capacity." and "More than endurance. Conditioning with purpose." Strong's media and the shared phone layout and playback behavior are unchanged.

## Verification

Open `programs/prime/index.html` for Prime, or `programs/prime/mobile-preview.html` for its 390px phone-width view on a Mac. The ZIP includes all three program pages and mobile-preview utilities. Static hosts serve Prime at `/programs/prime/` without route configuration.

Open `programs/base/index.html` for Base, or `programs/base/mobile-preview.html` for its 390px phone-width Mac preview. The complete ZIP now includes all four programme pages and previews. Base's hero uses the original supplied PNG plus an 800px JPEG alternative; the source attachment is untouched. `tests/base-page.test.cjs` checks the exact copy, exercises, one-off price, source image, fixed duration, dedicated demo, local links and checksums for all approved pages, shared code and recordings.

Open `programs/build/index.html` for Build, or `programs/build/mobile-preview.html` for its 390px phone-width Mac preview. The complete ZIP now includes all five programme pages and previews. Build loads the unchanged Base stylesheet to reuse its overview alignment, practical-information row and pathway treatment, without applying Base-specific hero rules. `tests/build-page.test.cjs` checks exact copy, all sample exercises, four-session frequency, fixed duration, verified pricing, shared components, routes and preservation of approved files.

Run `node --test tests/motion.test.cjs` to check journey sequencing, play-once behavior, carousel timing, looping, reduced motion, visibility handling, failed images and credibility counters. Node is needed only for these development tests, not to run the website.

Run `node --test tests/*.test.cjs` to include program content, shared navigation, waitlist destinations and local asset checks.

Both app demos use balanced-quality H.264 web copies at 640 x 1138 and 30 fps, encoded directly from the untouched originals with a target video bitrate of 1.4 Mbps. Capacity is about 8.8 MB instead of 130 MB; Strong is about 9.7 MB instead of 80 MB. Full recordings are retained (55.47 seconds for Capacity and 59.43 seconds for Strong), without audio tracks. The sharper copies replace the initial 320px-wide web versions. Video URLs use `?v=2.2` for Capacity and `?v=3.3` for Strong; approved posters are unchanged. Video playback starts automatically in view, stays permanently muted and inline, loops, and pauses off-screen or when the tab is hidden. Playback resumes on return. There are no visible playback controls. Reduced motion, blocked autoplay or disabled JavaScript show the static preview instead; the page does not force playback or add replacement controls.
