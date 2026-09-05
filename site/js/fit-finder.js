/* SoloBookingLab Fit Finder — rule-based recommendation engine.
 * No LLM, no black-box scoring: every recommendation is explained by the visible rules below.
 * HARD DATA RULES:
 *  - capabilities are recorded ONLY with a verification label: "vendor" (vendor's own page,
 *    date), "third-party" (named source, date), or "unknown" (we do not know). We NEVER invent
 *    features, prices or savings. "unknown" is displayed as unknown.
 *  - commission availability never affects ordering: products WITHOUT an affiliate program
 *    (Square, Fresha, Calendly) rank on merit under the same rules.
 * Events for measurement (privacy-friendly, no cookies): fit_finder_started,
 * fit_finder_completed, recommendation_viewed, affiliate_click — dispatched on
 * document as CustomEvent('sbl:event'). No data leaves the browser until an affiliate link
 * (which carries only the program's own tracking parameters) is clicked.
 */
const DATA_VERIFIED = "2026-09-05";

/* Capabilities legend per tool:
 * v = vendor page (with date) | t = third-party (named) | u = unknown/not yet verified */
const TOOLS = {
  simplybook_me: {
    name: "SimplyBook.me",
    role: "scheduler",
    url: "https://simplybook.me/en/pricing",
    affiliate: { available: true, program: "https://simplybook.me/en/affiliate-program", terms: "25% of first payment + 15% of subsequent payments up to 24 months; instant access [vendor 2026-09-05]" },
    pricing: "Free: 50 bookings/mo, 1 custom feature. Basic EUR 13.9/mo (100 bookings). Standard EUR 29.9/mo (500). Premium EUR 59.9/mo (2,000). [vendor 2026-09-05]",
    caps: {
      solo_ok: { v: "Free/Basic plans include 1 provider; more on higher plans [vendor 2026-09-05]" },
      intake_address: { v: "Custom fields / custom features collect client details; count-limited per plan [vendor 2026-09-05]" },
      geo_areas: { u: "not verified" },
      variable_duration: { u: "not verified" },
      deposits: { u: "not verified" },
      recurring: { u: "not verified" },
      sms_reminders: { u: "vendor advertises notifications; plan/SMS-add-on gating not verified" },
      previsit_forms: { v: "custom features system [vendor 2026-09-05]" },
      online_payment: { v: "Payments PRO at Premium; lower-plan payment support not verified [vendor 2026-09-05]" },
      travel_buffer: { u: "not verified" },
      free_plan: { v: "yes - 50 bookings/mo [vendor 2026-09-05]" }
    }
  },
  square_appointments: {
    name: "Square Appointments",
    role: "scheduler",
    url: "https://squareup.com/us/en/appointments/pricing",
    affiliate: { available: false },
    pricing: "Free for solo (one location); Plus $49/mo (location-based). [vendor 2026-09-05]",
    caps: {
      solo_ok: { v: "Free plan explicitly for solo professionals [vendor 2026-09-05]" },
      intake_address: { u: "client detail fields not verified in docs we fetched" },
      geo_areas: { u: "not verified" },
      variable_duration: { u: "not verified" },
      deposits: { v: "deposits supported (fixed amount or %) [vendor help 2026-09-05]; plan-gating unclear: a third-party source says deposits/no-show protection require Plus [third-party 2026-09-05]" },
      noshow_protection: { v: "card-held no-show protection exists [vendor help 2026-09-05]; plan-gating unclear (same conflict as deposits)" },
      recurring: { u: "not verified" },
      sms_reminders: { u: "reminders exist; SMS vs email and plan gating not verified" },
      previsit_forms: { u: "not verified" },
      online_payment: { v: "payments core to Square [vendor 2026-09-05]; processing fees apply [third-party 2026-09-05]" },
      travel_buffer: { u: "not verified" },
      free_plan: { v: "yes - solo, one location [vendor 2026-09-05]" }
    }
  },
  trafft: {
    name: "Trafft",
    role: "scheduler",
    url: "https://trafft.com/pricing/",
    affiliate: { available: true, program: "https://trafft.com/affiliate/", terms: "30% recurring, 400-day cookie [vendor 2026-09-05]; review-gated - NOT applied yet per plan" },
    pricing: "Forever-free plan exists; paid tiers from Professional upward. [vendor 2026-09-05]",
    caps: {
      solo_ok: { v: "free plan aimed at solo professionals [vendor 2026-09-05]" },
      intake_address: { u: "custom fields not verified" },
      geo_areas: { u: "not verified" },
      variable_duration: { u: "not verified" },
      deposits: { v: "per-service deposit value configurable [vendor blog 2026-09-05]" },
      recurring: { u: "not verified" },
      sms_reminders: { u: "automated notifications exist; SMS add-on gating not verified" },
      previsit_forms: { u: "not verified" },
      online_payment: { v: "multiple payment methods on paid plans [vendor pricing 2026-09-05]" },
      travel_buffer: { u: "not verified" },
      free_plan: { v: "yes - forever-free [vendor 2026-09-05]" }
    }
  },
  fresha: {
    name: "Fresha",
    role: "scheduler",
    url: "https://www.fresha.com/pricing",
    affiliate: { available: false },
    pricing: "No free plan (7-day trial); subscription per bookable team member, e.g. $19.95/mo independent tier. [vendor 2026-09-05]",
    caps: {
      solo_ok: { v: "independent tier exists [vendor 2026-09-05]" },
      intake_address: { u: "not verified" },
      geo_areas: { u: "not verified" },
      variable_duration: { u: "not verified" },
      deposits: { u: "not verified" },
      recurring: { u: "not verified" },
      sms_reminders: { u: "not verified" },
      previsit_forms: { u: "not verified" },
      online_payment: { u: "card rates apply; details not verified" },
      travel_buffer: { u: "not verified" },
      free_plan: { v: "no - trial only [vendor 2026-09-05]" }
    }
  },
  calendly: {
    name: "Calendly",
    role: "scheduler",
    url: "https://calendly.com/pricing",
    affiliate: { available: false },
    pricing: "Free: 1 event type, 1 calendar connection. Paid from ~$10-12/seat/mo. [vendor 2026-09-05]",
    caps: {
      solo_ok: { v: "free plan is one-on-one scheduling [vendor 2026-09-05]" },
      intake_address: { u: "not verified" },
      geo_areas: { u: "not verified" },
      variable_duration: { u: "not verified" },
      deposits: { u: "not verified" },
      recurring: { u: "not verified" },
      sms_reminders: { u: "not verified" },
      previsit_forms: { u: "not verified" },
      online_payment: { u: "not verified" },
      travel_buffer: { u: "not verified" },
      free_plan: { v: "yes - 1 event type [vendor 2026-09-05]" }
    }
  },
  jotform: {
    name: "Jotform",
    role: "intake-addon",
    url: "https://www.jotform.com/partnership/affiliate/",
    affiliate: { available: true, program: "https://www.jotform.com/partnership/affiliate/", terms: "30% on new paid users, one-year recurring per vendor blog [vendor 2026-09-05]; cookie 60d [third-party 2026-09-05]" },
    pricing: "Free plan exists; paid plans for higher submissions. [vendor 2026-09-05 - limits not verified]",
    caps: {
      intake_address: { v: "forms with payment integrations; core product [vendor 2026-09-05]" },
      previsit_forms: { v: "core product [vendor 2026-09-05]" },
      online_payment: { v: "form payment integrations [vendor 2026-09-05]" },
      solo_ok: { v: "individual plans [vendor 2026-09-05]" }
    }
  },
  formaloo: {
    name: "Formaloo",
    role: "intake-addon",
    url: "https://www.formaloo.com/affiliate-program",
    affiliate: { available: true, program: "https://www.formaloo.com/affiliate-program", terms: "25-40% lifetime commission [vendor 2026-09-05]" },
    pricing: "free tier exists [vendor 2026-09-05 - limits not verified]",
    caps: {
      intake_address: { v: "forms/databases core product [vendor 2026-09-05]" },
      previsit_forms: { v: "core product [vendor 2026-09-05]" },
      solo_ok: { v: "individual use supported [vendor 2026-09-05]" }
    }
  },
  make: { name: "Make", role: "automation-addon", url: "https://www.make.com/en/pricing", affiliate: { available: false }, pricing: "free tier exists [not re-verified 2026-09-05]", caps: {} },
  pabbly_connect: { name: "Pabbly Connect", role: "automation-addon", url: "https://www.pabbly.com/connect/", affiliate: { available: true, program: "https://www.pabbly.com/affiliates/", terms: "30% lifetime recurring [vendor 2026-09-04]" }, pricing: "free tier + paid [limits not re-verified 2026-09-05]", caps: {} }
};

