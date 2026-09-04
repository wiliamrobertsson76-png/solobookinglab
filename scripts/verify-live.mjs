// One-off: wait for deploy-site workflow, then verify all live pages. Safe to delete.
const B = "https://api.github.com/repos/wiliamrobertsson76-png/newsletterstack/actions/runs?per_page=5";
(async () => {
  for (let i = 0; i < 10; i++) {
    const j = await fetch(B, { headers: { "User-Agent": "newsletterstack-check" } }).then((r) => r.json());
    const dep = (j.workflow_runs || []).filter((w) => w.name === "deploy-site");
    if (dep.length) {
      console.log("deploy-site:", dep[0].status, dep[0].conclusion || "");
      if (dep[0].status === "completed") break;
    } else {
      console.log("no deploy-site run yet, attempt", i);
    }
    await new Promise((r) => setTimeout(r, 15000));
  }
  const base = "https://wiliamrobertsson76-png.github.io/newsletterstack/";
  const pages = ["", "calculator.html", "method.html", "about.html", "contact.html", "privacy.html", "terms.html", "robots.txt", "sitemap.xml", "llms.txt"];
  for (const p of pages) {
    const r = await fetch(base + p);
    console.log(r.status, "/" + p);
  }
})();
