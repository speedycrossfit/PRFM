# PRFM Fitness — Site Handoff

## Current Version

This is a static pre-launch waitlist site for PRFM Fitness.

The page has been reworked around the new brand direction:

- PRFM Fitness as the master brand
- "Train With Purpose." as the hero message
- off-white, near-black, graphite and Performance Blue
- Manrope headings and Inter body/UI text
- a clear customer journey through Base / Build, Strong / Capacity / Prime, Pro and Custom
- one low-friction waitlist form
- Connect / Define / Plan / Train / Progress as a centered, sequential five-step journey
- reusable PRFM word rotation, with two-second timing and reduced-motion support
- inline HUMANS / ATHLETES / PEOPLE hero tagline with a 2.5-second fade cycle and stable word width
- human coaching positioning and animated 17+ / 3 / 1,000+ credibility statistics
- programme pricing removed during pre-launch
- automatic hero carousel retaining the original shoulder-press photograph first, with five additional user-supplied photos
- text-only programme cards, FIND YOUR PROGRAM heading and Recommended PRFM Pro with a gentle hover pulse
- paired training and handstand-coaching founder photographs and two concise credibility paragraphs, with the existing counter animation unchanged
- full-width landscape testimonial photographs and a manual scroll-snapping carousel on mobile only
- standalone PRFM philosophy section and its Method navigation link removed; five-step journey retained

## Folder Structure

```
index.html        Full one-page site markup
style/main.css    Brand system, layout and responsive styling
style/main.js     Launch text, reveals, stats, brand rotation and article navigation
images/           Logos, photos, testimonial images and favicons
README.md         Project overview
HANDOFF.md        This file
IMAGE-CREDITS.md  Hero photograph sources and licensing
tests/            Animation and credibility counter tests
```

The old PDF attachment was removed before Version 4. The Performance Mindset guide is available now and is sent manually to waitlist signups. The website collects details through Formspree; it does not deliver the guide automatically. Version 4 updates visible e-book titles only; no PDF or cover was created, edited or restored. Update the separately managed guide content and cover before launch.

## Forms

There is one live waitlist form in `index.html`, inside the `#waitlist` section.

It posts to:

`https://formspree.io/f/xdarbjra`

Fields:

- `first_name`
- `email`
- `_subject`
- `_gotcha` honeypot spam field

If the Formspree endpoint changes, search for `formspree.io/f/xdarbjra` in `index.html` and replace it.

## Launch-Day CTA Switch

Open `style/main.js` and change:

```js
const LAUNCH_MODE = false;
```

to:

```js
const LAUNCH_MODE = true;
```

Any element with `class="waitlist-cta"` and a `data-launch-text` value will swap from waitlist language to launch language.

This only changes CTA text. It does not create checkout links or a PRFM Custom application form.

It also does not restore prices or remove pre-launch guide messaging. Update those separately before launching.

## Brand Animation

The brand element sits above the programme-section heading. `PRFM` stays fixed on the first line; the program word slides and fades directly beneath it. Both lines are centered. A fixed-width 9ch word slot prevents horizontal or vertical layout changes as the word rotates. The heading-to-foundation gap is 32px on desktop and 28px on mobile.

To reuse it, copy the `.brand-rotator` markup. Its `data-brand-words` attribute defines BASE / BUILD / STRONG / CAPACITY / PRIME / PRO / CUSTOM. PRFM remains fixed. Each cycle takes two seconds, with a 280ms transition and 1720ms dwell. Text is approximately 17% larger than the previous version. There are no visible playback controls. Rotation stops off-screen or in hidden browser tabs. Reduced-motion preferences show static `PRFM BASE`.

## Five-Step Journey

Desktop columns, numbers, headings and descriptions are centered, with connectors running precisely between indicator centers. The existing stacked arrangement is retained at 1060px and below; its connector runs vertically between the numbers.

