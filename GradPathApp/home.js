// GradPath — home page
// Reads the student's profile ONLY through GradPathProfile.getProfile().
(function () {
  const p = window.GradPathProfile.getProfile();
  const term = 'Spring 2027';

  const firstName = (p.preferredName && p.preferredName.trim()) || p.fullName.split(' ')[0];
  const set = (sel, text) => document.querySelectorAll(sel).forEach((el) => { el.textContent = text; });

  set('[data-user-firstname]', firstName);
  set('[data-user-fullname]', p.fullName);
  set('[data-term]', term.toUpperCase());
  set('[data-term-name]', term);

  // Profile summary card (uses empty-friendly wording for optional fields)
  const lines = [`${p.major} · ${p.currentYear}`, `Graduating ${p.expectedGraduation}`];
  document.getElementById('profile-summary').textContent = lines.join('\n');

  // Degree progress
  const { completed: done, required: total } = p.credits;
  const pct = total > 0 ? Math.min(100, Math.round((done / total) * 1000) / 10) : 0;
  document.getElementById('credits-summary').textContent = `${done} of ${total} credits completed`;
  document.getElementById('credits-remaining').textContent = `${Math.max(0, total - done)} credits remaining`;
  document.getElementById('progress-fill').style.width = pct + '%';
  const bar = document.getElementById('progress-bar');
  bar.setAttribute('aria-valuemax', String(total));
  bar.setAttribute('aria-valuenow', String(done));
})();
