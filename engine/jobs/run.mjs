// Driftmotor job runner. Usage: node engine/jobs/run.mjs <task-name>
// Tasks: check-links | site-qa | kpi-snapshot | heartbeat | all
// Every task is idempotent and respects the kill switch.
import { assertKillSwitchOff, log, appendJsonl, today } from "../lib/util.mjs";
import { checkRegistry, validateOutboundUrl } from "../lib/links.mjs";
import { runSiteQa } from "../lib/site.mjs";
import { readJson, writeJson } from "../lib/util.mjs";
import { enqueue, claimNext, complete, failOrDeadLetter, stats } from "../lib/queue.mjs";

const TASKS = {
  "check-links": async () => {
    const res = checkRegistry();
    if (!res.ok) throw new Error(res.errors.join("; "));
    // Self-test the URL validator against every registry source URL
    const reg = readJson("state/link-registry.json", { programs: [] });
    for (const p of reg.programs) {
      const v = validateOutboundUrl(p.source);
      if (!v.ok) throw new Error(`registry source URL rejected: ${p.source} (${v.reason})`);
    }
    return "registry and source URLs OK";
  },

  "site-qa": async () => {
    const res = runSiteQa();
    if (!res.ok) throw new Error(res.errors.join("; "));
    return `site QA OK (${res.checked} pages, ${res.warnings.length} warnings)`;
  },

  "kpi-snapshot": async () => {
    // Aggregate, non-identifying snapshot. Cost is always recorded; it must stay 0.
    const reg = readJson("state/link-registry.json", { programs: [] });
    const livePrograms = reg.programs.filter((p) => p.status === "verified-live").length;
    appendJsonl("state/kpis.jsonl", {
      kpi: "registry_programs_tracked",
      value: reg.programs.length
    });
    appendJsonl("state/kpis.jsonl", {
      kpi: "programs_live",
      value: livePrograms
    });
    appendJsonl("state/kpis.jsonl", {
      kpi: "cost_sek",
      value: 0,
      note: "hard budget rule"
    });
    return "KPI snapshot appended";
  },

  heartbeat: async () => {
    writeJson("state/heartbeat.json", {
      lastRun: new Date().toISOString(),
      date: today(),
      queue: stats()
    });
    return "heartbeat written";
  }
};

export async function runTask(name) {
  assertKillSwitchOff();
  if (!TASKS[name]) throw new Error(`unknown task: ${name}`);
  const t0 = Date.now();
  try {
    const result = await TASKS[name]();
    log(name, "INFO", `${result} (${Date.now() - t0}ms)`);
    return { ok: true, result };
  } catch (e) {
    log(name, "ERROR", e.message);
    throw e;
  }
}

// Queue-driven entry: process one queued job if present, else run all maintenance tasks.
export async function processQueue() {
  assertKillSwitchOff();
  const job = claimNext();
  if (!job) return { processed: false };
  try {
    await runTask(job.task);
    complete(job.id);
    return { processed: true, id: job.id };
  } catch (e) {
    failOrDeadLetter(job, e);
    throw e;
  }
}

// CLI entry
const arg = process.argv[2];
if (arg === "--queue") {
  enqueueMaintenance();
  processQueue()
    .then((r) => console.log(JSON.stringify(r)))
    .catch((e) => {
      console.error(e.message);
      process.exit(1);
    });
} else if (arg === "all" || !arg) {
  // "all": enqueue (idempotent per day) then drain the queue by priority.
  enqueueMaintenance();
  (async () => {
    let processed = 0;
    while (true) {
      let r;
      try {
        r = await processQueue();
      } catch (e) {
        // failed job was already retried/dead-lettered by processQueue; continue draining
        processed++;
        continue;
      }
      if (!r.processed) break;
      processed++;
    }
    console.log(JSON.stringify({ ok: true, processed, queue: stats() }));
  })().catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
} else {
  runTask(arg)
    .then((r) => console.log(JSON.stringify(r)))
    .catch((e) => {
      console.error(e.message);
      process.exit(1);
    });
}

function enqueueMaintenance() {
  const order = [
    ["check-links", 90],
    ["site-qa", 80],
    ["kpi-snapshot", 60],
    ["heartbeat", 10]
  ];
  for (const [task, priority] of order) {
    enqueue(task, {
      priority,
      idempotencyKey: `${task}:${today()}`
    });
  }
}