`initializeProcessJourney` owns the only journey animation. Generic reveal classes have been removed from the steps to prevent competing simultaneous reveals. When the list enters the viewport, the first indicator activates after 500ms. Subsequent indicators activate at one-second intervals, with each preceding connector extending over 700ms and finishing as its destination activates. The final step activates at 4.5 seconds, settling by approximately 4.8 seconds. The sequence plays once per page load and stays completed. Reduced-motion preferences complete it immediately, including live preference changes. The default HTML/CSS also shows a readable completed journey without JavaScript or IntersectionObserver.

## Hero Tagline

The inline `.tagline-rotator` uses HUMANS / ATHLETES / PEOPLE in that order. Each cycle takes 2.5 seconds, with a 300ms fade and 2200ms dwell. A hidden measuring word reserves the longest word's width so the sentence does not shift. The period stays attached to the visible word within that reserved space. It shares the existing rotator lifecycle, pausing off-screen and in hidden tabs. Reduced-motion visitors see static HUMANS. Screen readers receive a stable sentence without repeated announcements.

## Hero Carousel

The hero's `data-hero-slides` attribute lists six local photos, beginning with the original shoulder-press photograph, `hero-athlete.jpg`. Each slide defines its full-size and 800px image URLs, full-size width and crop position. The five additional photographs were supplied by the user on 8 October 2026 and replace the previous stock carousel selection.

Two fixed image layers crossfade over 900ms, with a new photograph every 3.5 seconds. Only the next photo is prepared. Images that fail to load are skipped; the current photo remains visible. The carousel pauses off-screen, in hidden tabs, while a hero link has keyboard focus, and for reduced-motion preferences. With JavaScript disabled, the original hero photo remains visible. No arrows, dots or playback controls are shown.

Keep the additional hero training photography inside the hero. The existing founder training and testimonial photographs are retained; the supplied handstand-coaching image is added only to the founder section. Source records and publication-rights notes are in `IMAGE-CREDITS.md`.

## Founder and Testimonials

The founder photo pair retains `ben-lunge-event.jpg` and adds locally optimized JPEG versions of the user-supplied `IMG_8143 2.jpg`, showing handstand coaching. Both images stay modest: stacked in the existing 220px desktop column and side-by-side at up to 140px each on mobile. Version 5 changes only its heading to "Built by real coaches, not AI"; the founder paragraphs, photographs and 17+ / 3 / 1,000+ counter targets and implementation are preserved.

Desktop testimonials retain their existing grid, quotes and attribution, with full-width 3:2 landscape image areas above the text. Josh's card uses the exact supplied landscape competition photo, locally named `testimonial-josh-landscape.jpg`; his original portrait file is retained. Sara and Liam retain their existing portrait sources, with face-aware crops rather than stretched images. Wider originals would be needed to include their entire portrait compositions in landscape frames. At 760px and below, `.quote-grid` remains a native horizontally scrolling, scroll-snapping track with 83%-wide cards and part of the next card visible. There is no automatic rotation or navigation UI. The focusable region also supports keyboard scrolling. Additional `.quote-card` articles use the same layout automatically.

## PRFM Custom

PRFM Custom is present as a premium application-only section.

PRFM Custom applications will use an external Typeform link, separate from the Formspree waitlist.

The current "Apply for coaching" button is visibly disabled, with "Applications open soon" beneath it. When the Typeform URL is ready, replace the button with a link in `index.html`.

## Design System

Primary colours are defined in `style/main.css`:

```css
--off-white: #f8f8f6;
--near-black: #0d0d0d;
--graphite: #303338;
--blue: #2457e6;
```

Performance Blue should stay selective: CTAs, section labels, important numbers and small interactive details.

Typography:

- Manrope: headings and major pricing
- Inter: body text, labels, navigation and form UI

Buttons use 6px border radius.

## Common Edits

### Restore launch pricing

Pricing is intentionally absent from `index.html`. Keep these approved prices for launch:

