(function () {
  const stage = window.STAGE_ID;
  const week = window.WEEK_ID;
  if (!stage || !week) {
    console.error("Missing STAGE_ID or WEEK_ID");
    return;
  }

  const key = `progress:${stage}:${week}`;

  // Demo: show a small banner so you know shared assets loaded
  const banner = document.createElement("div");
  banner.style.cssText = "position:fixed;bottom:14px;right:14px;background:#111a2e;color:#cfe1ff;padding:10px 12px;border-radius:12px;font-size:12px;opacity:.95";
  banner.textContent = `Loaded: ${stage}/${week} • key=${key}`;
  document.body.appendChild(banner);

  // Example local save/load (you’ll wire this to your existing UI or later API)
  window.saveLocalProgress = (data) => localStorage.setItem(key, JSON.stringify(data));
  window.loadLocalProgress = () => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  };
})();

// ---- Cloudflare Worker (Phase A: public KV) helpers ----
window.cloudSave = async function ({ stage, week, data }) {
  const base = window.APP_CONFIG?.API_URL;
  if (!base) throw new Error("Missing API_URL in assets/config.js");

  const res = await fetch(`${base}/progress`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stage, week, data }),
  });

  if (!res.ok) throw new Error(`Save failed: ${res.status}`);
  return res.json();
};

window.cloudLoad = async function ({ stage, week }) {
  const base = window.APP_CONFIG?.API_URL;
  if (!base) throw new Error("Missing API_URL in assets/config.js");

  const res = await fetch(`${base}/progress?stage=${encodeURIComponent(stage)}&week=${encodeURIComponent(week)}`);
  if (!res.ok) throw new Error(`Load failed: ${res.status}`);
  return res.json();
};
