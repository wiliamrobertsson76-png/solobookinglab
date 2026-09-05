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
  for (const p of reg.programs) {
    if (!p.source || !p.verified) {
      errors.push(`${p.id}: missing source or verified date`);
      continue;
    }
    const age = daysBetween(p.verified, today());
    if (age > reg.recheck_interval_days) {
      errors.push(`${p.id}: verification stale (${age}d > ${reg.recheck_interval_days}d)`);
    }
    if (p.status === "closed-do-not-register" && !/not accepting/i.test(JSON.stringify(p.restrictions || []))) {
      warnings.push(`${p.id}: closed program but restrictions text does not state closure`);
    }
  }
  // Hard rule: no live affiliate links without tracking IDs and verified status.
  for (const link of reg.published_affiliate_links || []) {
    const prog = reg.programs.find((x) => x.id === link.program);
    if (!prog || prog.status !== "verified-live") {
      errors.push(`published link references program '${link.program}' which is not verified-live`);
    }
    if (!prog?.tracking_id) {
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
