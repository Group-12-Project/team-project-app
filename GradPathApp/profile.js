// GradPath — My Profile (view)
// Covers Figma W12 (profile) and W14 (profile-saved, via ?saved=1).
// Reads data ONLY through GradPathProfile.getProfile().
(function () {
  const params = new URLSearchParams(location.search);

  // Dev-only: add ?demo=empty to preview every optional section's empty state.
  const profile = params.get('demo') === 'empty'
    ? JSON.parse(JSON.stringify(window.GradPathSampleProfileMinimal))
    : window.GradPathProfile.getProfile();

  const main = document.getElementById('main-col');

  // ---- tiny DOM helpers (textContent only, so stored text can never inject markup) ----
  function el(tag, className, text) {
    const n = document.createElement(tag);
    if (className) n.className = className;
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function section(title, { official = false, className = 'content-card' } = {}) {
    const s = el('section', className);
    const head = el('div', 'card-head');
    head.append(el('h2', 't-heading', title));
    if (official) head.append(el('span', 'badge', 'From the university'));
    s.append(head);
    return s;
  }
  const has = (v) => typeof v === 'string' && v.trim() !== '';

  // ---- header + saved notice ----
  document.querySelectorAll('[data-user-fullname]').forEach((n) => { n.textContent = profile.fullName; });
  if (params.get('saved') === '1') document.getElementById('saved-notice').hidden = false;

  // ---- identity ----
  const identity = section(profile.fullName);
  const idLines = el('div', 'lines');
  idLines.append(el('p', '', `${profile.major} · ${profile.currentYear}`));
  idLines.append(has(profile.concentration)
    ? el('p', '', `${profile.concentration} concentration`)
    : el('p', 'empty-text', 'No concentration added yet.'));
  if (has(profile.preferredName)) idLines.append(el('p', '', `Preferred name: ${profile.preferredName}`));
  identity.append(idLines);
  main.append(identity);

  // ---- degree progress (official) ----
  const { completed, required } = profile.credits;
  const remaining = Math.max(0, required - completed);
  const pct = required > 0 ? Math.min(100, Math.round((completed / required) * 1000) / 10) : 0;
  const progress = section('Degree progress', { official: true, className: 'progress-card' });
  progress.append(el('p', 't-small', `${completed} of ${required} credits completed`));
  const track = el('div', 'progress-track');
  track.setAttribute('role', 'progressbar');
  track.setAttribute('aria-label', 'Degree progress');
  track.setAttribute('aria-valuemin', '0');
  track.setAttribute('aria-valuemax', String(required));
  track.setAttribute('aria-valuenow', String(completed));
  const fill = el('div', 'progress-fill');
  fill.style.width = pct + '%';
  track.append(fill);
  progress.append(track);
  progress.append(el('p', 't-caption', `${remaining} credits remaining`));
  main.append(progress);

  // ---- academic information ----
  const academic = section('Academic information');
  const acLines = el('div', 'lines');
  acLines.append(el('p', '', `Expected graduation: ${profile.expectedGraduation}`));
  acLines.append(el('p', '', `Current GPA: ${typeof profile.gpa === 'number' ? profile.gpa.toFixed(1) : 'Not added yet'}`));
  acLines.append(el('p', '', `Credits remaining: ${remaining}`));
  academic.append(acLines);
  main.append(academic);

  // ---- career goal ----
  const goal = section('Career goal');
  if (has(profile.careerGoal)) {
    goal.append(el('p', 't-small', profile.careerGoal));
  } else {
    goal.append(el('p', 'empty-text', 'No career goal added yet.'));
    const add = el('a', 'text-link', 'Add a career goal');
    add.href = 'profile-edit.html';
    goal.append(add);
  }
  main.append(goal);

  // ---- interests ----
  const interests = section('Interests');
  const list = Array.isArray(profile.interests) ? profile.interests.filter(has) : [];
  if (list.length) {
    const ul = el('ul', 'chip-list');
    list.forEach((i) => ul.append(el('li', 'chip', i)));
    interests.append(ul);
  } else {
    interests.append(el('p', 'empty-text', 'No interests added yet.'));
    const add = el('a', 'text-link', 'Add interests');
    add.href = 'profile-edit.html';
    interests.append(add);
  }
  main.append(interests);

  // ---- course history (official) ----
  const history = section('Course history', { official: true });
  const courses = Array.isArray(profile.courseHistory) ? profile.courseHistory : [];
  if (courses.length) {
    const ul = el('ul', 'course-list');
    courses.forEach((c) => {
      const li = el('li');
      li.append(el('span', 'course-title', `${c.code} · ${c.title}`));
      li.append(el('span', 'course-meta', `${c.term} · ${c.credits} credits · ${c.grade}`));
      ul.append(li);
    });
    history.append(ul);
  } else {
    history.append(el('p', 'empty-text', 'No completed classes to show yet.'));
  }
  main.append(history);

  // ---- edit button ----
  const edit = el('a', 'btn btn-primary', 'Edit profile');
  edit.href = 'profile-edit.html';
  main.append(edit);

  // ---- schedule preferences (sidebar card) ----
  const prefs = profile.schedulePreferences;
  const prefLines = document.getElementById('sched-lines');
  if (prefs && (has(prefs.timeOfDay) || has(prefs.workStatus))) {
    if (has(prefs.timeOfDay)) prefLines.append(el('p', '', prefs.timeOfDay));
    if (has(prefs.workStatus)) prefLines.append(el('p', '', `Work status: ${prefs.workStatus}`));
  } else {
    prefLines.append(el('p', 'empty-text', 'No schedule preferences added yet.'));
  }
})();
