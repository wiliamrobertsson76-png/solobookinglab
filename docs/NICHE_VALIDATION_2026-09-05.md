# Niche re-validation 2026-09-05 (bias-free redo)

Per correction prompt Fas 2–5. The current niche entered the matrix as candidate #1 among 15
with no bonus for existing code. Sunk cost = 0 weight. Evidence labels:
**[P]** = primary source (vendor/program page or live SERP fetched 2026-09-05),
**[X]** = proxy (SERP composition, related searches, forum presence — no paid SEO tool exists here),
**[A]** = assumption (never proof). No search volume, CPC or keyword-difficulty numbers are
claimed anywhere.

## Weights (per correction prompt)

| Criterion | Weight |
|---|---:|
| T: Time to a genuinely usable affiliate link (incl. approval friction) | 20 % |
| E: Documented demand / real openings in live SERPs | 20 % |
| K: Real commission economics (terms, attribution, payout, churn, time-to-payout) | 15 % |
| U: Defensible unique asset we can build (tests/data/tool competitors lack) | 15 % |
| I: Credible content production with available resources | 10 % |
| D: At least one non-Google distribution channel allowing the work style | 10 % |
| R: Legal/platform risk (low = high score) | 5 % |
| F: Ease of keeping facts current automatically | 5 % |

Score = Σ(score 0–10 × weight). The full 15-candidate matrix is in
`state/niche-matrix-2026-09-05.json` (machine-readable, with per-candidate sources).

## Matrix (summary, sorted)

| # | Candidate | T | E | K | U | I | D | R | F | Total | Kill reason / note |
|---|---|--:|--:|--:|--:|--:|--:|--:|--:|---:|---|
| 1 | **Newsletter platform choice & switching (current, narrowed)** | 7 | 8 | 8 | 6 | 7 | 6 | 8 | 7 | **7.00** | passes gate only after narrowing + test-based assets |
| 2 | Invoice/accounting for freelancers (FreshBooks, Bonsai) | 4 | 8 | 9 | 4 | 5 | 5 | 7 | 6 | 6.00 | PartnerStack approval friction [P: "Join" flow]; SERPs owned by vendors' own "alternatives" pages [P: hellobonsai.com/alternatives/freshbooks] |
| 3 | Course platforms (Thinkific/Teachable, 30 % lifetime [P 09-04]) | 5 | 6 | 7 | 5 | 6 | 5 | 7 | 6 | 5.90 | audience needs course-building credibility; entrenched listicles |
| 4 | Project management (ClickUp et al.) | 4 | 7 | 6 | 4 | 6 | 5 | 7 | 6 | 5.85 | approval-gated program [P: "Once approved…" help.clickup.com]; vendor SERP ownership |
| 5 | AI writing tools | 5 | 6 | 5 | 5 | 6 | 5 | 6 | 5 | 5.45 | expensive plans → churn; claims hard to verify honestly |
| 6 | Web hosting for beginners | 5 | 7 | 5 | 3 | 5 | 4 | 6 | 5 | 5.05 | one-time bounties, brutal competition [P 09-04 terms] |
| 7 | VPN/privacy | 4 | 6 | 5 | 3 | 5 | 4 | 5 | 5 | 4.70 | trust-heavy, saturated, one-time commissions |
| 8 | No-code builders (Softr/Glide/Bubble) | 2 | 7 | 5 | 4 | 5 | 5 | 7 | 5 | 4.85 | **no usable affiliate program found in primary search today** [P-search 09-05] |
| 9 | Notion/productivity templates | 1 | 6 | 5 | 5 | 6 | 5 | 7 | 5 | 4.60 | Notion affiliate closed [P 09-04] |
| 10 | Resume builders | 3 | 5 | 5 | 3 | 5 | 4 | 6 | 5 | 4.30 | program access unverified [A]; seasonal demand |
| 11 | Website builders for creators | 3 | 6 | 5 | 3 | 5 | 4 | 6 | 5 | 4.30 | program access unverified [A] |
| 12 | Email-SMB broad (Brevo/ActiveCampaign) | 4 | 6 | 6 | 3 | 5 | 4 | 6 | 5 | 4.75 | program terms not verified from primary [A]; broader = harder |
| 13 | Language-learning apps | 3 | 5 | 4 | 3 | 5 | 4 | 6 | 5 | 3.95 | program uncertain [A]; consumer trust needs |
| 14 | Crypto/fintech | 2 | 5 | 6 | 2 | 2 | 3 | 1 | 3 | 3.05 | excluded: YMYL/regulatory |
| 15 | Health/supplements | 2 | 5 | 5 | 2 | 2 | 3 | 1 | 3 | 2.95 | excluded: YMYL, unverifiable claims |