| Programme | Price |
| --- | --- |
| Base | $89 one-time / 4 weeks |
| Build | $89 one-time / 4 weeks |
| Strong | $35/week or $149/month |
| Capacity | $35/week or $149/month |
| Prime | $35/week or $149/month |
| Pro | $55/week or $219/month |
| Custom | $129/week or $529/month |

Pro currently highlights its access to Strong, Capacity and Prime rather than a price comparison. Strong links to its dedicated information page; other program CTAs and all waitlist buttons lead to the existing waitlist during pre-launch. The historical pricing table above is not approved launch pricing for the Strong information page.

### Change the waitlist copy

Open `index.html`, find the `#waitlist` section, and edit the heading, paragraph or form labels.

### Swap hero photo

Edit the `data-hero-slides` JSON array in `index.html`. If replacing the first photo, also update the first `.hero-slide` image, its `srcset` and the social preview image URLs. Keep the original photograph unless Ben requests its replacement.

### Swap coach photo

Open `style/main.css`, find `.coach-photo`, and update the image URL.

The existing founder photo displays at 220 x 280px on desktop and 140 x 180px on phones. The final two former credibility paragraphs have been removed. Counter markup and count-up behaviour are unchanged.

### Verify refinements

Run `node --test tests/motion.test.cjs`. The tests cover hero timing and looping, one-second word order, reduced motion, visibility changes, image errors, interaction pauses and counter formatting. Check desktop and phone layouts before distributing the site.

Increment the CSS and JavaScript query versions in `index.html` after further updates so returning visitors receive the current files.

### Add the Custom Typeform URL

Open `index.html`, find:

```html
<button class="button secondary" type="button" disabled>Apply for coaching</button>
```

Replace it with an anchor using the same classes and the supplied Typeform URL as its `href`. Remove the "Applications open soon" paragraph at that time. No embedded application form or Formspree application endpoint is needed.

## Deployment

### Ongoing Programming Feature

Strong, Capacity and Prime share the approved "Ongoing programming / Join anytime. Keep progressing." feature as a full-width panel beneath both Section 3 columns, not inside the phone column. Each has its supplied program-specific single paragraph; the component structure and styling are identical. The opt-in `.program-difference-layout-top` modifier aligns the first feature card with the phone frame without changing their sizes or styling. The `.program-ongoing` panel uses a restrained white band with a blue left border, 26.4px headline and 16px body copy. Its internal two-column layout stacks at 900px and below with a 24px headline. It retains 40px separation above on desktop and 32px on smaller screens, plus the existing section padding below. All three pages load the same unchanged `style/program-ongoing.css?v=3`, which supports future program-specific labels and copy. No phone-column wrapper, icon, animation, controls or new functionality is introduced. Prime reuses the component without modifying Strong or Capacity.

### Balanced Video Quality Update

Both program pages now use 640 x 1138 H.264 recordings at 30 fps, encoded directly from their original source attachments at a target 1.4 Mbps. Capacity is about 8.8 MB, 55.47 seconds, and uses `media/prfm-capacity-app-demo.mp4?v=2.2`. Strong is about 9.7 MB, 59.43 seconds, and uses `media/prfm-strong-app-demo.mp4?v=3.3`. This replaces the softer initial 320px-wide web copies, balancing sharper app text against download size. Both recordings retain their full content and have no audio tracks. Posters, phone geometry, layout, copy, shared styles/scripts and homepage are unchanged. The historical version notes below describe the earlier encodes.

### PRFM Strong Page, Version 4