/* Visible rules: each answer combination creates needs; needs map to requirements.
 * This array is rendered on the results page so the user sees exactly why. */
const NEED_RULES = [
  { id: "solo", label: "works alone", question: "solo" },
  { id: "mobile", label: "mobile service at client locations", question: "mobile" },
  { id: "intake_address", label: "collect client address + job details before the visit", question: "address" },
  { id: "geo_areas", label: "define geographic service areas", question: "geo" },
  { id: "variable_duration", label: "handle services that vary in length", question: "duration" },
  { id: "deposits", label: "take deposits to deter no-shows", question: "deposit" },
  { id: "recurring", label: "recurring bookings", question: "recurring" },
  { id: "sms_reminders", label: "SMS reminders", question: "sms" },
  { id: "previsit_forms", label: "forms before the visit", question: "forms" },
  { id: "online_payment", label: "take payment online", question: "pay" },
  { id: "travel_buffer", label: "travel-time buffer between jobs", question: "buffer" }
];

function emit(name, detail) {
  try { document.dispatchEvent(new CustomEvent("sbl:event", { detail: Object.assign({ event: name }, detail || {}) })); } catch (e) {}
}

function readAnswers() {
  const g = (id) => {
    const el = document.querySelector('input[name="' + id + '"]:checked');
    return el ? el.value : null;
  };
  return {
    solo: g("solo"), mobile: g("mobile"), address: g("address"), geo: g("geo"),
    duration: g("duration"), deposit: g("deposit"), recurring: g("recurring"),
    sms: g("sms"), forms: g("forms"), pay: g("pay"), buffer: g("buffer"), budget: g("budget")
  };
}