## SERP evidence (live, 2026-09-05) [X: composition of real results]

- "beehiiv vs kit": pos 1 independent tester (emailtooltester), **pos 2–3 BOTH vendors' own
  comparison pages**, pos 4–5 small blogs, pos 7 established comparator (efficient.app), pos 8
  Facebook group thread → openings exist in the tail (small blogs hold spots), head is
  vendor-owned. Realistic: we compete for tail + freshness, not head, in year 0.
- "how much does beehiiv cost 5000 subscribers": pos 1 vendor pricing, pos 2 vendor help doc,
  **pos 3 independent tester, pos 4 independent blog, pos 6 Reddit thread** → cost queries have
  real non-vendor openings. **Critical find: beehiiv ships its own subscriber-count pricing
  calculator [P]** → a single-brand cost calculator is NOT a defensible asset.
- "migrate from mailchimp to beehiiv": pos 1–4 vendor-owned docs/blog, pos 5 Reddit, pos 6
  YouTube → migration HOW-TO head is vendor-owned; independent angles must come from
  cross-platform testing (what breaks), which vendors don't publish about rivals.

## Bottom-of-funnel question inventory (grind item 2)

Verified with live SERP today [P]: 3 of 20+.
Plausible but not yet SERP-checked [A]: ~17 more (e.g. "kit pricing 10000 subscribers",
"beehiiv vs mailerlite", "substack vs beehiiv which", "mailerlite vs kit deliverability",
"move newsletter from substack to kit", "beehiiv free plan limits", "systeme.io vs mailerlite",
"newsletter platform comparison table", "kit creator plan price increase", "beehiiv scale plan
cost", "switch from mailchimp cost", "newsletter migration checklist", "what breaks when
switching newsletter platform", "kit vs beehiiv automations", "cheapest email platform 10k
subscribers", "newsletter platform for paid subscriptions", "beehiiv student discount").
→ Grind item 2 status: **PARTIAL — the remaining queries must be SERP-checked before any
article is written.** This is task BL-6 in the backlog and blocks content production.

## Go/no-go gate — applied to the narrowed current niche

1. ≥2 programs usable now or after simple truthful registration: **PASS** — 5 instant-access
   programs verified [P 09-04], 1 already registered (Systeme.io).
2. ≥20 commercial/migration questions with realistic openings: **PARTIAL** (3 verified + 17
   candidate questions unchecked). Must complete before content.
3. Defensible asset not equally covered by top competitors: **CONDITIONAL PASS** — single-brand
   calculators exist [P], but NO top competitor offers: (a) multi-platform side-by-side cost at
   exact subscriber counts, (b) a switch-vs-stay break-even calculator (migration cost vs future
   savings), (c) cross-platform migration-risk data from documented account tests. Each must be
   proven against a competitor matrix before publication.
4. Honest testing possible with our resources: **PASS** (free plans: Kit ≤10k subs, beehiiv
   ≤2.5k, MailerLite ≤250, Systeme.io free) — account creation is identity-bound → William
   must create test accounts (single consolidated blocker below).
5. Revenue chain documented traffic→click→trial→paid→approved→paid-out: **PASS** (per-program
   terms in state/link-registry.json; every unknown labeled [A]).
6. Distribution beyond new-domain Google: **PARTIAL** — none proven yet. Honest candidate
   channels that fit the rules: Reddit participation (manual, human, rule-respecting), open-
   sourcing the calculators (GitHub discovery), share-your-tool communities (manual). All
   require human effort; none is automatable spam. [A] until tried.
7. No deceptive mass production needed: **PASS for narrowed niche; FAIL for broad "compare
   everything"** → extra reason to narrow.

Gate result: **no full PASS yet** (item 2 partial, item 6 partial) → no new content production
until those close. Asset #1 (cost table) already live and gate-compatible.

## Fas 3 — decision: SMALNA AV (narrow), not BEHÅLL, not PIVOTERA

**New position:** "Cost and switching decisions for independent newsletter creators with roughly
500–25,000 subscribers." One job: *"What will each platform cost me at my size — and what breaks
if I switch?"*

Why not BEHÅLL (broad): broad version fails grind item 7 and spreads credibility thin; SERP head
is vendor-owned [X]; beehiiv already owns single-brand calculators [P].
Why not PIVOTERA: no candidate scored higher (best alternative 6.00 vs 7.00); current niche has
5 instant programs, a live gate-compatible tool, and honest testability — pivoting would trade
these for approval friction and owned SERPs.
Existing code kept only where it serves the narrowed job (the cost calculator); the affiliate-
earnings estimator was removed from the public tool in Fas 1 (it answered OUR question, not the
visitor's).

First three assets (each gated by a competitor-matrix proof before publication):
1. **Multi-platform cost table** at 500/1k/2.5k/5k/10k/25k subscribers, date-stamped (upgrade of
   the live calculator; the one asset already live).
2. **Switch-vs-stay break-even calculator** (effort/cost/risk of migrating vs staying — no
   competitor equivalent found today [P/X]).
3. **Migration-risk guide Kit↔beehiiv** based on documented free-plan tests on both platforms
   (what breaks: tags vs segments, automations, paid subscriptions, warm-up) — published only
   with test dates, never from vendor text.

Scenarios (formulas + assumptions, all [A], labeled — NOT forecasts):
- Pessimistic: 0 non-Google distribution achieved + head-SERP-only targeting → ~0 sessions for
  months → 0 clicks → 0 SEK. Kill/hold decision at day 60 if impressions ≈ 0.
- Base: 10 indexed assets, GSC shows impressions by month 6, CTR 2 % [A] on 500 impressions/mo
  [A] → ~10 clicks/mo, 30 % outbound click rate [A] → ~3 program clicks/mo → first referral
  plausible by month 6–9; commission 30–60 % of a $9–43/mo plan → order of magnitude: first
  payout ($30–100) around month 9–12 IF the funnel holds at each step.
- Optimistic: one asset earns a community mention → 2,000 sessions/mo [A] by month 6 → ~200
  program clicks/mo → 2–6 paying referrals/mo [A] → recurring commission starts compounding.
Kill-switch metric chain is now in backlog with day-60 and day-90 checkpoints.

## Fas 4 — measurement plan (before any optimization)

Funnel + owner + first action:
1. Indexed pages → Google Search Console + Bing Webmaster. **BLOCKER for William** (property
   verification needs his GitHub/login): exact steps below. [No data until then.]
2. Search impressions/clicks/query → same tools (free, official).
3. Outbound affiliate clicks per page/CTA/program → **program-side tracking first**: sub-ID
   parameters where each program allows (verify per program in dashboard; Systeme.io/PartnerStack
   programs to be checked). No new third-party scripts on the site yet.
4. Trials/registrations, paying referrals, approved & paid commission → read-only from program
   dashboards; William pastes (or screenshots into state as numbers) weekly; later OAuth if a
   program offers it and William approves.
5. On-site behavior: NOT measured today (privacy text says no analytics — currently TRUE).
   If a privacy-first, cookie-less, commercial-use-allowed free tier is found (candidate must be
   verified against its own terms before adoption), privacy.html is updated BEFORE it ships.
   GoatCounter's free tier is non-commercial-only [P: docs] → NOT eligible as-is; evaluation
   continues (task BL-8). Do not optimize on guessed CTR — GSC provides real CTR once verified.

Current funnel state (truth): indexed unknown (no GSC), impressions 0 known, outbound clicks
0 measured, referrals 0, approved commission 0 SEK, paid 0 SEK.

## Fas 5 — honest autonomy inventory

- **Runs unattended today (proven by production commits):** tests, site QA, link freshness,
  heartbeat/state commit, deploy-on-push, live-flow verification script (manual trigger).
  → the system is **underhållsautomatiserat** (maintenance-automated).
- **Freebuff sessions** are human-started (Freebuff ToS); within a session the agent chooses and
  executes tasks autonomously → **semi-autonomous** work mode. NOT an unattended 24/7 API.
- **Unattended research/writing/code generation:** NOT possible today — no approved external
  inference API is connected; GitHub Actions has no model access. Assumed nothing; documented
  here. If William later connects an explicitly permissive API (his approval, cost-capped),
  specific workflows can graduate to **obevakat autonomt** with scheduler+model+rollback+cost
  caps per the masterprompt.
- Social publishing automation: none exists; any future channel goes through official APIs and
  platform rules with a kill switch.
- The daily heartbeat commit is an ops signal, not customer value and not a business KPI.

## Fas 6 — execution order from here (no William choice required)

1. ✅ Live defects repaired + regression tests (done this session, live-verified).
2. ✅ False claims + state contradictions fixed (done).
3. ✅ Niche matrix + SERP review (this document).
4. ✅ Decision: SMALNA AV (documented here + decisions.jsonl).
5. → BL-6: SERP-check the remaining ~17 bottom-funnel questions (gate item 2) — unblocked.
6. → BL-7: competitor matrix for asset #2 (break-even calculator) — unblocked.
7. → BL-8: measurement setup (GSC steps for William; sub-ID verification per program) — partially
   blocked by human verification.
8. → 30-day backlog rewrite with funnel-KPI impact per task (backlog.json this session).