- `programs/strong/index.html` contains the first dedicated program page. The homepage changes only the Strong card's link and label to "Explore PRFM Strong".
- `style/program.css` is loaded only on this page. It provides reusable hero, editorial, specification, benefit, feature, phone demonstration, session and offer layouts. The approved hero markup and styles and the shared homepage files remain unchanged.
- Header and footer reuse the homepage markup with relative homepage destinations. All three waitlist links target `../../index.html#waitlist`; Formspree remains unchanged and no second form or checkout is introduced.
- The overview confirms strength and building muscle, intermediate to advanced experience, 3-4 sessions weekly and a fully equipped gym. The four-item specification grid becomes two columns on smaller screens.
- Version 3 uses the supplied functional-strength and hypertrophy copy under "Built for strength. Designed to perform." Four numbered benefits have compact headings and supporting descriptions. The summary heading is slightly smaller to accommodate the longer text, and the introduction stacks at 900px and below.
- Version 4 replaces only the two main descriptive paragraphs with the final supplied copy. The bold closing statement, section heading, four benefits and specification grid remain byte-for-byte unchanged.
- The three feature cards use official Lucide play, sliders-horizontal and message-circle icons, with the headings "Know exactly what you're doing.", "Train at your level." and "Real coaches. Real support." These cards and the recording remain unchanged in Version 4. The phone is 310px wide above 900px and retains its 280px width on tablet and mobile.
- The three session articles are independent Field Reports-style cards. Desktop and tablet show equal columns; phones show an 83%-width scroll-snapping track. All exercises and titles come from the supplied `Training Preview.pdf`. Lists contain no sets, reps, rest periods or app screenshots. There is no automatic rotation.
- The training heading is "A look inside your training." with the two supplied introductory paragraphs. Session headings reserve 132px and use smaller numbered labels with a little more breathing room above each exercise list. The exercises, carousel implementation, card borders and final offer content remain unchanged.
- Pricing remains "Pricing announced at launch." A single closing section combines the offer, supporting copy, one waitlist CTA and an All programs link. Update `.program-offer` only after pricing and signup are approved. Do not reuse historical launch-price notes as confirmed pricing.
- The supplied barbell hero remains unchanged. `media/prfm-strong-app-demo.mp4` is a full-length, 59.43-second H.264 web copy of Ben's replacement `2764A9DD-357B-4F25-BFD3-B78DAEF91594.MP4` recording, optimized from 80 MB to about 4.8 MB at 320 x 568 and 30 fps. The source attachment is untouched and not included in the website archive. `images/prfm-app-demo-poster.jpg` is a higher-resolution still extracted from the replacement recording. Video and poster URLs use `?v=3.2` to prevent stale cached media.
- `style/program.js` enhances only `[data-app-demo]`. Muted, inline, looping video uses `preload="none"` and starts automatically on viewport entry. It pauses off-screen or in hidden tabs and resumes on return. Reduced motion and blocked autoplay retain a static poster; media failure adds an accessible status. With JavaScript disabled, the static preview remains. The external button, native controls, manual playback state and button-only accessibility references have been removed. The volume-change handler keeps the recording muted.
- The phone frame uses CSS and contains the real recording with `object-fit: contain`; no app UI is recreated. Its dimensions and styling are unchanged. The caption row retains a 44px minimum height after removing the button, preserving the approved phone and feature alignment. Feature icons use Lucide; retain `LUCIDE-LICENSE.txt` when distributing the site.
- The video has opaque black letterboxing, and the separate poster is hidden after playback starts unless a static fallback is active. This prevents a fractional-pixel poster edge from showing as a white hairline beneath exercise videos. Keep this treatment when replacing media with slightly different dimensions.
- Page content remains semantic HTML and CSS, independent of JavaScript. Only automatic video playback and fallback handling use JavaScript. The other six program pages have not been created.
- `programs/strong/mobile-preview.html` provides a phone-width view on a Mac. It is a preview utility, not part of the customer-facing navigation.
- Validate with `node --test tests/*.test.cjs`, then check desktop columns, phone swipes and homepage waitlist navigation in a browser. Do not submit a real test signup.

### PRFM Capacity Page, Version 1

Current update: Capacity Version 2 keeps the approved layout and replaces its hero headline with "Build your engine. Expand your capacity." and its overview heading with "More than endurance. Conditioning with purpose." The phone now displays the dedicated `7DB363AC-6FD1-4AE4-941A-837300CDD2D0.MP4` recording, supplied on 16 October 2026, through `media/prfm-capacity-app-demo.mp4?v=2.1` and a matching `images/prfm-capacity-app-demo-poster.jpg?v=2.1`. It is a full-length 55.47-second H.264 web copy, about 4.9 MB. No shared styles, playback script, Strong file or homepage file changed. The Version 1 notes below describe the initial build; its shared recording has since been replaced only for Capacity.

