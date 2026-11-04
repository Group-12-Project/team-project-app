'use strict';
// Schedule area: My schedule (W21, W22) and Remove this class? (W23).
(function (root) {
  const C = root.GradPathCatalog;
  const Plan = root.GradPathPlan;
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  const planningOnly = (ui) => ui.card('Planning only', 'Use this plan when you register through your university. This prototype does not enroll you.');
  const summary = (c) => `${C.shortDays(c)} · ${C.formatRange(c)}\n${c.credits} credits · Section ${c.section}`;

  function view(route, ui) {
    const classes = Plan.classes();
    const days = DAYS.map((day) => {
      const items = classes.filter((c) => c.days.includes(day)).sort((a, b) => a.start.localeCompare(b.start));
      return ui.card(day, items.length ? items.map((c) => `${c.title}\n${C.formatRange(c)}`).join('\n') : 'No classes');
    }).join('');
    const empty = classes.length ? '' : ui.card('No classes in your plan yet', 'Browse classes to start building your schedule.');
    const removeLinks = classes.map((c) => ui.link(`Remove ${c.title}`, `schedule-remove/${c.id}`, 'secondary')).join('');
    const weekly = classes.length ? classes.map((c) => `${c.title} ${C.shortDays(c)} · ${C.formatRange(c)}`).join('\n') : 'Nothing planned yet.';

    return `<h1>My schedule</h1><p class="subtitle">Spring 2027 · ${Plan.credits()} planned credits</p>` + ui.columns(
      (route === 'schedule/updated' ? ui.notice('Your plan is up to date.') : '') + empty + days + removeLinks + ui.link(classes.length ? 'Add another class' : 'Add a class', 'classes', 'primary'),
      ui.card('Your weekly plan', weekly) + planningOnly(ui)
    );
  }

  function remove(id, ui) {
    const c = C.find(id);
    if (!c || !Plan.has(id)) {
      return `<h1>Remove this class?</h1>` + ui.card('That class is not in your plan', 'Your schedule is already up to date.') + ui.link('Back to my schedule', 'schedule', 'primary');
    }
    return `<h1>Remove this class?</h1>` + ui.columns(
      ui.card(c.title, summary(c)) +
      ui.notice('This will remove the class from your plan. Your university enrollment will not change.') +
      `<button class="button primary" type="button" data-action="remove-class" data-id="${ui.esc(c.id)}">Remove from plan</button>` +
      ui.link('Keep class', 'schedule', 'secondary'),
      planningOnly(ui)
    );
  }

  (root.GradPathModules = root.GradPathModules || []).push({
    handles: (route) => /^schedule(-remove)?(\/|$)/.test(route),
    section: () => 'schedule',
    render(route, ui) {
      if (route.startsWith('schedule-remove')) return remove(route.split('/')[1], ui);
      return view(route, ui);
    },
    onClick(action, element, ui) {
      if (action !== 'remove-class') return false;
      Plan.remove(element.dataset.id);
      ui.go('schedule/updated');
      return true;
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
