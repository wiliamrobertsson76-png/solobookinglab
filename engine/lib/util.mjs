// Shared utilities for the driftmotor. No third-party dependencies.
import { readFileSync, writeFileSync, mkdirSync, appendFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
export const STATE_DIR = path.join(ROOT, "state");
export const LOGS_DIR = path.join(ROOT, "logs");

export function nowIso() {
  return new Date().toISOString();
}

export function today() {
  return nowIso().slice(0, 10);
}

export function readJson(relPath, fallback) {
  const abs = path.join(ROOT, relPath);
  if (!existsSync(abs)) return fallback;
  try {
    return JSON.parse(readFileSync(abs, "utf8"));
  } catch (e) {
    throw new Error(`Corrupt JSON at ${relPath}: ${e.message}`);
  }
}

export function writeJson(relPath, data) {
  const abs = path.join(ROOT, relPath);
  mkdirSync(path.dirname(abs), { recursive: true });
  const tmp = abs + ".tmp";
  writeFileSync(tmp, JSON.stringify(data, null, 2) + "\n", "utf8");
  writeFileSync(abs, JSON.stringify(data, null, 2) + "\n", "utf8");
}

export function appendJsonl(relPath, obj) {
  const abs = path.join(ROOT, relPath);
  mkdirSync(path.dirname(abs), { recursive: true });
  appendFileSync(abs, JSON.stringify({ ts: nowIso(), ...obj }) + "\n", "utf8");
}

export function log(jobId, level, message) {
  const line = `${nowIso()} [${level}] [${jobId}] ${message}`;
  appendJsonl("logs/driftmotor.jsonl", { jobId, level, message });
  if (process.env.DM_VERBOSE === "1") console.log(line);
}

// Guard: refuse to touch anything if the kill switch file exists.
export function assertKillSwitchOff() {
  if (existsSync(path.join(ROOT, "state", "KILL"))) {
    const err = new Error("KILL SWITCH ACTIVE: state/KILL exists. All motor actions halted.");
    err.killSwitch = true;
    throw err;
  }
}
