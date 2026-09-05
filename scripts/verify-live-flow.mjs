// Verifies the LIVE deployed main flow, not just HTTP 200:
// fetches the exact bytes GitHub Pages serves and runs the calculator
// interaction test against them in an emulated DOM.
// Run: node scripts/verify-live-flow.mjs [baseUrl]
import vm from "node:vm";

const BASE = process.argv[2] || "https://wiliamrobertsson76-png.github.io/newsletterstack/";

let failures = 0;
function check(name, ok, detail = "") {
  console.log((ok ? "  ok  " : "FAIL  ") + name + (detail ? " :: " + detail : ""));
  if (!ok) failures++;
}

const pages = ["", "calculator.html", "method.html", "about.html", "contact.html",
  "privacy.html", "terms.html", "robots.txt", "sitemap.xml", "llms.txt", "js/calculator.js"];

const fetched = {};
for (const p of pages) {
  const res = await fetch(BASE + p);
  fetched[p] = await res.text();
  check(`HTTP 200 /${p}`, res.status === 200, `status ${res.status}`);
}

const html = fetched["calculator.html"];
const js = fetched["js/calculator.js"];

check("live page has no phantom id=order input", !/id="order"/.test(html));
check("live script binds no missing elements (order/ctr/conv)", !/"(order|ctr|conv)"/.test(js));
check("live script has no root-relative /method.html link", !js.includes('"/method.html"'));
check("live page has no FinanceApplication JSON-LD", !html.includes("FinanceApplication"));
check("live homepage removed unsourced claim", !fetched[""].includes("Most comparison posts"));

// Interaction test against the exact served bytes.
const staticIds = [...html.matchAll(/id="([^"]+)"/g)].map((m) => m[1]);
const boundIds = [...new Set([...js.matchAll(/getElementById\("([^"]+)"\)/g)].map((m) => m[1]))];
const missing = boundIds.filter((id) => !staticIds.includes(id));
check("every bound id exists in page", missing.length === 0, missing.join(",") || "all present");

const els = new Map();
for (const id of staticIds) {
  els.set(id, {
    value: id === "subs" ? "1000" : "",
    innerHTML: "",
    attrs: {},
    listeners: {},
    setAttribute(k, v) { this.attrs[k] = v; },
    addEventListener(ev, fn) { this.listeners[ev] = fn; }
  });
}
const docL = {};
const document = {
  getElementById: (id) => els.get(id) || null,
  addEventListener: (e, f) => { docL[e] = f; }
};
new vm.Script(js, { filename: "live-calculator.js" }).runInNewContext({ document });
try {
  docL.DOMContentLoaded();
  const out = els.get("out");
  check("renders results table on load", /<table>/.test(out.innerHTML));
  check("1,000 subs shows a free-plan $0 row", /\$0/.test(out.innerHTML));
  check("output marks data-computed", out.attrs["data-computed"] === "true");
  check("source link is relative (works under /newsletterstack/)", /href="method\.html"/.test(out.innerHTML));

  els.get("subs").value = "30000";
  els.get("subs").listeners.input();
  check("30,000 subs: beyond-tier rows refuse to guess", /not verified this high/.test(out.innerHTML));
  check("30,000 subs: beehiiv verified $96 tier shown", /\$96/.test(out.innerHTML));
  check("no crash on DOMContentLoaded", true);
} catch (e) {
  check("no crash on DOMContentLoaded", false, e.constructor.name + ": " + e.message);
}

console.log(failures === 0 ? "\nLIVE MAIN FLOW: WORKING" : `\nLIVE MAIN FLOW: ${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
