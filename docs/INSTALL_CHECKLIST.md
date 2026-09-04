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

## 2. Register affiliate programs (only AFTER the site is live)
Use your real identity and the live site URL
(`https://<username>.github.io/newsletterstack/`). Never state fake traffic numbers.
| Program | Signup page | Cost | Notes |
|---|---|---|---|
| Systeme.io | https://systeme.io/affiliate-program | Free, no application | Instant affiliate ID after creating a free account |
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
