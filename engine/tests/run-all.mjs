// Test suite for the driftmotor and site. Run: node engine/tests/run-all.mjs
// Exit code 0 = all green. No third-party deps (node:test).
import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import vm from "node:vm";
import { mkdtempSync, writeFileSync, mkdirSync, rmSync, existsSync, readdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ENGINE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

let passed = 0;
let failed = 0;
const failures = [];

async function run(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`  ok  ${name}`);
  } catch (e) {
    failed++;
    failures.push({ name, error: e.message });
    console.error(`FAIL  ${name}\n      ${e.message}`);
  }
}

// ---------- queue unit tests (on an isolated temp copy) ----------
await run("queue: idempotency, lease, dead-letter", async () => {
  const dir = mkdtempSync(path.join(tmpdir(), "dm-test-"));
  // isolate queue file by pointing ROOT at temp via a copied mini-state
  const stateDir = path.join(dir, "state");
  mkdirSync(stateDir);
  writeFileSync(path.join(stateDir, "queue.json"), JSON.stringify({ jobs: [], deadLetter: [], seq: 1 }));

  // Load module fresh with a patched ROOT via query-string cache trick is complex;
  // instead exercise the real queue against the real state dir but with a test key prefix,
  // then clean up afterwards.
  const { enqueue, claimNext, complete, failOrDeadLetter, stats } = await import("../lib/queue.mjs");
  const key = `test-${Date.now()}`;
  const a = enqueue("heartbeat", { priority: 10, idempotencyKey: key });
  const b = enqueue("heartbeat", { priority: 10, idempotencyKey: key });
  assert.equal(a.queued, true);
  assert.equal(b.queued, false, "duplicate enqueue must be rejected");

  const job = claimNext();
  assert.ok(job, "a job must be claimable");
  assert.equal(job.idempotencyKey, key);
  complete(job.id);

  // dead-letter path
  const j2 = claimNext();
  if (j2) {
    j2.attempts = 3;
    failOrDeadLetter(j2, "boom");
    assert.equal(stats().dead >= 1, true, "should be dead-lettered after max attempts");
  }

  // cleanup: remove test artifacts from real queue file
  const { readJson, writeJson } = await import("../lib/util.mjs");
  const q = readJson("state/queue.json", { jobs: [], deadLetter: [] });
  q.jobs = (q.jobs || []).filter((j) => !String(j.idempotencyKey || "").startsWith("test-"));
  q.deadLetter = (q.deadLetter || []).filter((j) => !String(j.idempotencyKey || "").startsWith("test-"));
  writeJson("state/queue.json", q);
  rmSync(dir, { recursive: true, force: true });
});

// ---------- link validator ----------
await run("links: registry freshness + allowlist", async () => {
  const { checkRegistry, validateOutboundUrl } = await import("../lib/links.mjs");
  const reg = checkRegistry();
  assert.equal(reg.ok, true, `registry check failed: ${reg.errors.join("; ")}`);
  assert.equal(validateOutboundUrl("https://kit.com/affiliate").ok, true);
  assert.equal(validateOutboundUrl("http://kit.com/affiliate").ok, false, "http must be rejected");
  assert.equal(validateOutboundUrl("https://evil.example.com/x").ok, false, "unknown host must be rejected");
  assert.equal(validateOutboundUrl("not a url").ok, false);
});

// ---------- site QA ----------
await run("site: QA passes on shipped pages", async () => {
  const { runSiteQa } = await import("../lib/site.mjs");
  const res = runSiteQa();
  assert.equal(res.ok, true, `site QA failed: ${res.errors.join("; ")}`);
  assert.ok(res.checked >= 6, "should check at least 6 pages");
});