function deriveNeeds(a) {
  const needs = [];
  for (const r of NEED_RULES) if (a[r.question] === "yes") needs.push(r.id);
  return needs;
}

/* capability check: "yes" verified | "paid" vendor shows it behind a paid plan | "unknown" | "no" */
function capStatus(tool, need) {
  const CAP = {
    solo_ok: null, mobile: null, intake_address: "intake_address", geo_areas: "geo_areas",
    variable_duration: "variable_duration", deposits: "deposits", recurring: "recurring",
    sms_reminders: "sms_reminders", previsit_forms: "previsit_forms",
    online_payment: "online_payment", travel_buffer: "travel_buffer"
  };
  const key = CAP[need];
  if (!key || !tool.caps[key]) return "unknown";
  const txt = tool.caps[key].v || tool.caps[key].u || "";
  if (tool.caps[key].v) {
    if (/not verified|unclear|unknown/i.test(txt)) return "unknown";
    if (/higher|paid|premium|professional|plus|plan-gating/i.test(txt)) return "paid";
    return "yes";
  }
  return "unknown";
}

function budgetOk(tool, budget) {
  if (budget === "free") {
    const fp = tool.caps.free_plan;
    if (!fp) return { ok: false, why: "free-plan status unknown" };
    return { ok: /yes/i.test(fp.v || ""), why: fp.v || "unknown" };
  }
  if (budget === "low") {
    const txt = (tool.pricing || "").toLowerCase();
    if (/free/.test(txt)) return { ok: true, why: "free plan exists" };
    const m = txt.match(/(eur|\$|€)\s?([0-9.]+)/);
    if (m) {
      const n = parseFloat(m[2]);
      return { ok: n <= 25, why: "listed price " + m[0] + "/mo" };
    }
    return { ok: false, why: "price unknown to us" };
  }
  return { ok: true, why: "budget flexible" };
}

function scoreTools(needs, budget) {
  const schedulers = Object.values(TOOLS).filter((t) => t.role === "scheduler");
  return schedulers.map((t) => {
    const met = [], unverified = [], paid = [];
    for (const n of needs) {
      const s = capStatus(t, n);
      if (s === "yes") met.push(n);
      else if (s === "paid") paid.push(n);
      else unverified.push(n);
    }
    const b = budgetOk(t, budget);
    const unknownPenalty = unverified.length * 2 + paid.length;
    return { tool: t, met, unverified, paid, budget: b, score: met.length * 10 - unknownPenalty + (b.ok ? 5 : -15) };
  }).sort((a, b2) => b2.score - a.score);
}

