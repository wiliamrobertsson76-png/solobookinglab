// Persistent job queue with priority, lease/lock, idempotency keys, max attempts and dead-letter.
// Storage: state/queue.json. Idempotency: enqueue with the same key while a matching job exists
// is a no-op, so two runs never create duplicates.
import { readJson, writeJson, log, nowIso } from "./util.mjs";

const QUEUE_FILE = "state/queue.json";
const MAX_ATTEMPTS = 3;
const LEASE_MINUTES = 15;

function load() {
  return readJson(QUEUE_FILE, { jobs: [], deadLetter: [], seq: 1 });
}

function save(q) {
  writeJson(QUEUE_FILE, q);
}

export function enqueue(task, { priority = 50, idempotencyKey = null, payload = {} } = {}) {
  const q = load();
  if (idempotencyKey) {
    const exists =
      q.jobs.some((j) => j.idempotencyKey === idempotencyKey && j.status !== "done") ||
      q.deadLetter.some((j) => j.idempotencyKey === idempotencyKey);
    if (exists) return { queued: false, reason: "idempotent-duplicate" };
  }
  const job = {
    id: q.seq++,
    task,
    priority,
    idempotencyKey,
    payload,
    status: "pending",
    attempts: 0,
    createdAt: nowIso()
  };
  q.jobs.push(job);
  save(q);
  return { queued: true, id: job.id };
}

export function claimNext() {
  const q = load();
  const now = Date.now();
  const ready = q.jobs
    .filter((j) => j.status === "pending" || (j.status === "leased" && now - new Date(j.leasedAt).getTime() > LEASE_MINUTES * 60000))
    .sort((a, b) => b.priority - a.priority || new Date(a.createdAt) - new Date(b.createdAt));
  if (ready.length === 0) return null;
  const job = ready[0];
  job.status = "leased";
  job.leasedAt = nowIso();
  job.attempts += 1;
  save(q);
  return job;
}

export function complete(id) {
  const q = load();
  q.jobs = q.jobs.filter((j) => j.id !== id);
  save(q);
}

export function failOrDeadLetter(job, error) {
  const q = load();
  q.jobs = q.jobs.filter((j) => j.id !== job.id);
  if (job.attempts >= MAX_ATTEMPTS) {
    q.deadLetter.push({ ...job, status: "dead", error: String(error), diedAt: nowIso() });
    log(job.id, "ERROR", `job dead-lettered: ${error}`);
  } else {
    job.status = "pending";
    job.lastError = String(error);
    q.jobs.push(job);
    log(job.id, "WARN", `job retry scheduled (attempt ${job.attempts}): ${error}`);
  }
  save(q);
}

export function stats() {
  const q = load();
  return {
    pending: q.jobs.filter((j) => j.status === "pending").length,
    leased: q.jobs.filter((j) => j.status === "leased").length,
    dead: q.deadLetter.length
  };
}
