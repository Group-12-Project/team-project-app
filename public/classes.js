'use strict';
// Classes area: Browse (W15), Search results (W16), No results (W17),
// Class detail (W18), Class added (W19), Class conflict (W20).
(function (root) {
  const C = root.GradPathCatalog;
  const Plan = root.GradPathPlan;
  const state = { query: '', filter: 'all' };

  const searching = () => state.query !== '';
  const matches = (c) => {
    if (state.filter === 'technical' && !c.technical) return false;
    if (!searching()) return true;
    const q = state.query.toLowerCase();
    return [c.title, c.blurb, ...c.skills].some((text) => text.toLowerCase().includes(q));
  };

  function listCard(c, ui) {
    const planned = Plan.has(c.id);
    return ui.card(
      c.title,
      `${c.credits} credits · ${C.shortDays(c)} ${C.formatTime(c.start)}\n${planned ? 'Already in your spring plan.' : c.blurb}`,
      planned ? 'schedule' : `class-detail/${c.id}`,
      planned ? 'View in schedule →' : 'View details →'
    );
  }

  function browse(ui) {
    const results = C.classes.filter((c) => c.listed && matches(c));
    const filterButton = (value, label) =>
      `<button class="button secondary" type="button" data-action="class-filter" data-value="${value}" aria-pressed="${state.filter === value}">${ui.esc(label)}</button>`;
    const count = searching() && results.length
      ? `<p role="status">${results.length === 1 ? '1 class matches your search.' : `${results.length} classes match your search.`}</p>` : '';
    const empty = results.length ? '' : ui.card('No classes found', 'Try a broader title or a skill such as SQL.');
    const clear = searching() ? `<button class="button secondary" type="button" data-action="class-clear">Clear search</button>` : '';
    const header = searching()
      ? `<button class="button back" type="button" data-action="class-clear">← Back</button><h1>Search results</h1>`
      : `<h1>Browse classes</h1><p class="subtitle">Plan for Spring 2027.</p>`;
    return header + ui.columns(
      `<form class="stack" data-form="class-search">${ui.field('Search classes', 'q', state.query, 'search', 'Search by title or skill', 'autocomplete="off" maxlength="80"')}</form>` +
      `<div class="tiles">${filterButton('all', 'All classes')}${filterButton('technical', 'Technical skills')}</div>` +
      count + results.map((c) => listCard(c, ui)).join('') + empty + clear,
      ui.card('Your spring plan', 'Build a manageable schedule. Check meeting times and prerequisites before adding a class.') +
      ui.card('Career Readiness', 'Connect what you study to skills you can use at work.', 'career', 'Explore career steps →')
    );
  }

  const aside = (ui) =>
    ui.card('Your spring plan', 'Build a manageable schedule. Check meeting times and prerequisites before adding a class.') +
    ui.card('Career Readiness', 'Connect what you study to skills you can use at work.', 'career', 'Explore career steps →');

  function detail(c, ui) {
    const planned = Plan.has(c.id);
    const conflict = planned ? null : Plan.conflictWith(c);
    const lines = [`${c.credits} credits`, `${C.longDays(c)} · ${C.formatRange(c)}`, `Section ${c.section} · ${c.mode}`];
    if (c.prerequisite) lines.push(`Prerequisite: ${c.prerequisite}`);

    let notice;
    let actions;
    if (conflict) {
      const days = conflict.days.map((d) => C.longDayNames[d]).join(' and ');
      notice = `<div class="notice error" role="status">${ui.esc(`This class overlaps with ${conflict.with.title} on ${days} at ${C.formatTime(conflict.with.start)}.`)}<br>${ui.esc('Choose another class or adjust your current plan before adding this section.')}</div>`;
      actions = ui.link('Find another class', 'classes', 'primary') + ui.link('Review my schedule', 'schedule', 'secondary');
    } else {
      notice = ui.notice(planned ? 'This class is already in your plan.' : c.prerequisite ? 'Prerequisite completed. No schedule conflict.' : 'No schedule conflict.');
      actions = (planned
        ? `<button class="button primary" type="button" disabled>Added to schedule</button>`
        : `<button class="button primary" type="button" data-action="add-class" data-id="${ui.esc(c.id)}">Add to schedule</button>`) +
        ui.link('Read course ratings', `rating-detail/${c.id}`, 'secondary');
    }
    return `<h1>${ui.esc(c.title)}</h1>${conflict ? '' : `<p class="subtitle">Spring 2027 · Section ${ui.esc(c.section)}</p>`}` + ui.columns(
      (conflict ? '' : ui.card('What you will learn', c.learn)) + ui.card('Class details', lines.join('\n')) + notice + actions,
      aside(ui)
    );
  }

  function added(c, ui) {
    return `<h1>Class added</h1>` + ui.columns(
      ui.notice(`${c.title} was added to your Spring 2027 plan.`) +
      ui.card(c.title, `${c.credits} credits\n${C.shortDays(c)} · ${C.formatRange(c)}`) +
      ui.link('View my schedule', 'schedule/updated', 'primary') + ui.link('Browse more classes', 'classes', 'secondary'),
      ui.card('Planning only', 'Adding a class to your plan does not enroll you in the class.')
    );
  }

  const mod = {
    section: () => 'classes',
    handles: (route) => route === 'classes' || /^class-(detail|added)(\/|$)/.test(route),
    // In search mode the page supplies its own "Back" (which clears the search).
    ownsBack: (route) => route === 'classes' && searching(),
    render(route, ui) {
      if (route === 'classes') return browse(ui);
      const [name, id] = route.split('/');
      const c = id ? C.find(id) : C.find('database-systems');
      if (!c) return `<h1>Class not found</h1>` + ui.card('We could not find that class', 'Browse the class list to pick another one.') + ui.link('Browse classes', 'classes', 'primary');
      return name === 'class-added' && Plan.has(c.id) ? added(c, ui) : detail(c, ui);
    },
    onSubmit(kind, data, ui) {
      if (kind !== 'class-search') return false;
      state.query = String(data.q || '').trim().slice(0, 80);
      ui.render();
      return true;
    },
    onClick(action, element, ui) {
      if (action === 'class-filter') state.filter = element.dataset.value === 'technical' ? 'technical' : 'all';
      else if (action === 'class-clear') state.query = '';
      else if (action === 'add-class') {
        const c = C.find(element.dataset.id);
        if (!c || Plan.conflictWith(c)) { ui.render(); return true; }
        Plan.add(c.id);
        ui.go(`class-added/${c.id}`);
        return true;
      } else return false;
      ui.render();
      return true;
    }
  };

  (root.GradPathModules = root.GradPathModules || []).push(mod);
})(typeof window !== 'undefined' ? window : globalThis);
