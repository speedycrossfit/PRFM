# PRFM Meta Pixel

## Configuration and release

The existing pixel ID, `610522118540785`, is configured once in `style/tracking-config.js`. It is public configuration, not a secret. `scripts/site-integrations.cjs` adds the shared scripts, privacy link, inline tracking preference and homepage waitlist status at build time. Source page content and approved shared styles/scripts remain unchanged.

The default-on, opt-out change was approved for production publication by Ben on 3 November 2026. This is not affirmative consent and does not satisfy prior-consent requirements where they apply. Publication approval does not constitute a legal compliance assessment.

Run `node scripts/build-static.cjs`. Preview `public/index.html`, not the source homepage, to see these build-time additions. Mobile-preview wrappers are not tracked; their contained website pages receive the integration once.

Only HTTPS visits on `www.prfmfitness.com` and `prfmfitness.com` can load Meta. Localhost, file previews and Vercel deployment domains never send advertising events. No noscript tracking image is included; JavaScript-disabled visitors are not tracked.

## Tracking preference and event behaviour

- The inline checkbox below the footer is ticked automatically for a new visitor. There is no popup, modal or banner. This default is not recorded as affirmative consent.
- Explicit choices use the existing localStorage key `prfm-advertising-consent-v1` for backward compatibility. Opt-outs, including older opt-outs, remain effective until the visitor enables tracking or clears the website's data. Enabled choices have a 180-day validity period. Expired or malformed records fail closed rather than resetting to default-on. If stored preferences cannot be read, tracking defaults off; explicit changes then last for the current page only.
- GPC and Do Not Track override the tracking preference. Opting out stops further events, clears pending application-owned events, invokes Meta's technical revoke API and expires accessible `_fbp` and `_fbc` cookies on PRFM domains. Information already sent to Meta cannot be withdrawn by deleting cookies. SDK grant/revoke calls are technical gates, not evidence of legal consent.
- One standard `PageView` is sent per document when tracking is enabled and the SDK loads. This website uses static document navigation; hash links, visibility changes and repeat preference changes do not count as new page views. Prior pages and prior submissions are not replayed.
- `Lead` is sent only when the existing Formspree endpoint returns a successful HTTP response and JSON `ok: true`, without errors. Pending/duplicate submissions are blocked, and each issued submission token can be consumed only once.
- Tracking must be enabled both when the submission starts and when success is confirmed. Opting out invalidates in-flight submission tokens even if tracking is subsequently enabled again.
- The existing action, POST method, field names and honeypot remain. Without fetch/FormData support or JavaScript, the original native Formspree submission still works without Lead tracking.
- No form values, scorecard results, advanced-matching fields or custom event parameters are supplied to Meta. Automatic configuration is disabled before initialization. Meta still receives standard network/device information, page URL and cookie identifiers when enabled.
- Unexpected query parameters disable tracking for that URL rather than risk sharing query information. Standard advertising parameters are allowed; never put personal or health data in URLs or advertising parameter values.
- If another `fbq` installation is detected, this integration fails closed rather than initialise another pixel. SDK failures and ad blockers must not prevent signup.

## Verify in Meta Events Manager

1. Select the existing data source with pixel ID `610522118540785`, then open **Test events** and open `https://www.prfmfitness.com` through the browser-events test tool.
2. On an approved production release of this change, a fresh visitor without saved preferences or privacy signals should see a ticked checkbox and one `PageView`. No acceptance or consent record should be inferred from that default.
3. Navigate to a program page and confirm one additional `PageView`. Hash-link scrolling should not add events. With a saved opt-out, neither page should load Meta.
4. Submit one genuine waitlist signup with tracking enabled. Confirm Formspree's success message and exactly one `Lead`. A submit click, native validation failure, server rejection or network failure must not produce `Lead`.
5. Disable the checkbox. Check that further events stop. With GPC or Do Not Track enabled, tracking stays off even if a choice was saved earlier.
6. Inspect event parameters: there should be no first name, email, application answers, health details or scorecard values. Standard Meta URL, browser and cookie data will still be present when tracking is enabled.
7. In the existing data source settings, confirm **automatic advanced matching** and **Track events automatically without code** are off, and remove any old Event Setup Tool rules that would duplicate PageView or Lead. These account settings are not changed by this repository.

Use a browser without an ad blocker for the positive test; browser privacy protections and Meta-side restrictions can prevent delivery. Test Events receipt requires verification in the owner's Meta account. Automated tests use a stub SDK and mocked Formspree responses, not real submissions or real advertising events.

## Privacy operations

`privacy/index.html` contains the approved business name, address and hello@prfmfitness.com contact. The annual retention review, access restrictions and deletion practices described there must also be carried out in provider accounts and exports; the website cannot perform those account operations.

This policy is a starting point, not a legal compliance certification. Overseas provider safeguards and market-specific obligations require appropriate review.