- `programs/capacity/index.html` follows the Strong Version 4 master template. Strong HTML, its mobile preview, shared program CSS/JavaScript and homepage CSS/JavaScript remain unchanged. The only homepage edit is the existing Capacity card's link and label, now "Explore PRFM Capacity" leading to `programs/capacity/`. The other five program pages have not been created.
- Capacity uses the existing user-supplied tyre-training hero photo. It has its own supplied conditioning description, four specifications and four benefits. Public text uses the established "program" spelling and plain hyphens instead of long dashes.
- `style/capacity.css` loads only on Capacity. It adds the five-zone intensity scale and session-part labels without overriding the approved phone, shared carousel or Strong styles. Zones use a restrained graphite-to-blue progression, with five horizontal segments on desktop and compact stacked rows on mobile. No heart-rate prescriptions or extra training details are invented.
- The three feature cards and full phone demonstration section are copied exactly from Strong. The same recording, poster, muted autoplay, viewport pause/resume, loop, reduced-motion handling and autoplay fallback are reused unchanged. A Capacity-specific app recording can be supplied later but is not needed for Version 1.
- Training previews retain all supplied exercises and combinations, Part A/Part B groups, Session 01 Zone 4+ and Session 02's 40-minute Zone 3 detail. Session 03 has no invented zone. The shared equal-column desktop layout and 83%-width mobile swipe carousel remain; the supplied group labels and longer lists determine the equal cards' content height.
- One final pricing placeholder and waitlist CTA return to the existing homepage form. No new form, price or checkout exists. Formspree and the pending Custom Typeform link are untouched.
- `programs/capacity/mobile-preview.html` provides the same 390px phone-width preview on a Mac. Both program pages and their mobile previews are included in `PRFM-Fitness-Website.zip`.
- Run `node --test tests/*.test.cjs`. Capacity tests cover exact content, specifications, zone labels, grouped sessions, relative assets, shared section equality and frozen checksums for approved Strong/shared files. The homepage checksum test normalizes only the new Capacity anchor back to its previous value, ensuring no unrelated homepage changes.

### PRFM Prime Page, Version 1

- `programs/prime/index.html` follows the current approved Strong/Capacity template, with Prime-specific hero, overview, four benefits, ongoing-programming paragraph, grouped A/B/C sessions and final waitlist copy. It uses the confirmed overview specifications: Strength & Conditioning, Intermediate - Advanced, 4-5 sessions per week and Fully Equipped Functional Gym. Supplied copy is retained, with plain hyphens for ranges and Part labels. No Capacity intensity zones are included.
- The hero reuses the original shoulder-press photo (`hero-athlete.jpg` and its existing mobile derivative). Header, footer, shared page styling, top-aligned feature cards/phone, full-width ongoing panel, carousel and video lifecycle are reused unchanged. Strong and Capacity HTML, CSS, scripts and media remain byte-identical. Only the existing Prime homepage card's navigation link and label change to "Explore PRFM Prime" at `programs/prime/`.
- The phone now uses Ben's dedicated `AE9BAA6E-16AA-4501-9E8A-608D301F39A3.MP4` recording, supplied on 17 October 2026. `media/prfm-prime-app-demo.mp4?v=1` is the full-length 54.67-second H.264 web copy, at 640 x 1138, 30 fps and target 1.4 Mbps, without audio. `images/prfm-prime-app-demo-poster.jpg?v=1` is the matching source still, used for both the video poster and fallback image. Only Prime's three media references change; its approved V2 copy, phone layout, playback lifecycle and all Strong/Capacity files remain unchanged. The original attachment is untouched and excluded from the ZIP.
- `style/program-session-parts.css` is an opt-in stylesheet loaded only by Prime. It provides the same warm-up and part-label typography used by Capacity without modifying Capacity or overriding shared card/carousel geometry. All supplied exercises and A/B/C groupings are retained; no sets, reps, loading, timing or rest prescriptions are added. Card height follows the supplied content while widths and mobile snapping remain shared.
- `programs/prime/mobile-preview.html` supplies the same 390px phone-width Mac preview. It is not a separate customer-facing version. The complete ZIP includes all three programs and their desktop/mobile views. Base, Build, Pro and Custom pages are not created.
- All Prime waitlist buttons return to the existing homepage form; no form, checkout or price is added. `tests/prime-page.test.cjs` checks exact content/groupings, full Section 3 equality with Strong apart from the supplied ongoing copy and dedicated media, route/assets, waitlist destinations, only-Prime homepage changes and approved-file checksums. Run `node --test tests/*.test.cjs`.

