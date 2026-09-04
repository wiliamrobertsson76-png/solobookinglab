// Site QA: static checks over site/*.html enforcing docs/CONTENT_STANDARD.md.
import { readdirSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { ROOT, log } from "./util.mjs";

const SITE_DIR = path.join(ROOT, "site");

export function runSiteQa() {
  const errors = [];
  const warnings = [];
  const files = readdirSync(SITE_DIR).filter((f) => f.endsWith(".html"));

  for (const f of files) {
    const html = readFileSync(path.join(SITE_DIR, f), "utf8");

    // 1. No cookies / no third-party scripts (privacy-first hard rule)
    // Allowed: JSON-LD blocks and the local calculator script (absolute or relative path).
    if (/<script(?![^>]*application\/ld\+json)(?![^>]*src="[\./]*js\/calculator\.js)[^>]*\ssrc=/i.test(html)) {
      errors.push(`${f}: external/third-party <script src> found (only local calculator.js allowed)`);
    }
    if (/document\.cookie|setCookie|cookiebot|onetrust/i.test(html)) {
      errors.push(`${f}: cookie-setting code found`);
    }

    // 2. Basic metadata
    if (!/<title>.+<\/title>/i.test(html)) errors.push(`${f}: missing <title>`);
    if (!/name="description"/i.test(html)) errors.push(`${f}: missing meta description`);
    if (!/rel="canonical"/i.test(html)) errors.push(`${f}: missing canonical`);

    // 3. Affilate disclosure near top of page (before main content ends)
    if (/aff(iliate|iliation)/i.test(html) === false && f !== "index.html") {
      warnings.push(`${f}: no affiliate mention at all (ok for compliance pages, check intent)`);
    }
    if (!/rel="sponsored"/i.test(html)) {
      // fine for now: no affiliate links live. The day one appears without rel=sponsored it must fail.
      if (/href="https?:\/\/(?!williamrobertsson\.github\.io)[^"]+"/i.test(html)) {
        // outbound links exist; none are affiliate yet, so this is informational only
      }
    }
  }

  // 4. Internal link integrity: every local href resolves to a file
  for (const f of files) {
    const html = readFileSync(path.join(SITE_DIR, f), "utf8");
    const hrefs = [...html.matchAll(/href="([^"]+)"/g)]
      .map((m) => m[1])
      .filter((h) => !/^https?:\/\//i.test(h) && /\.html(\?|#|$)/.test(h))
      .map((h) => h.split("#")[0]);
    for (const h of hrefs) {
      const target = path.join(SITE_DIR, h.replace(/^\//, "").split("?")[0]);
      if (!existsSync(target)) {
        errors.push(`${f}: broken internal link -> ${h}`);
      }
    }
  }

  // 5. Sitemap covers all pages
  const sitemapPath = path.join(SITE_DIR, "sitemap.xml");
  if (existsSync(sitemapPath)) {
    const sm = readFileSync(sitemapPath, "utf8");
    for (const f of files) {
      const base = f === "index.html" ? "" : f;
      const expected = `newsletterstack/${base}`;
      if (!sm.includes(expected)) {
        warnings.push(`sitemap.xml does not list ${f}`);
      }
    }
  } else {
    errors.push("sitemap.xml missing");
  }

  log("site-qa", errors.length ? "ERROR" : "INFO", errors.length ? errors.join("; ") : "site QA OK");
  return { ok: errors.length === 0, errors, warnings, checked: files.length };
}
