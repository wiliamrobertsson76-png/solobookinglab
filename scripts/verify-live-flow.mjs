// Verifies the LIVE deployed SoloBookingLab main flow, not just HTTP 200:
// fetches the exact bytes GitHub Pages serves and runs the Fit Finder
// interaction test against them in an emulated DOM.
// Run: node scripts/verify-live-flow.mjs [baseUrl]
import vm from "node:vm";

const BASE = process.argv[2] || "https://wiliamrobertsson76-png.github.io/solobookinglab/";

let failures = 0;
function check(name, ok, detail = "") {
  console.log((ok ? "  ok  " : "FAIL  ") + name + (detail ? " :: " + detail : ""));
  if (!ok) failures++;
}

const pages = ["", "fit-finder.html", "dog-groomers.html", "car-detailers.html", "method.html",
  "about.html", "contact.html", "privacy.html", "terms.html", "corrections.html",
  "calculator.html", "robots.txt", "sitemap.xml", "llms.txt", "js/fit-finder.js"];

const fetched = {};
for (const p of pages) {
  const res = await fetch(BASE + p);
  fetched[p] = await res.text();
  check(`HTTP 200 /${p}`, res.status === 200, `status ${res.status}`);
}

const home = fetched[""];
const ff = fetched["fit-finder.html"];
const js = fetched["js/fit-finder.js"];

check("homepage is SoloBookingLab", home.includes("SoloBookingLab"));
check("homepage names the audience", /dog groomers/i.test(home) && /car detailers/i.test(home));
check("old calculator page redirects to fit-finder", /url=fit-finder\.html/.test(fetched["calculator.html"]));
check("redirect stub is noindex", /noindex/.test(fetched["calculator.html"]));
check("no newsletter-brand leftovers on homepage", !home.includes("NewsletterStack"));
check("sitemap uses solobookinglab URLs", fetched["sitemap.xml"].includes("/solobookinglab/") && !fetched["sitemap.xml"].includes("newsletterstack"));
check("fit-finder binds sbl-form and sbl-out", ff.includes('id="sbl-form"') && ff.includes('id="sbl-out"'));

// Interaction test against the exact served bytes.
const staticIds = [...ff.matchAll(/id="([^"]+)"/g)].map((m) => m[1]);
const boundIds = [...new Set([...js.matchAll(/getElementById\("([^"]+)"\)/g)].map((m) => m[1]))];
const missing = boundIds.filter((id) => !staticIds.includes(id));
check("every bound id exists in page", missing.length === 0, missing.join(",") || "all present");

const els = new Map();
for (const id of staticIds) {
  els.set(id, { innerHTML: "", attrs: {}, listeners: {}, setAttribute(k, v) { this.attrs[k] = v; }, addEventListener(ev, fn) { this.listeners[ev] = fn; } });
}
const docL = {};
const events = [];
const document = {
  getElementById: (id) => els.get(id) || null,
  querySelector: (sel) => ({ value: /budget/.test(sel) ? "low" : "yes" }),
  addEventListener: (e, f) => { (docL[e] = docL[e] || []).push(f); },
  removeEventListener: () => {},
  dispatchEvent: (e) => { events.push(e.detail && e.detail.event); return true; }
};
class CustomEvent { constructor(type, opts) { this.type = type; this.detail = opts && opts.detail; } }
new vm.Script(js, { filename: "live-fit-finder.js" }).runInNewContext({ document, CustomEvent });
try {
  for (const fn of docL.DOMContentLoaded) fn();
  for (const fn of docL.change || []) fn(); // first user interaction -> fit_finder_started
  const form = els.get("sbl-form");
  check("submit handler bound", !!form.listeners.submit);
  form.listeners.submit({ preventDefault() {} });
  const out = els.get("sbl-out");
  check("result renders on submit", /Suggested starting point/.test(out.innerHTML));
  check("comparison table renders", /<table>/.test(out.innerHTML));
  check("unverified points labeled", /not verified/.test(out.innerHTML));
  check("events fired (started/completed/recommendation_viewed)", events.includes("fit_finder_started") && events.includes("fit_finder_completed") && events.includes("recommendation_viewed"), events.join(","));
} catch (e) {
  check("no crash in Fit Finder flow", false, e.constructor.name + ": " + e.message);
}

console.log(failures === 0 ? "\nLIVE MAIN FLOW: WORKING" : `\nLIVE MAIN FLOW: ${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
