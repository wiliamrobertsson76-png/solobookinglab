# William's installation checklist (one list, do top to bottom)

Everything below requires a human (account owner). Do item 1 first — later items use its result.
While you do these, the agent continues with unblocked work (content drafting, QA).

## 1. Create the GitHub repo (needed before anything else)
1. Log in at https://github.com (create a free account if needed).
2. Click **+** (top right) → **New repository**.
3. Repository name: `newsletterstack` · Visibility: **Public** (required for free Actions minutes
   on the free plan) · Do NOT initialize with README (agent's code will be pushed).
4. Click **Create repository**.
5. Paste back to the agent: the repo URL (e.g. `https://github.com/<username>/newsletterstack`).

The agent will push the site + driftmotor and enable GitHub Pages (Settings → Pages →
Deploy from branch → main → /site folder or via Actions). You confirm the Pages setting once.

## 2. Register affiliate programs — INSTANT ones first (no application, no waiting)
Use your real identity and the live site URL
(`https://wiliamrobertsson76-png.github.io/solobookinglab/`). Never state fake traffic numbers.

**Spår A — direkt (5–10 min totalt, ID direkt):**
| Program | Signup page | Provision | Notes |
|---|---|---|---|
| ~~Systeme.io~~ | — | 60% livstid | **KLART 2026-09-04** — ID registrerat |
| GetResponse | https://www.getresponse.com/affiliate-programs | 40% månad 1–12 | Via PartnerStack, konto = ID direkt |
| AWeber | https://www.aweber.com/advocates.htm | 30% livstid (→50%) | Gratis Advocate-konto, direkt |
| Pabbly | https://www.pabbly.com/affiliates/ | 30% livstid, 365d cookie | Direkt, "alla kan gå med" |
| Selzy | https://selzy.com/en/partners/affiliate-program/ | 40% år 1 | Direkt på minuter |

Efter varje registrering: kopiera affiliate-ID:t / länken och klistra in den i chatten till agenten
(ID:t är inte hemligt — det syns i publicerade länkar). ALDRIG lösenord eller API-nycklar.

**Spår B — ansökan krävs (skicka in, fortsätt arbetsa medan du väntar):**
| Program | Provision | Varför väntan är värd det |
|---|---|---|
| Kit | 50% år 1 | Högsta provisionen i nischen |
| beehiiv | 50–60% år 1 | Stark varumärkesdrift i nichen |
| MailerLite | 30% livstid | Bra mellanalternativ, lång cookie (45d) |
| Kit | https://kit.com/affiliate | Free, application | Content site approval; mention the calculator + guides |
| beehiiv | https://www.beehiiv.com/partners | Free, application | Same: real site, real description |
| MailerLite | https://www.mailerlite.com/affiliate | Free, application | Same |

When approved, find your tracking ID / affiliate ID in each program's dashboard
(usually under "Links", "Assets" or "Profile").

## 3. Store credentials the safe way
- Tracking IDs are NOT secret (they appear inside published affiliate links) — the agent can
  receive them in chat and register them in `state/link-registry.json`.
- NEVER paste into chat or files: passwords, 2FA/recovery codes, full API keys, bank/card details.
  If a program ever needs a real secret (API key), put it in GitHub:
  **repo → Settings → Secrets and variables → Actions → New repository secret**, then tell the
  agent only the secret's NAME.

## 4. Optional decision: domain
Current plan uses the free `github.io` address (0 SEK). If you want a custom domain (~120 SEK/year),
say so explicitly with the amount; the agent will prepare everything except the purchase.

## 5. Kill switch
To instantly stop all automation: create an empty file `state/KILL` in the repo (or ask the agent).
Delete it to resume. See `state/KILL.example`.

## 6. Verify Google Search Console (blocker B4 — needed to measure anything)

Why: without a verified Search Console property the project cannot see impressions, clicks or
CTR — meaning progress and the day-60 kill-check cannot be proven. Takes ~5 minutes.

1. Go to https://search.google.com/search-console and sign in with your Google account.
2. Choose "URL prefix" and enter: `https://wiliamrobertsson76-png.github.io/solobookinglab/`
3. Pick the "HTML file" verification method. Google gives you a file named like
   `google1234567890abcdef.html`. NOTE: after GitHub verifies via the HTML-file method on Pages, tell me and I will confirm the file is served before you press Verify.
4. Save that file and paste its contents here in chat — I will commit it to the site so it is
   served at the exact URL Google requires, then tell you when to press "Verify".
   (Never paste passwords; this file is public and non-secret by design.)
5. Optional but recommended: repeat the same steps at https://www.bing.com/webmasters
   (it can import the Google property in one click).

## 7. Create two free test accounts (blocker B5 — for honest migration testing)

Why: the migration-risk guide must be based on real, documented tests — never vendor text.

1. Create a free account at https://kit.com (free up to 10,000 subscribers).
2. Create a free account at https://www.beehiiv.com (Launch plan, free up to 2,500 subscribers).
3. Use your real details (the platforms require it). Do NOT share passwords or recovery codes
   here — instead paste: the workspace/publication URL of each and a chosen test handle, e.g.
   "kit account: newsletterstack-test".
4. Tell me when both exist. I will then hand you the exact 30-minute test protocol to run in
   each (or the parts I can drive), and the guide gets published only with those test dates.
