// assets/app.js — shared API helpers (Phase B: JWT protected)
(function () {
  function getApiBase() {
    // prefer window.APP_CONFIG.API_URL, fall back to global API_URL (week files)
    return (window.APP_CONFIG && window.APP_CONFIG.API_URL) || window.API_URL || (typeof API_URL !== 'undefined' ? API_URL : null);
  }

  window.getAccessToken = async function () {
    // week page should set this after Auth0 login
    return window.__accessToken || null;
  };

  window.cloudSave = async function ({ stage, week, data }) {
    const base = getApiBase();
    if (!base) throw new Error("Missing API base URL");
    const token = await window.getAccessToken();
    if (!token) throw new Error("Missing access token");

    const res = await fetch(`${base}/progress`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ stage, week, data }),
    });

    if (!res.ok) throw new Error(`Save failed: ${res.status}`);
    return res.json();
  };

  window.cloudLoad = async function ({ stage, week }) {
    const base = getApiBase();
    if (!base) throw new Error("Missing API base URL");
    const token = await window.getAccessToken();
    if (!token) throw new Error("Missing access token");

    const res = await fetch(`${base}/progress?stage=${encodeURIComponent(stage)}&week=${encodeURIComponent(week)}`, {
      headers: { "Authorization": `Bearer ${token}` },
    });

    if (!res.ok) throw new Error(`Load failed: ${res.status}`);
    return res.json();
  };
})();

// Gate button bindings
document.addEventListener('DOMContentLoaded', () => {
  const btnContinue = document.getElementById('btn-gate-continue');
  const btnSignin   = document.getElementById('btn-gate-signin');

  if (btnContinue) {
    btnContinue.addEventListener('click', () => {
      const gateKey = `bp_access:${window.WEEK_ID}`;
      localStorage.setItem(gateKey, '1');
      document.getElementById('auth-overlay').classList.add('hidden');
    });
  }

  if (btnSignin) {
    btnSignin.addEventListener('click', () => {
      if (typeof signIn === 'function') signIn();
    });
  }
});