// ---------- fit finder interaction (regression class from the 2026-09-05 calculator crash) ----------
await run("fit-finder: interaction test - binds only existing ids, renders rule-based result, emits events", async () => {
  const html = readFileSync(path.join(ENGINE_ROOT, "site", "fit-finder.html"), "utf8");
  const js = readFileSync(path.join(ENGINE_ROOT, "site", "js", "fit-finder.js"), "utf8");

  // Every id the script binds must exist as a static id in the page (the crash class).
  const boundIds = [...js.matchAll(/getElementById\("([^"]+)"\)/g)].map((m) => m[1]);
  const staticIds = [...html.matchAll(/id="([^"]+)"/g)].map((m) => m[1]);
  for (const id of new Set(boundIds)) {
    assert.ok(staticIds.includes(id), `fit-finder.html must contain id="${id}" (script binds it)`);
  }

  // Old URL must redirect, not 404: calculator.html -> fit-finder.html, noindex.
  const calc = readFileSync(path.join(ENGINE_ROOT, "site", "calculator.html"), "utf8");
  assert.match(calc, /http-equiv="refresh"/);
  assert.match(calc, /url=fit-finder\.html/);
  assert.match(calc, /noindex/);

  // Run the real script against an emulated DOM: submit -> result + events.
  const events = [];
  const els = new Map();
  for (const id of staticIds) {
    els.set(id, { innerHTML: "", attrs: {}, listeners: {}, setAttribute(k, v) { this.attrs[k] = v; }, addEventListener(ev, fn) { this.listeners[ev] = fn; } });
  }
  const docListeners = {};
  const document = {
    getElementById: (id) => els.get(id) || null,
    querySelector: (sel) => ({ value: /budget/.test(sel) ? "low" : "yes" }),
    addEventListener: (ev, fn) => { (docListeners[ev] = docListeners[ev] || []).push(fn); },
    removeEventListener: () => {},
    dispatchEvent: (e) => { events.push(e.detail && e.detail.event); return true; }
  };
  class CustomEvent { constructor(type, opts) { this.type = type; this.detail = opts && opts.detail; } }
  new vm.Script(js, { filename: "fit-finder.js" }).runInNewContext({ document, CustomEvent });
  assert.ok(docListeners.DOMContentLoaded, "script must register DOMContentLoaded handler");
  for (const fn of docListeners.DOMContentLoaded) fn();
  // simulate the user's first interaction (fires fit_finder_started)
  for (const fn of docListeners.change || []) fn();

  const form = els.get("sbl-form");
  assert.ok(form.listeners.submit, "submit handler must be bound");
  form.listeners.submit({ preventDefault() {} });

  const out = els.get("sbl-out");
  assert.match(out.innerHTML, /Suggested starting point/, "result must render");
  assert.match(out.innerHTML, /<table>/, "comparison table must render");
  assert.match(out.innerHTML, /SimplyBook\.me/, "verified schedulers must appear");
  assert.match(out.innerHTML, /not verified/, "unverified points must be labeled as such");
  assert.equal(out.attrs["data-computed"], "true");
  assert.ok(events.includes("fit_finder_started"), "start event must fire");
  assert.ok(events.includes("recommendation_viewed"), "recommendation event must fire");
  assert.ok(events.includes("fit_finder_completed"), "completion event must fire");
});

// ---------- base-path safety (regression: GitHub Pages serves under /solobookinglab/) ----------
await run("site: no root-relative href/src anywhere (GitHub Pages project base path)", async () => {
  const siteDir = path.join(ENGINE_ROOT, "site");
  const offenders = [];
  const scan = (rel, content) => {
    for (const m of content.matchAll(/(?:href|src)="\/([^"/]*)"/g)) {
      offenders.push(`${rel}: root-relative "/${m[1]}" breaks under /solobookinglab/ base path`);
    }
  };
  for (const f of readdirSync(siteDir).filter((f) => f.endsWith(".html"))) {
    scan(f, readFileSync(path.join(siteDir, f), "utf8"));
  }
  const jsDir = path.join(siteDir, "js");
  for (const f of readdirSync(jsDir)) scan("js/" + f, readFileSync(path.join(jsDir, f), "utf8"));
  assert.deepEqual(offenders, []);
});

// ---------- full driftmotor dry run ----------
await run("driftmotor: full run exits 0 (kill switch off)", async () => {
  const out = execFileSync("node", ["engine/jobs/run.mjs", "all"], {
    cwd: ENGINE_ROOT,
    encoding: "utf8",
    env: { ...process.env, DM_VERBOSE: "0" },
    timeout: 60000
  });
  assert.match(out, /"ok":true/);
  assert.equal(existsSync(path.join(ENGINE_ROOT, "state", "heartbeat.json")), true, "heartbeat must exist");
});

// ---------- summary ----------
console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  for (const f of failures) console.error(`- ${f.name}: ${f.error}`);
  process.exit(1);
}
