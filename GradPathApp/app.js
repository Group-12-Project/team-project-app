// GradPath — login page behavior
// Covers Figma states: W01 login (default), W02 login-ready (fields filled),
// W03 login-error (missing/invalid input).
(function () {
  // TEMPORARY: skip authentication while we build the rest of the app.
  // Set to false to restore normal validation.
  const DEV_SKIP_LOGIN = true;

  const form = document.getElementById('login-form');
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const banner = document.getElementById('form-error');
  const intro = document.getElementById('form-intro');

  const fields = [email, password];

  function showError() {
    banner.hidden = false;
    intro.hidden = true;           // Figma's error state swaps the intro line for the banner
  }

  function clearError() {
    banner.hidden = true;
    intro.hidden = false;
    fields.forEach((f) => f.removeAttribute('aria-invalid'));
  }

  // Clear the error as soon as the person starts correcting a field.
  fields.forEach((f) => f.addEventListener('input', () => {
    if (!banner.hidden) clearError();
  }));

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (DEV_SKIP_LOGIN) {
      window.location.href = 'home.html';
      return;
    }

    const emailValue = email.value.trim();
    const passwordValue = password.value;

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);
    const passwordOk = passwordValue.length > 0;

    email.setAttribute('aria-invalid', String(!emailOk));
    password.setAttribute('aria-invalid', String(!passwordOk));

    if (!emailOk || !passwordOk) {
      showError();
      (emailOk ? password : email).focus();
      return;
    }

    clearError();
    // TODO: replace with a real authentication request.
    // For now, continue to the home page (next screen in the Figma file).
    window.location.href = 'home.html';
  });
})();
