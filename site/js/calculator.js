/* NewsletterStack platform cost calculator.
 * Answers ONE visitor question: "What does each newsletter platform cost at my list size?"
 * Affiliate economics are deliberately NOT modelled here (they answer a different question for
 * a different audience - publishers, not creators; see method.html for the policy).
 *
 * Data rules: every number below comes from the vendor's own pricing page, with the date it
 * was verified, recorded in state/link-registry.json. Update ONLY via that registry plus a new
 * verification date. Approximations (slider-priced vendors) are marked as such, never shown as
 * exact. If a list size is beyond the tiers we verified, we say so instead of guessing.
 */
const DATA_VERIFIED = "2026-09-04";

const PLATFORMS = {
  kit: {
    name: "Kit",
    url: "https://kit.com/pricing",
    freeLimitSubs: 10000,
    freeNote: "free up to 10,000 subscribers (1 email sequence, limited automations)",
    paidTiers: [
      { upToSubs: 1000, monthlyUsd: 33, note: "Creator plan, billed annually" },
      { upToSubs: 10000, monthlyUsd: 66, note: "Pro plan, billed annually" }
    ],
    pricingNote: "Paid prices are annual-billing rates for round subscriber counts; exact price is quoted by subscriber count on the vendor's slider."
  },
  beehiiv: {
    name: "beehiiv",
    url: "https://www.beehiiv.com/pricing",
    freeLimitSubs: 2500,
    freeNote: "Launch plan: free up to 2,500 subscribers (unlimited sends, limited features)",
    paidTiers: [
      { upToSubs: 2500, monthlyUsd: 43, note: "Scale plan, billed annually" },
      { upToSubs: 100000, monthlyUsd: 96, note: "Max plan, billed annually" }
    ],
    pricingNote: "Paid prices are annual-billing rates; Scale price shown at 2,500 subscribers on the vendor's calculator."
  },
  mailerlite: {
    name: "MailerLite",
    url: "https://www.mailerlite.com/pricing",
    freeLimitSubs: 250,
    freeNote: "free up to 250 subscribers (1,000 emails/month)",
    paidTiers: [
      { upToSubs: 1000, monthlyUsd: 10, note: "approx., Growing Business, billed annually" },
      { upToSubs: 10000, monthlyUsd: 20, note: "approx., tiered by subscriber count" }
    ],
    pricingNote: "Approximate values: MailerLite uses subscriber-slider pricing, so cost varies with your exact count. Verify on the vendor's page before deciding."
  },
  systeme_io: {
    name: "Systeme.io",
    url: "https://systeme.io/pricing",
    freeLimitSubs: 2000,
    freeNote: "free plan up to 2,000 contacts (limited emails and funnels)",
    paidTiers: [
      { upToSubs: 5000, monthlyUsd: 17, note: "Startup plan" },
      { upToSubs: 999999, monthlyUsd: 97, note: "Unlimited plan" }
    ],
    pricingNote: "Free-plan limits are per vendor marketing pages; confirm limits on the pricing page before relying on them."
  }
};

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function fmtUsd(n) {
  return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

/* Returns { usd: number|null, plan: string, approx: bool, free: bool }
 * usd === null means: beyond the tiers we have verified - we do NOT guess a price. */
function monthlyCost(p, subs) {
  if (subs <= p.freeLimitSubs) return { usd: 0, plan: "Free plan", approx: false, free: true };
  for (const t of p.paidTiers) {
    if (subs <= t.upToSubs) return { usd: t.monthlyUsd, plan: t.note, approx: /approx/.test(t.note), free: false };
  }
  return { usd: null, plan: "Beyond verified tiers", approx: false, free: false };
}

function render() {
  const subs = Math.max(0, parseInt(document.getElementById("subs").value, 10) || 0);

  const rows = Object.values(PLATFORMS).map((p) => ({ p, cost: monthlyCost(p, subs) }));

  const head = "<tr><th>Platform</th><th class=\"num\">Est. cost / month</th><th>Plan at " +
    subs.toLocaleString("en-US") + " subscribers</th><th>Free plan includes</th></tr>";

  const body = rows.map(({ p, cost }) => {
    let costTxt;
    if (cost.free) costTxt = "$0";
    else if (cost.usd === null) costTxt = "<a href=\"" + p.url + "\" rel=\"nofollow\">not verified this high - check vendor</a>";
    else costTxt = (cost.approx ? "~" : "") + fmtUsd(cost.usd) + (cost.approx ? " (approx.)" : "");
    return "<tr><td>" + esc(p.name) + "</td><td class=\"num\">" + costTxt +
      "</td><td>" + esc(cost.plan) + "</td><td>" + esc(p.freeNote) + "</td></tr>";
  }).join("");

  document.getElementById("out").innerHTML =
    "<table>" + head + body + "</table>" +
    "<p class=\"note\">Reading the result: \"$0\" means this list still fits the platform's free plan. " +
    "Prices marked approx. are approximations because the vendor prices by exact subscriber count. " +
    "Paid prices are annual-billing rates; paying monthly usually costs more.</p>" +
    "<p class=\"note\">Data verified " + DATA_VERIFIED + " from each vendor's own pricing page. " +
    "Vendors change prices without notice - confirm on the vendor's page before deciding. " +
    "Method, source list and how to dispute a number: <a href=\"method.html\">editorial method</a>.</p>";

  document.getElementById("out").setAttribute("data-computed", "true");
  document.getElementById("out").setAttribute("role", "region");
  document.getElementById("out").setAttribute("aria-live", "polite");
}

document.addEventListener("DOMContentLoaded", () => {
  const subs = document.getElementById("subs");
  if (!subs) return; // page without the input: nothing to do, no crash
  subs.addEventListener("input", render);
  render();
});
