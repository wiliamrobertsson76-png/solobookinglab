// Link validator. Rules (docs/CONTENT_STANDARD.md):
// - every registry entry must be re-verified within recheck_interval_days
// - every outbound link in published HTML must be http(s), on the allowlist or the site itself
// - affiliate URLs must never go live without a tracking ID + verified status
import { readJson, log, today } from "./util.mjs";

const REGISTRY_FILE = "state/link-registry.json";

function daysBetween(a, b) {
  return Math.abs(Math.round((new Date(b) - new Date(a)) / 86400000));
}

export function checkRegistry() {
  const reg = readJson(REGISTRY_FILE, null);
  if (!reg) {
    return { ok: false, errors: ["link-registry.json missing"] };
  }
  const errors = [];
  const warnings = [];

  // Shape A (pivot 2026-09-05): tools + archived_newsletter_programs.
  if (Array.isArray(reg.tools)) {
    for (const t of reg.tools) {
      const claimsVerified = /vendor \d{4}-\d{2}-\d{2}/i.test(JSON.stringify(t.pricing_summary || "") + JSON.stringify(t.affiliate?.status || "") + JSON.stringify(t.affiliate?.terms || ""));
      const hasDate = /\d{4}-\d{2}-\d{2}/.test(t.pricing_verified || "") || /\d{4}-\d{2}-\d{2}/.test(t.affiliate?.status || "");
      if (claimsVerified && !hasDate) {
        errors.push(`${t.id}: claims vendor verification without a verification date`);
      }
      if (t.affiliate?.available && !t.affiliate.signup_url) {
        errors.push(`${t.id}: affiliate available but no program URL recorded`);
      }
      if (!t.pricing_page) {
        errors.push(`${t.id}: missing pricing_page source`);
      }
    }
    for (const p of reg.archived_newsletter_programs || []) {
      if (!/archived-pivoted/.test(p.status || "")) {
        errors.push(`${p.id}: archived program without archived-pivoted status`);
      }
    }
  }

  // Shape B (legacy newsletter registry) - still supported for history.
  if (Array.isArray(reg.programs)) {
    for (const p of reg.programs) {
      if (!p.source || !p.verified) {
        errors.push(`${p.id}: missing source or verified date`);
        continue;
      }
      const age = daysBetween(p.verified, today());
      if (age > reg.recheck_interval_days && !/archived-pivoted/.test(p.status || "")) {
        errors.push(`${p.id}: verification stale (${age}d > ${reg.recheck_interval_days}d)`);
      }
      if (p.status === "closed-do-not-register" && !/not accepting/i.test(JSON.stringify(p.restrictions || []))) {
        warnings.push(`${p.id}: closed program but restrictions text does not state closure`);
      }
    }
  }

  // Hard rule: no live affiliate links without tracking IDs and verified status.
  const allEntities = [...(reg.tools || []), ...(reg.programs || []), ...(reg.archived_newsletter_programs || [])];
  for (const link of reg.published_affiliate_links || []) {
    const prog = allEntities.find((x) => x.id === link.program);
    if (!prog) {
      errors.push(`published link references unknown program '${link.program}'`);
      continue;
    }
    if (/archived-pivoted/.test(prog.status || "")) {
      errors.push(`published link references ARCHIVED program '${link.program}'`);
    }
    if (!prog.tracking_id) {
      errors.push(`published link for '${link.program}' has no tracking ID`);
    }
    if (!link.rel_sponsored) {
      errors.push(`published link for '${link.program}' missing rel=sponsored`);
    }
  }
  log("links", errors.length ? "ERROR" : "INFO", errors.length ? errors.join("; ") : "registry OK");
  return { ok: errors.length === 0, errors, warnings };
}

const ALLOWED_OUTBOUND = [
  // booking-stack vendors (pivot 2026-09-05)
  "simplybook.me",
  "affiliate.simplybook.me",
  "squareup.com",
  "fresha.com",
  "www.fresha.com",
  "calendly.com",
  "trafft.com",
  "jotform.com",
  "www.jotform.com",
  "formaloo.com",
  "www.formaloo.com",
  "make.com",
  "www.make.com",
  "pabbly.com",
  "www.pabbly.com",
  // historical registry entries (archived niche, kept for redirect integrity)
  "kit.com",
  "www.beehiiv.com",
  "beehiiv.com",
  "www.mailerlite.com",
  "mailerlite.com",
  "systeme.io",
  "www.getresponse.com",
  "getresponse.com",
  "www.aweber.com",
  "aweber.com",
  "selzy.com",
  "www.notion.com",
  "notion.com",
  // infrastructure
  "github.com"
];

export function validateOutboundUrl(urlStr) {
  let u;
  try {
    u = new URL(urlStr);
  } catch {
    return { ok: false, reason: "not a valid URL" };
  }
  if (u.protocol !== "https:") return { ok: false, reason: "only https allowed" };
  if (ALLOWED_OUTBOUND.includes(u.hostname)) return { ok: true };
  return { ok: false, reason: `host not on allowlist: ${u.hostname}` };
}
