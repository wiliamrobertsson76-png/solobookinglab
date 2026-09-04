# CONTENT STANDARD — NewsletterStack

## Page mission rule
Every page must be searchable, shareable, or both, and have ONE defined job in the buying journey:
(problem/implementation guide, narrow comparison, alternatives page, verified data/tool, template).

## Quality bar
- Real added value beyond rewriting sources: at least one of — own verified test in a free
  plan/demo, a working tool/calculator, a structured dataset with dates, a migration checklist
  not found elsewhere.
- Volatile facts (prices, plan limits, commission terms): checked against the primary source and
  stamped "verified YYYY-MM-DD, source: URL". If it cannot be verified → don't publish; create a
  blocked task in backlog instead.
- Comparisons: criteria declared, consistent, explained; pros AND cons, balanced.
- Claims of experience: only what is documented in state/experiments.jsonl or logs. Never claim
  William bought/used anything without evidence. Allowed formulations: "we tested X in the free
  plan on <date>" (only if actually done), "per the vendor's pricing page on <date>".
- No copied long excerpts; no rights-restricted images; screenshots only with license clarity.
- Titles/CTAs clear, never manipulative; no dark patterns; no fake urgency.

## Affiliate link rules
- rel="sponsored" on every affiliate/monetized link (add rel="nofollow" additionally only if a
  program requires it).
- Disclosure text immediately before/next to the first commercial link.
- Link target must exist in state/link-registry.json with status "verified" and a check date
  ≤ 90 days. Any link failing the scheduled link check gets deactivated automatically and the
  page marked for review.
- No link shorteners that obscure the destination.

## Technical gates (all must pass before publish)
1. `node engine/tests/run-all.mjs` exits 0 (includes link check, fact-date check, HTML sanity).
2. Page works without JS, without cookies, on mobile; meets WCAG AA basics (contrast, alt text,
   headings order, focus visibility).
3. JSON-LD only where it matches visible content; never fake Review/Rating/Product.
4. SEO: unique title/description, canonical, OG tags, internal links in/out, sitemap updated.
5. Meta: description ≤ 160 chars; H1 unique per page.

## Review-of-winners rule
Before creating new content, update existing pages that already earn impressions/clicks
(when Search Console data becomes available). New content only when no better update exists.
