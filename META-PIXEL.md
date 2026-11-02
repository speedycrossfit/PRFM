# PRFM Meta Pixel

## Configuration and release

The existing pixel ID, `610522118540785`, is configured once in `style/tracking-config.js`. It is public configuration, not a secret. `scripts/site-integrations.cjs` adds the shared scripts, privacy link, inline opt-in and homepage waitlist status at build time. Source page content and approved shared styles/scripts remain unchanged.

Run `node scripts/build-static.cjs`. Preview `public/index.html`, not the source homepage, to see these build-time additions. Mobile-preview wrappers are not tracked; their contained website pages receive the integration once.

Only HTTPS visits on `www.prfmfitness.com` and `prfmfitness.com` can load Meta. Localhost, file previews and Vercel deployment domains never send advertising events. No unconditional noscript tracking image is included, because it would bypass consent.

## Consent and event behaviour

- The inline checkbox below the footer is unchecked by default. There is no popup, modal or banner.
- The optional choice is stored in localStorage under `prfm-advertising-consent-v1`, with a 180-day expiry. If storage is unavailable, an explicit choice lasts only on the current page.
- GPC and Do Not Track override consent. Withdrawal stops further events, clears pending application-owned events, revokes Meta consent and expires accessible `_fbp` and `_fbc` cookies on PRFM domains. Information already sent to Meta cannot be withdrawn by deleting cookies.
- One standard `PageView` is sent per document after consent and SDK load. This website uses static document navigation; hash links, visibility changes and repeat consent do not count as new page views. Prior pages and prior submissions are not replayed.
- `Lead` is sent only when the existing Formspree endpoint returns a successful HTTP response and JSON `ok: true`, without errors. Pending/duplicate submissions are blocked, and each issued submission token can be consumed only once.
- Consent must exist both when the submission starts and when success is confirmed. Withdrawal invalidates in-flight submission tokens even if consent is subsequently granted again.
- The existing action, POST method, field names and honeypot remain. Without fetch/FormData support or JavaScript, the original native Formspree submission still works without Lead tracking.
- No form values, scorecard results, advanced-matching fields or custom event parameters are supplied to Meta. Automatic configuration is disabled before initialization. Meta still receives standard network/device information, page URL and cookie identifiers when enabled.
- Unexpected query parameters disable tracking for that URL rather than risk sharing query information. Standard advertising parameters are allowed; never put personal or health data in URLs or advertising parameter values.
- If another `fbq` installation is detected, this integration fails closed rather than initialise another pixel. SDK failures and ad blockers must not prevent signup.

## Verify in Meta Events Manager

1. Select the existing data source with pixel ID `610522118540785`, then open **Test events** and open `https://www.prfmfitness.com` through the browser-events test tool.
2. In a fresh browser session with no saved PRFM consent, confirm no Meta script or PageView request is sent until the optional footer checkbox is enabled.
3. Enable the checkbox. Confirm one `PageView` for this pixel. Navigate to a program page and confirm one additional `PageView`. Hash-link scrolling should not add events.
4. Submit one genuine waitlist signup with consent enabled. Confirm Formspree's success message and exactly one `Lead`. A submit click, native validation failure, server rejection or network failure must not produce `Lead`.
5. Disable the checkbox. Check that further events stop. With GPC or Do Not Track enabled, tracking stays off even if a choice was saved earlier.
6. Inspect event parameters: there should be no first name, email, application answers, health details or scorecard values. Standard Meta URL, browser and cookie data will still be present for consented visits.
7. In the existing data source settings, confirm **automatic advanced matching** and **Track events automatically without code** are off, and remove any old Event Setup Tool rules that would duplicate PageView or Lead. These account settings are not changed by this repository.

Use a browser without an ad blocker for the positive test; browser privacy protections and Meta-side restrictions can prevent delivery. Test Events receipt requires verification in the owner's Meta account. Automated tests use a stub SDK and mocked Formspree responses, not real submissions or real advertising events.

## Privacy operations

`privacy/index.html` contains the approved business name, address and hello@prfmfitness.com contact. The annual retention review, access restrictions and deletion practices described there must also be carried out in provider accounts and exports; the website cannot perform those account operations.

This policy is a starting point, not a legal compliance certification. Overseas provider safeguards and market-specific obligations require appropriate review.