### PRFM Base Page, Version 1

- `programs/base/index.html` follows the approved programme template, including Prime V2's top-aligned overview, four benefits, three beginner-focused PRFM Difference cards, unchanged phone and centred caption, shared full-width delivery panel, three desktop session cards and mobile carousel. Shared styles and scripts and all Strong, Capacity and Prime pages remain byte-identical. The only homepage change is its existing Base CTA, now labelled "Explore PRFM Base" and linked to `programs/base/`.
- The hero now uses the approved replacement `Coached Dumbbell Lunge in the Gym.png`, supplied on 17 October 2026. `images/hero-base-coaching.png` is byte-identical to that attachment; `hero-base-coaching-small.jpg` is an 800px web alternative. Both URLs use `?v=2` to avoid the previous image being cached. Base-only image positioning retains the coach and client. `style/base.css` also contains the scoped overview alignment, compact practical-information row and informational Build pathway; it does not override approved phone, feature-card, session-carousel or duration-panel styles.
- The programme is fixed at four weeks, three full-body gym sessions weekly, approximately 30-40 minutes each. The 2-3 additional 20-30 minute walks are explicitly recommended rather than mandatory gym sessions. Bodyweight, dumbbells and kettlebells suit a standard or functional fitness gym. Beginner educational guidance explains RPE simply, without promising a video count or unlimited coaching.
- The fixed-duration panel uses the unchanged shared `program-ongoing` component with the supplied "Structured four-week programme / Four weeks. One strong foundation." content. Base is not described as a subscription or rolling cycle. Build has an informational pathway only, without a broken link or automatic enrolment.
- The authentic exercises follow the supplied Training Preview Base PDF, with the designer-confirmed `DB Bench Press` correction for Session 3. No barbells, prescriptions, RPE targets, sets, reps or rest periods have been added to the preview. The PDF is a source reference and is not published as a site download.
- The app demonstration now uses Ben's dedicated `5A7E4F79-A97B-4520-AA63-FF976FAD2450.MP4`, supplied on 18 October 2026. `media/prfm-base-app-demo.mp4?v=1` is the full-length 77.63-second H.264 web copy at 640 x 1138, 30 fps and target 1.4 Mbps, about 13 MB instead of the 226 MB original, without audio. `images/prfm-base-app-demo-poster.jpg?v=1` is a clear still extracted from the supplied recording, shared by the video poster and fallback image. Only Base's three media references and obsolete placeholder comment changed. All other programme media and the source attachment remain untouched. Muted looping, inline playback, viewport pause/resume, reduced-motion handling, autoplay fallback and no-control behaviour remain shared and unchanged.
- The final offer clearly displays `NZ$89 one-off`, with the approved supporting copy and existing waitlist destination. There is no checkout or additional form. `programs/base/mobile-preview.html` supplies the Mac phone-width preview. The complete website ZIP includes all four programme pages and previews. Run `node --test tests/*.test.cjs` for all content, lifecycle and regression tests.

### PRFM Build Page, Version 1

