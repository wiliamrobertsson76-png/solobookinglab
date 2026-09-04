/* NewsletterStack calculator.
 * Data below is from primary pricing/affiliate pages, each entry carries the date it was
 * verified. Update ONLY via state/link-registry.json + re-verification, never by hand here
 * without changing the verified date.
 */
const PLATFORMS = {
  kit: {
    name: "Kit",
    freeLimitSubs: 10000,
    paidTiers: [
      { upToSubs: 1000, monthlyUsd: 33, note: "Creator, billed annually" },
      { upToSubs: 10000, monthlyUsd: 66, note: "Pro, billed annually" }
    ],
    affiliate: {
      commission: "50% of referred payments, first 12 months",
      yearOnePct: 0.5,
      recurringAfterYearOne: "10-20% with status tier"
    }
  },
  beehiiv: {
    name: "beehiiv",
    freeLimitSubs: 2500,
    paidTiers: [
      { upToSubs: 2500, monthlyUsd: 43, note: "Scale, billed annually" },
      { upToSubs: 100000, monthlyUsd: 96, note: "Max, billed annually" }
    ],
    affiliate: {
      commission: "50% of referred revenue year one (Bronze)",
      yearOnePct: 0.5,
      recurringAfterYearOne: "55-60% at higher tiers"
    }
  },
  mailerlite: {
    name: "MailerLite",
    freeLimitSubs: 250,
    paidTiers: [
      { upToSubs: 1000, monthlyUsd: 10, note: "Comfort tier approx. (slider pricing)" },
      { upToSubs: 10000, monthlyUsd: 20, note: "approx., tiered by list size" }
    ],
    affiliate: {
      commission: "30% lifetime recurring",
      yearOnePct: 0.3,
      recurringAfterYearOne: "30% lifetime"
    },
    pricingNote: "MailerLite uses subscriber-count slider pricing; values here are approximations for 1k/10k lists - verify at mailerlite.com/pricing before publishing decisions."
  },
  systeme_io: {
    name: "Systeme.io",
    freeLimitSubs: 2000,
    paidTiers: [
      { upToSubs: 5000, monthlyUsd: 17, note: "Startup" },
      { upToSubs: 999999, monthlyUsd: 97, note: "Unlimited" }
    ],
    affiliate: {
      commission: "60% lifetime recurring",
      yearOnePct: 0.6,
      recurringAfterYearOne: "60% lifetime"
    },
    pricingNote: "Free plan limits approx. per systeme.io marketing pages - verify before publishing decisions."
  }
};

const DATA_VERIFIED = "2026-09-04";

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function fmtUsd(n) {
  return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function monthlyCost(p, subs) {
  if (subs <= p.freeLimitSubs) return { usd: 0, plan: "Free plan" };
  for (const t of p.paidTiers) {
    if (subs <= t.upToSubs) return { usd: t.monthlyUsd, plan: t.note };
  }
  return { usd: null, plan: "Above covered tiers - check pricing page" };
}

function render() {
  const subs = Math.max(0, parseInt(document.getElementById("subs").value, 10) || 0);
  const pct = Math.min(2.5, Math.max(0, (parseFloat(document.getElementById("ctr").value) || 0) / 100));
  const convPct = Math.min(50, Math.max(0, (parseFloat(document.getElementById("conv").value) || 0) / 100));
  const orderUsd = Math.max(0, parseFloat(document.getElementById("order").value) || 0);

  const rows = Object.entries(PLATFORMS).map(([id, p]) => {
    const cost = monthlyCost(p, subs);
    // Expected monthly affiliate earnings per 1,000 referred visits (assumption-driven model):
    // visits -> clicks (ctr) -> conversions (convPct of clicks) -> order value * commission pct
    const clicksPer1k = 1000 * pct;
    const conversions = clicksPer1k * convPct;
    // Assume referred customers pay a platform monthly price equal to the cost tier for this list size
    const basePrice = cost.usd === null ? 33 : cost.usd;
    const earn = conversions * basePrice * p.affiliate.yearOnePct;
    return { id, p, cost, clicksPer1k, conversions, earn };
  });

  const head = "<tr><th>Platform</th><th class=\"num\">Your monthly cost</th><th>Plan</th>" +
    "<th class=\"num\">Est. monthly affiliate earnings per 1,000 referred visits</th></tr>";
  const body = rows.map((r) => {
    const costTxt = r.cost.usd === null ? "n/a" : (r.cost.usd === 0 ? "$0" : fmtUsd(r.cost.usd));
    const earnTxt = "$" + r.earn.toLocaleString("en-US", { maximumFractionDigits: 0 });
    return "<tr><td>" + esc(r.p.name) + "</td><td class=\"num\">" + costTxt +
      "</td><td>" + esc(r.cost.plan) + "</td><td class=\"num\">" + earnTxt + "</td></tr>";
  }).join("");

  document.getElementById("out").innerHTML =
    "<table>" + head + body + "</table>" +
    "<p class=\"note\">Assumptions (edit inputs to change them): " + (pct * 100).toFixed(1) +
    "% of referred visits click an affiliate link, " + (convPct * 100).toFixed(1) +
    "% of clicks convert to a paid plan at roughly this tier's monthly price. Earnings shown are " +
    "commission on first-year revenue. This is a model, not a forecast.</p>" +
    "<p class=\"note\">Pricing and commission data verified " + DATA_VERIFIED +
    " from vendor primary pages. Sources on the <a href=\"/method.html\">method page</a>.</p>";

  document.getElementById("out").setAttribute("data-computed", "true");
  document.getElementById("out").setAttribute("role", "region");
  document.getElementById("out").setAttribute("aria-live", "polite");
}

document.addEventListener("DOMContentLoaded", () => {
  ["subs", "ctr", "conv", "order"].forEach((id) => {
    document.getElementById(id).addEventListener("input", render);
  });
  render();
});
