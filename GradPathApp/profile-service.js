/**
 * GradPath — profile service (the handoff seam)
 * ---------------------------------------------------------
 * The UI talks to profile data ONLY through these functions:
 *
 *   GradPathProfile.getProfile()          -> profile object (see profile-data.js)
 *   GradPathProfile.saveProfile(changes)  -> { ok: true, profile }
 *                                          | { ok: false, reason: 'invalid', errors: { field: message } }
 *                                          | { ok: false, reason: 'storage' }   (storage blocked/failed)
 *   GradPathProfile.validateProfile(p)    -> { field: message }   (empty object when valid)
 *
 * CURRENT STATE: stubs. Nothing is persisted yet.
 * TODO (teammate): replace the bodies of getProfile/saveProfile with real storage:
 *   - getProfile: read the stored record, validate it, and fall back to the
 *     sample profile if it is missing or malformed.
 *   - saveProfile: validate, persist, and return { ok:false, reason:'storage' }
 *     if the browser blocks or fails the write. The edit page keeps the user's
 *     draft on screen when it sees that result.
 * Keep the return shapes the same and the UI will not need to change.
 */
(function (global) {
  const clone = (o) => JSON.parse(JSON.stringify(o));

  function validateProfile(p) {
    const errors = {};
    const blank = (v) => typeof v !== 'string' || v.trim() === '';

    if (blank(p.fullName)) errors.fullName = 'Enter your full name.';
    if (blank(p.major)) errors.major = 'Enter your major.';
    if (blank(p.currentYear)) errors.currentYear = 'Enter your current year, such as Senior.';
    if (blank(p.expectedGraduation)) errors.expectedGraduation = 'Enter your expected graduation, such as May 2027.';

    if (p.gpa !== undefined && p.gpa !== null && p.gpa !== '') {
      const n = Number(p.gpa);
      if (!Number.isFinite(n) || n < 0 || n > 4) errors.gpa = 'Enter a GPA between 0 and 4.0.';
    }
    return errors;
  }

  function getProfile() {
    // TODO (teammate): load from storage, validate, fall back to sample on bad data.
    return clone(global.GradPathSampleProfile);
  }

  function saveProfile(changes) {
    const merged = Object.assign(getProfile(), changes);
    const errors = validateProfile(merged);
    if (Object.keys(errors).length > 0) {
      return { ok: false, reason: 'invalid', errors };
    }
    // TODO (teammate): persist `merged`. On failure: return { ok: false, reason: 'storage' }.
    return { ok: true, profile: merged };
  }

  global.GradPathProfile = { getProfile, saveProfile, validateProfile };
})(window);
