// assets/app.js — shared logic for all week files

document.addEventListener('DOMContentLoaded', () => {

  // ── PROGRESS (Mark Day Complete) ──────────────────────────────
  const stageId = window.STAGE_ID || 'stage1';
  const weekId  = window.WEEK_ID  || 'week1';
  const DONE_KEY = `done_${stageId}_${weekId}`;
  const QUIZ_KEY = `quiz_${stageId}_${weekId}`;

  // Load saved day completions
  function loadProgress() {
    const saved = JSON.parse(localStorage.getItem(DONE_KEY) || '[]');
    saved.forEach(n => {
      const btn = document.getElementById('btn-' + n);
      if (btn) {
        btn.textContent = '✓ Day ' + n + ' Complete';
        btn.classList.add('done-state');
        btn.disabled = true;
      }
      const dayNav = document.querySelector('[data-day="' + n + '"]');
      if (dayNav) dayNav.classList.add('done');
    });
    // Trigger updateProgress if it exists
    if (typeof updateProgress === 'function') updateProgress();
    // Also update done Set if it exists
    if (typeof done !== 'undefined') saved.forEach(n => done.add(n));
  }

  // Patch markDone to also save
  const _origMarkDone = window.markDone;
  window.markDone = function(n) {
    if (_origMarkDone) _origMarkDone(n);
    const saved = JSON.parse(localStorage.getItem(DONE_KEY) || '[]');
    if (!saved.includes(n)) {
      saved.push(n);
      localStorage.setItem(DONE_KEY, JSON.stringify(saved));
    }
  };

  // ── QUIZ ANSWERS ──────────────────────────────────────────────
  function loadQuizAnswers() {
    const saved = JSON.parse(localStorage.getItem(QUIZ_KEY) || '{}');
    Object.entries(saved).forEach(([groupId, data]) => {
      const optsEl = document.getElementById(groupId);
      if (!optsEl) return;
      const lis = optsEl.querySelectorAll('li');
      lis.forEach(o => { o.classList.add('disabled'); });
      if (lis[data.selectedIndex]) {
        lis[data.selectedIndex].classList.add(data.correct ? 'correct' : 'wrong');
      }
      if (!data.correct) {
        lis.forEach(o => {
          if (o.onclick && o.onclick.toString().includes('true')) o.classList.add('correct');
        });
      }
      const ex = document.getElementById(data.explainId);
      if (ex) ex.classList.add('show');
    });
  }

  // Patch answer() to also save
  const _origAnswer = window.answer;
  window.answer = function(el, groupId, correct, explainId) {
    if (_origAnswer) _origAnswer(el, groupId, correct, explainId);
    const saved = JSON.parse(localStorage.getItem(QUIZ_KEY) || '{}');
    const opts = document.getElementById(groupId).querySelectorAll('li');
    saved[groupId] = { correct, explainId, selectedIndex: Array.from(opts).indexOf(el) };
    localStorage.setItem(QUIZ_KEY, JSON.stringify(saved));
  };

  // ── INIT ──────────────────────────────────────────────────────
  loadProgress();
  loadQuizAnswers();

});
