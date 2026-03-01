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
