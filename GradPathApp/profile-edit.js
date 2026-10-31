// GradPath — Edit profile (Figma W13)
// Reads and writes ONLY through GradPathProfile.getProfile() / saveProfile().
(function () {
  const { getProfile, saveProfile } = window.GradPathProfile;
  const profile = getProfile();

  const form = document.getElementById('edit-form');
  const alertBox = document.getElementById('form-alert');
  const fieldNames = ['fullName', 'preferredName', 'major', 'concentration',
                      'expectedGraduation', 'currentYear', 'gpa', 'careerGoal', 'interests'];

  document.querySelectorAll('[data-user-fullname]').forEach((n) => { n.textContent = profile.fullName; });

  // ---- fill the form from the profile ----
  function show(name) {
    const v = profile[name];
    if (name === 'interests') return Array.isArray(v) ? v.join(', ') : '';
    return v === undefined || v === null ? '' : String(v);
  }
  fieldNames.forEach((n) => { form.elements[n].value = show(n); });

  // ---- read the form back into a changes object ----
  function readForm() {
    const val = (n) => form.elements[n].value.trim();
    const changes = {
      fullName: val('fullName'),
      preferredName: val('preferredName') || undefined,
      major: val('major'),
      concentration: val('concentration') || undefined,
      expectedGraduation: val('expectedGraduation'),
      currentYear: val('currentYear'),
      gpa: val('gpa') === '' ? undefined : val('gpa'),
      careerGoal: val('careerGoal') || undefined,
      interests: val('interests').split(',').map((s) => s.trim()).filter(Boolean)
    };
    if (changes.gpa !== undefined && Number.isFinite(Number(changes.gpa))) changes.gpa = Number(changes.gpa);
    return changes;
  }

  function clearErrors() {
    alertBox.hidden = true;
    form.querySelectorAll('.field-error').forEach((p) => { p.hidden = true; p.textContent = ''; });
    form.querySelectorAll('.input').forEach((i) => i.removeAttribute('aria-invalid'));
  }

  function showFieldErrors(errors) {
    let first = null;
    Object.entries(errors).forEach(([name, message]) => {
      const input = form.elements[name];
      const msg = document.getElementById(`${name}-error`);
      if (!input || !msg) return;
      input.setAttribute('aria-invalid', 'true');
      msg.textContent = message;
      msg.hidden = false;
      if (!first) first = input;
    });
    if (first) first.focus();
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors();

    const result = saveProfile(readForm());

    if (result.ok) {
      window.location.href = 'profile.html?saved=1';
      return;
    }

    if (result.reason === 'invalid') {
      showFieldErrors(result.errors || {});
      alertBox.textContent = 'Check the highlighted fields and try again.';
      alertBox.hidden = false;
      return;
    }

    // Storage blocked or failed: keep everything the person typed on screen.
    alertBox.textContent = 'We couldn’t save your changes. Your edits are still here — try again in a moment.';
    alertBox.hidden = false;
  });
})();