- New route: `/programs/build/`. Created files: `programs/build/index.html`, `programs/build/mobile-preview.html`, `style/build.css`, `images/hero-build-deadlift.jpg`, `images/hero-build-deadlift-small.jpg` and `tests/build-page.test.cjs`. Existing files changed: only Build's existing CTA in `index.html`, the homepage/route expectations in `tests/base-page.test.cjs`, `tests/prime-page.test.cjs` and `tests/program-page.test.cjs`, and these documentation/asset records. The website ZIP is refreshed. No approved programme page, shared stylesheet, playback script, existing image or video is modified.
- The hero uses Ben's approved `Screenshot 2026-10-18 at 2.57.43 PM.png`, supplied on 18 October 2026, showing a woman preparing a barbell deadlift with green bumper plates. JPEG derivatives retain the full 1558 x 1166 image and original aspect ratio, with an 800px alternative. No retouching, generated replacement, stock substitution or changes to people/equipment are made. Scoped contain-based positioning keeps the athlete and barbell recognisable on desktop and mobile. The source attachment remains unchanged.
- Build reuses Base's unchanged `base-summary`, `base-practical` and `base-pathway` treatments, plus the existing specifications, benefits, Lucide icons, top-aligned phone/card layout, centred caption, full-width delivery panel and training carousel. The body has only the Build-specific page modifier, so Base's hero rules do not apply. `style/build.css` contains only the approved hero treatment adapted to this image and compact wrapping progression links. It does not override shared card, phone, panel or carousel geometry, fonts or colours.
- Programme details: four weeks, four gym sessions per week, approximately 40-50 minutes each, beginner-intermediate, general strength and fitness. Equipment includes barbells, dumbbells, kettlebells and gym machines. There are no separate prescribed cardio sessions. Supplied copy includes both Base graduates and people with some gym experience; Base is not a prerequisite.
- The three Full Body sample sessions match the supplied Training Preview Build PDF and written brief, including `Lat Pulldown`, `Farmer's Carry` and `Pull-Ups` spelling. They are explicitly sample sessions, not the full weekly schedule or Day 1/2/3. No exercise prescriptions, sets, reps, rests, loads or intensity targets are added. The PDF is a source reference only, not a published download.
- The fixed-duration panel uses the exact approved component with "Structured four-week programme / Four weeks. Build what's next." and the supplied single paragraph. It remains beneath both Section 3 columns. There are no rolling-cycle or join-anytime claims. The compact pathway links to the existing Strong, Capacity and Prime routes using approved text-link styling.
- The phone now uses Ben's dedicated `0AB2413C-7D6D-4D69-8BA9-C90FFCEF226C.MP4`, supplied on 18 October 2026. `media/prfm-build-app-demo.mp4?v=1` is the full-length 82.03-second H.264 web copy at 640 x 1138, 30 fps and target 1.4 Mbps, about 13 MB rather than the 218 MB original, without audio. `images/prfm-build-app-demo-poster.jpg?v=1` is a matching source still showing the Build introduction, used for both the video poster and fallback image. Only Build's three media references and obsolete placeholder comment change. Its page layout, the shared video script, all other programme media and the source attachment remain unchanged. Muted autoplay, inline playback, continuous loop, off-screen pause/resume, reduced-motion handling, static fallback and no-control behaviour are unchanged.
- Pricing is `NZ$89 one-off`, preserving the existing approved Build entry in the launch-pricing table above (`$89 one-time / 4 weeks`) and matching Base's currency/presentation. No new price is invented, and there is no checkout, payment integration or additional form. All three waitlist buttons use the existing homepage Formspree flow.
- Run `node --test tests/*.test.cjs`. Build tests cover the supplied content, exact sample sessions, four-session frequency, original image proportions, shared phone/panel reuse, verified price source, all routes/assets and byte-for-byte preservation of the four approved pages, shared code and recordings. Existing homepage snapshot checks normalize only the new Build anchor before comparing previous approvals.

This is a static site. Deploy the folder as-is to any static host. Vercel can serve `index.html` from the root without build settings.