function esc(s) { return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
function label(id) { const r = NEED_RULES.find((x) => x.id === id); return r ? r.label : id; }

function render() {
  const a = readAnswers();
  if (!a.mobile) return; // nothing answered yet
  const needs = deriveNeeds(a);
  const ranked = scoreTools(needs, a.budget || "flexible");
  const out = document.getElementById("sbl-out");
  if (!out) return;

  const needLine = needs.length ? needs.map(label).join("; ") : "no special requirements marked";
  let html = '<h3 class="sbl-result-title">Your requirements (from your answers)</h3><p>You need a stack that can: ' +
    esc(needLine) + '. Budget: ' + esc(a.budget || "not stated") + '.</p>';

  html += '<h3 class="sbl-result-title">Suggested starting point</h3>';
  const top = ranked[0], t = top.tool;
  html += "<p><strong>" + esc(t.name) + "</strong> — suggested as the first scheduler to trial. Why: " +
    (top.met.length ? "meets " + top.met.map(label).join(", ") : "fewest unverified gaps for your answers") +
    (top.paid.length ? ". Note: may require a paid plan for " + top.paid.map(label).join(", ") + " (vendor docs)" : "") +
    (top.unverified.length ? ". We have NOT yet verified: " + top.unverified.map(label).join(", ") + " — check these during your trial." : "") +
    ". Budget check: " + esc(top.budget.why) + ".</p>";

  html += '<h3 class="sbl-result-title">All schedulers checked against your answers</h3><table><tr><th>Scheduler</th><th>Meets</th><th>Needs paid plan (vendor)</th><th>Not verified by us</th><th>Free plan?</th></tr>';
  for (const r of ranked) {
    html += "<tr><td>" + esc(r.tool.name) + "</td><td>" + (r.met.map(label).join(", ") || "—") +
      "</td><td>" + (r.paid.map(label).join(", ") || "—") +
      "</td><td>" + (r.unverified.map(label).join(", ") || "—") +
      "</td><td>" + esc((r.tool.caps.free_plan && (r.tool.caps.free_plan.v || r.tool.caps.free_plan.u) || "unknown")) + "</td></tr>";
  }
  html += "</table>";

  const intakeNeed = needs.includes("intake_address") || needs.includes("previsit_forms");
  if (intakeNeed) {
    html += '<h3 class="sbl-result-title">Intake add-on (if the scheduler cannot do it)</h3>';
    html += "<p>If your trial shows the scheduler cannot collect address/job details the way you need, pair it with a form tool: <strong>Jotform</strong> or <strong>Formaloo</strong> (both have free tiers — limits not verified by us). Check the scheduler first; fewer tools beats more tools.</p>";
  }
  html += '<h3 class="sbl-result-title">Automation add-on</h3>';
  html += "<p>If you end up gluing tools together (for example form → booking → SMS), <strong>Make</strong> or <strong>Pabbly Connect</strong> are the standard no-code options. Only add automation after your booking flow works manually.</p>";

  html += '<p class="note">How to read this: "Meets" = verified in vendor\'s own material (dates on the method page). ' +
    '"Needs paid plan" = vendor material shows it behind a paid tier. "Not verified by us" = we could not confirm — treat as an open question for your trial, not as a feature. ' +
    'Ranking is rule-based and never influenced by commissions; products without affiliate programs are listed on merit. Data verified ' + DATA_VERIFIED + '. ' +
    'Sources and test protocol: <a href="method.html">method</a>.</p>';

  out.innerHTML = html;
  out.setAttribute("data-computed", "true");
  emit("recommendation_viewed", { top: t.name, needs: needs.join("|") });
  emit("fit_finder_completed", { top: t.name, needs: needs.join("|"), budget: a.budget || "unset" });
}

function onFirstInteraction() {
  emit("fit_finder_started", {});
  document.removeEventListener("change", onFirstInteraction);
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("sbl-form");
  if (!form) return;
  document.addEventListener("change", onFirstInteraction);
  form.addEventListener("submit", (e) => { e.preventDefault(); render(); });
  // affiliate click measurement (links go live only when programs are connected)
  document.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest("a[data-sbl-affiliate]");
    if (a) emit("affiliate_click", { program: a.getAttribute("data-sbl-affiliate"), href: a.href });
  });
  render();
});
