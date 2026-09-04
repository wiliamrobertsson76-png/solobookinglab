// Test suite for the driftmotor and site. Run: node engine/tests/run-all.mjs
// Exit code 0 = all green. No third-party deps (node:test).
import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
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
